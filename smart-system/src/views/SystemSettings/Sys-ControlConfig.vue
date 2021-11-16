<!-- 管控配置 -->
<template>
  <div class="sys_dsBox">
     <!-- 上半部分 -->
     <div class="sys_dsTop">
        <div class="sys_dsTitile"><h6>报警阀值设置</h6> <span class="el-icon-plus" title="添加" @click="openPopup()"></span></div>
        <div class="sys_TaskTableParent dev_ManRight" style="overflow-y:auto;">
           <el-table :data="configList" style="width: 100%">
             <el-table-column label="监室类型">
               <template slot-scope="scope">
                 <span>{{scope.row.prisonTypeName=scope.row.prisonTypeName||'--'}}</span>
               </template>
             </el-table-column>
             <el-table-column label="电源类型">
               <template slot-scope="scope">
                 <span v-if="scope.row.type==4" class="onState">弱电</span>
                 <span v-else class="outState">强电</span>
               </template>
             </el-table-column>
             <el-table-column prop="channel" label="适用通道"></el-table-column>
             <el-table-column prop="maxVoltage" label="最高电压(v)"></el-table-column>
             <el-table-column prop="miniVoltage" label="最低电压(v)"></el-table-column>
             <el-table-column prop="maxCurrent" label="最高电流(A)"></el-table-column>
             <el-table-column prop="miniCurrent" label="最低电流(A)"></el-table-column>
             <el-table-column prop="maxTemperature" label="最高温度(℃)"></el-table-column>
             <el-table-column  label="操作">
               <template slot-scope="scope">
                 <span class="Edit el-icon-edit-outline" title="编辑" @click="editConfigList(scope.row)"></span>
                 <span class="Del el-icon-delete" title="删除" @click="deleteAlremList(scope.row.threId)"></span>
               </template>
             </el-table-column>
           </el-table>
           <!-- 分页 -->
           <pagingComponent/>
        </div>
     </div>
     <!-- 阀值设置弹窗 -->
     <div class="poupParnet" v-if="alarmListPup">
     	<div class="poupParnetAfter" style="width:450px;">
     		<div class="poupTitle"><div class="poupTitleAfter"><h6>编辑</h6><span @click="alarmListPup=false">×</span></div></div>
     		<div class="pubCenter">
           <ul class="sys_dsUl">
             <li><span class="dsTitle">监室类型</span>
               <div class="editMM">
                 <el-select v-model="roomType" @change="roomTypeSelect" placeholder="监室类型选择">
                   <el-option v-for="item in optionsRoom" :key="item.value" :label="item.label" :value="item.value"></el-option>
                 </el-select>
               </div>
             </li>
             <li><span class="dsTitle">电源类型</span>
               <div class="editMM">
                 <el-select v-model="powerType" @change="powerTypeSelect" placeholder="电源类型选择">
                   <el-option v-for="item in optionsPower" :key="item.value" :label="item.label" :value="item.value"></el-option>
                 </el-select>
               </div>
             </li>
             <li><span class="dsTitle">适用通道</span>
               <div class="editMM">
                 <el-select v-model="passType" @change="passTypeSelect" multiple collapse-tags placeholder="通道选择">
                   <el-option v-for="item in optionsPass" :key="item.value" :label="item.label" :value="item.value"></el-option>
                 </el-select>
               </div>
             </li>
             <li><span class="dsTitle">电压(V)</span>
               <div class="pubPutNum dsFlex">
                 <i>最高</i><el-input-number v-model="Vmax" :min="0"></el-input-number>
                 <i>最低</i><el-input-number v-model="Vmin" :min="0"></el-input-number>
               </div>
             </li>
             <li><span class="dsTitle">电流(A)</span>
               <div class="pubPutNum dsFlex" :style="{width: powerType != 4 ? '100%' : '48%'}">
                <i>最高</i><el-input-number v-model="Amax" :min="0"></el-input-number>
                <i v-show="powerType != 4">最低</i><el-input-number v-show="powerType != 4" v-model="Amin" :min="0"></el-input-number> 
               </div>
             </li>
             <li><span class="dsTitle">最高温度(°C)</span>
               <div class="pubPutNum dsFlex">
                 <el-input-number v-model="Tmax" :min="-25" :max="85"></el-input-number>
               </div>
             </li>
           </ul>
         </div>
     		<div class="poupSure">
     			<button @click="alarmListPup=false">取消</button>
     			<button @click="saveAlarmInfo()">确认</button>
     		</div>
     	</div>
     </div>

     <!-- 下半部分 -->
     <div class="sys_dsBotton">
       <div class="sys_dsTitile">
         <h6>监室环境设置</h6>
         <el-tooltip placement="bottom">
           <div slot="content">
             <p class="btTxt">流明度等级值(Lux)：明亮(3000~3200)，适中(800~1000)，较暗(200~250)</p>
             <p class="btTxt">空气质量等级值(ppm)：优质(0.2~2)，适中(6~7)，较差(11~12)</p> <!-- 真实的值在此上会乘100 -->
             <p class="btTxt">温度等级值(℃)：凉爽(8~10)，适中(20~21)，炎热(28~30)</p>  <!-- 真实的值在此上会乘100 -->
           </div>
           <i class="el-icon-question questionIco"></i>
         </el-tooltip>
       </div>
       <div class="sys_dsBotBox" style="overflow-y:auto;">
         <!-- 等级选择设置 -->
         <ul class="sys_dsBtUL">
           <li>
             <div class="lumenList"><p>自动管控:</p>
             <el-switch v-model="dsContorl" @change="dsContorlSW" active-color="#13ce66" inactive-color="#ff4949"
                active-text="开启" inactive-text="关闭">
              </el-switch>
             </div>
           </li>
           <li>
             <div class="lumenList"><p>照明开启:</p><p>流明度等级</p></div>
             <el-radio-group v-model="radio" class="ds_rank">
               <div class="luRad" v-bind:class="radio==1?'dsrankback':''"><el-radio :label="1">明亮</el-radio></div>
               <div class="luRad" v-bind:class="radio==2?'dsrankback':''"><el-radio :label="2">适中</el-radio></div>
               <div class="luRad" v-bind:class="radio==3?'dsrankback':''"><el-radio :label="3">较暗</el-radio></div>
             </el-radio-group>
           </li>
           <li>
             <div class="lumenList"><p>排风开启:</p><p>空气质量等级</p></div>
             <el-radio-group v-model="radio1" class="ds_rank">
               <div class="luRad" v-bind:class="radio1==1?'dsrankback':''"><el-radio :label="1">优质</el-radio></div>
               <div class="luRad" v-bind:class="radio1==2?'dsrankback':''"><el-radio :label="2">适中</el-radio></div>
               <div class="luRad" v-bind:class="radio1==3?'dsrankback':''"><el-radio :label="3">较差</el-radio></div>
             </el-radio-group>
           </li>
           <li>
             <div class="lumenList"><p>风扇开启:</p><p>温度等级</p></div>
             <el-radio-group v-model="radio2" class="ds_rank">
               <div class="luRad" v-bind:class="radio2==1?'dsrankback':''"><el-radio :label="1">凉爽</el-radio></div>
               <div class="luRad" v-bind:class="radio2==2?'dsrankback':''"><el-radio :label="2">适中</el-radio></div>
               <div class="luRad" v-bind:class="radio2==3?'dsrankback':''"><el-radio :label="3">炎热</el-radio></div>
             </el-radio-group>
           </li>
         </ul>
         <div class="sys_dsSureBtn"><button @click="saveConfigInfo()">提交并保存</button></div>
       </div>
     </div>
  </div>
