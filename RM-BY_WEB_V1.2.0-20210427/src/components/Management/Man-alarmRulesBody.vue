<!-- 人体检测 -->
<template>
  <div class="man_ala_RuBodyBox">
    <div class="smallTitle">人员检测 <button @click="addBodyTest()"><span class="el-icon-plus"></span> 添加</button></div>
    <div class="man_alaParnetAfter">
       <el-table :data="bodyList" style="width: 100%">
         <el-table-column prop="keyStatus" label="状态" width="180"></el-table-column>
         <el-table-column prop="weekRange" label="重复"></el-table-column>
         <el-table-column prop="startEnd" label="检测时间"></el-table-column>
         <el-table-column prop="unitRange" label="应用范围"></el-table-column>
         <el-table-column prop="radioContent" label="报警提示语"></el-table-column>
         <el-table-column prop="radioState" label="语音提示">
           <template slot-scope="scope">
             {{scope.row.radioState ? '自动' : '手动'}}
           </template>
         </el-table-column>
         <el-table-column label="操作" width="180">
           <template slot-scope="scope">
             <button class="man_alaEdit" @click="editBodyTest(scope.row)"><span class="el-icon-edit"></span> 编辑</button>
             <button class="man_alaDel" @click="deleteBodyList(scope.$index, scope.row)"><span class="el-icon-delete"></span> 删除</button>
           </template>
         </el-table-column>
       </el-table>
    </div>
    <!-- 人体检测编辑弹窗 -->
    <div class="editBox" v-if="bodyTest">
      <div class="editBoxAfter" style="width:500px;">
        <div class="editTitle"><p>添加/编辑</p><span @click="openAndHideBodyTest">×</span></div>
        <ul class="editMode">
          <li><span class="man_alaEditLi">检测状态：</span>
            <div class="editMM" style="width:250px;">
              <el-select v-model="b_value" placeholder="请选择">
                <el-option v-for="item in b_statusOpt" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </div>
          </li>
          <li><span class="man_alaEditLi">检测时间：</span>
             <div class="editTime" style="width:250px;">
               <el-time-picker is-range arrow-control
               v-model="b_testTime"
               value-format="HH:mm:ss"
               range-separator="至"
               start-placeholder="开始时间"
               end-placeholder="结束时间"
                placeholder="选择时间范围"></el-time-picker>
             </div>
          </li>
          <li><span class="man_alaEditLi">应用范围：</span>
            <div class="editMM" style="width:250px;">
              <RegionSelection v-if="userRel==1" v-on:regionChanged="emergencyBroadUnAll" v-bind:RegionSelectData="b_Application"/>
              <RegionSelectionUnAll v-if="userRel==3" v-on:regionChanged="emergencyBroadUnAll" v-bind:RegionSelectData="b_Application"/>
            </div>
          </li>
          <li><span class="man_alaEditLi">重复：</span>
             <div class="editMM" style="width:250px;">
               <WeekSelecttion v-on:weekSelectChanged="weekSelectBody1" v-bind:weekSelectData="b_repeat"/>
             </div>
          </li>
          <li>
            <span class="man_alaEditLi">语音提示：</span>
            <div class="editMM">
              <el-switch
                style="display: block"
                v-model="b_alarmMode"
                active-color="#19BEAE"
                active-text="自动"
                inactive-text="手动">
              </el-switch>
            </div>
          </li>
          <li>
            <span class="man_alaEditLi">报警提示：</span>
            <p class="man_alaEditPut"><input type="text" v-model="b_alarmWord" maxlength="20" placeholder="请输入报警提示语"/></p>
          </li>
        </ul>
        <div class="editBtn"><button @click="nullCheckingBody()">确定</button> <button @click="openAndHideBodyTest">取消</button></div>
      </div>
    </div>
  </div>
</template>

