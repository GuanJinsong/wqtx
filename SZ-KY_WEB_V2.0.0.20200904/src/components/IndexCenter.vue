<!-- 首页中间部分 -->
<template>
  <div class="placed-middle">
      <div class="placed-middle-title">
          <img src="../../static/images/line.png" alt="">
          <ul>
              <li style="color:#ffffff">
                  <div>总设备:</div>
                  <div class="equipment1">{{onlinDevice+outOnlinDevice}}<sub>台</sub></div>
              </li>
              <li style="color:#16fd05">
                  <div>在线设备:</div>
                  <div class="equipment1">{{onlinDevice}}<sub>台</sub></div>
              </li>
              <li style="color:#ffb400">
                  <div>离线设备:</div>
                  <div class="equipment1">{{outOnlinDevice}}<sub>台</sub></div>
              </li>
              <li style="color:#f6511d">
                  <div>设备报警:</div>
                  <div class="equipment1">{{alarmNum}}<sub>次</sub></div>
              </li>
          </ul>
          <img src="../../static/images/line.png" alt="">
      </div>
      <div class="mapChangeBtn" @click="mapchange()">地图切换<span class="el-icon-refresh"></span></div>
      <div class="mapBox" v-show="mapStatus == true">
        <section id="container" tabindex="0"></section>
      </div>
      <div class="mapBox" v-show="mapStatus !== true">
        <div class="singleMapBefor">
          <div class="center_deviceSelect">
            <div class="leftCascader">
              <el-cascader :options="centerOptions"
              v-model="centerCascaderV"
              :checkStrictly="true"
              @change="centerCascader"
              placeholder="请选择你需要的设备..."
              popper-class="myCascader"
              :show-all-levels = "true"
              clearable></el-cascader>
            </div>
          </div>
          <section id="singleMap" tabindex="1"></section>
        </div>
      </div>
  </div>
</template>

