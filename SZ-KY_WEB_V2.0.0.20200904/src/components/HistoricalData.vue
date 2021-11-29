<!-- 历史数据 -->
<template>
  <div class="mainView">
     <section class="h_equip-fence">
         <div class="h_history-left">
           <ul>
             <li @click="tagChange(0)" v-bind:class="0 == typeSelect?'history-bg1':''"><img src="../../static/images/alarmSearcd.png" alt=""/> <span>报警查询</span></li>
             <li @click="tagChange(1)" v-bind:class="1 == typeSelect?'history-bg1':''"><img src="../../static/images/deviceS.png" alt=""/> <span>多设备单参数查询</span></li>
             <li @click="tagChange(2)" v-bind:class="2 == typeSelect?'history-bg1':''"><img src="../../static/images/device1.png" alt=""/> <span>单设备多参数查询</span></li>
             <li @click="tagChange(3)" v-bind:class="3 == typeSelect?'history-bg1':''"><img src="../../static/images/max.png" alt=""/> <span>参数最值查询</span></li>
             <li @click="tagChange(4)" v-bind:class="4 == typeSelect?'history-bg1':''"><img src="../../static/images/run.png" alt=""/> <span>运行日志</span></li>
           </ul>
         </div>
         <div class="h_history-right">
             <div class="h_scheme1">
                 <div class="h_cx-btn">
                     <div class="h_titleIcoParent">
                       <p class="h_titleIco">&nbsp;</p>
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
                     <div class="h_addPparent">
                         <div class="sysCascader" style="width:250px;">
                           <el-cascader v-show="!cascaderSelect" :options="optionRiver"
                           v-model="cascaderValueRiver"
                           @change="cascadeRiver"
                           placeholder="请选择你需要的河流"
                           popper-class="s_myCascader"
                           :show-all-levels = "true"
                           clearable></el-cascader>
                           <el-cascader v-show="cascaderSelect" :options="options"
                           v-model="cascaderValue"
                           @change="cascader"
                           placeholder="请选择你需要的设备..."
                           popper-class="s_myCascader"
                           :show-all-levels = "true"
                           clearable></el-cascader>
                         </div>
                         <div class="his-daviceSelect" v-show="parameterShow">
                           <template>
                             <el-select v-model="s_parameter" placeholder="请选择参数" class="mySelectAll" @change="selectionParameters">
                               <el-option v-for="(item,index) in s_parameterData" :key="index" :value="item.codeName"></el-option>
                             </el-select>
                           </template>
                         </div>
                         <div class="his_Picker">
                           <el-date-picker style="width:300px;"
                             v-model="selectTime"
                             type="daterange"
                             align="center"
                             @change="changeTime"
                             unlink-panels
                             range-separator="至"
                             start-placeholder="开始日期"
                             end-placeholder="结束日期"
                             clearable
                             :picker-options="pickerOptions">
                           </el-date-picker>
                         </div>
                         <div class="searchBox" v-show="searchInput"><input type="text" v-model="searchWord" placeholder="请输入你想搜索的关键字"/></div>
                         <button type="button" @click="clickSearch(1)">查询</button>
                         <button @click="exportExeclTip()">导出Execl</button>
                     </div>
                     <!-- 这里的"19"表示的是雨量code值,当参数为雨量时显示下面的这句提醒 -->
                     <p v-if="m_parameterValue == 19" class="maxTip">特别提示：雨量最大累计值，仅适用于数据上报时间为2分钟的设备，请注意.</p>
                 </div>
                 <div class="h_table-box verticalScroll">
                     <table v-show="typeSelect ==0">
                         <thead>
                         <tr>
                             <th>站点</th>
                             <th>IMEI</th>
                             <th>方案参数</th>
                             <th>数值</th>
                             <th>时间</th>
                         </tr>
                         </thead>
                         <tbody>
                         <tr v-for="(lists,index) in s_alarmList" v-bind:key="index">
                             <td>{{lists.address}}</td>
                             <td>{{lists.imei}}</td>
                             <td>{{lists.parametername}}</td>
                             <td>{{lists.alarmContent}}</td>
                             <td>{{lists.timeStr}}</td>
                         </tr>
                         </tbody>
                     </table>
                     <!-- 多设备单数据查询 -->
                     <div class="moreDevice horizontalScroll" v-show="typeSelect ==1">
                       <table>
                         <thead>
                             <tr><th v-for="nameL in nameList" colspan="3">{{nameL}}</th></tr>
                             <tr>
                               <template v-for="index in nameList.length"><th>参数名称</th><th>参数值</th><th>时间</th></template>
                             </tr>
                         </thead>
                         <tbody>
                          <tr v-for="(indexData,index) in pararmList">
                            <template v-for="(indDat,ind) in indexData">
                              <td>{{indDat.para}}</td>
                              <td>{{indDat.paraVa}} {{indDat.unitl}}</td>
                              <td style="min-width:150px;">{{indDat.time}}</td>
                            </template>
                           </tr>
                         </tbody>
                       </table>
                     </div>

                     <!-- 单设备多参数查询 -->
                     <table v-show="typeSelect ==2">
                       <thead>
                         <tr>
                             <th>站点</th>
                             <th>IMEI</th>
                             <th v-for="(heads,index) in si_parameHeadList" v-bind:key="index">{{heads.parameterName}}</th>
                             <th>时间</th>
                         </tr>
                       </thead>
                       <tbody>
                         <tr v-for="(lists,index) in si_parameList" v-bind:key="index">
                           <td>{{lists.deviceName}}</td>
                           <td>{{search_imei}}</td>
                           <td v-for="(si_list,s_index) in lists.data" v-bind:key="s_index">{{si_list.value + si_list.unitl}}</td>
                           <td>{{lists.time}}</td>
                         </tr>
                       </tbody>
                     </table>
                     <!-- 参数最值查询 -->
                     <table v-show="typeSelect ==3">
                       <thead v-if="m_parameterValue == 19">
                         <tr><th style="width:10%;vertical-align: middle;" rowspan="2">日期</th><th style="width:22.5%;" colspan="2">10分钟最大累计值</th><th style="width:22.5%;" colspan="2">30分钟最大累计值</th><th style="width:22.5%;" colspan="2">60分钟最大累计值</th><th style="width:22.5%;" colspan="2">当日最大累计值</th></tr>
                         <tr><th>雨量(mm)</th><th>水位(m)</th><th>雨量(mm)</th><th>水位(m)</th><th>雨量(mm)</th><th>水位(m)</th><th>雨量(mm)</th><th>水位(m)</th></tr>
                       </thead>
                       <thead v-else>
                         <tr><th style="width:10%;vertical-align: middle;" rowspan="2">日期</th><th style="width:45%;" colspan="2">最大值</th><th style="width:45%;" colspan="2">最小值</th></tr>
                         <tr><th>数值</th><th>时间</th><th>数值</th><th>时间</th></tr>
                       </thead>
                       <tbody>
                         <template v-if="m_parameterValue == 19">
                           <tr v-for="(lists,indexs) in maxRainValueData" v-bind:key="indexs"><td>{{lists.timeStr}}</td><td>{{lists.tenValue}}</td><td>{{lists.tenWater}}</td><td>{{lists.thirtyValue}}</td><td>{{lists.thirtyWater}}</td><td>{{lists.sixtyValue}}</td><td>{{lists.sixtyWater}}</td><td>{{lists.sumValue}}</td><td>{{lists.sumWater}}</td></tr>
                         </template>
                         <template v-else>
                           <tr v-for="(list,index) in maxValueData" v-bind:key="index"><td>{{list.timeStr}}</td><td>{{list.maxValue}}</td><td>{{list.maxTime}}</td><td>{{list.minValue}}</td><td>{{list.minTime}}</td></tr>
                         </template>
                       </tbody>
                     </table>
                     <!-- 运行记录 -->
                     <table v-show="typeSelect ==4">
                       <thead>
                         <tr><th>站点</th><th>IMEI</th><th>日志说明</th><th>时间</th></tr>
                       </thead>
                       <tbody>
                         <tr v-for="(runLog,index) in runLogData" v-bind:key="index">
                           <td>{{runLog.city}}/{{runLog.county}}/{{runLog.river}}/{{runLog.address}}</td>
                           <td>{{runLog.imei}}</td>
                           <td>{{runLog.logcontent}}</td>
                           <td>{{runLog.addTimeStr}}</td>
                         </tr>
                       </tbody>
                     </table>

                      <div class="reportPageBox" v-cloak v-if="alarmInquiry.length>1">
                        <ul class="mini pageStyle">
                          <li @click="getPageData(1)">首页</li>
                          <li class="pageNumber" v-for="x in alarmInquiry" v-bind:key="x" v-bind:class="{'pageSelect':a_selectPage == x}" @click="getPageData(x)">{{x}}</li>
                          <li @click="getPageData(pageTotal)">末页</li>
                        </ul>
                      </div>
                      <div class="nodataTip" v-cloak v-if="alarmInquiry.length ==0"><img style="width:300px;height:auto;" src="../../static/images/nodata.png"/></div>
                 </div>
             </div>
         </div>
     </section>
     <!-- Excel导出类型选择 -->
     <el-dialog title="Exexl文件类型选择" :visible.sync="dialogFormVisible" :modal-append-to-body="false" width="500px">
       <div class='exexlTipBoxPar'>
         <div class='exexlTipBox'>
           <i @click="changeExecl(1)"><span v-bind:class="execlNum ==1?'exexlSelect':''">&nbsp;</span></i><p>Execl2003版本及以前</p>
         </div>
         <div class='exexlTipBox'>
           <i @click="changeExecl(2)"><span v-bind:class="execlNum ==2?'exexlSelect':''">&nbsp;</span></i><p>Execl2007版本及以后</p>
         </div>
       </div>
       <p class='exTipTxt'>提示:请根据你电脑上的Exexl版本，选择合适的版本下载，WPS请选择Execl2007版本及以后</p>
       <div slot="footer" class="dialog-footer">
         <el-button @click="dialogFormVisible = false">取 消</el-button>
         <el-button type="primary" @click="exportExecl()">确 定</el-button>
       </div>
     </el-dialog>
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
    name:'HistoricalData',
    data(){
      return{
        treeList:[],          //定义树形图结构数据
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
        cascaderValue:[],        //定义查询中Cascader的值
        optionRiver:[],          //定义多设备单参数查询时，河流选择的数据
        cascaderValueRiver:[],   //定义多设备单参数查询时，选中的河流值
        riverListRec:[],         //定义修改后的newList数据，用于对比筛选出当前选中的河流对应的河流设备码
        cascaderSelect:true,     //定义当前的设备选择框的类型
        deviceName:'',           //定义当前选中设备的名称
        pickerOptions: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
        selectTime:'',
        s_alarmList:[],            //定义报警列表数据
        alarmScheme:'',
        s_parameter:"PH",             //定义选中的设备参数
        s_parameterData:[],         //定义设备对应的参数数据
        a_selectPage:1,             //定义当前选中的分页码
        a_startTime:'',             //定义开始时间
        a_endTime:'',               //定义结束时间
        m_parameterValue:9,         //定义多设备查询下的参数值(由于默认为PH然后ph的code又是9，所以这里的默认值为9)
        si_parameHeadList:[],       //定义单设备多参数的表头
        si_parameList:[],           //定义单设备多参数列表数据
        alarmInquiry:[],            //定义报警数据分页列表
        m_alarmList:[],             //定义多设备相同参数列表
        parameterShow:false,        //定义参数选择框是否出现
        pageTotal:'',               //定义总页数
        maxValueData:[],            //定义最大历史数据值
        maxRainValueData:[],        //定义雨量最大历史数据
        execlNum:2,                 //定义选中的Execl文件类型
        dialogFormVisible:false,    //定义Execl文件选择类型弹窗是否显示,
        searchWord:"",              //定义搜索框的关键词
        searchInput:false,          //定义搜索输入框是否出现
        runLogData:[],              //定义运行日志
        nameList:[],
        pararmList:[],
      }
    },
    created() {self = this;},
    mounted() {
      //headerChange: 是父组件指定的传数据绑定的函数，this.header:子组件给父组件传递的数据
      var parentData = {header:true,nav:4};
      self.$emit('headerChange',parentData);
      self.treeList = self.$store.state.treeList;   //获取vuex内存储的数据
      self.options = self.$store.state.treeList.newTree;
      self.treeDataFiltering(self.options,self.$store.state.treeList.newList);
      self.clickSearch(1);   //获取报警查询列表,默认初始的时候typeSelect=0,获取报警列表
    },
    methods:{
      //报警方案设置与其他设置切换
      tagChange:function(index){
        self.a_selectPage = 1;
        self.typeSelect = index;
        self.selectTime = "";self.a_startTime="";self.a_endTime="";//重置时间
        switch(index){
          case 0:
              self.cascaderValue = "";self.search_imei = "";
              self.deviceName = "";self.s_parameterData = [];
              self.clickSearch(1);
              break;
          case 1:
              var defaultV = self.riverListRec[0].detailed.split('/');
              self.cascaderValueRiver = defaultV.splice(0,3);
              self.search_imei = self.riverListRec[0].data.imei;
              self.deviceName = self.riverListRec[0].data.address;
              self.getParameterList(self.riverListRec[0].data.imei);    //获取设备参数
              break;
          case 2:
              self.cascaderValue = self.treeList.newList[0].detailed.split('/');
              self.search_imei = self.treeList.newList[0].data.imei;
              self.deviceName = self.treeList.newList[0].data.address;
              self.getParameterList(self.treeList.newList[0].data.imei);    //获取设备参数
              break;
          case 3:
              self.cascaderValue = self.treeList.newList[0].detailed.split('/');
              self.search_imei = self.treeList.newList[0].data.imei;
              self.deviceName = self.treeList.newList[0].data.address;
              self.getParameterList(self.treeList.newList[0].data.imei);    //获取设备参数
              break;
          case 4:
              self.cascaderValue = "";self.search_imei = "";
              self.deviceName = "";self.s_parameterData = [];
              self.clickSearch(1);
              break;
          default:
              return false
        }
      },
      //Radio查询范围选择  Radio=1:全部  Radio=2：筛选
      clickRadio:function(data){
        //当选择全部时清空之前的imei码，因为全部时默认imei是空的，同时清空设备下拉框的选中结果
        if(data == 1){
          self.search_imei = "";
          self.cascaderValue="";
          self.s_parameter = "";
        }
      },
      //报警方案查询中Cascader的值 设备下拉框选择
      cascader:function(data){
        self.radio = 2;
        if(data.length !== 0){
          var address = data[0]+'/'+data[1]+'/'+data[2]+'/'+data[3];
          self.deviceName = data[3];
          self.treeList.newList.forEach(function(arr,index){
            if(arr.detailed === address){
              self.search_imei = arr.data.imei;
              self.getParameterList(arr.data.imei);   //获取设备参数
            }
          })
        }else{
          self.search_imei = "";
        }
      },
      //报警方案列表下的多设备单参数查询的河流选择
      cascadeRiver:function(data){
        self.radio = 2;
        if(data.length !== 0){
          var river = data[0]+'/'+data[1]+'/'+data[2];
          for(var i=0;i<self.riverListRec.length;i++){
            if(self.riverListRec[i].detailed == river){
              self.search_imei = self.riverListRec[i].data.imei;
              self.getParameterList(self.riverListRec[i].data.imei);   //获取设备参数
              break;
            }
          }
        }else{
          self.search_imei = "";
        }
      },
      //根据从vuex中得到的树形设备结构数据，筛选出直到河流这一层的结构数据，主要应用于多设备单参数参数中
      treeDataFiltering:function(filter,newFilter){
        var filterList = filter;
        var newFilterList = newFilter;
        if(filterList.length>0){
          var filterTree = [];
          for(var i=0;i<filterList.length;i++){
             var list = {value: 1,label: '深圳市',children:[]}
             var cityList = filterList[i].children;
             list.value = filterList[i].value;
             list.label = filterList[i].label;
             for(var q=0;q<cityList.length;q++){
               var countylst = {value: 1,label: '南山区',children:[]}
               var countyList = cityList[q].children;
               countylst.value = cityList[q].value;
               countylst.label = cityList[q].label;
               for(var w=0;w<countyList.length;w++){
                 var riverlst = {value: 1,label: '西丽'}
                 riverlst.value = countyList[w].value;
                 riverlst.label = countyList[w].value;
                 countylst.children.push(riverlst);
               }
               list.children.push(countylst);
             }
             filterTree.push(list);
          }
          self.optionRiver = filterTree;
          var newRiverList = [];
          for(var r=0;r<newFilterList.length;r++){
            var newRiver = {detailed:"",data:""};
            var index = newFilterList[r].detailed.lastIndexOf("\/");
            var ddd  = newFilterList[r].detailed.substring(0, index);
            newRiver.detailed = ddd;
            newRiver.data = newFilterList[r].data;
            newRiverList.push(newRiver);
          }
          self.riverListRec = newRiverList;
          var vals = newRiverList[0].detailed.split("/")
          console.log(vals);
          self.cascaderValueRiver = vals;  //多设备单参数查询时给河流选择框设置初始值
        }
      },

      //设备参数选择
      selectionParameters:function(data){
        let obj = {};
        obj = self.s_parameterData.find((item)=>{   //这里的s_parameterData就是上面遍历的数据源
          return item.codeName == data
        });
        self.s_parameter = obj.codeName;   //定义当前选中的参数
        self.m_parameterValue = obj.code;
        loading = self.$loading(opt);   //打开请求loading
        if(self.typeSelect == 1){
          self.queryDeviceParameters(1);
        }else if(self.typeSelect == 3){
          self.getParameterMax(1);
        }
      },
      changeTime:function(data){
        if(data !== null){
          var newVal = self.GMTToStr(data[0])+"00:00:00";
          self.a_startTime = newVal;
          var endVal = self.GMTToStr(data[1])+"23:59:59";
          self.a_endTime = endVal;
        }else{
          self.a_startTime = "";
          self.a_endTime = "";
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
      //点击查询按钮，判断当前所处的类型，选这对应的请求
      clickSearch:function(page){
        loading = self.$loading(opt);   //打开请求loading
        switch(self.typeSelect){
          case 0:
              self.getAlarmInquiryList(page);   //获取报警查询列表
              self.parameterShow = false;self.searchInput=false;
              self.cascaderSelect = true;    //定义当前的设备选择组件哪一个显示
              break;
          case 1:
              self.queryDeviceParameters(page);   //开始查询多设备参数
              self.parameterShow = true;self.searchInput=false;
              self.cascaderSelect = false;   //定义当前的设备选择组件哪一个显示
              break;
          case 2:
              self.getSingleDeviceParameterData(page);    //获取单设备参数数据
              self.parameterShow = false;self.searchInput=false;
              self.cascaderSelect = true;   //定义当前的设备选择组件哪一个显示
              break;
          case 3:
              self.getParameterMax(page);    //查询雨量峰值和其他参数的最大最小值
              self.parameterShow = true;self.searchInput=false;
              self.cascaderSelect = true;   //定义当前的设备选择组件哪一个显示
              break;
          case 4:
              self.parameterShow = false;self.searchInput=true;
              self.cascaderSelect = true;   //定义当前的设备选择组件哪一个显示
              self.getDeviceLog(page);   //获取运行日志
              break;
          default:
              return false
        }
      },
      //获取设备参数
      getParameterList:function(imei){
        self.s_parameterData = [];  //清空参数数据
        var data = {imei:imei};
        var url = "/api/device/getParameter";
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.s_parameterData = result.data.rows;
            self.s_parameter = result.data.rows[0].codeName;
            self.m_parameterValue = result.data.rows[0].code;
            //获取完参数后主动请求一次当前参数对应的数据
            self.clickSearch(1);
          }else{
            self.m_alarmList = [];   //当获取设备参数失败时，清空之前可能存在的数据
            self.alarmInquiry = [];  //清空原来的分页
            self.$message.error(result.data.msg);
          }
        }).catch(function(erro){
          self.$message.error("请求失败");
        })
      },
      //获取报警查询列表
      getAlarmInquiryList:function(page){
        self.a_selectPage = page;    //定义当前选中的分页码
        var userKey = localStorage.getItem("userKey");
        var data = {imei:self.search_imei,userKey:userKey,startDate:self.a_startTime,endDate:self.a_endTime,page:page,pageSize:pageSize};
        var url = "/api/alarmrecord/getAlarmRecord";
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            var Result = result.data;
            self.deviceListDataReturn(Result);    //分页处理函数
            self.s_alarmList = result.data.dataList;
            loading.close();  //请求操作完成后关闭loading
          }else{
            self.s_alarmList = [];   //清空原来可能存在的数据
            self.alarmInquiry = [];
            self.$message.error(result.data.msg);
            loading.close();  //请求操作完成后关闭loading
          }
        }).catch(function(erro){
          self.$message.error(erro.data.msg);
          loading.close();  //请求操作完成后关闭loading
        })
      },

      //=====================================多设备单参数查询开始========================================
      queryDeviceParameters:function(page){
        var m_city="",m_region="",m_river="";
        if(self.cascaderValueRiver.length>0){
          m_city = self.cascaderValueRiver[0];
          m_region = self.cascaderValueRiver[1]
          m_river = self.cascaderValueRiver[2]
        }
        var userKey = localStorage.getItem("userKey");
        var data = {
          userKey:userKey,
          city:m_city,
          county:m_region,
          river:m_river,
          page:page,
          pageSize:pageSize,
          startDate:self.a_startTime,
          endDate:self.a_endTime,
          code:self.m_parameterValue,
        };
        var url = "/api/devicedata/querySigleSensorData";
        self.$http.post(url,data).then(function(result){
          console.log(result);
          if(result.data.flag){
            var Result = result.data.dataList;
            if(Result.length>0){
              var deviceList = [];   //定义表头数据
              var pararm = [];    //定义列表数据
              var listSize = 0;   //定义列表的初始长度
              //通过这里的循环找出最长的一条数据
              for(let m=0;m<Result.length;m++){
                if(Result[m].data.length>listSize){
                  listSize = Result[m].data.length;
                }
              }
              for(let i=0;i<Result.length;i++){
                var lit = Result[i].city+"/"+Result[i].county+"/"+Result[i].river+"/"+Result[i].address;
                deviceList.push(lit);
                var ltData = Result[i].data;
                //判断当前返回的数据长度是否符合规定的listSize长度，如果比预计的长度短，则补缺缺少的部分
                if(ltData.length !== listSize){
                  let leg = listSize-ltData.length;
                  for(let n=0;n<leg;n++){
                    var nullParam = {parameterName:self.s_parameter,value:"",addTimeStr:""};
                    ltData.push(nullParam)
                  }
                }
                for(let a=0;a<ltData.length;a++){
                  var ttt = [];
                  var lt = {para:'',paraVa:'',time:'',unitl:''};
                  lt.para = ltData[a].parameterName;
                  lt.paraVa = ltData[a].value;
                  lt.time = ltData[a].addTimeStr;
                  lt.unitl = ltData[a].unitl;
                  ttt.push(lt);
                  if(pararm.length !== ltData.length){
                    pararm.push(ttt);
                  }else{
                    pararm[a].push(lt);
                  }
                }
              }
              self.nameList = deviceList;
              self.pararmList = pararm;
              self.deviceListDataReturn(result.data);    //分页处理函数
              loading.close();  //请求操作完成后关闭loading
            }else{
              self.nameList = [];self.pararmList = [];   //当获取数据没有时，清空之前可能存在的数据
              self.alarmInquiry = [];    //清空分页数据
              loading.close();  //请求操作完成后关闭loading
            }
          }else{
            self.nameList = [];self.pararmList = [];   //当获取数据失败时，清空之前可能存在的数据
            self.alarmInquiry = [];   //清空分页数据
            self.$message.error(result.data.msg);
            loading.close();  //请求操作完成后关闭loading
          }
        }).catch(function(erro){
          self.$message.error(erro.data.msg);
          loading.close();  //请求操作完成后关闭loading
        })
      },

      //=======================================获取单设备多参数数据开始=====================================
      getSingleDeviceParameterData:function(page){
        var data = {imei:self.search_imei,startDate:self.a_startTime,endDate:self.a_endTime,page:page,pageSize:pageSize}
        var url = "/api/devicedata/getSensorData";
        self.$http.post(url,data).then(function(result){
          console.log(result);
          if(result.data.flag){
            var Result = result.data;
            self.deviceListDataReturn(Result);    //分页处理函数
            if(result.data.dataList.length>0){
              var moreLength = 0,dataIndex = 0;
              result.data.dataList.forEach(function(arr,index){
                var maxList = arr.data.length;
                Object.assign(arr,{deviceName:self.deviceName});   //将当前的选中的设备名称合并到当前循环的对象中，便于列表渲染
                if(maxList>moreLength){
                  moreLength = maxList;
                  dataIndex = index;
                }
              })

              //遍历当前获取到的所有数据，针对数据可能缺失的情况，对缺失部分采取空值补填
              var maxLong = result.data.dataList[dataIndex].data;
              result.data.dataList.forEach(function(arr,index){
                var thisListLength = arr.data.length;
                //1.判断某一条数据长度是否为0，如果是那么补空
                //2.判断当前遍历的这条数据长度是否大于0小于最大长度的数据
                if(thisListLength == 0){
                  var addList = maxLong;
                  addList.forEach(function(addArr,ind){
                    addArr.value = "";
                    addArr.unitl = "";
                  })
                  result.data.dataList[index].data = addList;
                }else if(moreLength>thisListLength>0){
                  var arr1 = [];
                  var arr2 = [];
                  var addArry = [];
                  //遍历最长的一条数据，并取出所有索引值
                  maxLong.forEach(function(longArr,longIndex){
                    arr1.push(longIndex);
                    //遍历当前这条数据，并取出字段值和最长一条数据的相同的索引值
                    arr.data.forEach(function(minArr,minIndex){
                      if(longArr.parameterName == minArr.parameterName){
                        arr2.push(longIndex);
                      }
                    })
                    //对比上面两步取到的索引数组，取出不相同的索引值
                    function getArrDifference(arr1, arr2) {
                      return arr1.concat(arr2).filter(function(v, i, arrd) {
                          return arrd.indexOf(v) === arrd.lastIndexOf(v);
                      });
                    }
                    addArry = getArrDifference(arr1, arr2);
                  })
                  //将上一步记录的不相同索引遍历，并根据索引在对应的数据处填补字段值为空的数据
                  if(addArry.length>0){
                    addArry.forEach(function(listAdd,ids){
                      var dataNall = {parameterName:"",unitl:"",value:""};
                      result.data.dataList[index].data.splice(listAdd, 0, dataNall);
                    })
                  }
                }
              })
			        self.si_parameList = result.data.dataList;        //定义单设备列表参数数据集合
              self.si_parameHeadList = maxLong;            //定义单设备查询表头数据（这里的表头时变化的，所以以数组的形式动态生成）
              loading.close();  //请求操作完成后关闭loading
            }else{
              self.si_parameList = [];   //当获取的数据长度为0时，清空之前可能存在的数据
              self.alarmInquiry = [];  //关闭可能存在的分页
              loading.close();  //请求操作完成后关闭loading
            }
          }else{
            self.si_parameList = [];   //当获取数据失败时，清空之前可能存在的数据
            self.alarmInquiry = [];  //关闭可能存在的分页
            self.$message.error(erro.data.msg);
            loading.close();  //请求操作完成后关闭loading
          }
        }).catch(function(erro){
          loading.close();  //请求操作完成后关闭loading
          self.$message.error(erro.data.msg);
        })
      },

      //========================================参数最大值查询开始========================================
      getParameterMax:function(page){
        //这里的"19"表示的是雨量code值,当参数为雨量时表格的表头不一样,所以要更换表格头
        if(self.m_parameterValue == 19){self.headType == false}else{self.headType == true};
          var data = {imei:self.search_imei,startDate:self.a_startTime,endDate:self.a_endTime,page:page,pageSize:pageSize,code:self.m_parameterValue}
          var url = "/api/devicedata/getDeviceHistory";
          self.$http.post(url,data).then(function(result){
            console.log(result)
            if(result.data.flag){
              var Result = result.data.dataList;
              if(Result.length>0){
                if(self.m_parameterValue !== 19){
                  Result.forEach(function(arr,index){
                    arr.maxTime = arr.maxTime.substr(10,6);
                    arr.minTime = arr.minTime.substr(10,6);
                  })
                  self.maxValueData = Result;self.maxRainValueData = [];
                }else{
                  self.maxRainValueData = Result;self.maxValueData = [];
                }
                loading.close();  //请求操作完成后关闭loading
              }else{
                //当获取到的数据长度为0时，清空之前可能存在的数据
                self.maxValueData = [];self.maxRainValueData = [];
                self.alarmInquiry = [];  //关闭可能存在的分页
                loading.close();  //请求操作完成后关闭loading
              }
              self.deviceListDataReturn(result.data);    //分页处理函数
            }else{
              self.alarmInquiry = [];  //关闭可能存在的分页
              self.$message.error(result.data.msg);
              loading.close();  //请求操作完成后关闭loading
            }
          }).catch(function(erro){
            self.$message.error(erro.data.msg);
            loading.close();  //请求操作完成后关闭loading
        })
      },
      //========================================参数最大值查询结束========================================

      //========================================运行日志查询开始===================================
      //获取设备的运行日志/包含操作日志
      getDeviceLog:function(page){
        var data = {
          imei:self.search_imei,
          startDate:self.a_startTime,
          endDate:self.a_endTime,
          page:page,pageSize:pageSize,
          logcontent:self.searchWord,
          userKey:localStorage.getItem("userKey")
        }
        var url = "/api/runlog/getRunLogPage";
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            var Result = result.data.dataList;
            if(Result.length>0){
              self.runLogData = Result;
              loading.close();  //请求操作完成后关闭loading
            }else{
              //当获取到的数据长度为0时，清空之前可能存在的数据
              self.runLogData = [];
              self.alarmInquiry = [];  //关闭可能存在的分页
              loading.close();  //请求操作完成后关闭loading
            }
            self.deviceListDataReturn(result.data);    //分页处理函数
          }else{
            self.alarmInquiry = [];  //关闭可能存在的分页
            self.$message.error(result.data.msg);
            loading.close();  //请求操作完成后关闭loading
          }
        }).catch(function(erro){
          self.$message.error(erro.data.msg);
          loading.close();  //请求操作完成后关闭loading
        })
      },
      //========================================运行日志查询结束===================================

      //========================================公用的分页处理函数开始=====================================
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
        self.alarmInquiry = pageData;
      },
      //点击分页根据不同的情况选择合适的请求
      getPageData:function(page){self.a_selectPage = page;self.clickSearch(page);},
      //========================================公用的分页处理函数结束=====================================

      //=====================================公用的历史数据导出Execl函数开始================================
      //导出提醒
      exportExeclTip:function(){
        if(self.typeSelect !==1){
          if(self.search_imei == ""){self.$message({message:'请先选择设备',type: 'warning'});return false;}
        }
        if(self.a_startTime == ""){self.$message({message:'请先选择开始时间',type: 'warning'});return false;}
        if(self.a_endTime == ""){self.$message({message:'请先选择截至时间',type: 'warning'});return false;}
        if(self.typeSelect == 1 || self.typeSelect == 3){
          if(self.m_parameterValue == ""){self.$message({message:'请选择参数',type: 'warning'});return false;}
        }
        self.dialogFormVisible = true;
      },
      //Execl版本选择
      changeExecl:function(type){self.execlNum = type;},
      //开始请求并下载Execl
      exportExecl:function(){
        var start = self.a_startTime.substr(0,10);
        var end = self.a_endTime.substr(0,10);
        var city,county,river;
        if(self.cascaderValueRiver.length>0){
          city = self.cascaderValueRiver[0];county = self.cascaderValueRiver[1];river = self.cascaderValueRiver[2];
        }
        var url = ""
        switch(self.typeSelect){
          case 0:
              url = "/api/reportexport/peakAlarmExcel?imei="+self.search_imei+"&startDate="+self.a_startTime+"&endDate="+self.a_endTime+"&type="+self.execlNum;
              break;
          case 1:
              url = "/api/reportexport/peakRiverExcel?city="+city+"&county="+county+"&startDate="+self.a_startTime+"&endDate="+self.a_endTime+"&code="+self.m_parameterValue+"&codeName="+self.s_parameter+"&river="+river+"&type="+self.execlNum;
              break;
          case 2:
              url = "/api/reportexport/peakDeviceExcel?imei="+self.search_imei+"&startDate="+self.a_startTime+"&endDate="+self.a_endTime+"&type="+self.execlNum;
              break;
          case 3:
              url = "/api/reportexport/peakExcel?imei="+self.search_imei+"&code="+self.m_parameterValue+"&startDate="+start+"&endDate="+end+"&codeName="+self.s_parameter+"&type="+self.execlNum;
              break;
          case 4:
              url = "/api/reportexport/peakRunlogExcel?imei="+self.search_imei+"&logcontent="+self.searchWord+"&startDate="+start+"&endDate="+end+"&type="+self.execlNum;
              break;
          default:return false
        }
        self.dataExport(url);    //通用数据 Execl导出请求
      },
      //通用数据 Execl导出请求
      dataExport:function(url){
        var opt = {lock: true,text: 'Execl文件准备中...',spinner: 'el-icon-loading',customClass:'h_loadingClass',background: 'rgba(0, 0, 0, 0.5)',}
        self.dialogFormVisible = false;
        const loading = self.$loading(opt);
        setTimeout(function(){
          self.$http.get(url).then(function(result){
            console.log(result);
            if(result.data.flag == undefined){
              var fileName = "数据导出"
              var link = document.createElement("a");
              link.download = fileName;
              link.style.display = "none";
              link.href = self.$global.RequestUrl+url;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }else{
              self.$message({message: result.data.msg,type: 'warning'});
            }
            loading.close();
          }).catch(function(erro){
            self.dialogFormVisible = false;
            loading.close();
            self.$message({message: erro.data.msg,type: 'warning'});
          })
        },1000)
      }
      //=====================================公用的历史数据导出Execl函数结束================================
    }
  }
</script>

<style>

</style>
