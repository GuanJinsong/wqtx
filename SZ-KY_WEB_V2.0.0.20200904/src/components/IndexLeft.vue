<!-- 首页左侧部分 -->
<template>
  <div class="title-left"
      v-loading.fullscreen.lock="loading"
      element-loading-text="拼命加载中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.3)"
  >
      <div class="monitor1">
          <div class="minTitle">
            <p>{{deviceName}}: 设备多参数实时监测</p>
            <img src="../../static/images/lin2.png" />
          </div>
          <article class="monitor1-body tabPart" id="tablePart">
            <div class="leftCascader">
              <el-cascader :options="options"
              v-model="cascaderValue"
              :checkStrictly="true"
              @change="cascader"
              placeholder="请选择你需要的设备..."
              popper-class="myCascader"
              :show-all-levels = "true"
              clearable></el-cascader>
              <span class="leftTime">日期：{{newTime}}</span>
            </div>
            <div class="leftTable horizontalScroll" id="getheight" v-bind:style="tableHeight">
              <table>
                  <thead>
                  <tr v-if="sparameHeadList.length>0">
                      <th>站点名称</th>
                      <th v-for="(heads,index) in sparameHeadList" v-bind:key="index">{{heads.parameterName}}</th>
                      <th>时间</th>
                  </tr>
                  </thead>
                  <tbody class="tboy">
                    <tr v-for="(lists,index) in parameList" v-bind:key="index">
                      <td>{{lists.deviceName}}</td>
                      <td v-for="(list,s_index) in lists.data" v-bind:key="s_index">{{list.value + list.unitl}}</td>
                      <td>{{lists.time}}</td>
                    </tr>
                  </tbody>
              </table>
            </div>
          </article>
          <!-- 自定义设备展示区域 -->
          <div class="bottom-nav">
              <ul>
                  <li v-for="(list,index) in followList" v-bind:key="index">
                      <template v-if="list.address !== ''">
                        <div class="Il_bottomTitle">{{list.address}} <img src="../../static/images/line3.png"/> <i class="Il_set el-icon-sort" @click="openAndCloseCustom(list.followDeviceId,list.detailedAddress,list.deviceId)"></i></div>
                        <div class="Il_bottomparam" v-for="(parameList,indx) in list.data" v-bind:key="indx">
                          <span>{{parameList.codeName}}</span><i>{{parameList.value}}</i>
                        </div>
                      </template>
                      <template v-else>
                        <div class="Il_bot" @click="openAndCloseCustom()">
                          <img src="../../static/images/eee.png"/>
                        </div>
                      </template>
                  </li>
              </ul>
          </div>
      </div>
      <div class="proportion1">
        <div class="minTitle">
          <p>{{deviceName}}: 设备参数报警统计</p>
          <img src="../../static/images/lin2.png" />
        </div>
        <div class="pieChartParent">
            <div id="pieChart" style="width:100%;height:100%;"></div>
        </div>
      </div>

      <!-- 添加自定义设备展示区域选择弹框 -->
      <div class="popParent" v-if="setPopu">
        <div class="popAfter" style="width:400px;">
            <div class="Il_popuTitle">特别关注设备选择</div>
            <div class="Il_popuListParant">
              <div class="Il_popuList">
                <label class="Il_popListLab">站点选择：</label>
                <div class="leftCascader" style="padding:5px 0px;">
                  <el-cascader :options="especially"
                  v-model="popCascaderValue"
                  :checkStrictly="true"
                  @change="popCascader"
                  placeholder="请选择你需要的设备..."
                  popper-class="myCascader"
                  :show-all-levels = "true"
                  clearable></el-cascader>
                </div>
              </div>
              <div class="Il_popuList">
                <label class="Il_popListLab">显示参数：</label>
                <div class="Il_checkBoxParent">
                  <el-checkbox-group v-model="checkList">
                    <el-checkbox v-for="(parm,index) in parameter" v-bind:key="index" :value="parm.code" :label="parm.codeName" @change="checkBoxSelect"></el-checkbox>
                  </el-checkbox-group>
                </div>
              </div>
              <div class="Il_popListTip">提示：最多只允许选择两个参数作为特别关注.</div>
              <div class="Il_sureBtn"><button @click="sureDeviceAndParameter()">确定</button> <button @click="openAndCloseCustom()">取消</button></div>
            </div>
        </div>
      </div>
  </div>
