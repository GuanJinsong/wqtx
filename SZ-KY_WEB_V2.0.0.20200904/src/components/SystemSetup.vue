<!-- 系统设置 -->
<template>
  <div class="mainView">
     <section class="s_equip-fence">
         <div class="s_history-left">
           <ul>
             <li @click="tagChange(0)" v-bind:class="0 == typeSelect?'history-bg1':''"><img src="../../static/images/setAlarm.png" alt=""/> <span>报警方案设置</span></li>
             <li @click="tagChange(1)" v-bind:class="1 == typeSelect?'history-bg1':''"><img src="../../static/images/set.png" alt=""/> <span>其他设置</span></li>
           </ul>
         </div>
         <div class="s_history-right">
             <div class="s_scheme1" v-show="typeSelect == 0">
                 <div class="s_cx-btn">
                     <div class="s_titleIcoParent">
                       <p class="s_titleIco">&nbsp;</p>
                       <div class="cx-btn1 sysRadio">
                         <p class="searchTit">查询范围:</p>
                         <template>
                           <el-radio-group v-model="radio" @change="clickRadio">
                             <el-radio :label="1">全部</el-radio>
                             <el-radio :label="2">筛选</el-radio>
                           </el-radio-group>
                         </template>
                       </div>
                     </div>
                     <div class="s_addPparent">
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
                         <button type="button" @click="checkSreachList()">查询</button>
                         <button type="button" @click="popuShowAndHide()">+添加报警方案</button>
                     </div>
                 </div>
                 <div class="s_table-box verticalScroll">
                     <table>
                         <thead>
                         <tr>
                             <th>站点</th>
                             <th>IMEI</th>
                             <th>方案参数</th>
                             <th>触发条件</th>
                             <th>报警方式</th>
                             <th>掉线报警</th>
                             <th>手机号码</th>
                             <th>邮箱</th>
                             <th>联系人</th>
                             <th>操作</th>
                             <th>报警状态</th>
                         </tr>
                         </thead>
                         <tbody>
                         <tr v-for="(lists,index) in s_alarmList" v-bind:key="index">
                            <td>{{lists.address}}</td>
                             <td>{{lists.imei}}</td>
                             <td>{{lists.parameterName}}</td>
                             <td>{{lists.alarmSelect}}</td>
                             <td>{{lists.alarmMode == 1 ? "短信":"邮件"}}</td>
                             <td>{{lists.dropState == 0 ? "否":"是"}}</td>
                             <td>{{lists.phone}}</td>
                             <td>{{lists.email}}</td>
                             <td>{{lists.people}}</td>
                             <td class="eidt">
                               <img src="../../static/images/eidt.png" @click="editingAlarm(lists)"/>
                               <img src="../../static/images/dele.png" @click="deleteAlarmTip(lists.alarmId,lists.imei,index)"/>
                             </td>
                             <td @click="getAlarmId(lists.alarmId)">
                               <el-switch v-model="lists.startState" active-color="#13ce66" inactive-color="#ff4949" @change="modifyTheStateOfAlarmScheme"></el-switch>
                             </td>
                         </tr>
                         </tbody>
                      </table>
                      <div class="reportPageBox" v-if="alarmScheme.length>1">
                        <ul class="mini pageStyle">
                          <li @click="getSystemSetData(1)">首页</li>
                          <li class="pageNumber" v-for="x in alarmScheme" v-bind:key="x" v-bind:class="{'pageSelect':s_selectpage == x}" @click="getSystemSetData(x)">{{x}}</li>
                          <li @click="getSystemSetData(pageTotal)">末页</li>
                        </ul>
                      </div>
                      <div class="nodataTip" v-if="alarmScheme.length ==0"><img style="width:400px;height:auto;" src="../../static/images/nodata.png"/></div>
                 </div>
             </div>
             <div class="s_other-set verticalScroll" v-show="typeSelect == 1">
                 <!-- 上报时间 -->
                 <div class="s_otherLeft">
                     <div class="s_otherTitle">上报时间</div>
                     <div class="s_otherSelect">
                       <label class="s_samllName">1.站点设备选择：</label>
                       <div class="sysCascader" style="width:250px;margin-left:30px;">
                         <el-cascader :options="options"
                         v-model="otherCascader"
                         @change="otherCasChange"
                         :props="defaultParams"
                         placeholder="请选择你需要的设备..."
                         popper-class="s_myCascader"
                         :show-all-levels = "true"
                         clearable></el-cascader>
                       </div>
                     </div>
                     <div class="s_otherIpPut"><label class="s_samllName">2.定时上报(分钟)：</label><input v-model="s_reportTime" type="number" placeholder="定时上报时间"></div>
                     <div class="s_otherIpPut"><label class="s_samllName">3.心跳时间设置(分钟)：</label><input v-model="s_heartbeatTime" type="number" placeholder="心跳时间"></div>
                     <button class="s_otherSure" @click="reportTimeSetting()">确定</button>
                     <p class="s_tipIco">&nbsp;</p>
                 </div>
                 <!-- 服务器IP和端口号 -->
                 <div class="s_otherCenter">
                     <div class="s_otherTitle">服务器IP和端口号</div>
                     <div class="s_otherSelect">
                       <label class="s_samllName">1.站点设备选择：</label>
                       <div class="sysCascader" style="width:250px;margin-left:30px;">
                         <el-cascader :options="options"
                         v-model="otherCascader1"
                         @change="otherCasChange1"
                         :props="defaultParams"
                         placeholder="请选择你需要的设备..."
                         popper-class="s_myCascader"
                         :show-all-levels = "true"
                         clearable></el-cascader>
                       </div>
                     </div>
                     <div class="s_otherIpPut"><label class="s_samllName">2.请输入IP：</label><input v-model="s_ip" type="text" placeholder="请输入IP"></div>
                     <div class="s_otherIpPut"><label class="s_samllName">3.请输入端口号：</label><input v-model="s_port" type="text" placeholder="请输入端口号"></div>
                     <button class="s_otherSure" @click="settingIPAndPortNumber()">确定</button>
                     <p class="s_tipIco">&nbsp;</p>
                 </div>
                 <!-- 设备复位 -->
                 <div class="s_otherRight">
                     <div class="s_otherTitle">设备复位</div>
                     <div class="s_otherSelect">
                       <label class="s_samllName">1.设备选择：</label>
                       <div class="sysCascader" style="width:250px;margin-left:30px;">
                         <el-cascader :options="options"
                         v-model="otherCascader2"
                         @change="otherCasChange2"
                         :props="defaultParams"
                         placeholder="请选择你需要的设备..."
                         popper-class="s_myCascader"
                         :show-all-levels = "true"
                         clearable></el-cascader>
                       </div>
                     </div>
                     <button class="s_otherSure" @click="setDeviceReset()">确定</button>
                     <p class="s_tipIco">&nbsp;</p>
                 </div>
                 <!-- GPS开关 -->
                 <div class="s_otherLeft">
                   <div class="s_otherTitle">GPS开关</div>
                   <div class="s_otherSelect">
                     <label class="s_samllName">1.设备选择：</label>
                     <div class="sysCascader" style="width:250px;margin-left:30px;">
                       <el-cascader :options="options"
                       v-model="otherCascader3"
                       @change="otherCasChange3"
                       :props="defaultParams"
                       placeholder="请选择你需要的设备..."
                       popper-class="s_myCascader"
                       :show-all-levels = "true"
                       clearable></el-cascader>
                     </div>
                   </div>
                   <div class="s_otherSelect">
                     <label class="s_samllName">2.设备GPS开/关：</label>
                     <div class="sysCascader" style="margin-left:30px;">
                      <el-switch
                        style="display: block;"
                        name="switch"
                        v-model="gpsSwitch"
                        active-color="#13ce66"
                        inactive-color="#ff4949"
                        active-text="开启"
                        inactive-text="关闭">
                      </el-switch>
                     </div>

                   </div>
                   <i class="s_gpsTip">提示：这里的gps开关默认是开启的，只用于修改，不代表当前选中的设备状态</i>
                   <button class="s_otherSure" @click="setGpsSwitch()">确定</button>
                   <p class="s_tipIco">&nbsp;</p>
                 </div>
             </div>
         </div>
     </section>
     <!-- 添加报警方案弹窗 -->
     <div class="popParent" v-show="popu">
         <div class="popAfter" style="width:570px;">
             <div class="s_popuTitle">报警方案</div>
             <ul class="s_popuList">
                 <li>
                   <label class="listName">站点：</label>
                   <div class="sysCascader">
                     <el-cascader :options="options"
                     v-model="addCascader"
                     @change="addCascaderChange"
                     :props="defaultParams"
                     placeholder="请选择你需要的设备..."
                     popper-class="s_myCascader"
                     :show-all-levels = "true"
                     clearable></el-cascader>
                   </div>
                 </li>
                 <li>
                   <label class="listName">参数：</label>
                   <template>
                     <el-select v-model="s_parameter" placeholder="请选择参数" class="mySelectAll" @change="selectionParameters">
                       <el-option v-for="item in s_parameterData" :key="item.codeName" :value="item.codeName"></el-option>
                     </el-select>
                   </template>
                 </li>
                 <li>
                   <label class="listName">触发条件：</label>
                   <template>
                     <el-select v-model="s_trigger" placeholder="请选择触发条件" class="mySelectAll" @change="triggerSelect" style="width:49%;">
                       <el-option v-for="item in s_triggerData" :key="item.id" :value="item.text"></el-option>
                     </el-select>
                   </template>
                   <p class="triggerVue" v-show="s_triggerBoxX">X <input type="text" v-model="s_X"/></p>
                   <p class="triggerVue" v-show="s_triggerBoxY">Y<input type="text" v-model="s_Y"/></p>
                 </li>
                 <li>
                   <label class="listName">报警方式：</label>
                   <template>
                     <el-select v-model="s_alarmMode" placeholder="请选择报警方式" class="mySelectAll" @change="selectionAlarmMode">
                       <el-option v-for="item in s_alarmModeData" :key="item.id" :value="item.text"></el-option>
                     </el-select>
                   </template>
                 </li>
                 <li v-show="s_alarmType == 1">
                   <label class="listName">手机号码：</label>
                   <input type="text" placeholder="请输入手机号码" v-model="s_phone" class="schemePut"/>
                 </li>
                 <li v-show="s_alarmType == 2">
                   <label class="listName">邮箱：</label>
                   <input type="text" placeholder="请输入邮箱" v-model="s_email" class="schemePut"/>
                 </li>
                 <li>
                   <label class="listName">联系人：</label>
                   <input type="text" placeholder="请输入联系人" v-model="s_people" class="schemePut "/>
                 </li>
             </ul>
             <div class="popuSureParent">
                 <button @click="addAndEditAlarm()">确认</button>
                 <button @click="popuShowAndHide()">取消</button>
             </div>
         </div>
     </div>
  </div>
