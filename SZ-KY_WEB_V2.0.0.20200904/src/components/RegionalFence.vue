<!-- 电子围栏地图-->
<template>
    <div class="Re_parent">
    <div class="RegionalFence">
        <div class="Re_rightBox">
          <div class="Re_rightBoxAfter">
            <h5 class="Re_rightTitle">电子围栏查询</h5>
            <h6 class="Re_smallTitle">1.绘制电子围栏：</h6>
            <div class="Re_sureBth"><button @click="goToCoordinate();">去绘制电子围栏</button></div>
            <h6 class="Re_smallTitle">2.轨迹回放控制：</h6>
            <div class="Re_sureBth">
              <button @click="startAnimation()">开始动画</button>
          <!--<button @click="pauseAnimation()">暂停动画</button>
              <button @click="resumeAnimation()">继续动画</button> -->
              <button @click="removeTrajeMarker()">清除轨迹</button>
            </div>
            <p class="R_tipWord">提示:1.双击红色坐标点，查看设备轨迹。<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2.没有红色坐标表示没有设备偏移。</p>
            <h6 class="Re_smallTitle">3.电子围栏列表：</h6>
            <div class="Re_listParent">
              <div class="Re_list" v-for="(res,index) in coordinateList" :key="res.fenceId" v-bind:class="coordIndex == index?'selectColor':''" @click="changeCoordinate(index)">
                <p><span>围栏名称：</span><i>{{res.region}}</i></p>
                <p><span>围栏坐标：</span><i :title="res.location">{{res.location}}</i></p>
                <b class="Re_deletBtn el-icon-delete" @click="deleteCoordinate(index,res.fenceId,res.region)"></b>
              </div>
            </div>
          </div>
        </div>
        <div class="Re_mapBox">
          <div id="myMap"></div>
        </div>
    </div>
    </div>
</template>

