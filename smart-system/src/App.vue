<template>
  <div id="app">
    <Header v-if="header" v-bind:navSelect="navSelect"/>
    <router-view @headerChange="getHeaderStatus"/>
  </div>
</template>

<script>
  import Header from "./components/publicComponemts/Header.vue"
  export default {
    name: 'App',
    components:{Header:Header},
    data(){
      return{
        header:false,  //定义导航栏是否出现
        navSelect:0,
      }
    },
    methods:{
      //获取子组件传过来的数据，用于修改公共头部是否显示
      getHeaderStatus(data){
         this.header = data.header;
         this.navSelect = data.nav;
      },
    }
  }
</script>

<style>
#app{height:100%;width:100%;color:#FFFDEF;background-color:#0b143b;}
</style>
