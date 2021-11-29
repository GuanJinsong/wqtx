<template>
  <div class="login" id="particles-js">
    <!-- 动态背景容器 -->
    <!-- <canvas class="particles-js-canvas-el"></canvas> -->
    <div class="loginAft">
    <!-- <p class="loginTitle"><img src="../../../static/images/loginName.png"/></p> -->
    <div class="loginAfter">
     <div class="log_flex">
       <div class="loginIco"><img src="../../../static/images/logo1.png"/> | 智能宿管安全管理平台</div>
       <div class="log_parent">
         <div class="log_left">
           <h6 class="loginH6">登录....</h6>
           <input type='text' style='width:0px;height:0px;opacity:0;'> <!-- 这里input设置长宽为0，透明度为0是为了解决浏览器自动填充的问题 -->
           <p class="loginSmallTitle">账户：</p>
           <div class="loginPut"><input type="text" id="userName" placeholder="请输入账户" v-model="userName" autocomplete="off" ></input></div>
           <p class="loginSmallTitle">密码：</p>
           <div class="loginPut"><input class="passPut" id="userPassWord" type="password" placeholder="请输入密码" v-model="password" autocomplete="new-password" style="background-color: #FFFFFF!important;" readonly onfocus="this.removeAttribute('readonly');" onblur="this.setAttribute('readonly',true);"></input></div>
           <div class="log_checked">
              <el-checkbox-group v-model="checkList">
                 <el-checkbox label="记住密码"></el-checkbox>
              </el-checkbox-group>
           </div>
           <button class="log_loginBtn" id="loginBtn" @click="login">登录</button>
         </div>
         <div class="log_right">
           <div class="log_rightImg"><img src="../../../static/images/login.png"/></div>
         </div>
       </div>
     </div>
    </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      userName: '',
      password:'',
      checkList: ['记住密码']
    }
  },
  created() {
    var parentData = {header:0,nav:0};
    this.$emit('headerChange',parentData);
    if(localStorage.getItem("keyup")){localStorage.removeItem("keyup")};
    //this.backgroundAnimation1();  // 动态背景函数
  },
  mounted() {
    history.pushState(null, null, document.URL);
    window.addEventListener("popstate",function(e) {
        history.pushState(null, null, document.URL);
    }, false);
    this.userName = localStorage.getItem('userName');
    this.password = localStorage.getItem('passWord');
    this.enterLogin();   //enter回车登录
  },
  methods:{
    enterLogin:function(){
    	var self = this;
    	document.onkeyup = function(e) {
        var keyupStatus = localStorage.getItem("keyup");
        if(keyupStatus == null){
          var keycode = document.all ? event.keyCode : e.which;
          if (keycode == 13) {
          	self.login();
          	return false;
          }
        }
    	};
    },
    login:function(){
      var self = this;
      if(self.userName == "" || self.userName == null){self.$message.error("用户名不得为空.");return false;}
      if(self.password == "" || self.password == null){self.$message.error("用密码不得为空.");return false;}
      var url = "/sdm/user/userlogin";
      var data = {'name':self.userName,'password':self.password};
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
            localStorage.setItem('token',result.data.token);
            localStorage.setItem("keyup",true);   //定义回车事件是否可以使用
            localStorage.setItem("rel",result.data.role);        //存储当前登录的用户身份标志，1超级管理员，2其他的为普通用户,3另一种普通用户(权限比普通用户多)
            if(self.checkList[0] == "记住密码"){
              localStorage.setItem('userName',self.userName);
              localStorage.setItem('passWord',self.password);
            }else{
              localStorage.setItem('userName',"");
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
    backgroundAnimation1:function(){
      const oScript = document.createElement('script');
      oScript.type = 'text/javascript';
      oScript.src = "../../static/js/lizi.js";
      document.body.appendChild(oScript);
    },
  }
}
</script>
<style>
  @import url("../../../static/css/Login/Login.css");
</style>
