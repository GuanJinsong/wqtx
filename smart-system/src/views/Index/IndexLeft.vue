<template>
  <div class="indexLeftBox">
    <div class="ind_lefone">
      <img class="ind_lin1" src="../../../static/images/line1.png"/>
      <ul class="ind_lefRegion" style="overflow-y:auto;">
        <li v-for="(list,index) in areaList" v-bind:class="selectArea ==index?'indSlelctNav':''"
        @click="selectAreaList(list,index)"
        :key="index"
        >{{list.prisonDistrictName}}</li>
      </ul>
    </div>
    <div class="ind_leftow">
      <img class="ind_lin2" src="../../../static/images/line1.png"/>
      <div class="ind_lefChart">
         <div class="Ind_leftSelectput ind_editSelect">
           <el-select v-model="value" @change="getEmperatureHumidity" placeholder="任务名称">
             <el-option v-for="item in options"
               :key="item.prisonId" :label="item.prisonName"
               :value="item.prisonId">
             </el-option>
           </el-select>
         </div>
         <div class="lineChartParent">
           <div id="gaugeChart" style="width:100%;height:100%;"></div>
         </div>
         <div class="lineChartParent">
           <div class="noData" v-show="y_LineChart.length == 0"><img src="../../../static/images/n_data.png"/></div>
           <div id="lineChart" v-show="y_LineChart.length > 0" style="width:100%;height:100%;"></div>
         </div>
      </div>
    </div>
  </div>
</template>

