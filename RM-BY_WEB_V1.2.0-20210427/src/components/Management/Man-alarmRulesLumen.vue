<!-- 流明度检测 -->
<template>
  <div class="man_ala_RuBodyBox">
    <div class="smallTitle">亮度检测 <button @click="addLumenList()"><span class="el-icon-plus"></span> 添加</button></div>
    <div class="man_alaParnetAfter">
       <el-table :data="lumenList" style="width: 100%">
         <el-table-column prop="keyStatus" label="状态" width="90"></el-table-column>
         <el-table-column prop="value" label="报警阀值(Lux)" width="180"></el-table-column>
         <el-table-column prop="weekRange" label="重复"></el-table-column>
         <el-table-column prop="startEnd" label="检测时间"></el-table-column>
         <el-table-column prop="unitRange" label="应用范围"></el-table-column>
         <el-table-column prop="radioContent" label="报警提示语"></el-table-column>
         <el-table-column label="语音提示">
           <template slot-scope="scope">
             {{scope.row.radioState ? '自动' : '手动'}}
           </template>
         </el-table-column>
         <el-table-column label="操作" width="180">
           <template slot-scope="scope">
             <button class="man_alaEdit" @click="editLumen(scope.row)"><span class="el-icon-edit"></span> 编辑</button>
             <button class="man_alaDel" @click="deletelumenList(scope.$index, scope.row)"><span class="el-icon-delete"></span> 删除</button>
           </template>
         </el-table-column>
       </el-table>
    </div>
    <!-- 流明度编辑弹窗 -->
    <div class="editBox" v-if="lumenTest">
      <div class="editBoxAfter" style="width:500px;">
        <div class="editTitle"><p>添加/编辑</p><span @click="openAndHideLumen">×</span></div>
        <ul class="editMode">
          <li><span class="man_alaEditLi">检测状态：</span>
            <div class="editMM" style="width:250px;">
              <el-select v-model="l_value" placeholder="请选择">
                <el-option v-for="item in l_statusOpt" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </div>
          </li>
          <li>
            <span class="man_alaEditLi">报警阀值：</span>
            <div class="man_alaEditPut">
              <!-- <input v-model="l_rank" type="number" placeholder="请输入流明度值"/> -->
              <el-autocomplete
                class="inline-input"
                v-model="l_rank"
                type="number"
                :fetch-suggestions="querySearchLu"
                placeholder="请输入流明度值"
                @select="handleSelectLu"
              ></el-autocomplete>
              <i>Lm</i>
            </div>
          </li>
          <li><span class="man_alaEditLi">重复：</span>
             <div class="editMM" style="width:250px;">
               <WeekSelecttion v-on:weekSelectChanged="weekSelectPower1" v-bind:weekSelectData="l_repeat"/>
             </div>
          </li>
          <li><span class="man_alaEditLi">应用范围：</span>
            <div class="editMM" style="width:250px;">
              <RegionSelection v-if="userRel==1" v-on:regionChanged="emergencyBroad3" v-bind:RegionSelectData="l_Application"/>
              <RegionSelectionUnAll v-if="userRel==3" v-on:regionChanged="emergencyBroad3" v-bind:RegionSelectData="l_Application"/>
            </div>
          </li>
          <li><span class="man_alaEditLi">检测时间：</span>
             <div class="editTime" style="width:250px;">
               <el-time-picker is-range arrow-control
               v-model="l_testTime"
               value-format="HH:mm:ss"
               range-separator="至"
               start-placeholder="开始时间"
               end-placeholder="结束时间"
                placeholder="选择时间范围"></el-time-picker>
             </div>
          </li>
          <li>
            <span class="man_alaEditLi">语音提示：</span>
            <div class="editMM">
              <el-switch
                style="display: block"
                v-model="l_alarmMode"
                active-color="#19BEAE"
                active-text="自动"
                inactive-text="手动">
              </el-switch>
            </div>
          </li>
          <li>
            <span class="man_alaEditLi">报警提示：</span>
            <p class="man_alaEditPut"><input type="text" v-model="l_alarmWord" maxlength="20" placeholder="请输入报警提示语"/></p>
          </li>
        </ul>
        <div class="editBtn"><button @click="nullCheckingLumen()">确定</button> <button @click="openAndHideLumen">取消</button></div>
      </div>
    </div>
  </div>
</template>

