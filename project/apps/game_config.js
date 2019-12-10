var Stype = require("./Stype.js");

var game_config = {
	gateway_config: {
		host: "127.0.0.1",
		ports: [6080, 6081],
	},

	game_system_server: {
		host: "127.0.0.1",
		port: 6087,
		stypes: [Stype.GameSystem],
	},

	game_server: {
		host: "127.0.0.1",
		port: 6088,
		stypes: [Stype.Game5Chess],
	},

	center_server: {
		host: "127.0.0.1",
		port: 6086,
		stypes: [Stype.Auth],
	},

	game_database: {
		host: "127.0.0.1",
		port: 3306,
		db_name: "game_node",

		uname: "root",
		upwd: "123456",
	},


	center_database: {
		host: "127.0.0.1",
		port: 3306,
		db_name: "bycw_center",

		uname: "root",
		upwd: "123456",
	},

	center_redis: {
		host: "127.0.0.1",
		port: 6379,
		db_index: 0
	},

	game_redis: {
		host: "127.0.0.1",
		port: 6379,
		db_index: 1
	},



	// 代码来生成
	gw_connect_servers: {
		/*0: {
			stype: Stype.TalkRoom,
			host: "127.0.0.1",
			port: 6084, 
		},*/

		1: {
			stype: Stype.Auth,
			host: "127.0.0.1",
			port: 6086,
		},
		2: {
			stype: Stype.GameSystem,
			host: "127.0.0.1",
			port: 6087,
		},
		3: {
			stype: Stype.Game5Chess,
			host: "127.0.0.1",
			port: 6088,
		}
	},

	//游戏注册时的数据
	game_data: {
		first_uexp: 1000,
		first_uchip: 1000,

		login_bonues_config: {
			clear_login_straight: false,
			bonues: [100, 200, 300, 400, 500], //奖励
		},

		//离线生成
		five_chess_zones: {
			0: {
				zid: 1,
				name: "新手场", //分区描述
				uvip_levl: 0,
				min_chip: 100,
				one_round_chip: 3,
				think_time: 20
			},
			1: {
				zid: 2,
				name: "高手场", //分区描述
				uvip_levl: 0,
				min_chip: 1000,
				one_round_chip: 10,
				think_time: 25
			},
			2: {
				zid: 3,
				name: "大师场", //分区描述
				uvip_levl: 0,
				min_chip: 1500,
				one_round_chip: 20,
				think_time: 25
			}
		}
	},

};

module.exports = game_config;