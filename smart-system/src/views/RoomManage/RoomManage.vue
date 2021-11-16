<template>
  <div class="defaultName">
    <div class="contentBox">
       <div class="dev_ManLeft contentLeft">
         <div class="dev_ManLeftAfter">
           <div class="dev_ManLeftTitle"><h6>监区列表</h6></div>
           <ul class="contentLeftList">
             <li v-bind:class="areaSelect==0?'contLeftLiSelect':''" @click="changeArea(0, '全部监室')">全部监室</li>
             <li v-for="(list,index) in areaList"
              v-bind:key="index" v-bind:class="areaSelect==list.prisonDistrictId?'contLeftLiSelect':''"
              @click="changeArea(list.prisonDistrictId,list.prisonDistrictName)">{{list.prisonDistrictName}}</li>
           </ul>
           <p class="dev_manLeftIco">
             <span class="el-icon-plus" title="添加监区" @click="addNewsArea()"></span>
             <span class="el-icon-edit-outline" title="编辑监区" @click="editNewsArea()"></span>
             <span class="el-icon-delete" title="删除监区" @click="deleteArea()"></span>
           </p>
         </div>
       </div>
       <div class="dev_ManRight contentRight">
         <el-table :data="roomList" style="width: 100%; height: 100%; overflow-y: auto;">
           <el-table-column type="index" label="序号" width="80"></el-table-column>
           <el-table-column prop="prisonName" label="房间"></el-table-column>
           <el-table-column prop="areaName" label="所属区域"></el-table-column>
           <el-table-column prop="storngIp" label="强电IP"></el-table-column>
           <el-table-column prop="weakIp" label="弱电IP"></el-table-column>
           <el-table-column label="强电状态">
             <template slot-scope="scope">
               <span v-if="scope.row.storngState==1" class="onState">在线</span>
               <span v-else class="outState">离线</span>
             </template>
           </el-table-column>
           <el-table-column label="弱电状态">
             <template slot-scope="scope">
               <span v-if="scope.row.weakState==1" class="onState">在线</span>
               <span v-else class="outState">离线</span>
             </template>
           </el-table-column>
           <el-table-column  label="操作">
             <template slot-scope="scope">
               <span class="Edit el-icon-edit-outline" title="编辑" @click="editRoom(scope.row)"></span>
             </template>
           </el-table-column>
         </el-table>
       </div>

       <!-- 添加监区 -->
       <div class="poupParnet" v-if="alarmListPup">
       	<div class="poupParnetAfter" style="width:400px;">
       		<div class="poupTitle"><div class="poupTitleAfter"><h6>添加监区</h6><span @click="openPopup()">×</span></div></div>
       		<div class="pubCenter">
              <ul class="dm_poupList">
                <li><span class="dm_poupName">监区名称：</span><input class="dm_poupPut" type="text" v-model="prisonDistrictName" placeholder="请输入监区名称"/> </li>
                <li>
                  <span class="dm_poupName">监区隶属：</span>
                  <div class="editMM" style="width:100%;">
                    <el-select v-model="prisonTypeVa" placeholder="监区所属地图选择">
                      <el-option v-for="item in prisonTypeItem" :key="item.id"
                      :label="item.name" :value="item.id"></el-option>
                    </el-select>
                  </div>
                </li>
              </ul>
          </div>
       		<div class="poupSure">
       			<button @click="openPopup()">取消</button>
       			<button @click="saveNewsArea()">确认</button>
       		</div>
       	</div>
       </div>
       <!-- 修改监区 -->
       <div class="poupParnet" v-if="editPup">
       	<div class="poupParnetAfter" style="width:400px;">
       		<div class="poupTitle"><div class="poupTitleAfter"><h6>修改监区</h6><span @click="editPup=false">×</span></div></div>
       		<div class="pubCenter">
              <ul class="dm_poupList">
                <li><span class="dm_poupName">监区名称：</span><input class="dm_poupPut" type="text" v-model="editName" placeholder="请输入监区名称"/> </li>
              </ul>
          </div>
       		<div class="poupSure">
       			<button @click="editPup=false">取消</button>
       			<button @click="saveEditNewsArea()">确认</button>
       		</div>
       	</div>
       </div>

       <!-- 监室编辑 -->
       <div class="poupParnet" v-if="roomPup">
       	<div class="poupParnetAfter" style="width:350px;">
       		<div class="poupTitle"><div class="poupTitleAfter"><h6>编辑</h6><span @click="roomPup=false">×</span></div></div>
       		<div class="pubCenter">
            <div class="editMM">
              <el-select v-model="areaId" placeholder="监区选择">
                <el-option v-for="item in areaList" :key="item.prisonDistrictId"
                :label="item.prisonDistrictName" :value="item.prisonDistrictId"></el-option>
              </el-select>
            </div>
          </div>
       		<div class="poupSure">
       			<button @click="roomPup=false">取消</button>
       			<button @click="saveRoomInfo()">确认</button>
       		</div>
       	</div>
       </div>
    </div>
  </div>
