<!-- 监室类型 -->
<template>
  <div class="sys_rtBox">
     <!-- 监室类型列表 -->
     <div class="sys_rtTop">
        <div class="sys_rtTitile"><h6>监室类型设置</h6> <span class="el-icon-plus" title="添加" @click="addRoomType()"></span></div>
        <div class="sys_TaskTableParent dev_ManRight" style="overflow-y:auto;">
           <el-table :data="passWayList" style="width: 100%">
             <el-table-column type="index" label="序号" width="80"></el-table-column>
             <el-table-column prop="prisonTypeName" label="监室类型" width="120"></el-table-column>
             <el-table-column label="通道配置">
               <template slot-scope="scope">
                 <div class="sys_rtPassAft">
                   <p class="sys_rtPass"><span>强电:</span>{{scope.row.s_passways}}</p>
                   <p class="sys_rtPass"><span>弱电:</span>{{scope.row.w_passways}}</p>
                 </div>
               </template>
             </el-table-column>
             <el-table-column prop="createBy" label="创建用户" width="100"></el-table-column>
             <el-table-column prop="createTime" label="创建时间" width="200"></el-table-column>
             <el-table-column  label="操作" width="90">
               <template slot-scope="scope">
                 <span class="Edit el-icon-edit-outline" title="编辑" @click="editRoomType(scope.$index,scope.row)"></span>
                 <span class="Del el-icon-delete" title="删除" @click="deleteRoomType(scope.row)"></span>
               </template>
             </el-table-column>
           </el-table>
           <!-- 分页 -->
           <pagingComponent/>
        </div>
     </div>

     <!-- 监室类型设置弹窗 -->
     <div class="poupParnet" v-if="alarmListPup">
     	<div class="poupParnetAfter" style="width:600px;">
     		<div class="poupTitle"><div class="poupTitleAfter"><h6>监室类型</h6><span @click="alarmListPup=false">×</span></div></div>
     		<div class="pubCenter">
           <div class="sys_rtPupTitle">
             <p>监室类型名称</p>
             <input type="text" v-model="typeName" placeholder="请输入监室名称"/>
           </div>
           <div class="sys_rtPupTitleSmall">
             <p>强电通道数量:</p>
             <div class="editMM" style="width:80px;">
               <el-select v-model="strongPass"  @change="strongPassSelect">
                 <el-option v-for="item in 4" :key="item" :label="item" :value="item" :disabled="item<4"></el-option>
               </el-select>
             </div>
           </div>
           <div class="rtPupTbParent">
             <ul class="rtPupTableHead"><li v-for="lit in 4"><span>通道</span><p>通道名称</p></li></ul>
             <ul class="rtPupTablebody"><li v-for="(lits,index) in strongCurt"><span>{{index+1}}</span>
             <input type="text" v-model="lits.name"/></li></ul>
           </div>
           <div class="sys_rtPupTitleSmall">
             <p>弱电通道数量:</p>
             <div class="editMM" style="width:80px;">
               <el-select v-model="weakPass" @change="weakPassSelect">
                 <el-option v-for="item in 32" :key="item" :label="item" :value="item"></el-option>
               </el-select>
             </div>
           </div>
           <div class="rtPupTbParent">
             <ul class="rtPupTableHead"><li v-for="lit in 4"><span>通道</span><p>通道名称</p></li></ul>
             <ul class="rtPupTablebody"><li v-for="(lits,index) in weakCurt"><span>{{index+1}}</span>
             <input type="text" v-model="lits.name"/></li></ul>
           </div>
         </div>
     		<div class="poupSure">
     			<button @click="alarmListPup=false">取消</button>
     			<button @click="saveRoomTypeConfig()">确认</button>
     		</div>
     	</div>
     </div>
  </div>
</template>

<script>
var opt = {
      lock: true,
      text: '加载中...',
      spinner: 'el-icon-loading',
      customClass:'loadingClass',
      background: 'rgba(0, 0, 0, 0.5)',
  }
