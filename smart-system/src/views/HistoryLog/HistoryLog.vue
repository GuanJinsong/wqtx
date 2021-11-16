<template>
  <div class="defaultName">
    <div class="contentBox">
      <div class="contentLeft">
        <div class="his_setLeftAfter">
          <div class="his_setLeftTitle"><h6>历史查询</h6></div>
          <ul class="contentLeftList">
            <li v-for="(list,index) in hisTypeList"
                v-bind:class="hisType==index?'contLeftLiSelect':''"
                @click="systemTypeSelect(list.id)">{{list.name}}</li>
          </ul>
        </div>
      </div>
      <div class="contentRight">
        <!-- 任务设置 -->
        <HisAlarmLog v-if="hisType==0"/>
        <!-- 管控配置 -->
        <HisOperationRecord v-else-if="hisType==1"/>
      </div>
    </div>
  </div>
</template>

<script>
  import HisAlarmLog from "./His-AlarmLog.vue"
  import HisOperationRecord from "./His-OperationRecord.vue"
  export default{
    name:"HistoryLog",
    components:{
      HisAlarmLog:HisAlarmLog,
      HisOperationRecord:HisOperationRecord
    },
    data(){
      return{
        hisType:0,
        hisTypeList:[{id:0,name:"告警记录"},{id:1,name:"操作记录"}],
      }
    },
    created() {
    //headerChange: 是父组件App.vue指定的传数据绑定的函数，parentData:子组件给父组件App.vue传递的数据
    var parentData = {header:true,nav:5};
    this.$emit('headerChange',parentData);
    },
    methods:{
      // 右侧导航栏栏切换
      systemTypeSelect:function(index){
        this.hisType=index;
      }
    }
  }
</script>

<style>
  @import url("../../../static/css/HistoryLog/HistoryLog.css");
</style>
