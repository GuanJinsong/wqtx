
var RequestUrl = '';
var imgLocalhost = '';
var socketUrl = '';
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'production') {
  var locationUrl = window.location.host;   //获取当前的域名或ip(线上访问)
  locationUrl = locationUrl.split(":")
  RequestUrl = "http://"+locationUrl[0]+":7070";   //全局通用ajax请求域名
  imgLocalhost = "http://"+locationUrl[0]+"/api/";   //定义图片路径（服务器）
  socketUrl = "ws://"+locationUrl[0]+":7070";    //定义实时通讯请求域名
} else {
  //本地测试访问1
  // RequestUrl = "http://192.168.3.123:7070";   //全局通用ajax请求域名
  // imgLocalhost = "http://192.168.3.123:7070/api/";   //定义图片路径(本地服务器)
  // socketUrl = "ws://192.168.3.123:7070";    //定义实时通讯请求域名(本地服务器)

  //本地测试访问2
  // RequestUrl = "http://192.168.3.178:7070";   //全局通用ajax请求域名
  // imgLocalhost = "http://192.168.3.178:7070/api/";   //定义图片路径(本地服务器)
  // socketUrl = "ws://192.168.3.178:7070";    //定义实时通讯请求域名(本地服务器)

  //本地测试访问3
  RequestUrl = "http://192.168.3.30:7070";   //全局通用ajax请求域名
  imgLocalhost = "http://192.168.3.30:7070/api/";   //定义图片路径(本地服务器)
  socketUrl = "ws://192.168.3.30:7070";    //定义实时通讯请求域名(本地服务器)
}

//定义一组全局可用的颜色数据集合，
var colorList = []
for (var i=0;i<50;i++){
  var colors = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0'); //生成ffffff以内6位16进制数，不够用0补位
  // //while循环判断hex位数，少于6位前面加0凑够6位
  // while (colors.length < 6){colors = '0' + colors;}
  colors = '#' + colors; //返回‘#'开头16进制颜色
  colorList.push(colors);
}

//暴露定义的全局变量
export default{
  imgLocalhost,
  socketUrl,
  colorList,
  RequestUrl
}
