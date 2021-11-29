// pages/helpSleep/sleepSetting/index.js
const storage = require('../../../utils/storageManage.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showTimePopup: false,
    closeTimeText: '',
    currentTime: '',
    timeDefaultIndex: '',
    timeOptions: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.timeOptions = storage.data.statically.timeoffOptions
    this.data.currentTime = storage.data.dynamically.timeoff()
    this.data.closeTimeText = this.data.currentTime
    this.data.timeDefaultIndex = this.data.timeOptions.indexOf(this.data.currentTime)
    
    this.setData({
      timeOptions: this.data.timeOptions,
      currentTime: this.data.currentTime,
      closeTimeText: this.data.closeTimeText,
      timeDefaultIndex: this.data.timeDefaultIndex
    })
  },

  tapMusicCell() {
    console.log('音乐');
  },

  tapTimeCell() {
    this.setData({
      showTimePopup: true
    })
  },

  onCloseTimePopup() {
    this.setData({
      showTimePopup: false,
      closeTimeText: this.data.currentTime
    })
  },

  onTimeChange(event) {
    const {
      picker,
      value,
      index
    } = event.detail
    this.setData({
      currentTime: value
    })
  },

  checked() {
    storage.mutations.setTimeoff(this.data.currentTime)

    wx.navigateBack()
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