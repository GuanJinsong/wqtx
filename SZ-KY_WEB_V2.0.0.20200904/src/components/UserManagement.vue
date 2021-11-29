<!-- 用户管理 -->
<template>
  <div class="mainView" :treeList="treeList">
    <section class="u_equip-fence">
        <div class="u_history-left">
            <div class="u_history-bg1"><img src="../../static/images/icon-xin.png"/> <span>用户列表({{userList.length}})</span></div>
            <ul class="u_userList">
                <li v-for="(user,index) in userList"
                v-bind:key="index"
                v-bind:class="index == listItme?'userBack':''"
                @click="getUserInfor(user.userId,index)"><img src="../../static/images/userIco.png"/> <p>{{user.name}}</p><i>设备:{{user.count}}台</i></li>
            </ul>
            <div class="u_add-to">
                <button class="u_add-btn" @click="openAddUserWindows()"><i>+</i>添加管理员</button>
                <button id="deleteAdmin" @click="deleteUserTip()">删 除</button>
            </div>
        </div>
        <div class="u_userMangRight">
        <div class="u_history-right">
            <div class="u_cx-btn">
                <i></i>
                <ul>
                    <li><label>账户：</label><span>{{userNumber}}</span></li>
                    <li><label>密码：</label><span>{{userPassword}}</span><em id="changePw" @click="openPasswordPopup()">修改密码</em></li>
                    <li><label>账户等级：</label><span>{{userIdentity}}</span></li>
                    <li><label>设备数量：</label><span>{{deviceNumber}}</span><em id="deviceBind" @click="deviceBindingPopup()">设备绑定</em></li>
                </ul>
            </div>
            <div class="u_table-box verticalScroll">
                <table>
                    <thead>
                    <tr>
                        <th></th>
                        <th>是否在线</th>
                        <th>城市</th>
                        <th>区域</th>
                        <th>河流</th>
                        <th>地点</th>
                        <th>IMEI</th>
                        <th>解绑</th>
                    </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(List,index) in deviceList" v-bind:key="index">
                          <td>{{(s_selectpage-1)*15+index+1}}</td>
                          <td v-bind:class="[List.lsline=='在线'?'u_online':'u_outline']">{{List.lsline}}</td>
                          <td>{{List.city}}</td>
                          <td>{{List.county}}</td>
                          <td>{{List.river}}</td>
                          <td>{{List.address}}</td>
                          <td>{{List.imei}}</td>
                          <td><img @click="removeDeviceTip(List.deviceInfoId,List.imei)" src="../../static/images/jieban.png"/></td>
                      </tr>
                    </tbody>
                </table>
                <div class="reportPageBox" v-if="userDevicePage.length>1">
                  <ul class="mini pageStyle">
                    <li @click="queryUserDeviceList(1)">首页</li>
                    <li class="pageNumber" v-for="x in userDevicePage" v-bind:class="{'pageSelect':s_selectpage == x}" v-bind:key="x" @click="queryUserDeviceList(x)">{{x}}</li>
                    <li @click="queryUserDeviceList(pageTotal)">末页</li>
                  </ul>
                </div>
                <div class="nodataTip" v-if="userDevicePage.length==0"><img style="width:400px;height:auto;" src="../../static/images/nodata.png"/></div>
            </div>
        </div>
        </div>
    </section>

      <!-- 添加管理员 -->
      <div class="u_the-box" id="the-box3" v-if="addUser">
           <div class="u_t-box1" style="">
               <div class="u_tit1">添加管理员 <span @click="openAddUserWindows()">×</span></div>
               <ul>
                   <li><label for="">账号：</label><input type="text" v-model="addName" placeholder="请输入账号"></li>
                   <li><label for="">密码：</label><input type="text" v-model="addPassword" placeholder="请输入密码"></li>
               </ul>
               <div class="u_jb-btn">
                   <button class="u_jb-bg" @click="addNewUser()">确认</button>
                   <button @click="openAddUserWindows()">取消</button>
               </div>
           </div>
       </div>
       <!-- 修改密码 -->
       <div class="u_the-box" id="the-box4" v-if="changePassword">
           <div class="u_t-box1" style="">
               <div class="u_tit1">修改密码 <span @click="openPasswordPopup()">×</span></div>
               <ul>
                   <li><label for="">新密码：</label><input type="text" v-model="newPassWord" placeholder="请输入新密码"></li>
               </ul>
               <div class="u_jb-btn">
                   <button class="u_jb-bg" @click="userPaasWordChange()">确认</button>
                   <button @click="openPasswordPopup()">取消</button>
               </div>
           </div>
       </div>
       <div class="u_the-box" id="the-box5" v-if="userTip">
           <div class="u_t-box1" style="">
               <div class="u_tit1">用户设备绑定 <span @click="deviceBindingPopup()">×</span></div>
               <div class="casParent1">
                  <div class="casParent">
                   <label class="casName">站点名称：</label>
                   <div class="u_leftCascader">
                     <el-cascader :options="options"
                     v-model="cascaderValue"
                     :checkStrictly="true"
                     @change="cascader"
                     placeholder="请选择你需要的设备..."
                     popper-class="u_myCascader"
                     :show-all-levels = "true"
                     clearable></el-cascader>
                   </div>
                  </div>
                  <p class="u_tip">提示：请不要重复绑定同一个设备.</p>
                </div>
               <div class="u_jb-btn">
                   <button class="u_jb-bg" @click="addDeviceBinding()">确认</button>
                   <button @click="deviceBindingPopup()">取消</button>
               </div>
           </div>
       </div>

  </div>
