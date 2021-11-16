<template>
  <div class="defaultName">
    <div class="contentBox">
      <div class="contentLeft">
        <div class="sys_setLeftAfter">
          <div class="sys_setLeftTitle"><h6>系统设置</h6></div>
          <ul class="contentLeftList">
            <li v-for="(list,index) in sysTypeList"
                v-bind:class="sysType==list.id?'contLeftLiSelect':''"
                @click="systemTypeSelect(list.id)">{{list.name}}</li>
          </ul>
        </div>
      </div>
      <div class="contentRight">
        <!-- 任务设置 -->
        <SysTaskSetting v-if="sysType==0"/>
        <!-- 管控配置 -->
        <SysControlConfig v-else-if="sysType==1"/>
        <!-- 分组设置 -->
        <SysGroupingSetting v-else-if="sysType==2"/>
        <!-- 监室类型 -->
        <SysRoomType v-else-if="sysType==3"/>
        <!-- 监室配置 -->
        <SysRoomConfig v-else-if="sysType==4"/>
        <!-- 设备列表 -->
        <SysDevicesList v-else-if="sysType==5"/>
        <!-- 软件版本 -->
        <SysVersion v-else-if="sysType==6"/>
        <!-- 用户管理 -->
        <SysUserManage v-else-if="sysType==7"/>
      </div>
    </div>
  </div>
</template>

<script>
  import SysTaskSetting from "./Sys-TaskSetting"
  import SysControlConfig from "./Sys-ControlConfig"
  import SysGroupingSetting from "./Sys-GroupingSetting"
  import SysRoomType from "./Sys-RoomType"
  import SysRoomConfig from "./Sys-RoomConfig"
  import SysDevicesList from "./Sys_DevicesList.vue"
  import SysVersion from "./Sys-Version"
  import SysUserManage from "./Sys_UserManage.vue"
  export default{
    name:"SystemSettings",
    components:{
      SysTaskSetting:SysTaskSetting,
      SysControlConfig:SysControlConfig,
      SysGroupingSetting:SysGroupingSetting,
      SysRoomType:SysRoomType,
      SysRoomConfig:SysRoomConfig,
      SysDevicesList:SysDevicesList,
      SysVersion:SysVersion,
      SysUserManage:SysUserManage
    },
    data(){
      return{
        sysType:3,    //初始值由列表首位决定
        sysTypeList:[],   //系统设置导航栏
      }
    },
    created() {
      //headerChange: 是父组件App.vue指定的传数据绑定的函数，parentData:子组件给父组件App.vue传递的数据
      var parentData = {header:true,nav:4};
      this.$emit('headerChange',parentData);
	    if(localStorage.getItem("rel") == 1){
		  // var lit = [{id:0,name:"任务设置"},{id:1,name:"管控配置"},{id:2,name:"设备分组"},
			//   {id:3,name:"监室类型"},{id:4,name:"监室配置"},{id:5,name:"设备列表"},{id:6,name:"软件版本"},{id:7,name:"用户管理"}];
		  //   this.sysTypeList=lit;
      /* 由于现有的显示逻辑已确定，所以在替换显示顺序时只替换数据顺序，不修改数据的id */
        var newList = [
          {id:3, name:"监室类型"}, 
          {id:4, name:"监室配置"}, 
          {id:5, name:"设备列表"}, 
          {id:2, name:"设备分组"}, 
          {id:0, name:"任务设置"}, 
          {id:1, name:"管控配置"}, 
          {id:7, name:"用户管理"}, 
          {id:6, name:"软件版本"}
        ]
        this.sysTypeList = newList;
	    }else{
		    var lit = [{id:4,name:"监室配置"},{id:5,name:"设备列表"},{id:0,name:"任务设置"},{id:6,name:"软件版本"}];
		    this.sysTypeList=lit;
	    }
    },
    methods:{
      // 右侧导航栏栏切换
      systemTypeSelect:function(index){
        this.sysType=index;
      }
    }
  }
</script>

<style>
  @import url("../../../static/css/SystemSettings/SystemSettings.css");
</style>
