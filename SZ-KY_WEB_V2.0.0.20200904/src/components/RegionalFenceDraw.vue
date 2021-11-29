<!-- 绘制电子围栏 -->
<template>
  <div class="Re_parent">
  <div class="RegionalFenceDraw">
    <div class="R_rightBox">
      <div class="R_rightBoxAfter">
        <h5 class="R_rightTitle">绘制电子围栏</h5>
        <h6 class="R_smallTitle">1.区域定位：</h6>
        <div class="R_searchPut"><input type="text" id="tipinput" v-model="searchWord" placeholder="请输入地址..."/> <button @click="searchBtn()">搜索</button></div>
        <h6 class="R_smallTitle">2.绘制方式选择：</h6>
        <div>
          <el-radio-group v-model="radio" @change="radioSelect">
            <el-radio :label="3">画多边形</el-radio>
            <el-radio :label="6">画矩形</el-radio>
            <el-radio :label="9">画圆形</el-radio>
          </el-radio-group>
        </div>
        <p class="R_tipWord">提示:1.画多边形时,结束时需要双击才能完成结束操作。<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2.画矩形或圆形时请长按拖动鼠标</p>
        <h6 class="R_smallTitle">3.绘制区域操作：</h6>
        <div class="R_sureBth">
          <button @click="clearDraw()">清除绘制</button>
          <button @click="openSavedataPop()">保存绘制</button>
          <button @click="lookCoordinate()">查看电子围栏</button>
        </div>
        <h6 class="R_smallTitle">4.围栏设备选择：</h6>
        <div class="RegCascader" style="width:315px;">
          <el-cascader :options="options"
          v-model="casValue"
          @change="casChange"
          placeholder="请选择你需要的设备..."
          popper-class="R_myCascader"
          :show-all-levels = "true"
          :props="props"
          :clearable="true"
          collapse-tags
          clearable></el-cascader>
        </div>
        <p class="R_tipWord">提示:1.请选择你需要放入围栏中的设备.</p>
        <h6 class="R_smallTitle">5.电子围栏坐标:</h6>
        <p class="R_tipWord">提示:1.围栏名称可以修改,请先修改名称后保存.</p>
        <div class="R_textarea">
          <div class="R_coordList">
            <p><span>围栏名称：</span><input type="text" v-model="coordinate.region" @blur="coordinateName($event)"/></p>
            <p><span>围栏坐标：</span><i :title="coordinate.location">{{coordinate.location}}</i></p>
          </div>
        </div>
      </div>
    </div>

    <div class="Re_mapBox">
      <div id='myContainer'></div>
    </div>

    <el-dialog title="确定要提交？" :visible.sync="dialogVisible" width="500px" @click="dialogVisible = false" center :append-to-body="true">
      <div>
        <div class="R_coordListPop">
          <p><span>围栏名称：</span><i>{{coordinate.region}}</i></p>
          <p><span>围栏坐标：</span><i :title="coordinate.location">{{coordinate.location}}</i></p>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="savedata()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
  </div>
</template>

