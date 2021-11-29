// pages/mine/bindDevice/index.js

const BLE = require('../../../utils/BLEBridge')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    devices: [],
    paddingBottom: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.scanBLE()

    this.calcBottomPadding()
  },

  /**
   * 计算底部列表padding bottom
   */
  calcBottomPadding() {
    wx.getSystemInfo({
      success: (result) => {
        let {
          screenHeight,
          windowHeight,
          statusBarHeight,
          pixelRatio
        } = result
        const tabbarHeight = (screenHeight - windowHeight - statusBarHeight) * pixelRatio

        this.setData({
          paddingBottom: tabbarHeight + 'rpx'
        })
      },
    })
  },

  scanBLE() {
    this.data.bleInfo = {}
    BLE.openAndDiscoverBLE(device => {
        let index = this.data.devices.findIndex(val => val.deviceId === device.deviceId)
        if (index === -1) {
          this.data.devices = this.data.devices.concat(device)
          this.setData({
            devices: this.data.devices
          })
        }
      })
      .catch(error => {
        console.log(error)
        if (error.errCode == 10001) {
          wx.showModal({
            title: '未获得蓝牙授权，请前往手机设置打开。',
            showCancel: false
          })
        } else {
          wx.showModal({
            title: error.errMsg,
            showCancel: false
          })
        }
      })
  },

  bindDevice(event) {
    let device = event.currentTarget.dataset.device
    console.log(device);
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
    BLE.stopDiscoverBLE()
    // BLE.closeBLEConnection(this.data.bleInfo.device.deviceId)
    // BLE.closeBLE()
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