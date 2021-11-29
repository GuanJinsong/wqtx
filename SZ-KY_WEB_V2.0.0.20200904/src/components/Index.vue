<template>
  <div class="container">
    <div class="IndexCont">
      <!-- 首页左侧部分 -->
      <IndexLeft v-bind:heightWidth="heightWidth"/>
      <!-- 首页中间部分 -->
      <IndexCenter/>
      <!-- 首页右侧部分 -->
      <IndexRight v-bind:heightWidth="heightWidth"/>
    </div>
  </div>
</template>


<script>
  import Vue from 'vue'
  import echarts from 'echarts';            //引入echarts插件
  Vue.prototype.$echarts = echarts;     //暴露echarts插件

  import IndexLeft from "./IndexLeft.vue"
  import IndexCenter from "./IndexCenter.vue"
  import IndexRight from "./IndexRight.vue"
export default {
  name: 'Index',
  components:{
    IndexLeft:IndexLeft,
    IndexCenter:IndexCenter,
    IndexRight:IndexRight
  },
  data () {
    return {
      heightWidth: '',
      treeList:{tree:'',newTree:'',newList:''},  //定义树形图数据
    }
  },
  created() {
    //headerChange: 是父组件指定的传数据绑定的函数，parentData:子组件给父组件传递的数据
    var parentData = {header:true,nav:0};
    this.$emit('headerChange',parentData);
    this.windowOnresize();
    this.gettingTreeMapData();
  },
  methods:{
      // 根据窗口的大小变动图表 --- 重点
      windowOnresize: function () {
        var self = this;
        window.onresize = function () {
          var heightAndWidth = {screenHeight:document.body.clientHeight,screenWidth:document.body.clientWidth}
          self.heightWidth = heightAndWidth;
        }
      },

      //==============================================获取四级树数据开始=================================================
      gettingTreeMapData:function(){
        var self = this;
      	var url = "/api/index/getViewDevice";
      	var userKey = localStorage.getItem('userKey');
      	var data = {'userKey':userKey};
      	self.$http.post(url,data).then(function(result){
          console.log(result)
      		var Result = result.data.list;
      	  self.treeList.tree = Result;
      	  self.dataReorganization(Result);
      	}).catch(function(erro){
			console.log(erro)
           self.$message.error(erro.data.msg);
      	})
      },
      //重组设备数据的数据结构，新的数据结构将用于select三级下拉框选择
      dataReorganization:function(treList){
        var self = this;
        var newTree = [];
        var newList = [];
        for(var i=0;i<treList.length;i++){
           var list = {value: 1,label: '深圳市',children:[]}
           var cityList = treList[i].cityList;
           list.value = treList[i].city;
           list.label = treList[i].city;
           for(var q=0;q<cityList.length;q++){
             var countylst = {value: 1,label: '南山区',children:[]}
             var countyList = cityList[q].countyList;
             countylst.value = cityList[q].county;
             countylst.label = cityList[q].county;
             for(var w=0;w<countyList.length;w++){
               var riverlst = {value: 1,label: '西丽',children:[]}
               var riverList = countyList[w].riverList;
               riverlst.value = countyList[w].river;
               riverlst.label = countyList[w].river;
               for(var e=0;e<riverList.length;e++){
                 var addresslst = {value:'',label: '沙河'}
                 addresslst.value = riverList[e].address;
                 addresslst.label = riverList[e].address;
                 var detailed = riverList[e].city+'/'+riverList[e].county+'/'+riverList[e].river+'/'+riverList[e].address;
                 var fffg = {detailed:detailed,data:riverList[e]};
                 newList.push(fffg);
                 riverlst.children.push(addresslst);
               }
               countylst.children.push(riverlst);
             }
             list.children.push(countylst);
           }
           newTree.push(list);
        }
        self.treeList.newTree = newTree;
        self.treeList.newList = newList;
        //localStorage不支持存储对象，所以这里先转成字符串，获取的时候再转成对象即可
        console.log(self.treeList);
        var stringTreeList = JSON.stringify(self.treeList);
        localStorage.setItem("treeList",stringTreeList);
        self.$store.dispatch('A_pageTreeListStatus',self.treeList);
      },
      //==============================================获取四级树数据结束================================================
  }
}
</script>


<style>

</style>
