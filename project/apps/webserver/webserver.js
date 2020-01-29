var game_config = require("./../game_config.js");
var express = require("express");
var path = require("path");
var fs = require("fs");
var log = require("./../../utils/log.js");
var Cmd = require("../Cmd.js");
var Stype = require("../Stype.js");
/*if (process.argv.length < 3) {
	console.log("node webserver.js port");
	return;
}
*/
var app = express();
var host = game_config.webserver.host;
// var port = parseInt(process.argv[2]);
var port = game_config.webserver.port;

app.all('*',function(req,res,next){
	res.header("Access-Control-Allow-Origin","*");
	res.header("Access-Control-Allow-Headers","X-Requested-With");
	res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
	res.header("X-Powered","3.2.1");
	res.header("Content-Type","application/json;charset=utf-8");
	next();
});

// process.chdir("./apps/webserver");
// console.log(process.cwd());
if(fs.existsSync("www_root")){
	app.use(express.static(path.join(process.cwd(), "www_root")));
}
else {
	log.warn("www_root not exists");
}

app.listen(port);

log.info("webserver started at port " + port + " host is " + host);

// 获取客户端服务器网关信息
app.get("/server_info", function(request, respones) {
	var data = {
		host: game_config.GATEWAY_CONNECT_IP,
		tcp_port: game_config.gateway_config.ports[0],
		ws_port: game_config.gateway_config.ports[1]
	};

	var str_data = JSON.stringify(data);
	respones.send(str_data);
});