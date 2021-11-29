<!-- 首页右侧部分 -->
<template>
  <div class="title-right"
    v-loading.fullscreen.lock="loadingRight"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.3)"
  >
      <div class="curve1">
        <div class="minTitle">
          <p>{{deviceName}}: 实时监控图(今日)</p>
          <img src="../../static/images/lin2.png" />
        </div>
          <div class="line-chart">
              <div class="lineChart">
                <div id="line" style="width:100%;height:100%;"></div>
                <div class="IRTip" v-if="lineChartData.length==0"><img style="width:200px;height:auto;" src="../../static/images/nodata.png"/></div>
              </div>
              <div class="rightCarou">
                <el-carousel trigger="click" :autoplay="false" height="80px">
                  <el-carousel-item v-for="(item,it_index) in parameterListData" :key="it_index">
                    <li class="parmLi" v-for="(lists,index) in item" v-bind:key="index"
                    @click="parameterClick(lists.imei,lists.codeName,lists.code,index,it_index)" :title="lists.codeName">
                    <img v-show="!lists.status" :src="lists.imgurlOve"/>
                    <img v-show="lists.status" :src="lists.imgurlOut"/>
                    </li>
                  </el-carousel-item>
                </el-carousel>
              </div>
          </div>
      </div>
      <div class="columnar1">
        <div class="minTitle">
          <p>{{deviceName}}: 历史数据</p>
          <img src="../../static/images/lin2.png" />
        </div>
        <div class="barChartBox">
          <div id="barChart" style="width:100%;height:100%;"></div>
          <div class="IRTip" v-if="barChartData.length==0"><img style="width:200px;height:auto;" src="../../static/images/nodata.png"/></div>
        </div>
      </div>
  </div>
</template>

