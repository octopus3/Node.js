var Stype = require("../Stype.js");
var Cmd = require("../Cmd.js");
var utils = require("../../utils/utils.js");
var Respones = require("../Respones.js");
var proto_man = require("../../netbus/proto_man.js");
var proto_tools = require("../../netbus/proto_tools.js");
var log = require("../../utils/log.js");


/*
加入游戏区间
服务号
命令号
区间号
返回:
  服务号
  命令号
  status
*/
proto_man.reg_decoder(Stype.Game5Chess, Cmd.Game5Chess.ENTER_ZONE, proto_tools.decode_status_cmd);
proto_man.reg_encoder(Stype.Game5Chess, Cmd.Game5Chess.ENTER_ZONE, proto_tools.encode_status_cmd);

/*
离开游戏服务器
服务号
命令号
返回
	服务号
	命令号
	status  
*/

proto_man.reg_decoder(Stype.Game5Chess, Cmd.Game5Chess.USER_QUIT, proto_tools.decode_empty_cmd);
proto_man.reg_encoder(Stype.Game5Chess, Cmd.Game5Chess.USER_QUIT, proto_tools.encode_status_cmd);


/*
进入房间桌子
服务号
命令号
桌子id int32
返回
	服务号
	命令号
	body:{
		0:status,	(16)
		1:zid,	(16)
		2:room_id,	(32)
	}

 */

proto_man.reg_decoder(Stype.Game5Chess, Cmd.Game5Chess.ENTER_ROOM, proto_tools.decode_int32_cmd); //注册解码器
function encode_enter_room(stype, ctype, body) {
	if (body[0] != Respones.OK) {
		return proto_tools.encode_status_cmd(stype, ctype, body[0]);
	}

	//状态2+uchip4+uexp4+game_vip2
	var total_len = proto_tools.header_size + 2 + 2 + 4;
	var cmd_buf = proto_tools.alloc_buffer(total_len);

	var offset = proto_tools.write_cmd_header_inbuf(cmd_buf, stype, ctype);
	proto_tools.write_int16(cmd_buf, offset, body[0]);
	offset += 2;

	proto_tools.write_int16(cmd_buf, offset, body[1]);
	offset += 2;

	proto_tools.write_int32(cmd_buf, offset, body[2]);
	offset += 4;

	return cmd_buf;
}

proto_man.reg_encoder(Stype.Game5Chess, Cmd.Game5Chess.ENTER_ROOM, encode_enter_room);

 
/*
发送道具
服务号
命令号
body{
	0:道具号,
	1:to 座位号
}
返回
	服务号
	命令号
	body:{
		0:status,	(16)
		1:from seat,	(16)
		2:to seat,	(16)
		3:道具类型 propid
	}

 */



/*
服务器主动通知
服务号
命令号
body{
	0:玩家思考时间
	1:多少秒后开始，（动画时间）
	2：持黑棋的安慰你加先开始下棋
}


 */

/*轮到玩家
服务号
命令号
body{
	思考时间
	座位号
	用户可以使用的操作类型
}

*/