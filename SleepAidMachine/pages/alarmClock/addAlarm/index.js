// pages/alarmClock/addAlarm/index.js

import storage from '../../../utils/storageManage'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    repeatOptions: storage.data.statically.repeatOptions.map(val => val.label),
    musicOptions: [],
    selectRepeatOption: storage.data.statically.repeatOptions[0],
    selectMusicOption: {},
    time: '07:00',
    showRepeatPopup: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  onTimeInput(event) {
    this.setData({
      time: event.detail
    })
  },

  tapRepeatCell() {
    this.setData({
      showRepeatPopup: true
    })
  },

  tapMusicCell() {
    
  },

  onRepeatChange(event) {
    let label = event.detail.value
    let item = storage.data.statically.repeatOptions.find(val => val.label === label)
    
    this.setData({
      selectRepeatOption: item
    })
  },

  onCloseRepeatPopup() {
    this.setData({
      showRepeatPopup: false
    })
  },

  checked() {
    let item = {
      time: this.data.time,
      isOpen: true,
      repeat: this.data.selectRepeatOption.value
    }
    let pages = getCurrentPages()
    let pre = pages[pages.length - 2]
    pre.addAlarm(item)

    wx.navigateBack({
      delta: 0,
    })
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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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