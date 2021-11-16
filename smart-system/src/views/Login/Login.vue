<template>
  <div class="loginBox">
     <div class="loginTitle"><p>{{platformName}}</p><small>Intelligent supervision platform</small></div>
     <div class="loginput">
       <div class="loginputAfter">
         <input type='password' style='width:0px;height:0px;opacity:0;position:absolute;z-index:50;'>
         <div class="loginAfterFlex">
           <div class="loginAfterFlexChild">
             <div class="log_input" style="margin-bottom:15%;">
               <span class="el-icon-user"></span>
               <input type="text" v-model="userName" placeholder="请输入账户名"/>
             </div>
             <div class="log_input" style="margin-bottom:5%;">
               <span class="el-icon-lock"></span>
               <input :type="passwordType" v-model="password" placeholder="请输入密码"/>
               <img class="popEye1" v-if="passwordType=='password'" src="../../../static/images/eyeOff.png" @click="passwordType='text'"/>
               <img class="popEye1" v-else src="../../../static/images/eyeOn.png" @click="passwordType='password'"/>
             </div>
             <div class="forget"><CheckboxCustom
             :checkboxStatus="checked"
             v-on:getCheckboxSataus="getCheckboxSataus"/><i>记住密码</i>
             </div>
             <div class="loginBtn"><button @click="login()">登录</button></div>
           </div>
         </div>
       </div>
     </div>
  </div>
</template>

<script>
  import CheckboxCustom from "../../components/publicComponemts/checkbox-custom.vue"
  export default {
    name: 'Login',
    components:{CheckboxCustom:CheckboxCustom},
    data () {
      return {
        userName:'',
        password:'',
        passwordType:"password",
        checked:true,
        platformName:"智慧监仓环境感知平台"
      }
    },
    created() {
      var parentData = {header:false,nav:0};
      this.$emit('headerChange',parentData);
      if(localStorage.getItem("keyup")){localStorage.removeItem("keyup")};
      this.getSystemName();
    },
    mounted() {
      history.pushState(null, null, document.URL);
      window.addEventListener("popstate",function(e){
          history.pushState(null, null, document.URL);
      }, false);
      this.userName = localStorage.getItem('userName');
      this.password = localStorage.getItem('passWord');
      this.enterLogin();   //enter回车登录
    },
    methods:{
      // 接收checkbox-custom组件传回啦的数据
      getCheckboxSataus:function(data){
        this.checked = data;
      },
      //键盘回车登录事件
      enterLogin:function(){
      	let self = this;
      	document.onkeyup = function(e) {
          let keyupStatus = localStorage.getItem("keyup");
          if(keyupStatus == null){
            let keycode = document.all ? event.keyCode : e.which;
            if (keycode == 13) {
            	self.login();
            	return false;
            }
          }
      	};
      },
      login:function(){
        let self = this;
        if(self.userName == "" || self.userName == null){self.$message.error("用户名不得为空.");return false;}
        if(self.password == "" || self.password == null){self.$message.error("用密码不得为空.");return false;}
        let [url,data] = ['/sup/user/login',{'userName':self.userName,'password':self.password}];
        var opt = {
            lock: true,
            text: '登录中...',
            spinner: 'el-icon-loading',
            customClass:'loadingClass',
            background: 'rgba(0, 0, 0, 0.5)',
        }
        const loading = self.$loading(opt)
        setTimeout(function(){
          self.$http.post(url,data).then(function(result){
            console.log(result);
            if(result.data.flag){
              loading.close();
              localStorage.setItem('token',result.data.msg);   //存储登录成功后的token
              localStorage.setItem("keyup",true);   //定义回车事件是否可以使用
              localStorage.setItem("rel",result.data.data.role);        //存储当前登录的用户身份标志，1超级管理员，2其他的为普通用户,3另一种普通用户(权限比普通用户多)
              localStorage.setItem('userName',self.userName);
              localStorage.setItem('passWord1',self.password); //这里将用户密码存了一次
              if(self.checked){
                localStorage.setItem('passWord',self.password);  //这里又将用户密码存了一次，两次存的意义不同，作用也不同
              }else{
                localStorage.setItem('passWord',"");
              }
              self.$router.push({path:'/components/Index',name: 'Index'});
            }else{
              loading.close();
              self.$message.error(result.data.msg);
            }
          }).catch(function(erro){
            loading.close();
             console.log(erro)
             self.$message.error("登录失败,服务器异常");
          })
        },500)
      },
      //获取系统名称
      getSystemName:function(){
        let self = this;
        let [url,data] = ['/sup/version/query',''];
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.platformName = result.data.data[0].platformName;
            localStorage.setItem("system",result.data.data[0].platformName);
            localStorage.setItem("version",result.data.data[0].version);
            localStorage.setItem("systemId",result.data.data[0].id);
            localStorage.setItem("createTime",result.data.data[0].createTime);
          }else{
            self.$message({message:'删除失败',type:'warning'});
          }
        }).catch(function(erro){
           console.log(erro)
        })
      }
    }
  }
</script>

<style>
  @import url("../../../static/css/Login/Login.css");
</style>
