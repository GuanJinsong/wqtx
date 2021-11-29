// pages/alarmClock/index.js

import storage from '../../utils/storageManage'

// 闹钟排序方式
let sort = (val1, val2) => val1.time < val2.time ? -1 : 1

Page({

  /**
   * 页面的初始数据
   */
  data: {
    timer: 0,
    currentTime: '',
    aroundStartAngle: 0,
    aroundHidden: true,
    alarms: [],
    // 下一个闹钟剩余时间
    nextAlarmRemaining: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 读取本地闹钟数据
    let alarms = storage.data.dynamically.alarms()
    alarms.sort(sort).forEach(val => {
      val.repeatText = this.alarmRepeatText(val.repeat)
    })

    this.setData({
      alarms: alarms
    })
  },

  /**
   * 创建计时器
   */
  startTimer() {
    // 开始计时
    clearInterval(this.data.timer)
    this.data.timer = setInterval(() => {
      this.updateTime()
    }, 1 * 1000);

    this.initAngle()
  },

  initAngle() {
    // 转圈开始角度
    let second = new Date().getSeconds()
    let startAngle = (second + 25.7) % 60 / 60 * 360

    this.setData({
      aroundStartAngle: startAngle + 'deg'
    })

    setTimeout(() => {
      this.setData({
        aroundHidden: false
      })
    }, 1 * 1000);
  },

  stopTimer() {
    clearInterval(this.data.timer)
    this.data.timer = 0
    this.setData({
      aroundHidden: true
    })
  },

  updateTime() {
    console.log('timer 运行中');
    // 展示当前时间
    let padStart = number => {
      return number >= 10 ? number : `0${number}`
    }

    let date = new Date()
    let time = `${padStart(date.getHours())}:${padStart(date.getMinutes())}:${padStart(date.getSeconds())}`

    this.setData({
      currentTime: time
    })

    // 闹钟背景转圈，由于转圈的背景图初始角度表示35s，所以需要重新计算
    let angle = parseInt(this.data.aroundStartAngle) + 1 / 60 * 360

    this.setData({
      aroundStartAngle: angle + 'deg'
    })

    // 计算距离下一个闹钟时间间隔
    let next = this.nextAlarm(time.substr(0, 5))
    let nextMinute = next.time.split(':')[0] * 60 + next.time.split(':')[1] * 1
    let currentMinute = time.substr(0, 5).split(':')[0] * 60 + time.substr(0, 5).split(':')[1] * 1
    let interval = nextMinute - currentMinute

    this.setData({
      nextAlarmRemaining: `${parseInt(interval / 60)}小时${parseInt(interval % 60)}分后`
    })
  },

  /**
   * 根据当前时间返回最近的下一个闹钟
   * @param {string} current 当前事件 hh:mm 格式
   */
  nextAlarm(current) {
    let opened = this.data.alarms.filter(val => val.isOpen)
    let tomorrowAlarm = opened.filter(val => val.time < current)
    let todayAlarm = opened.filter(val => val.time > current)
    return todayAlarm.length > 0 ? todayAlarm[0] : {}
  },

  /**
   * 根据闹钟重复类型获取文字描述
   * @param {number} type 闹钟重复类型
   */
  alarmRepeatText(type) {
    let options = storage.data.statically.repeatOptions
    let index = options.findIndex(val => val.value === type)

    return index !== -1 ? options[index].label : ''
  },

  /**
   * 闹钟开关状态改变事件
   * @param {object} event 
   */
  onSwitchChange(event) {
    let index = event.currentTarget.dataset.index
    let value = event.detail
    this.data.alarms[index].isOpen = value

    this.setData({
      alarms: this.data.alarms
    })
    storage.actions.setAlarms(this.data.alarms)
  },

  /**
   * 删除闹钟回调
   * @param {object} event 事件
   */
  onAlarmDelete(event) {
    if (event.detail === 'right') {
      let index = event.currentTarget.dataset.index
      this.data.alarms.splice(index, 1)
      this.setData({
        alarms: this.data.alarms
      })

      storage.mutations.setAlarms(this.data.alarms)
    }
  },

  /**
   * 跳转至新建闹钟
   */
  toAddAlarm() {
    wx.navigateTo({
      url: './addAlarm/index',
    })
  },

  /**
   * 添加闹钟对象并且保存到本地
   * @param {object} item 闹钟对象
   */
  addAlarm(item) {
    this.data.alarms.push(item)
    this.data.alarms.sort(sort).forEach(val => {
      val.repeatText = this.alarmRepeatText(val.repeat)
    })
    this.setData({
      alarms: this.data.alarms
    })

    storage.mutations.setAlarms(this.data.alarms)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.timer === 0) {
      this.startTimer()
    }
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.stopTimer()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.stopTimer()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})