<template>
  <div class="defaultName">
    <section class="indexParent">
      <div class="ind_left">
        <IndexLeft/>
      </div>
      <div class="ind_center verticalScroll">
        <IndexCenter/>
      </div>
      <div class="ind_right" v-bind:class="pulseIndex == true?'boxopen':'boxclose'">
        <div class="ind_rightAfter">
          <p class="indAlarmListBtn" @click="openOrLeft()"><i>告警列表</i><span>{{alarm_num}}</span></p>
          <IndexRight v-on:alarmLength="updateAlarm"/>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
  import IndexLeft from "./IndexLeft.vue"
  import IndexCenter from "./IndexCenter.vue"
  import IndexRight from "./IndexRight.vue"
  export default {
    name: 'Index',
    components:{IndexLeft,IndexCenter,IndexRight},
    data () {
      return {
        pulseIndex:true,           //定义报警详细栏的开启与关闭
		    alarm_num:0,
      }
    },
    created() {
      //headerChange: 是父组件App.vue指定的传数据绑定的函数，parentData:子组件给父组件App.vue传递的数据
      var parentData = {header:true,nav:0};
      this.$emit('headerChange',parentData);
      localStorage.setItem("headState", JSON.stringify(parentData));  //存储当前的header信息
      this.getAllRoom();  //获取所有的监室
    },
    mounted() {
      //接收子组件 indexRight传过来的数据
      this.$eventBus.$on("alarmLength",this.updateAlarm);
    },
    methods:{
	    updateAlarm:function(data){
        if(data>99){this.alarm_num = "99+";}else{this.alarm_num = data;}
	    },
      //定义右侧日志框的是否显示
      openOrLeft:function(){
        var self = this;
        if(self.pulseIndex){self.pulseIndex = false;}else{self.pulseIndex = true;}
      },
      //获取所有的监室
      getAllRoom:function(){
        let self = this;
        if(localStorage.getItem('token')!==null){
          let [url,data] = ['/sup/prison/query',''];
          self.$http.post(url,data).then(function(result){
            console.log(result)
            if(result.data.flag){
              localStorage.setItem("prison",JSON.stringify(result.data.data)); //将所有的监室存入缓存
            }else{
              self.$message({message:result.data.msg,type:'warning'});
            }
          }).catch(function(erro){
             console.log(erro)
          })
        }
      }
    },
    beforeDestroy() {
      this.$eventBus.$off('alarmLength');  //关闭兄弟组件之间传递信息时$on会多次触发的问题
    }
  }
</script>

<style>
  @import url("../../../static/css/Index/Index.css");
</style>
