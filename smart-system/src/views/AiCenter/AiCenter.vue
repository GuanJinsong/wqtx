<!-- Ai大数据中心 -->
<template>
  <div class="defaultName2">
    <div class="ai_parent">
      <div class="ai_top">
        <!-- 设备总览 -->
        <div class="ai_topOne">
          <div class="ai_SmallTitle"><h6>设备总览</h6><p>Device Statistics</p></div>
          <AiDeviceStatistics v-bind:heightWidth="heightWidth"/>
        </div>
        <!-- 故障类型 -->
        <div class="ai_toptow">
          <div class="ai_SmallTitle"><h6>故障类型</h6><p>Fault Rate</p></div>
          <AiFaultRate v-bind:heightWidth="heightWidth"/>
        </div>
        <!-- 监区故障排名 -->
        <div class="ai_topthree">
          <div class="ai_SmallTitle"><h6>监区故障排名</h6><p>Fault Ranks</p></div>
          <AiFaultRanks/>
        </div>
      </div>


      <div class="ai_botton">
        <!-- 能耗监测 -->
        <div class="ai_topFour">
          <div class="ai_SmallTitle"><h6>能耗监测</h6><p>Energy Consumption Monitoring</p></div>
          <AiEnergyConsump v-bind:heightWidth="heightWidth"/>
        </div>
        <!-- 故障平均响应时间与趋势 -->
        <div class="ai_topFive">
          <div class="ai_SmallTitle"><h6>故障平均响应时间与趋势</h6><p>Fault Response Time And Trend</p></div>
          <AiFaultAndTrend v-bind:heightWidth="heightWidth"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import AiDeviceStatistics from "./Ai-DeviceStatistics.vue"
  import AiFaultRate from "./Ai-FaultRate.vue"
  import AiFaultRanks from "./Ai-FaultRanks.vue"
  import AiEnergyConsump from "./Ai-EnergyConsump.vue"
  import AiFaultAndTrend from "./Ai-FaultAndTrend.vue"
  export default{
    name:"AiCenter",
    components:{
      AiDeviceStatistics:AiDeviceStatistics,
      AiFaultRate:AiFaultRate,
      AiFaultRanks:AiFaultRanks,
      AiEnergyConsump:AiEnergyConsump,
      AiFaultAndTrend:AiFaultAndTrend
    },
    data(){
      return{
         heightWidth: '',
      }
    },
    created() {
      //headerChange: 是父组件App.vue指定的传数据绑定的函数，parentData:子组件给父组件App.vue传递的数据
      var parentData = {header:true,nav:3};
      this.$emit('headerChange',parentData);
      this.windowOnresize();
    },
    methods:{
      // 根据窗口的大小变动图表 --- 重点
      windowOnresize: function () {
        var self = this;
        window.onresize = function () {
          var heightAndWidth = {screenHeight:document.body.clientHeight,screenWidth:document.body.clientWidth}
          self.heightWidth = heightAndWidth;
        }
      },
    }
  }
</script>

<style>
  @import url("../../../static/css/AiCenter/AiCenter.css");
</style>
