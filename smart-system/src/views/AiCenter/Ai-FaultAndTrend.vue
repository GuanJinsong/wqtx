<!-- Ai大数据/故障平均响应时间与趋势 -->
<template>
  <div class="ai_FaParent">
    <div id="area-stack"></div>
  </div>
</template>

<script>
  var areaStackChart = null;
  var areaStackOption = "";
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
          if(areaStackChart !== ""){areaStackChart.resize();}
        }, 300)
      },
    },
    mounted() {
      this.drawAreaBasicChart();
    },
    methods:{
      drawAreaBasicChart:function(){
        // 基于准备好的dom，初始化echarts实例,有的话就获取已有echarts实例的DOM节点。
        areaStackChart = echarts.getInstanceByDom(document.getElementById('area-stack'))
        if (areaStackChart == null) { // 如果不存在，就进行初始化。
           areaStackChart = echarts.init(document.getElementById('area-stack'));
        }

        areaStackOption = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#6a7985'
                    }
                }
            },
            legend: {
                data: ['邮件营销', '联盟广告', '视频广告', '直接访问', '搜索引擎'],
                textStyle:{color:'#fff',},
            },
            dataZoom: [{type: 'inside'}],
            toolbox: {
                feature: {
                    saveAsImage: {}
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    boundaryGap: false,
                    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    splitLine: {
                            show: true,
                            lineStyle:{
                               color: ['#315070'],
                               width: 1,
                               type: 'solid'
                          }
                    　　}
                }
            ],
            series: [
                {
                    name: '邮件营销',
                    type: 'line',
                    stack: '总量',
                    areaStyle: {},
                    emphasis: {focus: 'series'},
                    itemStyle: {
                      normal: {lineStyle: {width:1}}
                    },
                    data: [120, 132, 101, 134, 90, 230, 210]
                },
                {
                    name: '联盟广告',
                    type: 'line',
                    stack: '总量',
                    areaStyle: {},
                    emphasis: {focus: 'series'},
                    itemStyle: {
                      normal: {lineStyle: {width:1}}
                    },
                    data: [220, 182, 191, 234, 290, 330, 310]
                },
                {
                    name: '视频广告',
                    type: 'line',
                    stack: '总量',
                    areaStyle: {},
                    emphasis: {focus: 'series'},
                    itemStyle: {
                      normal: {lineStyle: {width:1}}
                    },
                    data: [150, 232, 201, 154, 190, 330, 410]
                },
                {
                    name: '直接访问',
                    type: 'line',
                    stack: '总量',
                    areaStyle: {},
                    emphasis: {focus: 'series'},
                    itemStyle: {
                      normal: {lineStyle: {width:1}}
                    },
                    data: [320, 332, 301, 334, 390, 330, 320]
                },
                {
                    name: '搜索引擎',
                    type: 'line',
                    stack: '总量',
                    label: {
                        show: true,
                        position: 'top'
                    },
                    areaStyle: {},
                    emphasis: {focus: 'series'},
                    itemStyle: {
                      normal: {lineStyle: {width:1}}
                    },
                    data: [820, 932, 901, 934, 1290, 1330, 1320]
                }
            ]
        };

        areaStackOption && areaStackChart.setOption(areaStackOption);
      }
    }
  }
</script>

<style>
  .ai_FaParent{padding:10px 10px 10px 10px;width:100%;height:100%;}
  #area-stack{width:100%;height:100%;}
</style>
