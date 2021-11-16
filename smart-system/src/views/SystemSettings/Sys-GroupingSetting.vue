<!-- 分组设置 -->
<template>
  <div class="sys_grouSetParent">
    <div class="sys_grouSetAfter">
    <ul class="sys_grouSethead" ref="monthPie">
      <li v-for="(list,index) in navList"
       v-bind:class="sysType==index?'groupSelect':''"
       @click="sysGrouSetSelect(index,list.planId,list.name)" :key="index">{{list.name}}</li>
       <li class="navRight" title="更多" v-if="navList2.length>0">
         <el-tooltip placement="bottom">
           <div><span class="el-icon-d-arrow-right"></span></div>
           <div class="sys_LofinOut" slot="content">
             <p v-for="(nav2,index) in navList2" v-bind:key="index"
             @click="sysGrouSetOther(index,nav2)"><span>{{nav2.name}}</span></p>
           </div>
         </el-tooltip>
       </li>
       <li @click="openAddDeviceGroup()" title="添加分组">+</li>
    </ul>
    </div>
    <div class="sys_grouSetCont">
      <div class="sys_grouSureBtn" v-if="checkList.length>0">
        <button @click="deleteGrouping()" v-if="planId>2">删除</button>
        <button @click="saveGroupingInfo()">保存</button>
      </div>
      <div class="sys_ordinary" v-for="(item,index) in checkList" v-bind:key="index">
        <div class="sys_ordinaryTitle"><h6>{{item.prisonTypeName}}</h6></div>
        <div class="sys_StrongCurt checboxSys">
          <el-checkbox v-for="(stItem,ind) in item.storngPlan" v-model="stItem.stateType" v-bind:key="ind">{{'通道'+(ind+1)}}</el-checkbox>
        </div>
        <ul class="sys_weakCurt checboxSys">
          <el-checkbox v-for="(weItem,ind) in item.weakPlan" v-model="weItem.stateType" v-bind:key="ind">{{'通道'+(ind+1)}}</el-checkbox>
        </ul>
      </div>
      <div class="sys_gsnoData" v-if="checkList.length==0"><img src="../../../static/images/n_data.png"/></div>
    </div>

    <!-- 添加/设备分组 弹窗 -->
    <div class="poupParnet" v-if="groupingPup">
    	<div class="poupParnetAfter" style="width:400px;">
    		<div class="poupTitle"><div class="poupTitleAfter"><h6>添加分组</h6><span @click="groupingPup=false">×</span></div></div>
    		<div class="pubCenter">
          <ul class="sys_grouPoup">
            <li><span class="grouSmall">分组名称：</span><input class="sys_grouPoupPut" type="text" v-model="groupName" placeholder="请输入分组名称"/></li>
          </ul>
        </div>
    		<div class="poupSure">
    			<button @click="groupingPup=false">取消</button>
    			<button @click="addNewsGrouping()">确认</button>
    		</div>
    	</div>
    </div>
  </div>
</template>

