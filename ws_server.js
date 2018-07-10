var ws = require("ws");
//启动websocket服务
var server = new ws.Server({
	host:"127.0.0.1",
	port:6080,
});

function webclient_add_listener(client_socket) {
	client_socket.on("close",function(){

	});
	client_socket.on("error",function(err){
		console.log(err);
	});

	client_socket.on("message",function(data){
		console.log(data);
		client_socket.send("the world");
	});
}

function server_client_comming(client_socket) {
	console.log("comming");
	webclient_add_listener(client_socket);
}

server.on("connection",server_client_comming);


function server_error(err) {
	console.log("error")
}
server.on("error", server_error);
/*function server_header(data) {
	console.log(data);
}
server.on("headers",server_header);*/
