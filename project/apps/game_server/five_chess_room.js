var Respones = require("../Respones.js");
var redis_center = require("../../database/redis_center.js");
var redis_game = require("../../database/redis_game.js");
var utils = require("../../utils/utils.js");
var log = require("../../utils/log.js");
var Stype = require("../Stype.js");
var proto_man = require("./../../netbus/proto_man.js");
var Cmd = require("../Cmd.js");
var State = require("./State.js");
var mysql_game = require("../../database/mysql_game.js");
var five_chess_model = require("./five_chess_model.js");
var QuitReason = require("./QuitReason.js");

var INVIEW_SEAT = 10;
var GAME_SEAT = 2;
var DISK_SIZE = 15; //棋盘大小

var ChessType = {
	NONE: 0,
	BLACK: 1,
	WHITE: 2,
};

function write_err(status, ret_func) {
	var ret = {};
	ret[0] = status;
	ret_func(ret);
}

function five_chess_room(room_id, zone_conf) {
	this.zid = zone_conf.zid; //玩家当前所在的区间
	this.room_id = room_id; //玩家的房间ID号
	this.think_time = zone_conf.think_time; //思考时间
	this.min_chip = zone_conf.min_chip; //玩家一直游戏判断金币
	this.bet_chip = zone_conf.one_round_chip; //结算金币
	this.state = State.Ready; //房间已生成
	//game
	this.black_rand = true;
	this.black_seatid = -1; //黑色棋的座位
	this.cur_seatid = -1; //当前轮到的玩家
	//end
	//0 - INVIEW_SEAT
	this.inview_players = [];
	for (var i = 0; i < INVIEW_SEAT; i ++) {
		this.inview_players.push(null);
	}
	//游戏座位
	this.seats = [];
	for (var i = 0; i < GAME_SEAT; i ++) {
		this.seats.push(null);
	}

	//创建一个15×15的棋盘
	this.chess_disk = [];
	for (var i = 0; i < DISK_SIZE * DISK_SIZE; i ++) {
		this.chess_disk.push(ChessType.NONE); //表示没有棋子
	}
	//end

	//定时器对象
	this.action_timer = null;
	this.action_timeout_timestamp = 0; //玩家超时的时间戳
	//end
}

five_chess_room.prototype.reset_chess_disk = function() {
	for (var i = 0; i < DISK_SIZE * DISK_SIZE; i ++) {
		this.chess_disk[i] = ChessType.NONE;
	}
}

five_chess_room.prototype.search_empty_seat_inview = function() {
	for (var i = 0; i < INVIEW_SEAT; i++) {
		if (this.inview_players[i] == null) {
			return i;
		}
	}
	return -1;
}

five_chess_room.prototype.get_user_arrived = function(other){
	var body = {
		0: other.seatid,

		1: other.unick,
		2: other.usex,
		3: other.uface,

		4: other.uchip,
		5: other.uexp,
		6: other.uvip,
		7: other.state, // 玩家当前游戏状态
	};
	return body;
}

//玩家进入到游戏房间
five_chess_room.prototype.do_enter_room = function(p) {
	var inview_seat = this.search_empty_seat_inview();
	if (inview_seat < 0) {
		log.info("inview seat is full");
		return;
	}

	//广播到房间内所有人

	//end

	//要把座位上的所有玩家，广播出来
	for (var i = 0; i < GAME_SEAT; i++) {
		if (!this.seats[i]) {
			continue;
		}
		var other = this.seats[i];

		var body = this.get_user_arrived(other);
		p.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.USER_ARRIVED, body);
	}
	//end

	//保存玩家
	this.inview_players[inview_seat] = p;
	p.room_id = this.room_id;
	p.enter_room(this);

	//广播进来旁观的玩家
	//end
	log.info("player:", p.uid, "enter the zone in", this.zid, "for room", this.room_id);
	var body = {
		0: Respones.OK,
		1: this.zid,
		2: this.room_id,
	};
	p.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.ENTER_ROOM, body);

	//自动分配座位
	this.do_sitdown(p);
	//end
}

