<!-- Ai大数据/能耗监测 -->
<template>
  <div class="ai_ecParent">
    <ul class="ai_ecParentAfter">
      <li><div class="ai_ecTitle"><h6>实时功率</h6></div><div class="ai_ecValue"><p>100 <sub>W</sub></p></div></li>
      <li><div class="ai_ecTitle"><h6>当日总耗能</h6></div><div class="ai_ecValue"><p>100 <sub>Kwh</sub></p></div></li>
    </ul>
    <div class="ai_ecChart">
      <div class="editMM1 ai_ecChartSelect" style="width:80px;">
        <el-select v-model="timeType" placeholder="请选择">
          <el-option v-for="item in optionsTime" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </div>
      <div id="area-basic"></div>
    </div>
  </div>
</template>

<script>
  var areaBasicChart = null;
  var areaBasicOption = "";
  export default{
    name:"Ai-EnergyConsump",
    props:['heightWidth'],
    data(){
      return{
        timeType:"",   //监区选中值
        optionsTime:[{value: '选项1',label: '黄金糕'}, {value: '选项2',label: '双皮奶'}],
      }
    },
    created() {
    },
    watch: {
      heightWidth: function (val) {
        setTimeout(function () {
          if(areaBasicChart !== ""){areaBasicChart.resize();}
        }, 300)
      },
    },
    mounted() {
      this.drawAreaBasicChart();
    },
    methods:{
      drawAreaBasicChart:function(){
        // 基于准备好的dom，初始化echarts实例,有的话就获取已有echarts实例的DOM节点。
        areaBasicChart = echarts.getInstanceByDom(document.getElementById('area-basic'))
        if (areaBasicChart == null) { // 如果不存在，就进行初始化。
           areaBasicChart = echarts.init(document.getElementById('area-basic'));
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
          xAxis: {
              type: 'category',
              boundaryGap: false,
              data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          },
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
              data: [820, 932, 901, 934, 1290, 1330, 1320],
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
      }
    }
  }
</script>

<style>
  @import url("../../../static/css/AiCenter/Ai-EnergyConsump.css");
</style>
