<!-- Ai大数据/故障排名 -->
<template>
  <div class="ai_rankBox">
    <ul class="ai_rankUl">
      <li v-for="index in 5">
        <div class="ai_rankNum"><p><span>NO.1</span><i>一号监区</i></p> <b>120</b></div>
        <div class="ai_rankpro"><el-progress :show-text="false" :stroke-width="13" :percentage="70"></el-progress></div>
      </li>
    </ul>
  </div>
</template>

<script>
  export default{
    name:"Ai-FaultRanks",
    data(){
      return{

      }
    },
    created() {
    },
    mounted() {
    },
    methods:{

    }
  }
</script>

<style>
  @import url("../../../static/css/AiCenter/Ai-FaultRanks.css");
</style>
