// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import Vue from 'vue'
import App from './App'
import 'babel-polyfill'
import ElementUi from 'element-ui'       //引入element-ui插件
import 'element-ui/lib/theme-chalk/index.css';
//全局引入element-ui框架库
Vue.use(ElementUi);

import router from './router'              //引入路由控件

import axiosInit from "./axios";          //引入自定义拦截器
import * as echarts from 'echarts';           //引入echarts插件

import Global from './global.js'         //引入全局变量文件
import store from './store'              //引入vuex文件
import eventBus from "./newObject/Bus.js";


Vue.prototype.$global=Global;         //暴露出全局变量文件
Vue.prototype.$echarts = echarts;     //暴露echarts文件
Vue.config.productionTip = false

Vue.prototype.$http= axiosInit;
Vue.prototype.$eventBus = eventBus;

//路由跳转拦截
//路由跳转前要判断当前的token值是否存在，如果如存在那么需要重新登录
router.beforeEach((to, from, next) => {
  //设置延时器让created先执行在进行路由跳转
  setTimeout((res) => {
      // 判断该路由是否需要登录权限
      if(to.name == 'Login'){
          next()
      }else{
          if (localStorage.getItem('token')!==null) {
              next();
          } else {
              next({
                  path: '/',
                  // query: {
                  //     redirect: to.fullPath
                  // } // 这里的query是路由跳转时需要传入的参数，根据实际需要添加
              })
          }
      }
  }, 100);
  })

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
