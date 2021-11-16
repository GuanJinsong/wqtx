<template>
  <div class="indexRightBox">
    <ul class="indexRightList">
      <li v-for="(list,index) in alarmList" @click="openPopup(list,index)" v-bind:class="ws==true?'wsLine':''">
        <img :src="list.icoUrl"/>
        <div class="ind_RigtTitle">
          <p><span class="roomRightT">{{list.prisonDistrictName}}</span><span>{{list.prisonName}}</span></p>
          <span>{{list.t_name}}</span>
        </div>
        <p class="ind_RigtTip">{{list.message}}</p>
        <p class="ind_RigtTime">{{list.createTime}}</p>
      </li>
      <!-- <div class="loadingBox" @click="getMoreAlarem()" v-if="totalPage>0"><span v-if="loading" class="el-icon-loading"></span>{{loadingTxt}}</div> -->
      <div class="noData" v-if="alarmList.length==0"><img src="../../../static/images/n_data.png"/></div>
    </ul>

	<!-- 告警信息处理弹窗 -->
	<div class="poupParnet" v-if="alarmListPup">
		<div class="poupParnetAfter" style="width:450px;">
			<div class="poupTitle"><div class="poupTitleAfter"><h6>告警信息</h6><span @click="alarmListPup=false">×</span></div></div>
			<div class="pubCenter">
        <p class="ind_pupRoom">{{popuTitle}}</p>
        <p class="ind_pupReason">{{popuMsg}}</p>
        <ul class="ind_pupul">
          <li><span class="ind_SmTile">处理人</span>
              <input type="text" v-model="handler" class="ind_hanPut" placeholder="请输入处理人"/>
          </li>
          <li><span class="ind_SmTile">告警原因</span>
              <input type="text" v-model="reason" class="ind_hanPut" placeholder="请输入告警原因"/>
          </li>
        </ul>
      </div>
			<div class="poupSure">
				<button @click="alarmListPup =false">取消</button>
				<button @click="saveAlarmInfo()">确认</button>
			</div>
		</div>
	</div>
  </div>
</template>