<script>
  var self = '';
  var map = "";       //定义地图对象，加载地图
  var markers = [];    //定义点标记
  var polygonMap = "";   //定义电子网格地图对象
  var polygon = "";        //定义多边形覆盖物对象
  var rectangle = "";      //定义矩形覆盖物对象
  var circle = "";         //定义圆形覆盖物对象
  var TrajeMarker = "";    //定义轨迹marker对象
  var TrajePolyline = "";   //绘制移动前的轨迹
  var passedPolyline = "";   //绘制移动后的轨迹
  export default{
    name:'RegionalFence',
    data(){
      return{
        coordIndex:0,
        coordinateList:[],         //定义电子围栏得的数据
        treeList:[],               //定义所有设备的数据
        trajectoryList:[],         //定义轨迹移动的所有坐标点
        alermMarker:868020030842149,
      }
    },
    created() {
      self = this;
    },
    mounted() {
      //在高德地图2.0中使用覆盖物动画必须先加载动画插件，即先执行'AMap.MoveAnimation',这里轨迹移动的效果会用到此插件
      AMap.plugin('AMap.MoveAnimation', function(){
        //初始化地图对象，加载地图
        map = new AMap.Map("myMap", {
          resizeEnable: true,
          zoom: 17,
          center:[113.892881,22.599717],
          mapStyle: 'amap://styles/e5ad13855bbc7c83aa045e2b7b42866c', //设置地图的显示样式
        });
        AMap.plugin(['AMap.ToolBar',], function(){
            map.addControl(new AMap.ToolBar({
                liteStyle: true
            }));
        });
      });
      self.getCoordinateData();   //获取电子设备围栏
    },
    methods:{
      //===============================================去绘制电子围栏开始====================================================
      goToCoordinate:function(){
        var changeData = {showStatus:false};
        self.$emit('RegionalChange',changeData);
      },
      //===============================================去绘制电子围栏结束====================================================
      //==============================================获取电子围栏列表开始==================================================
      getCoordinateData:function(){
        var data = {userKey:localStorage.getItem("userKey")};
        var url = "/api/fence/getData";
        self.$http.post(url,data).then(function(result){
          console.log(result);
          var Result = result.data;
          if(Result.flag){
            self.coordinateList = Result.rows;
            if(Result.rows.length>0){
              var fristData = Result.rows[0];
              setTimeout(function(){
                self.mapInitialization(fristData);
              },1500)
            }
          }else{
            //self.$message.error(Result.msg+"1");
            self.$message.error("请求失败2222");
          }
        }).catch(function(erro){
          self.$message.error("请求失败2");
        })
      },
      //==============================================获取电子围栏列表结束==================================================

      //================================================绘制电子围栏开始====================================================
      mapInitialization:function(listData){
        console.log(listData);
        // 创建多边形
        if(listData.fenceType == "polygon"){
          var pathList = listData.location.substr(0,listData.location.length-1);   //删除字符串里最后一个“|”
          var path = pathList.split("|");
          var locationList = [];
          path.forEach(function(arr,index){
            var loc = arr.split(",");
            locationList.push(loc);
          })
          polygon = new AMap.Polygon({path: locationList,fillOpacity:0.4,strokeWeight:0,fillColor:'#00b0ff',strokeColor:'#80d8ff',});
          map.add(polygon);
        }else if(listData.fenceType == "rectangle"){
          var atr = JSON.parse(listData.attribute);
          var southWest = new AMap.LngLat(atr.swlng,atr.swlat);
          var northEast = new AMap.LngLat(atr.nelng,atr.nelat);
          var bounds = new AMap.Bounds(southWest, northEast);
          rectangle = new AMap.Rectangle({
              bounds: bounds,
              strokeColor:'00b0ff',
              strokeWeight: 3,
              strokeOpacity:0.3,
              strokeDasharray:[30,10],
              strokeStyle: 'soild',
              fillColor:'80d8ff',
              fillOpacity:0.3,
              cursor:'pointer',
              zIndex:1,
          })
          map.add(rectangle);
        }else if(listData.fenceType == "circle"){
          var atr = JSON.parse(listData.attribute);
          circle = new AMap.Circle({
              center: atr.center,
              radius: atr.radius, //半径
              strokeColor: "#80d8ff",
              strokeOpacity: 0.5,
              strokeWeight: 3,
              strokeOpacity: 0.2,
              fillOpacity: 0.5,
              strokeDasharray: [10, 10],
              fillColor: '#1791fc',
              zIndex:1,
          })
          map.add(circle);
        }
        map.setFitView();//自适应显示
        self.createMakerPoint(listData);  //创建maker点坐标
      },
      //切换电子围栏
      changeCoordinate:function(index){
        self.coordIndex = index;
        var changeList = self.coordinateList[index];
        //移除之前的覆盖物
        if(polygon !== ""){map.remove(polygon);}
        if(rectangle !== ""){map.remove(rectangle);}
        if(circle !== ""){map.remove(circle);}
        map.remove(markers);  //清除所有的点标记
        self.mapInitialization(changeList);
      },
      //删除电子围栏
      deleteCoordinate:function(index,fenceId,titleName){
        var info = '是否删除电子围栏：'+titleName;
        this.$confirm(info, '删除提示', {
          confirmButtonText: '确定',cancelButtonText: '取消',type: 'warning'
        }).then(() => {
          var url = "/api/fence/delete";
          var userKey = localStorage.getItem("userKey");
          var data = {'fenceId':fenceId,userKey:userKey};
          self.$http.post(url,data).then(function(result){
            var Result = result.data;
            if(Result.flag){
              self.coordinateList.splice(index, 1)
              if(polygon !== ""){map.remove(polygon);} //移除之前的覆盖物
              if(rectangle !== ""){map.remove(rectangle);} //移除之前的覆盖物
              if(circle !== ""){map.remove(circle);} //移除之前的覆盖物
              map.remove(markers);
              self.$message({message: '删除成功！！！',type: 'success'});
            }else{
              self.$message.error("删除失败！！！");
            }
          }).catch(function(erro){
            self.$message.error(erro.data.msg+"3");
          })
        }).catch(() => {
          console.log("取消删除4")
        });
      },
      //================================================绘制电子围栏结束====================================================

      //=====================================================获取设备移动轨迹开始==========================================
      //获取设备移动的轨迹
      getMoveTrajectory:function(imei){
        var data = {"imei":imei};
        var url = "/api/devicedata/getDeviceGps";
        self.$http.post(url,data).then(function(result){
          var Result = result.data;
          if(Result.flag){
            if(Result.rows.length>0){
              var traList = [];
              var moveList = [];
              Result.rows.forEach(function(arr,index){var traLng = arr.value;traList.push(traLng);})
              var inviter = Math.floor(traList.length/20);  //不管轨迹有多长只要20个值
              traList.forEach(function(arr,index){
                var loc = "";
                if(index%inviter == 0){loc = arr.split(",");moveList.push(loc);};
                if(index == traList.length-1){loc = arr.split(",");moveList.push(loc);}
              })
              self.trajectoryList = moveList;
              self.plottingTrajectory(moveList);
            }
          }else{
            self.$message.error(Result.msg+"5");
          }
        }).catch(function(erro){
          self.$message.error("请求失败6");
        })
      },

      //设备移动轨迹绘制开始
      plottingTrajectory:function(moveList){
        if(TrajeMarker !== "" || TrajePolyline !== "" || passedPolyline !== ""){
          self.removeTrajeMarker();      //先清除地图上的线
        }
        var lineArr = moveList;
        TrajeMarker = new AMap.Marker({
          map: map,
          position: lineArr[0],
          icon: "https://webapi.amap.com/images/car.png",
          offset: new AMap.Pixel(-26, -13),
          autoRotation: true,
          angle:-90,
        });

        // 绘制轨迹
        TrajePolyline = new AMap.Polyline({
          map: map,
          path: lineArr,
          showDir:true,
          strokeColor: "#28F",  //线颜色
          strokeWeight: 6,      //线宽
        });

        passedPolyline = new AMap.Polyline({
          map: map,
          strokeColor: "#AF5",  //线颜色
          strokeWeight: 6,      //线宽
        });

        TrajeMarker.on('moving', function (e) {
          passedPolyline.setPath(e.passedPath);
        });
        map.setFitView();
      },
      //开始轨迹动画
      startAnimation:function(){
        if(TrajeMarker == ""){self.$message({message:'没有轨迹',type:'warning'}); return false;}
        TrajeMarker.moveAlong(self.trajectoryList, 1000);
      },
      //暂停轨迹动画
      // pauseAnimation:function(){
      //   if(TrajeMarker == ""){self.$message({message:'没有轨迹',type:'warning'}); return false;}
      //   TrajeMarker.pauseMove();
      // },
      //继续轨迹动画
      // resumeAnimation:function(){
      //   if(TrajeMarker == ""){self.$message({message:'没有轨迹',type:'warning'}); return false;}
      //   TrajeMarker.resumeMove();
      // },
      //清除轨迹
      removeTrajeMarker:function(){
        if(TrajeMarker == "" || TrajePolyline == "" || passedPolyline == ""){self.$message({message:'没有轨迹',type:'warning'}); return false;}
        //setMap设置折线所在的地图。参数map即为目标地图，参数为null时，在地图上移除当前折线
        TrajeMarker.stopMove();
        TrajeMarker.setMap(null);
        TrajePolyline.setMap(null);
        passedPolyline.setMap(null);
        TrajeMarker = "";
        TrajePolyline = "";
        passedPolyline = "";
      },
      //=====================================================获取设备移动轨迹结束==========================================

      //===================================================创建设备设备的坐标开始==========================================
      //循环围栏内对应的所有设备
      createMakerPoint:function(listData){
        var pathList = listData.location.substr(0,listData.location.length-1);   //删除字符串里最后一个“|”
        var path = pathList.split("|");
        var locationList = [];
        path.forEach(function(arr,index){var loc = arr.split(",");locationList.push(loc);})
        // 创建点
        var icon1 = new AMap.Icon({image: "../../static/images/deviceico.png",size: new AMap.Size(32, 32),imageSize: new AMap.Size(32,32)});
        var icon = new AMap.Icon({image: "../../static/images/deviceRed.png",size: new AMap.Size(32, 32),imageSize: new AMap.Size(32,32)});
        if(listData.devicedata.length>0){
          listData.devicedata.forEach(function(arr,index){
            var laoct = arr.geographic.split(",");
            if(laoct[0] !== "" && laoct[1] !== ""){
              var marker = '';
              var isPointInRing = AMap.GeometryUtil.isPointInRing(laoct,locationList);  //判断点是否在覆盖物之内
              if(isPointInRing){
                marker = new AMap.Marker({map: map,zIndex:1000,position: laoct,icon: icon1});
              }else{
                marker = new AMap.Marker({map: map,zIndex:1000,position: laoct,icon: icon});
                marker.on('dblclick', markerDbclick);      //给发生偏移的设备绑定双击事件，用于查看设备偏移的轨迹
              }
              marker.setLabel({direction:'center',offset: new AMap.Pixel(0, -30), content: "<div class='infoRegi'>"+arr.address+"</div>", });
              markers.push(marker);
            }
          })
          //绘制设备偏移的轨迹
          function markerDbclick(){
            self.getMoveTrajectory();    //设备移动轨迹绘制开始
          }
        }
      }
      //===================================================创建设备设备的坐标结束==========================================

    },
    destroyed() {
      map && map.destroy();
      console.log("地图被销毁了");
    }
  }
</script>

<style>

</style>
