<!-- 楼栋选择组件2，这个组件里没有 全部 这个选项 一级选项-->
<template>
  <div class="regionBox">
    <el-cascader v-model="RegionSelect" :options="scopeSelection" :props="props" collapse-tags clearable @change="RegionSelection" placeholder="请选择应用范围"></el-cascader>
  </div>
</template>

<script>
  var stus = false;
  export default{
    name:"RegionSelectionUnAll",
    props:["RegionSelectData"],
    data(){
      return{
        RegionSelect:[],        //新数据
        RegionSelectOther:[],   //旧数据
        props: { multiple: true },
        scopeSelection: [],     //范围可选择值
        scopeLength:0,
      }
    },
    created() {
      this.getUnitAndFloor();
      this.RegionSelect = this.RegionSelectData;
      this.RegionSelectOther = this.RegionSelectData;
    },
    methods:{
      //获取可选择的栋数
      getUnitAndFloor:function(){
        var self = this;
        var url = "/sdm/unit/getUnitFloor";
        self.$http.post(url).then(function(result){
          if(result.data.flag){
            if(result.data.rows.length>0){
              self.scopeLength = result.data.rows.length;
              for(var i=0;i<result.data.rows.length;i++){
                var list = {value: "",label: ''};
                list.value = result.data.rows[i].unitCode;
                list.label = result.data.rows[i].unitName;
                self.scopeSelection.push(list);
              }
            }
          }
        }).catch(function(erro){
           console.log(erro)
        })
      },
      //获取 广播范围 选中后的结果
      RegionSelection:function(data,index){
        var self = this;
        if(data.length !== 0){
          self.RegionSelect=data; self.RegionSelectOther=data;
          self.$emit("regionChanged",self.RegionSelect); //自定义事件  传递值“子向父组件传值”
        }else{
          self.RegionSelect="";self.RegionSelectOther="";
          self.$emit("regionChanged",self.RegionSelect); //自定义事件  传递值“子向父组件传值”
        }
      },
    }
  }
</script>

<style>
  .regionBox{width:100%;}
</style>
