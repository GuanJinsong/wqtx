<!-- 操作记录 -->
<template>
  <div class="his_alBox">
    <div class="his_alHead">
      <div class="his_alHeadAfter">
        <div class="his_alSelectPut">
          <div class="editMM" style="width:150px;">
            <el-input v-model="districtOrPrison" clearable placeholder="输入监区或监室"></el-input>
          </div>
          <div class="editMM" v-if="currentUserRel == 1" style="width:130px;margin-left:15px;">
            <el-select v-model="userType" clearable placeholder="用户选择">
              <el-option v-for="item in optionsuser" :key="item.userId" :label="item.userName" :value="item.userName"></el-option>
            </el-select>
          </div>
          <div class="editMM" style="width:130px;margin-left:15px;">
            <el-select v-model="operationType" clearable placeholder="操作类型选择">
              <el-option v-for="item in optionsoperat" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </div>
          <div class="editMM" style="margin:0 15px">
            <el-date-picker class="date_picker" size="mini" v-model="date" value-format="yyyy-MM-dd" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
          </div>
          <button class="his_alSelectBtn" @click="getUserOperation(1)">查询</button>
        </div>
      </div>
      <button class="his_alPrintingBtn" @click="excelExport()"><span class="el-icon-printer"></span><i>Excel导出</i></button>
    </div>
    <div class="his_alTableBox">
      <div class="sys_TaskTableParent dev_ManRight" style="overflow-y:auto;">
         <el-table :data="operationList" style="width: 100%">
           <el-table-column align="center" type="index" label="序号" min-width="1"></el-table-column>
           <el-table-column align="center" prop="createBy" label="操作用户" min-width="1"></el-table-column>
           <el-table-column align="center" prop="address" label="作用监区" min-width="1"></el-table-column>
           <el-table-column align="center" prop="prisonName" label="作用监室" min-width="1"></el-table-column>
           <el-table-column align="center" prop="message" label="操作描述" min-width="2"></el-table-column>
           <el-table-column align="center" prop="createTime" label="操作时间" min-width="2"></el-table-column>
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
        currentUserRel: localStorage.getItem("rel"),
        districtOrPrison:"",
        areaType:"",   //监区选中值
        optionsArea:[],
        roomType:"",   //监室选中值
        optionsRoom:[],
        userType:"",   //用户类型值
        optionsuser:[],
        operationType:"",   //操作类型值
        optionsoperat:[{value:1,label:'监室操作'},{value:2,label:'配置设置'},{value:3,label:'任务设置'},{value:4,label:'其他'}],
        date: [],
        operationList:[],  //操作日志列表
        nowPage:1,
      }
    },
    created() {
      this.getAllArea();   //获取所有监区
      this.getAllRoom();   //获取所有监室
      this.getUserList();  //获取用户列表
      this.getUserOperation(1);  //获取操作日志列表
    },
    mounted() {
      //监听子组件 pagingComponent传过来的数据
      this.$eventBus.$on("updataPage",this.updataPages);
    },
    methods:{
      //根据分页子组件返回的数据请求新的报警记录数据
      updataPages:function(page){
        this.nowPage = page;
        this.getUserOperation(page);
      },
      //获取所有的监区
      getAllArea:function(){
        let self = this;
        let [url,data] = ['/sup/prisonDistrict/query',''];
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.optionsArea = result.data.data;
          }else{
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
          self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      //获取所有的监室
      getAllRoom:function(){
        let self = this;
        let [url,data] = ['/sup/prisonDistrict/queryPrison',{prisonDistrictId:""}]; //监区prisonDistrictId传空表示查所有监室
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.optionsRoom = result.data.data;
          }else{
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
          self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      //获取用户列表
      getUserList:function(){
        let self = this;
        let [url,data] = ['/sup/user/queryCheck',{current:1,size:100}];
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.optionsuser = result.data.data;
          }else{
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
          self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      //获取用户操作日志记录
      getUserOperation:function(page){
        let self = this;
        let [url,data] = ['/sup/log/query',{"content":self.districtOrPrison,"type":self.operationType,"createBy":self.userType,current:page,size:20}];
        if (self.date && self.date.length == 2) {
          data.startTime = self.date[0] + " 00:00:00";
          data.endTime = self.date[1] + " 23:59:59";
        }
        const loading = self.$loading(opt);
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.$eventBus.$emit('deviceListDataReturn',result.data.data);  //向分页组件传递分页数据
            self.operationList = result.data.data.records;
            loading.close();
          }else{
            self.operationList = [];loading.close();
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
          self.operationList = [];loading.close();
          self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      // Execl文件导出
      excelExport:function(){
       let self = this;
       let u_name = self.userType;
       let url = "/sup/log/export?token="+localStorage.getItem('token');
       let opts = {lock: true,text: 'Excel文件准备中...',spinner: 'el-icon-loading',customClass:'loadingClass',background: 'rgba(0, 0, 0, 0.5)',}
       if (self.districtOrPrison) {
         url += `&content=${self.districtOrPrison}`;
       }
       if (u_name) {
         url += `&createBy=${u_name}`;
       }
       if (self.operationType) {
         url += `&type=${self.operationType}`
       }
       if (self.date && self.date.length == 2) {
         url += `&startTime=${self.date[0]} 00:00:00&endTime=${self.date[1]} 23:59:59`
       }
       
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
      },
    },
    beforeDestroy() {
    	this.$eventBus.$off('updataPage');  //关闭兄弟组件之间传递信息时$on会多次触发的问题
    }
  }
</script>

<style>
  @import url("../../../static/css/HistoryLog/His-AlarmLog.css");
</style>
