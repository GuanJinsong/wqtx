// pages/health/sleepHealth/index.js

import * as echarts from '../../../components/ec-canvas/echarts';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ec: {
      lazyLoad: true
    },
    ecComponent: null,
    echart: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  initChart() {
    this.ecComponent = this.selectComponent('#mychart-dom-pie')
    this.ecComponent.init((canvas, width, height, dpr) => {
      this.echart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr
      })
      let data = [{
        value: 10,
        name: '醒着'
      }, {
        value: 220,
        name: '浅睡'
      }, {
        value: 210,
        name: '深睡'
      }]

      this.updateCharts(data)
    })
  },

  updateCharts(data) {
    const option = {
      color: ['#FB5336', '#328CFA', '#2829D5'],
      series: [{
        label: {
          formatter: `{b}\n{d}%`,
          textStyle: {
            fontSize: 12,
            color: '#fff',
            lineHeight: 14,
            position: 'outside'
          },
          distanceToLabelLine: 0
        },
        labelLine: {
          show: true,
          length: 7,
          length2: 3
        },
        type: 'pie',
        center: ['50%', '60%'],
        radius: ['45%', '60%'],
        data: data
      }]
    }

    this.echart.setOption(option, true)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.initChart()
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