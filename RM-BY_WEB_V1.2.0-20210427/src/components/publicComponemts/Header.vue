<!-- 白色背景头模块 -->
<template>
  <section class="Header">
    <div class="headerBox">
      <div class="hea_navBox">
        <ul class="hea_Lsit">
          <li class="systemLogoImg"><img src="../../../static/images/logo.png"/></li>
          <li class="systemLogo">智能宿管安全管理平台</li>
          <li class="systemLi" v-for="(nav,index) in navList"
          v-bind:key="index"
          @click="changeTemplate(nav.id,nav.path,nav.name)"
          v-bind:class="nav.id == navIndex?'navSelect':''"><span v-bind:class="nav.clasName"></span>{{nav.navName}}</li>
        </ul>
      </div>
      <div class="userBox" v-if="user">
       <el-tooltip placement="bottom">
          <div class="hea_userParent"><i class="hea_userName">{{userName}}</i> <i class="closeBtn el-icon-user"></i></div>
          <div class="userLoginOut" slot="content">
            <p @click="loginOut()"><i class="el-icon-switch-button"></i> <span>退出登录</span></p>
            <!-- <p @click="changePassWordBox = true"><i class="el-icon-unlock"></i> <span>修改密码</span></p> -->
          </div>
        </el-tooltip>
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
        <el-button type="primary" @click="changePassWordBox = false">确 定</el-button>
      </div>
    </el-dialog>
  </section>
</template>

<script>
import alertTone from '../../../static/js/alertTone'
var importWsH = null
export default{
  name: 'Header',
  props: {
    navSelect: {type: Number, required: true}
  },
  data () {
    return {
      systemName: '宿舍管理系统',
      userName: localStorage.getItem('userName'),
      user: true,
      navIndex: 0, // 定义初始选中的导航项
      navList: [
        {id: 0, navName: '首页', clasName: 'el-icon-s-home', name: 'Index', path: '/components/Index/Index'},
        {id: 2, navName: '配置', clasName: 'el-icon-s-tools', name: 'Management', path: '/components/Management/Management'},
        {id: 3, navName: '日志', clasName: 'el-icon-tickets', name: 'SystemLog', path: '/components/SystemLog/SystemLog'}
      ],
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
    this.navIndex = this.navSelect
    this.deviceElectricLeakage()
    this.alarmStatusChanged()

    this.$eventBus.$on('AlarmAlertStatusChanged', this.alarmStatusChanged)
  },
  methods: {
    // 导航栏切换
    changeTemplate: function (index, path, name) {
      this.navIndex = index
      this.$router.push({path: path, name: name})
    },
    alarmStatusChanged() {
      this.getAlertStatus(8)
      this.getAlertStatus(9)
    },
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
    // ======================或取设备漏电实时报警开始=====================
    deviceElectricLeakage: function() {
      var self = this
      var url = self.$global.socketUrl + '/sdm/websocketalarm'
      var data = localStorage.getItem('token')
      importWsH = new WebSocket(url) // 连接服务器
      importWsH.onopen = function (event) { importWsH.send(data) }
      importWsH.onmessage = function (event) { self.webSocketReturn(event) }
      importWsH.onclose = function (event) {}
      importWsH.onerror = function (event) {}
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
  beforeDestroy() {
    this.$eventBus.$off('AlarmAlertStatusChanged')
  },
  destroyed () {
    if (importWsH !== null) { importWsH.close() }
  }
}
</script>

<style>
  @import url("../../../static/css/publicComponemts/Header.css");
</style>
