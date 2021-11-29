<!-- 视频监控 -->
<template>
  <div class="mainView">
    <div class="v_parent">
      <div class="v_leftBox">
        <h6 class="v_title">控制中心</h6>
        <p class="v_smallTitle">1.视频回放查看：</p>
        <div class="v_playBack"><button @click="videoPlayback">视频回放(go)</button></div>
        <p class="v_smallTitle">2.视频窗口切换：</p>
        <template>
          <el-select v-model="value" placeholder="请选择" class="mySelectAll" @change="selectWindows" style="width:250px;">
            <el-option v-for="item in optionsSelect" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </template>
        <p class="v_smallTitle">3.设备选择：</p>
         <div class="sysCascader" style="width:250px;">
           <el-cascader :options="options"
           v-model="cascaderValue"
           @change="cascader"
           :props="defaultParams"
           placeholder="请选择你需要的设备..."
           popper-class="s_myCascader"
           :show-all-levels = "true"
           clearable></el-cascader>
         </div>
      </div>
      <div class="v_rightBox">
        <ul class="videoList" v-bind:class="statuClass">
          <li v-for="x in value" v-bind:key="x" v-bind:class="[eqIndex === (x-1)?'selectPlayColor':'']"><video class="demo-video" :id="'player'+(x-1)" muted autoplay @click="getRefsValue($event,x-1)"></video></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
  export default{
    name:'VideoSurveillance',
    data(){
      return{
        treeList:[],     //定义树形结构数据
        imei:'',         //定义当前选中的设备imei
        optionsSelect: [{value: 4,label: '2x2'},{value: 9,label: '3x3'},{value: 16,label: '4x4'}],    //定义视频窗口展示
        value:9,
        statuClass:'videoList3',
        eqIndex:"",                   //定义档期啊你选中的视频窗口，用于定义被选中窗口的颜色
        videoList:[],
        options:[{value: '指南',label: '指南',
          children: [{
            value: '设计原则',
            label: '设计原则',
            children: [{value: '一致',label: '一致'}]
          }]
          }],
        defaultParams: {label: 'label',value: 'value',emitPath:true,},
        cascaderValue:[],        //定义查询中Cascader的值
      }
    },
    created() {
      self = this;
      var parentData = {header:true,nav:6};
      self.$emit('headerChange',parentData);
      self.treeList = self.$store.state.treeList;   //获取vuex内存储的数据
      self.options = self.treeList.newTree;
    },
    methods:{
      //报警方案查询中Cascader的值 设备下拉框选择
      cascader:function(data){
        self.radio = 2;
        var address = data[0]+'/'+data[1]+'/'+data[2]+'/'+data[3];
        self.treeList.newList.forEach(function(arr,index){
          if(arr.detailed == address){
            self.imei = arr.data.imei;
            self.getRtspUrl(imei);   //获取设备参数
          }
        })
      },
      //视频窗口切换
      selectWindows:function(data){
         if(data == 4){
           this.statuClass = "videoList2"
         }else if(data == 9){
           this.statuClass = "videoList3"
         }else if(data == 16){
           this.statuClass = "videoList4"
         }else{
           this.statuClass = "videoList5"
         }
      },
      //获取实时视频录像路径
      getRtspUrl:function(imei){
        var self = this;
        if(self.eqIndex !== ""){self.closePlay(self.eqIndex);}
        console.log("haha")
        var data = {"imei":imei};
        var url = "/api/device/getVideoUrl";
        self.$http.post(url,data).then(function(result){
          console.log(result);
          if(result.data.flag){
            var rtspUrl = result.data.url;
            var random = (Math.random()*1000).toString();     //取一个随机数，并转化为字符串
            var rtspList = {id:random,rtsp:rtspUrl,player:null};
            var arryIndex = "";
            self.videoList.push(rtspList);
            if(self.videoList.length>0){
              self.videoList.forEach(function(arr,ind){
                if(arr.id == random){arryIndex = ind}
              })
            }
            if(self.eqIndex !== ""){
              self.startPlayVideo(arryIndex,self.eqIndex);    //如果选中了播放窗口，那就根据选中的窗口来播放
            }else{
              self.startPlayVideo(arryIndex,arryIndex);     //如果没有选中窗口那么从第一个窗口开始一次播放
            }
          }else{
            self.$taost(result.data.msg,false);
          }
        }).catch(function(erro){
          self.$taost('请求失败',false);
        })
      },
      //点击选择摄像机，开始视频播放
      startPlayVideo:function(arryIndex,playerIndex){
        var self = this;
        if (flvjs.isSupported()) {
            var videoElement = "player"+playerIndex;
            var video = document.getElementById(videoElement);
            var thisId =  self.videoList[arryIndex].id;
            var thisRtsp =  self.videoList[arryIndex].rtsp
            if (video) {
              self.videoList[arryIndex].player = flvjs.createPlayer({
                  type: "flv",
                  isLive: true,
                  url: `ws://localhost:8888/rtsp/${thisId}/?url=${thisRtsp}`
              });
              self.videoList[arryIndex].player.attachMediaElement(video);
              try{
                  self.videoList[arryIndex].player.load();
                  self.videoList[arryIndex].player.play();
              }catch(error){
                  console.log(error);
              };
            }
        }
      },
      //获取当前选中窗口
      getRefsValue:function($event,index){
        this.eqIndex = index;
      },
      //关闭当前的视频
      closePlay:function(index){
        var self = this;
        if(self.videoList.length>index){
          self.videoList[index].player.pause();
          self.videoList[index].player.unload();
          self.videoList[index].player.detachMediaElement();
          self.videoList[index].player.destroy();
          self.videoList[index].player = null;
        }
        console.log("hihi")
      },
      videoPlayback:function(){
        console.log("点击视频回放")
      }
    }
  }
