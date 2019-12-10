var QuitReason = {
	User_Quit: 0, //主动离开
	UserLostConn: 1, //用户掉线
	VipKick: 2, //VIP踢出
	SystemKick: 3, //系统踢出
	CHIP_IS_NOT_ENOUGH: 4, //金币不足
};

module.exports = QuitReason;