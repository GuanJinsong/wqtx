<!-- 实时电流监测 -->
<template>
  <div>
    <!-- <button @click="addCurrentDetection()"><span class="el-icon-plus"></span> 添加</button> -->
    <div class="smallTitle">电量检测 </div>
    <div class="man_alaParnetAfter">
      <el-table :data="realTimeList" style="width: 100%">
        <el-table-column prop="keyStatus" label="检测状态"></el-table-column>
        <el-table-column prop="value" label="报警阀值(mA)"></el-table-column>
        <el-table-column prop="radioContent" label="报警提示语"></el-table-column>
        <el-table-column prop="radioState" label="语音提示">
           <template slot-scope="scope">
             {{scope.row.radioState ? '自动' : '手动'}}
           </template>
         </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <button class="man_alaEdit" @click="editRealTimePower(scope.row)"><span class="el-icon-edit"></span> 编辑</button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 实时电流检测编辑弹窗 -->
    <div class="editBox" v-if="testing">
      <div class="editBoxAfter" style="width:500px;">
        <div class="editTitle"><p>添加/编辑</p><span @click="openAndHideTesting">×</span></div>
        <ul class="editMode">
          <li><span class="man_alaEditLi">报警阀值：</span><p class="man_alaEditPut"><input type="number" v-model="t_alarm" placeholder="请输入报警电流"/><i>mA</i></p></li>
          <li><span class="man_alaEditLi">检测状态：</span>
            <div class="editMM" style="width:250px;">
              <el-select v-model="t_value" placeholder="请选择">
                <el-option v-for="item in t_statusOpt" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </div>
          </li>
          <li>
            <span class="man_alaEditLi">语音提示：</span>
            <div class="editMM">
              <el-switch
                style="display: block"
                v-model="t_alarmMode"
                active-color="#19BEAE"
                active-text="自动"
                inactive-text="手动">
              </el-switch>
            </div>
          </li>
          <li><span class="man_alaEditLi">报警提示：</span><p class="man_alaEditPut"><input type="text" v-model="t_alarmWord" placeholder="请输入报警提示语"/></p></li>
        </ul>
        <div class="editBtn"><button @click="nullCheckingPower()">确定</button> <button @click="openAndHideTesting">取消</button></div>
      </div>
    </div>
  </div>
</template>

<script>
import WeekSelecttion from '../publicComponemts/WeekSelecttion.vue'
export default{
  name: 'Man-alarmRulesRealPower',
  components: {WeekSelecttion: WeekSelecttion},
  data() {
    return {
      testing: false, // 定义电流检测弹窗显示
      realTimeList: [], // 电流列表
      alarmId: '', // 电流列表id
      t_alarm: '', // 电流检测 报警阀值
      t_value: 1, // 电流检测状态值
      t_statusOpt: [{value: 0, label: '关闭'}, {value: 1, label: '开启'}],
      t_alarmWord: '', // 报警提示语
      t_alarmMode: 0 // 语音提示
    }
  },
  created() {
    this.getRealTimePower()
  },
  methods: {
    // ========================================实时电流编辑开始====================================
    // 实时电流编辑弹窗
    openAndHideTesting: function() {
      if (this.testing) { this.testing = false } else { this.testing = true }
    },
    weekSelectPower1: function(data) {
      this.t_repeat = data
    },
    // 新添加电流检测
    addCurrentDetection: function() {
      this.alarmId = ''
      this.t_alarm = '' // 电流检测 报警阀值
      this.t_value = 1 // 电流检测开启状态
      this.openAndHideTesting() // 打开弹窗
    },
    // 获取电流列表
    getRealTimePower: function() {
      var self = this
      var url = '/sdm/alarm/getAlarmList'
      var data = {'pageNo': 1, 'pageSize': 10, 'alarmType': 2}
      self.$http.post(url, data).then(function(result) {
        console.log(result)
        if (result.data.flag) {
          var dataList = result.data.dataList
          if (dataList.length > 0) {
            for (var i = 0; i < dataList.length; i++) {
              var startEnd = {'startEnd': '', 'keyStatus': ''}
              startEnd.startEnd = dataList[i].startTime + '~' + dataList[i].endTime
              startEnd.keyStatus = dataList[i].alarmState == 0 ? '关闭' : '开启'
              Object.assign(dataList[i], startEnd)
            }
            self.realTimeList = dataList
            self.t_alarmWord = dataList[0].radioContent
          } else {
            self.realTimeList = []
          }
        } else {
          self.realTimeList = []
        }
      }).catch(function(erro) {
        console.log(erro)
      })
    },
    // 非空验证
    nullCheckingPower: function() {
      if (this.t_alarm == '') { this.$message({message: '报警阀值不得为空', type: 'warning'}); return false }
      if (this.t_alarm > 10000 || this.t_alarm < 100) { this.$message({message: '报警阀值不得大于10000或小于100', type: 'warning'}); return false }
      if (this.t_alarmWord == '') { this.$message({message: '报警提示语不得为空', type: 'warning'}); return false }
      this.saveRealTimePower() // 提交之前先验证数据信息是否完善
    },
    // 保存电流检测编辑框内的数据
    saveRealTimePower: function() {
      var self = this
      var url = '/sdm/alarm/editAlarm'
      var data = {
        alarmId: self.alarmId, 
        alarmType: 2, 
        value: self.t_alarm, 
        alarmState: self.t_value, 
        radioType: 2, 
        radioState: self.t_alarmMode ? 1 : 0, 
        radioContent: self.t_alarmWord
      }
      self.$http.post(url, data).then(function(result) {
        console.log(result)
        if (result.data.flag) {
          self.$message({message: '添加成功', type: 'success'})
          self.getRealTimePower() // 重新获取电流列表
        } else {
          self.$message({message: result.data.msg, type: 'warning'})
        }
        self.openAndHideTesting() // 关闭编辑窗口
      }).catch(function(erro) {
        console.log(erro)
        self.openAndHideTesting() // 关闭编辑窗口
      })
    },
    // 编辑电流检测
    editRealTimePower: function(result) {
      this.openAndHideTesting() // 打开弹窗
      this.alarmId = result.alarmId
      this.t_alarm = result.value // 电流检测 报警阀值
      this.t_value = result.alarmState
      this.t_alarmMode = Boolean(result.radioState)
    }
    // ========================================实时电流编辑结束====================================
  }
}
</script>

<style>
</style>