five_chess_room.prototype.do_sitdown = function(p) {
	if (p.seatid != -1) { //已经坐下了
		return;
	}
	//搜索可用空位
	var sv_seat = this.search_empty_seat();
	if (sv_seat == -1) { //旁观
		return;
	}
	//end
	log.info(p.uid, "sit down at seat:", sv_seat);
	this.seats[sv_seat] = p;
	p.seatid = sv_seat;
	p.sitdown(this);

	//发送消息到客户端，告诉player已经坐下
	var body = {
		0: Respones.OK,
		1: sv_seat,
	}
	p.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.SITDOWN, body);
	//end

	//将玩家坐下的消息广播到房间内其他玩家
	/*var body = {
		0: p.seatid,

		1: p.unick,
		2: p.usex,
		3: p.uface,

		4: p.uchip,
		5: p.uexp,
		6: p.uvip,
		7: p.state,
	};*/
	var body = this.get_user_arrived(p);
	this.room_broadcast(Stype.Game5Chess, Cmd.Game5Chess.USER_ARRIVED, body, p.uid);
	//end
}


five_chess_room.prototype.do_exit_room = function(p, quit_reason) {
	if(quit_reason == QuitReason.UserLostConn && 
	   this.state == State.Playing && 
	   p.state == State.Playing) {
		return false;
	}
	var winner = null;
	if (p.seatid != -1) { // 玩家在座位上
		if (p.state == State.Playing) { // 强制退出游戏
			var winner_seatid = GAME_SEAT - p.seatid - 1;
			winner = this.seats[winner_seat];
			if (winner) {
				this.checkout_game(1, winner);
			}
		}
		var seatid = p.seatid;
		log.info(p.uid, "standup at seat:", p.seatid);
		p.standup(this);
		this.seats[p.seatid] = null;
		p.seatid = -1;

		//广播到房间内的玩家，玩家站起
		var body = {
			0: Respones.OK,
			1: seatid,
		};
		this.room_broadcast(Stype.Game5Chess, Cmd.Game5Chess.STANDUP, body, null);
		//end
	}

	//把玩家从观众席
	for (var i = 0; i < INVIEW_SEAT; i++) {
		if (this.inview_players[i] == p) {
			this.inview_players[i] = null;
		}
	}
	log.info("player:", p.uid, "exit the zone in", this.zid, "for room", this.room_id);
	p.exit_room(this);
	// 成功退出房间
	p.room_id = -1;
	//广播给所有玩家(房间内玩家)
	//end
	return true;
}

five_chess_room.prototype.search_empty_seat = function() {
	for (var i = 0; i < GAME_SEAT; i++) {
		if (this.seats[i] == null) {
			return i;
		}
	}
	return -1;
}

//座位id就是数组索引
five_chess_room.prototype.empty_seat = function() {
	var num = 0;
	for (var i in this.seats) {
		if (this.seats[i] == null) {
			num++;
		}
	}
	return num;
}

//旁观列表广播
//协议分类
five_chess_room.prototype.room_broadcast = function(stype, ctype, body, not_to_uid) { //非广播到自己
	var json_uid = [];
	var buf_uid = [];

	var cmd_buf = null;
	var cmd_json = null;

	var gw_session = null;

	for (var i = 0; i < this.inview_players.length; i++) {
		if (!this.inview_players[i] ||
			!this.inview_players[i].session ||
			this.inview_players[i].uid == not_to_uid) { //空位
			continue;
		}
		gw_session = this.inview_players[i].session;

		if (this.inview_players[i].proto_type == proto_man.PROTO_JSON) {
			json_uid.push(this.inview_players[i].uid);
			if (!cmd_json) {
				cmd_json = proto_man.encode_cmd(0, proto_man.PROTO_JSON, stype, ctype, body);
			}
		} else {
			buf_uid.push(this.inview_players[i].uid);
			if (!cmd_buf) {
				cmd_buf = proto_man.encode_cmd(0, proto_man.PROTO_BUF, stype, ctype, body);
			}
		}
	}
	if (json_uid.length > 0) {
		var body = {
			cmd_buf: cmd_json,
			users: json_uid,
		}
		//网关session
		gw_session.send_cmd(Stype.Broadcast, Cmd.BROADCAST, body, 0, proto_man.PROTO_BUF);
		//end
	}
	if (buf_uid.length > 0) {
		var body = {
			cmd_buf: cmd_buf,
			users: buf_uid,
		}
		//网关session
		gw_session.send_cmd(Stype.Broadcast, Cmd.BROADCAST, body, 0, proto_man.PROTO_BUF);
		//end
	}
}