</template>

<script>
  var self = "";
  var page = 1,pageSize = 15;
  var loading = "";  //定义loading
  var opt = {
      lock: true,
      text: '数据获取中...',
      spinner: 'el-icon-loading',
      customClass:'loadingClass',
      background: 'rgba(0, 0, 0, 0.5)',
  }
  export default{
    name:'SystemSetup',
    data(){
      return{
        treeList:[],          //定义树形结构数据
        typeSelect:0,         //定义当前选中的类型
        radio:1,              //定义查询范围选择
        search_imei:'',       //定义报警方案列表搜索时的imei
        options:[{value: '指南',label: '指南',
          children: [{
            value: '设计原则',
            label: '设计原则',
            children: [{value: '一致',label: '一致'}]
          }]
          }],
        defaultParams: {label: 'label',value: 'value',emitPath:true,},
        cascaderValue:[],        //定义报警方案查询中Cascader的值
        addCascader:[],          //定义编辑报警方案弹窗中的Cascader值
        otherCascader:[],        //其他报警方案下上报时间的设备选择
        s_reportTime:'',         //定义上报时间下的定时上报
        s_heartbeatTime:'',      //定义设备心跳时间
        otherCascader1:[],        //其他报警方案下服务器IP和端口号的设备选择
        otherCascader2:[],        //其他报警方案下复位的设备选择
        otherCascader3:[],        //其他报警方案下GPS开关的设备选择
        gpsSwitch:true,           //其他报警方案下GPS开关
        popu:false,              //定义添加报警弹窗的显示
        alarmScheme:'',          //定义报警方案分页列表
        s_selectpage:1,          //定义报警方案下选中的分页码
        s_alarmId:'',            //报警方案列表id
        s_imei:'',               //定义系统设置下设备型号 imei（新添加报警方案，和编辑报警方案都会用到）
        s_Reportimei:'',         //定义系统设置下 ->其他设置->设置上报时间->选择设备后的imei
        s_ReportType:'',         //定义系统设置下 ->其他设置->设置上报时间->选择设备后的协议类型（1Tcp,2Udp）
        s_SetIpimei:'',          //定义系统设置下 ->其他设置->设置ip和端口号->选择设备后的imei
        s_SetIpType:'',          //定义系统设置下 ->其他设置->设置ip和端口号->选择设备后的协议类型（1Tcp,2Udp）
        s_ip:"",                 //定义系统设置下 ->其他设置->设置ip和端口号->设备ip设置
        s_port:'',               //定义系统设置下 ->其他设置->设置ip和端口号->设备端口号设置
        s_setResetimei:'',       //定义系统设置下 ->其他设置->设置设备复位->选择设备后的imei
        s_setResetType:'',       //定义系统设置下 ->其他设置->设置设备复位->选择设备后的协议类型（1Tcp,2Udp）
        s_alarmList:'',          //定义系统设置下的报警方案列表
        s_deviceTip:true,        //定义系统设置下的列表无数据提示窗
        s_parameterData:[],      //定义添加报警方案里的参数所有可选值
        s_parameter:'',          //定义添加报警方案里的参数选中的值
        s_triggerData:[
          {id:1,text:'数值高于X'},
          {id:2,text:'数值低于X'},
          {id:3,text:'数值高于X，低于Y'},
          {id:4,text:'设备掉线'},
          {id:5,text:'低电压'}
        ],
        s_trigger:'',            //定义添加报警方案里的触发条件项（这里仅同于界面的展示使用）
        s_triggerSelect:'',      //定义s_triggerData内选中项的id值（主要用于判断当前选中项）
        s_triggerXY:'',          //定义添加报警方案里的触发条件项保存提交值（这里的结果用于提交报警方案时使用）
        s_X:'',                  //定义添加报警方案里的触发条件X值
        s_Y:'',                  //定义添加报警方案里的触发条件Y值

        s_outLineValue:0,       //定义添加报警方案里的掉线报警项(0否，1是)
        s_alarmModeData:[
          {id:1,text:'短信'},
          {id:2,text:'邮件'}
        ],                       //定义报警通知方式
        s_alarmMode:'短信',       //定义添加报警方案里的报警方式项
        s_alarmModeValue:1,      //定义添加报警方案里的报警方式项（1短信，2邮件）
        s_phone:'',              //定义添加报警方案里的手机号码项
        s_people:'',             //定义添加报警方案里的联系人项
        s_email:'',              //定义添加报警方案里的邮箱项
        s_alarmType:1,           //定义手机号码输入框和邮箱输入框的显示(1显示手机框，2显示邮箱框)
        s_triggerBoxX:true,      //定义报警方案里的触发条件X框的显示
        s_triggerBoxY:false,     //定义报警方案里的触发条件Y框的显示
        pageTotal:'',            //定义总页数
        s_heartbeatimei:'',      //定义系统设置下 ->其他设置->设置心跳设置->选择设备后的imei
        s_heartbeatTime:'',      //定义系统设置下 ->其他设置->设置心跳设置->心跳时间
      }
    },
    created() {
      self = this;
      //headerChange: 是父组件指定的传数据绑定的函数，this.header:子组件给父组件传递的数据
      var parentData = {header:true,nav:3};
      self.$emit('headerChange',parentData);
      self.treeList = self.$store.state.treeList;   //获取vuex内存储的数据
      self.options = self.treeList.newTree;
      self.getSystemSetData(1);
    },
    methods:{
       //报警方案设置与其他设置切换
       tagChange:function(index){
         self.typeSelect = index;
       },
       //Radio查询范围选择  Radio=1:全部  Radio=2：筛选
       clickRadio:function(data){
         //当选择全部时清空之前的imei码，因为全部时默认imei是空的，同时清空设备下拉框的选中结果
         if(data == 1){
           self.search_imei = "";
           self.cascaderValue="";
         }
       },
       //报警方案查询中Cascader的值 设备下拉框选择
       cascader:function(data){
         if(data.length !==0){
           self.radio = 2;
           var address = data[0]+'/'+data[1]+'/'+data[2]+'/'+data[3];
           self.treeList.newList.forEach(function(arr,index){
             if(arr.detailed == address){self.search_imei = arr.data.imei;self.s_imei = arr.data.imei;}
           })
         }else{
           self.search_imei = "";self.s_imei = "";
         }
       },
       //其他设置下，上报时间的设备选择
       otherCasChange:function(data){
         if(data.length !==0){
           var address = data[0]+'/'+data[1]+'/'+data[2]+'/'+data[3];
           self.treeList.newList.forEach(function(arr,index){
             if(arr.detailed == address){
               self.s_Reportimei = arr.data.imei;   //定义设备编号
               self.s_ReportType = arr.data.agreementType;   //定义当前选中的设备协议类型
             }
           })
         }else{
           self.s_Reportimei = "";self.s_ReportType = "";
         }
       },
       //其他设置下，服务器IP和端口号 设备选择
       otherCasChange1:function(data){
         if(data.length !==0){
           var address = data[0]+'/'+data[1]+'/'+data[2]+'/'+data[3];
           self.treeList.newList.forEach(function(arr,index){
             if(arr.detailed == address){
               self.s_SetIpimei = arr.data.imei;   //定义设备编号
               self.s_SetIpType = arr.data.agreementType;   //定义当前选中的设备协议类型
             }
           })
         }else{
           self.s_SetIpimei = "";self.s_SetIpType = "";
         }
       },
       //其他设置下，设备复位 设备选择
       otherCasChange2:function(data){
         if(data.length !==0){
           var address = data[0]+'/'+data[1]+'/'+data[2]+'/'+data[3];
           self.treeList.newList.forEach(function(arr,index){
             if(arr.detailed == address){
               self.s_setResetimei = arr.data.imei;   //定义设备编号
               self.s_setResetType = arr.data.agreementType;   //定义当前选中的设备协议类型
             }
           })
         }else{
           self.s_setResetimei = "";self.s_setResetType = "";
         }
       },
       //其他设置下，GPS开关 设备选择
       otherCasChange3:function(data){
         if(data.length !==0){
           var address = data[0]+'/'+data[1]+'/'+data[2]+'/'+data[3];
           self.treeList.newList.forEach(function(arr,index){
             if(arr.detailed == address){
               self.s_setResetimei = arr.data.imei;   //定义设备编号
               self.s_setResetType = arr.data.agreementType;   //定义当前选中的设备协议类型
             }
           })
         }else{
           self.s_setResetimei = "";self.s_setResetType = "";
         }
       },
       //编辑报警方案弹窗中的Cascader值 设备下拉框选择
       addCascaderChange:function(data){
         if(data.length !==0){
           var address = data[0]+'/'+data[1]+'/'+data[2]+'/'+data[3];
           self.treeList.newList.forEach(function(arr,index){
             if(arr.detailed == address){self.s_imei = arr.data.imei;self.getParameterList();}
           })
         }else{
           self.s_imei = "";
         }
         self.s_parameter = "";self.s_trigger="";self.s_triggerBoxY = false;self.s_X="";self.s_Y="";
       },
       //=================================================报警方案模块开始===============================
       //单击查询按钮，检验是否选中的设备，然后开始查询
       checkSreachList:function(){
          loading = self.$loading(opt);   //打开请求loading
          self.getSystemSetData(1);
       },
       //初始状态下获取全部的报警方案列表
       getSystemSetData:function(page){
         self.s_selectpage = page;    //定义当前选中的分页
         var url = "/api/alarm/getAlarmList";
         var userKey = localStorage.getItem("userKey");
         var data = {"imei":self.search_imei,"page":page,"pageSize":pageSize,userKey:userKey};
         self.$http.post(url,data).then(function(result){
           console.log(result)
           if(result.data.flag){
             var Result = result.data;
             var list = result.data.dataList;
             if(list.length>0){
               list.forEach(function(arr,index){
                 list[index].startState = arr.startState == 1 ? true:false;
               })
               self.s_alarmList = list;
               self.deviceListDataReturn(Result);    //分页处理函数
               loading.close();
             }else{
               self.s_alarmList = [];   //原有的数据列表
               self.alarmScheme = 0;  //清空分页列表
               loading.close();
             }
           }else{
             loading.close();
             self.$message.error(result.data.msg);
           }
         }).catch(function(erro){
           loading.close();
           self.$message.error('请求失败');
         })
       },
       //分页处理函数
       deviceListDataReturn:function (Result){
         let pageData =[];
         var nawPage = Result.page;
         var allPage = Result.totalPage
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
         self.alarmScheme = pageData;
       },
       //添加报警弹窗的显示与隐藏
       popuShowAndHide:function(){
         self.s_alarmId = "";self.addCascader = "";self.s_parameter = "";self.s_trigger="";self.s_triggerBoxY = false;self.s_X="";self.s_Y="";
         self.s_alarmMode ='短信';self.s_alarmModeValue=1;self.s_alarmType=1;self.s_phone="";self.s_people='';             //定义添加报警方案里的联系人项
         self.s_email='';
         if(self.popu){self.popu=false}else{self.popu=true}
       },
       //编辑报警方案列表
       editingAlarm:function(lists){
         self.popu=true;
         var alarmName = '';
         if(lists.alarmSelect.indexOf('高于') > -1 && lists.alarmSelect.indexOf('低于') == -1){
           alarmName = "数值高于X";
           self.s_triggerSelect = 1;
           self.s_parameter = lists.parameterName;       //定义添加报警方案里的参数项
           self.s_triggerBoxY = false;
           self.s_triggerBoxX = true;
         }else if(lists.alarmSelect.indexOf('低于') > -1 && lists.alarmSelect.indexOf('高于') == -1){
           alarmName = "数值低于X";
           self.s_triggerSelect = 2;
           self.s_parameter = lists.parameterName;       //定义添加报警方案里的参数项
           self.s_triggerBoxY = true;
           self.s_triggerBoxX = false;
         }else if(lists.alarmSelect.indexOf('高于')>-1 && lists.alarmSelect.indexOf('低于') >-1){
           alarmName = "数值高于X，低于Y";
           self.s_triggerSelect = 3;
           self.s_parameter = lists.parameterName;       //定义添加报警方案里的参数项
           self.s_triggerBoxY = true;
           self.s_triggerBoxX = true;
         }else if(lists.alarmSelect.indexOf('设备掉线') >-1){
           alarmName = lists.alarmSelect;
           self.s_triggerSelect== 4
           self.s_parameter = '';       //定义添加报警方案里的参数项
           self.s_triggerBoxY = false;
           self.s_triggerBoxX = false;
         }else if(lists.alarmSelect.indexOf('低电压') >-1){
           alarmName = lists.alarmSelect;
           self.s_triggerSelect = 5
           self.s_parameter = '';       //定义添加报警方案里的参数项
           self.s_triggerBoxY = false;
           self.s_triggerBoxX = false;
         }


         self.treeList.newList.forEach(function(arr,index){
           var _address = arr.detailed.split("/");
           _address = _address[3];
           if(_address == lists.address){
             self.addCascader = arr.detailed.split("/");   //定义选中的设备
           }
         })
         self.s_parameter = lists.parameterName;         //定义设备参数值
         self.s_alarmId = lists.alarmId;               //定义报警方案列表id
         self.s_imei = lists.imei;                        //定义设备型号
         self.s_trigger = alarmName;                    //定义添加报警方案里的触发条件项
         self.s_X = lists.thenValue;                    //定义添加报警方案里的触发条件项X值
         self.s_Y = lists.lowerValue;                   //定义添加报警方案里的触发条件项Y值

         self.s_alarmMode = lists.alarmFS;          //定义添加报警方案里的报警方式项名称
         self.s_alarmModeValue = lists.alarmFS == '短信'? 1:2;   //定义添加报警方案里的报警方式的值
         self.s_alarmType = lists.alarmFS == '短信'? 1:2;        //定义当前应该显示短信输入框还是邮箱输入框
         self.s_phone = lists.phone;                //定义添加报警方案里的手机号码项
         self.s_people = lists.people;              //定义添加报警方案里的联系人项
         self.s_email = lists.email;               //定义添加报警方案里的邮箱项
         self.getParameterList();    //获取参数数据
       },
       //添加/编辑报警方案
       addAndEditAlarm:function(){
         if(self.addCascader == ""){self.$message({message:'设备选择不得为空',type:'warning'}); return false;}
         if(self.s_trigger == ""){self.$message({message:'触发条件不得为空.',type:'warning'}); return false;}
         //数值高于X
         if(self.s_triggerSelect== 1){
           self.s_triggerXY = self.s_trigger.replace("X",self.s_X);   //触发条件
           self.s_outLineValue = 0;
           if(self.s_parameter == ""){self.$message({message:'参数不得为空',type:'warning'}); return false;}
           if(self.s_X == ""){self.$message({message:'X输入框不得为空',type:'warning'}); return false;}
          //数值低于Y
         }else if(self.s_triggerSelect== 2){
           self.s_triggerXY = self.s_trigger.replace("X",self.s_X);   //触发条件
           self.s_outLineValue = 0;
           if(self.s_parameter == ""){self.$message({message:'参数不得为空',type:'warning'}); return false;}
           if(self.s_X == ""){self.$message({message:'X输入框不得为空',type:'warning'}); return false;}
          //数值高于X，低于Y
         }else if(self.s_triggerSelect== 3){
           self.s_triggerXY = self.s_trigger.replace("X",self.s_X).replace("Y",self.s_Y);   //触发条件
           self.s_outLineValue = 0;
           if(self.s_parameter == ""){self.$message({message:'参数不得为空',type:'warning'}); return false;}
           if(self.s_Y == "" || self.s_Y == ""){self.$message({message:'X和Y输入框不得为空',type:'warning'}); return false;}
         }else if(self.s_triggerSelect== 4){
           self.s_parameter = "设备";
           self.s_triggerXY = "设备掉线";
           self.s_outLineValue = 1;
           self.s_X = '';
           self.s_Y = '';
         }else if(self.s_triggerSelect== 5){
           self.s_parameter = "电压";
           self.s_triggerXY = "低电压";
           self.s_outLineValue = 0;
           self.s_X = '';
           self.s_Y = '';
         }
         //手机号码验证
         if(self.s_alarmType == 1){
           if(self.s_phone == "" || self.s_phone.length !== 11){self.$message({message:'手机号码为空，或长度不对.',type:'warning'}); return false;}
         }
         //邮箱验证
         if(self.s_alarmType == 2){
           var reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$"); //正则表达式
           if(self.s_email == "" || !reg.test(self.s_email)){self.$message({message:'邮箱为空，或格式不对.',type:'warning'}); return false;}
         }
         //联系人验证
         if(self.s_people == ""){self.$message({message:'联系人不得为空.',type:'warning'}); return false;}

         var url = "/api/alarm/editAlarm";
         var data = {
           alarmId:self.s_alarmId,               //报警id(新加时为'',编辑时为报警方案列表id)
           imei:self.s_imei,                     //设备编号
           parameterName:self.s_parameter,       //参数名称
           alarmSelect:self.s_triggerXY,         //触发条件
           dropState:self.s_outLineValue,        //掉线报警（0否，1是）
           alarmMode:self.s_alarmModeValue,      //报警方式
           people:self.s_people,                 //联系人
           phone:self.s_phone,                   //联系电话
           email:self.s_email,                   //联系人邮箱
           thenValue:self.s_X,                   //触发条件高于的值
           lowerValue:self.s_Y                   //触发条件低于的值
         }
         console.log(data);
         self.$http.post(url,data).then(function(result){
           page = 1;   //定义page为1；
           if(result.data.flag){
             self.popu = false;
             self.$message({message: result.data.msg,type: 'success'});
             self.getSystemSetData(page);   //重新获取设备列表
           }else{
             self.$message.error(result.data.msg);
           }
         }).catch(function(erro){
           self.$message.error("请求失败");
         })
       },
       //获取 添加/编辑报警方案所需要的参数列表
       getParameterList:function(){
         self.s_parameterData = [];  //清空参数数据
         var data = {imei:self.s_imei};
         var url = "/api/device/getParameter";
         self.$http.post(url,data).then(function(result){
         console.log(result)
         if(result.data.flag){
           self.s_parameterData = result.data.rows;
         }else{
           self.$message.error(result.data.msg);
         }
         }).catch(function(erro){
           self.$message.error("请求失败");
         })
       },
       //删除报警方案列表提示
       deleteAlarmTip:function(alarmId,imei,index){
         var pupupTitle = "提示";    //弹窗标题
         var text = "您确定要删除设备号为:"+imei+"的报警方案吗？";   //弹窗内容
         self.$confirm(text, pupupTitle, {confirmButtonText:'确定',cancelButtonText:'取消',type: 'warning'}).then(() => {self.deleteAlarmList(alarmId,index)}).catch(() => {console.log("操作失败")});
       },
       //删除报警方案列表操作
       deleteAlarmList:function(alarmId,index){
         self.s_alarmList.splice(index,1);   //移除s_alarmList数组内的某一条数据
         var url = "/api/alarm/delAlarm";
         var data = {alarmId:alarmId};
         self.$http.post(url,data).then(function(result){
           console.log(result)
           if(result.data.flag){
             if(page>1 && index == 0){page = page-1;}
             self.getSystemSetData(page);   //重新获取设备列表
           }else{
             self.$message.error(result.data.msg);
           }
         }).catch(function(erro){
           self.$message.error("请求失败");
         })
       },
       //获取当前操作的方案id
       getAlarmId:function(alarmId){
         self.s_alarmId = alarmId;    //定义当前操作的报警方案id
         console.log(alarmId)
       },

       //修改报警方案状态
       modifyTheStateOfAlarmScheme:function(statusData){
         setTimeout(function(){
           var status = statusData== true ? 1:0;
           var url = "/api/alarm/editAlarmState";
           var data = {startState:status,alarmId:self.s_alarmId};
           self.$http.post(url,data).then(function(result){
             console.log(result);
             self.$message({message: result.data.msg,type: 'success'});
           }).catch(function(erro){
             self.$message.error(erro.data.msg);
           })
         },300)
       },
       //获取 添加/编辑报警方案所需要的参数列表
       getParameterList:function(){
         self.s_parameterData = [];  //清空参数数据
         var data = {imei:self.s_imei};
         var url = "/api/device/getParameter";
         self.$http.post(url,data).then(function(result){
         console.log(result)
         if(result.data.flag){
           self.s_parameterData = result.data.rows;
         }else{
           self.$message.error(result.data.msg);
         }
         }).catch(function(erro){
           self.$message.error("请求失败");
         })
       },
       //添加报警方案下 参数选择
       selectionParameters:function(data){
         let obj = {};
         obj = self.s_parameterData.find((item)=>{   //这里的s_parameterData就是上面遍历的数据源
           return item.codeName == data
         });
         self.s_parameter = obj.codeName;   //定义当前选中的参数
         self.s_trigger = '';    //修改参数时，报警的触发条件需要重置
         self.s_triggerBoxX = false;
         self.s_triggerBoxY = false;
         self.s_Y = '';
         self.s_X = '';
       },
       //添加报警方案下 触发条件选择
       triggerSelect:function(data){
         let obj = {};
         obj = self.s_triggerData.find((item)=>{   //这里的s_triggerData就是上面遍历的数据源
           return item.text == data
         });
         self.s_trigger = obj.text;   //定义当前选中的参数
         self.s_triggerSelect = obj.id;    //定义当前选中项
         if(obj.id == 1){
           self.s_triggerBoxX = true;
           self.s_triggerBoxY = false;
         }else if(obj.id == 2){
           self.s_triggerBoxX = true;
           self.s_triggerBoxY = false;
         }else if(obj.id == 3){
           self.s_triggerBoxX = true;
           self.s_triggerBoxY = true;
         }else if(obj.id == 4 || obj.id == 5){
           self.s_triggerBoxX = false;
           self.s_triggerBoxY = false;
           self.s_parameter = '';
           self.s_Y = '';
           self.s_X = '';
         }
       },
       //添加报警方案下 报警方式选择
       selectionAlarmMode:function(data){
         let obj = {};
         obj = self.s_alarmModeData.find((item)=>{   //这里的s_alarmModeData就是上面遍历的数据源
           return item.text == data
         });
         self.s_alarmMode = obj.text;   //定义当前选中的参数名称
         self.s_alarmModeValue = obj.id;   //定义当前选中的参数值
         self.s_alarmType = obj.id;    //切换报警方式
         self.s_phone = '';    //清空手机输入框值
         self.s_email = '';    //清空邮箱输入框值
       },
      //=================================================报警方案模块结束===============================

      //=========================================系统设置下的其他设置开始===============================
      //上报时间设置
      reportTimeSetting:function(){
        var opt1 = {lock: true,text: '修改中...',spinner: 'el-icon-loading',customClass:'loadingClass',background: 'rgba(0, 0, 0, 0.5)'};
        if(self.otherCascader == ""){self.$message({message:"设备选择不得为空!",type:'warning'});return false}
        if(self.s_reportTime == ""){self.$message({message:"上报时间不得为空!",type:'warning'});return false}
        if(self.s_heartbeatTime == ""){self.$message({message:"设备心跳时间不得为空!",type:'warning'});return false}
        if(self.s_heartbeatTime<=0 || self.s_heartbeatTime>10){self.$message({message:"设备心跳时间必须大于0且小于10",type:'warning'});return false}
        var userKey = localStorage.getItem("userKey");
        var data = {type:self.s_ReportType,imei:self.s_Reportimei,time:self.s_reportTime,userKey:userKey,hatime:self.s_heartbeatTime}
        var url = "/api/device/sendTime";
        loading = self.$loading(opt1);   //打开请求loading
        self.$http.post(url,data).then(function(result){
          console.log(result);
          loading.close();
          self.$message({message: result.data.msg,type: 'success'});
        }).catch(function(erro){
          loading.close();
          self.$message.error(erro.data.msg);
        })
      },
      //设置服务器IP和端口号
      settingIPAndPortNumber:function(){
        var opt2 = {lock: true,text: '修改中...',spinner: 'el-icon-loading',customClass:'loadingClass',background: 'rgba(0, 0, 0, 0.5)'};
        var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
        if(reg.test(self.s_ip)== false && self.s_ip !== ""){self.$message({message: '设备ip号为空，或者格式错误.',type: 'warning'});return false;}
        if(self.otherCascader1 == ""){self.$message({message:"设备选择不得为空!",type:'warning'});return false};
        if(self.s_port == ""){self.$message({message:"设备端口号不得为空!",type:'warning'});return false};
        var userKey = localStorage.getItem("userKey");
        var data = {type:self.s_SetIpType,imei:self.s_SetIpimei,ip:self.s_ip,port:self.s_port,userKey:userKey};
        var url = "/api/device/setHost";
        loading = self.$loading(opt2);   //打开请求loading
        self.$http.post(url,data).then(function(result){
          console.log(result);
          loading.close();
          self.$message({message: result.data.msg,type: 'success'});
        }).catch(function(erro){
          loading.close();
          self.$message.error(erro.data.msg);
        })
      },
      //设备复位
      setDeviceReset:function(){
        var opt3 = {lock: true,text: '复位中...',spinner: 'el-icon-loading',customClass:'loadingClass',background: 'rgba(0, 0, 0, 0.5)'};
        if(self.otherCascader2 == ""){self.$message({message:"复位设备选择不得为空!",type:'warning'});return false;}
        var userKey = localStorage.getItem("userKey");
        var data = {type:self.s_setResetType,imei:self.s_setResetimei,userKey:userKey};
        var url = "/api/device/resetAgreement";
        loading = self.$loading(opt3);   //打开请求loading
        self.$http.post(url,data).then(function(result){
          console.log(result);
          loading.close();
          self.$message({message: result.data.msg,type: 'success'});
        }).catch(function(erro){
          loading.close();
          self.$message.error(erro.data.msg);
        })
      },
      //GPS开关
      setGpsSwitch:function(){
        var opt3 = {lock: true,text: '修改中...',spinner: 'el-icon-loading',customClass:'loadingClass',background: 'rgba(0, 0, 0, 0.5)'};
        if(self.otherCascader3 == ""){self.$message({message:"设备选择不得为空!",type:'warning'});return false;}
        var userKey = localStorage.getItem("userKey");
        var switchSataus = self.gpsSwitch==false?0:1;   //0关1开
        var data = {type:self.s_setResetType,imei:self.s_setResetimei,userKey:userKey,state:switchSataus};
        var url = "/api/device/sendGps";
        loading = self.$loading(opt3);   //打开请求loading
        self.$http.post(url,data).then(function(result){
          console.log(result);
          loading.close();
          self.$message({message: result.data.msg,type: 'success'});
        }).catch(function(erro){
          loading.close();
          self.$message.error(erro.data.msg);
        })
      }
      //=========================================系统设置下的其他设置结束===============================
    }
  }
</script>

<style>
</style>
