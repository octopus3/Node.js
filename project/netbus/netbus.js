var net = require("net");
var ws = require("ws");

var log = require("./../utils/log.js");
var tcppkg = require("./tcppkg");

var netbus = {
	PROTO_JSON:1,
	PROTO_BUF:2,

};

var global_session_list = {}; //全局连接session表
var global_session_key =  1; //用于索引

function on_session_exit(session){
	log.info("session exit");
	session.last_pkg = null; //session断开，包不需再处理
	//从移除global_session_list
	if(global_session_list[session.session_key]){
		global_session_list[session.session_key] = null;
		delete global_session_list[session.session_key];
		session.session_key = null;
	}
}

/*
@session = client_sock
@proto_type = proto_type
@is_ws = Boolean
 */

function on_session_enter(session,proto_type,is_ws){
	if(is_ws){
		log.info("session enter",session._socket.remoteAddress,session._socket.remotePort);
	}
	else{
		log.info("session enter",session.remoteAddress,session.remotePort);
	}

	log.info("session enter",session.remoteAddress,session.remotePort)
	session.last_pkg = null; //表示上次没处理完的TCP包
	session.is_ws = is_ws;
	session.proto_type = proto_type;
	//将key加入到session列表内
	global_session_list[global_session_key] = session;
	session.session_key = global_session_key;
	global_session_key ++;
	//end
}

//保证为一个整包
//若为json协议，str_or_buf json字符串
//如果是buf 则为buf对象
function on_session_recv_cmd(session,str_or_buf){
	log.info(str_or_buf);
}

function session_send(session,cmd){
	if(!session.is_ws){
		var data = tcppkg.package_data(cmd);
		session.write(data);
	}
	else{
		session.send(cmd);//websock直接send即可
	}
}

//主动关闭一个session
function session_close(session){
	if(!session.is_ws){
		session.end();
		return;
	}
	else{
		session.close();
	}
} 

function add_client_session_event(session,proto_type){
		on_session_enter(session,proto_type,false);
		session.on("close",function(){
			on_session_exit(session);
		});

		session.on("data", function(data){

			//检验包合法性
			if(!Buffer.isBuffer(data)){	//不合法的数据
				session_close(session);
				return;
			}
			//end

			var last_pkg = session.last_pkg;
			console.log(data);
			if(last_pkg != null){//上一次有残余的包，合并
				var buf = Buffer.concat([last_pkg,data],last_pkg.length+data.length);
				last_pkg = buf;
			}
			else{
				last_pkg = data;
			}
			var offset = 0;
			var pkg_len = tcppkg.read_pkg_size(last_pkg,offset);
			if(pkg_len<0){
				return;
			}
			while(offset + pkg_len <= last_pkg.length){
				//根据长度信息来读取数据
				var cmd_buf;
				if(session.proto_type == netbus.PROTO_JSON){
					var json_str = last_pkg.toString("utf8",offset + 2,offset + pkg_len);
					if(!json_str){
						session_close(session);
						return;
					}
					on_session_recv_cmd(session,cmd_buf);
				}
				else{//cmd_buf数据包
					cmd_buf = Buffer.allocUnsafe(pkg_len - 2);
					last_pkg.copy(cmd_buf,0,offset + 2,offset + pkg_len);
					on_session_recv_cmd(session,cmd_buf);
				}
				
				

				offset += pkg_len;
				if(offset >= last_pkg.length){//包处理完毕
					break;
				}
				pkg_len = tcppkg.read_pkg_size(last_pkg,offset);
				if(pkg_len < 0){
					break;
				}
			}
			//本次能处理的数据包已完成，保存0.包的数据
			if(offset >= last_pkg.length){
				last_pkg = null;
			}
			else{//offset,length这段数据拷贝到新的Buffer内
				var buf = Buffer.allocUnsafe(last_pkg.length-offset);
				last_pkg.copy(buf,0,offset,last_pkg.length);
				last_pkg = buf;
			}
			session.last_pkg = last_pkg;
		});

		session.on("error",function(err){
			console.log("***error****\n",err);
		});

}
function start_tcp_server(ip,port,proto_type){
	log.info("start tcp server ..", ip, port);
	var server = net.createServer(function(client_sock) { 
		add_client_session_event(client_sock, proto_type);
	});


	// 监听发生错误的时候调用
	server.on("error", function(err) {
		log.error("server listen error",err);
	});

	server.on("close", function() {
		log.error("server listen close");
	});



	server.listen({
		port: port,
		host: ip,
		exclusive: true,
	});
}

// ---------
//tcp

function isString(obj){
	return Object.prototype.toString.call(obj) === "[object String]";
}

function ws_add_client_session_event(session,proto_type){
	session.on("close",function(){
		on_session_exit(session);
	});

	session.on("error",function(err){
		console.log("client error",err);
	});
	session.on("message",function(data){
		if(session.proto_type == netbus.PROTO_JSON){
			if(!isString(data)){
				session_close(session);
				return;
			}
			on_session_recv_cmd(session,data);
		}
		else{
			if(!Buffer.isBuffer(data)){
				session_close(session);
				return;
			}
			on_session_recv_cmd(session,data);
		}
		on_session_recv_cmd(session,data);
	});
	on_session_enter(session,proto_type,true);
}

function start_ws_server(ip,port,proto_type){
	log.info("start ws server ..");
	var server = new ws.Server({
		host:ip,
		port:port,
	});

	function on_server_client_comming(client_sock){
		ws_add_client_session_event(client_sock,proto_type);
	}
	server.on("connection",on_server_client_comming);

	function on_server_listen_error(err){
		log.error("ws server listen error!",err);
	}
	server.on("error",on_server_listen_error);

	function on_server_listen_close(){
		log.error("ws server listen close");
	}
	server.on("close",on_server_listen_close);
}

netbus.start_tcp_server = start_tcp_server;
netbus.session_send = session_send;
netbus.session_close = session_close; 
netbus.start_ws_server = start_ws_server;
module.exports = netbus;