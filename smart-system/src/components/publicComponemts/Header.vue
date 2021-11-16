<template>
  <div class="headerBox">
    <div class="headerLeft">
     <ul class="headNav">
       <li class="headTitle">
         <span class="imageBox"><img v-if="systemIcon" :src="systemIcon"/></span>
         <span class="system-name">{{systemName}}</span>
        </li>
       <li v-for="(nav,index) in navList" v-bind:key="index"
          @click="changeTemplate(nav.id,nav.path,nav.name)"
          v-bind:class="nav.id == navIndex?'navSelect':''">{{nav.navName}}
       </li>
     </ul>
     </div>
     <div class="headUser">
       <div class="headUserleft">
         <el-tooltip placement="bottom-end">
           <div><span class="el-icon-user"></span><i>{{userName}}</i></div>
           <div class="userLofinOut" slot="content">
             <p @click="loginOut()"><i class="el-icon-switch-button"></i> <span>退出登录</span></p>
             <p @click="dialogFormVisible = true"><i class="el-icon-unlock"></i> <span>修改密码</span></p>
           </div>
         </el-tooltip>
       </div>
       <div class="headUseright"><p>{{newTime}}</p><p>{{newDay}} {{newWeek}}</p></div>
     </div>

     <!-- 用户修改密码 弹窗 -->
     <div class="poupParnet" v-if="dialogFormVisible">
     	<div class="poupParnetAfter" style="width:400px;">
     		<div class="poupTitle"><div class="poupTitleAfter"><h6>密码修改</h6><span @click="dialogFormVisible=false">×</span></div></div>
     		<div class="pubCenter">
           <input type='password' autocomplete="off" style='width:0px;height:0px;opacity:0;position:absolute;z-index:50;'>
           <ul class="hed_umPoup">
             <li><span class="umSmall">旧密码：</span><input class="hed_umPoupPut" type="text" v-model="oldWord" placeholder="请输入旧密码"/></li>
             <li><span class="umSmall">新密码：</span>
               <input class="hed_umPoupPut" :type="password" v-model="newWord" placeholder="请输入新密码"/>
               <img class="popEye" v-if="password=='password'" src="../../../static/images/eyeOff.png" @click="password='text'"/>
               <img class="popEye" v-else src="../../../static/images/eyeOn.png" @click="password='password'"/>
             </li>
           </ul>
         </div>
     		<div class="poupSure">
     			<button @click="dialogFormVisible=false">取消</button>
     			<button @click="changePassword()">确认</button>
     		</div>
     	</div>
     </div>
  </div>
</template>

