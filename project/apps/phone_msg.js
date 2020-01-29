var http = require("http");
var util = require("util");
var log = require("../utils/log.js");
var QcloudSms = require("qcloudsms_js");
// 短信应用 SDK AppID
var appid = 1400253181;  // SDK AppID 以1400开头
// 短信应用 SDK AppKey
var appkey = "7c4142a68308318f237b64d9814afe07";
// 需要发送短信的手机号码
var phoneNumbers = ["18011778941", "13360045902"];
// 短信模板 ID，需要在短信控制台中申请
var templateId = 7839;  // NOTE: 这里的模板ID`7839`只是示例，真实的模板 ID 需要在短信控制台中申请
// 签名
var smsSign = "广州市东崇科技有限公司";  // NOTE: 签名参数使用的是`签名内容`，而不是`签名ID`。这里的签名"腾讯云"只是示例，真实的签名需要在短信控制台申请
// 实例化 QcloudSms
var qcloudsms = QcloudSms(appid, appkey);

/*   
#拉取单个手机短信状态
var beginTime = 1511125600;  // 开始时间(unix timestamp)
var endTime = 1511841600;    // 结束时间(unix timestamp)
var maxNum = 10;             // 单次拉取最大量
var mspuller = qcloudsms.SmsMobileStatusPuller();
// 拉取短信回执
mspuller.pullCallback("86", phoneNumbers[0], beginTime, endTime, maxNum, callback);
// 拉取回复
mspuller.pullReply("86", phoneNumbers[0], beginTime, endTime, maxNum, callback);
 */


/*
#拉取短信回执以及回复
var maxNum = 10;  // 单次拉取最大量
var spuller = qcloudsms.SmsStatusPuller();
// 拉取短信回执
spuller.pullCallback(maxNum, callback);
// 拉取回复
spuller.pullReply(maxNum, callback);
 */



var smsType = 0; // Enum{0: 普通短信, 1: 营销短信}
var ssender = qcloudsms.SmsSingleSender();

function send_phone_chat(phone_num,  content, callback) {
	
	// var cmd_url = "https://yun.tim.qq.com/v5/tlssmssvr/sendsms?sdkappid=1400253181&random=1234"
	// var cmd_url = "http://api.cnsms.cn/?ac=send&uid=117000&pwd=9A27BF288337541C87D3EE9FE3A18ACA&mobile=%s&content=%s&encode=utf8";
	content = encodeURI(content);
	var params = [content,"10"];
	// var url = util.format(cmd_url, phone_num, content);
	ssender.sendWithParam(86, phone_num, "410649",params, smsSign, "", "", callback);  // 签名参数未提供或者为空时，会使用默认签名发送短信
	// http.get(url, function(incoming_msg) {
	// 	log.info("respones status " + incoming_msg.statusCode);
	// 	incoming_msg.on("data", function(data) {
	// 		if (incoming_msg.statusCode === 200) {
	// 			log.info(data.toString());
	// 		}
	// 		else {

	// 		}
	// 	});
	// })
}

// code is string
function send_identify_code(phone_num, code) {
	var content = "%s";
	content = util.format(content, code);
	send_phone_chat(phone_num, content, function(err, res, resData){
		if (err) {
    	  	console.log("err: ", err);
  		} else {
    		// console.log("request data: ", res.req);
     	// 	console.log("response data: ", resData);
  		}
	});
}


module.exports = {
	send_identify_code: send_identify_code,
};

