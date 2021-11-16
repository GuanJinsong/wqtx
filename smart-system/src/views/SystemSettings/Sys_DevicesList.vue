<!-- 设备列表 -->
<template>
  <div class="sys_dlParent">
    <div class="sys_dlSearchBox">
      <div class="sys_dlSelectput editMM">
        <el-select v-model="value" clearable placeholder="强/弱电选择">
          <el-option v-for="item in options"
            :key="item.value" :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </div>
      <div class="sys_dlSelectput">
        <input type="text" v-model="searchWord" class="sys_dlSearch" placeholder="请输入ip..." />
      </div>
      <button @click="getDeviceList(1)">查询</button>
    </div>
    <div class="sys_dlTableParent dev_ManRight">
       <el-table :data="deviceList" style="width: 100%; height: calc(100% - 55px); overflow-y: auto;">
         <el-table-column type="index" label="序号" width="80"></el-table-column>
         <el-table-column prop="C_strongIP" label="强电Ip"></el-table-column>
         <el-table-column prop="C_weakIP" label="弱电IP"></el-table-column>
         <el-table-column prop="eq_typeName" label="设备类型"></el-table-column>
         <el-table-column prop="hardwareVersion" label="硬件版本"></el-table-column>
         <el-table-column prop="softwareVersion" label="软件版本"></el-table-column>
         <el-table-column prop="createTime" label="上线时间"></el-table-column>
         <el-table-column label="状态">
           <template slot-scope="scope">
             <span class="onState" v-if="scope.row.state==1">在线</span>
             <span class="outState" v-else>离线</span>
           </template>
         </el-table-column>
         <el-table-column  label="操作">
           <template slot-scope="scope">
             <span class="Del el-icon-delete" title="删除" @click="deleteDevList(scope.row.equipmentInfoId)"></span>
           </template>
         </el-table-column>
       </el-table>
       <!-- 分页 -->
       <pagingComponent/>
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
    name:"Sys_DevicesList",
    components:{pagingComponent:pagingComponent},
    data(){
      return{
        options: [{value:1,label:'强电'}, {value:4,label:'弱电'}],
        value: '',   //监室类型值
        searchWord:"",   //搜索的内容
        deviceList:[],  //设备列表列表
        nowPage:1,   //当前选中的分页
      }
    },
    created() {
      this.getDeviceList(1);
    },
    mounted() {
      //监听子组件 pagingComponent传过来的数据
      this.$eventBus.$on("updataPage",this.updataPages);
    },
    methods:{
      //根据分页子组件返回的数据请求新的报警记录数据
      updataPages:function(page){
        this.nowPage = page;
        this.getDeviceList(page);
      },
      getDeviceList:function(page){
        let self = this;
        const loading = self.$loading(opt);
        let url = "/sup/equipmentInfo/queryAll";
        let data = {current:page,size:15,equipmentType:self.value,equipmentIp:self.searchWord};
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.$eventBus.$emit('deviceListDataReturn',result.data.data);  //向分页组件传递分页数据
            let list = result.data.data.records;
            for(let i=0;i<list.length;i++){
              let newWord = {C_strongIP:"",C_weakIP:"",eq_typeName:""};
              newWord.C_strongIP = list[i].equipmentType==1?list[i].equipmentIp:"--";
              newWord.C_weakIP = list[i].equipmentType==4?list[i].equipmentIp:"--";
              newWord.eq_typeName = list[i].equipmentType==4?"32路弱电终端":"4路强电终端";
              Object.assign(list[i],newWord);
            }
            self.deviceList = list;
          }else{
            self.deviceList=[];
            self.$message({message:result.data.msg,type:'warning'});
          }
          loading.close();
        }).catch(function(erro){
          loading.close();self.deviceList=[];
          self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      //删除设备列表
      deleteDevList:function(equipmentInfoId){
        let [self,tip] = [this,'是否确定删除这条数据？'];
        self.$confirm(tip, '删除提示', {confirmButtonText: '确定',cancelButtonText: '取消',type: 'warning'
          }).then(() => {
          let [url,data] = ['/sup/equipmentInfo/delete',{equipmentInfoId:equipmentInfoId}];
          self.$http.post(url,data).then(function(result){
            if(result.data.flag){
              self.$message({message:result.data.msg,type: 'success'});
              self.getDeviceList(self.nowPage);  //重新获取设备列表
            }else{
              self.$message({message:result.data.msg,type:'warning'});
            }
          }).catch(function(erro){})
        }).catch(() => {});
      }
    },
    beforeDestroy() {
    	this.$eventBus.$off('updataPage');  //关闭兄弟组件之间传递信息时$on会多次触发的问题
    }
  }
</script>

<style>
  @import url("../../../static/css/SystemSettings/Sys_DevicesList.css");
</style>