five_chess_room.prototype.send_prop = function(p, to_seatid, propid, ret_func) {
	if (p.seatid === -1) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}

	if (p != this.seats[p.seatid]) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}

	if (!this.seats[to_seatid]) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}

	if (propid <= 0 || propid > 5) {
		write_err(Respones.INVALID_PARAMS, ret_func);
		return;
	}

	// 广播
	var body = {
		0: Respones.OK,
		1: p.seatid,
		2: to_seatid,
		3: propid,
	};
	this.room_broadcast(Stype.Game5Chess, Cmd.Game5Chess.SEND_PROP, body, null);
	//end
}

five_chess_room.prototype.next_seat = function(cur_seatid) {
	var i = cur_seatid;
	for (i = cur_seatid + 1; i < GAME_SEAT; i++) { //坐在座位并且正在游玩
		if (this.seats[i] && this.seats[i].state == State.Playing) {
			return i;
		}
	}
	for (var i = 0; i < cur_seatid; i++) {
		if (this.seats[i] && this.seats[i].state == State.Playing) {
			return i;
		}
	}
	retrun - 1;
}

five_chess_room.prototype.get_round_start_info = function(){
	var wait_client_time = 3000;
	//广播到所有人，游戏开始
	var body = {
		0: this.think_time,
		1: wait_client_time,
		2: this.black_seatid, //黑棋的座位
	};
	return body;
}

five_chess_room.prototype.game_start = function() {
	//改变房间状态
	this.state = State.Playing;
	//end

	//通知其他玩家已开局
	for (var i = 0; i < GAME_SEAT; i++) {
		if (!this.seats[i] || this.seats[i].state != State.Ready) {
			continue;
		}
		this.seats[i].on_round_start()
	}
	//end

	//由谁先手,黑棋 第一局随机，第二局轮流
	if (this.black_rand) {
		this.black_rand = false;
		this.black_seatid = Math.random() * 2; //[0,2)
		this.black_seatid = Math.floor(this.black_seatid)
	} else {
		this.black_seatid = this.next_seat(this.black_seatid);
	}
	//end

	/*var wait_client_time = 3000;
	//广播到所有人，游戏开始
	var body = {
		0: this.think_time,
		1: wait_client_time,
		2: this.black_seatid, //黑棋的座位
	};*/
	var body = this.get_round_start_info();
	this.room_broadcast(Stype.Game5Chess, Cmd.Game5Chess.ROUND_START, body, null);
	//end

	this.cur_seatid = -1;
	var wait_client_time = body[1];
	//轮到黑棋玩家开始
	setTimeout(this.turn_to_player.bind(this), wait_client_time, this.black_seatid);
	//end 
}

five_chess_room.prototype.do_player_action_timeout = function(seatid) {
	this.action_timer = null;
	// 结算
/*	var winner_seatid = GAME_SEAT - seatid - 1;
	var winner = this.seats[winner_seatid];
	this.checkout_game(1, winner);*/
	// end
	this.turn_to_next();
}

