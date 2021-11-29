<!-- 公共事件触发屏蔽 -->
<template>
  <div>
    <div class="man_alaParnetAfter">
       <div class="man_alaPlus"><p>公共事件触发屏蔽</p><button @click="addSoundThePolicePub()"><span class="el-icon-plus"></span> 添加</button></div>
       <el-table :data="soundList" style="width: 100%">
         <el-table-column prop="weekRange" label="重复"></el-table-column>
         <el-table-column prop="startEnd" label="检测时间" width="180"></el-table-column>
         <el-table-column prop="unitRange" label="应用范围"></el-table-column>
         <el-table-column label="操作" width="180">
           <template slot-scope="scope">
             <button class="man_alaEdit" @click="editSoundListPub(scope.$index, scope.row)"><span class="el-icon-edit"></span> 编辑</button>
             <button class="man_alaDel" @click="deleteSoundListPub(scope.$index, scope.row)"><span class="el-icon-delete"></span> 删除</button>
           </template>
         </el-table-column>
       </el-table>
       <pagingComponentOtherPub v-show="pub_totalPage>1"/>
    </div>

    <div class="editBox" v-if="Analysis">
      <div class="editBoxAfter" style="width:500px;">
        <div class="editTitle"><p>添加/编辑</p><span @click="openAndHidePub">×</span></div>
        <ul class="editMode">
          <li><span class="man_alaEditLi">检测时间：</span>
             <div class="editTime" style="width:250px;">
               <el-time-picker is-range arrow-control v-model="s_testing" value-format="HH:mm:ss" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" placeholder="选择时间范围"></el-time-picker>
             </div>
          </li>
          <li><span class="man_alaEditLi">重复：</span>
             <div class="editMM" style="width:250px;">
               <WeekSelecttion v-on:weekSelectChanged="weekSelectPub1" v-bind:weekSelectData="s_repeat"/>
             </div>
          </li>
          <li><span class="man_alaEditLi">应用范围：</span>
            <div class="editMM" style="width:250px;">
              <RegionSelection v-on:regionChanged="emergencyBroadPub3" v-bind:RegionSelectData="s_Application"/>
            </div>
          </li>
        </ul>
        <div class="editBtn"><button @click="nullCheckingPub()">确定</button> <button @click="openAndHidePub">取消</button></div>
      </div>
    </div>
  </div>
</template>