<script>
import WeekSelecttion from '../publicComponemts/WeekSelecttion.vue'
import RegionSelection from '../publicComponemts/RegionSelection.vue'
import RegionSelectionUnAll from '../publicComponemts/RegionSelectionUnAll.vue'
var bodyPage = 1
export default{
  name: 'Man-alarmRulesBody',
  components: {WeekSelecttion: WeekSelecttion, RegionSelectionUnAll: RegionSelectionUnAll, RegionSelection: RegionSelection},
  props: ['scopeSelection'],
  data() {
    return {
      userRel: localStorage.getItem('rel'), // 定义当前的用户身份
      bodyTest: false,
      bodyList: [], // 人体检测列表
      alarmId: '', // 定义当前操作的列表id
      b_status: '开启', // 人体检测  检测状态
      b_value: 1, // 人体检测状态值
      b_statusOpt: [{value: 0, label: '关闭'}, {value: 1, label: '开启'}],
      b_testTime: '', // 人体检测  检测时间
      b_Application: [], // 应用范围
      b_repeat: '', // 人体检测  重复
      b_alarmMode: 0, // 警告方式
      b_alarmWord: '' // 人体检测警告语
    }
  },
  created() {
    this.getBodyList()
  },
  methods: {
    // ========================================人体检测编辑开始====================================
    // 人体检测编辑弹窗
    openAndHideBodyTest: function() {
      if (this.bodyTest) { this.bodyTest = false } else { this.bodyTest = true }
    },
    weekSelectBody1: function(data) {
      this.b_repeat = data
    },
    // 选择应用范围(分呗报警智能分析添加模块)
    emergencyBroadUnAll: function(data) {
      this.b_Application = data
    },
    // 非空验证
    nullCheckingBody: function() {
      if (this.b_testTime == '' || this.b_testTime == null) { this.$message({message: '检测时间不得为空', type: 'warning'}); return false }
      if (this.b_repeat == '') { this.$message({message: '重复时间不得为空', type: 'warning'}); return false }
      if (this.b_Application == '') { this.$message({message: '范围选择不得为空', type: 'warning'}); return false }
      if (this.b_alarmWord == '') { this.$message({message: '报警提示语不得为空', type: 'warning'}); return false }
      this.saveBodyTest() // 验证成功后才可以提交
    },
    addBodyTest: function() {
      this.alarmId = ''
      this.b_value = 1 // 人体检测
      this.b_status = '开启' // 人体检测 是否开启
      this.b_testTime = '' // 人体检测 检测时间
      this.b_repeat = [] // 人体检测 重复
      this.b_Application = '' // 范围
      this.b_alarmMode = 0
      this.b_alarmWord = ''
      this.openAndHideBodyTest() // 打开弹窗
    },
    // 获取人体检测的数据列表
    getBodyList: function() {
      var self = this
      var url = '/sdm/alarm/getAlarmList'
      var data = {'pageNo': 1, 'pageSize': 10, 'alarmType': 3}
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
            self.bodyList = dataList
          } else {
            self.bodyList = []
          }
        } else {
          self.bodyList = []
        }
      }).catch(function(erro) {
        console.log(erro)
      })
    },
    // 保存人体检测编辑框内的数据
    saveBodyTest: function() {
      var self = this
      var url = '/sdm/alarm/editAlarm'
      // alarmId定义列表的id,alarmType:"1/2/3/5"分贝/功率/人体/屏蔽,alarmState:"0/1", 未开启/开启
      // startTime开始时间,endTime结束时间,weekData重复周期
      var unitData = []
      var unitCodeData = []
      var unitList = self.b_Application
      console.log(self.scopeSelection)
      if (self.scopeSelection.length > 0) {
        self.scopeSelection.forEach(function(arr, index) {
          var code = arr.value
          if (unitList.length > 0) {
            unitList.forEach(function(dat, index) {
              if (code == dat) { unitData.push(arr.label); unitCodeData.push(arr.value) }
            })
          }
        })
      }
      var data = {
        'alarmId': self.alarmId,
        'alarmType': 3,
        'alarmState': self.b_value,
        'startTime': self.b_testTime[0],
        'endTime': self.b_testTime[1],
        'weekData': self.b_repeat,
        'unitData': unitData,
        'unitCodeData': unitCodeData,
        'radioContent': self.b_alarmWord,
        'radioState': self.b_alarmMode ? 1 : 0
      }
      self.$http.post(url, data).then(function(result) {
        console.log(result)
        if (result.data.flag) {
          self.$message({message: '添加成功', type: 'success'})
          self.getBodyList() // 重新获取人体检测列表
        } else {
          self.$message({message: result.data.msg, type: 'warning'})
        }
        self.openAndHideBodyTest() // 关闭窗口
      }).catch(function(erro) {
        console.log(erro)
        self.openAndHideBodyTest() // 关闭窗口
      })
    },
    // 编辑人体检测
    editBodyTest: function(result) {
      this.openAndHideBodyTest() // 打开弹窗
      var time = result.startTime + ',' + result.endTime
      this.alarmId = result.alarmId
      this.b_value = result.alarmState // 人体检测
      this.b_status = result.alarmState == 0 ? '关闭' : '开启' // 人体检测 是否开启
      this.b_testTime = time.split(',') // 人体检测 检测时间
      this.b_Application = result.unitCodeData
      this.b_repeat = result.weekData // 人体检测 重复
      this.b_alarmWord = result.radioContent // 报警提示语
      this.b_alarmMode = Boolean(result.radioState) // 语音提示
    },
    // 删除 人体检测列表
    deleteBodyList: function(index, result) {
      var self = this
      self.$confirm('是否删除这条任务?', '提示', {confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      }).then(() => {
        var url = '/sdm/alarm/delAlarm'
        var data = {'alarmId': result.alarmId}
        self.$http.post(url, data).then(function(result) {
          console.log(result)
          if (result.data.flag) {
            self.$message({message: '删除成功', type: 'success'})
            self.getBodyList(bodyPage) // 重新获取单一事件触发报警列表
          } else {
            self.$message({message: '删除失败', type: 'warning'})
          }
        }).catch(function(erro) {
          console.log(erro)
        })
      }).catch(() => {})
    }
    // ========================================人体检测编辑结束====================================
  }
}
</script>

<style>
</style>
