<!-- 用户管理 -->
<template>
  <div class="sys_umBox">
    <div class="sys_umTitile"><h6>用户管理</h6></div>
    <div class="sys_userListLeft">
      <div class="sys_leftBox">
        <div class="sys_umTitile1">
          <img class="userMore" src="../../../static/images/icon-xin.png"/>
          <h6>用户列表</h6>
          <span class="el-icon-plus" title="添加" @click="addNewsList()"></span>
          <span class="el-icon-delete sys_delIco" title="删除" @click="deleteUserList()"></span>
        </div>
        <ul class="sys_leftUl">
          <li v-for="(list,index) in userList" v-bind:key="index"
            v-bind:class="index==selectIndex?'selectIndx':''" @click="selectUserList(list,index)">
            <img src="../../../static/images/userIco.png"/>
            <p>{{list.userName}}</p>
          </li>
        </ul>
      </div>
    </div>
    <div class="sys_umbox">
      <div class="sys_umInfo">
        <p class="sys_umIcoBox"><span class="el-icon-user"></span></p>
        <p class="sys_umIcoPut"><span>用户：</span><input type="text" v-model="userInfor.userName" readonly="readonly"/></p>
        <p class="sys_umIcoPut1"><span>密码：</span><input type="password" v-model="userInfor.password" readonly="readonly"/></p>
        <p class="sys_umIcoPut1"><span>手机号码：</span><input type="text" v-model="userInfor.phone" readonly="readonly"/></p>
        <p class="sys_umIcoPut1"><i @click="editAccount(userInfor)">用户编辑</i></p>
        <p class="sys_umIcoPut1"><i @click="showPrisonBind">监室绑定</i></p>
      </div>
      <div class="sys_TaskTableParent dev_ManRight" style="overflow-y:auto;">
         <el-table :data="prisonList" style="width: 100%">
           <el-table-column type="index" label="序号" width="80"></el-table-column>
           <el-table-column prop="prisonDistName" label="所属监区"></el-table-column>
           <el-table-column prop="prisonName" label="监室名"></el-table-column>
           <el-table-column label="监室状态">
             <template slot-scope="scope">
               <span>{{scope.row.eventInfos.length>0?'有报警':'无报警'}}</span>
             </template>
           </el-table-column>
           <el-table-column prop="createTime" label="创建时间"></el-table-column>
           <el-table-column  label="操作" width="90">
             <template slot-scope="scope">
               <span class="Edit sys_dit el-icon-link" title="解除绑定" @click="prisonUnbind(scope.row)"><span>解绑</span></span>
             </template>
           </el-table-column>
         </el-table>
      </div>
    </div>

    <!-- 用户管理添加/编辑 弹窗 -->
    <div class="poupParnet" v-if="alarmListPup">
    	<div class="poupParnetAfter" style="width:400px;">
    		<div class="poupTitle"><div class="poupTitleAfter"><h6>监室类型</h6><span @click="openPopup()">×</span></div></div>
    		<div class="pubCenter">
          <input type='password' autocomplete="off" style='width:0px;height:0px;opacity:0;position:absolute;z-index:50;'>
          <ul class="sys_umPoup">
            <li><span class="umSmall">用户名：</span><input class="sys_umPoupPut" type="text" v-model="addUser" placeholder="请输入用户名"/></li>
            <li><span class="umSmall">密码：</span>
              <input class="sys_umPoupPut" :type="password" v-model="addPassWord" autocomplete="off" placeholder="请输入密码"/>
              <img class="popEye" v-if="password=='password'" src="../../../static/images/eyeOff.png" @click="password='text'"/>
              <img class="popEye" v-else src="../../../static/images/eyeOn.png" @click="password='password'"/>
            </li>
            <li><span class="umSmall">联系方式：</span><input class="sys_umPoupPut" type="text" v-model="addMode" placeholder="请输入联系方式"/></li>
          </ul>
        </div>
    		<div class="poupSure">
    			<button @click="openPopup()">取消</button>
    			<button @click="saveUserInfo()">确认</button>
    		</div>
    	</div>
    </div>

    <!-- 用户监室绑定 弹窗 -->
    <div class="poupParnet" v-if="prisonPup">
    	<div class="poupParnetAfter" style="width:400px;">
    		<div class="poupTitle"><div class="poupTitleAfter"><h6>监室绑定</h6><span @click="prisonPup=false">×</span></div></div>
    		<div class="pubCenter">
          <ul class="sys_umPoup">
            <li>
              <span class="umSmall">监室选择：</span>
              <div class="editMM">
                <!-- <el-select v-model="selectPrison" multiple collapse-tags placeholder="请选择监室">
                  <el-option v-for="item in prisonAll" :key="item.prisonId" :label="item.prisonName" :value="item.prisonId"></el-option>
                </el-select> -->
                <el-cascader ref="cascader" v-model="selectedPrisons" :options="districtWithPrison" placeholder="请选择监室" :props="{multiple: true}" clearable :emitPath="false" :show-all-levels="false" collapse-tags @change="handlePrisonsSelected" @visible-change="cascaderVisibleChange" >
                </el-cascader>
              </div>
            </li>
          </ul>
        </div>
    		<div class="poupSure">
    			<button @click="prisonPup=false">取消</button>
    			<button @click="prisonBinding()">确认</button>
    		</div>
    	</div>
    </div>
  </div>
