<!-- 单一语音事件触发 -->
<template>
  <div>
   <div class="man_alaParnetAfter">
      <div class="man_alaPlus"><p>单一语音事件触发</p><button @click="addSoundThePolice()"><span class="el-icon-plus"></span> 添加</button></div>
      <el-table :data="soundList" style="width: 100%">
        <el-table-column prop="stateName" label="状态" width="60"></el-table-column>
        <el-table-column prop="value" label="分贝(dB)" width="80"></el-table-column>
        <el-table-column prop="duration" label="持续时间(s)" width="180"></el-table-column>
        <el-table-column prop="weekRange" label="重复"></el-table-column>
        <el-table-column prop="startEnd" label="检测时间"></el-table-column>
        <el-table-column prop="unitRange" label="应用范围"></el-table-column>
        <el-table-column prop="radioContent" label="广播内容"></el-table-column>
        <el-table-column prop="radioState" label="语音提示">
           <template slot-scope="scope">
             {{scope.row.radioState ? '自动' : '手动'}}
           </template>
         </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <button class="man_alaEdit" @click="editSoundList(scope.$index, scope.row)"><span class="el-icon-edit"></span> 编辑</button>
            <button class="man_alaDel" @click="deleteSoundList(scope.$index, scope.row)"><span class="el-icon-delete"></span> 删除</button>
          </template>
        </el-table-column>
      </el-table>
      <pagingComponentSing v-show="sing_totalPage>1"/>
   </div>
   <!-- 单一语音事件触发 的编辑框-->
   <div class="editBox" v-if="Analysis">
     <div class="editBoxAfter" style="width:500px;">
       <div class="editTitle"><p>添加/编辑</p><span @click="openAndHideAnalysis">×</span></div>
       <ul class="editMode">
         <li><span class="man_alaEditLi">检测状态：</span>
           <div class="editMM" style="width:250px;">
             <el-select v-model="s_value" placeholder="请选择">
               <el-option v-for="item in s_statusOpt" :key="item.value" :label="item.label" :value="item.value"></el-option>
             </el-select>
           </div>
         </li>
         <li>
           <span class="man_alaEditLi">喧闹等级：</span>
           <div class="man_alaEditPut">
             <!-- <input v-model="s_sound" type="number" max="120" placeholder="请输入分贝值(小于120)"/> -->
             <el-autocomplete
               class="inline-input"
               type="number"
               v-model="s_sound"
               :fetch-suggestions="querySearch"
               placeholder="输入分贝值(小于120),或选择分贝等级"
               @select="handleSelect"
             ></el-autocomplete>
             <i>dB</i>
           </div>
          </li>
         <li><span class="man_alaEditLi">持续时间：</span><p class="man_alaEditPut"><input v-model="s_continued" type="number" placeholder="持续时间不得少于6s"/><i>S</i></p></li>
         <li><span class="man_alaEditLi">检测时间：</span>
            <div class="editTime" style="width:250px;">
              <template>
                <el-time-picker
                  is-range
                  arrow-control
                  v-model="s_testing"
                  value-format="HH:mm:ss"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  placeholder="选择时间范围">
                </el-time-picker>
              </template>
            </div>
         </li>
         <li><span class="man_alaEditLi">重 &nbsp;&nbsp;&nbsp;&nbsp; 复：</span>
            <div class="editMM" style="width:250px;">
              <WeekSelecttion v-on:weekSelectChanged="weekSelect1" v-bind:weekSelectData="s_repeat"/>
            </div>
         </li>
         <li><span class="man_alaEditLi">应用范围：</span>
           <div class="editMM" style="width:250px;">
             <RegionSelection v-if="userRel==1" v-on:regionChanged="emergencyBroad3" v-bind:RegionSelectData="s_Application"/>
             <RegionSelectionUnAll v-if="userRel==3" v-on:regionChanged="emergencyBroad3" v-bind:RegionSelectData="s_Application"/>
           </div>
         </li>
         <li>
            <span class="man_alaEditLi">语音提示：</span>
            <div class="editMM">
              <el-switch
                style="display: block"
                v-model="s_alarmMode"
                active-color="#19BEAE"
                active-text="自动"
                inactive-text="手动">
              </el-switch>
            </div>
          </li>
         <li><span class="man_alaEditLi">广播内容：</span>
           <div class="editMM" style="width:250px;">
             <el-radio-group v-model="s_BroaContent">
               <el-radio :label="1">广播铃声</el-radio>
               <el-radio :label="2">广播语音</el-radio>
             </el-radio-group>
           </div>
         </li>
         <li v-if="s_BroaContent==1"><span class="man_alaEditLi">铃声选择：</span>
           <div class="editMM" style="width:250px;">
             <RingtoneSelection v-on:ringingChanged="ringingUpdata" v-bind:RingtoneSelectData="s_ringingTone"/>
           </div>
         </li>
         <li v-if="s_BroaContent==2"><span class="man_alaEditLi">语音文本：</span><p class="man_alaEditPut"><input type="text" maxlength="80" v-model="s_voiceText" placeholder="请输入语音文本(80字以内)" /></p></li>
       </ul>
       <div class="editBtn"><button @click="nullChecking()">确定</button> <button @click="openAndHideAnalysis">取消</button></div>
     </div>
   </div>
   </div>
