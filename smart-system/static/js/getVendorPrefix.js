function getVendorPrefix() {
  const body = document.body || document.documentElement
  const style = body.style
  const vendor = ['webkit', 'khtml', 'moz', 'ms', 'o']
  let i = 0
  while (i < vendor.length) {
    // 此处进行判断是否有对应的内核前缀
    if (typeof style[vendor[i] + 'Transition'] === 'string') {
      return vendor[i]
    }
    i++
  }
}
if (getVendorPrefix() !== 'webkit') {
  var status = confirm('检测到您的浏览器无法正常访问系统，强烈建议使用 谷歌Chrome浏览器，点击确定即可开始下载谷歌Chrome浏览器，或者请将浏览器切换到 极速内核/极速模式！(点击地址栏最右侧的浏览器图标切换)')
  if(status){
    window.location.href = 'https://dl-sh-ctc-2.pchome.net/31/dt/78.0.3904.70_chrome_installer32.zip?key=93cb618a96554ba17929b4503f2427ec&tmp=1573693848210'
  }else{
    document.execCommand("stop");  //阻止页面继续加载
    window.stop();  //阻止页面继续加载
  }
}