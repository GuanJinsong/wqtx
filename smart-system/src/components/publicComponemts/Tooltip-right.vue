<template>
  <el-tooltip :placement="placement" 
    v-bind:class="result.state==1?'alarmSelect1':(result.state==2?'alarmSelect2':(result.state==3?'alarmSelect3':''))">
    <div class="ind_hoverBntn"></div>
    <div class="t_tipList" slot="content">
      <p>监室名：{{result.name}}</p>
      <p><span v-if="result.state==1">状态：<span class="t_alarmTip">在线</span></span>
      <span v-else-if="result.state==2">状态：<span class="t_alarmTip2">离线</span></span>
      <span v-else-if="result.state==3">状态：<span class="t_alarmTip1">报警</span></span>
      <span v-else>状态：<span>---</span></span>
      </p>
    </div>
  </el-tooltip>
</template>

<script>
  export default{
    name:"Tooltip-right",
    props:{
      result:"",
      placement: {
        type: String,
        default: 'right',
        required: false
      }
    },
    data(){
      return{}
    },
  }
</script>

<style>
</style>
