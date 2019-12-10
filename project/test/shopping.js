var log = require("../utils/log.js");
var proto_man = require("../netbus/proto_man.js");
require("./talk_room_proto.js");


var STYPE_SHOP = 2;

//body
//{
//  份数,
//  点餐类型,
//  
//}
//定义点餐命令
var ShopCmd = {
	Enter: 1, // 用户进来
	Exit: 2, // 用户离开
	UserArrived: 3, // 别人进来;
	UserExit: 4, // 别人离开

	SendMsg: 5, // 自己下单
	UserMsg: 6, // 收到别人的下单消息
};

var Respones = {
	OK: 1,
	IS_IN_TALKROOM: -100, // 已经在商店
	NOT_IN_TALKROOM: -101, // 不在商店
	INVALD_OPT: -102, // 非法操作
	INVALID_PARAMS: -103, // 命令格式不对
};

