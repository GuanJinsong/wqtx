<!-- 任务设置 -->
<template>
  <div class="sys_taskParent">
    <div class="sys_taskSearchBox">
      <div class="sys_taskSelectput">
        <input type="text" v-model="searchWord" class="sys_taskSearch" placeholder="请输入任务名称..." />
      </div>
      <div class="sys_taskSelectput editMM">
        <el-select v-model="value1" multiple collapse-tags placeholder="分组选择">
          <el-option v-for="item in optionsgroup" :key="item.planId" :label="item.name" :value="item.planId">
          </el-option>
        </el-select>
      </div>
      <button @click="getTaskList(1)">查询</button>
      <button @click="addNewTask()">添加</button>
    </div>
    <div class="sys_TaskTableParent dev_ManRight">
       <el-table :data="taskList" style="width: 100%">
         <el-table-column type="index" label="序号" width="70"></el-table-column>
         <el-table-column prop="taskName" label="任务名称"></el-table-column>
         <el-table-column prop="prisonNamegat" label="执行范围" :show-overflow-tooltip="true"></el-table-column>
         <el-table-column prop="planSettingName" label="设备组别"></el-table-column>
         <el-table-column prop="taskTime" label="执行时间"></el-table-column>
         <el-table-column prop="weekRange" label="频率"></el-table-column>
         <el-table-column label="状态">
           <template slot-scope="scope">
             <span class="ts_on" v-if="scope.row.state==1">开启</span>
             <span class="ts_off" v-else>关闭</span>
           </template>
         </el-table-column>
         <el-table-column prop="represent" label="任务描述"></el-table-column>
         <el-table-column  label="操作" width="90">
           <template slot-scope="scope">
             <span class="Edit el-icon-edit-outline" title="编辑" @click="editTaskList(scope.row)"></span>
             <span class="Del el-icon-delete" title="删除" @click="deleteTaskList(scope.row)"></span>
           </template>
         </el-table-column>
       </el-table>
       <!-- 分页 -->
       <pagingComponent/>
    </div>

    <!-- 任务设置弹窗 -->
    <div class="poupParnet" v-if="alarmListPup">
    	<div class="poupParnetAfter" style="width:500px;">
    		<div class="poupTitle"><div class="poupTitleAfter"><h6>添加/编辑任务</h6><span @click="alarmListPup=false">×</span></div></div>
    		<div class="pubCenter">
          <ul class="ts_poupUl">
            <li><span class="ts_smallTitle">任务名称：</span>
              <div class="ts_Put">
                <input type="text" class="sys_taskPut" v-model="taskName" placeholder="任务名称" />
              </div>
            </li>
            <li><span class="ts_smallTitle">执行范围：</span>
              <div class="ts_Put">
                <div class="editMM">
                  <el-select v-model="ts_Range" @change="optionsRangeSelect" multiple collapse-tags placeholder="执行范围选择">
                    <el-option v-for="item in optionsRange"
                    :key="item.prisonId" :label="item.prisonName" :value="item.prisonId">
                    </el-option>
                  </el-select>
                </div>
              </div>
            </li>
            <li><span class="ts_smallTitle">设备组别：</span>
              <div class="ts_Put">
                <div class="editMM">
                  <el-select v-model="ts_group" @change="optionsgroupSelect" placeholder="设备组别选择">
                    <el-option v-for="item in optionsgroup" :key="item.planId" :label="item.name" :value="item.planId">
                    </el-option>
                  </el-select>
                </div>
              </div>
            </li>
            <li><span class="ts_smallTitle">执行时间：</span>
              <div class="ts_Put1">
                <div class="ts_PutPickOne editTime" style="width:135px;"><el-time-picker  arrow-control
                     v-model="pickerValue" value-format="HH:mm:ss" placeholder="请选择时间">
                     </el-time-picker>
                </div>
                <div class="ts_PutPickTow">
                  <i>频率：</i>
                  <div class="editMM" style="width:150px;">
                    <WeekSelecttion v-on:weekSelectChanged="weekSelect1" v-bind:weekSelectData="ts_frequency"/>
                  </div>
                </div>
              </div>
            </li>
            <li><span class="ts_smallTitle">执行操作：</span>
              <div class="ts_Put" style="padding-top:3px;">
                <el-switch
                  v-model="ts_Putvalue" active-color="#0b9fc7" inactive-color="#5a5a5a"
                  active-text="开启" inactive-text="关闭">
                </el-switch>
              </div>
            </li>
            <li><span class="ts_smallTitle">任务描述：</span>
              <div class="ts_Put">
                <textarea v-model="ts_putTxt" placeholder="请输入你的描述..."></textarea>
              </div>
            </li>
          </ul>
        </div>
    		<div class="poupSure">
    			<button @click="alarmListPup=false">取消</button>
    			<button @click="saveTaskInfo()">确认</button>
    		</div>
    	</div>
    </div>
  </div>