</template>

<script>
  var self = "";
  var wsTab = null;         //定义websocket是否连接
  var importWs1= null;   //定义重点关注第一台设备的websocket是否连接
  var importWs2= null;   //定义重点关注第二台设备的websocket是否连接
  var myPieChart = "";   //定义饼状图对象
  var optionPie = "";
  export default{
    name: 'IndexLeft',
    props:['heightWidth'],
    data () {
      return {
        loading:false,    //loading是否显示
        treeList:{tree:'',newTree:'',newList:''},  //定义树形图数据
        deviceImei:'',        //定义当前选中的设备imei
        deviceName:'',        //定义当前选中的设备名称
        options:[],           //定义设备选择下拉框的内容
        cascaderValue:[],        //定义select选中的值结果
        newTime:'',              //定义今天的日期
        sparameHeadList:[],      //定义表头数据
        parameList:[],           //定义参数列表数据
        tableHeight:{height:''},    //定义表格的初始高度，这里的高度是动态生成的
        tip:false,               //定义当前的实时连接已经接通
        nodata:false,            //定义实时列表没有取到数据提示窗口

        setPopu:false,           //定义 自定义特别关注设备弹窗是否显示
        especially:[],           //定义 自定义特别关注设备弹窗中的设备选择数据
        popCascaderValue:[],     //定义 自定义特别关注设备弹窗中的设备选中的结果
        followDeviceId:'',       //定义 自定义特别关注设备弹窗中当前选中的设备id
        followParamCode:[],      //定义 自定义特别关注设备弹窗中当前选中的设备参数code
        followIdBefor:'',        //打开自定义特别关注弹窗时，记录当前点击的设备id,便于修改特别关注设备时使用
        checkList: [],    //定义自定义特别关注设备弹窗内的checkbox选中的结果
        parameter:[{"codeName":'PH',"code":9},{"codeName":'溶解氧',"code":11},{"codeName":'浑浊度',"code":12},{"codeName":'电导率',code:14},{"codeName":'水温',code:13}],            //定义自定义设备显示区域当前选中的设备所对应的所有参数
        followList:[{address:'',detailedAddress:[],followDeviceId:'',data:[{codeName:'',value:''},{codeName:'',value:''}],deviceId:''},{address:'',detailedAddress:[],followDeviceId:'',data:[{codeName:'',value:''},{codeName:'',value:''}],deviceId:''}],           //定义 当前获取的到的特别关注设备列表
      }
    },
    watch: {
      // 监听浏览器窗口变化
      heightWidth: function (val) {
          setTimeout(function () {
            if(myPieChart !== ""){myPieChart.resize();}
            var height = document.getElementById("tablePart").offsetHeight-35+"px";
            self.tableHeight.height = height;
          }, 300)
      },
      //监听vuex中的存储的设备webSocketStatu码是否变化
      '$store.state.webSocketStatu'(data){
        console.log("监听触发了")
        if(data[1].socket == false){wsTab.close();}
      }
    },
    created() {self = this; },
    mounted(){
      self.$nextTick(()=>{ // 页面渲染完成后的回调
        self.getTime();  //获取当前时间
        self.gettingTreeMapData();
        self.initialState();   //定义初始表格没有数据时的状态（用空数据填充）
        self.getUserFollowDevice();   //获取当前用户重点关注的设备
        var height = document.getElementById("getheight").offsetHeight+"px";
        self.tableHeight.height = height;
      })
    },
    methods:{
      //定义初始表格没有数据时的状态（用空数据填充）
      initialState:function(){
        var ss = {data:[
            {parameterName:"",unitl:"",value:""},
            {parameterName:"",unitl:"",value:""},
            {parameterName:"",unitl:"",value:""},
            {parameterName:"",unitl:"",value:""},
            {parameterName:"",unitl:"",value:""},
          ],time:'',}
          for(var y=0;y<20;y++){self.parameList.unshift(ss);}
      },
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
           self.$message.error(erro.data.msg);
      	})
      },
      //重组设备数据的数据结构，新的数据结构将用于select三级下拉框选择
      dataReorganization:function(treList){
        let [newTree,newList] = [[],[]];
        for(let i=0;i<treList.length;i++){
           let list = {value:treList[i].city,label:treList[i].city,children:[]}
           let cityList = treList[i].cityList;
           for(let q=0;q<cityList.length;q++){
             let countylst = {value:cityList[q].county,label:cityList[q].county,children:[]}
             let countyList = cityList[q].countyList;
             for(let w=0;w<countyList.length;w++){
               let riverlst = {value:countyList[w].river,label:countyList[w].river,children:[]}
               let riverList = countyList[w].riverList;
               for(let e=0;e<riverList.length;e++){
                 let addresslst = {value:riverList[e].address,label:riverList[e].address}
                 let detailed = riverList[e].city+'/'+riverList[e].county+'/'+riverList[e].river+'/'+riverList[e].address;
                 let fffg = {detailed:detailed,data:riverList[e]};
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
        if(self.treeList.newList.length>0){
          self.options = self.treeList.newTree;      //定义用户设备选择选择栏数据
          self.especially = self.treeList.newTree;   //定义特别关注的设备选择栏数据
          var imei = self.treeList.newList[0].data.imei;
          var address = self.treeList.newList[0].data.address;
          var cascaderValue = self.treeList.newList[0].detailed;
          self.cascaderValue = cascaderValue.split('/');
          self.deviceImei = imei;
          self.deviceName = address;
          var x_deviceInfo = {imei:imei,deviceName:address};
          self.$store.dispatch('A_modifydeviceDate',x_deviceInfo);   //调用vuex
          //每次切换设备时要先判断之前的实时通讯是否已连接，若已连接，需要先关闭
          if(wsTab !== null){wsTab.close();wsTab=null;}  //关闭表格实时数据
          self.getDeviceInitialData(imei,address);
          self.getAlarmNum(imei);
        }
      },
      //设备多参数表格形式实时监控部分的的 设备选择
      cascader:function(data){
        //每次切换设备时要先判断之前的实时通讯是否已连接，若已连接，需要先关闭
        if(wsTab !== null){wsTab.close();wsTab=null;}  //关闭表格实时数据
        var address = data[0]+'/'+data[1]+'/'+data[2]+'/'+data[3];
        var addreName = data[3];
        if(self.treeList.newList.length>0){
          self.treeList.newList.forEach(function(arr,index){
            if(arr.detailed == address){
              console.log(arr.detailed);
              self.deviceImei = arr.data.imei;
              self.deviceName = addreName;
              var x_deviceInfo = {imei:arr.data.imei,deviceName:addreName};
              self.$store.dispatch('A_modifydeviceDate',x_deviceInfo);   //调用vuex
              self.getDeviceInitialData(arr.data.imei,addreName);
              self.getAlarmNum(arr.data.imei);
            }
          })
        }
      },
      //======================================自定义设备(重点关注设备)显示区域，设备选择开始==========================
      //获取当前用户重点关注哪些设备
      getUserFollowDevice:function(){
        var data = {userKey:localStorage.getItem('userKey')};
        var url = "/api/followdevice/getFollowDevice";
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            var rest = result.data.rows;
            var list = [{address:'',detailedAddress:[],followDeviceId:'',data:[{codeName:'',value:''},{codeName:'',value:''}],deviceId:''},{address:'',detailedAddress:[],followDeviceId:'',data:[{codeName:'',value:''},{codeName:'',value:''}],deviceId:''}];
            if(rest.length>0){
              rest.forEach(function(datas,index){
                list[index].address = datas.address;
                list[index].detailedAddress = [datas.city,datas.county,datas.river,datas.address];
                list[index].followDeviceId = datas.followDeviceId;
                list[index].deviceId = datas.deviceId;
                list[index].data = datas.data;
                self.followList = list;
                self.importantFollowWebSocket(datas.imei,index);   //实时获取数据开始
              })
            }
          }else{
            self.$message.error(result.data.msg);
          }
        }).catch(function(erro){
          self.$message.error("请求失败");
        })
      },
      //打开自定义设备选择窗口
      openAndCloseCustom:function(followIdBefor,detailedAddress,deviceId){
        if(self.setPopu){
          self.setPopu = false;
        }else{
          self.setPopu = true;
          self.popCascaderValue = detailedAddress;self.checkList = [];  //清空之前的操作记录
          self.followDeviceId = deviceId;
          self.followIdBefor = followIdBefor;
          //self.followParamCode = ""
          if(deviceId !== undefined){self.getFollowParameter(deviceId);}   //获取之前选中的设备参数
        }
      },
      //自定义重点关注设备弹窗内的设备选择
      popCascader:function(data){
        var address = data[0]+'/'+data[1]+'/'+data[2]+'/'+data[3];
        var addreName = data[3];
        if(self.treeList.newList.length>0){
          self.treeList.newList.forEach(function(arr,index){
            if(arr.detailed == address){
              self.followDeviceId = arr.data.deviceId;
              self.getParameter(arr.data.imei);
            }
          })
        }
      },
      //自定义显示区域弹窗内的设备选择后获取设备对应的参数
      getParameter:function(imei){
        var data = {imei:imei};
        var url = "/api/device/getParameter";
        self.$http.post(url,data).then(function(result){
        if(result.data.flag){
          console.log(result.data.rows)
          self.checkList = [];   //清空曾经选中过的参数
          self.parameter = result.data.rows;
        }else{
          self.$message.error(result.data.msg);
        }
        }).catch(function(erro){
          self.$message.error("请求失败");
        })
      },
      //参数选择，默认只允许选择两个参数
      checkBoxSelect:function(data){
        var check = self.checkList;
        if(data == true && check.length>=3){self.checkList.shift();}
        if(self.checkList.length>0){
          var codeData = [];
          self.checkList.forEach(function(arr,index){
            for(var m=0;m<self.parameter.length;m++){
              if(arr == self.parameter[m].codeName){
                var lis = {code:''};
                lis.code = self.parameter[m].code;
                codeData.push(lis);
              }
            }
          })
          self.followParamCode = codeData;
        }
      },
      //打开重点关注弹窗时获取当前设备哪些参数被选中了
      getFollowParameter:function(deviceId){
        var data = {userKey:localStorage.getItem('userKey'),deviceId:deviceId};
        var url = "/api/followdevice/getDeviceCode";
        self.$http.post(url,data).then(function(result){
          console.log(result)
        if(result.data.flag){
          var parmList = result.data.rows;
          self.parameter = result.data.rows;
          for(var i=0;i<parmList.length;i++){
            if(parmList[i].checked == true){
              self.checkList.push(parmList[i].codeName);
              var list = {code:''};list.code = parmList[i].code;
              self.followParamCode.push(list);
            }
          }
        }else{
          self.$message.error(result.data.msg);
        }
        }).catch(function(erro){
          self.$message.error("请求失败");
        })
      },
      //添加/编辑 重点关注的设备
      sureDeviceAndParameter:function(){
        if(self.popCascaderValue == ""){self.$message({message:'您还未选择设备.',type: 'warning'});return false;}
        if(self.checkList == "" || self.checkList.length !==2){self.$message({message:'请选择两个参数.',type: 'warning'});return false;}
        //新添加时followDeviceId传"" 空值，否则传设备的之前关注的设备id,deviceId是当前新关注的设备id
        var data = {followDeviceId:self.followIdBefor,userKey:localStorage.getItem('userKey'),deviceId:self.followDeviceId,data:self.followParamCode};
        var url = "/api/followdevice/editFollowDevice";
        console.log(data)
        self.$http.post(url,data).then(function(result){
          self.openAndCloseCustom();   //关闭弹窗
          if(result.data.flag){
            self.$message({message: '操作成功.',type: 'success'});
            self.getUserFollowDevice();
          }else{
            self.$message.error(result.data.msg);
          }
        }).catch(function(erro){
          console.log(erro);
          self.$message.error("请求失败");
        })
      },

      //重点关注设备实时请求开始
      importantFollowWebSocket:function(data,index){
        var url = self.$global.socketUrl+"/api/websocketfollow";
        if(index == 0){
          importWs1 = new WebSocket(url); //连接服务器
          importWs1.onopen = function(event){
            importWs1.send(data);
            var statu = {index:2,sta:true};  //index是索引，sta是状态，已连接为true,反之为false
            self.$store.dispatch('A_pageWebSocketStatu',statu);
          };
          importWs1.onmessage = function(event){self.followWebSocketReturn(event,index)};
          importWs1.onclose = function(event){var statu = {index:2,sta:false};self.$store.dispatch('A_pageWebSocketStatu',statu);};
          importWs1.onerror = function(event){var statu = {index:2,sta:false};self.$store.dispatch('A_pageWebSocketStatu',statu);};
        }else{
          importWs2 = new WebSocket(url); //连接服务器
          importWs2.onopen = function(event){
            importWs2.send(data);
            var statu = {index:3,sta:true};  //index是索引，sta是状态，已连接为true,反之为false
            self.$store.dispatch('A_pageWebSocketStatu',statu);
          };
          importWs2.onmessage = function(event){self.followWebSocketReturn(event,index)};
          importWs2.onclose = function(event){var statu = {index:3,sta:false};self.$store.dispatch('A_pageWebSocketStatu',statu);};
          importWs2.onerror = function(event){var statu = {index:3,sta:false};self.$store.dispatch('A_pageWebSocketStatu',statu);};
        }
      },
      followWebSocketReturn:function(result,index){
        var dataList = JSON.parse(result.data);
        var addList = dataList;
        var nowList = self.followList[index];
        if(addList.length>0){
          for(let i=0; i<addList.length;i++){
            var outList = addList[i].parameterName;
            for(var m=0;m<nowList.data.length;m++){
              if(outList == nowList.data[m].codeName){
                self.followList[index].data[m].value = addList[i].value
              }
            }
          }
        }
      },
      //======================================自定义设备(重点关注设备)显示区域，设备选择结束==========================
      //=======================================设备实时数据获取，并以表格形式展示由此开始=============================
      //获取当前的日期
      getTime:function(){
      	var time = new Date();
      	var yy = time.getFullYear(),MM = time.getMonth()+1,dd = time.getDate();
        if(MM<10){MM = "0"+MM}
        if(dd<10){dd = "0"+dd}
      	var txt = yy+"-"+MM+"-"+dd
        self.newTime = txt;
      },
      //获取设备的初始全部参数数据
      getDeviceInitialData:function(imei,addreName){
        let url = '/api/devicedata/getSensorData'
        let startDate = self.newTime+" 00:00:00";
        let endDate = self.newTime+" 23:59:59";
        let data = {"imei":imei,"startDate":startDate,"endDate":endDate,"page":1,"pageSize":20};
        self.initialState();    //先清空原来的数据
        self.loading = true;   //开启loading
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            let Result = result.data;
            if(result.data.dataList.length>0){
              let moreLength = 0,dataIndex = 0;
              result.data.dataList.forEach(function(arr,index){
                arr.time = arr.time.substr(11, 5);
                Object.assign(arr,{deviceName:addreName});   //将当前的选中的设备名称合并到当前循环的对象中，便于列表渲染
                let maxList = arr.data.length;
                if(maxList>moreLength){moreLength = maxList;dataIndex = index;}
              })

              //遍历当前获取到的所有数据，针对数据可能缺失的情况，对缺失部分采取空值补填
              let maxLong = result.data.dataList[dataIndex].data;
              result.data.dataList.forEach(function(arr,index){
                let thisListLength = arr.data.length;
                //1.判断某一条数据长度是否为0，如果是那么补空
                //2.判断当前遍历的这条数据长度是否大于0小于最大长度的数据
                if(thisListLength == 0){
                  let addList = maxLong;
                  addList.forEach(function(addArr,ind){
                    addArr.value = ""; addArr.unitl = "";
                  })
                  result.data.dataList[index].data = addList;
                }else if(moreLength>thisListLength>0){
                  let [arr1,arr2,addArry] = [[],[],[]];
                  //遍历最长的一条数据，并取出所有索引值
                  maxLong.forEach(function(longArr,longIndex){
                    arr1.push(longIndex);
                    //遍历当前这条数据，并取出字段值和最长一条数据的相同的索引值
                    arr.data.forEach(function(minArr,minIndex){
                      if(longArr.parameterName == minArr.parameterName){
                        arr2.push(longIndex);
                      }
                    })
                    //对比上面两步取到的索引数组，取出不相同的索引值
                    function getArrDifference(arr1, arr2) {
                      return arr1.concat(arr2).filter(function(v, i, arrd) {
                          return arrd.indexOf(v) === arrd.lastIndexOf(v);
                      });
                    }
                    addArry = getArrDifference(arr1, arr2);
                  })
                  //将上一步记录的不相同索引遍历，并根据索引在对应的数据处填补字段值为空的数据
                  if(addArry.length>0){
                    addArry.forEach(function(listAdd,ids){
                      let dataNall = {parameterName:"",unitl:"",value:""};
                      result.data.dataList[index].data.splice(listAdd, 0, dataNall);
                    })
                  }
                }
              })
              self.parameList = result.data.dataList;        //定义单设备列表参数数据集合
              self.sparameHeadList = maxLong;            //定义单设备查询表头数据（这里的表头时变化的，所以以数组的形式动态生成）
              self.webSocketData(imei);
            }else{
              self.sparameHeadList = []; //清空表头，因为可能存在历史数据
              self.webSocketData(imei);
            }
            self.loading = false;   //关闭正在加载的loading
          }
        }).catch(function(erro){
          self.loading = false;   //关闭正在加载的loading
          self.$message.error(erro.data.msg);
        })
      },

      //表格实时数据获取
      webSocketData:function(data){
        let url = self.$global.socketUrl+"/api/websocketmany"
        wsTab = new WebSocket(url); //连接服务器
        wsTab.onopen = function(event){console.log(event); wsTab.send(data);self.$store.dispatch('A_pageWebSocketStatu',{index:1,sta:true});};
        wsTab.onmessage = function(event){self.webSocketReturnFn(event);};
        wsTab.onclose = function(event){console.log(event); self.$store.dispatch('A_pageWebSocketStatu',{index:1,sta:false});};
        wsTab.onerror = function(event){self.$store.dispatch('A_pageWebSocketStatu',{index:1,sta:false});};


        // var url = self.$global.socketUrl+"/api/websocketmany"
        // wsTab = new WebSocket(url); //连接服务器
        // wsTab.onopen = function (event){
        //   if(event.currentTarget.readyState){
        //     wsTab.send(data);
        //     var statu = {index:1,sta:true};  //index是索引，sta是状态，已连接为true,反之为false
        //     self.$store.dispatch('A_pageWebSocketStatu',statu);
        //   }
        // };
        // wsTab.onmessage = function (event){self.webSocketReturnFn(event);};
        // wsTab.onclose = function (event){var statu = {index:1,sta:false};self.$store.dispatch('A_pageWebSocketStatu',statu);};
        // wsTab.onerror = function (event){var statu = {index:1,sta:false};self.$store.dispatch('A_pageWebSocketStatu',statu);};
      },

      //实时数据返回值处理
      webSocketReturnFn:function(result){
		    console.log(result);
        var dataList = JSON.parse(result.data);
        Object.assign(dataList,{deviceName:self.deviceName});   //将当前的选中的设备名称合并到当前循环的对象中，便于列表渲染
        var addList = dataList.data;
        var head = [];
        if(addList.length>0){
          for(let i = 0; i <addList.length; i++){
            var headList = addList[i].parameterName;
            head.push(headList);
          }
          if(self.sparameHeadList.length < head.length){
            self.sparameHeadList = head;
          }
          dataList.time = dataList.time.substr(11, 5);
          if(self.parameList.length>30){self.parameList.pop();}
          self.parameList.unshift(dataList);
        }
      },
      //=======================================设备实时数据获取，并以表格形式展示由此结束=============================
      //=========================================绘制环状图开始======================================
      //获取环状图所需要的数据
      getAlarmNum:function(imei){
        var url = '/api/alarmrecord/getAlarmNum'
        var data = {"imei":imei};
        self.$http.post(url, data).then(function (result) {
          console.log(result);
          var Result = result.data;
          if(Result.flag){
            if(Result.rows.length>0){
              var barData = [];
              var allValue = 0;
              for(var i=0;i<Result.rows.length;i++){
                var list = {value:'', name: ''};
                list.value = Result.rows[i].alarmNum;
                list.name = Result.rows[i].parametername;
                barData.push(list);
                allValue = allValue+Number(Result.rows[i].alarmNum);
              }
              self.drawPieLine(barData,allValue);
            }else{
              optionPie = "";
              if(myPieChart !== ""){myPieChart.clear();}  //渲染数据
            }
          }else{
            optionPie = "";
            if(myPieChart !== ""){myPieChart.clear();}  //渲染数据
          }
        }).catch(function(erro){
          self.$message.error(erro.data.msg);
          optionPie = "";
          if(myPieChart !== ""){myPieChart.clear();}  //渲染数据
        })
      },
      //开始绘制环形饼状图
      drawPieLine:function(barData,allValue){
        //有的话就获取已有echarts实例的DOM节点。
        myPieChart = self.$echarts.getInstanceByDom(document.getElementById('pieChart'));
        if (myPieChart == null) { // 如果不存在，就进行初始化。
           myPieChart = self.$echarts.init(document.getElementById('pieChart'));
        }
        optionPie = {
              tooltip: {
                  trigger: 'item',
                  formatter: '{a} <br/> {b} {c}({d}%)'
              },
              series:[
                  {
                      name: '报警总数',
                      type: 'pie',
                      selectedMode: 'single',
                      radius: [0, '25%'],
                      label: {
                          position: 'inner'
                      },
                      labelLine: {
                          show: false
                      },
                      tooltip: {
                          trigger: 'item',
                          formatter: '{b}({d}%)'
                      },
                      data: [
                          {
                            value:allValue,
                            name: "总次数\n"+allValue,
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
                      name: '参数报警次数占比',
                      type: 'pie',
                      startAngle: 180,
                      radius: ['35%', '55%'],
                      label: {
                          position:'outside',
                          formatter: ' {b|{b}:}{per|{d}%} ',
                          backgroundColor: 'rgba(0,0,0,0)',
                          alignTo:'none',
                          rich: {
                              a: {
                                  color: '#999',
                                  align: 'center',
                                  fontFamily:'pingfang-b'
                              },
                              b: {
                                  fontSize: 14,
                                  lineHeight: 40,
                                  fontFamily:'pingfang-b'
                              },
                              per: {
                                  color: '#eee',
                                  fontSize: 14,
                                  fontFamily:'pingfang-b'
                              }
                          }
                      },
                      itemStyle:{
                        color:function(params) {
                          var colorList = self.$global.colorList;
                              return colorList[params.dataIndex]
                           }
                      },
                      data: barData
                  }
              ]
        };
        myPieChart.setOption(optionPie,true); // 渲染图表
      },
      //=========================================绘制饼状图结束======================================

    },
    beforeDestroy() {
      if(wsTab !== null){wsTab.close();wsTab=null;}  //关闭表格实时数据
      if(importWs1 !== null){importWs1.close();}   //关闭第一个特别关注设备的实时获取
      if(importWs2 !== null){importWs2.close();}   //关闭第二个特别关注设备的实时获取
    }
  }
</script>

<style>

</style>
