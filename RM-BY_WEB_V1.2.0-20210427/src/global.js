var RequestUrl = ''
var imgLocalhost = ''
var socketUrl = ''

if (process.env.NODE_ENV === 'production') {
  // 线上访问
  let locationUrl = window.location.host // 获取当前的域名或ip(线上访问)
  locationUrl = locationUrl.split(':')
  RequestUrl = 'http://' + locationUrl[0] + ':8090' // 全局通用ajax请求域名
  imgLocalhost = 'http://' + locationUrl[0] + '/api/' // 定义图片路径（服务器）
  socketUrl = 'ws://' + locationUrl[0] + ':8090' // 定义实时通讯请求域名
} else {
  // 本地测试访问1
  // RequestUrl = 'http://192.168.3.123:8090' // 全局通用ajax请求域名
  // imgLocalhost = 'http://192.168.3.123:8090/api/' // 定义图片路径(本地服务器)
  // socketUrl = 'ws://192.168.3.123:8090' // 定义实时通讯请求域名(本地服务器)

  // 本地测试访问2
  RequestUrl = 'http://192.168.3.178:8090' // 全局通用ajax请求域名
  imgLocalhost = 'http://192.168.3.178:8090/api/' // 定义图片路径(本地服务器)
  socketUrl = 'ws://192.168.3.178:8090' // 定义实时通讯请求域名(本地服务器)
}

// 定义一组全局可用的颜色数据集合，
var colorList = []
for (var i = 0; i < 50; i++) {
  var colors = Math.floor(Math.random() * 16777216).toString(16) // 生成ffffff以内16进制数
  // while循环判断hex位数，少于6位前面加0凑够6位
  while (colors.length < 6) { colors = '0' + colors }
  colors = '#' + colors // 返回‘#'开头16进制颜色
  colorList.push(colors)
}

// 暴露定义的全局变量
export default{
  imgLocalhost,
  socketUrl,
  colorList,
  RequestUrl
}
