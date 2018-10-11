/*规定
*服务号命令号不能为0
*服务号与命令号大小不能超过2个字节的整数
*buf协议内2个字节存放服务号(0开始的2个字节)，命令号(1开始的2个字节)
*加密，解密
*服务号，命令号统一二进制中的小尾存储
*所有文本使用utf8
*/
var log = require("./../utils/log.js");
var netbus = require("./netbus.js");
var proto_man = {};

function encrypt_cmd_buf(str_of_buf){
	return str_of_buf;
}

function decrypt_cmd(str_of_buf){
	return str_of_buf;
}

function _json_encode(stype,ctype,body){
	var cmd = {};
	cmd[0] = stype;
	cmd[1] = ctype;
	cmd[2] = body;

	var str = JSON.stringify(cmd);
	return str;
} 

function json_decode(cmd_json){
	var cmd = JSON.parse(cmd_json);
	if(!cmd || 
	   typeof(cmd[0]) == "undefined" ||
	   typeof(cmd[1]) == "undefined" || 
	   typeof(cmd[2]) == "undefined"){
		return null;
	}

	return cmd;
}

//key,value,stype + ctype --> key:value
function get_key(stype,ctype){
	return (stype * 65535 + ctype);
}

//协议类型，服务类型,命令类型
//js对象，js文本
function encode_cmd(proto_type,stype,ctype,body){
	var buf = null;
	if(proto_type == netbus.PROTO_JSON){
		buf =  _json_encode(stype,ctype,body);
	}
	else{
		var key = get_key(stype,ctype);
		if(!encoders[key]){//表示你没有这个key
			return null;
		}

		var buf = encoders[key](body);
	}
	if(buf){
		buf = encrypt_cmd_buf(buf);
	}
	return buf;
}
//协议类型
//接收到的数据命令
//返回{0:stype,1:ctype,2:body}
function decode_cmd(proto_type,str_or_buf){
	str_or_buf = decrypt_cmd(str_or_buf);
	if(proto_type == netbus.PROTO_JSON){
		return json_decode(str_or_buf);
	}

	var cmd = null;
	var stype = str_or_buf.readUInt16LE(0);
	var ctype = str_or_buf.readUInt16LE(2);
	var key = get_key(stype,ctype);

	if(!decoders[key]){
		return null;
	}
	cmd = decoders[key](str_or_buf);
	return cmd;
}

//buf协议的编码/解码管理 stype,ctype -->encoder/decoder
var decoders = {}; //保存所有的解码函数 stype,ctype --> decoder
var encoders = {}; //保存当前的buff协议所有的编码函数 stype,ctype --> encoder


//encode_func(body) return cmd{0:服务号,1:命令号,2:body}二进制buffer对象
function reg_buf_encoder(stype,ctype,encode_func){
	var key = get_key(stype,ctype);
	if(encoders[key]){//已经注册过了
		log.warn("stype:" + stype + "ctype:" + ctype + "is reged");
	}

	encoders[key] = encode_func; 
}

//decode_func(cmd_buf) return cmd{0:服务号,1:命令号,2:body};
function reg_buf_decoder(stype,ctype,decode_func){
	var key = get_key(stype,ctype);
	if(decoders[key]){//已经注册过了
		log.warn("stype:" + stype + "ctype:" + ctype + "is reged");
	}

	decoders[key] = decode_func; 
}
//end

proto_man.encode_cmd = encode_cmd;
proto_man.decode_cmd = decode_cmd;
proto_man.reg_decoder = reg_buf_decoder;
proto_man.reg_encoder = reg_buf_encoder;
module.exports = proto_man;