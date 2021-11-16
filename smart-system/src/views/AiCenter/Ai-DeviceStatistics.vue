<!-- Ai大数据/设备总览 -->
<template>
  <div class="ai_dsBox">
    <div class="ai_areaSelect">
      <div class="editMM1" style="width:140px;">
        <el-select v-model="areaType" placeholder="监区选择">
          <el-option v-for="item in optionsArea" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </div>
    </div>
    <div class="ai_DeviceStat">
      <div class="ai_DevLeft" id="pie-borderRadius"></div>
      <ul class="ai_Devright">
        <li><p><i>116</i></p><span>运行设备</span></li>
        <li><p><i>116</i></p><span>离线设备</span></li>
        <li><p><i>116</i></p><span>故障设备</span></li>
      </ul>
    </div>
  </div>
</template>

<script>
  var pieRadiusChart = null;  //定义设备总览的pie图对象
  var pieRadiusOption = "";  //定义设备总览的pie图数据
  export default{
    name:"Ai-DeviceStatistics",
    props:['heightWidth'],
    data(){
      return{
        areaType:"",   //监区选中值
        optionsArea:[{value: '选项1',label: '黄金糕'}, {value: '选项2',label: '双皮奶'}],
      }
    },
    created() {
    },
    watch: {
      heightWidth: function (val) {
        setTimeout(function () {
          if(pieRadiusChart !== ""){pieRadiusChart.resize();}
        }, 300)
      },
    },
    mounted() {
      this.drawPieRadiusChart();
    },
    methods:{
      //绘制圆角形pie图
      drawPieRadiusChart:function(){
        // 基于准备好的dom，初始化echarts实例,有的话就获取已有echarts实例的DOM节点。
        pieRadiusChart = echarts.getInstanceByDom(document.getElementById('pie-borderRadius'))
        if (pieRadiusChart == null) { // 如果不存在，就进行初始化。
           pieRadiusChart = echarts.init(document.getElementById('pie-borderRadius'));
        }

        pieRadiusOption = {
          tooltip: {
              trigger: 'item'
          },
          series: [
              {
                  name: '设备总览',
                  type: 'pie',
                  radius: [0, '30%'],
                  selectedMode: 'single',
                  avoidLabelOverlap: false,
                  label: {
                      show: true,
                      position: 'inner'
                  },
                  emphasis: {
                      label: {
                          show: true,
                          fontSize: '20',
                          fontWeight: 'bold'
                      }
                  },
                  labelLine: {
                      show: false
                  },
                  data: [
                      {
                        value:100,
                        name: "总设备\n"+100,
                        label:{
                          position:'center',
                          align:"center",
                          verticalAlign:"middle",
                          color:"#fff",
                          fontSize: 16,
                          fontFamily:'pingfang-b'
                        },
                      }
                  ]
              },
              {
                  name: '设备类型占比',
                  type: 'pie',
                  radius: ['40%', '70%'],
                  avoidLabelOverlap: false,
                  label: {
                      show: false,
                      position: 'center'
                  },
                  labelLine: {
                      show: false
                  },
                  data: [
                      {value: 1048, name: '搜索引擎'},
                      {value: 735, name: '直接访问'},
                      {value: 580, name: '邮件营销'},
                      {value: 484, name: '联盟广告'},
                      {value: 300, name: '视频广告'}
                  ]
              }
          ]
        };

        pieRadiusOption && pieRadiusChart.setOption(pieRadiusOption);
      }
    }
  }
</script>

<style>
  @import url("../../../static/css/AiCenter/Ai-DeviceStatistics.css");
</style>