<script>
  var self = "";
  var chartWs = null;    //定义折线图的实时请求
  var option = "";       // 定义折线图全局echarts对象
  var optionBar = "";    // 定义柱状图全局echarts对象
  var myChart = "";     // 定义折线图渲染对象
  var myBarChart = "";     //定义柱状图对象
  var interval = 0;      //定义时间轴间隔显示值
  var timeInt = "";      //定义实时折线图每个时间之间的间隔分钟值
  var lineArry = [];     //存储所有的折线图数据
  var requestStatus = true;   //用于定义设备参数数据请求是否完成
  export default{
    name: 'IndexRight',
    props:['heightWidth'],
    data () {
      return {
        loadingRight:false,   //loading显示
        screenWidth: document.body.clientWidth, // 获取浏览器窗口宽度
        screenHeight: document.body.clientHeight, // 获取浏览器窗口高度
        parameterListData:"",   //定义设备的参数数据
        parameter:'溶氧',        //定义当前选中的参数名
        deviceName:'',           //定义当前选中的设备名
        lineChartData:[],       //定义折线图的数据
        barChartData:[],        //定义柱状图数据
      }
    },
    watch: {
      heightWidth: function (val) {
        setTimeout(function () {
          if(myChart !== ""){myChart.resize();}
          if(myBarChart !== ""){myBarChart.resize();}
        }, 300)
      },
      //监听vuex中的存储的设备imei码是否变化
      '$store.state.deviceDate'(data){
        this.deviceName = data.deviceName;
        this.getDevicePara();  //获取设备所有的参数
      }
    },
    created() {
      self = this;
      self.getDevicePara();
    },
    methods:{
      //获取左侧所选中的设备的所有参数
      getDevicePara:function(){
        //判断折线图的实时通讯是否关闭，如果没有先关闭
        if(chartWs !== null){chartWs.close();chartWs=null;}
        var name = self.$store.state.deviceDate.deviceName;   //获取vuex中存储的deviceName
        var imei = self.$store.state.deviceDate.imei;    //获取vuex中存储的imei
        if(imei !== undefined && imei !== ""){
          self.deviceName = name;
          var url = "/api/device/getParameter";
          var data = {"imei":imei};
          self.loadingRight = true;  //开启loaduing
          self.$http.post(url,data).then(function(result){
            console.log(result)
            if(result.data.flag){
              if(result.data.rows.length>0){
                var parameterData = result.data.rows;
                var stat = {status:false};
                parameterData.forEach(function(res,index){
                  res.imgurlOut = self.$global.imgLocalhost+res.imgurlOut;
                  res.imgurlOve = self.$global.imgLocalhost+res.imgurlOve;
                  Object.assign(res,stat);   //重组数组
                })

                //将设备参数数据分组，每5条参数作为一组
                function split_array(arr, len){
                  var a_len = arr.length;
                  var result = [];
                  for(var i=0;i<a_len;i+=len){
                     result.push(arr.slice(i,i+len));
                  }
                  return result;
                }
                //开始设备参数数据分组，每5条参数作为一组
                var paraResult = split_array(parameterData, 5);
                self.parameterListData = paraResult;

                self.parameterListData[0][0].status = true;
                var imei = self.parameterListData[0][0].imei;
                var codeName = self.parameterListData[0][0].codeName;
                var code = self.parameterListData[0][0].code;
                self.parameter = codeName;
                self.getDeviceParameData(imei,codeName,code);   //绘制折线图
                self.getKlineChartData(imei,code,codeName);     //绘制柱状图
              }
              self.loadingRight = false;  //关闭loaduing
            }else{
              //清空折线图的所有数据 这里给lineChartData清空，开启界面上可能存在的无数据提示
              self.lineChartData = [];option = "";
              if(myChart !== ""){myChart.clear();}  //渲染数据

              //清空柱状图的所有数据  当没有历史数据时这里做清空操作，然后界面上会出现没有数据的提示
              self.barChartData=[]; optionBar = "";
              if(myBarChart !== ""){myBarChart.clear();}  //渲染数据
              if(result.data.msg = "设备还未上传参数指令！"){
                setTimeout(function(){
                  var statu = {index:1,sta:false};  //index是索引，sta是状态，已连接为true,反之为false
                  self.$store.dispatch('A_pageWebSocketStatu',statu);
                  console.log(self.$store.state.webSocketStatu);
                },3000)
              }
              self.$message.error(result.data.msg+"1");
              self.loadingRight = false;  //关闭loaduing
            }
          }).catch(function(erro){
            //清空折线图的所有数据 这里给lineChartData清空，开启界面上可能存在的无数据提示
            self.lineChartData = [];option = "";
            if(myChart !== ""){myChart.clear();}  //渲染数据

            //清空柱状图的所有数据  当没有历史数据时这里做清空操作，然后界面上会出现没有数据的提示
            self.barChartData=[]; optionBar = "";
            if(myBarChart !== ""){myBarChart.clear();}  //渲染数据
            self.$message.error(erro.data.msg+"2");
            self.loadingRight = false;  //关闭loaduing
          })
        }
      },

      //点击参数图标，获取对应的参数值
      parameterClick:function(imei,codeName,code,index,it_index){
        //这里的requestStatus用于判断上一次的请求是否完成，如果没有完成 点击新的参数图标将不允许继续下面的操作
        if(requestStatus){
          requestStatus = false;
          if(chartWs !== null){chartWs.close();chartWs=null;}    //关闭当前的webSocket
          self.parameter = codeName;
          self.parameterListData.forEach(function(data,arr){
             if(data.length>0){
               data.forEach(function(afterData,afterIndex){afterData.status = false;})
             }
          })
          self.parameterListData[it_index][index].status = true;   //修改当前选中的参数图标状态
          self.getDeviceParameData(imei,codeName,code);  //绘制折线图
          self.getKlineChartData(imei,code,codeName);    //绘制柱状图
        }
      },

      //根据选择的设备参数，获取该参数的所有值
      getDeviceParameData: function (imei,title,code) {
        var url = '/api/devicedata/getSensorData';
        var data = {'imei': imei, 'code': code, 'type': 1};
        self.$http.post(url, data).then(function (result) {
          console.log(result)
          if(result.data.flag){
            var socketData = imei + ':' + code;
            if(result.data.rows.length>0){
              var chartTime = [] // 定义折线图的时间
              var chartValues = [] // 定义折线图的数值
              var resultData = result.data.rows;
              lineArry.push(resultData);    //收集一条折线图数据
              for (let i = 0; i < resultData.length; i++) {
                var data1 = resultData[i].value
                var time = resultData[i].addTimeStr.substr(11, 5)
                chartTime.push(time)
                chartValues.push(data1)
              };
              chartTime = chartTime.reverse();     //时间顺序转换
              chartValues = chartValues.reverse();

              //过滤数据，检查数据是否存在断裂缺失，若存在，补缺，然后返回补缺后的新数据
              var recomData = self.recomFunc(chartTime,chartValues);
              chartTime = recomData[0];   //新的时间数据
              chartValues = recomData[1];  //新的折线值数据
              self.lineChartData = chartValues;       //这里给lineChartData赋值，关闭界面上可能存在的无数据提示
              self.drawBrokenLineDiagram(chartTime, chartValues, title);
              self.brokenLineWebSocket(socketData);
            }else{
              self.lineChartData = [];       //这里给lineChartData清空，开启界面上可能存在的无数据提示
              option = "";
              if(myChart !== ""){myChart.clear();} //渲染数据
              self.brokenLineWebSocket(socketData);
            }
          }else{
            self.lineChartData = [];       //这里给lineChartData清空，开启界面上可能存在的无数据提示
            option = "";
            if(myChart !== ""){myChart.clear();}  //渲染数据
          }
        }).catch(function (erro) {
          self.lineChartData = [];       //这里给lineChartData清空，开启界面上可能存在的无数据提示
          option = "";
          if(myChart !== ""){myChart.clear();}  //渲染数据
          console.log('请求失败3');
        })
      },

      //========================================折线图实时通讯请求开始=========================================
      // 实时通讯请求
      brokenLineWebSocket: function (data) {
        var url = self.$global.socketUrl+'/api/websocket';
        chartWs = new WebSocket(url); // 连接服务器
        chartWs.onopen = function(event){
          chartWs.send(data);
          var statu = {index:4,sta:true};  //index是索引，sta是状态，已连接为true,反之为false
          self.$store.dispatch('A_pageWebSocketStatu',statu);
        }
        chartWs.onmessage = function (event){self.webSocketReturnFn(event);}
        chartWs.onclose = function (event){var statu = {index:4,sta:false}; self.$store.dispatch('A_pageWebSocketStatu',statu);}
        chartWs.onerror = function (error) {var statu = {index:4,sta:false}; self.$store.dispatch('A_pageWebSocketStatu',statu);}
      },
      // 实时通讯返回函数
      webSocketReturnFn: function (results) {
        var strData = JSON.parse(results.data);
        let someDate = new Date();   // 把字符串类型专程Date类型
        var hour = someDate.getHours();
        if(hour<10){hour = "0"+hour};
        var mintes = someDate.getMinutes();
        if(mintes<10){mintes = "0"+mintes};
        let axisData = (hour + ':' + mintes);

        //数据填充，当获取实时数据时，中间发现间接性中断数据传输，此时得到新的数据时，
        //应该要对比新数据的时间，和上一条数据的时间差，差值大于设备心跳时间差时，应该在在缺失的部分补充空值null进行填充
        var leg = option.xAxis[0].data.length;
        if(leg>0){
          var t1 = self.timechange(option.xAxis[0].data[leg],axisData);
          var ddd = Math.floor(t1/timeInt);
          if(ddd>1){
            for(var m=0;m<ddd-1;m++){
              //每次循环都传入一个值，从而规律的得到当前时间的前面缺失时间
              var a = self.complementaryValue(option.xAxis[0].data[leg],timeInt);
              option.xAxis[0].data.push(a);
              option.series[0].data.push(null);
            }
          }
        }

        //重新定义X轴数据
        option.xAxis[0].data.push(axisData);
        //重新定义Y轴数据
        option.series[0].data.push(strData.value);
        //这里给lineChartData赋值，因为之前可能处于无数据提醒状态，赋值后关闭无数据提醒
        self.lineChartData = option.series[0].data;

        var timeLength = option.xAxis[0].data.length;     //获取当前x轴上的时间数据长度
        interval = Math.round(timeLength/6);
        if (interval > 1){interval = interval;}else{interval = 0;};
        option.xAxis[0].axisLabel.interval = interval;     //定义新的时间间隔数（默认时间轴上的数据无间隔显示，当数据特别多时采用间隔显示）
        myChart.setOption(option,true);    //渲染数据
      },
      //========================================折线图实时通讯请求结束=========================================

      //====================================过滤当前的折线图数据，如果数据断裂，用null补充 开始===================
      //针对每条折线数据进行 过滤数据，检查数据是否存在断裂缺失，若存在，补缺，然后返回补缺后的新数据
      recomFunc:function(chartTime,chartValues){
        var self = this;
        //筛选出每条时间数据之间的时间差，
        var c = [];
        for(var n=0;n<chartTime.length;n++){
          if(n>0){
            var ccc = self.timechange(chartTime[n-1],chartTime[n]);
            c.push(ccc);
          }
        }
        timeInt = findMost(c);   //获取时间间隔
        //过滤出重复出现次数最多的时间间隔数值
        function findMost(arr) {
            if (!arr.length) return
            if (arr.length === 1) return 1
            let res = {}
            let maxName, maxNum = 0
            // 遍历数组
            arr.forEach((item) => {
              res[item] ? res[item] += 1 : res[item] = 1
            })
            // 遍历 res
            for (let r in res) {
              if (res[r] > maxNum) {maxNum = res[r];maxName = r;}}
            return maxName;
        }
        //情况一：第一条数据不是从接近0点开始的（有尾无头）
        var start = "00:00";    //定义开始时间，默认开始时间是从0点开始的
        var time = new Date();
        var hh = time.getHours(),mm = time.getMinutes();
        var txt = hh+":"+mm;

        var t1 = self.timechange(start,chartTime[0]);
        if(t1>2*timeInt){
          var ddd = Math.floor(t1/timeInt);
          for(var m=0;m<ddd;m++){
            //每次循环都传入一个负值，从而规律的得到当前时间的前面缺失时间
            var a = self.complementaryValue(chartTime[0],"-"+timeInt);
            chartTime.unshift(a);
            chartValues.unshift(null);
          }
        }

        //情况二：从0点开始有数据，中途间接性没数据（有头有尾，但是中间部分数据间接性缺失）
        for(var yy=0;yy<chartTime.length;yy++){
          if(yy>0){
            var xxx = self.timechange(chartTime[yy-1],chartTime[yy]);
            var bbb = Math.floor(xxx/timeInt);
            if(bbb>2){
              var nTime = chartTime[yy-1];
              for(var m=0;m<bbb-1;m++){
                var aa = self.complementaryValue(nTime,timeInt)
                nTime = aa;
                chartTime.splice(yy+m, 0, aa)
                chartValues.splice(yy+m, 0, null)
              }
              yy = yy+bbb-1;
            }
          }
        }

        //情况三：从0点开始有数据，突然从某个时间之后一直没有数据（有头无尾）
        var ttt = self.timechange(chartTime[chartTime.length-1],txt);
        if(ttt>2*timeInt){
          var ddd = Math.floor(ttt/timeInt);
          for(var m=0;m<ddd;m++){
            var aaa = self.complementaryValue(chartTime[chartTime.length-1],timeInt)
            chartTime.push(aaa);
            chartValues.push(null);
          }
        }
        var fff = [chartTime,chartValues]
        return fff;
      },

      //补差值，得到新的时间
      complementaryValue:function(time,time2){
        var hour = time.split(':')[0];
        var min = time.split(':')[1];
        var s = Number(min)+ Number(time2);
        if(s>59){
          hour = Number(hour)+1;
          var sss = s-60;
          if(sss<10){min = "0"+sss;}else{min = sss;}
        }else if(s<0){
          hour = Number(hour)-1;
          var yy = 60+s;
          if(yy<10){min = "0"+yy;}else{min = yy;}
        }else{
            if(s<10){min = "0"+s;}else{min = s;}
        }
        return hour+":"+min;
      },

      //计算两段时间的时间差
      timechange:function(time,time2){
        if(time !== undefined && time2 !== undefined){
          var hour = time.split(':')[0];
          var min = time.split(':')[1];
          var hour2 = time2.split(':')[0];
          var min2 = time2.split(':')[1];
          var s = Number(hour * 60) + Number(min);
          var ss = Number(hour2 * 60) + Number(min2);
          return Math.round(ss-s);
        }
      },
      //====================================过滤当前的折线图数据，如果数据断裂，用null补充 结束===================

      //========================================开始绘制折线图===================================
      // 绘制折线图
      drawBrokenLineDiagram: function (chartTime, chartValues, deviceName) {
        var timeLength = chartTime.length;
        interval = Math.round(timeLength/6);
        if (interval > 1){interval = interval;}else{interval = 0;};
        // 基于准备好的dom，初始化echarts实例,有的话就获取已有echarts实例的DOM节点。
        myChart = self.$echarts.getInstanceByDom(document.getElementById('line'))
        if (myChart == null) { // 如果不存在，就进行初始化。
           myChart = self.$echarts.init(document.getElementById('line'));
        }
        // 定义绘制图表
        option = {
          title:{
            text:deviceName,
            left:'center',
            textStyle:{color:"#3dbfb7",fontSize:16,fontFamily:'pingfang-b'}
          },
          tooltip: {
            trigger: 'axis',
            formatter: function (params) {
              let someDate = new Date();
              let day2 = someDate.getFullYear() + '/' + (someDate.getMonth() + 1) + '/' + someDate.getDate() + ' ' + params[0].name;
              var res = '';
              if (params.length > 0) {
                params.forEach(function (result, index) {
                  res += '<br/> ' + result.seriesName + ' ' + ': ' + result.value;
                })
              }
              return day2 + res;
            }
          },
          toolbox: {
            show: false
          },
          dataZoom: [
              {
                  type: 'inside'
              }
          ],
          grid: {
            backgroundColor: 'rgba(0,0,0,0)',
            borderColor: 'rgba(0,0,0,0)',
            x: 20,y: 40,x2: 20,y2: 5,
            borderWidth: 1,
            show: true,
            containLabel: true
          },
          xAxis: [
            {
              type: 'category',
              boundaryGap: true,
              axisTick: {
                lineStyle: {
                  color: '#E0E0E3',
                  type: 'solid'
                },
                onGap: true
              },
              splitLine: {show: false}, // 隐藏网格线
              data: chartTime,
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
          yAxis: [
            {
              type: 'value',
              scale: true,
              boundaryGap: [0.01, 0.01],
              splitLine: {
                show: true,
                lineStyle: {
                  color :'#3190de',type :"dashed",opacity :0.3
                }
              },
              axisLabel: {
                textStyle: {
                  color: '#3190de',fontSize: 11,fontStyle: 'normal',cursor: 'default'
                }
              }
            }
          ],
          series: [
            {
              name: deviceName,
              type: 'line',
              data: chartValues,
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
                        offset: 0,color: "#dc3881" // 0% 处的颜色
                      }, {
                        offset: 0.7,color: "rgba(220,56,129,0.3)" // 100% 处的颜色
                       }],
                        globalCoord: false // 缺省为 false
                      }
                    }
              },
            }
          ]
        }
        myChart.setOption(option,true); // 渲染图表
      },
      //========================================结束绘制折线图===================================

      // =================================================绘制柱状图由此开始==================================================
      // 获取设备参数的历史数据
      getKlineChartData: function (imei,code,title) {
        var url = '/api/devicedata/getSensorData';
        var data = {'imei': imei, 'code': code, 'type': 3}; // 默认定义获取历史柱状图数据type类型为3  2/3/4:周/月/年
        self.$http.post(url, data).then(function (result) {
          console.log(result)
          self.barChartReturnData(result, title);
        }).catch(function (erro) {
          self.barChartData=[];        //当没有历史数据时这里做清空操作，然后界面上会出现没有数据的提示
          optionBar = "";
          if(myBarChart !== ""){myBarChart.clear();}  //渲染数据
          requestStatus = true;
          console.log('请求失败4');
        })
      },
      // 获取柱状图返回数据的处理函数
      barChartReturnData: function (result, title) {
        var barChartTime = [];
        var barChartValue = [];
        var Result = result.data.rows;
        if (result.data.flag){
          if (Result.length > 0) {
            for(var i=0;i<Result.length;i++){
              var time = Result[i].maxTime.substr(0, 10);
              var max = Result[i].maxValue;
              var min = Result[i].minValue;
              var average = (Number(max)+Number(min))/2
              average = average.toFixed(2);
              barChartValue.push(average);
              barChartTime.push(time);
            }
            self.barChartData=barChartValue;   //这里给barChartData赋值，当存在数据时关闭页面上的无数据提示
            self.drawingBarChart(barChartTime,barChartValue,title);
          }else{
            self.barChartData=[];        //当没有历史数据时这里做清空操作，然后界面上会出现没有数据的提示
            optionBar = "";
            if(myBarChart !== ""){myBarChart.clear();}  //渲染数据
            requestStatus = true;
          }
        }else{
          self.barChartData=[];        //当没有历史数据时这里做清空操作，然后界面上会出现没有数据的提示
          optionBar = "";
          if(myBarChart !== ""){myBarChart.clear();}  //渲染数据
        }
      },
      // 绘制柱状图
      drawingBarChart: function (barChartTime,barChartValue,title) {
        //有的话就获取已有echarts实例的DOM节点。
        myBarChart = self.$echarts.getInstanceByDom(document.getElementById('barChart'));
        if (myBarChart == null) { // 如果不存在，就进行初始化。
           myBarChart = self.$echarts.init(document.getElementById('barChart'));
        }
        var dataAxis = barChartTime;
        var data = barChartValue;
        var timeLength = dataAxis.length;
        var interval = Math.round(timeLength/6);

        if (interval > 1){interval = interval;}else{interval = 1;};
        optionBar = {
          title:{
            text:title,
            left:'center',
            textStyle:{color:"#3dbfb7",fontSize:16,fontFamily:'pingfang-b'}
          },
          tooltip:{
            trigger:'axis',
            formatter: function (params) {
                let day2 = params[0].name;
                var res = '';
                if (params.length > 0) {
                  params.forEach(function (result, index) {
                    res += '<br/> ' + "结果：" + result.value;
                  })
                }
                return day2 + res;
              }
           },
            xAxis: {
                data: dataAxis,
                nameLocation:"center",
                axisLabel: {
                    interval:interval,
                    margin: 8,
                    textStyle: {
                        color: '#3190de',cursor: 'default',fontSize: 11,fontStyle: 'normal',fill: '#E0E0E3'
                    }
                },
                axisTick: {
                    show: true,
                    lineStyle:{
                      color:"#ffffff",
                      width:1
                    }

                },
                axisLine: {
                    show: true,
                    lineStyle:{
                      color:"#E0E0E3",
                      width:1
                    }
                },
                z: 10
            },
            grid: {
              backgroundColor: 'rgba(0,0,0,0)',
              borderColor: 'rgba(0,0,0,0)',
              x: 20,y: 40,x2: 20,y2: 0,
              borderWidth: 1,
              show: true,
              containLabel: true
            },
            yAxis: {
                axisLine: {
                    show: true,
                    lineStyle:{
                      color:"#E0E0E3",
                      width:1
                    }
                },
                axisTick: {
                    show: true,
                    lineStyle:{
                      color:"#ffffff",
                      width:1
                    }
                },
                axisLabel: {
                    textStyle: {
                        color: '#999'
                    }
                }
            },
            dataZoom: [
                {
                    type: 'inside'
                }
            ],
            series: [
                {
                    type: 'bar',
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(
                            0, 0, 0, 1,
                            [
                                {offset: 0, color: '#83bff6'},
                                {offset: 0.5, color: '#188df0'},
                                {offset: 1, color: '#188df0'}
                            ]
                        )
                    },
                    emphasis: {
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(
                                0, 0, 0, 1,
                                [
                                    {offset: 0, color: '#2378f7'},
                                    {offset: 0.7, color: '#2378f7'},
                                    {offset: 1, color: '#83bff6'}
                                ]
                            )
                        }
                    },
                    data: data
                }
            ]
        };

        // Enable data zoom when user click bar.
        var zoomSize = 6;
        myBarChart.on('click', function (params) {
            console.log(dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)]);
            myBarChart.dispatchAction({
                type: 'dataZoom',
                startValue: dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)],
                endValue: dataAxis[Math.min(params.dataIndex + zoomSize / 2, data.length - 1)]
            });
        });
        if (optionBar && typeof optionBar === "object") {
            myBarChart.setOption(optionBar,true); // 渲染图表
        }
        requestStatus = true;
      },
      // =================================================绘制柱状由此结束==================================================
    },
    beforeDestroy() {
      //关闭webSocket
      if(chartWs !== null){chartWs.close();}
    }
  }
</script>

<style>

</style>