import pagingComponent from "../../components/publicComponemts/pagingComponent.vue"
export default{
  name:"Sys-RoomType",
  components:{pagingComponent:pagingComponent},
  data(){
    return{
      alarmListPup:false,   //监室类型编辑弹窗
      passWayList:[],  //监室类型列表
      typeName:"",   //编辑时监室名称
      strongCurt:[{id:"",name:"",num:""},{id:"",name:"",num:""},{id:"",name:"",num:""},{id:"",name:"",num:""}], //强电通道值
      strongPass:4,  //强电下拉框选中
      weakPass:32,  //若电下拉框选中
      weakCurt:[],  //弱电通道值
      nowPage:1,  //定义当前选中的分页
      editRoomId:"",  //定义当前正在编辑的监室类型id
    }
  },
  created() {
    this.getRoomTypeList(1);  //获取监室类型数据
    this.strongPassSelect(4); //生成强电列表
    this.weakPassSelect(32);  //生成弱电列表
  },
  mounted() {
    //监听子组件 pagingComponent传过来的数据
    this.$eventBus.$on("updataPage",this.updataPages);
  },
  methods:{
    //根据分页子组件返回的数据请求新的报警记录数据
    updataPages:function(page){
      this.nowPage = page;
      this.getRoomTypeList(page);
    },
    //监室类型编辑弹窗开启/关闭
    openPopup:function(){
      var self = this;
      if(self.alarmListPup){self.alarmListPup = false;}else{self.alarmListPup = true;}
    },
    //获取监室类型数据
    getRoomTypeList:function(page){
      var self = this;
      var url = "/sup/prisontype/query";
      var data = {current:page,size:15};
      const loading = self.$loading(opt)
      self.$http.post(url,data).then(function(result){
        console.log(result)
        if(result.data.flag){
          for(var i=0;i<result.data.data.records.length;i++){
            var passWay = result.data.data.records[i].prisonjacks;
            var passArry = []; var passArry1 = [];
            for(var m=0;m<passWay.length;m++){
              if(passWay[m].jackType==1){
                passArry.push(passWay[m].prisonJackName);
              }else if(passWay[m].jackType==4){
                passArry1.push(passWay[m].prisonJackName);
              }
            }
            var newWord = {s_passways:passArry.join(",")};
            var newWord1 = {w_passways:passArry1.join(",")};
            Object.assign(result.data.data.records[i],newWord,newWord1);  //将新建立的对象合并到原来的循环对象中
          }
          self.passWayList = result.data.data.records;
          self.$eventBus.$emit('deviceListDataReturn',result.data.data); //向分页组件传递数据
          loading.close();
        }else{
          self.$message({message:result.data.msg,type:'warning'});
          self.$eventBus.$emit('deviceListDataReturn',result.data.data); //向分页组件传递数据
          loading.close();self.passWayList = [];
        }
      }).catch(function(erro){
        loading.close();self.passWayList = [];
        self.$eventBus.$emit('deviceListDataReturn',result.data.data); //向分页组件传递数据
        self.$message.error(erro.data.msg);
        console.log(erro)
      })
    },
    //强电通道数量选择
    strongPassSelect:function(data){
      let self = this;let lent = self.strongCurt.length;
      if(data>lent){
        let le = data-lent;
        for(let i=1;i<=le;i++){let list = {id:"",name:"",num:""};self.strongCurt.push(list);}
      }else{
        let bb = self.strongCurt.slice(0,data);self.strongCurt = bb;
      }
    },
    //弱电通道数量选择
    weakPassSelect:function(data){
      let self = this;let lent = self.weakCurt.length;
      if(data>lent){
        let le = data-lent;
        for(let i=1;i<=le;i++){let list = {id:"",name:"",num:""};self.weakCurt.push(list);}
      }else{
        let aa = self.weakCurt.slice(0,data); self.weakCurt = aa;
      }
    },
    //添加监室类型
    addRoomType:function(){
      this.editRoomId=""; //新添加时清空可能存在的监室id
      this.typeName = ""; //监室类型名称
      this.strongCurt=[{id:"",name:"",num:""},{id:"",name:"",num:""},{id:"",name:"",num:""},{id:"",name:"",num:""}]; //强电通道值
      this.strongPass=4;  //强电下拉框选中
      this.weakPass=32; //若电下拉框选中
      this.weakCurt=[];  //弱电通道值
      this.openPopup();
    },
    //编辑监室类型
    editRoomType:function(index,reslut){
       var passWay = reslut.prisonjacks;
       var passArry = [];
       var passArry1 = [];
       //强电类型jackType=1，弱电为4
       for(var m=0;m<passWay.length;m++){
         if(passWay[m].jackType==1){
           var list = {id:"",name:"",num:""};
           list.id = passWay[m].prisonJackId
           list.name = passWay[m].prisonJackName
           list.num = passWay[m].prisonJackNumber
           passArry.push(list);
         }else if(passWay[m].jackType==4){
           var list1 = {id:"",name:"",num:""};
           list1.id = passWay[m].prisonJackId
           list1.name = passWay[m].prisonJackName
           list1.num = passWay[m].prisonJackNumber
           passArry1.push(list1);
         }
       }
       this.editRoomId = reslut.prisonTypeId; //监室id
       this.typeName = reslut.prisonTypeName; //监室类型名称
       this.strongCurt=passArry; //强电通道值
       this.strongPass=passArry.length;  //强电下拉框选中
       this.weakPass=passArry1.length;  //弱电下拉框选中
       this.weakCurt=passArry1;  //弱电通道值
       this.openPopup();
    },
    //保存监室类型设置
    saveRoomTypeConfig:function(){
      let self = this;
      if(self.typeName == ""){self.$message({message:'监室类型名称不得为空',type:'warning'});return false;}
      if(self.typeName.length>10){self.$message({message:'监室类型名称长度不得超过10',type:'warning'});return false;}
      let st = JSON.parse(JSON.stringify(self.strongCurt));
      let we = JSON.parse(JSON.stringify(self.weakCurt));
      let [storng,strongJackId,weak,weakJackId]=[[],[],[],[]];
      for(let i=0;i<st.length;i++){
        if(st[i].name ==""){self.$message({message:'强电通道名称未填写完整',type:'warning'});return false;}
        storng.push(st[i].name);
        strongJackId.push(st[i].id);
      }
      for(let m=0;m<we.length;m++){
        if(we[m].name ==""){self.$message({message:'弱电通道名称未填写完整',type:'warning'});return false;}
        weak.push(we[m].name);
        weakJackId.push(we[m].id);
      }
      let [url,data] = ["",""];
      if(self.editRoomId == ""){
        url = "/sup/prisontype/addPriType";   //新增
        data = {prisonTypeName:self.typeName,strong:storng,weak:weak};
      }else{
        url = "sup/prisontype/editPriType";  //编辑
        data = {prisonTypeId:self.editRoomId,prisonTypeName:self.typeName,strongJackId:strongJackId,strong:storng,weakJackId:weakJackId,weak:weak};
      }
      console.log(data);
      self.$http.post(url,data).then(function(result){
        if(result.data.flag){
          self.alarmListPup = false;
          self.$message({message:'操作成功',type: 'success'});
          self.getRoomTypeList(self.nowPage); //重新获取分页列表
        }else{
          self.$message({message:result.data.msg,type:'warning'});
        }
      }).catch(function(erro){
        self.$message.error(erro.data.msg);
        console.log(erro)
      })
    },
    //删除监室类型
    deleteRoomType:function(reslut){
      var self = this;
      self.$confirm('是否删除 '+reslut.prisonTypeName+' 这个监室类型?', '删除提示', {confirmButtonText: '确定',cancelButtonText: '取消',type: 'warning'
        }).then(() => {
        var url = "/sup/prisontype/delPriType";
        var data = {prisonTypeId:reslut.prisonTypeId};
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.$message({message:'操作成功',type: 'success'});
            self.getRoomTypeList(self.nowPage); //重新获取分页列表
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
  	this.$eventBus.$off('updataOtherPage');  //关闭兄弟组件之间传递信息时$on会多次触发的问题
    this.$eventBus.$off('updataPage');  //关闭兄弟组件之间传递信息时$on会多次触发的问题
  }
}
</script>

<style>
  @import url("../../../static/css/SystemSettings/Sys-RoomType.css");
</style>
