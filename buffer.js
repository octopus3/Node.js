
//给定一个大小
//给一个初值,没指定则为0
var buf = Buffer.alloc(10);
console.log(buf);
//赋值
var buf1 = Buffer.alloc(10,"get");
console.log(buf1);
var buf2 = Buffer.alloc(10,0xff);
console.log(buf2);
//给定分配一个给定大小的buffer的内存
//不会对这些内存赋初值，不会改变原来的状态
//Unsafe就是不会初始化的意思，不安全
buf = Buffer.allocUnsafe(10);
console.log(buf);
//不从buffer缓冲区里分配，直接从操作系统分配
//Slow指的是没有从缓冲池里高效分配
buf = Buffer.allocUnsafeSlow(10);
console.log(buf);
console.log(buf.length);//buf对象的长度，Buffer一旦分配，大小再也不能改变


//方便的快捷方式，复制
//分配一个buffer对象，用来存放这个字符串的二进制对象
buf = Buffer.from("HelloWorld!");//from(array)
console.log(buf);

buf = Buffer.from([123,22,24,36]);
console.log(buf);
//重建一个buffer，把原来Buffer的数据拷贝给新的buffer
buf2 = Buffer.from(buf);
console.log(buf2);

//buf[index] index取值范围[0,len-1]
console.log(buf[0],buf[1]);
//以大尾的形式存放,4个字节的整数
buf.writeInt32BE(65535,0);
console.log(buf);
//以小尾的方式写入
buf.writeInt32LE(65535,0);
console.log(buf);
//offset是指从哪里开始读
var value = buf.readInt32LE(0);
console.log(value);

buf.writeFloatLE(3.16,0);
console.log(buf.readFloatLE(0));

var len = Buffer.byteLength("HelloWorld");
console.log(len);

buf = Buffer.alloc(4*4);
buf.writeInt32LE(65535,0);
buf.writeInt32LE(65535,4);
buf.writeInt32LE(65535,8);
buf.writeInt32LE(65535,12);
console.log(buf);
buf.swap32();
console.log(buf);
//用高位的方式读取
console.log(buf.readInt32BE(0));
console.log(buf.readInt32BE(4));
console.log(buf.readInt32BE(8));
console.log(buf.readInt32BE(12));


for (var i of buf.values()) {
	console.log(i);
}

//以二进制方式转为字符串
console.log(buf.toString('hex'));
console.log(buf.toJSON());

buf.fill('A');
console.log(buf);
console.log(buf.toString('utf8'));