five_chess_room.prototype.turn_to_player = function(seatid) {
	if(this.action_timer != null) {
		clearTimeout(this.action_timer);
		this.action_timer = null;
	}

	if(!this.seats[seatid] || this.seats[seatid].state != State.Playing) {
		log.warn("turn_to_player:", seatid, "seat is invalid!!");
		return;
	}

	// 启动一个定时器
	this.action_timer = setTimeout(this.do_player_action_timeout.bind(this), this.think_time * 1000, seatid);
	this.action_timeout_timestamp = utils.timestamp() + this.think_time;
	// end
	var p = this.seats[seatid];
	p.turn_to_player(this);


	this.cur_seatid = seatid;

	var body = {
		0: this.think_time,
		1: seatid,
	};

	this.room_broadcast(Stype.Game5Chess, Cmd.Game5Chess.TURN_TO_PLAYER, body, null);
}

five_chess_room.prototype.check_game_start = function() {
	var ready_num = 0;

	//清理棋盘
	this.reset_chess_disk();
	//end

	for(var i = 0; i < GAME_SEAT; i++) {
		if (!this.seats[i] || this.seats[i].state != State.Ready) {
			continue;
		}
		ready_num++;
	}

	if (ready_num >= 2) {
		this.game_start();
	}
}

five_chess_room.prototype.do_player_ready = function(p, ret_func) {
	//当前房间是否为准备状态	或者 不是玩家旁观状态
	if (p != this.seats[p.seatid]) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}
	//end

	//玩家是否已坐下
	if (this.state != State.Ready || p.state != State.InView) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}
	//end

	p.do_ready();

	//广播准备消息
	var body = {
		0: Respones.OK,
		1: p.seatid
	};
	this.room_broadcast(Stype.Game5Chess, Cmd.Game5Chess.SEND_DO_READY, body, null);
	//end
	this.check_game_start();
}

five_chess_room.prototype.get_next_seat = function() {
	//从当前seatid开始遍历
	for (var i = this.cur_seatid + 1; i < GAME_SEAT; i++) {
		if (!this.seats[i] || this.seats[i].state != State.Playing) {
			continue;
		}
		return i;
	}
	//end
	for (var i = 0; i < this.cur_seatid; i++) {
		if (!this.seats[i] || this.seats[i].state != State.Playing) {
			continue;
		}
		return i;
	}
	return -1;
}

