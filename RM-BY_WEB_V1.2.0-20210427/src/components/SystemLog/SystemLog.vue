<template>
  <section class="comonTop SystemLog">
    <div class="sys_left">
      <ul class="sys_leftNav">
        <li @click="sys_leftNavSelect(0)" v-bind:class="leftNav==0?'sys_leftNavSelect':''">报警日志</li>
        <li v-if="userRel<2" @click="sys_leftNavSelect(1)" v-bind:class="leftNav==1?'sys_leftNavSelect':''">操作日志</li>
      </ul>
    </div>

    <!-- 报警日志 -->
    <SysalarmLog v-show="leftNav==0"/>
    <!-- 操作日志 -->
    <SysoperationLog v-show="leftNav==1"/>
  </section>
</template>

<script>
import SysalarmLog from './Sys-alarmLog.vue'
import SysoperationLog from './Sys-operationLog.vue'
export default {
  name: 'SystemLog',
  components: {
    SysalarmLog: SysalarmLog,
    SysoperationLog: SysoperationLog
  },
  data() {
    return {
      userRel: Number(localStorage.getItem('rel')), // 定义当前的用户身份
      leftNav: 0
    }
  },
  created() {
    var parentData = {header: 2, nav: 3}
    this.$emit('headerChange', parentData)
    if (this.$route.query.leftNav !== undefined) {
      this.leftNav = Number(this.$route.query.leftNav)
    }
  },
  methods: {
    sys_leftNavSelect: function(index) {
      this.leftNav = index
    }
  }
}
</script>

<style>
  @import url("../../../static/css/SystemLog/SystemLog.css");
</style>
