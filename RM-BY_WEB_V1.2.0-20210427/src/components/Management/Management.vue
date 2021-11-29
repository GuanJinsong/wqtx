<template>
  <section class="comonTop">
    <div class="man_left">
      <ul class="man_leftNav">
        <li v-if="userRel<2" @click="man_leftNavSelect(0)" v-bind:class="leftNav==0?'man_leftNavSelect':''">用户管理</li>
        <li v-if="userRel!=='2'" @click="man_leftNavSelect(1)" v-bind:class="leftNav==1?'man_leftNavSelect':''">报警设置</li>
        <li @click="man_leftNavSelect(2)" v-bind:class="leftNav==2?'man_leftNavSelect':''">任务广播</li>
      </ul>
    </div>
    <!-- 账户管理 -->
    <ManaccountManagement v-if="leftNav == 0"/>
    <!-- 报警规则定义 -->
    <ManalarmRules v-if="leftNav == 1"/>
    <!-- 任务广播 -->
    <ManbroadcastTask v-if="leftNav == 2"/>
  </section>
</template>

<script>
import ManaccountManagement from './Man-accountManagement.vue'
import ManalarmRules from './Man-alarmRules.vue'
import ManbroadcastTask from './Man-broadcastTask.vue'
export default{
  name: 'Management',
  components: {
    ManaccountManagement: ManaccountManagement,
    ManalarmRules: ManalarmRules,
    ManbroadcastTask: ManbroadcastTask
  },
  data () {
    return {
      userRel: localStorage.getItem('rel'), // 定义当前的用户身份
      leftNav: 1
    }
  },
  created() {
    var parentData = {header: 2, nav: 2}
    this.$emit('headerChange', parentData)
    if (this.$route.query.leftNav !== undefined) {
      this.leftNav = this.$route.query.leftNav
    } else if (this.$route.query.leftNav == undefined && localStorage.getItem('rel') > 1) {
      this.leftNav = 2
    }
  },
  methods: {
    man_leftNavSelect: function(index) {
      this.leftNav = index
    }
  }
}
</script>

<style>
@import url("../../../static/css/Management/Management.css");
</style>