five_chess_room.prototype.check_game_over = function(chess_type) {
	//行结算
	for (var i = 0; i < 15; i++) {
		for (var j = 0; j <= (15 - 5); j++) {
			if (this.chess_disk[i * 15 + j + 0] == chess_type &&
				this.chess_disk[i * 15 + j + 1] == chess_type &&
				this.chess_disk[i * 15 + j + 2] == chess_type &&
				this.chess_disk[i * 15 + j + 3] == chess_type &&
				this.chess_disk[i * 15 + j + 4] == chess_type) {
				return 1;
			}
		}
	}
	//end

	//列结算
	for (var i = 0; i < 15; i++) {
		for (var j = 0; j <= (15 - 5); j++) {
			if (this.chess_disk[(j + 0) * 15 + i] == chess_type &&
				this.chess_disk[(j + 1) * 15 + i] == chess_type &&
				this.chess_disk[(j + 2) * 15 + i] == chess_type &&
				this.chess_disk[(j + 3) * 15 + i] == chess_type &&
				this.chess_disk[(j + 4) * 15 + i] == chess_type) {
				return 1;
			}
		}
	}
	//end

	//右斜方向结算
	//右上
	var line_total = 15;
	for (var i = 0; i <= (15 - 5); i++) {
		for (var j = 0; j < (line_total - 4); j++) {
			if (this.chess_disk[(i + j + 0) * 15 + j + 0] == chess_type &&
				this.chess_disk[(i + j + 1) * 15 + j + 1] == chess_type &&
				this.chess_disk[(i + j + 2) * 15 + j + 2] == chess_type &&
				this.chess_disk[(i + j + 3) * 15 + j + 3] == chess_type &&
				this.chess_disk[(i + j + 4) * 15 + j + 4] == chess_type) {
				return 1;
			}
		}
		line_total--; //每判断完一行总行数-1
	}
	//往右下走
	line_total = 15 - 1;
	for (var i = 1; i <= (15 - 5); i++) {
		for (var j = 0; j < (line_total - 4); j++) {
			if (this.chess_disk[(j + 0) * 15 + i + j + 0] == chess_type &&
				this.chess_disk[(j + 1) * 15 + i + j + 1] == chess_type &&
				this.chess_disk[(j + 2) * 15 + i + j + 2] == chess_type &&
				this.chess_disk[(j + 3) * 15 + i + j + 3] == chess_type &&
				this.chess_disk[(j + 4) * 15 + i + j + 4] == chess_type) {
				return 1;
			}
		}
		line_total--; //每判断完一行总行数-1
	}

	//左斜结算
	//左到下
	line_total = 15;
	for (var i = 14; i >= 4; i--) {
		for (var j = 0; j < (line_total - 4); j++) {
			if (this.chess_disk[(i - j - 0) * 15 + j + 0] == chess_type &&
				this.chess_disk[(i - j - 1) * 15 + j + 1] == chess_type &&
				this.chess_disk[(i - j - 2) * 15 + j + 2] == chess_type &&
				this.chess_disk[(i - j - 3) * 15 + j + 3] == chess_type &&
				this.chess_disk[(i - j - 4) * 15 + j + 4] == chess_type) {
				return 1;
			}
		}
		line_total--;
	}

	line_total = 1;
	var offset = 0;
	for (var i = 1; i <= (15 - 5); i++) {
		offset = 0;
		for (var j = 14; j >= (line_total + 4); j--) {
			if (this.chess_disk[(j - 0) * 15 + i + offset + 0] == chess_type &&
				this.chess_disk[(j - 1) * 15 + i + offset + 1] == chess_type &&
				this.chess_disk[(j - 2) * 15 + i + offset + 2] == chess_type &&
				this.chess_disk[(j - 3) * 15 + i + offset + 3] == chess_type &&
				this.chess_disk[(j - 4) * 15 + i + offset + 4] == chess_type) {
				return 1;
			}
			offset++;
		}
		line_total++;
	}
	//end

	//检查棋盘是否全满了
	for (var i = 0; i < DISK_SIZE * DISK_SIZE; i++) {
		if (this.chess_disk[i] == ChessType.NONE) {
			return 0; //游戏继续
		}
	}
	return 2;
	//end
}

five_chess_room.prototype.checkout_game = function(result, winner) {
	if(this.action_timer != null){
		clearTimeout(this.action_timer);
		this.action_timer = null;
	}
	this.state = State.CheckOut;
	//遍历房间内的玩家
	for (var i = 0; i < GAME_SEAT; i++) {
		if (this.seats[i] == null || this.seats[i].state != State.Playing) {
			continue;
		}

		this.seats[i].checkout_game(this, result, this.seats[i] == winner);
	}
	//end

	var winner_score = this.bet_chip;
	var winner_seat = winner.seatid;
	if (result == 2) {
		winner_seat = -1;
	}
	//广播到所有玩家
	var body = {
		0: winner_seat, //-1平局
		1: winner_score, //分数
	};
	//end
	this.room_broadcast(Stype.Game5Chess, Cmd.Game5Chess.CHECKOUT, body, null);

	for (var i = 0; i < GAME_SEAT; i++) {
		if (!this.seats[i]) {
			continue;
		}

		//玩家金币数目不满足要求
		if (this.seats[i].uchip < this.min_chip) {
			five_chess_model.kick_player_chip_not_enough(this.seats[i]);
			continue;
		}

		
		
		//踢出被迫掉线的玩家
		if(this.seats[i].session == null) {
			five_chess_model.kick_offline_player(this.seats[i]);
			continue;
		}
		//end
	}

	//4秒后结算结束
	var check_time = 4000;
	setTimeout(this.on_checkout_over.bind(this), check_time);
}

