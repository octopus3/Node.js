# net模块
对比C语言的网络编程，Node.js有更加简便的开发模式与模块提供。它就是`net`模块
在需要使用的时候只需要`require("net")`就可以引入模块了。
```Javascript
var net = require("net");
```
## 服务端编程
引入模块的前提下：
1. 创建一个新的TCP或IPC服务
```Javascript
var server = net.createServer(function(client_socket) {
	console.log("client coming");
});
```
	2. 创建connections 启动一个 server 监听.
```Javascript
server.listen({
	host:'127.0.0.1',
	port:6080,
	exclusive:true, 
});	
```
## 客户端编程
引入`net`模块。
1.  创建一个连接即可
```Javascript
//端口要与需要连接的服务器端口一致
var socket = net.connect({
	port:6080,
	host:'127.0.0.1',
},
function(){
	console.log("connected to server!");
});
```
### 效果
![效果](https://img-blog.csdn.net/20180707211743506?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2Fnc2do/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

## 事件监听
|常用监听事件事件类型| 事件触发条件|
|-------|------|
|connection|连接成功调用的事件|
|error|发生错误调用的事件|
|close|当server关闭的时候触发. 注意,如果有连接存在, 直到所有的连接结束才会触发这个事件|
|data|当接收到数据的时触发该事件。data 参数是一个 Buffer 或 String。数据编码由 socket.setEncoding() 设置。注意当 Socket 发送 data 事件的时候，如果没有监听者数据将会丢失。|
|listening|当服务被绑定后调用 server.listen().|
|end|当 socket 的另一端发送一个 FIN 包的时候触发，从而结束 socket 的可读端。|
监听事件的API都是使用`on()`方法。
# Demo演示
下面有一个详细的demo可自行尝试
## tcpserver.js
```Javascript
//tcpserver.js
var net = require('net');
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
```
## tcpclient.js
```Javascript
//tcpclient.js
var net = require("net");
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
```