</template>

<script>
  var opt = {
      lock: true,
      text: '加载中...',
      spinner: 'el-icon-loading',
      customClass:'loadingClass',
      background: 'rgba(0, 0, 0, 0.5)',
  }
  export default{
    name:"RoomManage",
    data(){
      return{
          roomPup:false,
          alarmListPup:false,
          editPup:false,
          areaSelect:0,  //当前选中的监区栏
          areaList:[],  //监区列表
          areaIdList:[],  //收集所有监区的id
          roomList:[],  //监室列表
          areaId:"",    //当前选中的监区类型值
          roomId:"",   //定义当前编辑的监室id
          selectName:"",  //当前选中的监区名称
          prisonDistrictName:"",  //定义新增监区时的监区名称
          prisonDistrictId:"",    //定义当前选中的监区id
          editName:"",   //定义修改监区是的监区名
          optionsRoom:[],  //监室类型可选值
          roomType:"",     //监室类型选中值
          prisonTypeVa:'',  //监区地图类型值
          prisonTypeItem:[{id:1,name:'看守所'},{id:2,name:'拘留所1楼'},{id:3,name:'拘留所2楼'}]
      }
    },
    created() {
    //headerChange: 是父组件App.vue指定的传数据绑定的函数，parentData:子组件给父组件App.vue传递的数据
    var parentData = {header:true,nav:2};
    this.$emit('headerChange',parentData);
    this.getAllArea();  //获取所有的监区
    },
    methods:{
      //添加监区弹窗开启/关闭
      openPopup:function(){
        let self = this;
        if(self.alarmListPup){self.alarmListPup = false;}else{self.alarmListPup = true;}
      },
      //添加监区弹窗开启/关闭
      openPopup1:function(){
        let self = this;
        if(self.roomPup){self.roomPup = false;}else{self.roomPup = true;}
      },
      //获取页面上左侧所有的监区
      getAllArea:function(){
        let self = this;
        let [url,data] = ['/sup/prisonDistrict/query',''];
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.areaSelect = 0;self.selectName = "全部监室";
            self.areaList = result.data.data;
            self.areaIdList = self.areaList.map(function(object) {
              return object.prisonDistrictId;
            })
            self.getAreaToRoom(""); //获取全部的房间，当传入的数据为空时，表示查询全部
          }else{
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
          self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      //点击监区获取对应监区下的监室
      changeArea:function(index,name){
        this.selectName = name;
        this.areaSelect = index;
        if(index == 0){
          this.prisonDistrictId = "";
        }else{
          this.prisonDistrictId = index;
        }
        this.getAreaToRoom(index);
      },
      //根据所选中的监区获取该监区下的所有监室
      getAreaToRoom:function(prisonDistrictId){
        var self = this;
        var url = "/sup/prisonDistrict/queryPrison";
        var data = "";
        if(prisonDistrictId == 0){
          data = {prisonDistrictId:""};
        }else{
          data = {prisonDistrictId:prisonDistrictId};
        }
        const loading = self.$loading(opt);
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
             var rustList = result.data.data;
             for(var i=0;i<rustList.length;i++){
               var addWord = {areaName:"未分配监区",storngIp:"未定义",weakIp:"未定义",storngState:0,weakState:0};
               var areaId = rustList[i].prisonDistrictId;
               var index = -1;
               //判断这里循环得到的监区id和上面得到的areaIdList监区id集合中是否有匹配的
               if(areaId !== null){index = self.areaIdList.indexOf(areaId);}
               // 如果匹配上那么设置addWord.areaName为对应的监区名字
               if(index !== -1){addWord.areaName = self.areaList[index].prisonDistrictName;}
               //判断强电是否null,如果是则不作处理
               if(rustList[i].equipmentStrong !== null){
                 addWord.storngIp = rustList[i].equipmentStrong.equipmentIp;
                 addWord.storngState = rustList[i].equipmentStrong.state;
               }
               //判断弱电是否null,如果是则不作处理
               if(rustList[i].equipmentWeak !== null){
                 addWord.weakIp = rustList[i].equipmentWeak.equipmentIp;
                 addWord.weakState = rustList[i].equipmentWeak.state;
               }
               Object.assign(rustList[i],addWord);
             }
             self.roomList = rustList;
             loading.close();
          }else{
            self.$message({message:result.data.msg,type:'warning'});
            loading.close();  self.roomList = [];
          }
        }).catch(function(erro){
          loading.close();  self.roomList = [];
          self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      //打开监室编辑弹窗，并获取当前监室的信息
      editRoom:function(data){
        this.openPopup1();
        this.roomId = data.prisonId;
        this.areaId = "";
      },
      //保存编辑后的监室信息
      saveRoomInfo:function(){
        let self = this;
        let url = "/sup/prison/binding";
        let data = {prisonId:self.roomId,prisonDistrictId:self.areaId};
        if(self.areaId == ""){self.$message({message:'请选择监区',type:'warning'}); return false;}
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.roomPup = false;
            self.$message({message: '修改成功',type: 'success'});
            self.getAreaToRoom(self.areaSelect); //重新获取当前选中监区对应所有监室
          }else{
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
          self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      //新添加监区，打开添加窗口
      addNewsArea:function(){
        this.alarmListPup = true;
        this.prisonTypeVa = '';
        this.prisonDistrictName = "";
      },
      //保存添加新的监区
      saveNewsArea:function(){
        let self = this;
        let url = "/sup/prisonDistrict/add";
        let data = {prisonDistrictName:self.prisonDistrictName,prisonDistrictType:self.prisonTypeVa};
        const loading = self.$loading(opt)
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.alarmListPup = false;
            self.$message({message: '添加成功',type: 'success'});
            self.getAllArea(); //重新获所有监区
          }else{
            self.$message({message:result.data.msg,type:'warning'});
          }
          loading.close();
        }).catch(function(erro){
          loading.close();
          self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      //修改监区名称，打开添加窗口
      editNewsArea:function(){
        if(this.selectName == "全部监室"){
          this.$message({message:"当前选中的是全部监区，不可修改.",type:'warning'});
        }else{
          this.editPup = true;
          this.editName = this.selectName;
        }
      },
      //保存修改监区名称
      saveEditNewsArea:function(){
        let self = this;
        let url = "/sup/prisonDistrict/update";
        let data = {prisonDistrictName:self.editName,prisonDistrictId:self.prisonDistrictId};
        const loading = self.$loading(opt);
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.editPup = false;
            self.$message({message: '修改成功',type: 'success'});
            self.getAllArea(); //重新获所有监区
          }else{
            self.$message({message:result.data.msg,type:'warning'});
          }
          loading.close();
        }).catch(function(erro){
          loading.close();
          self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      //删除监区
      deleteArea:function(){
        let self = this;
        if(self.selectName == "全部监室"){self.$message({message:"当前选中的是全部监区，不可删除.",type:'warning'}); return false;}
        self.$confirm('是否删除 '+self.selectName+' 这个监区?', '删除提示', {confirmButtonText: '确定',cancelButtonText: '取消',type: 'warning'
          }).then(() => {
          let [url,data] = ['/sup/prisonDistrict/delete',{prisonDistrictId:self.prisonDistrictId}];
          const loading = self.$loading(opt)
          self.$http.post(url,data).then(function(result){
            console.log(result)
            if(result.data.flag){
              self.$message({message: '删除成功',type: 'success'});
              self.getAllArea(); //重新获所有监区
            }else{
              self.$message({message:result.data.msg,type:'warning'});
            }
            loading.close();
          }).catch(function(erro){
            loading.close();
            self.$message.error(erro.data.msg);
            console.log(erro)
          })
        }).catch(() => {});
      }
    }
  }
</script>

<style>
  @import url("../../../static/css/RoomManage/RoomManage.css");
</style>
