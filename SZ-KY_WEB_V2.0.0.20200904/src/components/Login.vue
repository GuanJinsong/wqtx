<template>
  <div id="loginView">
      <div class="login">
          <div class="login-box clear-fix">
              <div class="login-box-img"><p>快鱼生态因子监测平台</p><p>Kuaiyu Environmental Water Quality Monitoring Platform</p></div>
              <div class="login-box-right">
                  <div class="title">欢迎使用快鱼生态因子监测平台，现在登录...</div>
                  <input type='text' style='width:0px;height:0px;opacity:0;'> <!-- 这里input设置长宽为0，透明度为0是为了解决浏览器自动填充的问题 -->
                  <form class="login-form1">
                      <div><label for="">账号</label><input type="text" placeholder="请输入" v-model="loginName" autocomplete="off" id="loginName"></div>
                      <div><label for="">密码</label><input type="password" placeholder="请输入密码" v-model="passWord" autocomplete="new-password" readonly onfocus="this.removeAttribute('readonly');" onblur="this.setAttribute('readonly',true);" id="loginPwd" class="passPut"/></div>
                      <div><label for="" style="color:transparent">登录</label><input type="button" id="btnBlock" value="登录" @click="login()"></div>
                  </form>
              </div>
          </div>
      </div>
      <div class="pageButtonInfo">
        <p>©2015-2020 深圳市快鱼环保技术有限公司</p>
        <p><a href="http://www.beian.miit.gov.cn">粤ICP备18119528号</a></p>
        <p>联系我们:总机：0755-26929948  邮箱：hb@kyaf.com</p>
      </div>
  </div>
</template>

<script>
  export default {
    name: 'Login',
    data(){
      return{
        loginName:'',
        passWord:'',
      }
    },
    //=================================初始化函数由此开始===================================
    created(){
      if(localStorage.getItem("keyup")){localStorage.removeItem("keyup")};
      var parentData = {header:false,nav:0};
      this.$emit('headerChange',parentData);
    },
    mounted() {
      history.pushState(null, null, document.URL);
      window.addEventListener("popstate",function(e) {
          history.pushState(null, null, document.URL);
      }, false);
      this.loginName = localStorage.getItem('userName');
      this.passWord = localStorage.getItem('passWord');
      this.enterLogin();   //enter回车登录
    },
    //=================================初始化函数由此结束===================================
    methods:{
      //=================================enter回车登录开始==============================
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
      //=================================enter回车登录结束==============================
      //=================================登录由此开始===================================
      login:function(){
        var self = this;
        if(self.loginName == "" || self.loginName == null){self.$message.error("用户名不得为空.");return false;}
        if(self.passWord == "" || self.passWord == null){self.$message.error("用密码不得为空.");return false;}
        var data = {name:self.loginName,password:self.passWord};
        var url = "/api/login/userlogin";
        var opt = {
            lock: true,
            text: '登录中...',
            spinner: 'el-icon-loading',
            customClass:'loadingClass',
            background: 'rgba(0, 0, 0, 0.5)',
        }
        const loading = self.$loading(opt);
        setTimeout(function(){
          self.$http.post(url,data).then(function(result){
            var Result = result.data;
            console.log(result)
            if(Result.flag){
              loading.close();
              localStorage.setItem('userId',Result.userId);
              localStorage.setItem('userName',Result.userName);
              localStorage.setItem('passWord',self.passWord);
              localStorage.setItem('role',Result.role);
              localStorage.setItem('userKey',Result.userKey);
              localStorage.setItem("keyup",true);   //定义回车事件是否可以使用
              self.$store.dispatch('A_getUserInfo',{"userKey":Result.userKey,"userName":Result.userName});
              self.$emit("getUserInfo",{"userKey":Result.userKey,"userName":Result.userName,"role":Result.role})
              self.$router.push({path: '/components/Index',name: 'Index'})
            }else{
              loading.close();
              self.$message.error(Result.msg);
            }
          }).catch(function(erro){
            loading.close();
            self.$message.error(erro.msg);
          })
        },1500)
      },
      //=================================登录由此结束===================================
      destroyed() {

      },
    }
  }
</script>

<style>
.loadingClass{font-size:40px;}
#loginView{width: 100%;height: 100%;}
#loginView .login{width: 100%;height: 100%;display: flex;overflow: hidden;justify-content: center;align-items: center;position: relative;}
#loginView .login .login-box{width:772px;height:510px;position:relative; background: url(../../static/images/sy-dl.png) no-repeat center;background-size: 100% 100%;-webkit-background-size:100% 100%;-moz-background-size: 100% 100% ;}
#loginView .login .login-box .login-box-right{width:100%;height:510px;box-sizing: border-box;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;padding-left:345px; font-size:18px;}
#loginView .login .login-box .login-box-img{text-align: center;position:absolute;top:-54px;width:100%;}
.login-box-img p:first-child{color:#00CCFF;line-height:35px;font-size:33px;}
.login-box-img p:last-child{color:#00CCFF;line-height:12px;font-size:12px;}
#loginView .login .login-box .title{color: #e4fcff;height: 50px;line-height:50px; padding: 50px 0 40px 0}
#loginView .login .login-box .login-box-right label{color:#02efff;}

.passPut{text-security:disc;-webkit-text-security:disc;-mox-text-security:disc;}
#loginName,#loginPwd{box-sizing: border-box;position: relative;display: inline-block;width: 282px;height: 32px;font-size: 14px;line-height: 32px;border:2px solid #01a6d3;background: #1d313a;margin:28px 0 28px 25px;padding-left:10px;color:#e4fcff}
#btnBlock{display: inline-block;width: 284px;height: 34px;font-size: 14px;line-height: 32px;background: #01a6d3;margin:50px 0 20px 25px;color:#e4fcff;border:none;}
.pageButtonInfo{position:fixed;z-index:9999;left:0;bottom:0;right:0;height:20px;line-height:20px;background-color:rgba(0,0,0,0.5);color:#FFFFFF;display:flex;justify-content: center;}
.pageButtonInfo p{margin:0px 5px;font-size:12px;}
.pageButtonInfo p a{color:#FFFFFF;}
.pageButtonInfo p a:hover{color:#888888;}
</style>
