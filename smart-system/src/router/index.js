import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
	  {
	    path: '/',   //项目入口文件页（项目初始打开页面）
	    name: 'Login',
      component: resolve => require(['@/views/Login/Login'],resolve)
	  },
    {
      path: '/views/Index/Index',   //首页
      name: 'Index',
      component: resolve => require(['@/views/Index/Index'],resolve)
    },
    {
      path: '/views/RoomManage/RoomManage',   //设备管理模块
      name: 'RoomManage',
      component: resolve => require(['@/views/RoomManage/RoomManage'],resolve)
    },
    {
      path: '/views/PowerControl/PowerControl',   //电力控制
      name: 'PowerControl',
      component: resolve => require(['@/views/PowerControl/PowerControl'],resolve)
    },
    {
      path: '/views/AiCenter/AiCenter',   //Ai大数据
      name: 'AiCenter',
      component: resolve => require(['@/views/AiCenter/AiCenter'],resolve)
    },
    {
      path: '/views/HistoryLog/HistoryLog',   //历史查询
      name: 'HistoryLog',
      component: resolve => require(['@/views/HistoryLog/HistoryLog'],resolve)
    },
    {
      path: '/views/SystemSettings/SystemSettings',   //系统设置
      name: 'SystemSettings',
      component: resolve => require(['@/views/SystemSettings/SystemSettings'],resolve)
    },
    {
      path: '/views/RoomInformation/RoomInformation',   //系统设置
      name: 'RoomInformation',
      component: resolve => require(['@/views/RoomInformation/RoomInformation'],resolve)
    },
  ]
})
