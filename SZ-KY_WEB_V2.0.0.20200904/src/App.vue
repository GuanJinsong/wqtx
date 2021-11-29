<template>
  <div id="app">
    <div class="appAfter">
      <section v-show="header">
        <header class="View-head">
            <div class="View-head-left">
                <ul>
                    <li>快鱼生态因子监测平台</li>
                    <li v-for="(nav,index) in navList"
                    v-bind:key="index"
                    @click="changeTemplate(index,nav.path)"
                    v-bind:class="nav.id === navSelect?'View-head-bg':''">{{nav.name}}</li>
                </ul>
            </div>
            <div class="View-head-right">
                <div class="XX" @click="drawer = true" type="primary"><img src="../static/images/xx1.png" alt=""> <span v-if="alarmNumber.untrNum>0">{{alarmNumber.untrNum}}</span></div>
                <div class="user1">{{userName}}</div>
                <div class="time1" :title="realTime">{{realTime}}</div>
                <el-tooltip placement="bottom-end">
                  <i class="closeBtn el-icon-user"></i>
                  <div class="userLofinOut" slot="content">
                    <p @click="loginOut()"><i class="el-icon-switch-button"></i> <span>退出登录</span></p>
                    <p @click="dialogFormVisible = true"><i class="el-icon-unlock"></i> <span>修改密码</span></p>
                  </div>
                </el-tooltip>
                <!-- 0:全局设备报警 1:首页左侧列表实时数据 2:首页左侧自定义关注设备1 3:首页左侧自定义关注设备2 4:首页由侧折线图实时数据-->
                <ul class="socketStatu">
                  <li v-for="(list,index) in $store.state.webSocketStatu" v-bind:class="list.socket == true?list.name:''" :title="list.title">&nbsp;</li>
                </ul>
            </div>
        </header>
      </section>
      <!-- 全局router-view -->
      <router-view @headerChange="getHeaderStatus" @getUserInfo="getUserInfoTo"/>
    </div>

    <!-- 报警提示栏 -->
    <el-drawer custom-class="allDrawer" :visible.sync="drawer" @open="drawerOpen" :with-header="false" :show-close="false">
      <div class="a_alarmListPart">
      <div class="a_drawerTitle">报警信息记录</div>
      <div class="a_alarmType">
        <p v-bind:class="typeSatau==0?'typeSelect':''" @click="alarmRecordChange(0)">全部({{alarmNumber.allNum}})</p>
        <p v-bind:class="typeSatau==1?'typeSelect':''" @click="alarmRecordChange(1)">未处理({{alarmNumber.untrNum}})</p>
        <p v-bind:class="typeSatau==2?'typeSelect':''" @click="alarmRecordChange(2)">处理中({{alarmNumber.procNum}})</p>
        <p v-bind:class="typeSatau==3?'typeSelect':''" @click="alarmRecordChange(3)">处理完成({{alarmNumber.finishNum}})</p>
      </div>
      </div>
      <ul class="a_alarmList verticalScroll">
        <li v-for="(list,index) in A_alarmList" v-bind:key="index">
          <div class="a_alarmPram">
            <p v-bind:style="{color:list.color}">{{list.parametername}}报警</p><i v-bind:style="{color:list.color}">{{list.imei}}</i>
            <span class="tipRed" v-if="list.alarmState==1">{{list.alarmStateTxt}}</span>
            <span class="tipYellow" v-else-if="list.alarmState==2">{{list.alarmStateTxt}}</span>
            <span class="tipGread" v-else-if="list.alarmState==3">{{list.alarmStateTxt}}</span>
          </div>
          <div class="a_alarmResult">设备报警结果：{{list.alarmContent}}</div>
          <div class="a_alarmAddress">设备地址:{{list.city}}/{{list.county}}/{{list.river}}/{{list.address}}</div>
          <div class="a_alarmTime">报警时间：{{list.timeStr}}</div>
          <div class="a_alarmBtn">
            <button v-if="list.alarmState == 1" @click="clickStartHandleAlarm(list.alarmRcdId,2)">开始处理</button>
            <button v-if="list.alarmState == 2" @click="clickStartHandleAlarm(list.alarmRcdId,3)">处理完成</button>
            <button v-if="list.alarmState == 3" @click="deteleHandSuccess(list.alarmRcdId)">删除记录</button>
          </div>
        </li>
      </ul>

    </el-drawer>

    <!-- 修改密码对话框 -->
    <el-dialog title="修改密码" :visible.sync="dialogFormVisible" custom-class="passDialog">
      <el-form :model="form">
        <el-form-item label="旧密码" :label-width="formLabelWidth">
          <el-input v-model="form.oldPassWord" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="新密码" :label-width="formLabelWidth">
          <el-input v-model="form.newPassWord" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="changePassword()">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 背景动画容器 -->
    <div id="particles-js"></div>
  </div>
