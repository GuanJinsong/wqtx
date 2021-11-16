<!-- 监室配置 -->
<template>
  <div class="sys_rcParent">
    <div class="sys_rcSearchBox">
      <div class="sys_rcSelectput editMM">
        <el-select v-model="typeValue1" clearable placeholder="监室类型选择">
          <el-option v-for="item in roomType"
            :key="item.prisonTypeId" :label="item.prisonTypeName"
            :value="item.prisonTypeId">
          </el-option>
        </el-select>
      </div>
      <div class="sys_rcSelectput">
        <input type="text" v-model="searchWord" class="sys_rcSearch" placeholder="请输入监室" />
      </div>
      <button @click="getPrisonList(1)">查询</button>
      <button v-if="userRel==1" @click="openPopup()">添加</button>
      <button class="sys_rcBtn3" v-if="userRel==1" @click="deletePrisonBtn()">删除</button>
    </div>
    <div class="sys_rcTableParent dev_ManRight">
       <el-table ref="multipleTable" :data="roomList" @selection-change="handleSelectionChange" style="width: 100%; height: calc(100% - 55px); overflow-y: auto;">
         <el-table-column type="selection" label="序号" width="80"></el-table-column>
         <el-table-column prop="prisonName" label="房间"></el-table-column>
         <el-table-column prop="areaName" label="所属区域"></el-table-column>
         <el-table-column prop="prisonType.prisonTypeName" label="监室类型"></el-table-column>
         <el-table-column prop="storngIp" label="强电IP"></el-table-column>
         <el-table-column prop="weakIp" label="弱电IP"></el-table-column>
         <el-table-column label="强电状态">
           <template slot-scope="scope">
             <span v-if="scope.row.strongState==1" class="onState">在线</span>
             <span v-else class="outState">离线</span>
           </template>
         </el-table-column>
         <el-table-column label="弱电状态">
           <template slot-scope="scope">
             <span v-if="scope.row.weakState==1" class="onState">在线</span>
             <span v-else class="outState">离线</span>
           </template>
         </el-table-column>
         <el-table-column  label="操作" v-if="userRel==1">
           <template slot-scope="scope">
             <span class="Edit el-icon-edit-outline" title="编辑" @click="editRoomConfig(scope.row)"></span>
             <span class="Del el-icon-delete" title="删除" @click="deletePrison(scope.row)"></span>
           </template>
         </el-table-column>
       </el-table>
       <pagingComponent />
    </div>

    <!-- 监室配置 设置弹窗 -->
    <div class="poupParnet" v-if="alarmListPup">
    	<div class="poupParnetAfter" style="width:700px;">
    		<div class="poupTitle"><div class="poupTitleAfter"><h6>监室配置</h6><span @click="alarmListPup = false">×</span></div></div>
    		<div class="pubCenter">
          <div class="sys_rcPupTitle">
            <p class="sys_rcPupTitS">监室号</p>
            <input type="text" v-model="typeName" placeholder="请输入监室名称"/>
            <p class="sys_rcPupTitS1">监室类型</p>
            <div class="sys_rcSelectput editMM" style="width:150px;">
              <el-select v-model="typeValue2" @change="sysRoomTypeSelt" placeholder="监室类型选择">
                <el-option v-for="item in roomType"
                  :key="item.prisonTypeId" :label="item.prisonTypeName"
                  :value="item.prisonTypeId">
                </el-option>
              </el-select>
            </div>
          </div>
          <!-- 强电部分 -->
          <div class="sys_rcPupTitleSmall">
            <div class="sys_rcPupLeft"><p>强电通道</p>
              <div class="editMM">
                <el-select v-model="strongIpVal" @change="strongIpSelect" placeholder="强电ip选择">
                  <el-option v-for="item in strongIps"
                    :key="item.equipmentInfoId" :label="item.equipmentIp"
                    :value="item.equipmentInfoId">
                  </el-option>
                </el-select>
              </div>
            </div>
            <button v-if="prisonId !==''" class="sys_rcPupSbtn" @click="debindStrongCurrent()">强电一键解绑</button>
          </div>
          <div class="rcPupTbParent">
            <ul class="rcPupTableHead"><li v-for="lit in 4"><span>通道</span><p>通道名称</p></li></ul>
            <ul class="rcPupTablebody">
              <li v-for="(lits,index) in strongCurt" v-bind:key="index">
                <div class="editMM2 rcSelect">
                  <el-select :value="lits.strongNum" clearable
                  @change="((event)=>{strRoomPassWaySelt(event,index,lits)})" placeholder="">
                    <el-option v-for="(item,indt) in s_passWayNum" :key="indt" :label="item.num" :value="item.num">
                      <span>{{item.num}}</span> <span v-if="item.ste" class="rcRight el-icon-check"></span>
                    </el-option>
                  </el-select>
                </div>
                <input type="text" v-model="lits.prisonJackName" readonly="readonly"/>
              </li>
            </ul>
          </div>
          <!-- 弱电部分 -->
          <div class="sys_rcPupTitleSmall">
            <div class="sys_rcPupLeft"><p>弱电通道</p>
              <div class="editMM">
                <el-select v-model="weakIpVal" @change="weakIpSelect" placeholder="弱电ip选择">
                  <el-option v-for="item in weakIps" :key="item.equipmentInfoId" :label="item.equipmentIp"
                    :value="item.equipmentInfoId">
                  </el-option>
                </el-select>
              </div>
            </div>
            <button v-if="prisonId !==''" class="sys_rcPupWbtn" @click="debindWeakCurrent()">弱电一键解绑</button>
          </div>
          <div class="rcPupTbParent">
            <ul class="rcPupTableHead"><li v-for="lit in 4"><span>通道</span><p>通道名称</p></li></ul>
            <ul class="rcPupTablebody"><li v-for="(lits,index) in weakCurt" v-bind:key="index">
                <div class="editMM2 rcSelect">
                  <el-select :value="lits.weakNum" clearable @change="((event)=>{weakRoomPassWaySelt(event,index,lits)})" placeholder="">
                    <el-option v-for="(item,intt) in w_passWayNum" :key="intt" :label="item.num" :value="item.num">
                      <span>{{item.num}}</span> <span v-if="item.ste" class="rcRight el-icon-check"></span>
                    </el-option>
                  </el-select>
                </div>
                <input type="text" v-model="lits.prisonJackName" readonly="readonly"/></li>
            </ul>
          </div>
        </div>
    		<div class="poupSure">
    			<button @click="alarmListPup = false">取消</button>
    			<button @click="saveRoomConfig()">确认</button>
    		</div>
    	</div>
    </div>
  </div>