</script>

<style>
  .v_parent{height:100%;width:100%;background: url("../../static/images/bk.png") no-repeat center center ;background-size: 100% 100%;display:flex;flex-wrap:nowrap;box-sizing: border-box;padding-left:300px;}
  .v_leftBox{width:300px;color:#FFFFFF;box-sizing: border-box;position:absolute;z-index:1;left:9px;top:10px;bottom:10px;padding:10px 24px 10px 10px; background: url("../../static/images/leftBk.png") no-repeat center center ;background-size: 100% 100%;}
  .v_title{line-height:35px;height:35px;text-align:center;font-size:20px;font-weight:bold;margin-bottom:10px;}
  .v_smallTitle{height:25px;line-height:25px;font-size:14px;margin-top:10px;}
  .v_playBack button{border:none;padding:5px 5px;outline:none;color:#FFFFFF;background-color:#00C5F9;}

  .v_rightBox{width:100%;height:100%;box-sizing: border-box;padding:10px 15px 10px 10px;}
  .videoParent{position:fixed;z-index:1;left:0px;top:0;right:0;bottom:0px;}
  .videoList{display:block;margin:0;padding:0;width:100%;height:100%;box-sizing: border-box;}
  .videoList li{display:flex;flex-wrap:wrap;box-sizing: border-box;border:1px solid #FFFFFF;padding:2px;float: left;overflow: hidden;background-image: url(../../static/images/novideo.png);background-repeat: no-repeat;background-size:100% 100%;cursor:pointer;}
  .videoList li video{width:100%;height:100%;}
  .videoList2 li{width:50%;height:50%;}
  .videoList3 li{width:33.3%;height:33.3%;}
  .videoList4 li{width:25%;height:25%;}
  .videoList5 li{width:20%;height:20%;}
  .leftBox{position: fixed;z-index: 2;left:0px;top:0px;bottom:0px;width:250px;color:#FFFFFF;}
  .selectPlayColor{border:1px solid red!important;}

  .sysCascader{min-height:25px;display:flex;justify-content:space-between;}
  .sysCascader .el-cascader {display: inline-block;position: relative;font-size: 12px;line-height: 24px;width:100%;}
  .sysCascader .el-input {position: relative;font-size: 12px;display: inline-block;width: 100%;}
  .sysCascader .el-input__inner {border: 2px solid #01b5e3;border-radius: 0px;height: 35px;line-height: 35px;background-color:rgba(0,0,0,0);padding: 0 10px;color:#FFFFFF;}
  .sysCascader .el-input__icon{line-height:25px;color:#01b5e3;}
  .s_myCascader{background:rgba(7,25,45,0.8);border:none;}
  .s_myCascader .el-cascader-menu{color:#FFFFFF;}
  .s_myCascader .el-scrollbar__view li:hover{background:#00FFFF!important;}
  .s_myCascader .in-active-path,.s_myCascader .is-active{background:#00FFFF!important;}
  .s_myCascader .popper__arrow::after{border-bottom-color: #041423!important;}
  .s_myCascader .el-cascader-menu{min-width:140px!important;}
  .s_myCascader .el-cascader-node{padding:0px 20px 0px 10px!important;}
  .s_myCascader .el-cascader-node__prefix{left:4px!important;}

  .mySelectAll{width:100%;}
  .mySelectAll .el-input__inner,.schemePut{width:100%;border: 2px solid #01b5e3;border-radius: 0px;height: 35px;line-height: 35px;background-color:rgba(0,0,0,0);padding: 0 10px;color:#FFFFFF;}
</style>
