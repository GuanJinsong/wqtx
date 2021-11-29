<template>
  <div class="reportPageBox" v-cloak v-if="pagingList.length>0">
    <ul class="mini pageStyle">
      <li @click="getPageData(1)">首页</li>
      <li class="pageNumber" v-for="x in pagingList" v-bind:key="x" v-bind:class="{'pageSelect':a_selectPage == x}" @click="getPageData(x)">{{x}}</li>
      <li @click="getPageData(pageTotal)">末页</li>
    </ul>
  </div>
</template>

<script>
  //import Bus from "../../newObject/Bus.js";
  export default{
    name:"pagingComponentOther",
    props:["resultData"],
    data(){
      return{
        pagingList:[],
        a_selectPage:1,
        pageTotal:1,
      }
    },
    mounted() {
      //监听父组件 Sys-alarmLog传过来的数据
      this.$eventBus.$on("deviceListDataOtherReturn",this.deviceListDataReturn);
    },
    methods:{
      //根据返回的结果绘制分页
      deviceListDataReturn:function (result){
        var self = this;
        let pageData =[];
        var nawPage = result.page;
        var allPage = result.totalPage;
        self.pageTotal = allPage;
        for (let k = 1; k <= allPage; k++){
        	if(nawPage<6){
        		if(k<=10){pageData.push(k);}
        	}else if(nawPage>=allPage-5){
            if(k>= allPage-10){pageData.push(k);}
        	}else{
        		if(k>nawPage-6 && k<nawPage+5){pageData.push(k);}
        	}
        }
        self.pagingList = pageData;
      },
      //获取当前的分页
      getPageData:function(index){
        this.$eventBus.$emit('updataOtherPage',index);  //将点击后的分页码传给父级并根据分页码获取新的数据
        this.a_selectPage = index;
      }
    },
	beforeDestroy() {
		this.$eventBus.$off('deviceListDataOtherReturn');  //关闭兄弟组件之间传递信息时$on会多次触发的问题
	}
  }
</script>

<style>
  .reportPageBox{width:100%;box-sizing: border-box;}
  .pageStyle{padding:15px 0px;text-align:right;}
  .pageSelect{background-color:#05AE8F;color:#FFFFFF!important;}
  .pageNumber{border:2px solid #05AE8F;color:#05AE8F;padding:0px 10px;margin:0px 5px;}
  .pageStyle li{height:30px;line-height:30px;min-width:30px;text-align:center;display:inline-block;vertical-align:middle;cursor:pointer;font-size:12px;box-sizing:border-box;}
  .pageNumber:hover{background-color:#05AE8F;color:#FFFFFF!important;}
</style>
