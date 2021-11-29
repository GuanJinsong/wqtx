//定义全局变量
var RequestUrl = '', imgLocalhost = '', socketUrl = ''

if (process.env.NODE_ENV === 'production') {
  let locationUrl = window.location.host // 获取当前的域名或ip(线上访问)
  RequestUrl = `${window.location.protocol}//${locationUrl}`
  imgLocalhost = `${window.location.protocol}//${locationUrl}/api/`
  socketUrl = `wss://${locationUrl}`
} else {
  // RequestUrl = "http://192.168.3.178:8080";  //全局通用ajax请求域名(本地服务器)
  // imgLocalhost = "http://192.168.3.178:8080/api/";   //定义图片路径(本地服务器)
  // socketUrl = "ws://192.168.3.178:8080";    //定义实时通讯请求域名(本地服务器)
  RequestUrl = "https://kycloudy.com";   //全局通用ajax请求域名
  imgLocalhost = "https://kycloudy.com/api/";   //定义图片路径（服务器）
  socketUrl = "wss://kycloudy.com";    //定义实时通讯请求域名
}

//定义一组全局可用的颜色数据集合，
var colorList = []
for (var i=0;i<100;i++){
  var colors = Math.floor(Math.random() * 16777216).toString(16); //生成ffffff以内16进制数
  //while循环判断hex位数，少于6位前面加0凑够6位
  while (colors.length < 6){colors = '0' + colors;}
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
