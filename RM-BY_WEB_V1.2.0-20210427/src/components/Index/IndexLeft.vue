<template>
  <div class="ind_LefParent"
      v-loading.fullscreen.lock="loading"
      element-loading-text="拼命加载中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.3)"
  >
    <div class="ind_LefTop">
      <div class="ind_lefStatus" v-bind:class="lefSocket==false?'index_lefcont':'index_lefcontainer'">
        <div class="item-1"></div>
        <div class="item-2"></div>
        <div class="item-3"></div>
        <div class="item-4"></div>
        <div class="item-5"></div>
      </div>
      <div class="tempBoxTitle"><h6>实时报警情况</h6><p><b><span></span></b></p></div>
        <ul class="ind_lefRealTime">
          <li v-for="(list,index) in alarmList" v-bind:key="index" @click="openDeletePops(index,list)">
            <div><p><span @click.stop="manualAlarm(list)"><img src="/static/images/voice.png"/></span></p></div>
            <div><p><span>{{list.room}}</span></p></div>
            <div><p><span>{{list.alarmContent}}</span></p></div>
            <div><p><span>{{list.alarmTimeStr}}</span></p></div>
          </li>
          <noMoreData v-if="alarmList.length == 0"/>
        </ul>
    </div>
    <div class="ind_LefBott">
      <div class="tempBoxTitle"><h6>历史报警类型占比</h6><p><b><span></span></b></p></div>
      <div class="pieChartParent">
          <div id="pieChart" style="width:100%;height:100%;"></div>
      </div>
    </div>
    <!-- 警报处理 -->
    <el-dialog title="报警详情与处理" :visible.sync="dialogFormVisible" custom-class="alarmPop" :append-to-body="true" width="390px">
      <div class="aramInfo">
        <p><span>宿舍名称:</span>{{roomName}}</p>
        <p><span>报警结果:</span>{{roomResult}}</p>
        <p><span>报警时间:</span>{{roomTime}}</p>
      </div>
      <el-form :model="form">
        <el-form-item label="处理人:">
          <el-input v-model="form.name" placeholder="请输入处理人" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="处理结果:">
          <el-input v-model="form.result" placeholder="请输入处理结果" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="clickDeleteAlarmList">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 手动语音播报 -->
    <el-dialog title="语音警告" :visible.sync="manualAlertVisible" custom-class="alarmPop" :append-to-body="true" width="390px">
      <el-form :model="manualAlertConfig">
        <el-form-item label="播报类型:">
          <el-radio-group v-model="manualAlertConfig.alertVoiceType" @change="alertVoiceTypeChanged">
            <el-radio v-for="option in manualAlertConfig.alertVoiceOptions" :key="option.value" :label="option.value">{{option.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="预置语音:" v-show="manualAlertConfig.alertVoiceType == 0">
          <el-select v-model="manualAlertConfig.alertContent" size="small">
            <el-option v-for="option in manualAlertConfig.alertContentOptions" :key="option.value" :value="option.label">{{option.label}}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="远程喊话:" v-show="manualAlertConfig.alertVoiceType == 1">
          <el-input v-model="manualAlertConfig.alertContent" placeholder="请输入播报内容" size="small" maxlength="20" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="manualAlertVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmManualAlert">播 报</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import noMoreData from '../publicComponemts/noMoreData.vue'
var importWsk = null
var myPieChart = '' // 定义饼状图对象
var optionPie = ''
// import Bus from "../../newObject/Bus.js";
export default{
  name: 'IndexLeft',
  components: {
    noMoreData: noMoreData
  },
  props: ['heightWidth'],
  data () {
    return {
      loading: false, // loading是否显示
      alarmList: [], // 定义报警列表
      lefSocket: false, // 定义websocket是否连接成功
      dialogFormVisible: false,
      manualAlertVisible: false,
      manualAlertConfig: {
        alertVoiceType: 0, // 播报语音类型
        alertVoiceOptions: [{ value: 0, label: '预置语音' }, { value: 1, label: '远程喊话' }],
        alertContentOptions: [],
        alertContent: '',
        imei: '' // 设备码
      },
      allAlarmConfigurations: {}, // 所有报警配置
      form: {name: '', result: ''},
      deleteIndex: '', // 定义当前要删除的对象的索引
      alarmRcdId: '', // 定义当前要删除对象的id
      roomName: 'A-101栋',
      roomResult: '宿舍用电异常，超出报警阀值',
      roomTime: '2021-04-28 09:50:50'
    }
  },
  watch: {
    // 监听浏览器窗口变化
    heightWidth: function (val) {
      setTimeout(function () {
        if (myPieChart !== '') { myPieChart.resize() }
      }, 300)
    }
  },
  mounted () {
    this.getAlarmNumData()
    this.getAlarmConfiguration()
    this.getRealTimeAlarmData()
  },
  methods: {
    // ========================================所有宿舍实时报警信息由此开始==================================
    // 获取实时报警信息的初始值
    getRealTimeAlarmData: function () {
      var self = this
      var url = '/sdm/alarmrecord/getAlarmRecord'
      var data = {'pageSize': 20}
      self.loading = true
      self.$http.post(url, data).then(function (result) {
        console.log(result)
        if (result.data.flag) {
          if (result.data.dataList.length > 0) {
            self.alarmList = result.data.dataList
          } else { self.alarmList = [] }
          self.loading = false
          self.ws_RealTimeAlarm() // 开启实时通讯
        } else {
          self.alarmList = []; self.loading = false
        }
      }).catch(function (erro) {
        console.log(erro); self.loading = false
      })
    },
    // 点击实时报警列表，删除点击后的列表数据
    openDeletePops: function (index, list) {
      this.dialogFormVisible = true
      this.deleteIndex = index // 定义当前要删除的对象的索引
      this.alarmRcdId = list.alarmRcdId // 定义当前要删除对象的id
      this.roomName = list.room // 定义弹窗内的房间名
      this.roomResult = list.alarmContent // 定义弹窗内的结果
      this.roomTime = list.alarmTimeStr // 定义弹窗内的时间
    },
    clickDeleteAlarmList: function () {
      var self = this
      if (self.form.name !== '' && self.form.result !== '') {
        var url = '/sdm/alarmrecord/editAlarmRecord'
        var data = {'alarmRcdId': self.alarmRcdId, handleName: self.form.name, handleResult: self.form.result}
        self.$http.post(url, data).then(function (result) {
          console.log(result)
          if (result.data.flag) {
            self.getRealTimeAlarmData() // 重新获取实时报警信息的初始值
            self.$message({message: '报警信息已读，并已取消这一项展示.', type: 'success'})
          } else {
            self.$message({message: result.data.msg, type: 'warning'})
          }
        }).catch(function (erro) {
          self.$message({message: erro.data.msg, type: 'warning'})
          console.log(erro)
        })
        self.dialogFormVisible = false
      } else {
        self.$message({message: '处理人和处理结果不得为空。', type: 'warning'})
      }
    },
    // 手动播报
    manualAlarm(obj) {
      this.manualAlertVisible = true
      this.manualAlertConfig.alertVoiceType = 0
      this.manualAlertConfig.alertContent = ''
      this.manualAlertConfig.imei = obj.imei
      this.manualAlertConfig.alertContentOptions = this.allAlarmConfigurations[obj.alarmType] || []
    },
    alertVoiceTypeChanged(label) {
      this.manualAlertConfig.alertContent = ''
    },
    confirmManualAlert() {
      if (this.manualAlertConfig.alertContent.length <= 0) {
        this.$message({
          message: '请选择或输入播报内容'
        })
        return
      }

      let url = '/sdm/radio/manualRadio'
      let data = { imei: this.manualAlertConfig.imei, content: this.manualAlertConfig.alertContent }
      this.$http.post(url, data).then(res => {
        if (res.data.flag) {
          this.manualAlertVisible = false
          this.$message({
            message: '操作成功',
            type: 'success'
          })
        } else {
          this.$message({
            message: res.data.msg,
            type: 'warning'
          })
        }
      }).catch(err => {
        console.log(err)
      })
    },
    // 获取实时报警信息
    ws_RealTimeAlarm: function () {
      var self = this
      var url = self.$global.socketUrl + '/sdm/websocketalarm'
      var data = localStorage.getItem('token')
      importWsk = new WebSocket(url) // 连接服务器
      importWsk.onopen = function (event) { importWsk.send(data); self.lefSocket = true }
      importWsk.onmessage = function (event) { self.indexWebSocketReturn(event) }
      importWsk.onclose = function (event) { self.lefSocket = false }
      importWsk.onerror = function (event) { self.lefSocket = false }
    },
    indexWebSocketReturn: function (result) {
      var self = this
      console.log(result)
      var dataList = JSON.parse(result.data)
      if (self.alarmList.length > 20) { self.alarmList.pop() }
      self.alarmList.unshift(dataList)
      // 向邻居组件IndexCenter发送一条实时报警记录
      self.$eventBus.$emit('updataAlarmData', dataList)
    },
    // 获取所有警报配置信息
    getAlarmConfiguration() {
      [1, 2, 3, 6].forEach(value => {
        this.alarmConfigurationWith(value)
      })
    },
    // 根据类型获取警报配置信息
    alarmConfigurationWith(type) {
      let url = '/sdm/alarm/getAlarmList'
      let data = {'pageNo': 1, 'pageSize': 100, 'alarmType': type}
      this.$http.post(url, data).then(res => {
        if (res.data.flag) {
          this.allAlarmConfigurations[type] = res.data.dataList.map(value => {
            return { value: value.alarmId, label: value.radioContent }
          })
        } else {
          this.$message({
            message: res.data.msg,
            type: 'warning'
          })
        }
      }).catch(err => {
        console.log(err)
      })
    },
    // 获取设备报警总数量、功率报警、声音报警、人体检测
    getAlarmNumData: function () {
      var self = this
      var url = '/sdm/alarmrecord/getAlarmNum'
      self.$http.post(url).then(function (result) {
        console.log(result)
        if (result.data.flag) {
          if (result.data.rows.length > 0) {
            self.drawPieLine(result.data)
          }
        }
      }).catch(function (erro) {
        console.log(erro)
      })
    },

    // 开始绘制环形饼状图
    drawPieLine: function (pieData) {
      var self = this; var barData = []; var allValue = 0
      if (pieData !== undefined) {
        if (pieData.rows.length > 0) {
          pieData.rows.forEach(function (arr, index) {
            if (arr.alarmType == 0) {
              allValue = arr.alarmNum
            } else if (arr.alarmType == 1) {
              barData.push({value: arr.alarmNum, name: '违规喧哗'})
            } else if (arr.alarmType == 2) {
              barData.push({value: arr.alarmNum, name: '违规用电'})
            } else if (arr.alarmType == 3) {
              barData.push({value: arr.alarmNum, name: '违规逗留'})
            } else {
              barData.push({value: arr.alarmNum, name: '违规开灯'})
            }
          })
        }
      } else {
        barData = [{value: 0, name: '违规喧哗'}, {value: 0, name: '违规用电'}, {value: 0, name: '违规逗留'}, {value: 0, name: '违规开灯'}]
        allValue = 0
      }

      myPieChart = echarts.init(document.getElementById('pieChart'))
      optionPie = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/> {b} {c}({d}%)'
        },
        series: [
          {
            name: '报警总数',
            type: 'pie',
            selectedMode: 'single',
            radius: [0, '30%'],
            label: {
              position: 'inner'
            },
            labelLine: {
              show: false
            },
            tooltip: {
              trigger: 'item',
              formatter: '{b}({d}%)'
            },
            data: [
              {
                value: allValue,
                name: '总次数\n' + allValue,
                label: {
                  position: 'center',
                  align: 'center',
                  verticalAlign: 'middle',
                  color: '#fff',
                  fontSize: 16,
                  fontFamily: 'pingfang-b'
                }
              }
            ]
          },
          {
            name: '历史报警次数占比',
            type: 'pie',
            startAngle: 150,
            radius: ['45%', '65%'],
            label: {
              position: 'outside',
              formatter: '{b|{b}:} {per|{d}%}',
              backgroundColor: 'rgba(0,0,0,0)',
              color: '#fff',
              alignTo: 'none',
              fontSize: 12,
              rich: {
                a: {
                  color: '#999',
                  align: 'center',
                  fontFamily: 'pingfang-b'
                },
                b: {
                  fontSize: 12,
                  lineHeight: 32,
                  fontFamily: 'pingfang-b'
                },
                per: {
                  color: '#eee',
                  fontSize: 14,
                  fontFamily: 'pingfang-b'
                }
              }
            },
            labelLine: {
              length: 10,
              length2: 10
            },
            itemStyle: {
              color: function (params) {
                var colorList = ['#f6501c', '#ffb401', '#01f6a9', '#e567de']
                return colorList[params.dataIndex]
              }
            },
            data: barData
          }
        ]
      }
      myPieChart.setOption(optionPie) // 渲染图表
    }
    // =========================================绘制饼状图结束======================================
  },
  destroyed () {
    if (importWsk !== null) { importWsk.close() }
  }
}
</script>

<style>
  @import url("../../../static/css/Index/IndexLeft.css");
</style>
