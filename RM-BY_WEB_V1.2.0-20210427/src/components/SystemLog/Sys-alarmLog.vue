<!-- 报警日志 -->
<template>
  <div class="sys_alaParnet">
    <div class="smallTitle">报警日志</div>
    <div class="sys_alaParnetAfter">
       <div class="sys_alaPlus">
         <input class="sys_alaSearch" type="text" v-model="content" placeholder="请输入你想搜索的"/>
         <div class="sys_alaTime">
           <el-date-picker
             v-model="alaTime"
             type="daterange"
             unlink-panels
             @change="alaTimeSelect"
             range-separator="-"
             start-placeholder="开始日期"
             end-placeholder="结束日期"
             :picker-options="pickerOptions">
           </el-date-picker>
         </div>
         <div class="sys_alaType">
           <el-select v-model="alarmType" placeholder="请选择报警类型" clearable>
            <el-option v-for="item in alarmTypeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
           </el-select>
         </div>
         <div class="sys_alaCheck">
           <el-checkbox v-model="checked" @change="alaCheckChange">未处理</el-checkbox>
           <el-checkbox v-model="checked1" @change="alaCheckChange1">已处理</el-checkbox>
         </div>
         <button @click="getAlarmLog(1)"><span class="el-icon-search"></span> 搜索</button>
         <button class="sys_alaElec" @click="displayFilterOperation"><span class="el-icon-files"></span> 筛选处理</button>
         <button class="sys_alaElec" @click="displayBatchOperation"><span class="el-icon-files"></span> 批量操作</button>
         <button class="sys_alaElec" @click="exportExeclTip()"><span class="el-icon-download"></span> 导出Excel</button>
       </div>
       <div class="sys_alaTable">
         <el-table ref="table" :data="alarmList" style="width: 100%" row-key="alarmRcdId" @selection-change="selectionChanged">
           <!-- <el-table-column type="index" label="序号" width="80"></el-table-column> -->
           <el-table-column type="selection" :reserve-selection="true" width="80"></el-table-column>
           <el-table-column prop="room" label="报警房间"></el-table-column>
           <el-table-column prop="typeName" label="报警类型"></el-table-column>
           <el-table-column prop="handleStateName" label="处理情况"></el-table-column>
           <el-table-column prop="handleName" label="处理人"></el-table-column>
           <el-table-column prop="handleResult" label="处理结果"></el-table-column>
           <el-table-column prop="alarmContent" label="报警信息"></el-table-column>
           <el-table-column prop="alarmTimeStr" label="报警时间"></el-table-column>
         </el-table>
         <!-- 分页 -->
         <pagingComponentOther v-show="ala_totalPage>1"/>
       </div>
    </div>
    <!-- Excel导出类型选择 -->
    <el-dialog title="Excel文件类型选择" :visible.sync="dialogFormVisible" :modal-append-to-body="false" width="500px">
      <div class='exexlTipBoxPar'>
        <div class='exexlTipBox'>
          <i @click="changeExecl(1)"><span v-bind:class="execlNum ==1?'exexlSelect':''">&nbsp;</span></i><p>Excel2003版本及以前</p>
        </div>
        <div class='exexlTipBox'>
          <i @click="changeExecl(2)"><span v-bind:class="execlNum ==2?'exexlSelect':''">&nbsp;</span></i><p>Excel2007版本及以后</p>
        </div>
      </div>
      <p class='exTipTxt'>提示:请根据你电脑上的Excel版本，选择合适的版本下载，WPS请选择Execl2007版本及以后</p>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="exportExecl()">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 筛选处理 的编辑框-->
    <div class="editBox" v-if="showFilterOperation">
      <div class="editBoxAfter" style="width:500px;">
        <div class="editTitle"><p>筛选处理</p><span @click="showFilterOperation = false">×</span></div>
        <ul class="editMode">
          <li>
            <span class="sys_alaEditLi">报警类型：</span>
            <div class="editMM" style="width:270px;">
              <el-select v-model="filterOperationForm.alarmType" placeholder="请选择">
                <el-option v-for="item in alarmTypeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </div>
          </li>
          <li>
            <span class="sys_alaEditLi">时间范围：</span>
            <div class="editTime" style="width:270px;">
              <el-date-picker
                v-model="filterOperationForm.times"
                type="daterange"
                unlink-panels
                value-format="yyyy-MM-dd"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :picker-options="pickerOptions">
              </el-date-picker>
            </div>
          </li>
          <li>
            <span class="sys_alaEditLi">处理人：</span>
            <div class="editMM" style="width:270px;">
              <el-input v-model="filterOperationForm.handleName" placeholder="请输入处理人" autocomplete="off"></el-input>
            </div>
          </li>
          <li>
            <span class="sys_alaEditLi">处理结果：</span>
            <div class="editMM" style="width:270px;">
              <el-input v-model="filterOperationForm.handleResult" placeholder="请输入处理结果" autocomplete="off"></el-input>
            </div>
          </li>
        </ul>
        <div class="editBtn"><button @click="nullChecking()">确定</button> <button @click="showFilterOperation = false">取消</button></div>
      </div>
    </div>
    <!-- 批量操作 -->
    <div class="editBox" v-if="showBatchOperation">
      <div class="editBoxAfter" style="width:500px;">
        <div class="editTitle"><p>批量操作</p><span @click="showBatchOperation = false">×</span></div>
        <ul class="editMode">
          <li>
            <span class="sys_alaEditLi">处理人：</span>
            <div class="editMM" style="width:270px;">
              <el-input v-model="batchOperationForm.handleName" placeholder="请输入处理人" autocomplete="off"></el-input>
            </div>
          </li>
          <li>
            <span class="sys_alaEditLi">处理结果：</span>
            <div class="editMM" style="width:270px;">
              <el-input v-model="batchOperationForm.handleResult" placeholder="请输入处理结果" autocomplete="off"></el-input>
            </div>
          </li>
        </ul>
        <div class="editBtn"><button @click="batchOperation()">确定</button> <button @click="showBatchOperation = false">取消</button></div>
      </div>
    </div>
  </div>
