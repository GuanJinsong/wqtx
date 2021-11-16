<template>
  <div class="defaultName1">
    <div class="pc_parent">
      <!-- 头部部分 -->
      <div class="pc_top">
        <div class="pc_topAfter">
          <div class="pc_editMM">
            <span></span><i>设备报警</i> <span></span><i>设备正常</i> <span></span><i>设备掉线</i> <span></span><i>设备不存在</i>
          </div>
          <div class="pc_topType">
            <div class="pc_topTypeAfter">
            <span>监室类型：</span>
            <div class="editMM" style="width:125px;">
              <el-select v-model="roomType" @change="roomTypeSelt" :disabled="!checked" placeholder="监室类型选择">
                <el-option v-for="item in optionsRoom" :key="item.prisonTypeId"
                :label="item.prisonTypeName" :value="item.prisonTypeId"></el-option>
              </el-select>
            </div>
            <el-checkbox v-model="checked" @change="openCloseBatchSelet" style="margin-left:10px;">批量选中</el-checkbox>
            </div>
          </div>
        </div>
      </div>
      <!-- 中间部分 -->
      <div class="pc_center">
        <div class="pc_centerAfter">
            <div class="pc_centerLeft0"><img src="../../../static/images/guankong4.png"/></div>
            <div class="pc_centerLeft1"></div>
            <!-- 监区选择 -->
            <div class="pc_centerLeft2 verticalScroll">
              <div class="pc_cabinetList" v-for="(item,index) in optionsArea" v-bind:key="index" @click="distributionBoxList(index,item)">
                <p>{{item.prisonDistrictName}}</p>
                <div><img v-if="cabinet==index" src="../../../static/images/guankong2.png"/><span v-else></span></div>
              </div>
            </div>
            <div class="pc_centerLeft3"></div>
            <!-- 监区下的监室列表 -->
            <div class="pc_centerLeft4">
              <div class="pc_roomList" v-for="(item,index) in roomList">
                <div class="pc_roomCheck curp" v-if="item.roomState==0">  <!-- 强弱电设备均不在线 -->
                  <div class="pc_roomBox"><el-checkbox v-model="item.checkState"
                  v-bind:key="index" @change="checked=>changeCheckbox(checked,index,item)">{{item.prisonName}}</el-checkbox></div>
                  <img src="../../../static/images/room3.png" @click="goingRoomDetail(item)"/>
                </div>
                <div class="pc_roomCheck curp" v-if="item.roomState==1">  <!-- 强弱电设备均在线 -->
                  <div class="pc_roomBox curp"><el-checkbox v-model="item.checkState"
                  v-bind:key="index" @change="checked=>changeCheckbox(checked,index,item)">{{item.prisonName}}</el-checkbox></div>
                  <img src="../../../static/images/room1.png" @click="goingRoomDetail(item)"/>
                </div>
                <div class="pc_roomCheck curp pcCheck2" v-if="item.roomState==2">  <!-- 强弱电设备存在一个在线 -->
                  <div class="pc_roomBox"><el-checkbox v-model="item.checkState"
                  v-bind:key="index" @change="checked=>changeCheckbox(checked,index,item)">{{item.prisonName}}</el-checkbox></div>
                  <img src="../../../static/images/room2.png" @click="goingRoomDetail(item)"/>
                </div>
                <div class="pc_roomCheck pcCheck3" v-if="item.roomState==3">  <!-- 没有设备数据，默认的 -->
                  <div class="pc_roomBox"><el-checkbox v-model="item.checkState" disabled v-bind:key="index">{{item.prisonName}}</el-checkbox></div>
                  <img src="../../../static/images/room3.png" style="cursor:not-allowed;"/>
                </div>
              </div>
            </div>
        </div>
      </div>
      <!-- 底部部分 -->
      <div class="pc_botton">
        <div class="pc_bottonAfter" v-bind:class="pc_pulseIndex == true?'pc_boxopen':'pc_boxclose'">
          <p class="pc_bottonLt">功能</p>
          <p class="pc_bottonRt el-icon-d-arrow-right" @click="openOrLeft()"></p>
          <div class="pc_bottonInfo">
            <div class="editMM" style="width:180px;">
              <el-select v-model="systemSelect" placeholder="请选择...">
                <el-option v-for="item in optionsystem" :key="item.planId" :label="item.name" :value="item.planId"></el-option>
              </el-select>
            </div>
            <el-switch
              v-model="pc_starUser" active-color="#0c9ec5" inactive-color="#ff4949"
              active-text="启用" inactive-text="关闭">
            </el-switch>
            <button class="pc_bottonBtn" @click="functionEnableSettings()">确定</button>
          </div>
        </div>
      </div>
      <!-- 右边部分 -->
      <div class="pc_right">
        <div class="pc_rightAfter">
          <ul class="pc_rightUl">
            <li v-for="(list,index) in deviceList" v-bind:key="index">
              <i>{{list.prisonJackName}}</i>
              <p><span @click="jackSwitch(1,list)">ON</span> <span @click="jackSwitch(0,list)">OFF</span></p>
            </li>
            <div class="pc_noData" v-if="deviceList.length==0"><img src="../../../static/images/n_data.png"/></div>
          </ul>
          <div class="pc_rightBotton">
            <h6>房间标记</h6>
            <p><span @click="setPrisonHuman(1)">有人</span><span @click="setPrisonHuman(0)">无人</span></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
	var opt = {
		lock: true,text: '加载中...',spinner: 'el-icon-loading',
		customClass:'loadingClass', background: 'rgba(0, 0, 0, 0.5)',
	}
  var loading ="";
  export default{
    name:"PowerControl",
    data(){
      return{
        areaName:'', //定义选中的监区名称
        areaId:"",   //监区选中值
        optionsArea:[],  //监区可选值
        roomTypeId:"",  //定义当前选中的监室所属监室类型id
        roomType:"",    //监室类型值
        optionsRoom:[],  //监室类型可选值
        checked:false,  //批量选中复选框
        cabinet:0,  //配电柜图表选中
        roomListDefault:[],   //默认状态下的监室列表
        roomList:[],   //监室列表(经过数据重组处理后的)
        systemSelect:"",   //分组类型选中的值
        optionsystem:[],   //分组类型可选值
        pc_starUser:true,
        pc_pulseIndex:true,
        deviceList:[]
      }
    },
    created() {
      //headerChange: 是父组件App.vue指定的传数据绑定的函数，parentData:子组件给父组件App.vue传递的数据
      var parentData = {header:true,nav:1};
      this.$emit('headerChange',parentData);
      localStorage.setItem("headState", JSON.stringify(parentData));  //存储当前的header信息
      this.getGroupingList();  //获取所有分组数据
      this.getAllArea();  //获取所有的监区
      this.getRoomTypeList();  //获取所有的监室类型
    },
    methods:{
       //点击配电箱(监区)列表，切换
       distributionBoxList:function(index,res){
         this.areaId = res.prisonDistrictId;  //监区选中监区id
         this.areaName = res.prisonDistrictName;  //监区选中的名称
         this.cabinet = index;  //配电柜图表选中
         this.getAreaAfterPrison(res.prisonDistrictId);
       },
       openOrLeft:function(){
         var self = this;
         if(self.pc_pulseIndex){self.pc_pulseIndex = false;}else{self.pc_pulseIndex = true;}
       },
       goingRoomDetail:function(data){
         this.$router.push({path:'/components/RoomInformation/RoomInformation',
         name: 'RoomInformation',
         query:{name:this.areaName,prisonId:data.prisonId}});
       },
       //获取所有的监区
       getAllArea:function(){
         let self = this;
         let [url,data] = ['/sup/prisonDistrict/query',''];
         self.$http.post(url,data).then(function(result){
           console.log(result)
           if(result.data.flag){
             self.optionsArea = result.data.data;
             if(result.data.data.length>0){
               let a_id = result.data.data[0].prisonDistrictId;
               self.areaName = result.data.data[0].prisonDistrictName; //监区名称
               self.areaId = a_id; self.getAreaAfterPrison(a_id); //根据监区id获取监区下的监室列表
             }
           }else{
             self.$message({message:result.data.msg,type:'warning'});
           }
         }).catch(function(erro){
           self.$message.error(erro.data.msg);
           console.log(erro)
         })
       },
       //根据监区id获取监区下的监室列表
       getAreaAfterPrison:function(id){
         let self = this;
         let [url,data] = ['/sup/prisonDistrict/queryPrison',{prisonDistrictId:id}];
         loading = self.$loading(opt);
         self.$http.post(url,data).then(function(result){
           console.log(result)
           if(result.data.flag){
             self.roomListDefault = result.data.data;   //存储一个默认的初始值
             let list = JSON.parse(JSON.stringify(result.data.data));
             if(list.length>0){
               for(let i=0;i<list.length;i++){
                 //0监室设备强弱电都掉线 1监室设备强弱电都在线，2监室设备有报警(变红)，3监室待确定(不存在)
                 let newWord = {roomState:"",checkState:false};
                 //第一步：先判断监室是否存在报警未处理情况
                 if(list[i].eventInfos.length == 0){
                   //第二步：判断强弱电是否都存在
                   if(list[i].equipmentStrong !== null && list[i].equipmentWeak !==null){
                     if(list[i].equipmentStrong.state==1 && list[i].equipmentWeak.state==1){
                       newWord.roomState = 1;   //强弱电都在线时那么定义为在线
                       Object.assign(list[i],newWord);
                     }else if(list[i].equipmentStrong.state==0 && list[i].equipmentWeak.state==0){
                       newWord.roomState = 0;   //强弱电都不在线时那么定义为不在线
                       Object.assign(list[i],newWord);
                     }else{
                       newWord.roomState = 1;   //强弱电弱只存一个在线，那么也还算在线
                       Object.assign(list[i],newWord);
                     }
                    //第三步：判断强弱电是否都不存在
                   }else if(list[i].equipmentStrong == null && list[i].equipmentWeak ==null){
                     newWord.roomState = 0;   //强弱电都不存在时那么定义为不在线
                     Object.assign(list[i],newWord);
                    //第四步：判断强弱电可能只存在其中一个时
                   }else{
                     if(list[i].equipmentStrong !== null){  //如果强电存在
                       newWord.roomState = list[i].equipmentStrong.state==0?0:1;
                       Object.assign(list[i],newWord);
                     }
                     if(list[i].equipmentWeak !== null){  //如果弱电存在
                       newWord.roomState = list[i].equipmentWeak.state==0?0:1;
                       Object.assign(list[i],newWord);
                     }
                   }
                 }else{
                   newWord.roomState = 2;
                   Object.assign(list[i],newWord);
                 }
               }
               let lgt = 30-list.length;
               let defaList = {roomState:3,prisonName:"---",checkState:false};
               for(let m=0;m<lgt;m++){list.push(defaList);};
               self.roomList = list;
               self.roomTypeId = list[0].prisonTypeId; //定义初始选中的监室所属监室类型的id
               self.roomType = list[0].prisonTypeId;
               self.roomList[0].checkState = true;   //默认初始情况下让第一个监室被选中，然后getPassWayNum请求
               self.getPassWayNum(list[0].prisonTypeId);  //获取监室类型对应的通道号
			         setTimeout(function(){loading.close();},500)
             }else{
               let defaList = {roomState:3,prisonName:"---",checkState:false}
               for(let m=0;m<30;m++){list.push(defaList);};
               self.roomList = list;loading.close();
             }
           }else{
             let defaList = {roomState:3,prisonName:"---",checkState:false}
             for(let m=0;m<30;m++){list.push(defaList);};
             self.roomList = list; loading.close();
             self.$message({message:result.data.msg,type:'warning'});
           }
         }).catch(function(erro){
           let [u_list,defaList] = [[],{roomState:3,prisonName:"---",checkState:false}];
           for(let m=0;m<30;m++){u_list.push(defaList);};
           self.roomList = u_list; loading.close();
           self.$message.error(erro.data.msg);
           console.log(erro)
         })
       },
       //开启/关闭批量选择操作
       openCloseBatchSelet:function(state){
         var lit = this.roomList;
         if(!state){for(var m=0;m<lit.length;m++){
           lit[m].checkState = false; this.roomType="";  this.deviceList = []; //重置可能存在的通道列表
         }}
       },
       //点击监室上的checkbox
       changeCheckbox:function(state,index,item){
         let list = this.roomList   //监室列表
         if(state){
           if(this.checked == false){
             for(let i=0;i<list.length;i++){if(index !== i){list[i].checkState=false;}}
             this.roomTypeId=item.prisonTypeId;this.roomType=item.prisonTypeId;
             this.getPassWayNum(item.prisonTypeId);  //获取监室类型对应的通道号
           }else{
             if(this.roomTypeId==""){
               this.roomTypeId = item.prisonTypeId;
               this.roomType=item.prisonTypeId;
               this.getPassWayNum(item.prisonTypeId);  //获取监室类型对应的通道号
             }else{
               if(item.prisonTypeId !== this.roomTypeId){
                 this.$message({message:"当前点击的监室所属监室类型和前面所选监室的类型不一致,您可以尝试修改监室类型。",type:'warning'});
                 this.roomList[index].checkState =false;
               }else{
                 //获取监室类型对应的通道号
                 this.getPassWayNum(item.prisonTypeId);
               }
             }
           }
         }else{
           //判断当前是否存在选中的监室，如果没有那么重置this.roomTypeId
           let mm = 0;
           for(let k=0;k<list.length;k++){if(list[k].checkState == true){mm++;}}
           if(mm == 0){this.roomTypeId="";this.roomType="";};
         }
       },
       //获取所有分组数据
       getGroupingList:function(){
         let self = this;
         let [url,data] = ['/sup/plansetting/query',{reservedFields1:""}];
         self.$http.post(url,data).then(function(result){
           console.log(result)
           if(result.data.flag){
             self.optionsystem = result.data.data;
           }else{
             self.$message({message:result.data.msg,type:'warning'});
           }
         }).catch(function(erro){
            console.log(erro)
         })
       },
       //获取所有的监室类型
       getRoomTypeList:function(){
         let self = this;
         let [url,data] = ['/sup/prisontype/query',{current:1,size:100}];
         self.$http.post(url,data).then(function(result){
           console.log(result)
           if(result.data.flag){
             self.optionsRoom = result.data.data.records;
           }else{
             self.$message({message:result.data.msg,type:'warning'});
           }
         }).catch(function(erro){
           self.$message.error(erro.data.msg);
           console.log(erro)
         })
       },
       //监室类型选择，所有符合该监室类型的监室都将被选中,不符合的取消选择中
       roomTypeSelt:function(id){
         let list = this.roomList;
         this.roomTypeId = id;
         if(list.length>0){
           for(let i=0;i<list.length;i++){
             if(list[i].prisonTypeId == id){
               list[i].checkState = true;
             }else{
               list[i].checkState = false;
             }
           }
         }
         this.getPassWayNum(id);  //获取监室类型对应的通道号
       },
       //获取所选中的监室类型所对应的通道号
       getPassWayNum:function(id){
         let self = this;
         let [url,data] = ['/sup/prisonjack/query',{prisonTypeId:id}];
         self.$http.post(url,data).then(function(result){
           console.log(result)
           if(result.data.flag){
             var dev = result.data.data;
             if(dev.length>0){
               self.deviceList = dev;
             }else{
               self.deviceList = [];
             }
           }else{
             self.deviceList = [];
             self.$message({message:result.data.msg,type:'warning'});
           }
         }).catch(function(erro){
           self.$message.error(erro.data.msg);
           console.log(erro)
         })
       },
       //对通道号进行编辑处理
      jackSwitch:function(state,res){
        let self = this;
        let [listtt,ids] = [this.roomList,[]]   //监室列表
        for(let j=0;j<listtt.length;j++){if(listtt[j].checkState){ids.push(listtt[j].prisonId)}};
        ids = ids.toString();   //数组转字符串
        let tip = state==1?"是否确定开启 "+res.prisonJackName+" 该通道设备？":"是否确定关闭 "+res.prisonJackName+" 该通道设备？"
        self.$confirm(tip, '操作提示', {confirmButtonText: '确定',cancelButtonText: '取消',type: 'warning'
          }).then(() => {
          let loadi= self.$loading(opt);
          let url = "/sup/equipmentInfo/waitch";
          let data = {'prisonIds':ids,'jackState':state,'prisonJackNumber':res.prisonJackNumber,'prisonTypeId':res.prisonTypeId,'jackType':res.jackType};
          self.$http.post(url,data).then(function(result){
            console.log(result)
            if(result.data.flag){
              self.$message({message:result.data.msg,type: 'success'});
            }else{
              self.$message({message:result.data.msg,type:'warning'});
            }
            loadi.close()
          }).catch(function(erro){
             console.log(erro);loadi.close()
          })
        }).catch(() => {});
      },
      //设置监室有人和无人
      setPrisonHuman:function(state){
        let self = this;
        let [ids,listtt] = [[],this.roomList]; //监室列表
        for(let j=0;j<listtt.length;j++){if(listtt[j].checkState){ids.push(listtt[j].prisonId)}};
        let dds = ids.toString();   //数组转字符串
        if(ids.length>0){
          let tip = state==1?"是否确定修改选中的这些监室为有人？":"是否确定修改选中的这些监室为无人？"
          self.$confirm(tip, '操作提示', {confirmButtonText: '确定',cancelButtonText: '取消',type: 'warning'
            }).then(() => {
            let loadi= self.$loading(opt);
            let [url,data] = ['/sup/equipmentInfo/unware',{'prisonIds':dds,'unmWareState':state,'prisonTypeId':self.roomTypeId}];
            self.$http.post(url,data).then(function(result){
              console.log(result)
              if(result.data.flag){
                self.$message({message:result.data.msg,type: 'success'});
              }else{
                self.$message({message:result.data.msg,type:'warning'});
              }
              loadi.close();
            }).catch(function(erro){
               console.log(erro);loadi.close();
            })
          }).catch(() => {});
        }else{
          self.$message({message:'请至少选中一个监室.',type:'warning'});
        }
      },
      //功能启用设置
      functionEnableSettings:function(){
        let self = this;
        let [ids,listtt] = [[],this.roomList]; //监室列表
        for(let j=0;j<listtt.length;j++){if(listtt[j].checkState){ids.push(listtt[j].prisonId)}};
        let dds = ids.toString();   //数组转字符串
        if(self.systemSelect == ""){self.$message({message:"请选择分组",type:'warning'});return false;};
        if(ids.length>0){
          let url = "/sup/equipmentInfo/planControl";
          let data = {"prisonIds":dds,state:self.pc_starUser==true?1:0,prisonTypeId:self.roomTypeId,planSettingId:self.systemSelect};
          loading = self.$loading(opt);
		      self.$http.post(url,data).then(function(result){
            console.log(result)
            if(result.data.flag){
              self.$message({message:'操作成功',type: 'success'});
            }else{
              self.$message({message:result.data.msg,type:'warning'});
            }
            loading.close();
          }).catch(function(erro){
             console.log(erro)
             loading.close();
          })
        }else{
          self.$message({message:'请至少选中一个监室.',type:'warning'});
        }
      }
    }
  }
</script>

<style>
  @import url("../../../static/css/PowerControl/PowerControl.css");
</style>

