var net = require("net");
var http = require('http');
//net.socket类
var socket = net.connect({
	port:6080,
	host:'127.0.0.1',
},
function(){
	console.log("connected to server!");
});
//连接成功调用的事件
socket.on("connect",function(){
	console.log("connect success");
	//已utf-8的方式编码成二进制的数据传输
	socket.write("Hello World!","utf8");
});
//发生错误调用的事件
socket.on("error",function (err) {
	console.log("error is ",err);
});
//socket 关闭事件
socket.on("close",function(){
	console.log("close");
});
//对方发送关闭数据包的事件
socket.on("end",function(){
	console.log("end event");
})

//当有数据发送过来的时候调用
socket.on("data",function(data){
	console.log(data);
});
