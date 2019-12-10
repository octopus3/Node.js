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

function five_chess_player(uid) {
	this.uid = uid;
	this.uchip = 0;
	this.uvip = 0;
	this.uexp = 0;

	this.unick = "";
	this.usex = -1;
	this.uface = 0;

	this.zid = -1; //玩家当前所在的区间
	this.room_id = -1; //玩家的房间ID号
	this.seatid = -1; //玩家座位号，未坐下为-1

	this.session = null;
	this.proto_type = -1;

	this.state = State.InView;	//旁观状态
}

five_chess_player.prototype.init_ugame_info = function(ugame_info) {
	this.uchip = ugame_info.uchip;
	this.uvip = ugame_info.uvip;
	this.uexp = ugame_info.uexp;
}

five_chess_player.prototype.init_uinfo = function(uinfo) {
	this.unick = uinfo.unick;
	this.usex = uinfo.usex;
	this.uface = uinfo.uface;
}

five_chess_player.prototype.init_session = function(session, proto_type) {
	this.session = session;
	this.proto_type = proto_type;
}

five_chess_player.prototype.send_cmd = function(stype, ctype, body) {
	if (this.session == null) {
		return;
	}
	this.session.send_cmd(stype, ctype, body, this.uid, this.proto_type);
}

five_chess_player.prototype.enter_room = function(room) {
	this.state = State.InView;
}

five_chess_player.prototype.exit_room = function() {
	this.state = State.InView;
}

five_chess_player.prototype.sitdown = function(room) {

}

five_chess_player.prototype.standup = function(room) {
	 
}

five_chess_player.prototype.do_ready = function(){
	this.state = State.Ready;
	console.log("do ready:",this.state);
}

five_chess_player.prototype.on_round_start = function(){
	this.state = State.Playing;
	console.log("start:",this.state);
}

//人机预留
five_chess_player.prototype.turn_to_player = function(room){
	console.log("turn to player");
}
//玩家游戏结束
//1有输赢，2：平局
five_chess_player.prototype.checkout_game = function(room,result,is_winner){
	this.state = State.CheckOut;
	if(result == 2) { //平局
		return;
	}
	//输赢结算
	var chip = room.bet_chip;
	//更新数据库,redis
	mysql_game.add_ugame_uchip(this.uid,chip,is_winner);
	redis_game.add_ugame_uchip(this.uid,chip,is_winner);
	//end
	if(is_winner){
		this.uchip += chip; 
	}
	else{
		this.uchip -= chip;
	}
}

five_chess_player.prototype.on_checkout_over = function(room){
	this.state = State.InView; //旁观状态 等待下一局开始
}

module.exports = five_chess_player;