</template>

<script>
  var self = "";
  var pageSize = 15;
  var page = 1;
  var selectDevice = [];   //定义用户已绑定的设备id集合
  export default{
    name:'UserManagement',
    data(){
      return{
        treeList:[],        //定义树形结构数据
        userList:[],        //定义用户列表
        role:"",            //定义当前账户的身份1.超级管理员2.普通员工
        listItme:0,         //定义当前选中的列表索引
        selectUserId:1,     //定义当前选中的用户id
        userKey:'',         //定义当前选中的用户身份标识
        userNumber:'',      //定义账户名
        userPassword:'',    //定义账户密码
        userIdentity:'',    //定义账户级别
        deviceNumber:'',    //定义账户管理的设备数量
        addUser:false,      //定义添加用户窗口出现
        changePassword:false,  //定义修改密码窗口出现
        userTip:false,       //定义用户设备绑定窗口
        newPassWord:'',     //定义新的密码
        addName:'',         //定义新添加的用户名
        addPassword:'',     //定义新添加的用户密码
        deviceList:[],          //用户设备管理列表
        userDevicePage:[],      //定义分页数据
        s_selectpage:1,         //定义被选中的页数
        options:[],
        cascaderValue:[],        //定义select选中的值结果
        bindDaviceId:'',         //定义绑定设备时选中的id
      }
    },
    created() {
      self = this;
      //headerChange: 是父组件指定的传数据绑定的函数，this.header:子组件给父组件传递的数据
      var parentData = {header:true,nav:1};
      self.$emit('headerChange',parentData);
      self.treeList = self.$store.state.treeList;   //获取vuex内存储的数据
      self.options = self.treeList.newTree;
      self.getUserList();       //获取用户列表
    },
    methods:{
      //获取用户列表
      getUserList:function(){
        var url = "/api/users/userList";var data = '';
        self.$http.post(url,data).then(function(result){
          console.log(result)
          self.userList = result.data.rows;
          var userId = result.data.rows[0].userId;  //获取第一个用户的用户id
          self.getUserInfor(userId,0);     //获取初始用户(管理员)信息
        }).catch(function(erro){
          self.$message.error(erro.data.msg);
        })
      },
      //点击获取用户信息
      getUserInfor:function(userId,index){
        self.listItme = index;
        self.selectUserId = userId;
        var data = {userId:userId};
        var url = '/api/users/userSee';
        self.$http.post(url,data).then(function(result){
          self.role = result.data.role;
          self.userNumber = result.data.name;
          self.userPassword = result.data.password;
          self.userIdentity = result.data.role == 1?'超级管理员':'普通用户';
          self.deviceNumber = result.data.count;
          self.userList[index].count = result.data.count;
          self.userKey = result.data.userKey;
          self.getUserDeviceList(1);    //获取用户管理的设备列表
        }).catch(function(erro){
          self.$message.error(erro.data.msg);
        })
      },

      //======================================用户密码编辑开始=======================================
      //打开或关闭新密码输入框
      openPasswordPopup:function(){
        if(self.changePassword){self.changePassword = false;}else{self.changePassword = true;}
      },
      //修改用户密码
      userPaasWordChange:function(){
        if(self.newPassWord == ''){self.$message({message: '新的密码不得为空',type: 'warning'});return false}
        var url = "/api/users/userupdate";
        var data = {userId:self.selectUserId,oldpsw:self.userPassword,newpsw:self.newPassWord};
        self.changePassword = false;
        self.$http.post(url,data).then(function(result){
          self.userPassword = self.newPassWord;
          self.newPassWord = '';
          self.$message({message: result.data.msg,type: 'success'});
          if(self.role == 1){
            localStorage.clear();
            self.$router.push({path:'/',name:'Login'});
          }
        }).catch(function(erro){
          self.$message.error(erro.data.msg);
        })
      },
      //======================================用户密码编辑结束=======================================

      //======================================用户添加与删除管理开始===================================
      //打开添加用户窗口
      openAddUserWindows:function () {
        if(self.addUser){self.addUser = false;}else{self.addUser = true;}
      },
      //添加新的用户
      addNewUser:function(){
        if(self.addName == '' || self.addPassword == ''){self.$message({message:'信息不完整，请重新填写',type:'warning'});return false}
        var data = {name:self.addName,password:self.addPassword,role:'2'};
        var url = "/api/users/editUser";
        self.addUser = false;
        self.$http.post(url,data).then(function(result){
          if(result.data.flag){
            self.$message({message:'添加成功！！！',type: 'success'});
            self.getUserList();   //重新获取用户列表
          }
        }).catch(function(erro){
          self.$message.error('添加失败！！！');
        })
      },
      //删除用户确认提示
      deleteUserTip:function(){
        var pupupTitle = "提示";    //弹窗标题
        var text = "1.您确定要删除账户号为:"+self.userNumber+"的用户吗？2.删除后该用户绑定的所有信息也将解除.";   //弹窗内容
        self.$confirm(text, pupupTitle, {confirmButtonText:'确定',cancelButtonText:'取消',type: 'warning'}).then(() => {self.deleteUser();}).catch(() => {console.log("操作失败")});
      },
      //删除用户请求
      deleteUser:function(){
        if(self.role == 1){
          self.$message({message:'超级管理员不能被删除！！！',type:'warning'});
          return false;
        }else{
          var data = {userKey:self.userKey};
          var url = "/api/users/deleteUser";
          self.$http.post(url,data).then(function(result){
            if(result.data.flag){
              self.$message({message:'删除成功！！！',type: 'success'});
              self.getUserList();   //重新获取用户列表
            }
          }).catch(function(erro){
              self.$message.error('删除失败！！！');
          })
        }
      },
      //======================================用户添加与删除管理结束===================================

      //=====================================用户设备绑定与解绑管理开始================================
      //获取用户设备管理列表
      getUserDeviceList:function(page){
        selectDevice = [];   //push数组前先清空数组
        var data = {userId:self.selectUserId,pageSize:pageSize,page:page};
        var url = "/api/users/listUserDevice";
        self.$http.post(url,data).then(function(result){
          console.log(result);
          if(result.data.flag){
            var list = result.data.dataList;
            var Result = result.data;
            self.deviceList = list;
            self.deviceListDataReturn(Result);
            if(list.length>0){
              list.forEach(function(data,index){
                 selectDevice.push(data.deviceId);
              });
            }
          }
        }).catch(function(erro){
          self.$message.error('获取用户设备列表失败！！！');
        })
      },
      //分页处理函数
      deviceListDataReturn:function (Result,pageName){
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
        self.userDevicePage = pageData;

      },
      //点击分页
      queryUserDeviceList:function(page){
        self.s_selectpage = page;
        self.getUserDeviceList(page);   //获取用户管理列表
      },

      //解除设备绑定 确认提示
      removeDeviceTip:function(deviceInfoId,imei){
        var pupupTitle = "解除绑定提示";    //弹窗标题
        var text = "1.您确定要将设备编号为:"+imei+"从用户"+self.userNumber+"身上解除绑定吗? 2.解除绑定后该设备将不再和该用户有关，包括设备管理，以及设备特别关注.";   //弹窗内容
        self.$confirm(text, pupupTitle, {confirmButtonText:'确定',cancelButtonText:'取消',type: 'warning'}).then(() => {self.removeDeviceBinding(deviceInfoId);}).catch(() => {console.log("操作失败")});
      },
      //解除设备绑定
      removeDeviceBinding:function(deviceInfoId){
        if(self.role == 1){self.$message.error('当前是超级管理员账户，不允许解除绑定.');return false;}
        var data = {deviceInfoId:deviceInfoId}
        var url = "/api/users/deleteUserDevice";
        self.$http.post(url,data).then(function(result){
          if(result.data.flag){
            self.$message({message:'解绑成功！！！',type: 'success'});
            self.getUserInfor(self.selectUserId,self.listItme);  //重新获取当前选中的用户信息
          }else{
            self.$message.error(result.data.msg);
          }
        }).catch(function(erro){
          self.$message.error('解绑失败！！！');
        })
      },

      //打开设备绑定弹窗
      deviceBindingPopup:function(){
        if(self.userTip){self.userTip=false}else{self.userTip=true};
      },
      //设备绑定下拉框选择
      cascader:function(data){
        var address = data[0]+'/'+data[1]+'/'+data[2]+'/'+data[3];
        if(self.treeList.newList.length>0){
          self.treeList.newList.forEach(function(arr,index){
            if(arr.detailed == address){
              self.bindDaviceId = arr.data.deviceId;
            }
          })
        }

      },
      //设备绑定开始
      addDeviceBinding:function(){
        var data = {userId:self.selectUserId,deviceId:self.bindDaviceId};
        var url = "/api/users/saveUserDevice";
        self.userTip=false;
        self.$http.post(url,data).then(function(result){
          console.log(result);
          if(result.data.flag){
            self.$message({message:'设备绑定成功',type: 'success'});
            self.getUserInfor(self.selectUserId,self.listItme);  //重新获取当前选中的用户信息
          }else{
            self.$message.error(result.data.msg);
          }
        }).catch(function(erro){
          self.$message.error('设备绑定失败');
        })
      }
      //=====================================用户设备绑定与解绑管理开始================================

    }
  }
</script>

<style>
</style>