five_chess_room.prototype.on_checkout_over = function() {
	//更新房间状态
	this.state = State.Ready;
	//end

	for (var i = 0; i < GAME_SEAT; i++) {
		if (this.seats[i] || this.seats[i].state != State.CheckOut) {
			continue;
		}

		//通知玩家游戏结算完成
		this.seats[i].on_checkout_over(this);
		//end
	}

	this.room_broadcast(Stype.Game5Chess, Cmd.Game5Chess.CHECKOUT_OVER, null, null);
	/*
	//提出金币不足的玩家
	for (var i = 0; i < GAME_SEAT; i++) {
		if (!this.seats[i]) {
			continue;
		}

		//玩家金币数目不满足要求
		if (this.seats[i].uchip < this.min_chip) {
			five_chess_model.kick_player_chip_not_enough(this.seats[i]);
			continue;
		}

		
		
		//踢出被迫掉线的玩家
		
		//end
	}
	//end 
	*/
}

five_chess_room.prototype.do_player_put_chess = function(p, block_x, block_y, ret_func) {
	if (p != this.seats[p.seatid]) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}

	//当前房间或者玩家非游戏状态
	if (this.state != State.Playing || p.state != State.Playing) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}
	//end

	//棋盘块参数合法性
	if (block_x < 0 || block_x > 14 || block_y < 0 || block_y > 14) {
		write_err(Respones.INVALID_PARAMS, ret_func);
		return;
	}

	if (p.seatid != this.cur_seatid) { //当前不是操作玩家
		write_err(Respones.NOT_YOUR_TURN, ret_func);
		return;
	}

	var index = block_y * 15 + block_x;
	if (this.chess_disk[index] != ChessType.NONE) { //若已经下棋
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}
	if (p.seatid == this.black_seatid) { //黑
		this.chess_disk[index] = ChessType.BLACK;
	} else {
		this.chess_disk[index] = ChessType.WHITE;
	}

	//广播
	var body = {
		0: Respones.OK,
		1: block_x,
		2: block_y,
		3: this.chess_disk[index],
	};
	this.room_broadcast(Stype.Game5Chess, Cmd.Game5Chess.PUT_CHESS, body, null);
	//end

	// 取消超时定时器
	if(this.action_timer != null){
		clearTimeout(this.action_timer);
		this.action_timer = null;
	}
	// end

	//结算 下黑棋是否胜利 下白棋 判断白棋是否胜利 下满了就平局
	//1 胜利 2 平局
	var check_ret = this.check_game_over(this.chess_disk[index]);
	if (check_ret != 0) { //游戏结束
		log.info("游戏结束", this.chess_disk[index], "result:", check_ret);
		this.checkout_game(check_ret, p);
		return;
	}
	//end

	this.turn_to_next();
}

five_chess_room.prototype.turn_to_next = function(){
	//进入到下一个玩家
	var next_seat = this.get_next_seat();
	if (next_seat == -1) {
		log.error("cannot find seat!");
		return;
	}
	//end

	this.turn_to_player(next_seat);
}

// 断线重连
five_chess_room.prototype.do_reconnect = function(p) {
	if(this.state != State.Playing && p.state != State.Playing){
		return;
	}

	var seats_data = [];
	for(var i = 0; i < GAME_SEAT; i ++) {
		if(!this.seats[i] || this.seats[i] == p || this.seats[i].state != State.Playing){
			continue;
		}
		var arrived_data = this.get_user_arrived(this.seats[i]);
		seats_data.push(arrived_data);
	}

	// 获取开局信息
	var round_start_info = this.get_round_start_info();
	// end

	// 游戏数据
	// end
	
	// 当前游戏进度的游戏信息
	var game_ctrl = [
		this.cur_seatid,
		this.action_timeout_timestamp - utils.timestamp(), // 剩余的处理时间
	];
	// end

	// 传玩家本身的数据
	var body = {
		0: p.seatid, // 玩家坐下使用
		1: seats_data, // 其他的玩家数据
		2: round_start_info, // 开局信息
		3: this.chess_disk, // 棋盘的信息
		4: game_ctrl, // 游戏进度信息
	}
	p.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.RECONNECT, body);
	// end
}

module.exports = five_chess_room;