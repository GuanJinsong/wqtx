<template>
  <div class="ind_cenParent"
    v-loading.fullscreen.lock="loadingCenter"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.3)"
  >
    <div class="ind_cenTop">
      <ul class="ind_cenTopUl">
        <!-- <li><p>总次数/天</sub></p><div>{{allNum}} <sub>次</sub></div></li> -->
        <li><p>违规喧哗</p><div>{{sound}} <sub>次</sub></div></li>
        <li><p>违规用电</p><div>{{power}} <sub>次</sub></div></li>
        <li><p>违规逗留</p><div>{{human}} <sub>次</sub></div></li>
        <li><p>违规开灯</p><div>{{lumen}} <sub>次</sub></div></li>
      </ul>
    </div>
    <div class="ind_cenCenter">
      <div class="tempBoxTitle"><h6>各单元(栋)报警类型统计</h6><p><b><span></span></b></p></div>
      <div class="barChartParent">
          <div id="barChart" style="width:100%;height:100%;"></div>
      </div>
    </div>
    <div class="ind_cenBott">
      <ul class="ind_cenBottUl">
        <li>
          <div class="ind_cenBtnBox" @click="pushDormitory()"><div class="ind_cenBtnLeft"><img src="../../../static/images/sushe.png"/><p>宿舍详情</p></div></div>
        </li>
        <li v-if="userRel !==2">
          <div class="ind_cenBtnBox">
            <div class="ind_cenBtnBtnCenter" @click="pushManagement(1)"><img src="../../../static/images/set.png"/><p>系统配置</p></div>
          </div>
        </li>
        <li>
          <div class="ind_cenBtnBox">
            <div class="ind_cenBtnBtnCenter" @click="pushManagement(2)"><img src="../../../static/images/guangbo.png"/><p>广播设置</p></div>
          </div>
        </li>
        <li>
          <div class="ind_cenBtnBox">
            <div class="ind_cenBtnBtnRight" @click="pushSystemLog(0)"><img src="../../../static/images/baojingrizhi.png"/><p>报警日志</p></div>
          </div>
        </li>
        <li v-if="userRel<2">
          <div class="ind_cenBtnBox">
            <div class="ind_cenBtnBtnRight" @click="pushSystemLog(1)"><img src="../../../static/images/rizhi.png"/><p>操作日志</p></div>
          </div>
        </li>
        
      </ul>
    </div>
  </div>
</template>

