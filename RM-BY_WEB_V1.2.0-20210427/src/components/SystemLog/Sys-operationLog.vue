<!-- 操作日志 -->
<template>
  <div class="sys_alaParnet">
    <div class="smallTitle">操作日志</div>
    <div class="sys_alaParnetAfter">
       <div class="sys_alaPlus">
         <input class="sys_alaSearch" type="text" v-model="content" placeholder="请输入你想搜索的" style="margin-right:10px;"/>
         <button @click="getOperationLog(1)"><span class="el-icon-search"></span> 搜索</button>
       </div>
       <div class="sys_alaTable">
         <el-table :data="operaList" style="width: 100%">
           <el-table-column type="index" label="序号" width="80"></el-table-column>
           <el-table-column prop="userName" label="操作用户" width="180"></el-table-column>
           <el-table-column prop="operateContent" label="操作信息"></el-table-column>
           <el-table-column prop="operateTimeStr" label="操作时间" width="180"></el-table-column>
         </el-table>
         <!-- 分页 -->
         <pagingComponent v-show="totalPage > 1"/>
       </div>
    </div>
  </div>
</template>

<script>
  var pageSize = 20;
  var page = 1;
  //import Bus2 from "../../newObject/Bus.js";
  import noMoreDataOther from "../publicComponemts/noMoreDataOther.vue";
  import pagingComponent from "../publicComponemts/pagingComponent.vue";
  export default{
    name:"Sys-operationLog",
    components:{noMoreDataOther:noMoreDataOther,pagingComponent:pagingComponent},
    data(){
      return{
        content:"",              //定义搜搜框里的内容
        totalPage:1,             //定义总页数
        operaList:[],            //定义操作列表
      }
    },
    created() {
      this.getOperationLog(1);
    },
    mounted() {
      //监听子组件 pagingComponent传过来的数据
      this.$eventBus.$on("updataPage",this.updataPage);
    },
    methods:{
      //根据分页子组件返回的数据请求新的报警记录数据
      updataPage:function(page){
        this.getOperationLog(page);
      },
      //获取报警记录
      getOperationLog:function(page){
        var self = this;
        var url = "/sdm/operate/getOperateList";
        var data = {"pageNo":page,"pageSize":pageSize,"content":self.content};
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.totalPage = Number(result.data.totalPage);  //获取总共有多少页
            page = Number(result.data.page);   //获取当前页
            self.$eventBus.$emit('deviceListDataReturn',result.data);
            if(result.data.dataList.length>0){
              self.operaList = result.data.dataList;
            }else{
              self.operaList = [];
            }
          }else{
            self.operaList = [];
          }
        }).catch(function(erro){
           console.log(erro)
        })
      }
    },
	beforeDestroy() {
		this.$eventBus.$off('updataPage');  //关闭兄弟组件之间传递信息时$on会多次触发的问题
	}
  }
</script>

<style>
  @import url("../../../static/css/SystemLog/Sys-alarmLog.css");
</style>
