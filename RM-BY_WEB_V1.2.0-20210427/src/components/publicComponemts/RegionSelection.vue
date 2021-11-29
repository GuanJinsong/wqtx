<!-- 楼栋选择组件1，这个组件里有 全部 这个选项 一级选项-->
<template>
  <div class="regionBox">
    <el-cascader v-model="RegionSelect" :options="scopeSelection" :props="props" collapse-tags clearable @change="RegionSelection" placeholder="请选择应用范围"></el-cascader>
  </div>
</template>

<script>
  var stus = false;
  export default{
    name:"RegionSelection",
    props:["RegionSelectData"],
    data(){
      return{
        RegionSelect:[],        //新数据
        RegionSelectOther:[],   //旧数据
        props: { multiple: true },
        scopeSelection: [{value:"00000",label:'全部'}],     //范围可选择值
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
		    console.log(data)
        var array1 = this.RegionSelectOther;
        console.log(array1)
        if(data.length !== 0){
          var news = data[0];var old = array1[0];
          //情况一：新数据里有"00000",旧数据也有"00000"
          //情况二：新数据里有"00000",旧数据里没有"00000"
          //情况三：新数据里没有"00000",旧数据里有"00000"
          //情况四：新数据里没有"00000",旧数据里也没有"00000"
          //情况五：除开全选这一项，其他所有的都被选中了，这种情况下也算全选
          if(news=="00000" && old=="00000"){
            data.forEach(function(arr,index){
              if(arr == "00000" && index ==0){
                self.RegionSelect=[];self.RegionSelectOther=[];
              }else{
                self.RegionSelect.push(arr);self.RegionSelectOther.push(arr)
              }
            })
          }else if(news=="00000" && old !=="00000"){
             self.RegionSelect=[["00000"]];self.RegionSelectOther=[["00000"]];
          }else if(news !=="00000" && data.length == self.scopeLength){
            self.RegionSelect=[["00000"]];self.RegionSelectOther=[["00000"]];
          }else{
            self.RegionSelect=data;self.RegionSelectOther=data;
          }
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