<script>
var optionBar = '' // 定义柱状图全局echarts对象
var myBarChart = '' // 定义柱状图对象
// import Bus from "../../newObject/Bus.js";
export default{
  name: 'IndexCenter',
  props: ['heightWidth'],
  data() {
    return {
      loadingCenter: false,
      userRel: Number(localStorage.getItem('rel')), // 定义当前的用户身份
      allNum: 0, // 全部报警次数
      sound: 0, // 声音报警
      power: 0, // 功率报警
      human: 0, // 人体检测
      lumen: 0 // 流明度检测
    }
  },
  watch: {
    heightWidth: function (val) {
      setTimeout(function () {
        if (myBarChart !== '') { myBarChart.resize() }
      }, 300)
    }
  },
  mounted() {
    this.getAlarmNumDay() // 获取报警数据
    this.getBarChartData() // 获取柱状图的数据
    // 监听兄弟组件 IndexLeft传过来的数据
    this.$eventBus.$on('updataAlarmData', this.updataAlarmData)
  },
  methods: {
    // ==========================================获取报警数据由此开始================================
    // 获取设备报警总数量、功率报警、声音报警、人体检测
    getAlarmNumDay: function() {
      var self = this
      var url = '/sdm/alarmrecord/getAlarmNumDay'
      self.$http.post(url).then(function(result) {
        console.log(result)
        if (result.data.flag) {
          if (result.data.rows.length > 0) {
            var list = result.data.rows
            for (var i = 0; i < list.length; i++) {
              switch (Number(list[i].alarmType)) {
                case 0:self.allNum = list[i].alarmNum; break
                case 1:self.sound = list[i].alarmNum; break
                case 2:self.power = list[i].alarmNum; break
                case 3:self.human = list[i].alarmNum; break
                case 6:self.lumen = list[i].alarmNum; break
              }
            }
          }
        }
      }).catch(function(erro) {
        console.log(erro)
      })
    },
    // 根据左侧邻居组件IndexLeft传过来的报警类型，修改页面上的报警次数
    updataAlarmData: function(rest) {
      var self = this
      switch (Number(rest.alarmType)) {
        case 1:self.sound = self.sound + 1; break
        case 2:self.power = self.power + 1; break
        case 3:self.human = self.human + 1; break
        case 6:self.lumen = self.lumen + 1; break
      }
      self.allNum = self.allNum + 1
    },
    // ==========================================获取报警数据由此结束================================

    // =============================================绘制柱状图由此开始==================================
    // 获取柱状图数据
    getBarChartData: function() {
      var self = this
      var url = '/sdm/alarmrecord/getAlarmUnit'
      self.loadingCenter = true
      self.$http.post(url).then(function(result) {
        console.log(result)
        if (result.data.flag) {
          if (result.data.data !== '') {
            var list = result.data.data
            var soundList = list.decibelNum
            var powerList = list.powerNum
            var humanList = list.peopleNum
            var lumenList = list.beamNum
            var xunit = list.unitData
            self.drawingBarChart(soundList, powerList, humanList, lumenList, xunit)
            self.loadingCenter = false
          }
        }
        self.loadingCenter = false
      }).catch(function(erro) {
        console.log(erro); self.loadingCenter = false
      })
    },

    // 绘制柱状图
    drawingBarChart: function (soundList, powerList, humanList, lumenList, xunit) {
      var self = this
      myBarChart = echarts.init(document.getElementById('barChart'))
      // var dataAxis = ['2020-06-01', '2020-06-02', '2020-06-03', '2020-06-04', '2020-06-05', '2020-06-06', '2020-06-07', '2020-06-08', '2020-06-09', '2020-06-010'];
      // var data = [220, 182, 191, 234, 290, 330, 310, 123, 442, 321];
      var timeLength = xunit.length
      var interval = Math.round(timeLength / 6)
      if (interval > 1) { interval = interval } else { interval = 0 };
      optionBar = {
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            let day2 = params[0].name
            var res = ''
            if (params.length > 0) {
              params.forEach(function (result, index) {
                res += '<br/> ' + result.seriesName + '：' + result.value
              })
            }
            return day2 + res
          }
        },
        legend: {
          show: true,
          orient: 'horizontal',
          data: ['违规喧闹', '违规用电', '违规逗留', '违规开灯'],
          right: 'auto',
          textStyle: {color: '#fff'}
        },
        xAxis: {
          data: xunit,
          nameLocation: 'center',
          axisLabel: {
            interval: interval,
            margin: 8,
            textStyle: {
              color: '#3190de', cursor: 'default', fontSize: 11, fontStyle: 'normal', fill: '#959696'
            }
          },
          axisTick: {
            show: true,
            alignWithLabel: true,
            lineStyle: {
              color: '#ffffff',
              width: 1
            }

          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#8ce6ca',
              width: 1,
              type: 'dashed'
            }
          },
          z: 10
        },
        grid: {
          backgroundColor: 'rgba(0,0,0,0)',
          borderColor: 'rgba(0,0,0,0)',
          x: 20,
          y: 40,
          x2: 20,
          y2: 20,
          borderWidth: 1,
          show: true,
          containLabel: true
        },
        yAxis: {
          splitLine: { // 网格线
            lineStyle: {
              type: 'dashed' // 设置网格线类型 dotted：虚线   solid:实线
            },
            show: true // 隐藏或显示
          },
          axisLine: {
            show: false,
            lineStyle: {
              color: '#E0E0E3',
              width: 1
            }
          },
          axisTick: {
            show: false,
            lineStyle: {
              color: '#ffffff',
              width: 1
            }
          },
          axisLabel: {
            textStyle: {
              color: '#999'
            }
          }
        },
        dataZoom: [
          {
            type: 'inside'
          }
        ],
        series: [
          {
            type: 'bar',
            name: '违规喧闹',
            itemStyle: {
              barBorderRadius: 10,
              color: new echarts.graphic.LinearGradient(
                0, 0, 0, 1,
                [
                  {offset: 0, color: '#f6501c'},
                  {offset: 0.5, color: '#f57c56'},
                  {offset: 1, color: '#f8ac94'}
                ]
              )
            },
            emphasis: {
              barBorderRadius: 10,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(
                  0, 0, 0, 1,
                  [
                    {offset: 0, color: '#f6501c'},
                    {offset: 0.7, color: '#f57c56'},
                    {offset: 1, color: '#f8ac94'}
                  ]
                )
              }
            },
            data: soundList
          },
          {
            type: 'bar',
            name: '违规用电',
            itemStyle: {
              barBorderRadius: 10,
              color: new echarts.graphic.LinearGradient(
                0, 0, 0, 1,
                [
                  {offset: 0, color: '#ffb400'},
                  {offset: 0.5, color: '#fbc23a'},
                  {offset: 1, color: '#fbd16b'}
                ]
              )
            },
            emphasis: {
              itemStyle: {
                barBorderRadius: 10,
                color: new echarts.graphic.LinearGradient(
                  0, 0, 0, 1,
                  [
                    {offset: 0, color: '#ffb400'},
                    {offset: 0.5, color: '#fbc23a'},
                    {offset: 1, color: '#fbd16b'}
                  ]
                )
              }
            },
            data: powerList
          },
          {
            type: 'bar',
            name: '违规逗留',
            itemStyle: {
              barBorderRadius: 10,
              color: new echarts.graphic.LinearGradient(
                0, 0, 0, 1,
                [
                  {offset: 0, color: '#01f6a9'},
                  {offset: 0.5, color: '#3ff4bb'},
                  {offset: 1, color: '#76f4cc'}
                ]
              )
            },
            emphasis: {
              itemStyle: {
                barBorderRadius: 10,
                color: new echarts.graphic.LinearGradient(
                  0, 0, 0, 1,
                  [
                    {offset: 0, color: '#01f6a9'},
                    {offset: 0.5, color: '#3ff4bb'},
                    {offset: 1, color: '#76f4cc'}
                  ]
                )
              }
            },
            data: humanList
          },
          {
            type: 'bar',
            name: '违规开灯',
            itemStyle: {
              barBorderRadius: 10,
              color: new echarts.graphic.LinearGradient(
                0, 0, 0, 1,
                [
                  {offset: 0, color: '#d73ece'},
                  {offset: 0.5, color: '#e469dd'},
                  {offset: 1, color: '#ec82e6'}
                ]
              )
            },
            emphasis: {
              itemStyle: {
                barBorderRadius: 10,
                color: new echarts.graphic.LinearGradient(
                  0, 0, 0, 1,
                  [
                    {offset: 0, color: '#d73ece'},
                    {offset: 0.5, color: '#e469dd'},
                    {offset: 1, color: '#ec82e6'}
                  ]
                )
              }
            },
            data: lumenList
          }
        ]
      }

      // Enable data zoom when user click bar.
      var zoomSize = 6
      myBarChart.on('click', function (params) {
        console.log(xunit[Math.max(params.dataIndex - zoomSize / 2, 0)])
        myBarChart.dispatchAction({
          type: 'dataZoom',
          startValue: xunit[Math.max(params.dataIndex - zoomSize / 2, 0)],
          endValue: xunit[Math.min(params.dataIndex + zoomSize / 2, data.length - 1)]
        })
      })
      if (optionBar && typeof optionBar === 'object') {
        myBarChart.setOption(optionBar) // 渲染图表
      }
    },
    // =============================================绘制柱状图由此结束==================================

    // =========================================页面跳转=============================
    // 进入宿舍监控页面
    pushDormitory: function() {
      this.$router.push({path: '/components/DormitoryMonitoring/DormitoryMonitoring', name: 'DormitoryMonitoring'})
    },
    // 进入宿舍管理
    pushManagement: function(index) {
      this.$router.push({path: '/components/Management/Management', name: 'Management', query: {leftNav: index}})
    },
    // 进入日志管理
    pushSystemLog: function(index) {
      this.$router.push({path: '/components/SystemLog/SystemLog', name: 'SystemLog', query: {leftNav: index}})
    }
  },
  beforeDestroy() {
    this.$eventBus.$off('updataAlarmData') // 关闭兄弟组件之间传递信息时$on会多次触发的问题
  }
}
</script>

<style>
  @import url("../../../static/css/Index/IndexCenter.css");
</style>