<script>
import WeekSelecttion from '../publicComponemts/WeekSelecttion.vue'
import RegionSelection from '../publicComponemts/RegionSelection.vue'
import RegionSelectionUnAll from '../publicComponemts/RegionSelectionUnAll.vue'
var lumenPage = 1
export default{
  name: 'Man-alarmRulesLumen',
  components: {WeekSelecttion: WeekSelecttion, RegionSelection: RegionSelection, RegionSelectionUnAll: RegionSelectionUnAll},
  props: ['scopeSelection'],
  data() {
    return {
      userRel: localStorage.getItem('rel'), // 定义当前的用户身份
      lumenTest: false,
      lumenList: [], // 流明度测列表
      alarmId: '', // 定义当前操作的列表id
      l_testTime: '', // 流明度检测  检测时间
      l_rank: '', // 流明度报警阀值名称
      restaurantsLu: [
        { 'value': '20Lm（光线暗）', 'valueNum': '20' },
        { 'value': '50Lm（光线正常）', 'valueNum': '50' },
        { 'value': '100Lm（光线亮）', 'valueNum': '100' },
        { 'value': '250Lm（光线很亮）', 'valueNum': '250' }
      ], // 流明度选择的结果
      l_repeat: '', // 重复检测周期
      l_Application: [], // 应用范围
      l_value: 1, // 人体检测状态值
      l_statusOpt: [{value: 0, label: '关闭'}, {value: 1, label: '开启'}],
      l_alarmMode: 0,
      l_alarmWord: ''
    }
  },
  created() {
    this.getLumenList()
  },
  methods: {
    // ========================================流明度编辑开始====================================
    // 流明度编辑弹窗
    openAndHideLumen: function() {
      if (this.lumenTest) { this.lumenTest = false } else { this.lumenTest = true }
    },
    weekSelectPower1: function(data) {
      this.l_repeat = data
    },
    // 选择应用范围
    emergencyBroad3: function(data) {
      this.l_Application = data
    },
    // 非空验证
    nullCheckingLumen: function() {
      if (this.l_testTime == '' || this.l_testTime == null) { this.$message({message: '检测时间不得为空', type: 'warning'}); return false }
      if (this.l_rank == '' || this.l_rank > 10000) { this.$message({message: '流明度检测不得为空或大于10000', type: 'warning'}); return false }
      if (this.l_Application == '') { this.$message({message: '范围选择不得为空', type: 'warning'}); return false }
      if (this.l_alarmWord === '') { this.$message({message: '报警提示语不得为空', type: 'warning'}); return false }
      this.saveLumenTest() // 验证成功后才可以提交
    },
    // 新添加流明度列表
    addLumenList: function() {
      this.alarmId = ''
      this.l_testTime = '' // 流明度检测 检测时间
      this.l_rank = '' // 流明度检测阀值名称(主要是针对流明度选择输入框内的值可能不是具体数字)
      this.l_repeat = [] // 重复检测周期
      this.l_Application = [] // 范围
      this.l_value = 1 // 流明度检测状态是否开启
      this.l_alarmMode = 0
      this.l_alarmWord = ''
      this.openAndHideLumen() // 打开弹窗
    },
    // 获取流明度的数据列表
    getLumenList: function() {
      var self = this
      var url = '/sdm/alarm/getAlarmList'
      var data = {'pageNo': 1, 'pageSize': 10, 'alarmType': 6}
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
            self.lumenList = dataList
          } else {
            self.lumenList = []
          }
        } else {
          self.lumenList = []
        }
      }).catch(function(erro) {
        console.log(erro)
      })
    },
    // 保存流明度编辑框内的数据
    saveLumenTest: function() {
      var self = this
      var url = '/sdm/alarm/editAlarm'
      // alarmId定义列表的id,alarmType:"1/2/3/5/6"分贝/功率/人体/屏蔽/流明度,value流明度值
      // startTime开始时间,endTime结束时间,weekData重复周期
      var unitData = []
      var unitCodeData = []
      var unitList = self.l_Application
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
        alarmId: self.alarmId,
        alarmType: 6,
        value: self.l_rank,
        alarmState: self.l_value,
        startTime: self.l_testTime[0],
        endTime: self.l_testTime[1],
        weekData: self.l_repeat,
        unitData: unitData,
        unitCodeData: unitCodeData,
        radioState: self.l_alarmMode ? 1 : 0,
        radioContent: self.l_alarmWord
      }
      self.$http.post(url, data).then(function(result) {
        console.log(result)
        if (result.data.flag) {
          self.$message({message: '添加成功', type: 'success'})
          self.getLumenList() // 重新获取列表
        } else {
          self.$message({message: result.data.msg, type: 'warning'})
        }
        self.openAndHideLumen() // 关闭窗口
      }).catch(function(erro) {
        console.log(erro)
        self.openAndHideLumen() // 关闭窗口
      })
    },
    // 编辑流明度检测
    editLumen: function(result) {
      this.openAndHideLumen() // 打开弹窗
      var time = result.startTime + ',' + result.endTime
      this.alarmId = result.alarmId
      this.l_testTime = time.split(',') // 流明度检测 检测时间
      this.l_rank = result.value.toString() // 流明度检测阀值名称(主要是针对流明度选择输入框内的值可能不是具体数字)
      this.l_repeat = result.weekData // 重复检测周期
      this.l_Application = result.unitCodeData // 广播范围
      this.l_value = result.alarmState // 流明度检测状态是否开启
      this.l_alarmMode = Boolean(result.radioState)
      this.l_alarmWord = result.radioContent
    },
    // 删除 流明度列表
    deletelumenList: function(index, result) {
      var self = this
      self.$confirm('是否删除这条任务?', '提示', {confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      }).then(() => {
        var url = '/sdm/alarm/delAlarm'
        var data = {'alarmId': result.alarmId}
        self.$http.post(url, data).then(function(result) {
          console.log(result)
          if (result.data.flag) {
            self.$message({message: '删除成功', type: 'success'})
            self.getLumenList(lumenPage) // 重新获取列表
          } else {
            self.$message({message: '删除失败', type: 'warning'})
          }
        }).catch(function(erro) {
          console.log(erro)
        })
      }).catch(() => {})
    },
    // ==================================流明度选择业务逻辑开始=========================
    // 流明度选择下拉框定义
    querySearchLu(queryString, cb) {
      var restaurants = this.restaurantsLu
      // var results = queryString ? restaurants.filter(this.createFilterLu(queryString)) : restaurants;
      var results = restaurants
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    createFilterLu(queryString) {
      return (restaurant) => {
        return (restaurant.valueNum.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    // 获取选中后的流明度等级值
    handleSelectLu(item) { this.l_rank = item.valueNum }
    // ==================================分贝选择业务逻辑结束=========================
    // ========================================流明度检测编辑结束====================================
  }
}
</script>

<style>
</style>
