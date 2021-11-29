<template>
  <div id="app">
    <!-- 公共头部(蓝色背景) -->
    <HeaderOther v-if="headerStatus==1" v-bind:navSelect="navSelect"/>
    <!-- 公共头部(白色背景) -->
    <Header v-if="headerStatus==2" v-bind:navSelect="navSelect"/>
    <!-- 视图输出组件 -->
    <router-view @headerChange="getHeaderStatus"/>
  </div>
</template>

<script>
import Header from './components/publicComponemts/Header.vue'
import HeaderOther from './components/publicComponemts/HeaderOther.vue'
export default {
  name: 'App',
  components: {
    Header: Header,
    HeaderOther: HeaderOther
  },
  data () {
    return {
      headerStatus: 0, // 定义公共头是否显示0不显示公共头1显示大屏页头2管理页头
      navSelect: 0 // 定义当前选中的导航栏
    }
  },
  methods: {
    // 获取子组件传过来的数据，用于修改公共头部是否显示
    getHeaderStatus (data) {
      this.headerStatus = data.header
      this.navSelect = data.nav
    }
  }
}
</script>

<style>

</style>
