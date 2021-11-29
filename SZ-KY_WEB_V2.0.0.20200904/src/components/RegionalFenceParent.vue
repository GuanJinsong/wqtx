<template>
  <div class="mainView" :treeList="treeList">
    <!-- 查看电子围栏 -->
    <RegionalFence @RegionalChange="RegionalChangeData" v-if="showStatus"/>
    <!-- 绘制电子围栏 -->
    <RegionalFenceDraw @RegionalChange="RegionalChangeData" v-else="showStatus"/>
  </div>
</template>

<script>
  var self = "";
  import RegionalFence from "./RegionalFence.vue"
  import RegionalFenceDraw from "./RegionalFenceDraw.vue"
  export default{
    name:'RegionalFenceParent',
    components:{
      RegionalFence:RegionalFence,
      RegionalFenceDraw:RegionalFenceDraw
    },
    props: ["treeList"],
    data(){
      return{
        showStatus:true,
      }
    },
    created() {
      self = this;
      var parentData = {header:true,nav:5};
      self.$emit('headerChange',parentData);
    },
    methods:{
      //获取子组件传过来的数据
      RegionalChangeData:function(data){
        self.showStatus = data.showStatus;
      },
    }
  }
</script>

<style>
</style>