<script>
  var self = '';
  var map = '';             //定义一个地图对象
  var markers = [];         //定义一个marker对象
  var mouseTool = '';       //定义一个绘制操作对象
  var polygon = "";         //定多边形形覆盖物对象
  var polyEditor = "";      //定义多边形覆盖物编辑对象
  var rectangle = "";       //定义矩形覆盖物对象
  var rectangleEditor = ""; //定义矩形覆盖物编辑对象
  var circle = "";          //定义圆形覆盖物对象
  var circleEditor = "";    //定义圆形覆盖物编辑对象
  export default{
    name:'RegionalFenceDraw',
    data(){
      return{
        treeList:[],               //定义树形图数据
        radio:3,                   //3=polygon,6=rectangle,9=circle
        radioValue:'polygon',      //定义覆盖物（电子地图）绘制的方式
        searchWord:'',             //定义搜索的关键词
        coordinate:"",             //定义覆盖物坐标值，以及覆盖物（电子地图）名称的集合
        overlays:"",               //定义地图的上覆盖物值
        dialogVisible:false,
        options:[],
        props: { multiple: true },
        casValue:[],               //定义选中的设备名称
        deviceId:"",               //定义选中的设备id集合
      }
    },
    created() {
      self = this;
      self.treeList = self.$store.state.treeList;   //获取vuex内存储的数据
      self.options = self.treeList.newTree;
    },
    mounted() {
      map = new AMap.Map('myContainer',{zoom:14,resizeEnable: true,mapStyle: 'amap://styles/e5ad13855bbc7c83aa045e2b7b42866c'});   //初始定义地图对象
      AMap.plugin(['AMap.ToolBar',], function(){
          map.addControl(new AMap.ToolBar({
              liteStyle: true
          }));
      });
      self.drawMapInitialization();
      self.startDraw();
      self.search();
      self.createMaker();
    },
    methods:{
      //========================================初始化鼠标覆盖物绘制开始====================================================
      drawMapInitialization:function(){
        var userKey = localStorage.getItem("userKey");
        mouseTool = new AMap.MouseTool(map);
        //监听draw事件可获取画好的覆盖物
        mouseTool.on('draw',function(event){
          console.log(event.obj)
          self.overlays = event.obj;
          var regional = {"region":'电子围栏',userKey:userKey,devicestr:'',location:"",fenceType:'',attribute:''};
          var typeName = event.obj.className;
          //绘制多边形围栏
          if(typeName == "Overlay.Polygon"){
            var polygPath = event.obj._opts.path;var loca = "";
            var list = event.obj._opts.path;
            for(var p=0;p<list.length;p++){
              loca = loca + list[p][0]+","+list[p][1]+"|";
            }
            regional.location = loca;
            regional.fenceType = "polygon";   //定义围栏类型为多边形
            regional.attribute = loca;
            self.polygonEditorSatrt(polygPath)
          //绘制矩形围栏
          }else if(typeName == "Overlay.Rectangle"){
            var loca = "";
            var list = event.obj.aE[0][0];
            for(var r=0;r<list.length;r++){
              loca = loca + list[r][0]+","+list[r][1]+"|";
            }

            var swlng = event.obj.ir.southWest.lng;
            var swlat = event.obj.ir.southWest.lat;
            var nelng = event.obj.ir.northEast.lng;
            var nelat = event.obj.ir.northEast.lat;
            var atr = {swlng:swlng,swlat:swlat,nelng:nelng,nelat:nelat};
            regional.location = loca;
            regional.fenceType = "rectangle";   //定义围栏类型为矩形
            regional.attribute = JSON.stringify(atr);   //定义绘制矩形围栏所需要的属性
            self.rectangleEditorSatrt(swlng,swlat,nelng,nelat);
          //绘制圆形围栏
          }else if(typeName == "Overlay.Circle"){
            var loca = "";
            var list = event.obj.aE[0][0];
            for(var r=0;r<list.length;r++){
              loca = loca + list[r][0].toFixed(6)+","+list[r][1].toFixed(6)+"|";
            }

            var centerString = event.obj._opts.center.lng+","+event.obj._opts.center.lat;
            var center = centerString.split(",");
            var radius = event.obj._opts.radius;    //获取圆形的半径
            var atr = {center:center,radius:radius};
            regional.location = loca;
            regional.fenceType = "circle";   //定义围栏类型为圆形
            regional.attribute = JSON.stringify(atr);  //定义绘制圆形围栏所需要的属性
            self.circleEditorSatrt(center,radius)
          }
          self.coordinate = regional;
          map.remove(self.overlays)
          self.overlays = "";
          mouseTool.close(true)//关闭，并清除覆盖物(这样可以实现一次只允许画一个覆盖物，重新绘制时需要重新执行绘制事件)
        })
      },
      //========================================初始化鼠标覆盖物绘制结束====================================================

      //==========================================选择覆盖物绘绘制方式开始==================================================
      startDraw:function(){
        mouseTool.polygon({fillColor:'#00b0ff',strokeColor:'#80d8ff'});
      },
      radioSelect:function(value){
        if(value == 3){
          self.radioValue = 'polygon';
          mouseTool.polygon({fillColor:'#00b0ff',strokeColor:'#80d8ff'});
        }else if(value == 6){
          self.radioValue = 'rectangle';
          mouseTool.rectangle({fillColor:'#00b0ff',strokeColor:'#80d8ff'});
        }else if(value == 9){
          self.radioValue = 'circle';
          mouseTool.circle({fillColor:'#00b0ff',strokeColor:'#80d8ff'});
        }
      },
      //==========================================选择覆盖物绘绘制方式结束==================================================

      //========================================覆盖物编辑开始========================================
      //多边形覆盖物编辑开始
      polygonEditorSatrt:function(polygPath){
        polyEditor = "";
        polygon = new AMap.Polygon({
          path: polygPath,
          strokeColor: "#00b0ff",
          strokeWeight: 3,
          strokeOpacity: 0.8,
          fillOpacity: 0.4,
          fillColor: '#80d8ff',
          zIndex: 50,
        })
        map.add(polygon);
        map.setFitView([ polygon ])
        polyEditor = new AMap.PolygonEditor(map, polygon);
        polyEditor.open();
        polyEditor.on('adjust', function(event) {
          var list = event.target._opts.path; var loca = "";  //获取编辑后的覆盖物坐标
          for(var r=0;r<list.length;r++){
            loca = loca + list[r][0]+","+list[r][1]+"|";
          }
          self.coordinate.location = loca;   //将新的覆盖物坐标赋值给围栏
          self.coordinate.attribute = loca;  //多边形围栏的绘制只需要经纬度，不像矩形和圆形，所以这里也传覆盖物的金纬度即可
        })
        polyEditor.on('addnode', function(event) {
          var list = event.target._opts.path; var loca = "";  //获取编辑后的覆盖物坐标
          for(var r=0;r<list.length;r++){
            loca = loca + list[r][0]+","+list[r][1]+"|";
          }
          self.coordinate.location = loca;   //将新的覆盖物坐标赋值给围栏
          self.coordinate.attribute = loca;  //多边形围栏的绘制只需要经纬度，不像矩形和圆形，所以这里也传覆盖物的金纬度即可
        })
      },
      //矩形覆盖物编辑开始
      rectangleEditorSatrt:function(swlng,swlat,nelng,nelat){
        rectangleEditor = "";
        var southWest = new AMap.LngLat(swlng,swlat);
        var northEast = new AMap.LngLat(nelng,nelat);
        var bounds = new AMap.Bounds(southWest, northEast);
        rectangle = new AMap.Rectangle({
            bounds: bounds,
            strokeColor:'00b0ff',
            strokeWeight: 3,
            strokeOpacity:0.5,
            strokeDasharray:[30,10],
            strokeStyle: 'soild',
            fillColor:'80d8ff',
            fillOpacity:0.5,
            cursor:'pointer',
            zIndex:50,
        })
        map.add(rectangle);
        map.setFitView([ rectangle ])
        rectangleEditor = new AMap.RectangleEditor(map, rectangle);
        rectangleEditor.open();
        rectangleEditor.on('adjust', function(event) {
          console.log(event.target.aE[0][0]);
          var list = event.target.aE[0][0]; var loca = "";  //获取编辑后的覆盖物坐标
          for(var r=0;r<list.length;r++){
            loca = loca + list[r][0]+","+list[r][1]+"|";
          }
          var swlng1 = event.target.ir.southWest.lng;
          var swlat1 = event.target.ir.southWest.lat;
          var nelng1 = event.target.ir.northEast.lng;
          var nelat1 = event.target.ir.northEast.lat;
          var atr = {swlng:swlng1,swlat:swlat1,nelng:nelng1,nelat:nelat1};
          self.coordinate.location = loca;
          self.coordinate.attribute = JSON.stringify(atr);   //定义绘制矩形围栏所需要的属性
        })
        rectangleEditor.on('addnode', function(event) {
          console.log(event.target.aE[0][0])
          var list = event.target.aE[0][0]; var loca = "";  //获取编辑后的覆盖物坐标
          for(var r=0;r<list.length;r++){
            loca = loca + list[r][0]+","+list[r][1]+"|";
          }
          var swlng1 = event.target.ir.southWest.lng;
          var swlat1 = event.target.ir.southWest.lat;
          var nelng1 = event.target.ir.northEast.lng;
          var nelat1 = event.target.ir.northEast.lat;
          var atr = {swlng:swlng1,swlat:swlat1,nelng:nelng1,nelat:nelat1};
          self.coordinate.location = loca;
          self.coordinate.attribute = JSON.stringify(atr);   //定义绘制矩形围栏所需要的属性
        })
      },
      //圆形覆盖物编辑开始
      circleEditorSatrt:function(center,radius){
        circleEditor = "";
        circle = new AMap.Circle({
            center: center,
            radius: radius, //半径
            strokeColor: "#80d8ff",
            strokeOpacity: 0.5,
            strokeWeight: 3,
            strokeOpacity: 0.2,
            fillOpacity: 0.5,
            strokeDasharray: [10, 10],
            fillColor: '#1791fc',
            zIndex: 50,
        })
        map.add(circle);
        map.setFitView([ circle ]);
        circleEditor = new AMap.CircleEditor(map, circle);
        circleEditor.open();
        circleEditor.on('adjust', function(event) {
          console.log(event.target)
          var list = event.target.aE[0][0]; var loca = "";  //获取编辑后的覆盖物坐标
          for(var r=0;r<list.length;r++){
            loca = loca + list[r][0].toFixed(6)+","+list[r][1].toFixed(6)+"|";
          }
          //重新获取编辑后的圆形覆盖物的经纬度，中心点，半径
          var center = event.target._opts.center;
          var radius = event.target._opts.radius;    //获取圆形的半径
          var atr = {center:center,radius:radius};
          self.coordinate.location = loca;   //将新的覆盖物坐标赋值给围栏
          self.coordinate.attribute = JSON.stringify(atr);  //定义绘制圆形围栏所需要的属性
        })
        circleEditor.on('addnode', function(event) {
          console.log(event.target.aE[0][0])
          var list = event.target.aE[0][0]; var loca = "";  //获取编辑后的覆盖物坐标
          for(var r=0;r<list.length;r++){
            loca = loca + list[r][0].toFixed(6)+","+list[r][1].toFixed(6)+"|";
          }
          //重新获取编辑后的圆形覆盖物的经纬度，中心点，半径
          var center = event.target._opts.center;
          var radius = event.target._opts.radius;    //获取圆形的半径
          var atr = {center:center,radius:radius};
          self.coordinate.location = loca;   //将新的覆盖物坐标赋值给围栏
          self.coordinate.attribute = JSON.stringify(atr);  //定义绘制圆形围栏所需要的属性
        })
      },
      //========================================覆盖物编辑结束========================================


      //===============================================清除已绘制的区域开始================================================
      //清除全部覆盖物
      clearDraw:function(){
        if(polyEditor !== ""){polyEditor.close();map.remove(polygon);}
        if(rectangleEditor !== ""){rectangleEditor.close();map.remove(rectangle);}
        if(circleEditor !== ""){circleEditor.close();map.remove(circle);}
        self.coordinate = "";
        self.radioSelect(self.radio);   //重新执行绘图事件
      },
      //===============================================清除已绘制的区域结束================================================

      //================================================关键字搜索查询开始=================================================
      //选择立即搜索
      search:function(){
        //输入提示
        var autoOptions = {
            input: "tipinput"
        };
        AMap.plugin(['AMap.PlaceSearch','AMap.AutoComplete'], function(){
          var auto = new AMap.Autocomplete(autoOptions);
          var placeSearch = new AMap.PlaceSearch({ map: map});
          //构造地点查询类
          auto.on("select", select);//注册监听，当选中某条记录时会触发
          function select(e) {
              placeSearch.setCity(e.poi.adcode);
              placeSearch.search(e.poi.name);  //关键字查询查询
          }
        });
      },

      //搜索栏点击确认按钮搜索
      searchBtn:function(){
        AMap.service(["AMap.PlaceSearch"], function() {
            //构造地点查询类
            var placeSearch = new AMap.PlaceSearch({
                map: map, // 展现结果的地图实例
                autoFitView: true // 是否自动调整地图视野使绘制的 Marker点都处于视口的可见范围
            });
            //关键字查询
            var word = self.searchWord;
            if(word){
              placeSearch.search(word);
            }else{
              self.$message({message: '关键词不得为空',type: 'warning'});
            }
        });
      },
      //================================================关键字搜索查询开始=================================================

      //=================================================修改围栏名称开始==================================================
      coordinateName:function(e){
        var data = self.coordinate;
        data.region = e.target.value;
        self.coordinate = data;
      },
      //=================================================修改围栏名称结束==================================================

      //================================================保存电子围栏开始==================================================
      //开启电子围栏提示框
      openSavedataPop:function(){
        if(self.deviceId == ""){
          self.$message({message: '请为围栏添加设备',type: 'warning'});
          return false
        }
        if(self.coordinate !== ""){
          self.dialogVisible = true;
        }else{
          self.$message({message: '请先添加电子围栏',type: 'warning'});
        }
      },
      //电子围栏保存
      savedata:function(){
        var data = self.coordinate;
        data.devicestr = self.deviceId;
        var url = "/api/fence/edit";
        console.log(data);
        self.$http.post(url,data).then(function(result){
          console.log(result);
          if(result.data.flag){
            self.clearDraw();   //清除当前所有的电子围栏
            self.$message({message: '保存成功！！！',type: 'success'});
          }else{
            self.$message.error(result.data.msg);
          }
          self.dialogVisible = false;
        }).catch(function(erro){
          self.dialogVisible = false;
          self.$message.error("请求失败");
        })
      },
      //================================================保存电子围栏结束==================================================
      //===========================================围栏设备选择开始================================
      casChange:function(data){
        var tree = self.treeList.newList;
        var dataList = [];
        var deviceIdVule = [];
        if(data.length>0){
          data.forEach(function(arr,index){
            var arrList = arr[0]+"/"+arr[1]+"/"+arr[2]+"/"+arr[3];
            dataList.push(arrList);
          })
        }
        if(tree.length>0){
          for(var i=0;i<dataList.length;i++){
            tree.forEach(function(treeArr,treeIndex){
              var device = treeArr.detailed;
              if(dataList[i] == device){
                deviceIdVule.push(treeArr.data.deviceId);
              }
            })
          }
        }
        self.deviceId = deviceIdVule.toString();  //获取设备对应的设备id
      },
      //===========================================围栏设备选择结束================================

      //=====================================获取用户设备，并以点标记的形式展示在地图上开始========================
      createMaker:function(){
        var list = self.treeList.newList;
        var icon1 = new AMap.Icon({image: "../../static/images/deviceico.png",size: new AMap.Size(32, 32),imageSize: new AMap.Size(32,32)});
        if(list.length>0){
          list.forEach(function(arr,index){
            var laoct = arr.data.geographic.split(",");
            if(laoct[0] !== "" && laoct[1] !== ""){
              var marker = '';
              marker = new AMap.Marker({map: map,zIndex:1000,position: laoct,icon:icon1});
              marker.setLabel({
                direction:'center',
                offset: new AMap.Pixel(0, -30),  //设置文本标注偏移量
                content: "<div class='infoRegi'>"+arr.data.address+"</div>", //设置文本标注内容
              });
              markers.push(marker);
            }
          })
          map.setFitView();
        }
      },
      //=====================================获取用户设备，并以点标记的形式展示在地图上结束========================

      //=========================================查看电子围栏开始====================================================
      lookCoordinate:function(){
        var changeData = {showStatus:true};
        self.$emit('RegionalChange',changeData);
      },
      //=========================================查看电子围栏结束====================================================
    },
    destroyed() {
      map && map.destroy();
    }
  }
</script>

<style>

</style>
