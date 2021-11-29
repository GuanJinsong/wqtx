<template>
  <div class="ind_rigParent"
    v-loading.fullscreen.lock="loadingRight"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.3)"
  >
    <div class="tempBoxTitle"><h6>报警次数排名榜</h6><p><b><span></span></b></p></div>
	  <div class="ind_rigTag" @click="changeAlarmRanking()">
      <span class="el-icon-sort-down" title="多到少排序" v-bind:class="teg==1?'tagSelect':''"></span>
      <span class="el-icon-sort-up"  title="少到多排序" v-bind:class="teg==2?'tagSelect':''"></span>
    </div>
    <div class="ind_regPicker">
      <button class="ind_rgeTimeBtn" @click="clickGetRankList(2)" v-bind:class="rankBthSelect==2?'rankBthSele':''">按月</button>
      <button class="ind_rgeTimeBtn" @click="clickGetRankList(1)" v-bind:class="rankBthSelect==1?'rankBthSele':''">按周</button>
      <div class="ind_regTimeSelect">
        <el-date-picker
            v-model="rankTime"
            type="daterange"
            @change="rankDaySelect"
            range-separator="-"
            start-placeholder="开始时间"
            end-placeholder="结束时间">
        </el-date-picker>
      </div>
    </div>
    <ul class="ind_rigList">
      <li v-for="(list,index) in rankList" v-bind:key="index">
        <p>{{index+1}}</p><p>{{list.room}}</p><p>{{list.alarmNum}}次</p>
      </li>
      <noMoreData v-if="rankList.length == 0"/>
    </ul>
  </div>
</template>

<script>
  import noMoreData from "../publicComponemts/noMoreData.vue";
  export default{
    name:"IndexRight",
    components:{
      noMoreData:noMoreData
    },
    data(){
      return{
        loadingRight:false,
        rankList:[],
        teg:1,
        rankTime:"",
        rankBthSelect:0,
        start:'',
        end:''
      }
    },
    created() {
      this.dormitoryAlarmRanking(1,"","","");
    },
    methods:{
      //宿舍报警排序切换
      changeAlarmRanking:function(){
        var rankType = "";
        var startTime = "";
        var endTime = "";
        if(this.rankBthSelect !==0){rankType = this.rankBthSelect};
        if(this.rankTime !== ""){startTime=this.start;endTime=this.end};
        if(this.teg==1){
          this.teg = 2;this.dormitoryAlarmRanking(2,rankType,startTime,endTime);
        }else{
          this.teg = 1;this.dormitoryAlarmRanking(1,rankType,startTime,endTime);
        }
      },
      //时间选择器监听
      rankDaySelect:function(data){
        console.log(data);
        if(data !== null){
          var newVal = this.GMTToStr(data[0])+"00:00:00";
          var endVal = this.GMTToStr(data[1])+"23:59:59";
          this.start=newVal;this.end=endVal;this.rankBthSelect=0;
          this.dormitoryAlarmRanking(this.teg,"",newVal,endVal);
        }else{
          this.start="";this.end="";this.rankTime="";this.rankBthSelect=0;
          this.dormitoryAlarmRanking(this.teg,"","","");
        }
      },
      //将时间选择器选中的 格林威治时间格式 转化为普通格式YY-MM-DD
      GMTToStr:function(time){
          let date = new Date(time)
          var month = date.getMonth() + 1;
          if(month<10){month = "0"+month};
          var day = date.getDate();
          if(day<10){day = "0"+day};
          let Str=date.getFullYear()+'-'+month+'-'+day+ ' '
          return Str
      },
      //点击"按周","按月",获取排名列表
      clickGetRankList:function(ranktype){
        if(this.rankBthSelect == ranktype){
          this.start="";this.end="";this.rankTime="";this.rankBthSelect=0;
          this.dormitoryAlarmRanking(this.teg,0,this.start,this.end);
        }else{
          this.start="";this.end="";this.rankTime="";this.rankBthSelect=ranktype;
          this.dormitoryAlarmRanking(this.teg,ranktype,this.start,this.end);
        }
      },
      //宿舍报警排名请求
      dormitoryAlarmRanking:function(type,rankType,startTime,endTime){
        var self = this;
        var url = "/sdm/alarmrecord/getAlarmRank";
        var data = {pageSize:50,type:type,timeType:rankType,startTime:startTime,endTime:endTime};
        self.loadingRight =true;
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            if(result.data.dataList.length>0){
              self.rankList = result.data.dataList;
            }else{self.rankList = [];}
            self.loadingRight =false;
          }else{
            self.rankList = []; self.loadingRight =false;
          }
        }).catch(function(erro){
           console.log(erro); self.loadingRight =false;
        })
      },
    }
  }
</script>

<style>
  @import url("../../../static/css/Index/IndexRight.css");
</style>