</template>

<script>
  import { MessageBox } from "element-ui";
  export default{
    name:"Sys_UserManage",
    data(){
      return{
        prisonAll:JSON.parse(localStorage.getItem("prison")),
        userName:"",  //当前选中的用户的用户名
        passWord:"",  //当前选中的用户的用户密码
        phone:"",     //当前选中的用户的用户手机号
        userInfor:"", //当前选中的用户信息
        selectIndex:0, //当前选中的用户索引
        userList:[],   //用户列表
        prisonList:[],  //用户管理的监室列表
        alarmListPup:false,   //用户管理编辑弹窗
        addUser:"",     //添加/编辑时用户名
        addPassWord:"", //添加/编辑时用户密码
        addMode:"",    //添加/编辑时用户联系方式
        nowPage:1,   //当前选中的分页
        userId:"",   //当前编辑的用户id
        selectPrison:[],  //当前选中的监室
        selectedPrisons:[],   //当前选中的监室，该数据包含监室与监区的关联关系
        prisonPup:false,  //监室绑定弹窗
        areaList:[],   //所有的监室
        districtWithPrison:[],   //所有监区与监室
        password:"password",
      }
    },
    created() {
      this.getAllArea();  //获取所有的监室
      this.getAllAreaWithRoom();  //获取所有监区与监室
      this.getUserList();
    },
    methods:{
      //用户管理编辑弹窗开启/关闭
      openPopup:function(){
        var self = this;
        if(self.alarmListPup){self.alarmListPup = false;}else{self.alarmListPup = true;}
      },
      //获取用户列表
      getUserList:function(page){
        let self = this;
        let [url,data] = ['/sup/user/query',{'current':1,'size':1000}];
        self.$http.post(url,data).then(function(result){
          console.log(result);
          if(result.data.flag){
            if (result.data.data.records.length > 0) {
              self.userList = result.data.data.records
              self.userInfor = result.data.data.records[0]; //第一条用户信息
              let u_id = result.data.data.records[0].userId;
              self.userId = u_id;
              self.getUserRoom(u_id);  //获取第一个用户所管理的监室
            }
          }else{
            self.$message.error(result.data.msg);
          }
        }).catch(function(erro){
           console.log(erro)
           self.$message.error("操作失败,服务器异常");
        })
      },
      //添加新的账户
      addNewsList:function(){
        this.userId = "";
        this.addUser = "";
        this.addPassWord = "";
        this.addMode = "";
        this.openPopup();
      },
      //保存编辑后的用户信息
      saveUserInfo:function(){
        let self = this;
        if(self.addUser == "" || self.addUser == null){self.$message.error("账户名不得为空.");return false;}
        let uname = /^[a-zA-Z0-9]{6,20}$/;  //用户名正则，6到14位（字母，数字）
        if(!uname.test(self.addUser)){self.$message.error("请输入6~20位用户名，可以包含，字母，数字");return false;}
        if(self.addPassWord == "" || self.addPassWord == null){self.$message.error("密码不得为空.");return false;}
        let uPattern = /^[a-zA-Z0-9_-]{6,16}$/;  //密码正则，6到16位（字母，数字，下划线，减号）
        if(!uPattern.test(self.addPassWord)){self.$message.error("请输入6~16位密码，可以包含，字母，数字，下划线，减号。");return false;}
        let reg_tel = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
        if(!reg_tel.test(self.addMode)){self.$message.error("手机号码有误");return false;}
        let [url,data] = ['/sup/user/editUser',''];
        if(self.userId !== ""){
          data = {userId:self.userId,userName:self.addUser,password:self.addPassWord,phone:self.addMode};
        }else{
          data = {userName:self.addUser,password:self.addPassWord,phone:self.addMode};
        }
        self.$http.post(url,data).then(function(result){
          console.log(result);
          if(result.data.flag){
            self.$message({ message:result.data.msg,type: 'success'});
            self.getUserList(self.nowPage);  //重新获取用户列表
            self.selectIndex = 0;  //选中的所有恢复到0
          }else{
            self.$message.error(result.data.msg);
          }
        }).catch(function(erro){
           console.log(erro)
           self.$message.error("操作失败,服务器异常");
        })
        self.alarmListPup = false;
      },
      //编辑账户
      editAccount:function(result){
        var self = this;
        self.openPopup();
        self.userId = result.userId;
        self.addUser = result.userName;
        self.addPassWord = result.password;
        self.addMode = result.phone;
      },
      //删除用户
      deleteUserList:function(){
        let self = this;
        self.$confirm('是否删除 '+self.userInfor.userName+' 这个账号?', '删除提示', {confirmButtonText: '确定',cancelButtonText: '取消',type: 'warning'
          }).then(() => {
          let [url,data] = ['/sup/user/delUser',{"userId":self.userInfor.userId}];
          self.$http.post(url,data).then(function(result){
            console.log(result)
            if(result.data.flag){
              self.$message({message:'删除成功',type: 'success'});
              self.selectIndex = 0;
              self.getUserList();  //重新获取用户列表
            }else{
              self.$message({message:'删除失败',type:'warning'});
            }
          }).catch(function(erro){
             console.log(erro)
          })
        }).catch(() => {});
      },
      //选中用户列表中的一个用户
      selectUserList:function(result,index){
        this.selectIndex = index;
        this.userInfor = result;
        this.userId = result.userId;
        this.getUserRoom();
      },
      //点击监室绑定
      showPrisonBind() {
        this.prisonPup=true;
        this.getUserRoom();
      },
      //获取当前选中的用户所绑定的监室
      getUserRoom:function(){
        let self = this;
        let [url,data] = ['/sup/user/queryPrison',{"userInfoId":self.userId}];
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            let priList = result.data.data;
            self.prisonList = priList;
            self.selectedPrisons = [];
            self.selectPrison = [];
            for(let i=0;i<priList.length;i++){
              //判断房间是佛存在报警信息，如果不存在传入空数组，避免出现null的情况
              priList[i].eventInfos = priList[i].eventInfos || [];
              self.selectedPrisons.push([priList[i].prisonDistrictId, priList[i].prisonId])
              self.selectPrison.push(priList[i].prisonId);
              let list = self.areaList;
              for(let m=0;m<list.length;m++){
                if(priList[i].prisonDistrictId == list[m].prisonDistrictId){
                  Object.assign(priList[i],{prisonDistName:list[m].prisonDistrictName})
                }
              }
            }
            console.log(self.selectedPrisons)
          }else{
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
           console.log(erro)
        })
      },
      //获取所有的监区
      getAllArea:function(){
        let self = this;
        let [url,data] = ['/sup/prisonDistrict/query',''];
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.areaList = result.data.data;
          }else{
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
          self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      //获取所有监区监室
      getAllAreaWithRoom:function() {
        let self = this;
        let [url, data] = ['/sup/prisonDistrict/queryComboBox', '']
        self.$http.post(url, data).then(function(result){
          if (result.data.flag) {
            // 全部监室
            self.districtWithPrison = result.data.data.map(function(district){
              let prisons = district.prisons.map(function(prison) {
                return {value: prison.prisonId, label: prison.prisonName}
              })
              return {
                value: district.prisonDistrictId, 
                label: district.prisonDistrictName, 
                children: prisons
              }
            })
          } else {
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
          self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      //监室选择事件
      handlePrisonsSelected:function(value) {
        let array = this.selectedPrisons.map(function(obj) {
          return obj[1] || obj;
        })
        this.selectPrison = array;
      },
      //监室选择器节点展开事件
      cascaderVisibleChange(value) {
        if (!value) return

        // 展开下拉框时，如果已选择数据为空，刷新一下该组件， 以免第二级选择框内容为空白
        let cascader = this.$refs.cascader;
        if (!this.selectedPrisons.length) {
          cascader.$forceUpdate();
        }
      },
      //监室绑定
      prisonBinding:function(){
        let self = this;
        let [url,data] = ['/sup/user/binding',{userInfoId:self.userId,prisonIds:self.selectPrison}];
        self.$http.post(url,data).then(function(result){
          if(result.data.flag){
            self.$message({message:'绑定成功',type: 'success'});
            self.getUserRoom();  //获取当前选中的用户所绑定的监室
          }else{
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
           console.log(erro)
        })
        self.prisonPup=false;  //关闭绑定弹窗
      },
      //监室解除绑定
      prisonUnbind:function(result){
        let self = this;
        self.$confirm('是否解除 '+result.prisonName+' 这个监室绑定?', '删除提示', {confirmButtonText: '确定',cancelButtonText: '取消',type: 'warning'
          }).then(() => {
          let [url,data] = ['/sup/user/relieve',{"prisonId":result.prisonId}];
          self.$http.post(url,data).then(function(result){
            if(result.data.flag){
              self.$message({message:'删除成功',type: 'success'});
              self.getUserRoom();  //重新获取当前选中的用户的所管理的监室
            }else{
              self.$message({message:'删除失败',type:'warning'});
            }
          }).catch(function(erro){
             console.log(erro)
          })
        }).catch(() => {});
      }
    }
  }
</script>

<style>
  @import url("../../../static/css/SystemSettings/Sys_UserManage.css");
</style>