</template>

<script>
var allWs = null;
export default {
  name: 'App',
  data(){
    return{
      header:false,                        //从store中获取页头应该属于的状态
      ws_light:false,                      //定义websockert已经连接
      drawer: false,                       //定义设备报警栏状态
      dialogFormVisible:false,             //定义修改密码对话框
      formLabelWidth:"120px",
      form:{oldPassWord:'',newPassWord:''},
      realTime:'2020-07-17 09:30:00',      //获取当前时间
      alarmNumber:{allNum:0,untrNum:0,procNum:0,finishNum:0},      //定义当前的设备报警信息未处理的条数
      userName:'',                         //定义当前的用户名
      navList:[
        {id:0,name:'首页',path:'Index'},
        {id:1,name:'用户管理',path:'UserManagement'},
        {id:2,name:'设备管理',path:'DeviceManagement'},
        {id:3,name:'系统设置',path:'SystemSetup'},
        {id:4,name:'历史数据',path:'HistoricalData'},
        {id:5,name:'电子围栏',path:'RegionalFenceParent'},
        // {id:6,name:'视频监控',path:'VideoSurveillance'},
      ],
      navSelect:0,
      A_alarmList:[],                 //定义报警列表
      allAlarmList:[],                //定义全部报警列表数据
      untreated:[],                   //未处理的报警列表
      processing:[],                  //处理中的报警列表
      finish:[],                      //处理完成的列表
      typeSatau:0,                    //定义当前报警列表选中的类型
    }
  },
  created() {
    this.checkUserLogin();   //判断用户是否登录，未登录必须先去登录
    var role = localStorage.getItem('role');
    if(role>1){this.navList.splice(1, 1)};
    this.userName = localStorage.getItem('userName');
    this.getTheCurrentTime();
    this.getAlarmInquiryList(1);  //获取报警列表
  },
  mounted() {
    this.backgroundAnimation1();   //背景动画1(两个背景动画不可同时使用，可以二选一)
    //this.backgroundAnimation2();  //背景动画2
  },
  methods:{
    //判断用户是否登录，否则返回登录
    checkUserLogin:function(){
      var self = this;
      var userKey = localStorage.getItem('userKey');
      if(userKey == undefined || userKey == null){
        self.$router.push({path:'/',name:'Login'});
        history.pushState(null, null, document.URL);
        window.addEventListener("popstate",function(e) {
            history.pushState(null, null, document.URL);
        }, false);
      }
    },
    //获取子组件传过来的数据，用于修改公共头部是否显示
    getHeaderStatus(data){
       this.header = data.header;
       this.navSelect = data.nav;
    },
    getUserInfoTo(data){
      this.userName = data.userName;
      this.getAlarmInquiryList(1);   //如果用户身份发生变化重新获取用户报警信息
      if(data.role == 1 && this.navList[1].id !== 1){
        this.navList.splice(1, 0, {id:1,name:'用户管理',path:'UserManagement'})
      }else if(data.role == 1 && this.navList[1].id == 1){
        return false;
      }else if(data.role !== 1 && this.navList[1].id == 1){
        this.navList.splice(1, 1);
      }else if(data.role !== 1 && this.navList[1].id !== 1){
        return false;
      }
    },
    //导航栏切换
    changeTemplate:function(index,path){
      this.navSelect = index;
      this.$router.push({path: path,name: path});
    },
		//=================获取当前的时间开始===========================
		getTheCurrentTime:function(){
      var self = this;
			setInterval(function(){
				let data = new Date();
				let year = data.getFullYear();
				let month = data.getMonth() + 1;
				let day = data.getDate();
				let hours = data.getHours();
				let m = data.getMinutes();
				let se = data.getSeconds();
				let newData = year + "-" +(month<10 ? "0" + month : month) + "-" +(day<10 ? "0"+ day : day)+" "+(hours<10 ? "0"+ hours : hours) + ":"+(m<10 ? "0" + m : m) + ":"+(se<10 ? "0" +se : se);
				self.realTime = newData;
			}, 1000);
		},
		//=================获取当前的时间结束===========================

    //============================退出登录开始=========================
    //退出登录
    loginOut:function(){
      var self = this;
      self.$confirm('是否确认退出登录?', '退出提示', {
        confirmButtonText: '确定',cancelButtonText: '取消',type: 'warning'
      }).then(() => {
        localStorage.clear();
        var x_deviceInfo = {imei:"",deviceName:""};
        self.$store.dispatch('A_modifydeviceDate',x_deviceInfo);   //清空vuex内的当前选中设备的信息
        self.$router.push({path:'/',name:'Login'});
        history.pushState(null, null, document.URL);
        window.addEventListener("popstate",function(e) {
            history.pushState(null, null, document.URL);
        }, false);
      }).catch(() => {
        console.log("退出失败")
      });
    },
    //============================退出登录结束=========================
    //============================修改密码开始=========================
    changePassword:function(){
      var self = this;
      if(self.form.oldPassWord == ''){self.$message({message: '旧密码不得为空',type: 'warning'});return false}
      if(self.form.newPassWord == ''){self.$message({message: '新密码不得为空',type: 'warning'});return false}
      var url = "/api/login/updatePsw";
      var data = {userKey:localStorage.getItem('userKey'),oldpsw:self.form.oldPassWord,newpsw:self.form.newPassWord};
      self.$http.post(url,data).then(function(result){
        if(result.data.flag){
          self.$message({message: result.data.msg,type: 'success'});
          localStorage.clear();
          self.dialogFormVisible = false
          self.$router.push({path:'/',name:'Login'});
        }else{
          self.$message.error(result.data.msg);
        }
      }).catch(function(erro){
        self.$message.error(erro.data.msg);
      })
    },
    //============================修改密码结束=========================
    //==============================================报警记录查询及其进程处理开始====================================
    //打开抽屉时重新请求一次报警数据
    drawerOpen:function(){
      this.getAlarmInquiryList(1);
    },
    //开始获取报警全部报警记录
    getAlarmInquiryList:function(page){
      var self = this;
      //传入的参数设备码imei，时间startDate，endDate都为空表示获取全部设备全部时间的报警记录
      var userKey = localStorage.getItem("userKey");
      if(userKey == "" || userKey == null || userKey == undefined){return false;}  //如果userKey不存在，说明是第一次登陆，此时取消报警记录请求
      var data = {imei:"",userKey:userKey,startDate:"",endDate:"",page:page,pageSize:99};
      var url = "/api/alarmrecord/getAlarmRecord";
      self.$http.post(url,data).then(function(result){
        console.log(result)
        if(result.data.flag){
          self.untreated = [];self.processing = [];self.finish = [];    //先清空原来的值
          var Resut = result.data.dataList;
          self.alarmNumber.allNum = Resut.length;
          if(Resut.length>0){
            for(var i=0;i<Resut.length;i++){
              if(Resut[i].alarmState == 1){
                var lis1 = {alarmStateTxt:"未处理"};
                Object.assign(Resut[i],lis1);
                self.untreated.push(Resut[i]);  //未处理的报警列表
              }else if(Resut[i].alarmState == 2){
                var lis2 = {alarmStateTxt:"处理中.."};
                Object.assign(Resut[i],lis2);
                self.processing.push(Resut[i]);  //处理中的报警列表
              }else{
                var lis3 = {alarmStateTxt:"处理完成"};
                Object.assign(Resut[i],lis3);
                self.finish.push(Resut[i]);   //处理完成的列表
              }
            }

            //定义一个数据归类函数： 将得到的所有报警数据进行 分类过滤，相同的数据归为一类
            let dataDeal = (data) => {
              let listArr = [];
              data.forEach(function (value, index) {
                  var frist = value.imei+value.alarmContent,obj = [];
                  for (let i = 0; i < listArr.length; i++) {
                    var second = listArr[i][0].imei+listArr[i][0].alarmContent;
                    if (second == frist){listArr[i].push(value); return;}
                  }
                  obj.push(value);
                  listArr.push(obj);
              });
              return listArr;
            };
            //运用上面的数据归类函数，开始执行数据归类：
            let resultDataDeal = dataDeal(Resut);
            var colorList = self.$global.colorList;   //自定义的颜色数据集合，根据需要应用对应的颜色
            //将上一步得到的归类数据分别标记上不同的颜色，同一类的数据将标记上相同的颜色，便于页面上的展示
            resultDataDeal.forEach(function(arr,index){
            	var color = colorList[index];
            	arr.forEach(function(list,indx){
            		var col = {'color':color};
            		Object.assign(list,col)
            	})
            })

            self.allAlarmList = Resut;    //全部报警列表
            self.alarmNumber.untrNum = self.untreated.length;
            self.alarmNumber.procNum = self.processing.length;
            self.alarmNumber.finishNum = self.finish.length;
            self.alarmRecordChange(self.typeSatau);
          }else{
            self.allAlarmList = [];    //全部报警列表
            self.alarmNumber.allNum = 0;
            self.alarmNumber.untrNum = 0;
            self.alarmNumber.procNum = 0;
            self.alarmNumber.finishNum = 0;
            self.alarmRecordChange(self.typeSatau);
          }
          self.obtainAlarmAlertForEquipment();   //获取实时报警信息
        }else{
          self.$message.error(result.data.msg);
        }
      }).catch(function(erro){
        self.$message.error("请求服务器异常");
      })
    },
    //报警记录选择切换
    alarmRecordChange:function(type){
      var self = this;
      self.typeSatau=type;
      switch(type){
        case 0:self.A_alarmList = self.allAlarmList;break;
        case 1:self.A_alarmList = self.untreated;break;
        case 2:self.A_alarmList = self.processing;break;
        case 3:self.A_alarmList = self.finish;break;
        default:
        return false
      }
    },
    //点击开始处理或处理完成修改报警信息的状态
    clickStartHandleAlarm:function(RcdId,State){
      var self = this;
      var data = {alarmRcdId:RcdId,alarmState:State};
      var url = "/api/alarmrecord/editAlarmRecord";
      self.$http.post(url,data).then(function(result){
        console.log(result)
        if(result.data.flag){
          self.$message({message:result.data.msg,type: 'success'});
          self.getAlarmInquiryList(1);
        }else{
          self.$message.error(result.data.msg);
        }
      }).catch(function(erro){
        self.$message.error(erro.data.msg);
      })
    },
    //删除已经处理完成的报警状态
    deteleHandSuccess:function(RcdId){
      var self = this;
      var data = {alarmRcdId:RcdId};
      var url = "/api/alarmrecord/delAlarmRecord";
      self.$http.post(url,data).then(function(result){
        console.log(result)
        if(result.data.flag){
          self.$message({message:result.data.msg,type: 'success'});
          self.getAlarmInquiryList(1);
        }else{
          self.$message.error(result.data.msg);
        }
      }).catch(function(erro){
        self.$message.error(erro.data.msg);
      })
    },
    //==============================================报警记录查询及其进程处理结束====================================

    //==============================================全局设备报警弹窗提醒开始============================================
    //开始连接设备报警
    obtainAlarmAlertForEquipment:function(){
      var self = this;
      var userKey = localStorage.getItem("userKey");
      if(allWs !== null){allWs.close()};
      allWs = new WebSocket(self.$global.socketUrl+"/api/websocketAlarm"); //连接服务器
      allWs.onopen = function (event){
        allWs.send(userKey);
        var statu = {index:0,sta:true};  //index是索引，sta是状态，已连接为true,反之为false
        self.$store.dispatch('A_pageWebSocketStatu',statu);
      };
      allWs.onmessage = function (event){
        var strData = JSON.parse(event.data);
        self.processingReturnedData(strData);
        self.getAlarmInquiryList(1);   //重新获取报警记录
      };
      allWs.onclose = function (event){
        var statu = {index:0,sta:false};  //index是索引，sta是状态，已连接为true,反之为false
        self.$store.dispatch('A_pageWebSocketStatu',statu);
      };
      allWs.onerror = function (event){
        var statu = {index:0,sta:false};  //index是索引，sta是状态，已连接为true,反之为false
        self.$store.dispatch('A_pageWebSocketStatu',statu);
      };
    },

    //处理设备警报返回数据
    processingReturnedData:function(data){
      var self = this;
      self.tipId = data.alarmId;    //定义当前的报警设备id,屏蔽设备报警时会用到
      var address = "设备地址："+data.city+''+data.county+''+data.river+''+data.address;   //定义设备地址
      var alarmTime = "时间："+data.time;
      var tipWord = "";
      var deveceNumber = "";
      if(data.alarmType == 1){
        deveceNumber = "设备编号："+data.imei;
        tipWord = "检测结果：检测到当前 "+data.parameterName+" 为   "+data.value+","+data.alarmSelect
      }else if(data.alarmType == 2){
        deveceNumber = "设备编号："+data.imei;
        tipWord = "检测结果：检测到当前设备 发生了掉线.";
      }else if(data.alarmType == 3){
        deveceNumber = "设备编号："+data.imei;
        tipWord = "检测结果：设备脱离电子围栏";
      }
      var tipHtml = "<div class='d_box'><div class='d_number'>"+deveceNumber+"</div><div class='d_word'>"+tipWord+"</div><div class='d_address'>"+address+"</div><div class='d_time'>"+alarmTime+"</div></div>";
      self.$notify({
        title: '设备报警提醒',
        dangerouslyUseHTMLString: true,
        message: tipHtml,
        duration: 0,
        customClass:'allTipName',
        type: 'warning'
      });
    },
    //==============================================全局设备报警弹窗提醒结束============================================


    //===========================================设置粒子背景开始=======================================
    //两种动画背景，根据实际需要，二选其一
    //粒子背景1
    backgroundAnimation1:function(){
      const oScript = document.createElement('script');
      oScript.type = 'text/javascript';
      oScript.src = "../../static/js/particles.min.js";
      document.body.appendChild(oScript);
    },
    //粒子背景2
    backgroundAnimation2:function(){
      const oScript = document.createElement('script');
      oScript.type = 'text/javascript';
      oScript.src = "../../static/js/particleAnimation.js";
      document.body.appendChild(oScript);
    },
    //===========================================设置粒子背景结束=======================================
  },
  destroyed() {
    if(allWs !== null){allWs.close()}
  }
}
</script>

<style>

</style>
