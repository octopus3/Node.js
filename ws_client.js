var ws = require("ws");
var socket =  new ws("ws:127.0.0.1:6080");
socket.on("open",function(){
	console.log("connect success!");
	socket.send("Hello");
});
socket.on("error",function(err){
	console.log("error:",err);
});
socket.on("close",function(){
	console.log("close");
});
socket.on("message",function(data){
	console.log(data);
});