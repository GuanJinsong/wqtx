<!-- 蓝色背景头模块 -->
<template>
  <section class="HeaderOther">
    <img src="../../../static/images/index_back.png" class="headBack"/>
    <div class="HeaderOtherBox">
      <div class="hed_othLeft"><p><img src="../../../static/images/logo1.png"/></p> <span>版本：V1.2.2 20210903</span></div>
      <div class="hed_othCenter">智能宿管安全管理平台</div>
      <div class="hed_othRight">
        <div class="o_userBox">
         <el-tooltip placement="bottom">
            <div class="o_hea_userParent"><i class="o_hea_userName">{{userName}}</i> <i class="o_closeBtn el-icon-user"></i></div>
            <div class="o_userLoginOut" slot="content">
              <p @click="loginOut()"><i class="el-icon-switch-button"></i> <span>退出登录</span></p>
              <!-- <p @click="changePassWordBox = true"><i class="el-icon-unlock"></i> <span>修改密码</span></p> -->
            </div>
          </el-tooltip>
        </div>
        <p>{{realTime}}</p>
      </div>
    </div>
    <el-dialog title="修改密码" :visible.sync="changePassWordBox" :append-to-body="true" width="400px">
      <el-form :model="form">
          <el-form-item label="旧密码" :label-width="formLabelWidth">
            <el-input v-model="form.old" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="新密码" :label-width="formLabelWidth">
            <el-input v-model="form.new" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="changePassWordBox = false">取 消</el-button>
        <el-button type="primary" @click="changePassword()">确 定</el-button>
      </div>
    </el-dialog>
  </section>
</template>

<script>
import alertTone from '../../../static/js/alertTone.js'

var importWsO = null

export default{
  name: '',
  data () {
    return {
      realTime: '2020-09-27 11:00:00',
      userName: localStorage.getItem('userName'),
      changePassWordBox: false,
      form: {old: '', new: ''},
      formLabelWidth: '60px',
      alertStatus: {
        voice: 0,
        alert: 0
      },
      notifications: [] // 弹框通知
    }
  },
  created () {
    this.getTheCurrentTime()
    this.deviceElectricLeakage()
    this.loadAlarmStatus()
  },
  methods: {
    // =================获取当前的时间开始===========================
    getTheCurrentTime: function () {
      var self = this
      setInterval(function () {
        let data = new Date()
        let year = data.getFullYear()
        let month = data.getMonth() + 1
        let day = data.getDate()
        let hours = data.getHours()
        let m = data.getMinutes()
        let se = data.getSeconds()
        let newData = year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day) + ' ' + (hours < 10 ? '0' + hours : hours) + ':' + (m < 10 ? '0' + m : m) + ':' + (se < 10 ? '0' + se : se)
        self.realTime = newData
      }, 1000)
    },
    loadAlarmStatus() {
      this.getAlertStatus(8)
      this.getAlertStatus(9)
    },
    // =================获取当前的时间结束===========================
    // 退出登录
    loginOut: function () {
      // localStorage.clear();

      localStorage.removeItem('token')
      localStorage.removeItem('keyup')
      localStorage.removeItem('rel')
      localStorage.removeItem('userName')
      localStorage.removeItem('passWord')
      this.$router.push({path: '/', name: 'Login'})
    },
    // 修改密码
    changePassword: function () {
      console.log(this.form)
      this.changePassWordBox = false
    },
    // ======================或取设备漏电实时报警开始=====================
    deviceElectricLeakage: function () {
      var self = this
      var url = self.$global.socketUrl + '/sdm/websocketalarm'
      var data = localStorage.getItem('token')
      importWsO = new WebSocket(url) // 连接服务器
      importWsO.onopen = function (event) { importWsO.send(data) }
      importWsO.onmessage = function (event) { self.webSocketReturn(event) }
      importWsO.onclose = function (event) {}
      importWsO.onerror = function (event) {}
    },
    webSocketReturn: function(result) {
      let dataList = JSON.parse(result.data)
      let type = dataList.alarmType
      let electricLeakage = 4
      let voice = type === electricLeakage || this.alertStatus.voice
      let alert = type === electricLeakage || this.alertStatus.alert
      
      // 如果是漏电类型（4）的警告一定发出提示音与弹窗，其他类型按照配置的状态显示
      voice && this.showVoice(dataList)
      alert && this.showAlert(dataList)
    },
    // 播放语音提示音
    showVoice(dataList) {
      alertTone(dataList)
    },
    // 弹出框提醒
    showAlert(dataList) {
      let data = new Date()
      let year = data.getFullYear()
      let month = String(data.getMonth() + 1).padStart(2, 0)
      let day = String(data.getDate()).padStart(2, 0)
      let hours = String(data.getHours()).padStart(2, 0)
      let m = String(data.getMinutes()).padStart(2, 0)
      let se = String(data.getSeconds()).padStart(2, 0)
      let newData = year + '-' + month + '-' + day + ' ' + hours + ':' + m + ':' + se
      var message = "<div class='hed_othnotif'><p>报警房间：" + dataList.room + '</p><p>报警说明：' + dataList.alarmContent + '</p><p>报警时间：' + newData + '</p></div>'
      
      let notification = this.$notify({
        title: '设备报警提醒',
        type: 'warning',
        dangerouslyUseHTMLString: true,
        customClass: 'notifyParent',
        message: message
      })

      // 限制弹出框数量
      this.notifications.length >= 4 && this.notifications.pop().close()
      this.notifications.unshift(notification)
    },
    // ======================或取设备漏电实时报警结束=====================
    getAlertStatus(type) {
      let url = '/sdm/alarm/getAlarmList'
      let data = {
        pageNo: 1,
        pageSize: 10,
        alarmType: type
      }
      this.$http.post(url, data).then(res => {
        if (res.data.flag) {
          if (res.data.dataList.length) {
            let obj = res.data.dataList[0]
            if (type === 9) {
              this.alertStatus.alert = Boolean(obj.alarmState)
            } else {
              this.alertStatus.voice = Boolean(obj.alarmState)
            }
          }
        }
      }).catch(err => {
        console.log(err)
      })
    }
  },
  destroyed () {
    if (importWsO !== null) { importWsO.close() }
  }
}
</script>

<style>
  @import url("../../../static/css/publicComponemts/HeaderOther.css");
</style>
