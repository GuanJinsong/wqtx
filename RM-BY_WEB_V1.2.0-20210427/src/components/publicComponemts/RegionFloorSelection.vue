<!-- 宿舍楼栋选择，三级选项 -->
<template>
  <div class="regionBox">
    <el-cascader v-model="RegionSelect" :options="scopeSelection" popper-class="floorName" :props="{multiple:true}" collapse-tags clearable @change="RegionFloorSelection"  placeholder="请选择应用范围"></el-cascader>
  </div>
</template>

<script>
  var stus = false;
  export default{
    name:"RegionSelection",
    props:["RegionFloorData"],
    data(){
      return{
        RegionSelect:[],        //新数据
        RegionSelectOther:"",   //旧数据
        scopeSelection: [{value:"00000",label:'全部',children:[{value:"00000",label:'全部'}]}],     //范围可选择值
        scopeLength:0,
      }
    },
    created() {
      this.getUnitAndFloor();
    },
    watch:{
      RegionFloorData:function(data){
        //如果data="",清空选择框内的值
        if(data == ""){this.RegionSelect="";self.RegionSelectOther="";}
      }
    },
    methods:{
      //获取可选择的栋数
      getUnitAndFloor:function(){
        let [self,url] = [this,'/sdm/unit/getUnitFloorCox'];
        self.$http.post(url).then(function(result){
          console.log(result);
          if(result.data.flag){
            if(result.data.rows.length>0){
              self.scopeLength = result.data.rows.length;
              let dataList = result.data.rows;
              let unitLengt = [];
              for(let i=0;i<dataList.length;i++){
                let list = {value:"",label:"",children:[]};
                let floorList = dataList[i].floorData;
                list.value = dataList[i].unitCode;
                list.label = dataList[i].unitName;
                for(let q=0;q<floorList.length;q++){
                  let floorLeng = {floorName:floorList[q].floorCode,roomLeng:floorList[q].deviceData.length}
                  unitLengt.push(floorLeng);  //获取所有的楼层code以及楼层下对应的房间数量长度
                  let florlst = {value:"",label:"",children:[]};
                  let roomList = floorList[q].deviceData
                  florlst.value = floorList[q].floorCode;
                  florlst.label = floorList[q].floorName;
                  for(let m=0;m<roomList.length;m++){
                    let roomlst = {value:"",label:""}
                    roomlst.value = roomList[m].imei;
                    roomlst.label = roomList[m].room;
                    florlst.children.push(roomlst);
                  }
                  list.children.push(florlst);
                }
                self.scopeSelection.push(list);
              }
              //将得到的数据存入缓存中，便于父组件Man-broadcastTask使用
              localStorage.setItem('unitData',JSON.stringify(unitLengt));
            }
          }
        }).catch(function(erro){
           console.log(erro)
        })
      },
      //获取 广播范围 选中后的结果
      RegionFloorSelection:function(data,index){
        let self = this;
        if(data.length !== 0){
          let [old,news] = ['',data[0][0]];
          if(self.RegionSelectOther !== ""){
            old = self.RegionSelectOther[0][0];
          }
          if(old == ""){
            self.RegionSelect=data; self.RegionSelectOther=data;
          }else if(old !== "" && old !== "00000" && news == "00000"){
            self.RegionSelect=[["00000","00000"]];self.RegionSelectOther=[["00000","00000"]];
          }else if(old !== "" && old == "00000" && news !== "00000"){
            self.RegionSelect=data;self.RegionSelectOther=data;
          }else if(old !== "" && old !== "00000" && news !== "00000"){
            self.RegionSelect=data;self.RegionSelectOther=data;
          }else if(old !== "" && old == "00000" && news == "00000"){
            let newsLit = JSON.parse(JSON.stringify(data));
            newsLit.splice(0,1);
            self.RegionSelect=newsLit;self.RegionSelectOther=newsLit;
          }
          self.$emit("regionFloorChanged", self.RegionSelect); //自定义事件  传递值“子向父组件传值”
        }else{
          self.RegionSelect="";self.RegionSelectOther="";
          self.$emit("regionFloorChanged", self.RegionSelect); //自定义事件  传递值“子向父组件传值”
        }
      },
    }
  }
</script>

<style>
  .regionBox{width:100%;}
  .floorName .el-icon-arrow-right{top:10px!important;}
</style>