</template>

<script>
  import pagingComponent from "../../components/publicComponemts/pagingComponent.vue"
  import WeekSelecttion from "../../components/publicComponemts/WeekSelecttion.vue"
  export default{
    name:"Sys-TaskSetting",
    components:{pagingComponent:pagingComponent,WeekSelecttion:WeekSelecttion},
    data(){
      return{
        alarmListPup:false,    //监室类型编辑弹窗
        searchWord: '',    //搜索框输入的关键词
        value1: '',    //搜素输入框旁边的范围选择后的值
        taskList:[],   //任务列表
        taskId:"",     //当前正在编辑的任务id
        taskName:"",   //编辑弹窗内的 任务名称
        ts_Range:[],    //编辑弹窗内的 执行范围选中值(监室id)
        ts_RangeName:[],  //选中的监室名称
        ts_PrisonArea:[],  //ts_RangeName监室对应的所属监区名称值
        optionsRange:[],  //编辑弹窗内的 执行范围可选值(监室可选值)
        ts_group:"",      //编辑弹窗内的 设备组别
        ts_groupName:'',  //选中的预案名称
        optionsgroup:[],
        ts_frequency:"1",     //编辑弹窗内的 频率
        pickerValue:"",      //编辑弹窗内的 执行时间
        ts_Putvalue:false,   //编辑弹窗内的 执行操作
        ts_putTxt:"",        //编辑弹窗内的 任务描述
        nowPage:1,     //定义当前选中的分页
      }
    },
    created() {
      this.getPrisonGroupList();  //获取分组数据
      this.getPrisonList();  //获取监区数据
      this.getTaskList(1);  //获取任务列表
    },
    mounted() {
      //监听子组件 pagingComponent传过来的数据
      this.$eventBus.$on("updataPage",this.updataPages);
    },
    methods:{
      //根据分页子组件返回的数据请求新的报警记录数据
      updataPages:function(page){
        this.nowPage = page;
        this.getTaskList(page);
      },
      //重复日期选择
      weekSelect1:function(data){
        this.ts_frequency = data;
      },
      //点击添加任务弹窗内的 “设备组别”选择
      optionsgroupSelect:function(data){
        for(var i=0;i<this.optionsgroup.length;i++){
          if(data ==this.optionsgroup[i].planId){this.ts_groupName = this.optionsgroup[i].name}
        }
      },
      //点击添加任务弹窗内的 “执行范围选择”
      optionsRangeSelect:function(data){
        var ts_Name = []; var areaList = [];
        for(var n=0;n<data.length;n++){
          for(var i=0;i<this.optionsRange.length;i++){
             if(data[n] == this.optionsRange[i].prisonId){
               ts_Name.push(this.optionsRange[i].prisonName);   //收集监室名称
               areaList.push(this.optionsRange[i].prisonDistrictName);  //收集监区名称
             }
          }
        }
        //去重，上面得到的数组areaList肯能存在重复值
        var hash=[];
        for (var i = 0; i < areaList.length; i++) {
           if(hash.indexOf(areaList[i])==-1){hash.push(areaList[i]);}
        }
        this.ts_RangeName = ts_Name;
        this.ts_PrisonArea = hash;  //监室所属监区最终值
      },
      //监室类型编辑弹窗开启/关闭
      openPopup:function(){
        var self = this;
        if(self.alarmListPup){self.alarmListPup = false;}else{self.alarmListPup = true;}
      },
      //获取分组数据(任务范围数据)
      getPrisonGroupList:function(){
        var self = this;
        var url = "/sup/plansetting/query";
        var data = {reservedFields1:1};
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            if(result.data.data.length>0){
               self.optionsgroup = result.data.data;
            }else{self.optionsgroup =[];}
          }else{
            self.optionsgroup =[];
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
          self.optionsgroup =[]; self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      //获取监区数据,这里的下拉框不能使用监区名称要是用监区下的监室信息
      //所以这里会循环监区取出监区下的监室信息
      getPrisonList:function(){
        var self = this;
        var url = "/sup/prisonDistrict/queryComboBox";var data = "";
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            if(result.data.data.length>0){
              var list = result.data.data;
              var newArry = [];
              for(var i=0;i<list.length;i++){
                if(list[i].prisonDistrictId !== null){
                  var smallList = list[i].prisons;
                  for(var n=0;n<smallList.length;n++){
                    var lit = {
                      prisonName:list[i].prisonDistrictName+"-"+smallList[n].prisonName,
                      prisonId:smallList[n].prisonId,
                      prisonDistrictName:list[i].prisonDistrictName,
                    }
                    newArry.push(lit);
                  }
                }
              }
              newArry.unshift({
                prisonName: '全部',
                prisonId: 0,
                prisonDistrictName: ''
              })
              self.optionsRange = newArry;
            }else{self.optionsRange =[];}
          }else{
            self.optionsRange =[];
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
          self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      //获取所有的任务列表
      getTaskList:function(page){
        var self = this;
        var url = "/sup/taskmanagement/query";
        var data = {current:page,size:"20",taskName:self.searchWord,
          planSettingName:"",startTime:"",endTime:""};
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.$eventBus.$emit('deviceListDataReturn',result.data.data);  //向分页组件传递分页数据
            if(result.data.data.records.length>0){
              let list = result.data.data.records;
              for(let i=0;i<list.length;i++){
                let roomList = list[i].prisonName.split(",");
                let [_name,_samll] = ['',''];
                for(let m=0;m<roomList.length;m++){
                  let _room = roomList[m].split("-");
                  if(_samll !== _room[0]){
                    _name = _name+_room[0]+":"+_room[1]+",";
                    _samll = _room[0];
                  }else{
                    _name = _name+_room[1]+","
                  }
                }
                Object.assign(list[i],{prisonNamegat:_name});
              }
              self.taskList = result.data.data.records;
            }else{self.taskList = [];}
          }else{
            self.taskList = [];
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
          self.taskList = [];self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      //保存创建/编辑的任务(保存任务弹窗里编辑的任务数据)
      saveTaskInfo:function(){
        var self = this;
        if(self.taskName==""){self.$message({message:"任务名称不得为空！",type:'warning'});return false;}
        if(self.ts_group==""){self.$message({message:"设备组别不得为空！",type:'warning'});return false;}
        if(self.ts_Range==""){self.$message({message:"执行范围不得为空！",type:'warning'});return false;}
        if(self.pickerValue==""){self.$message({message:"执行时间不得为空！",type:'warning'});return false;}
        if(self.ts_frequency==""){self.$message({message:"频率不得为空！",type:'warning'});return false;}
        var url = ""; var data = "";
        //taskName任务名称,planSettingId预案(分组)id,planSettingName预案（分组）名称，taskTime任务创建时间
        //prisonId监室id,prisonName监室名称，weekRange任务频率，state开启/关闭，prisonDistrictName监区名
        var dataInfo = {
          taskName:self.taskName,
          planSettingId:self.ts_group,
          planSettingName:self.ts_groupName,
          taskTime:self.pickerValue,
          prisonId:self.ts_Range.toString(),
          prisonName:self.ts_RangeName.toString(),
          weekRange:self.ts_frequency.toString(),
          state:self.ts_Putvalue==false?0:1,
          prisonDistrictName:self.ts_PrisonArea.toString(),
          represent:self.ts_putTxt
        };
        // 如果选中的执行范围包含0，即全选
        if (this.ts_Range.findIndex(val => val === 0) !== -1) {
          dataInfo.prisonId = this.optionsRange.filter(val => val.prisonId > 0).map(val => val.prisonId).toString()
          dataInfo.prisonName = this.optionsRange.filter(val => val.prisonId > 0).map(val => val.prisonName).toString()
          debugger
        }
        if(self.taskId !== ""){
          url = "/sup/taskmanagement/update";
          data = Object.assign(dataInfo,{taskId:self.taskId})
        }else{
          url = "/sup/taskmanagement/add";
          data = dataInfo;
        }
        console.log(data);
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.$message({message:'操作成功！',type: 'success'});
            self.getTaskList(self.nowPage);   //重新获取任务列表
          }else{
            self.$message({message:result.data.msg,type:'warning'});
          }
          self.alarmListPup = false;   //关闭弹窗
        }).catch(function(erro){
          self.$message.error(erro.data.msg); self.alarmListPup = false;   //关闭弹窗
          console.log(erro)
        })
      },
      //新添加任务时，清空弹窗内之前可能存在的数据
      addNewTask:function(){
        this.taskId = "";   //任务id
        this.taskName="";   //编辑弹窗内的 任务名称
        this.ts_Range=[];    //编辑弹窗内的 执行范围选中值(监室id)
        this.ts_RangeName=[];  //选中的监室名称
        this.ts_PrisonArea="";  //ts_RangeName监室对应的所属监区名称值
        this.ts_group="";      //编辑弹窗内的 设备组别
        this.ts_groupName="";  //选中的预案名称
        this.ts_frequency=[];     //编辑弹窗内的 频率
        this.pickerValue="";      //编辑弹窗内的 执行时间
        this.ts_Putvalue=false;   //编辑弹窗内的 执行操作
        this.ts_putTxt="";        //编辑弹窗内的 任务描述
        this.alarmListPup = true;   //打开编辑窗口
      },
      //编辑任务
      editTaskList:function(res){
        console.log(res);
        var ids = res.prisonId.split(",")
        this.taskId = res.taskId;   //任务id
        this.taskName=res.taskName;   //编辑弹窗内的 任务名称
        this.ts_Range=ids.map(Number);    //编辑弹窗内的 执行范围选中值(监室id),将数组内的string转number
        this.ts_RangeName=res.prisonName.split(",");  //选中的监室名称
        this.ts_PrisonArea=res.prisonDistrictName;  //ts_RangeName监室对应的所属监区名称值
        this.ts_group=res.planSettingId;      //编辑弹窗内的 设备组别
        this.ts_groupName=res.planSettingName;  //选中的预案名称
        this.ts_frequency=res.weekRange.split(",");     //编辑弹窗内的 频率
        this.pickerValue=res.taskTime;      //编辑弹窗内的 执行时间
        this.ts_Putvalue=res.state==0?false:true;   //编辑弹窗内的 执行操作
        this.ts_putTxt=res.represent;        //编辑弹窗内的 任务描述
        this.alarmListPup = true;   //打开编辑窗口
      },
      //删除任务
      deleteTaskList:function(res){
        var self = this;
        self.$confirm('是否删除 '+res.taskName+' 这条任务?', '删除提示', {confirmButtonText: '确定',cancelButtonText: '取消',type: 'warning'
          }).then(() => {
          var url = "/sup/taskmanagement/delete";
          var data = {taskId:res.taskId};
          self.$http.post(url,data).then(function(result){
            console.log(result)
            if(result.data.flag){
              self.$message({message:'操作成功！',type: 'success'});
              self.getTaskList(self.nowPage);   //重新获取任务列表
            }else{
              self.$message({message:result.data.msg,type:'warning'});
            }
          }).catch(function(erro){
            self.$message.error(erro.data.msg);
            console.log(erro)
          })
        }).catch(() => {});
      }
    },
    beforeDestroy() {
    	this.$eventBus.$off('updataPage');  //关闭兄弟组件之间传递信息时$on会多次触发的问题
    }
  }
</script>

<style>
  @import url("../../../static/css/SystemSettings/Sys-TaskSetting.css");

  .el-tooltip__popper{
    max-width: 45%;
  }
</style>