</template>

<script>
import WeekSelecttion from '../publicComponemts/WeekSelecttion.vue'
import RegionSelection from '../publicComponemts/RegionSelection.vue'
import RegionSelectionUnAll from '../publicComponemts/RegionSelectionUnAll.vue'
import pagingComponentSing from '../publicComponemts/pagingComponent.vue'
import RingtoneSelection from '../publicComponemts/RingtoneSelection.vue'
var singlePage = 1
export default{
  name: 'Man-alarmRulesSingle',
  components: {WeekSelecttion: WeekSelecttion, RegionSelection: RegionSelection, pagingComponentSing: pagingComponentSing, RingtoneSelection: RingtoneSelection, RegionSelectionUnAll: RegionSelectionUnAll},
  props: ['scopeSelection'],
  data() {
    return {
      userRel: localStorage.getItem('rel'), // 定义当前的用户身份
      Analysis: false, // 定义分呗报警弹窗显示
      sing_totalPage: 1, // 定义总页数
      soundList: [], // 单一语音事件触发
      s_alarmId: '', // 定义单一语音事件触发id
      s_value: 1, // 人体检测状态值
      s_statusOpt: [{value: 0, label: '关闭'}, {value: 1, label: '开启'}],
      s_sound: '', // 分呗
      restaurants: [
        { 'value': '50dB（安静）', 'valueNum': '50' },
        { 'value': '60dB（小声说话）', 'valueNum': '60' },
        { 'value': '70dB（正常说话）', 'valueNum': '70' },
        { 'value': '80dB（吵闹）', 'valueNum': '80' }
      ], // 分呗选择的结果
      s_continued: '', // 分呗持续时间
      s_testing: [new Date(2016, 9, 10, 8, 40), new Date(2016, 9, 10, 9, 40)], // 监测时间
      s_repeat: '', // 重复
      s_Application: [], // 应用范围
      s_alarmMode: 0, // 语音提示
      s_BroaContent: 1, // 广播内容
      s_ringingTone: '', // 铃声code
      s_ringingContent: '', // 铃声名称
      s_voiceText: '' // 语言文本
    }
  },
  created() {
    this.getSoundListTrigger(singlePage)
  },
  mounted() {
    // 监听子组件 pagingComponent传过来的数据
    this.$eventBus.$on('updataPage', this.updataSinglePage)
  },
  methods: {
    // =========================================单一语音事件触发 开始================================
    // 根据分页子组件返回的数据请求新的报警记录数据
    updataSinglePage: function(page, type) {
      if (type == 'single') { this.getSoundListTrigger(page) }
    },
    // 分呗报警智能分析添加,编辑弹窗
    openAndHideAnalysis: function() {
      if (this.Analysis) { this.Analysis = false } else { this.Analysis = true }
    },
    // 重复日期选择
    weekSelect1: function(data) {
      this.s_repeat = data
    },
    // 选择应用范围(分呗报警智能分析添加模块)
    emergencyBroad3: function(data) {
      this.s_Application = data
    },
    // 获取选中的铃声
    ringingUpdata: function(data) {
      this.s_ringingTone = data.value
      this.s_ringingContent = data.label
    },
    // 获取分呗条件列表
    getSoundListTrigger: function(page) {
      var self = this
      var url = '/sdm/alarm/getAlarmList'
      var data = {'pageNo': page, 'pageSize': 15, 'alarmType': 1}
      self.$http.post(url, data).then(function(result) {
        console.log(result)
        if (result.data.flag) {
          self.$eventBus.$emit('deviceListDataReturn', result.data, 'single')
          self.sing_totalPage = result.data.totalPage // 获取总共有多少页
          singlePage = result.data.page // 获取当前页
          var dataList = result.data.dataList
          if (dataList.length > 0) {
            for (var i = 0; i < dataList.length; i++) {
              var addCode = {'startEnd': '', stateName: '开启'}
              addCode.startEnd = dataList[i].startTime + '~' + dataList[i].endTime
              addCode.stateName = dataList[i].alarmState == 0 ? '关闭' : '开启'
              Object.assign(dataList[i], addCode)
            }
            self.soundList = dataList
          } else {
            self.soundList = []
          }
        } else {
          self.soundList = []
        }
      }).catch(function(erro) {
        console.log(erro)
      })
    },
    // 分呗报警编辑框，非空验证
    nullChecking: function() {
      if (this.s_sound == '' || isNaN(this.s_sound)) { this.$message({message: '分贝不得为空,只能是数字', type: 'warning'}); return false }
      if (this.s_sound > 120) { this.$message({message: '分贝值不能大于120', type: 'warning'}); return false }
      if (this.s_continued == '' || this.s_continued < 6) { this.$message({message: '分贝持续时间不得为空,或者持续时间不得少于6s', type: 'warning'}); return false }
      if (this.s_continued > 3600) { this.$message({message: '分贝持续时间不得为空,或者持续时间不得大于3600s', type: 'warning'}); return false }
      if (this.s_testing == '' || this.s_testing == null) { this.$message({message: '分贝检测时间不得为空', type: 'warning'}); return false }
      if (this.s_repeat == '') { this.$message({message: '重复时间不得为空', type: 'warning'}); return false }
      if (this.s_Application == '') { this.$message({message: '范围选择不得为空', type: 'warning'}); return false }
      if (this.s_BroaContent == 1) {
        if (this.s_ringingTone == '') { this.$message({message: '铃声选择不得为空', type: 'warning'}); return false }
      } else {
        if (this.s_voiceText == '') { this.$message({message: '语音文本不得为空', type: 'warning'}); return false }
      }
      this.raiseThePrice() // 上面的验证通过后再执行提交
    },
    // 分呗编辑框 清空处理
    clearEditPut: function() {
      this.s_alarmId = '' // 情况id
      this.s_value = 1 // 检测状态
      this.s_sound = '' // 分呗
      this.s_continued = '' // 分呗持续时间
      this.s_testing = '' // 检测时间
      this.s_repeat = '' // 重复
      this.s_Application = '' // 范围
      this.s_BroaContent = 1 // 广播内容，1表示铃声2表示语音
      this.s_ringingTone = '' // 铃声选择的结果
      this.s_voiceText = '' // 语音文本
      this.s_alarmMode = 0
    },
    // 添加新的分呗报警方案
    addSoundThePolice: function() {
      this.openAndHideAnalysis()
      this.clearEditPut()
    },
    // 保存分呗编辑框内的数据
    raiseThePrice: function() {
      var self = this
      var url = '/sdm/alarm/editAlarm'
      var broaType = ''
      if (self.s_BroaContent == 1) {
        broaType = {'radioContent': self.s_ringingContent, 'radioCode': self.s_ringingTone} // 铃声选择的结果
      } else {
        broaType = {'radioContent': self.s_voiceText, 'radioCode': ''} // 自定义语音文本
      }
      var unitData = []
      var unitCodeData = []
      var unitList = self.s_Application
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
      // alarmId分呗报警,alarmType"1/2/3/5"分贝/功率/人体/屏蔽,value分呗值,duration持续时间,startTime开始检测时间,
      // endTime结束检测时间,radioType:1/2 系统铃声/自定义语音,weekData重复周期,unitData使用范围选择,unitCodeData使用范围的编号
      var data = {
        'alarmId': self.s_alarmId,
        'alarmState': self.s_value,
        'alarmType': 1,
        'value': self.s_sound,
        'duration': self.s_continued,
        'startTime': self.s_testing[0],
        'endTime': self.s_testing[1],
        'radioType': self.s_BroaContent,
        'weekData': self.s_repeat,
        'unitData': unitData,
        'unitCodeData': unitCodeData,
        'radioState': self.s_alarmMode ? 1 : 0
      }
      Object.assign(data, broaType) // 对象合并
      self.$http.post(url, data).then(function(result) {
        console.log(result)
        if (result.data.flag) {
          self.$message({message: '添加成功', type: 'success'})
          self.getSoundListTrigger(singlePage) // 重新获取单一事件触发报警列表
        } else {
          self.$message({message: result.data.msg, type: 'warning'})
        }
        self.openAndHideAnalysis() // 关闭编辑窗口
      }).catch(function(erro) {
        console.log(erro)
      })
    },
    // 编辑分呗列表
    editSoundList: function(index, result) {
      var self = this
      self.s_voiceText = '' // 编辑弹窗前先清空历史可能存留的s_voiceText历史数据
      self.openAndHideAnalysis() // 打开弹窗
      var time = result.startTime + ',' + result.endTime
      self.s_alarmId = result.alarmId // 分呗单一报警id
      self.s_value = result.alarmState // 检测状态
      self.s_sound = result.value.toString() // 分呗值
      self.s_continued = result.duration // 分呗持续时间
      self.s_testing = time.split(',') // 检测时间
      self.s_BroaContent = result.radioType // 广播语音和广播铃声选择
      self.s_repeat = result.weekData // 广播重复时间
      self.s_Application = result.unitCodeData // 广播范围
      self.s_ringingTone = result.radioCode.toString() // 铃声选择的结果
      self.s_alarmMode = Boolean(result.radioState) // 语音提示
      // 语音文本
      if (result.radioType == 1) {
        self.s_ringingContent = result.radioContent
      } else {
        self.s_voiceText = result.radioContent
      }
    },
    // 删除 分贝单一报警触发列表
    deleteSoundList: function(index, result) {
      var self = this
      self.$confirm('是否删除这条任务?', '提示', {confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      }).then(() => {
        var url = '/sdm/alarm/delAlarm'
        var data = {'alarmId': result.alarmId}
        self.$http.post(url, data).then(function(result) {
          console.log(result)
          if (result.data.flag) {
            self.$message({message: '删除成功', type: 'success'})
            self.getSoundListTrigger(singlePage) // 重新获取单一事件触发报警列表
          } else {
            self.$message({message: '删除失败', type: 'warning'})
          }
        }).catch(function(erro) {
          console.log(erro)
        })
      }).catch(() => {})
    },

    // ==================================分贝选择业务逻辑开始=========================
    // 分呗选择下拉框定义
    querySearch(queryString, cb) {
      var restaurants = this.restaurants
      // var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
      var results = restaurants
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    createFilter(queryString) {
      return (restaurant) => {
        return (restaurant.valueNum.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    // 获取选中后的分贝等级值
    handleSelect(item) { this.s_sound = item.valueNum }
    // ==================================分贝选择业务逻辑结束=========================
    // ========================================单一语音事件触发 结束====================================
  },
  beforeDestroy() {
    this.$eventBus.$off('updataPage') // 关闭兄弟组件之间传递信息时$on会多次触发的问题
  }
}
</script>

<style>
</style>
