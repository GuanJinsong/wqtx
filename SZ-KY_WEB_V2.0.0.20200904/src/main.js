// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill';
import echarts from 'echarts'; //引入echarts插件
import ElementUi from 'element-ui'; //引入element-ui插件
import 'element-ui/lib/theme-chalk/index.css';
import Vue from 'vue';
import App from './App';
//import axios from 'axios'                 //引入axios，全局请求函数
import axiosInit from "./axios"; //引入自定义拦截器
import Global from './global.js'; //引入全局变量文件
import router from './router'; //引入路由控件
import store from './store'; //引入vuex文件


// import AMap from 'vue-amap';              //引入高德地图控件

//全局引入element-ui框架库
Vue.use(ElementUi);
Vue.prototype.$global=Global;         //暴露出全局变量文件
Vue.prototype.$echarts = echarts;     //暴露echarts文件
Vue.config.productionTip = false
//全局请求的配置项   
Vue.prototype.$http= axiosInit;                     //暴露axios请求

//console.log = function () { }    //取消所有的打印


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
