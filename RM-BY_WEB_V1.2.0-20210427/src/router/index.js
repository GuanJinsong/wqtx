import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
	  {
	    path: '/', // 项目入口文件页（项目初始打开页面）
	    name: 'Login',
      component: resolve => require(['@/components/Login/Login'], resolve)
	  },
    {
      path: '/components/Index/Index', // 首页
      name: 'Index',
      component: resolve => require(['@/components/Index/Index'], resolve)
    },
    {
      path: '/components/DormitoryMonitoring/DormitoryMonitoring', // 宿舍监控
      name: 'DormitoryMonitoring',
      component: resolve => require(['@/components/DormitoryMonitoring/DormitoryMonitoring'], resolve)
    },
    {
      path: '/components/Management/Management', // 首页
      name: 'Management',
      component: resolve => require(['@/components/Management/Management'], resolve)
    },
    {
      path: '/components/SystemLog/SystemLog', // 首页
      name: 'SystemLog',
      component: resolve => require(['@/components/SystemLog/SystemLog'], resolve)
    }
  ]
})