<script>
  var page = 1;
  var pageSize = 10000;
  const opt = {
      lock: true,text: '加载中...',spinner: 'el-icon-loading',
      customClass:'loadingClass', background: 'rgba(0, 0, 0, 0.5)',
  }
  var importWs0 = null;
  export default {
    name: 'IndexRight',
    data () {
      return {
        handler:"",   //处理人
        reason:"",   //告警原因
        alarmListPup:false,   //告警列表弹窗
        alarmList:[],
        totalPage:1,               //定义总分页数
        loading:false,
        loadingTxt:"点击获取更多",
        popuTitle:"",  //定义报警弹窗标题
        popuMsg:"",    //定义报警弹窗内的说明语
        eventId:"",    //定义当前选中打开的报警信息id
        prisonId:"",   //定义当前正在编辑的监室id
        ws:false,
        in_index:'',   //定义当前正在操作的报警列表索引
      }
    },
    created() {
      this.getAlarmList();
      this.alarmSocket();
    },
    methods:{
      //点击获取更多报警数据
      getMoreAlarem:function(){
        var self = this;
        if(self.totalPage == page){self.loadingTxt = "没有更多数据了";return false};
        page++;self.loading = true;
        setTimeout(function(){self.getAlarmList();},500);
      },
      //获去报警列表
      getAlarmList:function(){
        let self = this;
        if(localStorage.getItem('token')!==null){
          const loading = self.$loading(opt);
          let [url,data] = ['/sup/eventInfo/queryState',{current:page,size:pageSize}];
          self.$http.post(url,data).then(function(result){
            console.log(result)
            if(result.data.flag){
              let list = result.data.data.records;
              for(let i=0;i<list.length;i++){
                let typeName = {t_name:"",icoUrl:""};
                if(list[i].type == 1){
                  typeName.t_name = "线路故障"; typeName.icoUrl = "../../../static/images/in_r1.png";
                }else if(list[i].type == 2){
                  typeName.t_name = "电流异常"; typeName.icoUrl = "../../../static/images/in_r3.png";
                }else if(list[i].type == 3){
                  typeName.t_name = "电压异常"; typeName.icoUrl = "../../../static/images/in_r2.png";
                }else if(list[i].type == 4){
                  typeName.t_name = "温度异常"; typeName.icoUrl = "../../../static/images/in_r4.png";
                }else if(list[i].type == 5){
                  typeName.t_name = "电源异常"; typeName.icoUrl = "../../../static/images/in_r5.png";
                }else if(list[i].type == 6){
                  typeName.t_name = "设备掉线"; typeName.icoUrl = "../../../static/images/in_r6.png";
                }
                Object.assign(list[i],typeName);
              }
              if(page == 1){
                self.alarmList = list;
              }else{
                let lit = JSON.parse(JSON.stringify(self.alarmList));
                let newsList = lit.concat(list);
                self.alarmList = newsList;
              }
              self.totalPage = result.data.data.pages;
              self.$emit("alarmLength",self.alarmList.length);//子向父组件Index传值
            }else{
              self.loading = false;
              self.loadingTxt = "没有更多数据"
              self.alarmList = [];
            }
            loading.close(); self.loading = false;
          }).catch(function(erro){
            loading.close(); self.loading = false;
            self.$message.error(erro.data.msg);
            console.log(erro)
          })
        }
      },
      //打开报警处理弹窗
      openPopup:function(result,index){
        console.log(result);
        this.alarmListPup = true;
        this.popuTitle = result.prisonDistrictName||''+" "+result.prisonName+" "+result.t_name;
        this.popuMsg = result.message;
        this.eventId = result.eventId;
        this.prisonId = result.prisonId;
        this.in_index = index;
      },
      //保存编辑后的报警信息
      saveAlarmInfo:function(){
        let self = this;
        const loading = self.$loading(opt);
        const url = "/sup/eventInfo/update";
        let data = {eventId:self.eventId,causeOfFailure:self.reason,updateBy:self.handler};
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.$message({message:result.data.msg,type:'success'});
            self.$eventBus.$emit("alarmLength",self.alarmList.length-1);//子向父组件Index传值
            self.$eventBus.$emit("alarmRoomState");//向邻居组件IndexLeft传递报警处理成功操作
            self.alarmList.splice(self.in_index,1);
          }else{
            self.$message({message:result.data.msg,type:'warning'});
          }
          loading.close(); self.alarmListPup = false;
        }).catch(function(erro){
          loading.close(); self.alarmListPup = false;
          self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      //建立websocket
      alarmSocket:function(){
        if(localStorage.getItem('token')!==null){
          let self = this;
          let url = self.$global.socketUrl+"/sup/websocket/"+localStorage.getItem('token');
          let data = "";
          importWs0 = new WebSocket(url); //连接服务器
          importWs0.onopen = function(event){importWs0.send(data);self.ws=true;};
          importWs0.onmessage = function(event){self.webSocketReturn(event);};
          importWs0.onclose = function(event){importWs0=null;self.ws=true;};
          importWs0.onerror = function(event){importWs0=null;self.ws=true;};
        }
      },
      //websocket的回调处理方法
      webSocketReturn:function(result){
        let res = JSON.parse(result.data);
        let newList = {'icoUrl':'','prisonDistrictName':res.prisonDistrictName,'prisonName':res.prisonName,
          't_name':'','message':res.message,'createTime':res.createTime,'eventId':res.eventId
        }
        if(res.type == 1){
          newList.t_name = "线路故障"; newList.icoUrl = "../../../static/images/in_r1.png";
        }else if(res.type == 2){
          newList.t_name = "电流异常"; newList.icoUrl = "../../../static/images/in_r3.png";
        }else if(res.type == 3){
          newList.t_name = "电压异常"; newList.icoUrl = "../../../static/images/in_r2.png";
        }else if(res.type == 4){
          newList.t_name = "温度异常"; newList.icoUrl = "../../../static/images/in_r4.png";
        }else if(res.type == 5){
          newList.t_name = "电源异常"; newList.icoUrl = "../../../static/images/in_r5.png";
        }else if(res.type == 6){
          newList.t_name = "设备掉线"; newList.icoUrl = "../../../static/images/in_r6.png";
        }
        this.alarmList.unshift(newList);
        this.$eventBus.$emit("alarmLength",this.alarmList.length);//子向父组件Index传值
        //这里判断一下当前的报警信息所属监室，来自相同监室的报警只触发一次下面的方法，避免多次触发
        if(this.prisonId !== res.prisonId){
          this.$eventBus.$emit("alarmRoomState");//向邻居组件IndexLeft传递报警处理成功操作
          this.prisonId = res.prisonId
        }
      }
    },
    beforeDestroy() {
      page = 1;  //重置分页
      if(importWs0 !== null){importWs0.close();importWs0=null;this.ws=true;}
    }
  }
</script>

<style>
  @import url("../../../static/css/Index/IndexRight.css");
</style>