<script>
  import { MessageBox } from "element-ui";
  export default{
    name:"Header",
    props:{
      navSelect:{type:Number,required:true}
    },
    data(){
      return{
        systemName:localStorage.getItem('system'),
        systemIcon:"",
        userName:localStorage.getItem('userName'),
        navIndex:0,   //定义初始选中的导航项
        newTime:"12:12:00",
        newDay:"2021/03/24",
        newWeek:"星期一",
        navList:[
          {id:0,navName:"智慧中心",name:'Index',path:'/components/Index/Index'},
          {id:1,navName:"电力控制",name:'PowerControl',path:'/components/PowerControl/PowerControl'},
          {id:2,navName:"监室管理",name:'RoomManage',path:'/components/RoomManage/RoomManage'},
          // {id:3,navName:"AI大数据",name:'AiCenter',path:'/components/AiCenter/AiCenter'},
          {id:4,navName:"系统设置",name:'SystemSettings',path:'/components/SystemSettings/SystemSettings'},
          {id:5,navName:"历史查询",name:'HistoryLog',path:'/components/HistoryLog/HistoryLog'},
        ],
        dialogFormVisible:false,   //定义修改密码弹窗是否显示
        oldWord:"",    //旧密码
        newWord:"",    //新密码
        password:"password",
      }
    },
    created() {
      this.navIndex = this.navSelect;
      this.getTheCurrentTime();

      let self = this;
      let imageUrl = this.$global.RequestUrl + '/sup/version/getImage?id=' + localStorage.getItem("systemId");
      this.checkImgExists(imageUrl).then(function(){
        self.systemIcon = imageUrl;
      }).catch(function(){
        self.systemIcon = "../../../static/images/icon.png";
      })
    },
    mounted() {
      //接收子组件Sys-Version 传过来的数据
      this.$eventBus.$on("changeSystem",this.changeSystems);
      this.$eventBus.$on('changeSystemIcon', this.changeSystemIcon);

      this.changeSystemNameFontsize();
    },
    methods:{
      changeSystemNameFontsize() {
        let doc = document.getElementsByClassName("system-name")[0]
        
        if (this.systemName.length <= 11) {
          // 11个字可以用设计的大小显示完全
          doc.style.fontSize = "26px";
        } else {
          // 15个字在既定范围内能显示的最大字体为18
          doc.style.fontSize = `${(16 - this.systemName.length) * 1.5 + 18}px`;
        }
      },
      changeSystems:function(data){
        this.systemName = data;
        this.changeSystemNameFontsize();
      },
      changeSystemIcon:function (data) {
        this.systemIcon = data;
      },
      //导航栏切换
      changeTemplate:function(index,path,name){
        this.navIndex = index;
        this.$router.push({path: path,name: name});
      },
      //获取当前的时间
      getTheCurrentTime:function(){
      var self = this;
        setInterval(function(){
          let data = new Date();
          let year = data.getFullYear();
          let month = data.getMonth() + 1;
          let day = data.getDate();
          let hours = data.getHours();
          let m = data.getMinutes();
          let se = data.getSeconds();
          let newDy = year + "/" +(month<10 ? "0" + month : month) + "/" +(day<10 ? "0"+ day : day) ;
          let newts = (hours<10 ? "0"+ hours : hours) + ":"+(m<10 ? "0" + m : m) + ":"+(se<10 ? "0" +se : se);
          self.newDay = newDy;
          self.newTime = newts;
          var l = ["日","一","二","三","四","五","六"];
          var d = new Date().getDay();
          var str = "星期" + l[d];
          self.newWeek=str;
        }, 1000);
      },
      //修改密码
      changePassword:function(){
        var self = this;
        if(self.oldWord == "" || self.oldWord == null){self.$message.error("旧密码不得为空.");return false;}
        if(self.newWord == "" || self.newWord == null){self.$message.error("新密码不得为空.");return false;}
        var url = "/sup/user/changePassword";
        var data = {'oldPassword':self.oldWord,'newPassword':self.newWord};
        var opt = {
            lock: true,
            text: '操作中...',
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
              MessageBox.alert("密码已修改，请重新登录.", "登录失效", {
                confirmButtonText: "跳转登录页面",
                callback: action => {
                  localStorage.clear();
                  //阻止浏览器返回的操作
                  history.pushState(null, null, document.URL);
                  window.addEventListener("popstate",function(e) {
                      history.pushState(null, null, document.URL);
                  }, false);
                  window.location.href = "/";
                }
              })
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
      //退出登录
      loginOut:function(){
        var self = this;
        self.$confirm('是否确认退出登录?', '退出提示', {
          confirmButtonText: '确定',cancelButtonText: '取消',type: 'warning'
        }).then(() => {
          //localStorage.clear();
          localStorage.removeItem('token');
          localStorage.removeItem('keyup')
          localStorage.removeItem('rel')
          self.$router.push({path:'/',name:'Login'});
          history.pushState(null, null, document.URL);
          window.addEventListener("popstate",function(e) {
              history.pushState(null, null, document.URL);
          }, false);
        }).catch(() => {
          console.log("退出失败")
        });
      },
      // 检测图片链接是否有效
      checkImgExists(imgurl) {
        return new Promise(function(resolve, reject) {
          var ImgObj = new Image();
          ImgObj.src = imgurl;
          ImgObj.onload = function(res) {
            resolve(res);
          }
          ImgObj.onerror = function(err) {
            reject(err)
          }
        })
      }
    },
    beforeDestroy() {
    	this.$eventBus.$off('changeSystem');  //关闭组件之间传递信息时$on会多次触发的问题
    }
  }
</script>

<style>
  @import url("../../../static/css/publicComponemts/Header.css");
</style>
