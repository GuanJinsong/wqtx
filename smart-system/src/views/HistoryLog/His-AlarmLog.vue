<!-- 报警记录 -->
<template>
  <div class="his_alBox">
    <div class="his_alHead">
      <div class="his_alHeadAfter">
        <div class="his_alSelectPut">
          <div class="editMM" style="width:150px">
            <el-input v-model="districtOrPrison" clearable placeholder="输入监区或监室"></el-input>
          </div>
          <div class="editMM" style="width:130px;margin-left:15px">
            <el-select v-model="alarmType" clearable placeholder="告警类型选择">
              <el-option v-for="item in optionsAlarm" :key="item.value"
              :label="item.label" :value="item.value"></el-option>
            </el-select>
          </div>
          <div class="editMM" style="width:130px;margin-left:15px;">
            <el-select v-model="resultType" clearable placeholder="处理结果选择">
              <el-option v-for="item in optionsResult" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </div>
          <div class="editMM" style="margin:0 15px">
            <el-date-picker class="date_picker" size="mini" v-model="date" value-format="yyyy-MM-dd" type="daterange" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" />
          </div>
          <button class="his_alSelectBtn" @click="searchAlarmLog(1)">查询</button>
        </div>
      </div>
      <button class="his_alPrintingBtn" @click="excelExport()"><span class="el-icon-printer"></span><i>Excel导出</i></button>
    </div>
    <div class="his_alTableBox">
      <div class="sys_TaskTableParent dev_ManRight" style="overflow-y:auto;">
         <el-table :data="prisonList" style="width: 100%">
           <el-table-column align="center" type="index" label="序号" min-width="3"></el-table-column>
           <el-table-column align="center" prop="prisonName" label="房间" min-width="4"></el-table-column>
           <el-table-column align="center" prop="prisonDistrictName" label="所属监区" min-width="4"></el-table-column>
           <el-table-column align="center" prop="equipmentTypeName" label="告警设备"  min-width="3"></el-table-column>
           <el-table-column align="center" prop="equipmentIp" label="IP" min-width="6"></el-table-column>
           <el-table-column align="center" prop="typeName" label="告警类型"  min-width="4"></el-table-column>
           <el-table-column align="center" prop="message" label="告警信息" min-width="9"></el-table-column>
           <el-table-column align="center" prop="causeOfFailure" label="告警原因" min-width="9"></el-table-column>
           <el-table-column align="center" prop="stateName" label="处理结果"  min-width="4"></el-table-column>
           <el-table-column align="center" prop="updateBy" label="处理人"  min-width="3"></el-table-column>
           <el-table-column align="center" prop="createTime" label="告警时间" min-width="7"></el-table-column>
         </el-table>
         <!-- 分页 -->
         <pagingComponent/>
      </div>
    </div>
  </div>
</template>

<script>
  var opt = {
      lock: true,text: '加载中...',spinner: 'el-icon-loading',
      customClass:'loadingClass', background: 'rgba(0, 0, 0, 0.5)',
  }
  import pagingComponent from "../../components/publicComponemts/pagingComponent.vue"
  export default{
    name:"His-AlarmLog",
    components:{pagingComponent:pagingComponent},
    data(){
      return{
        districtOrPrison: "",
        areaType:"",   //监区选中值
        alarmType:"",   //告警类型值
        optionsAlarm:[
          {value: 1,label: '线路故障'}, 
          {value: 2,label: '电流异常'}, 
          {value: 3,label: '电压异常'}, 
          {value: 4,label: '温度异常'}, 
          {value: 5,label: '电源异常'}, 
          {value: 6,label: '设备掉线'}
        ],
        resultType: "",
        optionsResult:[{value:1,label:'已处理'}, {value:2,label: '未处理'}],
        date: [],
        prisonList:[], //监区选择下拉框数据
        nowPage:1,   //当前选中的分页
      }
    },
    created() {
      this.searchAlarmLog(1);
    },
    mounted() {
      //监听子组件 pagingComponent传过来的数据
      this.$eventBus.$on("updataPage",this.updataPages);
    },
    methods:{
      //根据分页子组件返回的数据请求新的报警记录数据
      updataPages:function(page){
        this.nowPage = page;
        this.searchAlarmLog(page);
      },      
      // 告警数据查询
      searchAlarmLog:function(page){
        let self = this;
        let url = "/sup/eventInfo/queryAll";
        let data = {
          current:page,
          size:20,
        };
        if (self.districtOrPrison) data.content = self.districtOrPrison;
        if (self.alarmType) data.type = self.alarmType;
        if (self.resultType) data.state = self.resultType - 1;
        if (self.date && self.date.length == 2) {
          data.startTime = self.date[0] + " 00:00:00"
          data.endTime = self.date[1] + " 23:59:59"
        }
        console.log(data)
        const loading = self.$loading(opt);
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.$eventBus.$emit('deviceListDataReturn',result.data.data);  //向分页组件传递分页数据
            let list = result.data.data.records;
            for(let i=0;i<list.length;i++){
              let newWord = {stateName:"",equipmentTypeName:"",typeName:""}
              newWord.stateName = list[i].state==1?"未处理":"已处理";
              newWord.equipmentTypeName = list[i].equipmentType==1?"强电":"弱电";
              if(list[i].type==1){
                newWord.typeName = "线路故障";
              }else if(list[i].type==2){
                newWord.typeName = "电流异常";
              }else if(list[i].type==3){
                newWord.typeName = "电压异常";
              }else if(list[i].type==4){
                newWord.typeName = "温度异常";
              }else if(list[i].type==5){
                newWord.typeName = "电源异常";
              }else if(list[i].type==6){
                newWord.typeName = "设备掉线";
              }
              Object.assign(list[i],newWord);
            }
            self.prisonList = list;
            loading.close();
          }else{
            self.prisonList = [];loading.close();
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
          self.prisonList = [];loading.close();
          self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      // Execl文件导出
      excelExport:function(){
        let self = this;
        let url = "/sup/eventInfo/export?token="+localStorage.getItem('token');
        if (self.districtOrPrison) {
          url += `&content=${self.districtOrPrison}`;
        }
        if (self.alarmType) {
          url += `&type=${self.alarmType}`;
        }
        if (self.resultType) {
          url += `&state=${self.resultType - 1}`;
        }
        if (self.date && self.date.length == 2) {
          url += `&startTime=${self.date[0]} 00:00:00&endTime=${self.date[1]} 23:59:59`
        }
        this.dataExport(url);    //通用数据 Execl导出请求
      },
      //通用数据 Execl导出请求
      dataExport:function(url){
        let self = this;
        let opts = {lock: true,text: 'Excel文件准备中...',spinner: 'el-icon-loading',customClass:'loadingClass',background: 'rgba(0, 0, 0, 0.5)',}
        const loadings = self.$loading(opts);
        setTimeout(function(){
          self.$http.get(url).then(function(result){
            console.log(result);
            if(result.data.flag == undefined){
              let fileName = "数据导出"
              let link = document.createElement("a");
              link.download = fileName;
              link.style.display = "none";
              link.href = self.$global.RequestUrl+url;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }else{
              self.$message({message: result.data.msg,type: 'warning'});
            }
            loadings.close();
          }).catch(function(erro){
            loadings.close();
            self.$message({message: erro.data.msg,type: 'warning'});
          })
        },500)
      }
    },
    beforeDestroy() {
    	this.$eventBus.$off('updataPage');  //关闭兄弟组件之间传递信息时$on会多次触发的问题
    }
  }
</script>

<style>
  @import url("../../../static/css/HistoryLog/His-AlarmLog.css");
</style>