</template>

<script>
  const opt = {
      lock: true,text: '加载中...',spinner: 'el-icon-loading',
      customClass:'loadingClass', background: 'rgba(0, 0, 0, 0.5)',
  }
  var loading = "";
  import pagingComponent from "../../components/publicComponemts/pagingComponent.vue"
  export default{
    name:"Sys-ControlConfig",
    components:{pagingComponent:pagingComponent},
    data(){
      return{
        configList:[],
        dsContorl:false,  //自动管控
        radio:3,   //流明度等级
        radio1:2,  //空气质量等级
        radio2:1,  //温度等级
        alarmListPup:false,   //报警阀值编辑弹窗
        presonList:[],  //监室类型完整值
        roomTypeName:'', //当前选中的监室类型名称
        roomType:"",    //监室类型值
        optionsRoom: [],
        powerType:"",   //电源类型
        optionsPower: [{value:1,label: '强电'}, {value:4,label:'弱电'}],
        passType:"",    //通道类型
        optionsPass: [],  //当前选中的强电或弱电可用的通道
        strongWeak:[],   //强弱电通道集合
        Vmax:0,Vmin:0,Amax:0,Amin:0,Tmax:85,
        threId:'',   //当前正在编辑的阀值列表
        environmentId:"",   //当前监仓环境id
        nowPage:1,  //定义当前选中的分页
      }
    },
    created() {
      this.getAlarmValueList(1);  //获取报警阀值设置列表
      this.getRoomTypeList();  //获取监室类型
      this.getRoomState();  //初始化时获取监仓配置
    },
    mounted() {
      //监听子组件 pagingComponent传过来的数据
      this.$eventBus.$on("updataPage",this.updataPages);
    },
    methods:{
      //根据分页子组件返回的数据请求新的报警记录数据
      updataPages:function(page){
        this.nowPage = page;
        this.getAlarmValueList(page);
      },
      //报警阀值编辑弹窗开启/关闭
      openPopup:function(){
        this.threId="";   //阀值列表id
        this.roomType="";
        this.strongWeak = []; //清空强弱电通道可选值
        this.roomTypeName="";
        this.passType="";
        this.optionsPass = [];
        this.powerType="";
        this.Vmax=0;
        this.Vmin=0;
        this.Amax=0;
        this.Amin=0;
        this.Tmax=85;
        this.alarmListPup = true;
      },
      //======================================报警阀值设置开始==================================
      //获取报警阀值设置列表
      getAlarmValueList:function(page){
        let [self,url,data] = [this,'/sup/thresholdsetting/query',{current:page,size:10}];
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
             let list = result.data.data.records;
             for(let i=0;i<list.length;i++){
               list[i].maxVoltage = list[i].maxVoltage/100;
               list[i].miniVoltage = list[i].miniVoltage/100;
               list[i].maxCurrent = list[i].maxCurrent/100;
               list[i].miniCurrent = list[i].miniCurrent/100;
             }
             self.configList = list;  //赋值列表
             self.$eventBus.$emit('deviceListDataReturn',result.data.data); //向分页组件传递数据
          }else{
            self.configList = [];
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
          self.configList = [];
          self.$message.error(erro.data.msg);
        })
      },
      //获取报警阀值弹窗内的监室类型可选值
      getRoomTypeList:function(){
        let [self,url,data] = [this,'/sup/prisontype/query',{current:1,size:100}];
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.presonList = result.data.data.records;
            let [romList,list] = [[],result.data.data.records];
            for(let i=0;i<list.length;i++){
              let name = list[i].prisonTypeName||'未定义';
              romList.push({'value':list[i].prisonTypeId,'label':name})
            }
            self.optionsRoom = romList;
          }else{
            self.optionsRoom = [];
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
          self.optionsRoom = [];
          self.$message.error(erro.data.msg);
        })
      },
      //报警阀值弹窗内监室类型选择后的处理
      roomTypeSelect:function(data){
        let self = this;
        let [lit,pasList]= [self.presonList,[]];
        for(let i=0;i<lit.length;i++){
          if(lit[i].prisonTypeId == data && lit[i].prisonjacks.length>0){
            var llt = lit[i].prisonjacks; self.roomTypeName = lit[i].prisonTypeName;
            for(var n=0;n<llt.length;n++){
              let name = llt[n].prisonJackName||'---';
              pasList.push({'value':llt[n].prisonJackNumber,'label':name,type:llt[n].jackType})
            }
            self.strongWeak = pasList;
            self.powerType = "";  //清空之前可能存在的电源类型
            self.optionsPass = [];  //清空之前可能存在的可用通道数据
            self.passType = [];  //清空之前可能存在的通道数据
          }
        }
      },
      //选择强弱电类型后，根据已有的通道数据，给通道选择框赋予可选值
      powerTypeSelect:function(data){
        let self = this; let [pas,kkt] = [[],self.strongWeak];
        for(let m=0;m<kkt.length;m++){
          if(kkt[m].type == data){
            pas.push({'value':kkt[m].value,'label':kkt[m].label})
          }
        }
        self.passType = [];  //切换强弱电类型时，如果通道输入框中已经存在数据，那么清空
        if(pas.length>0){pas.unshift({'value':"00",'label':"全部"})}   //在可选通道数据前添加一个 "全部"选项
        self.optionsPass = pas;  //然后再重新赋值通道下拉框可选用值
        //通过判断强弱电类型，给强弱电输入框赋予初始值
        if(data == 1){
          this.Vmax=260;this.Vmin=180;this.Amax=10;this.Amin=0;
        }else{
          this.Vmax=14;this.Vmin=10;this.Amax=2;this.Amin=0;
        }
      },
      //编辑弹窗内的通道选择,这里重点是判断是否选中了全部选项，如果是那么勾选全部选项，除开全部自己
      //这里的全部标志是值为"00",这是判断选中全部的标志
      passTypeSelect:function(data){
        let status = data.indexOf("00");
        if(status !== -1){
          this.passType = []; let llt = this.optionsPass;
          for(let m=1;m<llt.length;m++){this.passType.push(llt[m].value);}
        }
      },
      //保存新添加/编辑 后的报警阀值设置弹窗
      saveAlarmInfo:function(){
        let self = this;
        if(self.roomTypeName == ""){self.$message({message:"监室类型未选择",type:'warning'});return false;}
        if(self.powerType == ""){self.$message({message:"电源类型未选择",type:'warning'});return false;}
        if(self.passType == ""){self.$message({message:"通道未选择",type:'warning'});return false;}
        if(self.powerType == 1){
          if(self.Vmax>260){self.$message({message:"强电电压最高只能输入260",type:'warning'});return false;}
          if(self.Vmin<180){self.$message({message:"强电电压最低只能输入180",type:'warning'});return false;}
          if(self.Vmax<self.Vmin){self.$message({message:"强电最高电压不得小于最低电压",type:'warning'});return false;}
          if(self.Amax>10){self.$message({message:"强电电流最高只能输入10",type:'warning'});return false;}
          if(self.Amin<0){self.$message({message:"强电电流最低只能输入0",type:'warning'});return false;}
          if(self.Amax<self.Amin){self.$message({message:"强电最高电流不得小于最低电流",type:'warning'});return false;}
        }else{
          if(self.Vmax>14){self.$message({message:"弱电电压最高只能输入14",type:'warning'});return false;}
          if(self.Vmin<10){self.$message({message:"弱电电压最低只能输入10",type:'warning'});return false;}
          if(self.Vmax<self.Vmin){self.$message({message:"弱电最高电压不得小于最低电压",type:'warning'});return false;}
          if(self.Amax>2){self.$message({message:"弱电电流最高只能输入2",type:'warning'});return false;}
          if(self.Amin<0){self.$message({message:"弱电电流最低只能输入0",type:'warning'});return false;}
          if(self.Amax<self.Amin){self.$message({message:"弱电最高电流不得小于最低电流",type:'warning'});return false;}
        }
        let [url,data] = ['',''];
        let defalt = {
          "prisonTypeId":self.roomType,
          "prisonTypeName":self.roomTypeName,
          "channel":self.passType.toString(),
          "type":self.powerType,
          "maxVoltage":(self.Vmax*100).valueOf(),
          "miniVoltage":(self.Vmin*100).valueOf(),
          "maxCurrent":(self.Amax*100).valueOf(),
          "miniCurrent":(self.Amin*100).valueOf(),
          "maxTemperature":self.Tmax,
        }
        if(self.threId == ""){
          url = "/sup/thresholdsetting/save";
          data = defalt
        }else{
          url = "/sup/thresholdsetting/update";
          data = Object.assign(defalt,{"threId":self.threId})
        }
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.$message({message:result.data.msg,type: 'success'});
            self.getAlarmValueList(1);  //重新获取报警阀值列表
          }else{
            self.$message({message:result.data.msg,type:'warning'});
          }
          self.alarmListPup = false;
        }).catch(function(erro){
          self.alarmListPup = false;
          self.$message.error(erro.data.msg);
        })
      },
      //点击报警阀值列表后的编辑按钮，打开编辑弹窗，并赋值
      editConfigList:function(result){
        //打开编辑框时，整理当前 "监室类型" 下 "电源类型" 下 对应的通道可选值
        let [list,arr] = [this.presonList,[]];
        for(let i=0;i<list.length;i++){
          if(result.prisonTypeId == list[i].prisonTypeId){
            let kt = list[i].prisonjacks;
            for(let m=0;m<kt.length;m++){
              if(kt[m].jackType == result.type){
                arr.push({'value':kt[m].prisonJackNumber,'label':kt[m].prisonJackName})
              }
            }
            arr.unshift({'value':"00",'label':"全部"});  //在下拉框可选值前添加一个 "全部"选项
            this.optionsPass = arr;   //重新定义通道选择框的值
            break;
          }
        }

        //打开编辑框时，整理当前 "监室类型" 下 切换 "电源类型" 后 对应的通道可选值
        let self = this;
        let [lit,pasList]= [self.presonList,[]];
        for(let i=0;i<lit.length;i++){
          if(lit[i].prisonTypeId == result.prisonTypeId && lit[i].prisonjacks.length>0){
            let llt = lit[i].prisonjacks; self.roomTypeName = lit[i].prisonTypeName;
            for(let n=0;n<llt.length;n++){
              let name = llt[n].prisonJackName||'---';
              pasList.push({'value':llt[n].prisonJackNumber,'label':name,type:llt[n].jackType})
            }
            self.strongWeak = pasList;
          }
        }

        this.threId=result.threId;   //阀值列表id
        this.roomType=result.prisonTypeId;  //监室类型值
        this.roomTypeName=result.prisonTypeName;  //监室类型名称
        this.passType=result.channel.split(",").map(Number);  //通道选中后的值（不是名称）
        this.powerType=result.type;  //电源类型值
        this.Vmax=result.maxVoltage;
        this.Vmin=result.miniVoltage;
        this.Amax=result.maxCurrent;
        this.Amin=result.miniCurrent;
        this.Tmax=result.maxTemperature;
        this.alarmListPup = true;
      },
      //删除报警阀值列表数据
      deleteAlremList:function(id){
        let [self,tip] = [this,'是否确定删除这条数据？'];
        self.$confirm(tip, '删除提示', {confirmButtonText: '确定',cancelButtonText: '取消',type: 'warning'
          }).then(() => {
          let [url,data] = ['/sup/thresholdsetting/delete',{threId:id}];
          self.$http.post(url,data).then(function(result){
            if(result.data.flag){
              self.$message({message:result.data.msg,type: 'success'});
              self.getAlarmValueList(1);  //重新获取当前选中的分组下的设备及其开关状态
            }else{
              self.$message({message:result.data.msg,type:'warning'});
            }
          }).catch(function(erro){})
        }).catch(() => {});
      },
      //======================================报警阀值设置结束==================================

      //======================================监仓环境设置开始==================================
      //初始化时获取监仓环境设置
      getRoomState:function(){
        let [self,url,data] = [this,'/sup/environmentSettings/query',""];
        self.$http.post(url,data).then(function(result){
          if(result.data.flag){
            let res = result.data.data;
            self.environmentId = res.environmentId;
            self.dsContorl = res.startState==0?false:true;
            //流明度
            if(res.maxLumen<=3200 && res.miniLumen>=3000){
              self.radio=1
            }else if(res.maxLumen<=1000 && res.miniLumen>=800){
              self.radio=2
            }else if(res.maxLumen<=250 && res.miniLumen>=200){
              self.radio=3
            }
            //空气质量
            if(res.maxAmmonia<=200 && res.miniAmmonia>=20){
              self.radio1=1
            }else if(res.maxAmmonia<=700 && res.miniAmmonia>=600){
              self.radio1=2
            }else if(res.maxAmmonia<=1200 && res.miniAmmonia>=1100){
              self.radio1=3
            }
            //温度等级
            if(res.maxTemperHumidity<=1000 && res.miniTemperHumidity>=800){
              self.radio2=1
            }else if(res.maxTemperHumidity<=2100 && res.miniTemperHumidity>=2000){
              self.radio2=2
            }else if(res.maxTemperHumidity<=3000 && res.miniTemperHumidity>=2800){
              self.radio2=3
            }
          }else{
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
          self.$message({message:erro.msg,type:'warning'});
        })
      },
      // 点击开启或关闭自动检测开关
      dsContorlSW:function(res){
        let self = this;
        let tip = res==true?'是否确认开启自动检测？':'是否确认关闭自动检测？'
        self.$confirm(tip, '提示', {confirmButtonText: '确定',cancelButtonText: '取消',type: 'warning'
          }).then(() => {
          let [url,data] = ['/sup/environmentSettings/updateStart',{environmentId:self.environmentId,startState:res==true?1:0}];
          self.$http.post(url,data).then(function(result){
            console.log(result);
            if(result.data.flag){
              self.$message({message:result.data.msg,type: 'success'});
            }else{
              self.dsContorl = !res;
              self.$message({message:result.data.msg,type:'warning'});
            }
          }).catch(function(erro){self.dsContorl = !res;})
        }).catch(() => {self.dsContorl = !res});
      },
      // 保存编辑后的监仓环境配置信息
      saveConfigInfo:function(){
        let [self,url] = [this,'/sup/environmentSettings/update'];
        loading = self.$loading(opt);
        let data = {
          "environmentId":self.environmentId,
          "maxLumen":self.radio==1?3200:(self.radio==2?1000:250),
          "miniLumen":self.radio==1?3000:(self.radio==2?800:200),
          "maxAmmonia":self.radio1==1?200:(self.radio1==2?700:1200),
          "miniAmmonia":self.radio1==1?20:(self.radio1==2?600:1100),
          "maxTemperHumidity":self.radio2==1?1000:(self.radio2==2?2100:3000),
          "miniTemperHumidity":self.radio2==1?800:(self.radio2==2?2000:2800),
        }
        setTimeout(function(){
          self.$http.post(url,data).then(function(result){
            if(result.data.flag){
              self.$message({message:result.data.msg,type: 'success'});
              loading.close();
            }else{
              self.$message({message:result.data.msg,type:'warning'});
              loading.close();
            }
          }).catch(function(erro){
            self.$message({message:erro.msg,type:'warning'});loading.close();
          })
        },200)
      }
      //======================================监仓环境设置结束==================================
    },
    beforeDestroy() {
    	this.$eventBus.$off('updataOtherPage');  //关闭兄弟组件之间传递信息时$on会多次触发的问题
    }
  }
</script>

<style>
  @import url("../../../static/css/SystemSettings/Sys-DevicesSetting.css");
</style>
