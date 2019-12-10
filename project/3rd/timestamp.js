// 返回当前时间戳 单位秒
function timestamp(){
	var date = new Date();
	// 从1970年到现在过去的毫秒数
	var time = Date.parse(date);
	time = time / 1000;
	return time;
}

//时间戳是秒
function timestamp2date(time){
	var date = new Date();
	date.setTime(time * 1000);

	return [date.getFullYear(),date.getMonth(),date.getDate(),date.getHours(),date.getMinutes(),date.getSeconds()];
}


// 2019-8-14 16:54:51
function date2timestamp(strtime){
	var date = new Date(strtime.replace(/-/g,'/'));
	var time = Date.parse(date);
	return (time/1000);
}

// 今天 0点0分0秒时间戳
function timestamp_today(){
	var date = new Date();
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);

	var time = Date.parse(date);
	time = time / 1000;
	return time;
}

function timestamp_yesterday(){
	var time = timestamp_today();
	return (time - 24 * 60 * 60);
}

console.log(timestamp());
console.log(timestamp2date(timestamp()));
console.log(date2timestamp("2019-8-14 17:03:02"));
console.log(timestamp_today());

console.log(timestamp_yesterday());
console.log(timestamp_today()-timestamp_yesterday());