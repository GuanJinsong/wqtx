<!-- 宿舍报警监控 -->
<template>
  <div class="comonOtherTop Dor_Parent">
    <div class="Dor_left">
      <Dortree/>
    </div>
    <div class="Dor_center">
      <DorroomList/>
    </div>
    <div class="Dor_right">
      <p class="returnBox" @click="returnBack()"><img src="../../../static/images/return.png"/><span>返回</span></p>
      <DoralarmLog/>
    </div>
  </div>
</template>

<script>
import DorroomList from './Dor-roomList.vue'
import Dortree from './Dor-tree.vue'
import DoralarmLog from './Dor-alarmLog.vue'
export default {
  name: 'DormitoryMonitoring',
  components: {
    DorroomList: DorroomList,
    Dortree: Dortree,
    DoralarmLog: DoralarmLog
  },
  data() {
    return {
        
    }
  },
  created() {
    var parentData = {header: 1, nav: 1}
    this.$emit('headerChange', parentData)
  },
  methods: {
    returnBack: function() {
      // this.$router.go(-1);
      this.$router.push({path: '/components/Index/Index', name: 'Index'})
    }
  }
}
</script>

<style>
  @import url("../../../static/css/DormitoryMonitoring/DormitoryMonitoring.css");
</style>
