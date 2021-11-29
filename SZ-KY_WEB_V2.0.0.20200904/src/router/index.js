import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
	  {
	    path: '/',   //项目入口文件页（项目初始打开页面）
	    name: 'Login',
      component: resolve => require(['@/components/Login'],resolve)
	  },
    {
      path: '/components/Index',   //首页
      name: 'Index',
      component: resolve => require(['@/components/Index'],resolve)
    },
    {
      path: '/components/UserManagement',   //用户管理
      name: 'UserManagement',
      component: resolve => require(['@/components/UserManagement'],resolve)
    },
    {
      path: '/components/DeviceManagement',   //设备管理
      name: 'DeviceManagement',
      component: resolve => require(['@/components/DeviceManagement'],resolve)
    },
    {
      path: '/components/SystemSetup',   //系统设置
      name: 'SystemSetup',
      component: resolve => require(['@/components/SystemSetup'],resolve)
    },
    {
      path: '/components/HistoricalData',   //历史数据
      name: 'HistoricalData',
      component: resolve => require(['@/components/HistoricalData'],resolve)
    },
    {
      path: '/components/RegionalFenceParent',   //电子围栏
      name: 'RegionalFenceParent',
      component: resolve => require(['@/components/RegionalFenceParent'],resolve)
    },
    {
      path: '/components/VideoSurveillance',   //视频监控
      name: 'VideoSurveillance',
      component: resolve => require(['@/components/VideoSurveillance'],resolve)
    }
  ]
})