<script>
  var opt = {
      lock: true,text: '加载中...',spinner: 'el-icon-loading',
      customClass:'loadingClass', background: 'rgba(0, 0, 0, 0.5)',
  }
  var loading = "";
  export default{
    name:"Sys-GroupingSetting",
    data(){
      return{
        sysType:0,   //定义当前选中的分组索引
        planId:"",   //定义当前选中的分组id
        planName:'',  //定义当前选中的分组名称
        navList:[{id:0,name:"一键开关"},{id:1,name:"无人舱室"},{id:2,name:"电教系统"}],
        navList2:[],
        checkList:[],          //分组下的所有设备列表
        listBackups:[],        //备份分组下的所有列表
        groupingPup:false,
        groupName:""
      }
    },
    created() {
      this.getAllGrouping();
    },
    methods:{
      //点击分组导航栏切换查看分组配置
      sysGrouSetSelect:function(index,planId,planName){
		   this.sysType = index;this.planId = planId;
       this.planName = planName;
       this.getAllGroupingState()
	    },
      //点击分组导航栏更多按钮列表下的数据
      sysGrouSetOther:function(index,item){
        var last = JSON.parse(JSON.stringify(this.navList.pop()));  //先获取navList中的最后一条数据
        var leng = this.navList.length;   //获取navList的长度
        this.navList.splice(leng,1,item);   //用item替换掉navList的最后一条数据
        this.navList2.splice(index,1,last);  //用last替换掉navList2的指定索引index处的数据
        this.sysType = leng;
        this.planId = item.planId;this.planName = item.name;
        this.getAllGroupingState();
      },
      //查询所有的分组
      getAllGrouping:function(){
        var self = this;
        self.sysType = 0;self.planId = "";self.planName = "";  //重置一些初始值
        loading = self.$loading(opt);
        var url = "/sup/plansetting/query";var data = {reservedFields1:''};
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            var list =""; var list2 = "";
            var wid = (self.$refs.monthPie.offsetWidth-50)/120;
            var flr = Math.floor(wid);
            if(result.data.data.length>flr){
              list = result.data.data.slice(0,flr);
              list2 = result.data.data.slice(flr);
            }else{
              list = result.data.data;list2 = []
            }
            self.navList = list; self.navList2 = list2;
            self.planId = result.data.data[0].planId;
            self.getAllGroupingState();  //获取分组下的相关数据
          }else{
            self.navList=[];loading.close();
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
          self.navList=[];loading.close();
          self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      //获取当前选中的分组下的设备及其开关状态
      getAllGroupingState:function(){
        var self = this;
        var url = "/sup/plansetting/queryPrisonType";
        var data = {planId:self.planId};
        loading = self.$loading(opt);
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            var list = result.data.data;
            if(list.length>0){
              for(var i=0;i<list.length;i++){
                var newWord = {storngPlan:[],weakPlan:[]};
                var lit = list[i].planStateSettings;
                if(lit.length>0){
                  for(var m=0;m<lit.length;m++){
                    var m_state = {stateType:""};
                    m_state.stateType = lit[m].state==0?false:true;
                    Object.assign(lit[m],m_state);
                    if(m<4){newWord.storngPlan.push(lit[m])}else{newWord.weakPlan.push(lit[m])}
                  }
                }
                Object.assign(list[i],newWord);
              }
              self.checkList = list; self.listBackups = JSON.parse(JSON.stringify(list));  //listBackups用于备份的数据
            }else{
              self.checkList = []; self.listBackups = [];  //listBackups用于备份的数据
            }
          }else{
            self.checkList = []; self.listBackups = [];  //listBackups用于备份的数据
            self.$message({message:result.data.msg,type:'warning'});
          }
          loading.close();
        }).catch(function(erro){
          loading.close();self.chackList = []; self.listBackups = [];  //listBackups用于备份的数据
          self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      //点击打开添加设备分组弹窗
      openAddDeviceGroup:function(){
        this.groupingPup = true;
        this.groupName = "";
      },
      //添加设备分组
      addNewsGrouping:function(){
        var self = this;
        if(self.groupName == ""){self.$message({message:'分组名称不得为空.',type:'warning'});return false;}
        const loading = self.$loading(opt);
        var url = "/sup/plansetting/add";
        var data = {name:self.groupName};
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.groupingPup = false;
            self.$message({message:'添加成功',type: 'success'});
            self.getAllGrouping();   //重新获取分组列表
          }else{
            self.$message({message:result.data.msg,type:'warning'});
          }
          loading.close();self.groupingPup = false;
        }).catch(function(erro){
          loading.close();self.groupingPup = false;
          self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      // 删除分组
      deleteGrouping:function(){
        var self = this;
        var tip ="是否确定删除 "+self.planName+" 这个分组？";
        self.$confirm(tip, '删除提示', {confirmButtonText: '确定',cancelButtonText: '取消',type: 'warning'
          }).then(() => {
          var url = "/sup/plansetting/delete";
          var data = {planId:self.planId};
          self.$http.post(url,data).then(function(result){
            console.log(result)
            if(result.data.flag){
              self.$message({message:'删除成功',type: 'success'});
              self.getAllGrouping();  //重新获取所有的分组列表
            }else{
              self.$message({message:'删除失败',type:'warning'});
            }
          }).catch(function(erro){
             console.log(erro)
          })
        }).catch(() => {});
      },
      //保存编辑后的分组
      saveGroupingInfo:function(){
        var arr1 = [];var arr2 = [];
        //收集this.checkList的所有设备数据（将强电和弱电合并起来）
        for(var m=0;m<this.checkList.length;m++){
          var dd = this.checkList[m].storngPlan;
          var ff = this.checkList[m].weakPlan;
          for(var n=0;n<dd.length;n++){
            var gg = {state:'',planStateId:''};
            gg.state = dd[n].stateType;  gg.planStateId = dd[n].planStateId;
            arr1.push(gg);
          }
          for(var h=0;h<ff.length;h++){
            var ll = {state:'',planStateId:''};
            ll.state = ff[h].stateType;  ll.planStateId = ff[h].planStateId;
            arr1.push(ll);
          }
        }

        //收集this.listBackups的所有设备数据（将强电和弱电合并起来）
        for(var mm=0;mm<this.listBackups.length;mm++){
          var dddd = this.listBackups[mm].storngPlan;
          var ffff = this.listBackups[mm].weakPlan;
          for(var nn=0;nn<dddd.length;nn++){
            var gggg = {state:'',planStateId:''};
            gggg.state = dddd[nn].stateType;  gggg.planStateId = dddd[nn].planStateId;
            arr2.push(gggg);
          }
          for(var hh=0;hh<ffff.length;hh++){
            var llll = {state:'',planStateId:''};
            llll.state = ffff[hh].stateType;  llll.planStateId = ffff[hh].planStateId;
            arr2.push(llll);
          }
        }

        var newArr = [];
        for (var i = 0; i < arr2.length; i++) {
          //我们将arr2中的元素依次放入函数中进行比较，然后接收函数的返回值
          if (arr2[i].state !== arr1[i].state) { //如果返回的值是true，我们将元素放入新的数组中
            arr1[i].state = arr1[i].state==false?0:1;
            newArr.push(arr1[i]);
          }
        }

        var self = this;
        var tip ="是否确定保存 "+self.planName+" 这个分组的编辑？";
        self.$confirm(tip, '保存提示', {confirmButtonText: '确定',cancelButtonText: '取消',type: 'warning'
          }).then(() => {
          var url = "/sup/plansetting/update";
          var data = {planStateSettings:newArr};
          self.$http.post(url,data).then(function(result){
            console.log(result)
            if(result.data.flag){
              self.$message({message:'保存成功',type: 'success'});
              self.getAllGroupingState();  //重新获取当前选中的分组下的设备及其开关状态
            }else{
              self.$message({message:'删除失败',type:'warning'});
            }
          }).catch(function(erro){
             console.log(erro)
          })
        }).catch(() => {});
      }
    }
  }
</script>

<style>
  @import url("../../../static/css/SystemSettings/Sys-GroupingSetting.css");
</style>
