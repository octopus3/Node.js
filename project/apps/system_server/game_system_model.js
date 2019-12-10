var Respones = require("../Respones.js");
var mysql_game = require("../../database/mysql_game.js");
var redis_center = require("../../database/redis_center.js");
var redis_game = require("../../database/redis_game.js");
var utils = require("../../utils/utils.js");
var log = require("../../utils/log.js");
var phone_msg = require("../phone_msg.js");
var game_config = require("./../game_config.js");

var login_bonues_config = game_config.game_data.login_bonues_config;

function write_err(status, ret_func) {
	var ret = {};
	ret[0] = status;
	ret_func(ret);
}

function check_login_bonues(uid){
	mysql_game.get_login_bonues_info(uid, function(status, data) {
		if (status != Respones.OK) {
			return;
		}
		if (data.length <= 0) { // 没有这样的uid, 注册一个(比如第一次游玩)
			var bonues = login_bonues_config.bonues[0];
			mysql_game.insert_user_login_bonues(uid,bonues, function(status) {
				if (status != Respones.OK) {
					return;
				}
				return;
			});
		}
		else{
			var sql_login_bonues = data[0];
			//days,bonues_time
			var has_bonues = sql_login_bonues.bonues_time < utils.timestamp_today();
			if(has_bonues){
				//更新登录奖励
				//计算连续登录多少日
				var days = 1;
				var is_straight = sql_login_bonues.bonues_time >= utils.timestamp_yesterday();
				if(is_straight){
					// sql_login_bonues.days  = sql_login_bonues.days +1;
					days = sql_login_bonues.days + 1;
				}

				var index = days - 1;	//索引值		
				if(days > login_bonues_config.bonues.length){
					if(login_bonues_config.clear_login_straight){
						days = 1;
						index = 0;
					}
					else{
						index = login_bonues_config.bonues.length -1;
					}
				}

				//发放奖励
				mysql_game.update_user_login_bonues(uid,login_bonues_config.bonues[index],days,function(status){
					if (status != Respones.OK) {
					write_err(status, ret_func);
					return;
				}
				});
				//end
			}
		}
	});
}
	
function get_ugame_info_success(uid,data, ret_func){
	var ret = {};
	// 登陆成功了
	ret[0] = Respones.OK;

	ret[1] = data.uchip;
	ret[2] = data.uexp;
	ret[3] = data.uvip;

	redis_game.set_ugame_info_inredis(data.uid,{
		uchip:data.uchip,
		uexp:data.uexp,
		uvip:data.uvip,
	});

	//刷新游戏世界排行榜 node_game_world_rank 金币作为权重
	redis_game.update_game_world_rank("NODE_GAME_WORLD_RANK",uid,data.uchip);

	//检查是否要发放奖励
	check_login_bonues(uid);

	ret_func(ret);
}

function get_bonues_info_success(uid,b_has,data, ret_func){
	var ret = {};
	// 登陆成功了
	ret[0] = Respones.OK;
	ret[1] = b_has; // 0表示没奖励
	if(b_has != 1){
		ret_func(ret);
		return;
	}

	ret[2] = data.id;
	ret[3] = data.bonues;
	ret[4] = data.days;

	
	ret_func(ret);
}

function recv_login_bonues_success(uid,bonuesid,bonues,ret_func){
	//更新数据库，将奖励标记为领取 
	mysql_game.update_login_bonues_recved(bonuesid);
	//end
	
	//更新玩家数据库金币数目
	mysql_game.add_ugame_uchip(uid,bonues,true);
	//end
	
	//更新玩家redis
	redis_game.get_ugame_info_inredis(uid,function(status,ugame_info){
		if (status != Respones.OK) {
			log.err("redis game get ugame info");
			return;

			//成功获取
			ugame_info.uchip += bonues;
			redis_game.set_ugame_info_inredis(uid,ugame_info);

			//end
		}

		var ret = {
			0:Respones.OK,
			1:bonues,
		};

		ret_func(ret);
	});
	//end
}

function get_rank_info_success(my_rank,rank_array,ret_func){
	var ret = {};
	ret[0] = Respones.OK;
	ret[1] = rank_array.length;
	ret[2] = rank_array;
	ret[3] = my_rank;
	ret_func(ret);	
}

