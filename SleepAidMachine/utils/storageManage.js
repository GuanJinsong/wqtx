const data = {
  /**
   * 静态数据-无更改接口
   */
  statically: {
    /**
     * 定时关闭选项
     */
    timeoffOptions: ['10:00', '20:00', '30:00', '45:00', '60:00'],
    /**
     * 闹钟重复选项
     */
    repeatOptions: [{
      value: 0,
      label: '不重复'
    }, {
      value: 1,
      label: '工作日'
    }, {
      value: 2,
      label: '双休日'
    }, {
      value: 3,
      label: '每天'
    }]
  },
  /**
   * 动态数据-可更改
   */
  dynamically: {
    /**
     * 定时关闭时间
     */
    timeoff() {
      return wx.getStorageSync('timeoff') || '30:00'
    },
    /**
     * 已保存的闹钟
     */
    alarms() {
      return wx.getStorageSync('alarms') || [{
        time: '07:00',
        isOpen: true,
        repeat: 1
      }, {
        time: '12:35',
        isOpen: true,
        repeat: 0
      }, {
        time: '07:30',
        isOpen: true,
        repeat: 0
      }, {
        time: '23:25',
        isOpen: true,
        repeat: 3
      }]
    }
  }
}

/**
 * 同步更改上述动态数据
 */
const mutations = {
  setTimeoff(value) {
    wx.setStorageSync('timeoff', value)
  },

  setAlarms(value) {
    wx.setStorageSync('alarms', value)
  }
}

/**
 * 异步更改上述动态数据
 */
const actions = {
  setTimeoff(value) {
    wx.setStorage({key: 'timeoff', data: value})
  },

  setAlarms(value) {
    wx.setStorage({key: 'alarms', data: value})
  }
}

/**
 * 管理本地数据的对象-仿vuex
 */
const storage = {
  data,
  mutations,
  actions
}

module.exports = storage