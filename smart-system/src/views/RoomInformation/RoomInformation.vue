<!-- 监室信息 -->
<template>
  <div class="defaultName">
    <div class="rf_parent">
      <div class="rf_Titile"><h6>监室信息</h6> <p @click="returnGo1()"><img src="../../../static/images/return.png"/><span>返回</span></p></div>
      <!-- 监室信息 -->
      <section class="rf_infoParent">
        <div class="rf_info">
          <div class="rf_infoLeft">
            <div class="rf_infoLeftAfter">
              <div class="rf_infoLeftName">
                <p>{{roomInfo1.area}}</p>
                <p><span>{{roomInfo1.prison}}</span></p>
                <p>监室类型：{{roomInfo1.prisonType}}</p>
              </div>
              <ul class="rf_infoLeftList">
                <li>强电Ip:{{roomInfo1.strongIp}}</li>
                <li>弱电Ip:{{roomInfo1.weakIp}}</li>
                <li>强电数量:{{roomInfo1.strongNum}}</li>
                <li>弱电数量:{{roomInfo1.weakNum}}</li>
                <li><el-switch v-model="roomInfo1.state" @change="setPrisonHuman"
                active-color="#0c9ec5" inactive-color="#4a4b4b"
                active-text="有人" inactive-text="无人"></el-switch></li>
              </ul>
            </div>
          </div>
          <div class="rf_infoRight">
            <ul class="rf_infoRightUl">
              <li><img src="../../../static/images/para1.png"/> <p><span>湿度</span> <span>{{roomInfo2.humidity}} <sub>%RH</sub></span></p></li>
              <li><img src="../../../static/images/para2.png"/> <p><span>温度</span> <span>{{roomInfo2.temper}} <sub>℃</sub></span></p></li>
              <li><img src="../../../static/images/para3.png"/> <p><span>空气质量</span> <span>{{roomInfo2.air}} <sub>ppm</sub></span></p></li>
              <li><img src="../../../static/images/para4.png"/> <p><span>流明度</span> <span>{{roomInfo2.lumen}} <sub>Lux</sub></span></p></li>
            </ul>
          </div>
        </div>

        <!-- 弱电设备开关管理 -->
        <div class="rf_devcieSwitch">
          <div class="rf_devcieSwitchAt">
            <div style="width:180px;height:30px;"></div>
            <!-- <div class="editMM" style="width:180px;">
              <el-select v-model="groupingType" @change="defaultGrouping" placeholder="预设分组选择">
                <el-option v-for="item in grouping" :key="item.planId" :label="item.name" :value="item.planId"></el-option>
              </el-select>
            </div> -->
            <div class="rf_devcieBtn">
              <button @click="oneButtonSwitch(1)">一键开启</button>
              <button @click="oneButtonSwitch(0)">一键关闭</button>
            </div>
          </div>
          <!-- 中间部分的表格(弱电部分) -->
          <div class="rf_tableBox" v-show="changeState==4">
            <div class="rf_table" v-for="(item,index) in roomInfo3" v-bind:key="index">
              <ul class="rf_head rf_List"><li>开关</li><li>设备</li><li title="电压/电流">电压/电流</li><li>状态</li></ul>
              <ul class="rf_body rf_List" v-for="(list,ind) in item" v-bind:key="ind">
                <li><el-switch v-model="list.switchState" :disabled="list.disable"
                    active-color="#00CCFF" inactive-color="#5a5858"
                    @change="weakPassWayOpenClose($event,list,index,ind)"></el-switch></li>
                <li>{{list.prisonJackName}}</li> <li :title="list.electric">{{list.electric}}</li>
                <li v-bind:class="list.eventState==0?'rfTbColor':(list.eventState==1?'rfTbColor1':'')">{{list.devState}}</li>
              </ul>
            </div>
          </div>
          <!-- 强电部分 -->
          <div class="rf_tableBox2" v-show="changeState==1">
            <ul class="rf_deviceVlueUl">
              <li v-for="(item,index) in roomInfo4" v-bind:key="index" v-bind:class="item.lineState==0?'rf_lineOutBk':''" >
                <p class="rf_deviceStatus">
                  <span v-bind:class="item.jackState==0?'s_back':''" @click="storngPassStart(item,0,index)">关闭</span>
                  <span v-bind:class="item.jackState==1?'s_back':''" @click="storngPassStart(item,1,index)">开启</span>
                  <span v-bind:class="item.patternState==0?'s_back':''" @click="storngDevAuto(item,index)">{{item.patternState==0?'自动':'手动'}}</span>
                </p>
                <div class="rf_deviceVlue rfColor" v-if="item.eventState==0">
                  <img src="../../../static/images/dian2.png"/>
                  <p>{{item.prisonJackName}}</p> <span>正常</span>
                </div>
                <div class="rf_deviceVlue rfColor2" v-else-if="item.eventState==1">
                  <img src="../../../static/images/dian1.png"/>
                  <p>{{item.prisonJackName}}</p> <span>异常</span>
                </div>
                <div class="rf_deviceVlue rfColor2" v-else-if="item.eventState==2">
                  <img src="../../../static/images/dian3.png"/>
                  <p>{{item.prisonJackName}}</p> <span>不存在</span>
                </div>
                <div class="rf_deviceVlue rfColor2" v-else>
                  <img src="../../../static/images/dian3.png"/>
                  <p>{{item.prisonJackName}}</p> <span>离线</span>
                </div>
                <div class="rf_deviceVlue rf_lineONBk"><i>{{item.s_electric}}</i></div>
              </li>
            </ul>
          </div>
          <!-- 表格下的切换按钮 -->
          <div class="rf_changeBtn">
            <button @click="chengeTable(4)" v-bind:class="changeState==4?'rf_BtnSelect':''">弱电</button>
            <button @click="chengeTable(1)" v-bind:class="changeState==1?'rf_BtnSelect':''">强电</button>
          </div>
        </div>

        <!-- 功耗折线图 -->
        <div class="rf_charts">
          <div class="rfnoData" v-if="y_LineChart.length==0"><img src="../../../static/images/n_data.png"/></div>
          <div id="rf_lineChart"></div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
  var areaBasicChart = null;   //定义折线图对象
  var areaBasicOption = "";   //定义折线图初始数据对象
  var interv = null;  //定义定时器
  var opt = {
      lock: true,text: '加载中...',spinner: 'el-icon-loading',
      customClass:'loadingClass', background: 'rgba(0, 0, 0, 0.5)',
  }
  var loading = "";
  export default{
    name:"RoomInformation",
    data(){
      return{
        areaName:"",      //定义当前监室所属的监区名称
        prisonTypeId:'',  //定义当前监室所属监区id
        prisonId:"",      //定义其他组件传过来的当前监室的id
        passWayList:[],   //定义所有的监室类型
        heightWidth:"",
        value:true,
        groupingType:"",    //分组类型值
        grouping: [],   //预设分组可选值
        changeState:4,  //1强电4弱电
        roomInfo1:{area:"",prison:"101",prisonType:"---",strongIp:"---",
                  weakIp:"---",strongNum:'',weakNum:'',state:false
                  },  //定义当前房间的信息1
        roomInfo2:{humidity:0,temper:0,air:0,lumen:0},  //定义当前房间的信息2
        roomInfo3:[],   //表格通道数据(弱电)
        roomInfo4:[],   //强电列表数据
        s_equipmentInfoId:"",   //强电所属设备id
        w_equipmentInfoId:"",   //弱电所属设备id
        x_LineChart:[],  //定义x轴数据
        y_LineChart:[],  //定义y轴的数据,
        repeatTimer: 0 // 定时请求刷新数据
      }
    },
    created() {
      let parentData = localStorage.getItem("headState");
      this.$emit('headerChange',JSON.parse(parentData));
	    this.windowOnresize();  //监听窗口变化
      this.getRoomTypeList();    //获取所有的监室类型
      if(this.$route.query !== ""){
        this.prisonId = this.$route.query.prisonId;
        this.areaName = this.$route.query.name;
        this.prisonSelelct(this.$route.query.prisonId);
        let self = this;
        // interv = setInterval(function(){
        //   self.prisonSelelct(self.$route.query.prisonId);
        // },4000)
      }
    },
    watch: {
      heightWidth: function (val) {
        setTimeout(function () {
          if(areaBasicChart !== ""){areaBasicChart.resize();}
        }, 300)
      },
    },
    mounted() {
      this.getAllGrouping();   //预设分组可选值的获取
      this.getHistoricalElectricity();  //历史电量功耗获取
    },
    methods:{
      //返回上一页
      returnGo1:function(){
        this.$router.go(-1);
      },
      //点击表格下的切换按钮，切换状态
      chengeTable:function(index){
        this.changeState =index;
      },
      //获取所有的监室类型
      getRoomTypeList:function(){
        let self = this;
        let [url,data] = ['/sup/prisontype/query',{current:1,size:100}];
        loading = self.$loading(opt);
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.passWayList = result.data.data.records;
            loading.close();
          }else{
            self.$message({message:result.data.msg,type:'warning'});
            loading.close();self.passWayList = [];
          }
        }).catch(function(erro){
          loading.close();self.passWayList = [];
          self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      //点击监区下的监室列表获取监室对应信息(监室详情)
      prisonSelelct:function(prisonId){
        let self = this;
        let [url,re_data] = ['/sup/equipmentInfo/queryNameEquipment',{prisonId:prisonId}];
        self.$http.post(url,re_data).then(function(result){
          console.log(result)
          //storngPass获取强电下的通道设备  //weakPass获取弱电下的通道设备
          let [storngPass,weakPass] = [[],[]];
          if(result.data.flag){
            let info = result.data.data;
            if(info !== null){
              self.prisonTypeId = info.prisonTypeId;  //所属监区id
              let [storng,weak,wayList] = [info.equipmentStrong,info.equipmentWeak,self.passWayList];  //强电//弱电
              self.roomInfo1.area = self.areaName;  //监区名称
              self.roomInfo1.prison = info.prisonName;  //监室名称
              self.roomInfo1.prisonType = info.prisonType;  //监室类型
              //判断当前的监室所处监室类值是否存在
              for(let y=0;y<wayList.length;y++){
                 if(info.prisonTypeId == wayList[y].prisonTypeId){self.roomInfo1.prisonType=wayList[y].prisonTypeName}
              }
              //=======>强电部分
              if(storng !==null){
                self.roomInfo1.strongNum = storng.prisonJackInfos.length||0;  //强电数量
                self.roomInfo1.state = storng.unmWare==0?false:true;  //是否有人的开关状态
                self.roomInfo1.strongIp = storng.equipmentIp; //强电ip
                self.s_equipmentInfoId = storng.equipmentInfoId;   //强电所属设备id
                if(storng.humiditys.length>0){self.roomInfo2.humidity = storng.humiditys[0].humidity/100;}; //空气湿度
                if(storng.ammonias.length>0){self.roomInfo2.air = storng.ammonias[0].ammonia/100;};//氨气浓度
                if(storng.temperas.length>0){self.roomInfo2.temper = storng.temperas[0].temperature/100;};//温度
                if(storng.lumens.length>0){self.roomInfo2.lumen = storng.lumens[0].lumen;}//流明度
                storngPass = storng.prisonJackInfos;   //获取强电下的通道设备
                for(let k=0;k<storngPass.length;k++){
                  //patternState自动或手动状态,lineState是一个自定义状态，用于展示的时候表现，离线设备和在线设备
                   let s_list = {'s_electric':'--V/--A','patternState':storng.patternState,'lineState':storng.state};
                   let [V,A] = [0,0];
                   if(storngPass[k].voltage.length>0){V=storngPass[k].voltage[0].voltage/100}  //获取电压
                   if(storngPass[k].current.length>0){A=storngPass[k].current[0].current/100}  //获取电流
                   s_list.s_electric = V+"V/"+A+"A"; //电压和电流
                   Object.assign(storngPass[k],s_list);
                }
                //如果强电通道数据不足4条，那么添加空列表值进行补充
                let Slent = 4-storngPass.length;
                for(let n=0;n<Slent;n++){
                  let sdev_list = {eventState:2,lineState:2,prisonJackName:"--",s_electric:"--/--",jackState:"--",patternState:0}
                  storngPass.push(sdev_list);
                }
                self.roomInfo4 = storngPass;
              }else{
                //重置湿度，氨气，温度，流明度值
                self.roomInfo2={humidity:0,temper:0,air:0,lumen:0};
                //重置强电通道数据
                for(let n=0;n<4;n++){
                  let sdev_list = {eventState:2,lineState:2,prisonJackName:"--",s_electric:"--/--",jackState:"--",patternState:0}
                  storngPass.push(sdev_list);
                }
                self.roomInfo4 = storngPass;
              }
              //=========>弱电部分
              if(weak !== null){
                self.roomInfo1.weakNum = weak.prisonJackInfos.length||0;  //弱电数量
                self.roomInfo1.weakIp=weak.equipmentIp;  //弱电ip赋值
                self.w_equipmentInfoId = weak.equipmentInfoId;   //弱电所属设备id
                weakPass = weak.prisonJackInfos;     //获取弱电下的通道设备
                for(let i=0;i<weakPass.length;i++){
                  let list = {switchState:false,electric:"--/--",devState:"--",disable:false};   //这个对象将用于页面渲染显示，
                  list.switchState = weakPass[i].jackState==0?false:true;  //如果通道状态为0则开关关闭否则开启
                  list.disable = weak.state==0?true:false;  //如果通道状态为0则开关状态禁用否则取消禁用
                  let [V,A] = [0,0];
                  if(weakPass[i].voltage.length>0){V=weakPass[i].voltage[0].voltage/100;}  //获取电压
                  if(weakPass[i].current.length>0){A=weakPass[i].current[0].current/100;}  //获取电流
                  list.electric = V+"V/"+A+"A"; //电压和电流
                  if(weakPass[i].eventState==0){
                    list.devState = "正常"
                  }else if(weakPass[i].eventState==1){
                    list.devState = "异常"
                  }else if(weakPass[i].eventState==2){
                    list.devState = "不存在"
                  }else if(weakPass[i].eventState==3){
                    list.devState = "离线"
                  }
                  //定义表格中设备的状态
                  Object.assign(weakPass[i],list);
                }
                //-----------------------情况1获取到有数据时-----------------------
                //数组补充，当合并强电和弱电数据后，总长度不足36条，那么补充空白数据
                let lent = 36-weakPass.length;
                for(let m=0;m<lent;m++){
                  let dev_list = {switchState:false,prisonJackName:"--",electric:"--/--",devState:"--",disable:true}
                  weakPass.push(dev_list);
                }
                //将上一步补充后的数据进行分组，分别以6条为一组，总共6租
                let newListArr = [];
                for(let i = 0;i<weakPass.length;i+=6){newListArr.push(weakPass.slice(i,i+6))}
                self.roomInfo3 = newListArr;   //最终赋值
              }else{
                self.roomInfo1.weakIp="---";  //弱电ip赋值
                //如果弱电为空那么将配置36条无数据的默认展示通道
                for(let m=0;m<36;m++){
                  let dev_list = {switchState:false,prisonJackName:"--",electric:"--/--",devState:"--",disable:true}
                  weakPass.push(dev_list);
                }
                //将上一步补充后的数据进行分组，分别以6条为一组，总共6租
                let newListArr1 = [];
                for(let i = 0;i<weakPass.length;i+=6){newListArr1.push(weakPass.slice(i,i+6))}
                self.roomInfo3 = newListArr1;   //最终赋值
              }
            }
          }else{
            //-----------------------情况2获取到没有数据时-----------------------
            //数组补充，当合并强电和弱电数据后，总长度不足36条，那么补充空白数据
            for(let m=0;m<36;m++){
              let dev_list = {switchState:false,prisonJackName:"--",electric:"--/--",devState:"--",disable:true}
              weakPass.push(dev_list);
            }
            //将上一步补充后的数据进行分组，分别以6条为一组，总共6租
            let newListArr2 = [];
            for(let i = 0;i<weakPass.length;i+=6){newListArr2.push(weakPass.slice(i,i+6))}
            self.roomInfo3 = newListArr2;   //弱电最终赋值

            //如果强电通道数据不足4条，那么添加空列表值进行补充
            for(let n=0;n<4;n++){
              let sdev_list = {eventState:2,lineState:2,prisonJackName:"--",s_electric:"--/--",jackState:"--",patternState:0}
              storngPass.push(sdev_list);
            }
            self.roomInfo4 = storngPass;  //强电最终赋值
            loading.close();
            self.$message({message:result.data.msg,type:'warning'});
          }

          // 如果定时器为空，过4s再次发请求
          if (self.repeatTimer === 0) {
            self.repeatTimer = setTimeout(() => {
              clearTimeout(self.repeatTimer)
              self.repeatTimer = 0
              self.prisonSelelct(self.$route.query.prisonId)
            }, 4 * 1000);
          }
        }).catch(function(erro){
          let [weakPassErro,storngPassErro] = [[],[]];  //弱电没有数据时//强电没有数据时
          //-----------------------情况3获取到没有数据时-----------------------
          //数组补充，当合并强电和弱电数据后，总长度不足36条，那么补充空白数据
          for(let m=0;m<36;m++){
            let dev_list = {switchState:false,prisonJackName:"--",electric:"--/--",devState:"--",disable:true};
            weakPassErro.push(dev_list);
          }
          //将上一步补充后的数据进行分组，分别以6条为一组，总共6租
          let newListArr3 = [];
          for(let i = 0;i<weakPassErro.length;i+=6){newListArr3.push(weakPassErro.slice(i,i+6))};
          self.roomInfo3 = newListArr3;   //弱电最终赋值

          //如果强电通道数据不足4条，那么添加空列表值进行补充
          for(let n=0;n<4;n++){
            let sdev_list = {eventState:2,prisonJackName:"--",s_electric:"--/--",jackState:"--",patternState:0};
            storngPassErro.push(sdev_list);
          }
          self.roomInfo4 = storngPassErro;  //强电最终赋值
          self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      //设置监室有人和无人
      setPrisonHuman:function(state){
        let self = this;
        let tip = state==1?"是否确定修改选中的这些监室为有人？":"是否确定修改选中的这些监室为无人？";
        self.$confirm(tip, '操作提示', {confirmButtonText: '确定',cancelButtonText: '取消',type: 'warning'
          }).then(() => {
          let loadig = self.$loading(opt);
          let url = "/sup/equipmentInfo/unware";
          let data = {"prisonIds":self.prisonId,unmWareState:state==false?0:1,prisonTypeId:self.prisonTypeId};
          setTimeout(function(){
            self.$http.post(url,data).then(function(result){
              console.log(result)
              if(result.data.flag){
                self.$message({message:'操作成功',type: 'success'});
              }else{
                self.$message({message:result.data.msg,type:'warning'});
                self.roomInfo1.state= !state;
              }
              loadig.close();
            }).catch(function(erro){
               loadig.close();
               self.roomInfo1.state= !state;
            })
          },500)
        }).catch(() => {self.roomInfo1.state= !state;});
      },
      //====================================弱电部分开始===================================
      //预设分组选择  ->查询所有的分组
      getAllGrouping:function(){
        let self = this;
        let [url,data] = ['/sup/plansetting/query',{reservedFields1:''}];
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.grouping = result.data.data;
          }else{
            self.grouping=[];
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
          self.grouping=[];
          self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      //预设分组选择后窗口提问
      defaultGrouping:function(){
        let self = this;
        let tip = "是否确定应用这个预设分组配置替换当前监室的配置?";
        self.$confirm(tip, '操作提示', {confirmButtonText: '确定',cancelButtonText: '取消',type: 'warning'
            }).then(() => {

          }).catch(() => {
            self.groupingType = "";
          });
      },
      //弱电通道开启关闭
      weakPassWayOpenClose:function(state,res,index,ind){
        let self = this;
        let tip = "";
        //先判断当前的有人/无人开关的状态，再配置合适的提示语
        if(self.roomInfo1.state == false){
          tip = state==false?"是否确定关闭这个设备?此操作会关闭选中监室的无人仓模式。":"是否确定开启这个设备?此操作会关闭选中监室的无人仓模式。";
        }else{
          tip = state==false?"是否确定关闭这个设备?":"是否确定开启这个设备?";
        }
        self.$confirm(tip, '操作提示', {confirmButtonText: '确定',cancelButtonText: '取消',type: 'warning'
            }).then(() => {
            let url = "/sup/equipmentInfo/waitch";
            //这里的unmWare是有人和无人的开关状态，修改通道状态时，会影响监室是否是无人仓状态
            let data = {"prisonIds":self.prisonId,'jackState':state==false?0:1,'prisonTypeId':self.prisonTypeId,
                'prisonJackNumber':res.prisonJackNumber,'jackType':res.jackType,'unmWare':self.roomInfo1.state==false?0:1};
            self.$http.post(url,data).then(function(result){
              console.log(result)
              if(result.data.flag){
                self.roomInfo3[index][ind].switchState = state;
                self.$message({message:result.data.msg,type: 'success'});
              }else{
                self.$message({message:result.data.msg,type:'warning'});
                self.roomInfo3[index][ind].switchState = !state;
              }
            }).catch(function(erro){
              self.roomInfo3[index][ind].switchState = !state;
              console.log(erro)
            })
          }).catch(() => {self.roomInfo3[index][ind].switchState = !state;});
      },
      //一键开关
      oneButtonSwitch:function(state){
        let self = this;
        let tip = state==1?"是否确定一键开启所有的通道？":"是否确定一键关闭所有的通道？";
        self.$confirm(tip, '操作提示', {confirmButtonText: '确定',cancelButtonText: '取消',type: 'warning'
          }).then(() => {
          let load = self.$loading(opt);
          let url = "/sup/equipmentInfo/planControl";
          let data = {"prisonIds":self.prisonId,'state':state,'prisonTypeId':self.prisonTypeId,'planSettingId':2,'equipmentType':self.changeState};
          setTimeout(function(){
            self.$http.post(url,data).then(function(result){
              console.log(result)
              if(result.data.flag){
                self.$message({message:'操作成功',type: 'success'});
                self.prisonSelelct(self.$route.query.prisonId); //一键开启挂壁后重新获取房间的详细信息
              }else{
                self.$message({message:result.data.msg,type:'warning'});
              }
              load.close();
            }).catch(function(erro){
               load.close();console.log(erro);
            })
          },500)
        }).catch(() => {});
      },
      //====================================弱电部分结束===================================

      //====================================强电部分开始===================================
      //强电通道开启或关闭
      storngPassStart:function(res,state,ind){
        let self = this;let tip = "";
        //先判断当前操作的通道是否在线，不在线的通道禁止操作
        if(res.lineState==1){
          if(res.jackState == state && state==0){self.$message({message:"当前已经是关闭状态",type:'warning'});return false;}
          if(res.jackState == state && state==1){self.$message({message:"当前已经是开启状态",type:'warning'});return false;}
          //先判断当前的有人/无人开关的状态，再配置合适的提示语
          if(self.roomInfo1.state == false){
            tip = state==0?"确定关闭 "+res.prisonJackName+" 这个通道？此操作会关闭选中监室的无人仓模式":"确定开启 "+res.prisonJackName+" 这个通道？此操作会关闭选中监室的无人仓模式"
          }else{
            tip = state==0?"确定关闭 "+res.prisonJackName+" 这个通道？":"确定开启 "+res.prisonJackName+" 这个通道？"
          }
          self.$confirm(tip, '操作提示', {confirmButtonText: '确定',cancelButtonText: '取消',type: 'warning'
            }).then(() => {
            let url = "/sup/equipmentInfo/waitch";
            let data = {"prisonIds":self.prisonId,'jackState':state,'prisonTypeId':self.prisonTypeId,
                'prisonJackNumber':res.prisonJackNumber,'jackType':res.jackType,'unmWare':self.roomInfo1.state==false?0:1};
            self.$http.post(url,data).then(function(result){
              console.log(result)
              if(result.data.flag){
                self.$message({message:'操作成功',type: 'success'});
                self.roomInfo3[ind].jackState = state;
              }else{
                self.$message({message:result.data.msg,type:'warning'});
              }
            }).catch(function(erro){
              console.log(erro)
            })
          }).catch(() => {});
        }else{
          self.$message({message:"通道离线或不存在时禁止操作！",type:'warning'});
        }
      },
      //强电通道自动或手动开启
      storngDevAuto:function(res){
        let self = this; let [tip,valpt] = ['','']
        //先判断当前操作的通道是否在线，不在线的通道禁止操作
        if(res.lineState==1){
          // 0自动模式 1手动模式
          if(res.patternState==0){
            tip ="是否确定将 "+res.prisonJackName+" 通道切换至手动模式？"; valpt=1;
          }else{
            tip ="是否确定将 "+res.prisonJackName+" 通道切换至自动模式？"; valpt=0;
          }
          self.$confirm(tip, '操作提示', {confirmButtonText: '确定',cancelButtonText: '取消',type: 'warning'
            }).then(() => {
            let [url,data] = ['/sup/equipmentInfo/pattern',{'equipmentInfoId':self.s_equipmentInfoId,'patternState':valpt}];
            self.$http.post(url,data).then(function(result){
              console.log(result)
              if(result.data.flag){
                self.$message({message:result.data.msg,type: 'success'});
                self.roomInfo4[index].patternState = valpt;
              }else{
                self.$message({message:result.data.msg,type:'warning'});
              }
            }).catch(function(erro){
               console.log(erro)
            })
          }).catch(() => {});
        }else{
          self.$message({message:"通道离线或不存在时禁止操作！",type:'warning'});
        }
      },
      //====================================强电部分结束===================================

      //====================================设备历史功耗折线图开始==============================
      getHistoricalElectricity:function(){
        let self = this;
        let [url,data] = ['/sup/electricityConsumptionInfo/queryEC',{prisonId:self.prisonId}];
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            let [list,x_data,y_data] = [result.data.data,[],[]];
            if(list.length>0){
              for(let i=0;i<list.length;i++){
                x_data.push(list[i].days);
                y_data.push(list[i].electricityConsumption/1000)
              }
              self.x_LineChart=x_data;self.y_LineChart=y_data;
              self.drawAreaBasicChart(x_data,y_data);
            }else{
              self.x_LineChart=[];self.y_LineChart=[];
              self.drawAreaBasicChart(x_data,y_data);
            }
          }else{
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
          erro.data && erro.data.msg && self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      // 根据窗口的大小变动图表 --- 重点
      windowOnresize: function () {
        let self = this;
        window.onresize = function () {
          let heightAndWidth = {screenHeight:document.body.clientHeight,screenWidth:document.body.clientWidth}
          self.heightWidth = heightAndWidth;
        }
      },
      //绘制功耗折线图
      drawAreaBasicChart:function(x_data,y_data){
        let timeLength = x_data.length;
        let interval = Math.round(timeLength/10);
        if (interval > 1){interval = interval;}else{interval = 0;};
        // 基于准备好的dom，初始化echarts实例,有的话就获取已有echarts实例的DOM节点。
        areaBasicChart = echarts.getInstanceByDom(document.getElementById('rf_lineChart'))
        if (areaBasicChart == null) { // 如果不存在，就进行初始化。
           areaBasicChart = echarts.init(document.getElementById('rf_lineChart'));
        }

        areaBasicOption = {
          tooltip: {
              trigger: 'axis',
              axisPointer: {
                  type: 'cross',
                  label: {
                      backgroundColor: '#6a7985'
                  }
              }
          },
          dataZoom: [{type: 'inside'}],
          title:{
            text:"总设备功耗总计走势图",
            left:'center',
            textStyle:{color:"#c5c6c8",fontSize:14,fontFamily:'pingfang-b'}
          },
          grid: {
            backgroundColor: 'rgba(0,0,0,0)',
            borderColor: 'rgba(0,0,0,0)',
            x: 10,y:40,x2:10,y2: 10,
            borderWidth: 1,
            show: true,
            containLabel: true
          },
          xAxis: [
            {
              type: 'category',
              boundaryGap:false,
              axisTick: {
                lineStyle: {
                  color: '#E0E0E3',
                  type: 'solid'
                },
                onGap: true
              },
              splitLine: {show: false}, // 隐藏网格线
              data: x_data,
              axisLabel: {
                interval:interval,
                margin: 8,
                textStyle: {
                  color: '#3190de',cursor: 'default',fontSize: 11,fontStyle: 'normal',fill: '#E0E0E3'
                }
              },
              axisLine: {
                onZero: false
              }
            }
          ],
          yAxis: {
              type: 'value',
              splitLine: {
                      show: true,
                      lineStyle:{
                         color: ['#315070'],
                         width: 1,
                         type: 'solid'
                    }
              　　}
          },
          series: [{
              data: y_data,
              type: 'line',
              itemStyle: {
                normal: {
                  color: '#0f9dff', // 线填充颜色
                  lineStyle: {
                    width:1
                  }
                }
              },
              areaStyle: {
               normal: {
                 color: {
                   x: 0,y: 0,x2: 0,y2: 1,
                   colorStops: [{
                       offset: 0,color: "#186fba" // 0% 处的颜色
                     }, {
                       offset: 0.7,color: "rgba(24,111,186,0.3)" // 100% 处的颜色
                      }],
                       globalCoord: false // 缺省为 false
                     }
                   }
             },
          }]
        };
        areaBasicOption && areaBasicChart.setOption(areaBasicOption);
      },
      //====================================设备历史功耗折线图结束==============================
    },
    beforeDestroy() {
      clearInterval(interv); interv=null; //关闭定时器，并重置变量
      clearTimeout(this.repeatTimer)
      this.repeatTimer = null
    }
  }
</script>

<style>
  @import url("../../../static/css/RoomInformation/RoomInformation.css");
</style>