</template>

<script>
// import Bus1 from "../../newObject/Bus.js";
import noMoreDataOther from '../publicComponemts/noMoreDataOther.vue'
import pagingComponentOther from '../publicComponemts/pagingComponentOther.vue'
var pageSize = 20
var page = 1
var loading = '' // 定义loading
var opt = {
  lock: true,
  text: '数据获取中...',
  spinner: 'el-icon-loading',
  customClass: 'loadingClass',
  background: 'rgba(0, 0, 0, 0.5)'
}
export default{
  name: 'Sys-alarmLog',
  components: {noMoreDataOther: noMoreDataOther, pagingComponentOther: pagingComponentOther},
  data() {
    return {
      content: '', // 定义搜搜框里的内容
      ala_totalPage: 1, // 定义总页数
      thisPages: 1, // 定义当前的页数
      alarmList: [], // 定义报警列表
      alaTime: '',
      startTime: '', // 开始时间
      endTime: '', // 结束时间
      alarmType: '', // 报警类型
      checked: '', // 已处理处理选择的结果
      checked1: '', // 未处理选择的结果
      checkedValue: '', // 定义列表类型0未处理 1已处理
      execlNum: 2, // 定义选中的Execl文件类型
      dialogFormVisible: false, // 定义Execl文件选择类型弹窗是否显示,
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      alarmTypeOptions: [
        { value: 0, label: '全部' },
        { value: 1, label: '违规喧闹' },
        { value: 2, label: '违规用电' },
        { value: 3, label: '违规逗留' },
        { value: 4, label: '漏电检测' },
        { value: 6, label: '违规开灯' },
        { value: 7, label: '电力控制箱故障' }
      ],
      showFilterOperation: false,
      showBatchOperation: false,
      filterOperationForm: {
        alarmType: '',
        handleName: '',
        handleResult: '',
        times: []
      },
      batchOperationForm: {
        alarmRcdList: [],
        handleName: '',
        handleResult: ''
      },
      selectedOptions: []
    }
  },
  created() {
    this.getAlarmLog(1)
  },
  mounted() {
    // 监听子组件 pagingComponent传过来的数据
    this.$eventBus.$on('updataOtherPage', this.updataOtherPage)
  },
  methods: {
    // 根据分页子组件返回的数据请求新的报警记录数据
    updataOtherPage: function(page) {
      this.getAlarmLog(page)
    },
    // 获取报警记录
    getAlarmLog: function(page) {
      var self = this
      loading = self.$loading(opt) // 打开请求loading
      var url = '/sdm/alarmrecord/getAlarmRecordList'
      var data = {pageNo: page, pageSize: pageSize, content: self.content, handleState: self.checkedValue, startTime: self.startTime, endTime: self.endTime}
      this.alarmType && (data.alarmType = this.alarmType)
      self.$http.post(url, data).then(function(result) {
        console.log(result)
        if (result.data.flag) {
          self.$eventBus.$emit('deviceListDataOtherReturn', result.data)
          if (result.data.dataList.length > 0) {
            for (var i = 0; i < result.data.dataList.length; i++) {
              var list = result.data.dataList[i]
              var type = ''
              if (list.alarmType == 1) {
                type = {typeName: '违规喧闹'}
              } else if (list.alarmType == 2) {
                type = {typeName: '违规用电'}
              } else if (list.alarmType == 3) {
                type = {typeName: '违规逗留'}
              } else if (list.alarmType == 4) {
                type = {typeName: '漏电检测'}
              } else if (list.alarmType == 7) {
                type = {typeName: '电力控制箱故障'}
              } else {
                type = {typeName: '违规开灯'}
              }
              Object.assign(list, type)
            }
            self.alarmList = result.data.dataList
          } else {
            self.alarmList = []
          }
          self.ala_totalPage = result.data.totalPage // 获取总共有多少页
          self.thisPages = result.data.page
          page = result.data.page // 获取当前页
        } else {
          self.alarmList = []
        }
        loading.close()
      }).catch(function(erro) {
        console.log(erro)
        loading.close()
      })
    },
    // 时间选择
    alaTimeSelect: function(data) {
      console.log(data)
      if (data !== null) {
        var newVal = this.GMTToStr(data[0]) + '00:00:00'
        var endVal = this.GMTToStr(data[1]) + '23:59:59'
        this.startTime = newVal; this.endTime = endVal
        this.getAlarmLog(1)
      } else {
        this.startTime = ''; this.endTime = ''; this.rankTime = ''
        this.getAlarmLog(1)
      }
    },
    // 将时间选择器选中的 格林威治时间格式 转化为普通格式YY-MM-DD
    GMTToStr: function(time) {
      let date = new Date(time)
      var month = date.getMonth() + 1
      if (month < 10) { month = '0' + month };
      var day = date.getDate()
      if (day < 10) { day = '0' + day };
      let Str = date.getFullYear() + '-' + month + '-' + day + ' '
      return Str
    },
    // 已处理
    alaCheckChange: function(state) {
      if (state) { this.checked1 = false; this.checkedValue = 0 } else { this.checkedValue = '' }
      this.getAlarmLog(1)
    },
    // 未处理
    alaCheckChange1: function(state) {
      if (state) { this.checked = false; this.checkedValue = 1 } else { this.checkedValue = '' }
      this.getAlarmLog(1)
    },
    selectionChanged(val) {
      this.selectedOptions = val
    },
    displayBatchOperation() {
      if (this.selectedOptions.filter(val => val.handleState === 0).length === 0) {
        return this.$message({message: '请勾选未处理的记录', type: 'warning'})
      }

      this.showBatchOperation = true
      this.batchOperationForm = {
        handleName: '',
        handleResult: '',
        alarmRcdList: []
      }
    },
    displayFilterOperation() {
      this.showFilterOperation = true
      this.filterOperationForm = {
        alarmType: '',
        handleName: '',
        handleResult: '',
        times: []
      }
    },
    // 导出提醒
    exportExeclTip: function() {
      this.dialogFormVisible = true
    },
    // Execl版本选择
    changeExecl: function(type) { this.execlNum = type },
    // 开始请求并下载Execl
    exportExecl: function() {
      var token = localStorage.getItem('token')
      var url = '/sdm/reportexport/peakAlarmLogExcel?content=' + this.content + '&startTime=' + this.startTime + '&endTime=' + this.endTime + '&type=' + this.execlNum + '&handleState=' + this.checkedValue + '&token=' + token
      this.alarmType && (url += `&alarmType=${this.alarmType}`)
      this.dataExport(url) // 通用数据 Execl导出请求
    },
    // 通用数据 Execl导出请求
    dataExport: function(url) {
      var self = this
      var opt = {
        lock: true, 
        text: 'Excel文件准备中...', 
        spinner: 'el-icon-loading', 
        customClass: 'h_loadingClass', 
        background: 'rgba(0, 0, 0, 0.5)' 
      }
      self.dialogFormVisible = false
      const loading = self.$loading(opt)
      setTimeout(function() {
        self.$http.get(url).then(function(result) {
          console.log(result)
          if (result.data.flag == undefined) {
            var fileName = '数据导出'
            var link = document.createElement('a')
            link.download = fileName
            link.style.display = 'none'
            link.href = self.$global.RequestUrl + url
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          } else {
            self.$message({message: result.data.msg, type: 'warning'})
          }
          loading.close()
        }).catch(function(erro) {
          self.dialogFormVisible = false
          loading.close()
          self.$message({message: erro.data.msg, type: 'warning'})
        })
      }, 1000)
    },
    // =====================================公用的历史数据导出Execl函数结束================================
    batchOperation() {
      if (this.batchOperationForm.handleName.length <= 0) { this.$message({message: '处理人不得为空', type: 'warning'}); return false }
      if (this.batchOperationForm.handleResult.length <= 0) { this.$message({message: '处理结果不得为空', type: 'warning'}); return false }

      let ids = this.selectedOptions.filter(val => val.handleState === 0).map(val => val.alarmRcdId)
      let url = '/sdm/alarmrecord/editAlarmRecordCheck'
      
      this.batchOperationForm.alarmRcdList = ids
      this.$http.post(url, this.batchOperationForm).then(res => {
        if (res.data.flag) {
          this.showBatchOperation = false
          this.$message({message: '操作成功', type: 'success'})
          this.getAlarmLog(1)
          this.$refs.table.clearSelection()
        } else {
          this.$message({message: res.data.msg, type: 'warning'})
        }
      }).catch(err => {
        console.log(err)
      })
    },
    /**
     * 批量操作确认，表单数据检查
     */
    nullChecking() {
      if (this.filterOperationForm.times.length !== 2) { this.$message({message: '时间段不能为空', type: 'warning'}); return false }
      if (this.filterOperationForm.handleName.length <= 0) { this.$message({message: '处理人不得为空', type: 'warning'}); return false }
      if (this.filterOperationForm.handleResult.length <= 0) { this.$message({message: '处理结果不得为空', type: 'warning'}); return false }
      
      this.postBatchOperation()
    },
    /**
     * 提交批量处理请求
     */
    postBatchOperation() {
      let url = '/sdm/alarmrecord/editAlarmRecordTime'
      let data = {
        startTime: this.filterOperationForm.times[0] + ' 00:00:00',
        endTime: this.filterOperationForm.times[1] + ' 23:59:59',
        handleName: this.filterOperationForm.handleName,
        handleResult: this.filterOperationForm.handleResult
      }
      this.filterOperationForm.alarmType && (data.alarmType = this.filterOperationForm.alarmType)
      
      this.$http.post(url, data).then(res => {
        if (res.data.flag) {
          this.showFilterOperation = false
          this.$message({message: '操作成功', type: 'success'})
          this.getAlarmLog(1)
        } else {
          this.$message({message: res.data.msg, type: 'warning'})
        }
      }).catch(err => {
        console.log(err)
      })
    }
  },
  beforeDestroy() {
    this.$eventBus.$off('updataOtherPage') // 关闭兄弟组件之间传递信息时$on会多次触发的问题
  }
}
</script>

<style>
  @import url("../../../static/css/SystemLog/Sys-alarmLog.css");
</style>
