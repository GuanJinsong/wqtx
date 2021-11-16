<template>
  <div class="reportPageBox" v-cloak v-if="pageTotal>1">
    <ul class="mini pageStyle">
      <li @click="getPageData(1)">首页</li>
      <li class="pageNumber" v-for="x in pagingList" v-bind:key="x" v-bind:class="{'pageSelect':a_selectPage == x}" @click="getPageData(x)">{{x}}</li>
      <li @click="getPageData(pageTotal)">末页</li>
    </ul>
  </div>
</template>

<script>
  export default{
    name:"pagingComponent",
    props:["resultData"],
    data(){
      return{
        pagingList:[1,2,3],
        a_selectPage:1,
        pageTotal:1,
      }
    },
    mounted() {
      //监听父组件 Sys-alarmLog传过来的数据
      this.$eventBus.$on("deviceListDataReturn",this.deviceListDataReturns);
    },
    methods:{
      deviceListDataReturns:function (result){
        let pageData =[];
        var nawPage = result.current;
        var allPage = result.pages;
        this.pageTotal = allPage;
        for (let k = 1; k <= allPage; k++){
        	if(nawPage<6){
        		if(k<=10){pageData.push(k);}
        	}else if(nawPage>=allPage-5){
            if(k>= allPage-10){pageData.push(k);}
        	}else{
        		if(k>nawPage-6 && k<nawPage+5){pageData.push(k);}
        	}
        }
        this.pagingList = pageData;
      },
      //获取当前的分页
      getPageData:function(index){
         this.$eventBus.$emit('updataPage',index);
         this.a_selectPage = index;
      }
    },
    beforeDestroy() {
      this.$eventBus.$off('deviceListDataReturn');  //关闭兄弟组件之间传递信息时$on会多次触发的问题
    }
  }
</script>

<style>
  .reportPageBox{width:100%;box-sizing: border-box;}
  .pageStyle{padding:15px 15px;text-align:right;}
  .pageSelect{background-color:#00CCFF;color:#FFFFFF!important;}
  .pageNumber{border:2px solid #00CCFF;color:#00CCFF;padding:0px 10px;margin:0px 5px;}
  .pageStyle li{height:30px;line-height:30px;min-width:30px;text-align:center;display:inline-block;vertical-align:middle;cursor:pointer;font-size:12px;box-sizing:border-box;}
  .pageNumber:hover{background-color:#00CCFF;color:#FFFFFF!important;}
</style>
