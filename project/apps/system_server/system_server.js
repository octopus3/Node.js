require("../../init.js");
var game_config = require("../game_config.js");
var proto_man = require("../../netbus/proto_man.js");
var netbus = require("../../netbus/netbus.js");
var service_manager = require("../../netbus/service_manager.js");
var Stype = require("../Stype.js");

var game_system_service = require("./game_system_service.js");

var game_system = game_config.game_system_server;
netbus.start_tcp_server(game_system.host, game_system.port, false);
//注册服务
service_manager.register_service(Stype.GameSystem, game_system_service);

//连接中心redis数据库服务器
var center_redis_config = game_config.center_redis;
var redis_center = require("../../database/redis_center.js");
redis_center.connect(center_redis_config.host,center_redis_config.port,center_redis_config.db_index);
//end

//连接游戏redis数据库服务器
var game_redis_config = game_config.game_redis;
var redis_game = require("../../database/redis_game.js");
redis_game.connect(game_redis_config.host,game_redis_config.port,game_redis_config.db_index);
//end

// 连接游戏sql数据库
var game_mysql_config = game_config.game_database;
var mysql_game = require("../../database/mysql_game.js");
mysql_game.connect(game_mysql_config.host, game_mysql_config.port,
	                 game_mysql_config.db_name, game_mysql_config.uname, game_mysql_config.upwd);
// end 