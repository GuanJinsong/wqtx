<!-- Ai大数据/故障类型 -->
<template>
  <div class="ai_frBox">
    <div class="ai_frBoxAfter" id="pie-roseType-simple"></div>
  </div>
</template>

<script>
  var pieRoseTypeChart = null;
  var pieRoseTypeOption = "";
  export default{
    name:"Ai-FaultRate",
    props:['heightWidth'],
    data(){
      return{

      }
    },
    created() {
    },
    watch: {
      heightWidth: function (val) {
        setTimeout(function () {
          if(pieRoseTypeChart !== ""){pieRoseTypeChart.resize();}
        }, 300)
      },
    },
    mounted() {
      this.drawPieRoseTypeChart();
    },
    methods:{
      drawPieRoseTypeChart:function(){
         // 基于准备好的dom，初始化echarts实例,有的话就获取已有echarts实例的DOM节点。
         pieRoseTypeChart = echarts.getInstanceByDom(document.getElementById('pie-roseType-simple'))
         if (pieRoseTypeChart == null) { // 如果不存在，就进行初始化。
            pieRoseTypeChart = echarts.init(document.getElementById('pie-roseType-simple'));
         }

         pieRoseTypeOption = {
           tooltip: {
               trigger: 'item'
           },
           left:5,
           top:5,
           right:5,
           bottom:5,
           legend: {
                x:'right',
                y:'top',
                textStyle:{color:'#fff',},
                padding:[0,20,0,0],
           },
           toolbox: {
               show: true,
               feature: {
                   mark: {show: true},
                   dataView: {show: true, readOnly: false},
                   restore: {show: true},
                   saveAsImage: {show: true}
               }
           },
           series: [
               {
                   name: '面积模式',
                   type: 'pie',
                   radius: ['20%', '90%'],
                   center: ['40%', '50%'],
                   roseType: 'area',
                   itemStyle: {
                       borderRadius: 8
                   },
                   data: [
                       {value: 40, name: 'rose 1'},
                       {value: 38, name: 'rose 2'},
                       {value: 32, name: 'rose 3'},
                       {value: 30, name: 'rose 4'},
                       {value: 28, name: 'rose 5'},
                       {value: 26, name: 'rose 6'},
                       {value: 22, name: 'rose 7'},
                       {value: 18, name: 'rose 8'}
                   ]
               }
           ]
         };

         pieRoseTypeOption && pieRoseTypeChart.setOption(pieRoseTypeOption);
       }
    }
  }
</script>

<style>
  @import url("../../../static/css/AiCenter/Ai-FaultRate.css");
</style>
