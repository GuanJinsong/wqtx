<template>
  <div class="cus_parent">
    <p class="cus_child" v-if="slelect"></p>
    <input class="cus_checkbox" :checked="slelect" @change="inputs" type="checkbox"/>
  </div>
</template>

<script>
  export default{
    name:"Checkbox-custom",
    props:['checkboxStatus'],//得到父组件传递过来的数据
    data(){
      return{
        slelect:this.checkboxStatus
      }
    },
    methods:{
      inputs(data) {
          this.$emit('getCheckboxSataus',data.target.checked)
          this.slelect = data.target.checked
      }
    }
  }
</script>

<style>
  .cus_parent{position:relative;width:18px;height:18px;box-sizing:border-box;border-radius:50%;border:2px solid #0086B3;padding:2px;cursor:pointer;display: inline-block;vertical-align: middle;}
  .cus_child{width:10px;height:10px;border-radius:50%;background-color:#00CCFF;}
  .cus_checkbox{width:18px;height:18px;position:absolute;z-index:1;left:0;top:0;opacity:0!important;cursor:pointer;}
</style>