<script>
// import Bus from "../../newObject/Bus.js";
import WeekSelecttion from '../publicComponemts/WeekSelecttion.vue'
import RegionSelection from '../publicComponemts/RegionSelection.vue'
import pagingComponentOtherPub from '../publicComponemts/pagingComponentOther.vue'
var publicPage = 1
export default{
  name: 'Man-alarmRulesPublic',
  components: {WeekSelecttion: WeekSelecttion, RegionSelection: RegionSelection, pagingComponentOtherPub: pagingComponentOtherPub},
  props: ['scopeSelection'],
  data() {
    return {
      Analysis: false, // 定义分呗报警弹窗显示
      pub_totalPage: 1, // 定义总页数
      soundList: [], // 单一语音事件触发
      s_alarmId: '', // 定义单一语音事件触发id
      s_testing: [], // 监测时间
      s_repeat: '', // 重复
      s_Application: [] // 应用范围
    }
  },
  created() {
    this.getSoundListPublic(publicPage)
  },
  mounted() {
    // 监听子组件 pagingComponent传过来的数据
    this.$eventBus.$on('updataOtherPage', this.updataPublicPage)
  },
  methods: {
    // =========================================单一语音事件触发 开始================================
    // 根据分页子组件返回的数据请求新的报警记录数据
    updataPublicPage: function(page) {
      this.getSoundListPublic(page)
    },
    // 分呗报警智能分析添加,编辑弹窗
    openAndHidePub: function() {
      if (this.Analysis) { this.Analysis = false } else { this.Analysis = true }
    },
    // 重复日期选择
    weekSelectPub1: function(data) {
      this.s_repeat = data
    },
    // 选择应用范围(分呗报警智能分析添加模块)
    emergencyBroadPub3: function(data) {
      this.s_Application = data
    },
    // 获取分呗条件列表
    getSoundListPublic: function(page) {
      var self = this
      var url = '/sdm/alarm/getAlarmList'
      var data = {'pageNo': page, 'pageSize': 15, 'alarmType': 5}
      self.$http.post(url, data).then(function(result) {
        console.log(result)
        if (result.data.flag) {
          self.$eventBus.$emit('deviceListDataOtherReturn', result.data)
          self.pub_totalPage = result.data.totalPage // 获取总共有多少页
          publicPage = result.data.page // 获取当前页
          var dataList = result.data.dataList
          if (dataList.length > 0) {
            for (var i = 0; i < dataList.length; i++) {
              var startEnd = {'startEnd': ''}
              startEnd.startEnd = dataList[i].startTime + '~' + dataList[i].endTime
              Object.assign(dataList[i], startEnd)
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
    nullCheckingPub: function() {
      if (this.s_testing == '') { this.$message({message: '分呗检测时间不得为空', type: 'warning'}); return false }
      if (this.s_repeat == '') { this.$message({message: '重复时间不得为空', type: 'warning'}); return false }
      if (this.s_Application == '') { this.$message({message: '范围选择不得为空', type: 'warning'}); return false }
      this.raiseThePricePub()
    },
    // 分呗编辑框 清空处理
    clearEditPutPub: function() {
      this.s_alarmId = '' // 情况id
      this.s_testing = '' // 检测时间
      this.s_repeat = '' // 重复
      this.s_Application = '' // 范围
    },
    // 添加新的分呗报警方案
    addSoundThePolicePub: function() {
      this.openAndHidePub()
      this.clearEditPutPub()
    },
    // 保存分呗编辑框内的数据
    raiseThePricePub: function() {
      var self = this
      var url = '/sdm/alarm/editAlarm'
      var unitData = []
      var unitCodeData = []
      var unitList = self.s_Application
      if (self.scopeSelection.length > 0) {
        self.scopeSelection.forEach(function(arr, index) {
          var code = arr.value
          unitList.forEach(function(dat, index) {
            if (code == dat) { unitData.push(arr.label); unitCodeData.push(arr.value) }
          })
        })
      }
      // alarmId分呗报警,alarmType"1/2/3/5"分贝/功率/人体/屏蔽,value分呗值,startTime开始检测时间,
      // endTime结束检测时间,radioType:1/2 系统铃声/自定义语音,weekData重复周期,unitData使用范围选择,unitCodeData使用范围的编号
      var data = {
        'alarmId': self.s_alarmId,
        'alarmType': 5,
        'startTime': self.s_testing[0],
        'endTime': self.s_testing[1],
        'weekData': self.s_repeat,
        'unitData': unitData,
        'unitCodeData': unitCodeData
      }
      self.$http.post(url, data).then(function(result) {
        console.log(result)
        if (result.data.flag) {
          self.$message({message: '添加成功', type: 'success'})
          self.getSoundListPublic(publicPage) // 重新获取单一事件触发报警列表
        } else {
          self.$message({message: result.data.msg, type: 'warning'})
        }
        self.openAndHidePub() // 关闭编辑窗口
      }).catch(function(erro) {
        console.log(erro)
      })
    },
    // 编辑分呗列表
    editSoundListPub: function(index, result) {
      var self = this
      self.openAndHidePub() // 打开弹窗
      var time = result.startTime + ',' + result.endTime
      self.s_alarmId = result.alarmId // 分呗单一报警id
      self.s_testing = time.split(',')
      self.s_repeat = result.weekData
      self.s_Application = result.unitCodeData
    },
    // 删除 分贝单一报警触发列表
    deleteSoundListPub: function(index, result) {
      var self = this
      self.$confirm('是否删除这条任务?', '提示', {confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      }).then(() => {
        var url = 'sdm/alarm/delAlarm'
        var data = {'alarmId': result.alarmId}
        self.$http.post(url, data).then(function(result) {
          console.log(result)
          if (result.data.flag) {
            self.$message({message: '删除成功', type: 'success'})
            self.getSoundListPublic(publicPage) // 重新获取单一事件触发报警列表
          } else {
            self.$message({message: '删除失败', type: 'warning'})
          }
        }).catch(function(erro) {
          console.log(erro)
        })
      }).catch(() => {})
    }
    // ========================================单一语音事件触发 结束====================================
  },
  beforeDestroy() {
    this.$eventBus.$off('updataOtherPage') // 关闭兄弟组件之间传递信息时$on会多次触发的问题
  }
}
</script>

<style>
</style>
