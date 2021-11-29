<!-- 语音播报铃声组件 -->
<template>
  <div class="ringtoneSele">
    <el-select v-model="ringingName" placeholder="请选择" @change="ringingSelect">
      <el-option v-for="item in ringToneOption" :key="item.value" :label="item.label" :value="item.value"></el-option>
    </el-select>
  </div>
</template>

<script>
  export default{
    name:"RingtoneSelection",
    props:["RingtoneSelectData"],
    data(){
      return{
        ringingTone:"",       //铃声选择后的结果
        ringingName:"",       //铃声选择后的名称
        //可供选择的铃声
        ringToneOption: [
          {value:"7",label: '门铃声'},
          {value:"9",label: '电话铃声'},
          {value:"19",label: '布谷声'},
          {value:"20",label: '提示音'},
          {value:"22",label: '提示音2'},
          {value:"51",label: '音乐1'},
          {value:"52",label: '音乐2'},
          {value:"53",label: '音乐3'},
          {value:"54",label: '音乐4'},
          {value:"55",label: '音乐5'},
          {value:"56",label: '音乐6'},
          {value:"58",label: '音乐7'},
          {value:"57",label: '音乐8'}
        ],
      }
    },
    mounted() {
      var self = this;
      self.ringingTone = self.RingtoneSelectData;
      self.ringToneOption.forEach(function(arr,index){
        if(self.RingtoneSelectData == arr.value){
          self.ringingName= arr.label;
        }
      })
    },
    methods:{
      ringingSelect:function(data){
        var selectValue = "";
        var list = this.ringToneOption;
        for(var i=0;i<list.length;i++){
          if(data == list[i].value){
            selectValue = list[i];
          }
        }
        this.$emit("ringingChanged",selectValue); //自定义事件  传递值“子向父组件传值”
      }
    }
  }
</script>

<style>
  .ringtoneSele{width:100%;}
</style>
