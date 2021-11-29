<template>
  <div class="Dor_alaParent" v-bind:class="pulseIndex == true?'boxopen':'boxclose'">
    <p class="Dor_alaOtherBtn" @click="openOrLeft()">报<br/>警<br/>列<br/>表</p>
    <div class="Dor_alaBox">
      <div class="Dor_alaRoomName"><h5>{{roomName}}</h5><span @click="openOrLeft()">×</span></div>
      <h6 class="Dor_alaTitle">报警类型统计：</h6>
      <ul class="Dor_alaul">
        <li><div class="Dor_alaTable"><div><p>音量报警</p><img src="../../../static/images/sushe_10.png"/><p>{{sound}} 次</p></div></div></li>
        <li><div class="Dor_alaTable"><div><p>电量报警</p><img src="../../../static/images/sushe_12.png"/><p>{{power}} 次</p></div></div></li>
        <li><div class="Dor_alaTable"><div><p>亮度报警</p><img src="../../../static/images/sushe_15.png"/><p>{{beamValue}} 次</p></div></div></li>
        <li><div class="Dor_alaTable"><div><p>人员报警</p><img src="../../../static/images/sushe_14.png"/><p>{{hunman}} 次</p></div></div></li>
      </ul>
      <h6 class="Dor_alaTitle"><span>报警记录：</span> <i v-if="alarmLogRe>0">当前未处理:{{alarmLogRe}}条</i></h6>
      <div class="Dor_alaListParent">
        <div class="Dor_alaListAfter">
          <div class="Dor_alathead"><ul><li /><li>设备名称</li><li>报警内容</li><li>时间</li></ul></div>
          <div class="Dor_alatbody">
            <ul v-for="(list,index) in logList" v-bind:key="index" v-bind:class="list.handleState==0?'Dor_hand':''" @click="openDeletePops(list.handleState,list)">
              <li><span @click.stop="manualAlarm(list)"><img src="/static/images/voice.png"/></span></li>
              <li>{{list.room}}</li><li>{{list.alarmContent}}</li><li>{{list.alarmTimeStr}}</li>
            </ul>
            <noMoreData v-if="logList.length ==0"/>
            <div class="loadingBox" @click="getMoreAlarem()" v-if="totalPage>1"><span v-if="loading" class="el-icon-loading"></span>{{loadingTxt}}</div>
          </div>
        </div>
      </div>
    </div>
    <!-- 报警处理 -->
    <el-dialog title="报警详情与处理" :visible.sync="dialogFormVisible" :append-to-body="true" custom-class="Dor_alarmPop" width="390px">
      <div class="Dor_aramInfo">
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
        <el-button type="primary" @click="changeAlaremStatus">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 手动语音播报 -->
    <el-dialog title="语音警告" :visible.sync="manualAlertVisible" custom-class="Dor_alarmPop" :append-to-body="true" width="390px">
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
// import Bus from "../../newObject/Bus.js";
import noMoreData from '../publicComponemts/noMoreData.vue'
var page = 1
var pageSize = 50
export default{
  name: '',
  components: {
    noMoreData: noMoreData
  },
  data() {
    return {
      pulseIndex: false, // 定义报警详细栏的开启与关闭
      imei: '', // 定义设备码
      roomName: 'A-101', // 定义房间号
      sound: 0, // 定义分贝次数值
      power: 0, // 定义电流次数值
      beamValue: 0, // 定义流明度此数值
      hunman: 0, // 定义人体检测
      logList: [], // 定义历史记录
      alarmLogRe: 0, // 定义当前未处理的报警记录条数
      totalPage: 0, // 定义总分页数
      loading: false,
      loadingTxt: '点击获取更多',
      alarmRcdId: '', // 定义当前要删除对象的id
      dialogFormVisible: false,
      form: {name: '', result: ''},
      roomResult: '宿舍用电异常，超出报警阀值',
      roomTime: '2021-04-28 09:50:50',
      manualAlertVisible: false,
      manualAlertConfig: {
        alertVoiceType: 0, // 播报语音类型
        alertVoiceOptions: [{ value: 0, label: '预置语音' }, { value: 1, label: '远程喊话' }],
        alertContentOptions: [],
        alertContent: '',
        imei: '' // 设备码
      },
      allAlarmConfigurations: {} // 所有报警配置
    }
  },
  mounted() {
    // 监听兄弟组件 Dor-roomList传过来的数据
    this.$eventBus.$on('updataRoomLogList', this.updataRoomLogLists)
    this.getAlarmConfiguration()
  },
  methods: {
    // 定义右侧日志框的是否显示
    openOrLeft: function() {
      var self = this
      if (self.pulseIndex) { self.pulseIndex = false } else { self.pulseIndex = true }
    },
    // 获取兄弟组件Dor-roomList传过来的数据
    updataRoomLogLists: function(resu) {
      page = 1
      this.alarmLogRe = resu.result.alarmNum
      this.roomName = resu.result.room
      this.imei = resu.result.imei
      this.pulseIndex = resu.state // 根据兄弟组件Dor-roomList传过来的状态，定义当前是否展开报警日志窗口
      this.getRoomSpotNews(resu.result.imei) // 获取当前宿舍信息
      this.getRoomHistoricalRecords(resu.result.imei) // 获取宿舍历史报警信息
    },
    // 根据兄弟组件传过来的imei码 获取宿舍最新信息
    getRoomSpotNews: function(imei) {
      var self = this
      var url = '/sdm/alarmrecord/getRoomAlarmNum'
      var data = {'imei': imei}
      self.$http.post(url, data).then(function(result) {
        // console.log(result)
        if (result.data.flag) {
          if (result.data.rows.length > 0) {
            var list = result.data.rows
            for (var i = 0; i < list.length; i++) {
              if (list[i].alarmType == 1) {
                self.sound = list[i].alarmNum
              } else if (list[i].alarmType == 2) {
                self.power = list[i].alarmNum
              } else if (list[i].alarmType == 3) {
                self.hunman = list[i].alarmNum
              } else {
                self.beamValue = list[i].alarmNum
              }
            }
          } else {
            self.sound = 0; self.power = 0; self.hunman = 0; self.beamValue = 0
          }
        } else {
          self.sound = 0; self.power = 0; self.hunman = 0; self.beamValue = 0
          self.$message({message: result.data.msg, type: 'warning'})
        }
      }).catch(function(erro) {
        self.sound = 0; self.power = 0; self.hunman = 0; self.beamValue = 0
        self.$message.error(erro.data.msg)
        console.log(erro)
      })
    },
    // 点击获取更多报警数据
    getMoreAlarem: function() {
      if (this.totalPage == page) { this.loadingTxt = '没有更多数据了'; return false };
      page++; this.loading = true
      this.getRoomHistoricalRecords(this.imei)
    },
    // 获取当前房间的历史报警记录
    getRoomHistoricalRecords: function(imei) {
      var self = this
      var url = '/sdm/alarmrecord/getAlarmRecordHandle'
      var data = {'imei': imei, 'pageNo': page, 'pageSize': pageSize}
      self.$http.post(url, data).then(function(result) {
        // console.log(result)
        if (result.data.flag) {
          if (result.data.dataList.length > 0) {
            self.loading = false
            if (page == 1) {
              self.totalPage = result.data.totalPage
              self.logList = result.data.dataList
            } else {
              var list = self.logList
              var newsList = list.concat(result.data.dataList)
              self.logList = newsList
            }
          } else {
            if (page == 1) {
              self.logList = ''
            }
            self.loading = false
            self.loadingTxt = '没有更多数据'
          }
        } else {
          self.loading = false
          self.loadingTxt = '没有更多数据'
          self.logList = ''
        }
      }).catch(function(erro) {
        self.loading = false
        self.logList = ''
        console.log(erro)
      })
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
    // 点击实时报警列表，删除点击后的列表数据
    openDeletePops: function(status, list) {
      // 判断status的状态，0表示这条信息处于未读状态，1表示已读，当只有状态为0时才可以执行状态修改命令
      if (status == 0) {
        this.dialogFormVisible = true
        this.alarmRcdId = list.alarmRcdId // 定义当前要删除对象的id
        this.roomName = list.room // 定义弹窗内的房间名
        this.roomResult = list.alarmContent // 定义弹窗内的结果
        this.roomTime = list.alarmTimeStr // 定义弹窗内的时间
      } else {
        this.$message({message: '当前已经是已读状态,不用修改.', type: 'warning'})
      }
    },
    // 修改报警信息的状态，红色的报警信息表示未读，白色表示已读
    changeAlaremStatus: function() {
      var self = this
      if (self.form.name !== '' && self.form.result !== '') {
        var url = '/sdm/alarmrecord/editAlarmRecord'
        var data = {'alarmRcdId': self.alarmRcdId, handleName: self.form.name, handleResult: self.form.result}
        self.$http.post(url, data).then(function(result) {
          // console.log(result)
          if (result.data.flag) {
            self.$message({message: '报警信息已读，状态修改成功.', type: 'success'})
            var num = Number(self.alarmLogRe) - 1
            self.alarmLogRe = num
            self.$eventBus.$emit('updataRoomAlearm', num) // 向兄弟组件Dor-roomList传递数据
            self.getRoomHistoricalRecords(self.imei)
          } else {
            self.$message({message: result.data.msg, type: 'warning'})
          }
        }).catch(function(erro) {
          self.$message({message: erro.data.msg, type: 'warning'})
          console.log(erro)
        })
        self.dialogFormVisible = false
      } else {
        self.$message({message: '处理人和处理结果不得为空。', type: 'warning'})
      }
    }


    // //修改报警信息的状态，红色的报警信息表示未读，白色表示已读
    // changeAlaremStatus:function(status,alarmRcdId){
    //   var self = this;
    //   //判断status的状态，0表示这条信息处于未读状态，1表示已读，当只有状态为0时才可以执行状态修改命令
    //   if(status == 0){
    //     var url = "/sdm/alarmrecord/editAlarmRecord";
    //     var data = {"alarmRcdId":alarmRcdId};
    //     self.$http.post(url,data).then(function(result){
    //       console.log(result)
    //       if(result.data.flag){
    //         self.$message({message:"报警信息已读，状态修改成功.",type:'success'});
    //         var num = Number(self.alarmLogRe)-1;
    //         self.alarmLogRe = num;
    //         //self.$eventBus.$emit('updataRoomAlearm',self.imei);    //向兄弟组件Dor-roomList传递数据
    //         self.getRoomHistoricalRecords(self.imei)
    //       }else{
    //         self.$message({message:result.data.msg,type:'warning'});
    //       }
    //     }).catch(function(erro){
    //       self.$message.error(erro.data.msg);
    //       console.log(erro)
    //     })
    //   }else{
    //     self.$message({message:"当前已经是已读状态,不用修改.",type:'warning'});
    //   }
    // }
  },
  beforeDestroy() {
    this.$eventBus.$off('updataRoomLogList') // 关闭兄弟组件之间传递信息时$on会多次触发的问题
  }
}
</script>

<style>
  @import url("../../../static/css/DormitoryMonitoring/Dor-alarmLog.css");
</style>
