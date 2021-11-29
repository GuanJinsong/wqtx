import axios from 'axios';
import { MessageBox } from "element-ui";

if (process.env.NODE_ENV === 'production') {
  axios.defaults.baseURL = `${window.location.protocol}//${window.location.host}`
} else {
  //axios.defaults.baseURL = 'http://192.168.3.178:8080'; // 配置axios请求的地址
  axios.defaults.baseURL = "https://kycloudy.com"
}

axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
axios.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
axios.defaults.crossDomain = true;
axios.defaults.withCredentials = true;  //设置cross跨域 并设置访问权限 允许跨域携带cookie信息


// 添加请求拦截器
axios.interceptors.request.use(function (config){
    // 在发送请求之前做些什么
    let pathname = window.location.hash;
    if(pathname !== '#/' &&  pathname !== '#/login/login'){
      if(localStorage.getItem('userKey')){
		    //通常情况下我们是给请求添加token,但是这里我们判断的是userKey,如果userKey存在我们不做任何处理，每个请求接口处都有添加userKey
        //config.headers.common['token'] = localStorage.getItem('token');
      }else{
        MessageBox.alert("userKey为空，或失效，请重新登录.", "登录失效", {
          confirmButtonText: "跳转登录页面",
          callback: action => {
            window.location.href = "/";
          }
        })
      }
    }
    return config;
  }, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  });

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
  // 对响应数据做点什么
  if(response.data.flag == false){
    if(response.data.msg == "userKey"){
      MessageBox.alert("userKey为空，或失效，请重新登录.", "登录失效", {
        confirmButtonText: "跳转登录页面",
        callback: action => {
          window.location.href = "/";
          return false;
        }
      })
    }
  }
  return response;   //返回得到的数据
  }, function (error){
    // 对响应错误做点什么
    return Promise.reject(error);
});

export default axios;
