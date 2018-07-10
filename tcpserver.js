var net = require("net");
//创建一个net.Server用来监听，当连接进来的时候就会调用callback函数
//client_socket就是与客户端通讯建立连接配对的socket
var server = net.createServer(function(client_socket) {
	console.log("client coming");
	client_socket.setEncoding("utf8");
	//接收到客户端发送的错误就会调用	
	client_socket.on("error",function(err){
		console.log("error");
	});
	//有接收到客户端的数据调用的函数
	//data 默认是Hex(二进制编码)格式，如果强制设置为utf8那么底层会先转换为utf8字符串传过去
	client_socket.on("data",function(data){
		console.log(data);
	});
	//用户断线离开
	client_socket.on("close",function(client_socket){
	console.log("close socket");
	});
});


//编写代码指示server监听到某个端口上
//配置好之后就会监听server 等待客户端接入
//host==> 地址 port ==>端口 exclusive ==> 独占模式
server.listen({
	host:'127.0.0.1',
	port:6080,
	exclusive:true, 
});	

server.on("connection",function(client_socket){
	console.log("connection");
});

//server.unref();//停止node对server的监听事件
server.on("error",function (error) {
	console.log("error is on server",error);
});
//服务器关闭事件
server.on("close",function(client_socket){
	console.log("close server");
});
/*server.close();*/