<template>
  <div class="weekSelectBox">
    <el-select v-model="repeat" multiple collapse-tags @change="weekSelect" placeholder="请选择">
      <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
    </el-select>
  </div>
</template>

<script>
  export default{
    name:"WeekSelecttion",
    props:["weekSelectData"],
    data(){
      return{
        repeat:"",             //重复
        //可供选择的重复日期
        options: [
          {value: '每天',label: '每天'},
          {value: '星期日',label: '星期日'},
          {value: '星期一',label: '星期一'},
          {value: '星期二',label: '星期二'},
          {value: '星期三',label: '星期三'},
          {value: '星期四',label: '星期四'},
          {value: '星期五',label: '星期五'},
		      {value: '星期六',label: '星期六'},
        ],
      }
    },
    created() {
      this.repeat = this.weekSelectData;
    },
    methods:{
      weekSelect:function(data){
        var self = this;
        if(data.length>0){
          var MM = data.slice(-1)
          if(MM == "每天"){
            self.repeat=[];self.repeat.push("每天")
          }else{
            data.forEach(function(arr,index){
              if(arr == "每天"){self.repeat.splice(index,1)}
            })
            if(data.length == 7){
              var stst = 1;
              data.forEach(function(arr,index){
                if(arr == "每天"){stst = 0;}
              })
              if(stst == 1){self.repeat=[];self.repeat.push("每天")};
            }
          }
        }
        self.$emit("weekSelectChanged",self.repeat); //自定义事件  传递值“子向父组件传值”
      }
    }
  }
</script>

<style>
  .weekSelectBox{width:100%;}
</style>
