var log = require("../../utils/log.js");
var Cmd = require("../Cmd.js");
var Respones = require("../Respones.js");
var Stype = require("../Stype.js");
var Cmd = require("../Cmd.js");
var utils = require("../../utils/utils.js");

require("./game_system_proto.js");
var system_model = require("./game_system_model.js");


function get_game_info(session, uid, proto_type, body){
	system_model.get_game_info(uid,function(body){ 
		log.info(body);
		session.send_cmd(Stype.GameSystem, Cmd.GameSystem.GET_GAME_INFO, body, uid, proto_type);
	});
}

function get_login_bonues_info(session, uid, proto_type, body){
	system_model.get_login_bonues_info(uid,function(body){ 
		log.info(body);
		session.send_cmd(Stype.GameSystem, Cmd.GameSystem.LOGIN_BONUES_INFO, body, uid, proto_type);
	});
}

function recv_login_bonues(session, uid, proto_type, body){
	if(!body){
		session.send_cmd(Stype.GameSystem, Cmd.GameSystem.RECV_LOGIN_BONUES, Respones.INVALID_PARAMS, uid, proto_type);
		return;
	}
	var bonuesid = body;
	system_model.recv_login_bonues(uid,bonuesid,function(body){ 
		log.info(body);
		session.send_cmd(Stype.GameSystem, Cmd.GameSystem.RECV_LOGIN_BONUES, body, uid, proto_type);
	});
}

function get_world_rank_info(session, uid, proto_type, body){
	system_model.get_world_rank_info(uid,function(body){ 
		log.info(body);
		console.log("get_world_rank_info");
		session.send_cmd(Stype.GameSystem, Cmd.GameSystem.GET_WORLD_RANK_INFO, body, uid, proto_type);
	});
}

var service = {
	name: "game_system_service", // 服务名称
	is_transfer: false, // 是否为转发模块,

	// 收到客户端给发来的数据
	on_recv_player_cmd: function(session, stype, ctype, body, utag, proto_type, raw_cmd) {
		log.info(stype, ctype, body);
		switch(ctype) {
			case Cmd.GameSystem.GET_GAME_INFO:
				get_game_info(session, utag, proto_type, body);
			break;
			case Cmd.GameSystem.LOGIN_BONUES_INFO:
				get_login_bonues_info(session, utag, proto_type, body);
			break;
			case Cmd.GameSystem.RECV_LOGIN_BONUES:
				recv_login_bonues(session, utag, proto_type, body);
			break;
			case Cmd.GameSystem.GET_WORLD_RANK_INFO:
				get_world_rank_info(session, utag, proto_type, body);
			break;
		}
	},

	// 收到连接的服务给发过来的数据;
	on_recv_server_return: function (session, stype, ctype, body, utag, proto_type, raw_cmd) {

	}, 

	// 收到客户端断开连接;
	on_player_disconnect: function(stype, session) {
	},
};

module.exports = service;
