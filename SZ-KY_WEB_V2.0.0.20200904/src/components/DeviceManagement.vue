<!-- 设备管理 -->
<template>
  <div class="mainView">
    <section class="d_parent">
        <div class="d_add_header">
            <div class="d_searchBox"><input type="text" v-model="searchTxt" placeholder="请输入您想搜索的关键字..."/><span class="el-icon-search" @click="getDeviceManagementList(1)"></span></div>
            <button class="add-btn" v-if="role==1" @click="showAndHide()">+添加设备</button>
            <button @click="refreshBtnDeviceList()">刷新<span class="el-icon-refresh" v-bind:class="myRotate==true?'myRotate':''"></span></button>
        </div>
        <div class="d_table-box verticalScroll">
            <table>
                <thead>
                <tr>
                    <th>城市</th>
                    <th>区域</th>
                    <th>河流</th>
                    <th>地点</th>
                    <th>IMEI</th>
                    <th>协议</th>
                    <th>在线状态</th>
                    <th>摄像机ip/端口/通道</th>
                    <th>在线时间</th>
                    <th>操作</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(lists,index) in deviceList" v-bind:key="index">
                    <td>{{lists.city}}</td>
                    <td>{{lists.county}}</td>
                    <td>{{lists.river}}</td>
                    <td>{{lists.address}}</td>
                    <td  style="width:200px;">{{lists.imei}}</td>
                    <td>{{lists.agreementType == 1 ? 'TCP':'UDP'}}</td>
                    <td v-bind:class="[lists.lsline=='在线'?'online':'outline']" >{{lists.lsline}}</td>
                    <td>{{lists.location}}/{{lists.port}}/{{lists.cameraChannel}}</td>
                    <td>{{lists.heartbeatTimeStr}}</td>
                   <td>
                        <img src="../../static/images/modify1.png" alt="" title="编辑" @click="editingEquipment(lists)">
                        <img src="../../static/images/del1.png" alt="" title="删除" class="del1" @click="deleteDeviceTip(lists.deviceId,lists.imei,index)" v-if="role==1">
                        <img src="../../static/images/chongqi.png" alt="" title="设备重启" class="restart" @click="DeviceRestart(lists.agreementType,lists.imei,)">
                    </td>
                </tr>
                </tbody>
            </table>
            <div class="reportPageBox" v-if="deviceListpage.length>1">
              <ul class="mini pageStyle">
                <li @click="getDeviceManagementList(1)">首页</li>
                <li class="pageNumber" v-for="x in deviceListpage" v-bind:key="x" v-bind:class="{'pageSelect':dev_page == x}" @click="getDeviceManagementList(x)">{{x}}</li>
                <li @click="getDeviceManagementList(pageTotal)">末页</li>
              </ul>
            </div>
            <div class="nodataTip" v-if="deviceListpage.length==0"><img style="width:400px;height:auto;" src="../../static/images/nodata.png"/></div>
        </div>
    </section>
    <!-- 添加设备 -->
    <div class="d_the-box" v-if="addPopu">
        <div class="d_t-box1" style="">
            <div class="d_tit1">添加设备 <span @click="showAndHide()">×</span></div>
            <ul>
                <li><label>城市：</label><div class="d_addput"><input v-model="d_city" type="text" placeholder="请输入城市"></div></li>
                <li><label>区域：</label><div class="d_addput"><input v-model="d_county" type="text" placeholder="请输入区域"></div></li>
                <li><label>河流：</label><div class="d_addput"><input v-model="d_rivers" type="text" placeholder="请输入河流"></div></li>
                <li><label>地点：</label><div class="d_addput"><input v-model="d_adrees" type="text" placeholder="请输入地点"></div></li>
                <li><label>IMEI：</label><div class="d_addput"><input v-model="d_imei" type="text" placeholder="请输入IMEI"></div></li>
                <li><label>协议：</label>
                  <div class="addeviceSelect">
                      <template>
                         <el-select v-model="d_agreementName" placeholder="请选择设备协议" class="d_mySelectAll" @change="selectAgreement">
                           <el-option v-for="item in agreementType" :key="item.id" :value="item.name"></el-option>
                         </el-select>
                      </template>
                  </div>
                </li>
                <li><label>摄像机：</label>
                  <div class="addeviceSelect">
                      <template>
                         <el-select v-model="d_cameraName" class="d_mySelectAll" @change="selectCamera">
                           <el-option v-for="item in cameraType" :key="item.id" :value="item.name"></el-option>
                         </el-select>
                      </template>
                  </div>
                </li>
                <li class="d_condit1" v-if="d_cameraValue == 1">
                  <label for="">IP：</label>
                  <div class="d_addput">
                    <input type="text" v-model="d_location" placeholder="请输入摄像机IP">
                    <input type="text" v-model="d_port" placeholder="摄像机端口号">
                    <input type="text" v-model="d_passageway" placeholder="通道">
                  </div>
                </li>
            </ul>
            <div class="d_jb-btn">
                <button class="d_jb-bg" @click="addDeciveList">确认</button>
                <button @click="showAndHide()">取消</button>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
  var self = "";
  var page = 1;
  var pageSize = 20;
  var loading = "";  //定义loading
  var opt = {
      lock: true,
      text: '数据获取中...',
      spinner: 'el-icon-loading',
      customClass:'loadingClass',
      background: 'rgba(0, 0, 0, 0.5)',
  }
  export default{
    name:'DeviceManagement',
    data(){
      return{
        treeList:{tree:'',newTree:'',newList:''},  //定义树形图数据
        role:"",                 //定义当前的账户的等级，1为超级管理员，其他为普通用户(超级管理员才拥有添加和删除设备权限)
        deviceList:[],           //定义当前设备列表数据
        deviceListpage:'',       //定义需要展示的分页
        searchTxt:'',            //定义搜索框内的值
        myRotate:false,          //定义正在刷新
        pageTotal:'',            //定义分页总数量
        dev_page:1,              //定义添加设备下选中的分页
        addPopu:'',              //定义添加设备弹窗的出现
        d_city:'',               //定义添加设备下的城市
        d_county:'',             //定义添加设备下的区域
        d_adrees:'',             //定义添加设备下的地点
        d_rivers:'',             //定义添加设备下的河流
        d_imei:'',               //定义添加设备下的imei
        d_location:'',           //定义录像机ip
        d_port:'',               //定义录像机端口号
        d_passageway:'',         //定义摄像机通道
        d_agreement:1,           //定义添加设备下的协议值(默认为1,1表示TCP 2表示UDP)
        d_agreementName:'TCP协议',      //定义添加设备下的协议名称
        agreementType: [
          {id:1,name:'TCP协议'},
          {id:2,name:'UDP协议'}
        ],
        cameraType:[{id:0,name:'无摄像机'},{id:1,name:'有摄像机'}],
        d_cameraName:"无摄像机",
        d_cameraValue:0
      }
    },
    created() {
      self = this;
      //headerChange: 是父组件指定的传数据绑定的函数，this.header:子组件给父组件传递的数据
      var parentData = {header:true,nav:2};
      self.$emit('headerChange',parentData);
      self.role = localStorage.getItem('role');
      self.getDeviceManagementList(page);    //获取设备列表
    },
    methods:{
      //刷新设备列表
      refreshBtnDeviceList:function(){
        loading = self.$loading(opt);   //打开请求loading
        self.myRotate = true;
        setTimeout(function() {
          self.getDeviceManagementList(page);   //获取设备列表数据
          self.myRotate = false;
          loading.close();
        }, 1500);
      },
      //================================================================设备列表管理开始=================================================
      //获取设备列表
      getDeviceManagementList:function (pages){
        self.dev_page = pages;page=pages;
        var url = "/api/device/getDeviceInfo";
        var userKey = localStorage.getItem("userKey");
        var data = {"page":pages,"pageSize":pageSize,condition:self.searchTxt,userKey:userKey};
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            if(result.data.dataList.length>0){
              var Result = result.data;
              self.deviceList = Result.dataList;
              self.deviceListDataReturn(Result);
            }else{
              self.deviceList = "";
              self.deviceListpage = "";
            }
          }else{
            self.$message.error(result.data.msg);
          }
        }).catch(function(erro){
        	console.log(erro);
        })
      },
      //分页处理函数
      deviceListDataReturn:function (Result){
        let pageData =[];
        var nawPage = Result.page;
        var allPage = Result.totalPage
        self.pageTotal = allPage;
        for (let k = 1; k <= allPage; k++){
        	if(nawPage<6){
        		if(k<=10){pageData.push(k);}
        	}else if(nawPage>=allPage-5){
            if(k>= allPage-10){pageData.push(k);}
        	}else{
        		if(k>nawPage-6 && k<nawPage+5){pageData.push(k);}
        	}
        }
        self.deviceListpage = pageData;
      },
      //删除设备提示
      deleteDeviceTip:function(listId,imei,index){
        var pupupTitle = "提示";    //弹窗标题
        var text = "1.您确定要删除设备号为:"+imei+"的设备吗？2.删除后，该设备与其他用户的绑定关系也会解除.";   //弹窗内容
        self.$confirm(text, pupupTitle, {confirmButtonText:'确定',cancelButtonText:'取消',type: 'warning'}).then(() => {self.deleteDeviceList(listId,imei,index);}).catch(() => {console.log("操作失败")});
      },
      //设备删除请求
      deleteDeviceList:function(listId,imei,index){
        var url = "/api/device/delDevice";
        var data = {"deviceId":listId};
        self.$http.post(url,data).then(function(result){
          console.log(result);
          if(result.data.flag){
            if(page>1 && index == 0){page = page-1;}
            self.$message({message:'删除成功！',type:'success'});
            self.getDeviceManagementList(page);   //重新获取设备列表
          }else{
            self.$message.error(result.data.msg);
          }
        }).catch(function(erro){
          self.$message.error(请求失败);
        })
      },
      //设备重新启动提示
      DeviceRestart:function(type,imei){
        var pupupTitle = "提示";    //弹窗标题
        var text = "1.您确定要重启设备号为:"+imei+"的设备吗？";   //弹窗内容
        self.$confirm(text, pupupTitle, {confirmButtonText:'确定',cancelButtonText:'取消',type: 'warning'}).then(() => {self.DeviceRestartBagin(type,imei);}).catch(() => {console.log("操作失败")});
      },
      //设备重新启动开始操作
      DeviceRestartBagin:function(type,imei){
        var url = "/api/device/resetAgreement";
        var data = {"type":type,"imei":imei,"userKey":localStorage.getItem("userKey")};
        var opt = {
            lock: true,
            text: '设备重启中...',
            spinner: 'el-icon-loading',
            customClass:'loadingClass',
            background: 'rgba(0, 0, 0, 0.5)',
        }
        const loading = self.$loading(opt);
        setTimeout(function(){
          self.$http.post(url,data).then(function(result){
            console.log(result);
            if(result.data.flag){
              self.$message({message:'设备重启操作成功！',type:'success'});
            }else{
              self.$message.error(result.data.msg);
            }
            loading.close();
          }).catch(function(erro){
            loading.close();
            self.$message.error(请求失败);
          })
        },3000)
      },
      //================================================================设备列表管理结束==================================================

      //===============================编辑设备开始==================================
      //打开或关闭添加设备弹窗
      showAndHide:function(){
        self.d_deciveId = "";
        self.d_city = "";
        self.d_county = "";
        self.d_adrees = "";
        self.d_rivers = "";
        self.d_imei = "";
        self.d_agreement = 1;
        self.d_agreementName = "TCP协议";
        self.d_cameraValue = 0;
        self.d_cameraName = "无摄像机";
        self.d_location = "";
        self.d_port = "";
        self.d_passageway = "";
        if(self.addPopu){self.addPopu=false;}else{self.addPopu=true;}
      },
      //添加/编辑报警方案 正则验证
      regularVerification:function(){
        if(self.d_city == ""){self.$message({message:'城市选择不得为空.',type:'warning'});return false;}
        if(self.d_county == ""){self.$message({message:'区域选择不得为空.',type:'warning'});return false;}
        if(self.d_rivers == ""){self.$message({message:'河流选择不得为空.',type:'warning'});return false;}
        if(self.d_adrees == ""){self.$message({message:'地点选择不得为空.',type:'warning'});return false;}
        if(self.d_imei == ""){self.$message({message:'设备编码不得为空.',type:'warning'});return false;}
        if(self.d_cameraValue == 1){
          if(self.d_location == ""){self.$message({message:'摄像机ip不得为空.',type:'warning'});return false;}
          if(self.d_port == ""){self.$message({message:'摄像机端口号不得为空.',type:'warning'});return false;}
        }
      },
      //编辑设备
      editingEquipment:function(lists){
         self.addPopu=true;
         self.d_deciveId = lists.deviceId;
         self.d_city = lists.city;
         self.d_county = lists.county;
         self.d_adrees = lists.address;
         self.d_rivers = lists.river;
         self.d_imei = lists.imei;
         self.d_agreement = lists.agreementType;
         self.d_agreementName = lists.agreementType == 1?"TCP协议":"UDP协议";
         self.d_cameraValue = lists.cameraState;
         self.d_cameraName = lists.cameraState == 0?"无摄像机":"有摄像机";
         self.d_location = lists.location;
         self.d_port = lists.port;
         self.d_passageway = lists.cameraChannel;
      },
      //添加设备开始
      addDeciveList:function(){
        var regular = self.regularVerification();     //正则验证
        if(regular == false){return false;}
        var url = "/api/device/editDevice";
        //重要的字段要做清除空格处理
        console.log(self.d_port);
        var data = {
          deviceId:self.d_deciveId,
          imei:self.d_imei.replace(/\s*/g,""),
          city:self.d_city.replace(/\s*/g,""),
          county:self.d_county.replace(/\s*/g,""),
          address:self.d_adrees.replace(/\s*/g,""),
          river:self.d_rivers.replace(/\s*/g,""),
          location:self.d_location,
          port:self.d_port,
          cameraChannel:self.d_passageway,
          agreementType:self.d_agreement,
          cameraState:self.d_cameraValue
        }
        console.log(data);
        self.$http.post(url,data).then(function(result){
          if(result.data.flag){
            self.$message({message:result.data.msg,type:'success'});
            self.addPopu = false;
            self.getDeviceManagementList(page);   //重新获取设备列表
            self.gettingTreeMapData();    //创建设备成功后重新获取树形图结构数据，并更新store和缓存中的数据
          }else{
            self.$message.error(result.data.msg);
          }
        }).catch(function(erro){
          console.log(erro);
        })
      },
      //添加设备下的 设备协议选择,点击打开协议列表
      selectAgreement:function(data){
        if(data == 'TCP协议'){self.d_agreement = 1;}else{self.d_agreement = 2;}
      },
      //摄像机绑定选择
      selectCamera:function(data){
        if(data == '无摄像机'){self.d_cameraValue=0;self.d_location="";self.d_port="";self.d_passageway=""}else{self.d_cameraValue = 1;}
      },
      //协议列表下点击选择协议
      clickSelectList:function(data,name){
        self.d_agreement = data;
        self.d_agreementName = name;
        self.selectAgre = false;
      },
      //=====================================================添加/编辑设备开始============================================================

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
        //localStorage不支持存储对象，所以这里先转成字符串，获取的时候再转成对象即可
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