<script>
  var interval = 0;      //定义时间轴间隔显示值
  var myChart = null;
  var option = "";
  var gaugeChart = null;
  var gaugeOption = "";
  var setInter = null;
  var opt = {
		lock: true,text: '加载中...',spinner: 'el-icon-loading',
		customClass:'loadingClass', background: 'rgba(0, 0, 0, 0.5)',
	}
  var loading ="";
  export default {
    name: 'IndexLeft',
    data () {
      return {
        selectArea:0,   //当前选中的监区
        areaId:'',  //被选中的监区id
        heightWidth: '',
        options:[],
        value:'',
        areaList:[],   //定义所有的监区
        x_LineChart:[],  //定义折线图x轴数据
        y_LineChart:[],  //定义折线图y轴数据
      }
    },
    created() {
      this.windowOnresize();
      this.getAllArea(); //获取所有的监区
    },
    watch: {
      heightWidth: function (val) {
        setTimeout(function () {
          if(myChart !== ""){myChart.resize();}
          if(gaugeChart !== ""){gaugeChart.resize();}
        }, 300)
      },
    },
    mounted() {
      let [chartTime,chartValues] = [[],[]];
      this.drawingLineChart(chartTime,chartValues);
      this.drawingGaugeChart(0,0);
      //接收邻居组件 IndexRight传过来的数据
      this.$eventBus.$on("alarmRoomState",this.alarmRoomStates);
    },
    methods:{
      alarmRoomStates:function(){
        this.getAreaAfterPrison(this.areaId); //重新获取监区下的监室列表
      },
      //点击监区列表获取对应的信息
      selectAreaList:function(rest,index){
         if(setInter !== null){clearInterval(setInter); setInter=null;}
         this.selectArea = index;   //当前选中的监区
         this.areaId = rest.prisonDistrictId;  //被选中的监区id
         let dat = {name:rest.prisonDistrictName,prisonType:rest.prisonDistrictType}
         this.$eventBus.$emit('sendAreaName',dat);  //向邻居组件IndexCenter传递数据
         this.getAreaAfterPrison(rest.prisonDistrictId);
      },
      //获取所有的监区
      getAllArea:function(){
        let self = this;
        let [url,data] = ['/sup/prisonDistrict/query',''];
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.areaList = result.data.data;
            if(result.data.data.length>0){
              let a_id = result.data.data[0].prisonDistrictId;
              let dat = {name:result.data.data[0].prisonDistrictName,prisonType:result.data.data[0].prisonDistrictType}
              self.$eventBus.$emit('sendAreaName',dat);  //向邻居组件IndexCenter传递数据
              self.areaId = a_id; self.getAreaAfterPrison(a_id);
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
          loading.close();
          console.log(result)
          if(result.data.flag){
            self.options = result.data.data;
            self.$eventBus.$emit('sendAreaData',result.data.data);  //向邻居组件IndexCenter传递数据
            if(result.data.data.length>0){
              self.getHistoricalElectricity(result.data.data[0].prisonId);
              self.value = result.data.data[0].prisonId;
              if(setInter == null){self.prisonSetTimeInter();}  //启动定时请求轮播
            }else{
              // 当获取到的监区下监室列表为0时，清除之前肯能存在的定时器
              if(setInter !==null){clearInterval(setInter);setInter=null}
              // 如果监区下没有监室，应该清除下部分图表数据
              // 清除已选中的监室
              self.value = ''
              // 表盘图重绘
              self.drawingGaugeChart(0, 0)
              // 折线图以该数据的长度用v-show指令来控制
              self.y_LineChart = []
            }
          }else{
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
          loading.close();
          self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      //轮播显示当前的监区下的监室信息，监室名称
      prisonSetTimeInter:function(){
        let self = this;
        let [ind,index] = [self.options.length,0];
        if(ind>0){
        setInter = setInterval(function(){
            let prisonId = self.options[index].prisonId;
            self.value = prisonId;
            self.getHistoricalElectricity(prisonId);
            index = index+1
            if(index >= ind){index=0}
          },15000)
        }
      },
      //获取历史电量数据
      getHistoricalElectricity:function(prisonId){
        let self = this;
        let [url,data] = ['/sup/electricityConsumptionInfo/queryEC',{prisonId:prisonId}];
        self.$http.post(url,data).then(function(result){
          if(result.data.flag){
            let [list,x_data,y_data] = [result.data.data,[],[]];
            if(list.length>0){
              for(let i=0;i<list.length;i++){
                x_data.push(list[i].days);
                y_data.push(list[i].electricityConsumption/1000)
              }
              self.x_LineChart=x_data;self.y_LineChart=y_data;
              self.drawingLineChart(x_data,y_data);
            }else{
              self.x_LineChart=[];self.y_LineChart=[];
              self.drawingLineChart(x_data,y_data);
            }
          }else{
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
          self.$message.error(erro.data.msg);
          console.log(erro)
        })
        this.getEmperatureHumidity(prisonId);   //获取温度与湿度所需要的数据
      },
      //获取温度与湿度所需要的数据
      getEmperatureHumidity:function(prisonId){
        let self = this;
        let [url,data] = ['/sup/prison/queryTemper',{prisonId:prisonId}];
        self.$http.post(url,data).then(function(result){
          if(result.data.flag){
            if(result.data.data !== null){
              let temp = result.data.data.temperature/100;   //温度
              let humid = result.data.data.humidity/100;   //湿度
              self.drawingGaugeChart(humid,temp);
            }else{
              self.drawingGaugeChart(0,0);
            }
          }else{
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
          self.$message.error(erro.data.msg);
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
      //绘制仪表盘图
      drawingGaugeChart:function(leftData,rightData){
        // 基于准备好的dom，初始化echarts实例,有的话就获取已有echarts实例的DOM节点。
        gaugeChart = echarts.getInstanceByDom(document.getElementById('gaugeChart'))
        if (gaugeChart == null) { // 如果不存在，就进行初始化。
           gaugeChart = echarts.init(document.getElementById('gaugeChart'));
        }
        gaugeOption = {
            title:{
              text:"实时湿度/温度",
              left:'center',
              textStyle:{color:"#3dbfb7",fontSize:16,fontFamily:'pingfang-b'}
            },
            series: [
              // left
              {
                    name:"gauge1",
                    type: 'gauge',
                    z:5,
                    center: ["35%", "65%"],  //仪表盘中心点
                    radius:"60%",  //仪表盘半径
                    startAngle: 200,
                    endAngle: -20,
                    min: 0,
                    max: 90,
                    splitNumber: 6,
                    itemStyle: {
                        color: '#08ccda'
                    },
                    progress: {
                        show: true,
                        width: 15
                    },

                    pointer: {
                        show: false,
                    },
                    axisLine: {
                        lineStyle: {
                           width:15,
                           opacity:0.1  //仪表盘的透明度
                        }
                    },
                    axisTick: {
                        distance: -25,
                        splitNumber: 5,
                        lineStyle: {
                            width: 1,
                            color: '#999'
                        }
                    },
                    splitLine: {
                        distance: -32,
                        length: 5,
                        lineStyle: {
                            width: 2,
                            color: 'rgba(128, 128, 128, 0.5)'
                        }
                    },
                    axisLabel: {
                        distance: -5,
                        length:2,
                        color: '#454861',
                        fontSize: 12
                    },
                    anchor: {
                        show: false
                    },
                    title: {
                        show: false
                    },
                    detail: {
                        valueAnimation: true,
                        width: '60%',
                        height: '15%',
                        borderRadius: 8,
                        offsetCenter: [0, '-35%'],
                        formatter:'{a|{value}}\n{b|%} ',
                        color: 'auto',
                        rich: {
                          a: {
                              fontSize: 20,
                              lineHeight:40,
                              fontWeight: 'bolder',
                              align: 'center',
                              padding: [0, 5, 0, 0]
                          },
                          b: {
                              fontSize: 14,
                              lineHeight:20,
                              align: 'center',
                              padding: [0, 0, 20, 0]
                          }
                      }
                    },
                    data: [{
                        value: leftData
                    }]
                },
                {
                    name:"gauge2",
                    type: 'gauge',
                    z:5,
                    center: ["35%", "65%"],
                    radius:"60%",
                    startAngle: 200,
                    endAngle: -20,
                    min: 0,
                    max: 90,
                    itemStyle: {
                        color: '#08ccda',
                    },
                    progress: {
                        show: true,
                        width: 8
                    },

                    pointer: {
                        show: false
                    },
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        show: false
                    },
                    axisLabel: {
                        show: false
                    },
                    detail: {
                        show: false
                    },
                    data: [{
                        value:leftData,
                    }]
                },
                // right
                {
                      name:"gauge3",
                      type: 'gauge',
                      center: ["70%", "60%"],  //仪表盘中心点
                      radius:"50%",  //仪表盘半径
                      startAngle: 120,
                      endAngle: -40,
                      min: 0,
                      max: 60,
                      splitNumber: 4,
                      itemStyle: {
                          color: '#ea6a43'
                      },
                      progress: {
                          show: true,
                          width: 15
                      },

                      pointer: {
                          show: false,
                      },
                      axisLine: {
                          lineStyle: {
                              width: 15,
                              opacity:0.1
                          }
                      },
                      axisTick: {
                          distance: -25,
                          splitNumber: 5,
                          lineStyle: {
                              width: 1,
                              color: '#999'
                          }
                      },
                      splitLine: {
                          distance: -32,
                          length: 5,
                          lineStyle: {
                              width: 2,
                              color: 'rgba(128, 128, 128, 0.5)'
                          }
                      },
                      axisLabel: {
                          distance: -5,
                          color: '#454861',
                          fontSize: 12
                      },
                      anchor: {
                          show: false
                      },
                      title: {
                          show: false
                      },
                      detail: {
                          valueAnimation: true,
                          width: '60%',
                          height: '15%',
                          borderRadius: 8,
                          fontSize: 12,
                          lineHeight:20,
                          offsetCenter: ['30%', '-10%'],
                          formatter: '{value} °C',
                          color: 'auto'
                      },
                      data: [{
                          value:rightData
                      }]
                  },
                  {
                      name:"gauge4",
                      type: 'gauge',
                      center: ["70%", "60%"],
                      radius:"50%",
                      startAngle: 120,
                      endAngle: -40,
                      min: 30,
                      max: 60,
                      itemStyle: {
                          color: '#ea6a43',
                      },
                      progress: {
                          show: true,
                          width: 8
                      },

                      pointer: {
                          show: false
                      },
                      axisLine: {
                          show: false
                      },
                      axisTick: {
                          show: false
                      },
                      splitLine: {
                          show: false
                      },
                      axisLabel: {
                          show: false
                      },
                      detail: {
                          show: false
                      },
                      data: [{
                          value:rightData,
                      }]
                  },

            ],
        };
        gaugeChart.setOption(gaugeOption,true); // 渲染图表
      },

      //==========================================折线图相关开始===========================================
      //绘制折线图
      drawingLineChart:function(chartTime, chartValues){
        let timeLength = chartTime.length;
        interval = Math.round(timeLength/4);
        if (interval > 1){interval = interval;}else{interval = 0;};
        // 基于准备好的dom，初始化echarts实例,有的话就获取已有echarts实例的DOM节点。
        myChart = echarts.getInstanceByDom(document.getElementById('lineChart'))
        if (myChart == null) { // 如果不存在，就进行初始化。
           myChart = echarts.init(document.getElementById('lineChart'));
        }
        // 定义绘制图表
        option = {
          title:{
            text:"历史功耗(Kwh)",
            left:'center',
            textStyle:{color:"#3dbfb7",fontSize:16,fontFamily:'pingfang-b'}
          },
          tooltip: {
            trigger: 'axis',
            formatter: function (params) {
              let someDate = new Date();
              let day2 = "时间："+ ' ' + params[0].name;
              let res = '';
              if (params.length > 0) {
                params.forEach(function (result, index) {
                  res += '<br/> ' + result.seriesName + ' ' + result.value;
                })
              }
              return day2 + res;
            }
          },
          toolbox: {
            show: false
          },
          dataZoom: [{type: 'inside'}],
          grid: {
            backgroundColor: 'rgba(0,0,0,0)',
            borderColor: 'rgba(0,0,0,0)',
            x: 10,y: 30,x2: 10,y2: 5,
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
              name:'功耗值：',
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
        this.$nextTick(() => {
          myChart.setOption(option, true)
          myChart.resize()
        })
      }
    },
    beforeDestroy() {
      clearInterval(setInter); setInter=null;
      this.$eventBus.$off('alarmRoomState');  //关闭兄弟组件之间传递信息时$on会多次触发的问题
    }
  }
</script>

<style>
  @import url("../../../static/css/Index/IndexLeft.css");
</style>
