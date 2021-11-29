<template>
  <section class="comonOtherTop IndexParent">
    <div class="ind_left">
      <IndexLeft v-bind:heightWidth="heightWidth"/>
    </div>
    <div class="ind_center">
      <IndexCenter v-bind:heightWidth="heightWidth"/>
    </div>
    <div class="ind_right">
      <IndexRight/>
    </div>
  </section>
</template>

<script>
import IndexLeft from './IndexLeft.vue'
import IndexCenter from './IndexCenter.vue'
import IndexRight from './IndexRight.vue'
export default{
  name: 'Index',
  components: {
    IndexLeft: IndexLeft,
    IndexCenter: IndexCenter,
    IndexRight: IndexRight
  },
  data () {
    return {
      heightWidth: ''
    }
  },
  created() {
    var parentData = {header: 1, nav: 0}
    this.$emit('headerChange', parentData)
    this.windowOnresize()
  },
  methods: {
    // 根据窗口的大小变动图表 --- 重点
    windowOnresize: function () {
      var self = this
      window.onresize = function () {
        var heightAndWidth = {screenHeight: document.body.clientHeight, screenWidth: document.body.clientWidth}
        self.heightWidth = heightAndWidth
      }
    }
  }
}
</script>

<style>
  @import url("../../../static/css/Index/Index.css");
</style>