<script>
  var self = "";
  var map = "";//带有聚合点的地图对象
  var singleMap = "";   //单设备点的地图对象(主要用于设备切换后的地图对象)
  var singleMarker = "";   //单设备点的marker对象
  var positionAdress = [];    //定义地址数组
  var markers = [];       //定义坐标锚点
  var markersImei = [];   //定义每个坐标点对应的设备编码
  export default{
    name: 'IndexCenter',
    data () {
      return {
        msg: '',
        treeList:{tree:'',newTree:'',newList:''},  //定义树形图数据
        allDevice:0,         //定义设备总数
        onlinDevice:0,       //在线设备数
        outOnlinDevice:0,    //离线设备数
        alarmNum:0,          //设备报警次数
        centerOptions:[],           //定义设备选择下拉框的内容
        centerCascaderV:[],        //定义select选中的值结果
        mapStatus:true,      //定义地图的显示，true的状态下显示点聚合地图，false状态下添加单点坐标地图
      }
    },
    created() {
       self = this;
       self.getDeviceStatus();
       self.gettingTreeMapData();   //获取设备数据
    },
    methods:{
    //==============================获取当前的设备状态开始===========================
    getDeviceStatus:function(){
      var url = '/api/device/getDeviceNum';
      var data = {"userKey":localStorage.getItem("userKey")};
      self.$http.post(url, data).then(function (result) {
        if(result.data.flag){
          self.onlinDevice = Number(result.data.onlineNum);
          self.outOnlinDevice = Number(result.data.notOnlineNum);
          self.alarmNum = Number(result.data.alarmNum);
        }
      })
    },
    //==============================获取当前的设备状态结束===========================

    //==============================================获取四级树数据开始=================================================
    gettingTreeMapData:function(){
      var url = "/api/index/getViewDevice";
      var userKey = localStorage.getItem('userKey');
      var data = {'userKey':userKey};
      self.$http.post(url,data).then(function(result){
        console.log(result)
        var Result = result.data.list;
        self.treeList.tree = Result;
        self.dataReorganization(Result);
      }).catch(function(erro){
        console.log(erro);
         self.$message.error(erro.data.msg);
      })
    },
    //重组设备数据的数据结构，新的数据结构将用于select三级下拉框选择
    dataReorganization:function(treList){
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
      self.centerOptions = newTree;
      var centerCascaderV = self.treeList.newList[0].detailed;
      self.centerCascaderV = centerCascaderV.split('/');
      self.mapInitialization();    //地图初始化函数
      self.singleMapInitialization();
    },
    //==============================================获取四级树数据结束================================================


	//=================地图初始化函数开始===========================
    mapInitialization:function(){
      var cluster;
      map = new AMap.Map("container", {zoom: 5,mapStyle: 'amap://styles/e5ad13855bbc7c83aa045e2b7b42866c'});
      AMap.plugin(['AMap.ToolBar',], function(){
          map.addControl(new AMap.ToolBar({
              liteStyle: true
          }));
      });
      // 数据格式为一组含有经纬度信息的数组，如下所示。其中【经纬度】lnglat 为必填字段，【权重】weight 为可选字段。
      var points = [];
      if(self.treeList.newList.length>0){
        self.treeList.newList.forEach(function(p_arr,index){
          var list = p_arr.data.geographic.split(",");
          var lng = list[0],lat = list[1];
          if(list.length>1 && 0<=lng<=180 && 0<=lat<=90){
            points.push({lnglat:list});
          }
        })
      }
      if (cluster){cluster.setMap(null);}
      var gridSize = 60;
      var _renderMarker = function(context) {
          var icon = new AMap.Icon({image: "../../static/images/deviceico.png",size: new AMap.Size(28, 28),imageSize: new AMap.Size(28,28)});
          var offset = new AMap.Pixel(-12, -12);
          var size = new AMap.Size(28, 28);
          context.marker.setOffset(offset)
          context.marker.setIcon(icon);
          context.marker.setSize(size);
      }
      cluster = new AMap.MarkerCluster(map, points,{renderMarker: _renderMarker,gridSize:gridSize});
      map.setFitView();
      self.builderLabelMarker(points);
		},
		//=================地图初始化函数结束===========================

    //===================创建marker由此开始========================
    builderLabelMarker:function(){
      // 创建 AMap.Icon 实例：
      //这里的自定义图标是一个透明图标，主要作用是结合 点聚合 功能一起使用
      //因为在点聚合功能中生成的坐标点无法添加 信息窗体（InfoWindow），这里的坐标点将与点聚合生成的点重叠在一起，看起来只有一个点
      var icon = new AMap.Icon({image: "../../static/images/ico-b.png",size: new AMap.Size(28, 28),imageSize: new AMap.Size(28,28)});
      var infoWindow = new AMap.InfoWindow({isCustom:false,offset: new AMap.Pixel(0, -20)});
      var posit = [];
      self.treeList.newList.forEach(function(p_arr,index){
        var list = p_arr.data.geographic.split(",");
        var lng = list[0],lat = list[1];
        if(list.length>1 && 0<=lng<=180 && 0<=lat<=90){
          posit.push({lnglat:list,imei:p_arr.data.imei,address:p_arr.detailed});
        }
        positionAdress.push(p_arr.detailed);
      })
      for(var i=0;i<posit.length;i++){
        var marker = new AMap.Marker({
            icon: icon,
            position: posit[i].lnglat,
            offset: new AMap.Pixel(-12, -12),
            zIndex:101
        });
        var attributeList = "<li>PH:7.8</li><li>溶氧:7.28mg/L</li><li>水温:7.8℃</li><li>浑浊度:20.8NTU</li><li>电导率:20.8S/cm</li>";
        marker.content = "<div class='tooltip-inner1'><i>"+posit[i].imei+"</i><div class='tooltip-arrow'></div><ul class='detailsList'>"+attributeList+"<li>地址："+posit[i].address+"</li></ul></div>";
        markers.push(marker);   //存储坐标点，便于切换坐标点时统一清空处理
        markersImei.push(posit[i].imei);
        map.add(marker);
        map.setFitView();
        marker.on('mouseover', markerClick);
        marker.on('mouseout', markerMouseOut);
      }

      function markerClick(e){
        infoWindow.setContent(e.target.content);
        infoWindow.open(map, e.target.getPosition());
        var cont = infoWindow.getContent();
        var aa = cont.split("</i>");   //截取信息窗体内<li></li>携带的值，这个值经用于确定当前操作的对象是谁
        var bb = aa[0].split("<i>");
        var cc = bb[1];
        if(markersImei.length>0){
          markersImei.forEach(function(arr,index){
            if(arr == cc){
              //重新获取设备最新数据（实现每次鼠标移入都可以取到最新的设备数据）
              var data = {imei:cc};
              var url = "/api/devicedatalast/getLastData";
              self.$http.post(url,data).then(function(result){
                console.log(result)
                if(result.data.flag){
                  var haverRes = result.data;
                  var lis2 = '';
                  for(let i = 0,leg =haverRes.rows.length ;i<leg;i++){
                      let haverRes1 = haverRes.rows[i];
                      if(haverRes1.code !== 50){
                        lis2 += '<li>'+haverRes1.parameterName+'<span>:</span>'+haverRes1.value+haverRes1.unitl+'</li>';
                      }
                  }
                  markers[index].content =  "<div class='tooltip-inner1'><i>"+cc+"</i><div class='tooltip-arrow1'></div><ul class='detailsList'>"+lis2+"<li>地址："+positionAdress[index]+"</li></ul></div>";
                  infoWindow.setContent(e.target.content);
                }else{
                  self.$message.error(result.data.msg);
                }
              }).catch(function(erro){
                console.log(erro);
                self.$message.error("请求失败1");
              })
            }
          })
        }
      }
      function markerMouseOut(){
        map.clearInfoWindow();
      }
    },
    //===================创建marker由此结束========================

    //===================================单设备点地图显示开始=================================
    //地图切换
    mapchange:function(){
      if(self.mapStatus){self.mapStatus = false;}else{self.mapStatus = true;}
    },
    singleMapInitialization:function(){
      singleMap = new AMap.Map('singleMap', {
          resizeEnable:true, //是否监控地图容器尺寸变化
          zoom:14, //初始化地图层级
          center:[116.397428, 39.90923], //初始化地图中心点
          mapStyle:'amap://styles/e5ad13855bbc7c83aa045e2b7b42866c'
      });
      AMap.plugin(['AMap.ToolBar',], function(){
          singleMap.addControl(new AMap.ToolBar({
              liteStyle: true
          }));
      });
      this.singleMapBuilderMarker(self.treeList.newList[0]);   //创建marker点
		},
    //设备多参数表格形式实时监控部分的的 设备选择
    centerCascader:function(data){
      var address = data[0]+'/'+data[1]+'/'+data[2]+'/'+data[3];
      if(self.treeList.newList.length>0){
        self.treeList.newList.forEach(function(arr,index){
          if(arr.detailed == address){self.singleMapBuilderMarker(arr);}
        })
      }
    },
    singleMapBuilderMarker:function(deviceInfo){
      var icon = new AMap.Icon({image: "../../static/images/deviceico.png",size: new AMap.Size(28, 28),imageSize: new AMap.Size(28,28)});
      var infoWindow = new AMap.InfoWindow({anchor:"top-left"});
      var posit = "";
      var list = deviceInfo.data.geographic.split(",");
      var lng = list[0],lat = list[1];
      if(list.length>1 && 0<=lng<=180 && 0<=lat<=90){
        posit = {lnglat:list,imei:deviceInfo.data.imei,address:deviceInfo.detailed};
      }else{
        self.$message.error("经纬度异常");
      }
      //创建marker前先清空之前可能存在的marker
      if(singleMarker !== undefined){singleMap.remove(singleMarker);}
      singleMarker = new AMap.Marker({
          icon: icon,
          position: posit.lnglat,
          offset: new AMap.Pixel(-12, -12),
          zIndex:101
      });
      var attributeList = "<li>PH:7.8</li><li>溶氧:7.28mg/L</li><li>水温:7.8℃</li><li>浑浊度:20.8NTU</li><li>电导率:20.8S/cm</li>";
      singleMarker.content = "<div class='tooltip-inner1'><i>"+posit.imei+"</i><div class='tooltip-arrow'></div><ul class='detailsList'>"+attributeList+"<li>地址："+posit.address+"</li></ul></div>";
      singleMap.add(singleMarker);
      singleMap.clearInfoWindow();  //创建信息窗体前先关闭之前的
      infoWindow.setContent(singleMarker.content);
      infoWindow.open(singleMap, posit.lnglat);
      // singleMap.setFitView();
      singleMarker.on('click', markerClick);
      singleMap.setCenter(posit.lnglat); //设置地图中心点

      function markerClick(e){
        infoWindow.setContent(e.target.content);
        infoWindow.open(singleMap, posit.lnglat);
        var cont = infoWindow.getContent();
        var aa = cont.split("</i>");   //截取信息窗体内<li></li>携带的值，这个值经用于确定当前操作的对象是谁
        var bb = aa[0].split("<i>");
        var cc = bb[1];
        //重新获取设备最新数据（实现每次鼠标移入都可以取到最新的设备数据）
        var data = {imei:cc};
        var url = "/api/devicedatalast/getLastData";
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            var haverRes = result.data;
            var lis2 = '';
            for(let i = 0,leg =haverRes.rows.length ;i<leg;i++){
                let haverRes1 = haverRes.rows[i];
                if(haverRes1.code !== 50){
                  lis2 += '<li>'+haverRes1.parameterName+'<span>:</span>'+haverRes1.value+haverRes1.unitl+'</li>';
                }
            }
            singleMarker.content =  "<div class='tooltip-inner1'><i>"+cc+"</i><div class='tooltip-arrow1'></div><ul class='detailsList'>"+lis2+"<li>地址："+posit.address+"</li></ul></div>";
            infoWindow.setContent(singleMarker.content);
          }else{
            self.$message.error(result.data.msg);
          }
        }).catch(function(erro){
          console.log(erro);
          self.$message.error("请求失败1");
        })
      }
    },
    //===================================单设备点地图显示结束=================================
    },
    destroyed() {
      map && map.destroy();
    }
  }
</script>

<style>

</style>
