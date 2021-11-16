<template>
  <div class="Ind_CnParent">
    <!-- 监区地形图 -->
    <div class="ind_CnType1">
      <div class="ind_editMM">
         <span></span><i>设备正常</i> <span></span><i>设备掉线</i> <span></span><i>设备报警</i>
      </div>
      <prisonPlan :type="prisonType" :list="prisonData" @toRoom="goingRoom"></prisonPlan>
    </div>
  </div>
</template>

<script>
  import prisonPlan from '../../components/publicComponemts/prisonPlan.vue'
  export default {
    name: 'IndexCenter',
    components:{prisonPlan},
    data () {
      return {
        prisonName: '',
        prisonType: 1,
        prisonData: []
      }
    },
    created() {
    },
    mounted() {
      //接收邻居组件 IndexLeft传过来的数据
      this.$eventBus.$on("sendAreaName",this.sendAreaNames);
      this.$eventBus.$on("sendAreaData",this.sendAreaDatas);
    },
    methods:{
      //接收父组件传过来的监区名称
      sendAreaNames:function(data){
        this.prisonName = data.name   //监区名称
        this.prisonType = data.prisonType   //监区类型（不同的类型使用不同的地图）1看守所 2拘留所1楼 3拘留所2楼
      },
      //接收邻居组件IndexLeft传过来的监区监室列表
      sendAreaDatas:function(res){
        this.prisonData = res
      },
      goingRoom:function(data){
        if(!data.id){this.$message({message:'当前监室不存在，请选择其他监室',type:'warning'}); return false;}
        
        this.$router.push({
          path:'/components/RoomInformation/RoomInformation',
          name: 'RoomInformation',
          query: {
            name:this.prisonName,
            prisonId:data.id
          }
        });
      }
    },
    beforeDestroy() {
      this.$eventBus.$off('sendAreaName');  //关闭兄弟组件之间传递信息时$on会多次触发的问题
      this.$eventBus.$off('sendAreaData');  //关闭兄弟组件之间传递信息时$on会多次触发的问题
    }
  }
</script>

<style>
  @import url("../../../static/css/Index/IndexCenter.css");
</style>