</template>

<script>

import pagingComponent from '../../components/publicComponemts/pagingComponent.vue'

  var opt = {
        lock: true,
        text: '加载中...',
        spinner: 'el-icon-loading',
        customClass:'loadingClass',
        background: 'rgba(0, 0, 0, 0.5)',
    }
  var loading = "";
  var page = 1;
  export default{
    name:"Sys-RoomConfig",
    components: {
      pagingComponent: pagingComponent
    },
    data(){
      return{
        userRel:localStorage.getItem("rel"),  //账户身份标识，超级管理员1
        roomType: [],  //监室类型选择的可选值
        typeValue1: '',   //监室类型值
        typeValue2: '',   //监室类型值
        areaSelectId:[],  //当前选中的监室列表id
        searchWord:"",   //搜索的内容
        areaList:[],  //监区列表
        areaIdList:[],  //收集所有监区的id
        roomList:[],  //监室类型列表
        prisonId:"",   //当前正在编辑的监室id
        alarmListPup:false,   //监室类型编辑弹窗
        typeName:"",   //编辑时监室名称
        strongCurt:[],  //强电列表
        weakCurt:[],    //弱电列表
        copyStrongCurt:[],  //拷贝编辑开始时的强电列表
        copyWeakCurt:[],    //拷贝编辑开始时的弱电列表
        copyStrongIpVal:'', //拷贝编辑开始时的强电ip
        copyWeakIpVal:'',   //拷贝编辑开始时的弱电ip
        strongIpVal:'',  //强电选中的通道ip
        strongIps:[],  //强电通道ip
        weakIpVal:'',  //弱电选中的通道ip
        weakIps:[],  //弱电通道ip
        s_passWayNum:[],   //强电ip通道可选值
        w_passWayNum:[],   //弱电ip通道可选值,
        nowPage: 1 // 页数
      }
    },
    created() {
      this.getRoomTypeList();   //获取监室类型数据
      this.getAllArea();  //获取所有的监区
      this.getStorngIp(); //获取强电可用ip
      this.getWeakIp();  //获取弱电可用ip
    },
    mounted() {
      this.$eventBus.$on("updataPage",this.updataPages);
    },
    methods:{
      //根据分页子组件返回的数据请求新的报警记录数据
      updataPages:function(page){
        this.nowPage = page;
        this.getPrisonList(page);
      },
      //监室类型编辑弹窗开启/关闭
      openPopup:function(){
        this.typeValue2= "";   //监室类型值
        this.prisonId="";   //当前正在编辑的监室id
        this.typeName="";   //编辑时监室名称
        this.strongCurt=[];  //强电列表
        this.weakCurt=[];  //弱电列表
        this.strongIpVal='';  //强电选中的通道ip
        this.weakIpVal='';  //弱电选中的通道ip
        this.alarmListPup = true;
      },
      //表格多选
      handleSelectionChange:function(val){
        this.areaSelectId = val;
      },
      //获取页面上左侧所有的监区
      getAllArea:function(){
        var self = this;
        var url = "/sup/prisonDistrict/query";
        var data = "";
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.areaList = result.data.data;
            for(var i=0;i<result.data.data.length;i++){self.areaIdList.push(result.data.data[i].prisonDistrictId)};
            self.getPrisonList(1);
          }else{
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
          self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      //获取监室列表
      getPrisonList:function(page){
        var self = this;
        var url = "/sup/prison/queryPage";
        var data = {prisonTypeId:self.typeValue1,prisonName:self.searchWord,current:page,size:20};   //传入的prisonTypeId为空时将查询所有的
        loading = self.$loading(opt);
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
             var rustList = result.data.data.records;
             for(var i=0;i<rustList.length;i++){
               var addWord = {areaName:"未分配监区",storngIp:"---",weakIp:"---",strongState:0,weakState:0};
               var areaId = rustList[i].prisonDistrictId;
               var index = -1;
               //判断这里循环得到的监区id和上面得到的areaIdList监区id集合中是否有匹配的
               if(areaId !== null){index = self.areaIdList.indexOf(areaId);}
               // 如果匹配上那么设置addWord.areaName为对应的监区名字
               if(index !== -1){addWord.areaName = self.areaList[index].prisonDistrictName;}
               //判断强电是否null,如果是则不作处理
               if(rustList[i].equipmentStrong !== null){
                 addWord.storngIp = rustList[i].equipmentStrong.equipmentIp;
                 addWord.strongState = rustList[i].equipmentStrong.state;
               }
               //判断弱电是否null,如果是则不作处理
               if(rustList[i].equipmentWeak !== null){
                 addWord.weakIp = rustList[i].equipmentWeak.equipmentIp;
                 addWord.weakState = rustList[i].equipmentWeak.state;
               }
               Object.assign(rustList[i],addWord);
             }
             self.$eventBus.$emit('deviceListDataReturn',result.data.data);  //向分页组件传递分页数据
             self.roomList = rustList; loading.close();
          }else{
            self.$message({message:result.data.msg,type:'warning'});
            loading.close();  self.roomList = [];
          }
        }).catch(function(){
          loading.close();  self.roomList = [];
          self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      //单个监室删除
      deletePrison:function(res){
        var self = this;
        self.$confirm('是否删除此监室?', '提示', {confirmButtonText: '确定',cancelButtonText: '取消',type: 'warning'
          }).then(() => {
            var url = "/sup/prison/delete"; var data = {prisonId:res.prisonId};
            self.$http.post(url,data).then(function(result){
              if(result.data.flag){
                console.log(result);
                self.$message({type: 'success',message: '操作成功!'});
                self.getPrisonList(1);   //重新获取数据
              }else{
                self.$message({message:result.data.msg,type:'warning'});
              }
            }).catch(function(erro){
              console.log(erro)
              self.$message.error(erro.data.msg);
            })
          }).catch(() => {});
      },
      //批量监室删除
      deletePrisonBtn:function(){
        if(self.areaSelectId.length ==0){self.$message({message:"请至少选择一条数据",type:'warning'});return false;}
        self.$confirm('是否删除选中的所有监室?', '提示', {confirmButtonText: '确定',cancelButtonText: '取消',type: 'warning'
          }).then(() => {
            var url = "/sup/prison/delete"; var data = {prisonId:self.areaSelectId};
            self.$http.post(url,data).then(function(result){
              if(result.data.flag){
                console.log(result);
                self.$message({type: 'success',message: '操作成功!'});
                self.getPrisonList(1);   //重新获取数据
              }else{
                self.$message({message:result.data.msg,type:'warning'});
              }
            }).catch(function(erro){
              console.log(erro)
              self.$message.error(erro.data.msg)
            })
          }).catch(() => {});
      },
      //================================监室配置弹窗模块开始==================================
      //获取监室类型数据
      getRoomTypeList:function(){
        let self = this;
        let [url,data] = ['/sup/prisontype/query',{current:1,size:100}];
        const loading = self.$loading(opt);
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            for(let i=0;i<result.data.data.records.length;i++){
              let passWay = result.data.data.records[i].prisonjacks;
              let [passArry,passArry1] = [[],[]];
              for(let m=0;m<passWay.length;m++){
                if(passWay[m].jackType==1){
                  //自定义一个强电通道编号strongNum字段和强电通道strongNumId字段,
                  //注意哦，这里的strongNum和我们取到的数据里的prisonJackNumber,都是叫通道号，但是实际作用与意义不同
                  //strongNum虽然是我们自定义创建的，但是在我们在进行 监室配置 时根据选中的强电ip而得到的可用通道值
                  //prisonJackNumber是我们在创建 监室类型 时自动创建的初始编号，所以在监室配置时我们并不使用这个值，注意区分，不要混淆
                  let aa = {strongNum:"",strongNumId:""};
                  Object.assign(passWay[m],aa); passArry.push(passWay[m]);
                }else if(passWay[m].jackType==4){
                  //自定义一个弱电通道编号weakNum字段和弱电通道weakNumId字段
                  //注意哦，这里的weakNum和我们取到的数据里的prisonJackNumber,都是叫通道号，但是实际作用与意义不同
                  //weakNum虽然是我们自定义创建的，但是在我们在进行 监室配置 时根据选中的弱电ip而得到的可用通道值
                  //prisonJackNumber是我们在创建 监室类型 时自动创建的初始编号，所以在监室配置时我们并不使用这个值，注意区分，不要混淆
                  let bb = {weakNum:"",weakNumId:""};
                  Object.assign(passWay[m],bb); passArry1.push(passWay[m]);
                }
              }
              let [newWord,newWord1] = [{strongList:passArry},{weakList:passArry1}];
              Object.assign(result.data.data.records[i],newWord,newWord1);  //将新建立的对象合并到原来的循环对象中
            }
            self.roomType = result.data.data.records;
            loading.close();
          }else{
            self.$message({message:result.data.msg,type:'warning'});
            loading.close();self.roomType = [];
          }
        }).catch(function(erro){
          loading.close();self.roomType = [];
          self.$message.error(erro.data.msg);
        })
      },
      //监室配置弹窗中监室类型选择
      sysRoomTypeSelt:function(id){
        var self = this;
        var typeList = self.roomType;
        // 第一步:选择完监室类型后,根据监室类型所配置的通道设备,在对应的强弱电表格区展示出来
        for(var i=0;i<typeList.length;i++){
          if(typeList[i].prisonTypeId == id){
            self.strongCurt= typeList[i].strongList; //强电列表
            self.weakCurt= typeList[i].weakList;  //弱电列表
          }
        }
        if (self.prisonId !== "") {
          //第二步:强电 判断当前的强电输入框是否选中了值，如果选中了，获取该ip对应的可用通道
          self.strongIpVal = "";
          self.s_passWayNum = [];
          self.debindStrongCurrentRequest();
          //第三步:弱电 判断当前的弱电输入框是否选中了值，如果选中了，获取该ip对应的可用通道
          self.weakIpVal = "";
          self.w_passWayNum = [];
          self.debindWeakCurrentRequest();
        }
      },
      //----------------强电相关开始--------------------------
      //获取可用的强电设备ip
      getStorngIp:function(){
        let self = this;
        let [url,data] = ['/sup/equipmentInfo/queryType',{equipmentType:1}];
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            if(result.data.data.length>0){
              self.strongIps =result.data.data;
            }else{self.strongIps = [];}
          }else{
            self.strongIps = [];
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
          self.strongIps = [];
          self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      //强电ip点击获取该ip对应的所有强电通道
      strongIpSelect:function(ipIds){
        let self = this;
          let [url,data] = ['/sup/jackInfo/queryJackNo',{equipmentType:1,equipmentId:ipIds}];
          self.$http.post(url,data).then(function(result){
            console.log(result)
            if(result.data.flag){
              let [leng,list] = [result.data.data,[]];
              let stor = JSON.parse(JSON.stringify(self.strongCurt));
              if(leng.length>0){
                for(let i=0;i<leng.length;i++){
                  let lit = {id:leng[i].jackId,num:leng[i].jackNumber,ste:false};
                  list.push(lit);
                }
                self.s_passWayNum=list;  //这里将点击强电下拉框时得到的通道数据进行赋值
                //先判断强电通道是否存在真实有效的数据(默认假数据不算)
                //在切换通道ip时，无论当前设备是否有对应的通道，都应该被现在选中的ip通道进行覆盖，这样才能保证ip与通道的正确绑定
                //在切换ip前如果表格中的设备存在对应的通道号，遍历表格中的数据，并且根据索引值替换掉表格中的数据，
                //如果选中的ip下可用的通道号不足以填补表格中的所有数据，那么清空表格中的通道编号以及编号id
                for(let i=0;i<stor.length;i++){
                  if(self.s_passWayNum.length>i){
                    stor[i].strongNum = self.s_passWayNum[i].num;
                    stor[i].strongNumId = self.s_passWayNum[i].id;
                    self.s_passWayNum[i].ste = true;
                  }else{
                    stor[i].strongNum = "";
                    stor[i].strongNumId = "";
                  }
                }
                self.strongCurt = stor;
              }else{
                self.s_passWayNum = [];   //如果选中ip后获取的ip可用通道数量为0，那么清空通道下拉框的可选值
                for(let i=0;i<stor.length;i++){stor[i].strongNum = "";stor[i].strongNumId = "";}
                self.strongCurt = stor;
              }
            }else{
              self.$message({message:result.data.msg,type:'warning'});
            }
          }).catch(function(erro){
            self.$message.error(erro.data.msg);
            console.log(erro)
          })
      },
      // 强电选择完通道ip后，点击强电表格上的下拉框选择需要的通道
      strRoomPassWaySelt:function(num,index,res){
        //这里的num是通道下拉选择框选中只之后的值，res是当前表格列表正在操作的这一项的全部数据
        //首先判断当前的操作是什么，当num=""时表示点击的是下拉框的清空ico,此时是要进行通道解绑操作具体的请看else里面的业务逻辑
        //当num !=="" 时表示当前是进行通道绑定的操作，选择过的通道编号我们在下拉框中给与勾勾的选中标识，反之没有这种标识
        if(num !== ""){
          let tt = res.strongNum;
          if(tt !==""){
            for(let m=0;m<this.s_passWayNum.length;m++){
              if(tt == this.s_passWayNum[m].num){this.s_passWayNum[m].ste=false;}
              if(num == this.s_passWayNum[m].num){
                this.s_passWayNum[m].ste=true;
                this.strongCurt[index].strongNumId = this.s_passWayNum[m].id;
              }
            }
          }else{
            for(let m=0;m<this.s_passWayNum.length;m++){
              if(num == this.s_passWayNum[m].num){
                this.s_passWayNum[m].ste=true;
                this.strongCurt[index].strongNumId = this.s_passWayNum[m].id;
              }
            }
          }
          //获取到选中的值后，先清空表格中可能一样的通道值
          for(let n=0;n<this.strongCurt.length;n++){
            if(num == this.strongCurt[n].strongNum){this.strongCurt[n].strongNum="";this.strongCurt[n].strongNumId=""}
          }
          //然后再赋值
          this.strongCurt[index].strongNum = num;
        }else{
          let self = this;
          self.$confirm('是否解除当前通道绑定?', '解绑提示', {confirmButtonText: '确定',cancelButtonText: '取消',type: 'warning'
            }).then(() => {
              let [url,data] = ['/sup/jackInfo/updateJackNo',{"prisonId":'',jackType:null,jackId:res.strongNumId}];
              self.$http.post(url,data).then(function(result){
                console.log(result)
                if(result.data.flag){
                  self.$message({message:'解绑成功',type: 'success'});
                  self.getStorngIpWay(self.strongIpVal);  //获取强电ip对应的通道
                  self.strongCurt[index].strongNum = ""; //清空当前表格内的通道值
                  self.strongCurt[index].strongNumId = ""; //清空当前表格内的通道id
                  self.getPrisonList(this.nowPage); //解绑成功后，重新获取监室配置列表信息(更新监室列表所携带的通道信息)
                }else{
                  self.$message({message:result.data.msg,type:'warning'});
                }
              }).catch(function(erro){
                 console.log(erro)
              })
          }).catch(() => {});
        }
      },
      //确认强电是否一键解绑
      debindStrongCurrent:function(){
        let self = this;
        self.$confirm('是否确定强电通道一键解绑?', '解绑提示', {confirmButtonText: '确定',cancelButtonText: '取消',type: 'warning'
          }).then(() => {
            let [url,data] = ['/sup/jackInfo/updateJackNo',{"prisonId":self.prisonId,jackType:1,jackId:null}];
            self.$http.post(url,data).then(function(result){
              console.log(result)
              if(result.data.flag){
                self.$message({message:result.data.msg,type: 'success'});
                let list = self.strongCurt;
                for(let i=0;i<list.length;i++){
                    self.strongCurt[i].strongNum = ""; //清空当前表格内的通道值
                    self.strongCurt[i].strongNumId = ""; //清空当前表格内的通道id
                }
                self.getStorngIpWay(self.strongIpVal);  //获取强电ip对应的通道
                self.getPrisonList(this.nowPage); //解绑成功后，重新获取监室配置列表信息(更新监室列表所携带的通道信息)
              }else{
                self.$message({message:result.data.msg,type:'warning'});
              }
            }).catch(function(erro){
               console.log(erro)
            })
          }).catch(() => {});
      },
      //强电通道一键解绑
      debindStrongCurrentRequest:function(){
        let self = this;
        let [url,data] = ['/sup/jackInfo/updateJackNo',{"prisonId":self.prisonId,jackType:1,jackId:null}];
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            let list = self.strongCurt;
            for(let i=0;i<list.length;i++){
                self.strongCurt[i].strongNum = ""; //清空当前表格内的通道值
                self.strongCurt[i].strongNumId = ""; //清空当前表格内的通道id
            }
            self.getStorngIpWay(self.strongIpVal);  //获取强电ip对应的通道
            self.getPrisonList(this.nowPage); //解绑成功后，重新获取监室配置列表信息(更新监室列表所携带的通道信息)
          }else{
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
           console.log(erro)
        })
      },

      //----------------强电相关结束--------------------------

      //----------------弱电相关开始--------------------------
      //获取可用的弱电设备ip
      getWeakIp:function(){
        let self = this;
        let [url,data] = ['/sup/equipmentInfo/queryType',{equipmentType:4}];
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            if(result.data.data.length>0){
              self.weakIps =result.data.data;
            }else{self.weakIps = [];}
          }else{
            self.weakIps = [];
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
          self.weakIps = [];self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      //弱电ip点击获取该ip对应的所有弱电通道
      weakIpSelect:function(ipIds){
        let self = this;
          let [url,data] = ['/sup/jackInfo/queryJackNo',{equipmentType:4,equipmentId:ipIds}];
          self.$http.post(url,data).then(function(result){
            console.log(result)
            if(result.data.flag){
              let [leng,list] = [result.data.data,[]];
              let weak = JSON.parse(JSON.stringify(self.weakCurt));
              if(leng.length>0){
                for(let i=0;i<leng.length;i++){
                  let lit = {id:leng[i].jackId,num:leng[i].jackNumber,ste:false};
                  list.push(lit);
                }
                self.w_passWayNum=list;  //这里将点击弱电下拉框时得到的通道数据进行赋值
                console.log(list)
                //先判断弱电通道是否存在真实有效的数据(默认假数据不算)
                //在切换通道ip时，无论当前设备是否有对应的通道，都应该被现在选中的ip通道进行覆盖，这样才能保证ip与通道的正确绑定
                //在切换ip前如果表格中的设备存在对应的通道号，遍历表格中的数据，并且根据索引值替换掉表格中的数据，
                //如果选中的ip下可用的通道号不足以填补表格中的所有数据，那么清空表格中的通道编号以及编号id
                for(let i=0;i<weak.length;i++){
                  if(self.w_passWayNum.length>i){
                    weak[i].weakNum = self.w_passWayNum[i].num;
                    weak[i].weakNumId = self.w_passWayNum[i].id;
                    self.w_passWayNum[i].ste = true;
                  }else{
                    weak[i].weakNum = "";
                    weak[i].weakNumId = "";
                  }
                }
                self.weakCurt = weak;
                console.log(weak)
              }else{
                self.w_passWayNum = [];  //当取到的通道值为空时，清空通道下拉框可选值
                for(let i=0;i<weak.length;i++){weak[i].weakNum = "";weak[i].weakNumId = "";}
                self.weakCurt = weak;
              }
            }else{
              self.$message({message:result.data.msg,type:'warning'});
            }
          }).catch(function(erro){
            self.$message.error(erro.data.msg);
            console.log(erro)
          })
      },
      // 弱电选择完通道ip后，为每个设备配置一个通道
      weakRoomPassWaySelt:function(num,index,res){
        //首先判断当前的操作失是什么，当num=""时表示点击的是下拉框的清空ico,此时是要进行通道解绑操作具体的请看else里面的业务逻辑
        //当num !=="" 时表示当前是进行通道绑定的操作，选择过的通道编号我们在下拉框中给与勾勾的选中标识，反之没有这种标识
        if(num !== ""){
          let tt = res.weakNum;
          if(tt !==""){
            for(let m=0;m<this.w_passWayNum.length;m++){
              if(tt == this.w_passWayNum[m].num){this.w_passWayNum[m].ste=false;}
              if(num == this.w_passWayNum[m].num){
                this.w_passWayNum[m].ste=true;
                this.weakCurt[index].weakNumId = this.w_passWayNum[m].id;
              }
            }
          }else{
            for(let m=0;m<this.w_passWayNum.length;m++){
              if(num == this.w_passWayNum[m].num){
                this.w_passWayNum[m].ste=true;
                this.weakCurt[index].weakNumId = this.w_passWayNum[m].id
              }
            }
          }
          for(let n=0;n<this.weakCurt.length;n++){
            if(num == this.weakCurt[n].weakNum){this.weakCurt[n].weakNum="";this.weakCurt[n].weakNumId=""}
          }
          this.weakCurt[index].weakNum = num;
        }else{
          let self = this;
          self.$confirm('是否解除当前通道绑定?','解绑提示',{confirmButtonText:'确定',cancelButtonText:'取消',type:'warning'
            }).then(() => {
              let [url,data] = ['/sup/jackInfo/updateJackNo',{"prisonId":'','jackType':null,'jackId':res.weakNumId}];
              self.$http.post(url,data).then(function(result){
                console.log(result)
                if(result.data.flag){
                  self.$message({message:'解绑成功',type: 'success'});
                  self.weakCurt[index].weakNum = ""; //清空当前表格内的通道值
                  self.weakCurt[index].weakNumId=""; ////清空当前表格内的通道id
                  self.getWeakIpWay(self.weakIpVal);  //获取弱电ip对应的通道
                  self.getPrisonList(this.nowPage); //解绑成功后，重新获取监室配置列表信息(更新监室列表所携带的通道信息)
                }else{
                  self.$message({message:result.data.msg,type:'warning'});
                }
              }).catch(function(erro){
                 console.log(erro)
              })
          }).catch(() => {});
        }
      },
      //确认弱电是否一键解绑
      debindWeakCurrent:function(){
        let self = this;
        self.$confirm('是否确定弱通道一键解绑?','解绑提示',{confirmButtonText:'确定',cancelButtonText:'取消',type:'warning'
          }).then(() => {
            let [url,data] = ['/sup/jackInfo/updateJackNo',{"prisonId":self.prisonId,jackType:4,jackId:null}];
            self.$http.post(url,data).then(function(result){
              console.log(result)
              if(result.data.flag){
                self.$message({message:'解绑成功',type: 'success'});
                self.getWeakIpWay(self.weakIpVal);  //获取弱电ip对应的通道
                let list = self.weakCurt;
                for(let i=0;i<list.length;i++){self.weakCurt[i].weakNum = "";self.weakCurt[i].weakNumId=""} //清空当前表格内的通道值
                self.getPrisonList(this.nowPage); //解绑成功后，重新获取监室配置列表信息(更新监室列表所携带的通道信息)
              }else{
                self.$message({message:result.data.msg,type:'warning'});
              }
            }).catch(function(erro){
               console.log(erro)
            })
          }).catch(() => {});
      },
      //弱电一键解绑
      debindWeakCurrentRequest:function(){
        let self = this;
        let [url,data] = ['/sup/jackInfo/updateJackNo',{"prisonId":self.prisonId,jackType:4,jackId:null}];
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.getWeakIpWay(self.weakIpVal);  //获取弱电ip对应的通道
            let list = self.weakCurt;
            for(let i=0;i<list.length;i++){self.weakCurt[i].weakNum = "";self.weakCurt[i].weakNumId=""} //清空当前表格内的通道值
            self.getPrisonList(this.nowPage); //解绑成功后，重新获取监室配置列表信息(更新监室列表所携带的通道信息)
          }else{
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
           console.log(erro)
        })
      },
      //----------------弱电相关结束--------------------------

      // 保存当前弹窗内的设置
      saveRoomConfig:function(){
        let self = this;
        let [list,strCurt,wakCurt] = [[],self.strongCurt,self.weakCurt];
        let [data,url] = ['',''];
        //先判断是否存在prisonId，如果存在则表示这是编辑操作，反之表示这是新添加操作
        console.log(self.strongCurt);
        if(self.prisonId !== ""){
          //强电数据
          let strState = 0;  //判断强电部分是否有选择合适的通道，如果全部没有选择通道那么下面的equipmentStrongId传空值
          for(let i=0;i<strCurt.length;i++){
            let lit = {'jackId':strCurt[i].strongNumId,'prisonJackId':strCurt[i].prisonJackId,'prisonId':self.prisonId};
            list.push(lit)
            if(strCurt[i].strongNum !== ""){strState++}
          }
          if(strState>0 && strState<4){self.$message.error("强电通道选择不完整");return false;}
          //弱电数据
          let wakState = 0; //判断弱电部分是否有选择合适的通道，如果全部没有选择通道那么下面的equipmentWeakId传空值
          for(let i=0;i<wakCurt.length;i++){
            let lit = {'jackId':wakCurt[i].weakNumId,'prisonJackId':wakCurt[i].prisonJackId,'prisonId':self.prisonId};
            list.push(lit);
            if(wakCurt[i].weakNum !== ""){wakState++}
          }
          // 如果选中，必须全选才能提交保存
          if(wakState>0 && wakState<wakCurt.length){self.$message.error("弱电通道选择不完整");return false;}
          
          url = "sup/prison/update";  //编辑接口
          data = {prisonId:self.prisonId,prisonName:self.typeName,prisonTypeId:self.typeValue2,
              equipmentStrongId:strState==0?'':self.strongIpVal,
              equipmentWeakId:wakState==0?'':self.weakIpVal,jackInfos:list};
        }else{
          //强电数据
          let strState1 = 0;  //判断强电部分是否有选择合适的通道，如果全部没有选择通道那么下面的equipmentStrongId传空值
          for(let i=0;i<strCurt.length;i++){
            let lit = {'jackId':strCurt[i].strongNumId,'prisonJackId':strCurt[i].prisonJackId};
            list.push(lit)
            if(strCurt[i].strongNum !== ""){strState1++}
          }
          if(strState1>0 && strState1<4){self.$message.error("强电通道选择不完整");return false;}
          //弱电数据
          let wakState1 = 0; //判断弱电部分是否有选择合适的通道,如果全部没有选择通道那么下面的equipmentWeakId传空值
          for(let i=0;i<wakCurt.length;i++){
            let lit = {'jackId':wakCurt[i].weakNumId,'prisonJackId':wakCurt[i].prisonJackId};
            list.push(lit)
            if(wakCurt[i].weakNum !== ""){wakState1++}
          }
          if(wakState1>0 && wakState1<wakCurt.length){self.$message.error("弱电通道选择不完整");return false;}
          
          url = "/sup/prison/add";   //新添加接口
          data = {prisonName:self.typeName,prisonTypeId:self.typeValue2,
              equipmentStrongId:strState1==0?'':self.strongIpVal,
              equipmentWeakId:wakState1==0?'':self.weakIpVal,jackInfos:list};
        }

        console.log(data)
        const loading = self.$loading(opt)
        self.$http.post(url,data).then(function(reslut){
          console.log(reslut)
          if(reslut.data.flag){
            self.$message({message:'添加成功',type: 'success'});
            loading.close();  self.getPrisonList(1);//重新获取监室列表
          }else{
            self.$message.error(reslut.data.msg); loading.close();
          }
          self.alarmListPup =false;
        }).catch(function(erro){
          self.alarmListPup =false; loading.close();
          self.$message.error(erro.data.msg);
        })
      },
      //编辑监室配置弹窗
      editRoomConfig:function(res){
        console.log(res);
        let self = this;
        const loading = self.$loading(opt)
        //筛选出强电列表和弱电列表
        let [list,storongCut,weakCut] = [res.vprisonJacks,[],[]];
        for(let i=0;i<list.length;i++){
          if(list[i].jackType == 1){
            let ff = {'strongNum':list[i].jackNumber,'strongNumId':list[i].jackId,
                'prisonJackName':list[i].prisonJackName,'prisonJackId':list[i].prisonJackId};
            storongCut.push(ff);
          }else{
            let hh = {'weakNum':list[i].jackNumber,'weakNumId':list[i].jackId,
                'prisonJackName':list[i].prisonJackName,'prisonJackId':list[i].prisonJackId};
            weakCut.push(hh);
          }
        }
        this.strongCurt =storongCut;  //强电列表
        this.weakCurt =weakCut;  //弱电列表
        //获取ip对应的可用通道
        this.w_passWayNum = [];
        this.s_passWayNum = [];
        this.getStorngIpWay(res.equipmentStrongId);  //获取强电ip对应的通道
        this.getWeakIpWay(res.equipmentWeakId);  //获取弱电ip对应的通道

        this.prisonId =res.prisonId   //监室id
        this.typeValue2 = res.prisonTypeId;   //监室类型值
        this.typeName =res.prisonName;   //编辑时监室名称
        this.strongIpVal =res.equipmentStrongId==0?'':res.equipmentStrongId;  //强电选中的通道ip
        this.weakIpVal =res.equipmentWeakId==0?'':res.equipmentWeakId;  //弱电选中的通道ip
        this.alarmListPup =true;   //监室类型编辑弹窗
        loading.close();  //关闭loading
      },
      //根据强电ip获取ip对应的id,从而获取该ip所对应的可用的通道
      getStorngIpWay:function(ip_id){
        let self = this;
        let strList = self.strongIps;
        for(let n=0;n<strList.length;n++){
          if(ip_id == strList[n].equipmentInfoId){
            console.log(strList[n].equipmentInfoId);
            let [url,data] = ['/sup/jackInfo/queryJackNo',{equipmentType:1,equipmentId:strList[n].equipmentInfoId}];
            self.$http.post(url,data).then(function(result){
              console.log(result);
              if(result.data.flag){
                let [leng,list] = [result.data.data,[]];
                if(leng.length>0){
                  for(let i=0;i<leng.length;i++){
                    let lit = {id:leng[i].jackId,num:leng[i].jackNumber,ste:false};list.push(lit);
                  }
                  self.s_passWayNum = list;   //强电ip通道可选值
                }else{
                  self.s_passWayNum = []; //清空通道下拉框数据
                }
              }else{self.$message({message:result.data.msg,type:'warning'});self.s_passWayNum = [];}
            }).catch(function(erro){
              self.$message.error(erro.data.msg);
              self.s_passWayNum = []; //清空通道下拉框数据
            })
          }
        }
      },
      //根据弱电ip获取ip对应的id,从而获取该ip所对应的可用的通道
      getWeakIpWay:function(ip_id){
        let self = this;
        let weakList = self.weakIps;
        for(let m=0;m<weakList.length;m++){
          if(ip_id == weakList[m].equipmentInfoId){
            let [url,data] = ['/sup/jackInfo/queryJackNo',{equipmentType:4,equipmentId:weakList[m].equipmentInfoId}];
            self.$http.post(url,data).then(function(result){
              if(result.data.flag){
                let [leng,list] = [result.data.data,[]];
                if(leng.length>0){
                  for(let i=0;i<leng.length;i++){
                    let lit = {id:leng[i].jackId,num:leng[i].jackNumber,ste:false};list.push(lit);
                  }
                  self.w_passWayNum = list;   //弱电ip通道可选值
                }
              }else{self.$message({message:result.data.msg,type:'warning'});}
            }).catch(function(erro){
              self.$message.error(erro.data.msg);
            })
          }
        }
      }
      //================================监室配置弹窗模块结束==================================
    },
    beforeDestroy() {
    	this.$eventBus.$off('updataPage');  //关闭兄弟组件之间传递信息时$on会多次触发的问题
    }
  }
</script>

<style>
  @import url("../../../static/css/SystemSettings/Sys-RoomConfig.css");
</style>