function get_login_bonues_info( uid,ret_func){
	mysql_game.get_login_bonues_info(uid,function(status, data) {
		if (status != Respones.OK) {
			write_err(status, ret_func);
			return;
		}
		if (data.length <= 0) { // 没有这样的uid
			get_bonues_info_success(uid, 0,sql_bonues_info, ret_func);
		}
		else{
			var sql_bonues_info = data[0];
			
			if (sql_bonues_info.status != 0) { // 已经领取了
				get_bonues_info_success(uid, 0,sql_bonues_info, ret_func);
				return;
			}


			get_bonues_info_success(uid, 1,sql_bonues_info, ret_func);
		}
	});
}


function get_game_info(uid,ret_func){
	mysql_game.get_ugame_info_by_uid(uid, function(status, data) {
		if (status != Respones.OK) {
			write_err(status, ret_func);
			return;
		}
		if (data.length <= 0) { // 没有这样的uid, 注册一个(比如第一次游玩)
			mysql_game.insert_ugame_user(uid,game_config.game_data.first_uexp, 
											 game_config.game_data.first_uchip, function(status) {
				if (status != Respones.OK) {
					write_err(status, ret_func);
					return;
				}

				get_game_info(uid, ret_func);
			});
		}
		else{
			var sql_ugame = data[0];
			
			if (sql_ugame.status != 0) { // 玩家账号被封
				write_err(Respones.ILLEGAL_ACCOUNT, ret_func);
				return;
			}


			get_ugame_info_success(uid, sql_ugame, ret_func);
		}
	});
}

//领取登录奖励
function recv_login_bonues(uid,bonuesid,ret_func){
	//查询登录奖励合法性
	mysql_game.get_login_bonues_info(uid,function(status, data) {
		if (status != Respones.OK) {
			write_err(status, ret_func);
			return;
		}
		if (data.length <= 0) { // 没有可以领取的奖励
			write_err(Respones.INVALIDI_OPT, ret_func);
			return;
		}
		else{
			var sql_bonues_info = data[0];
			
			if (sql_bonues_info.status != 0 || sql_bonues_info.id != bonuesid) { // 已经领取了
				write_err(Respones.INVALIDI_OPT, ret_func);
				return;
			}
			
			//领取成功
			recv_login_bonues_success(uid, bonuesid,sql_bonues_info.bonues, ret_func);
		}
	});
}

function get_players_rank_info(my_uid,data,ret_func){
	var rank_array = [];	//[[],[]]
	var total_len = Math.floor(data.length / 2); //[uid ,uchip ,uid,uchip]
	var is_sended = false;	//一旦出现错误就只发送一次
	var loaded = 0;
	var my_rank = -1;
	for(var i = 0;i < total_len;i++){
		rank_array.push([]);
	}	

	var call_fun = function(uid,uchip,out_array){
		redis_center.get_uinfo_in_redis(uid,function(status,data){
			if(status != Respones.OK){
				if(!is_sended){
					write_err(status,ret_func);
					is_sended = true;
				}
				return;
			}
			out_array.push(data.unick);
			out_array.push(data.usex);
			out_array.push(data.uface);
			out_array.push(uchip);
			loaded++;
			if(loaded >= total_len){
				get_rank_info_success(my_rank,rank_array,ret_func);
				return;
			}
		});
	}
	//获取每一个在榜的玩家信息[unick,usex,uface,uchip]
	//redis_center 获取
	var j = 0;
	for(var i = 0;i < data.length;i+=2,j++){
		if(my_uid == data[i]){
			my_rank = (i + 1);
		}
		call_fun(data[i],data[i + 1],rank_array[j]);
	}
	


}

function get_world_rank_info(uid,ret_func){
	redis_game.get_world_rank_info("NODE_GAME_WORLD_RANK",30,function(status,data){
		if(status != Respones.OK){
			//返回一个body
			write_err(status, ret_func);
			return;
		}
		//成功获取 uid uchip
		get_players_rank_info(uid,data,ret_func);
	})
}

module.exports = {
	get_game_info:get_game_info,
	get_login_bonues_info:get_login_bonues_info,
	recv_login_bonues:recv_login_bonues,
	get_world_rank_info:get_world_rank_info,
};