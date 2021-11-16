<!-- 软件版本 -->
<template>
  <div class="sys_verBox">
     <div class="sys_verTop">
        <div class="sys_verTitile"><h6>软件版本</h6></div>
        <div class="sys_verbox">
          <el-upload ref="upload" class="sys_verIco_box" :action="this.$global.RequestUrl + '/sup/version/uploadImage'" name="image" :data="{id: systemId}" accept="image" :before-upload="beforeSystemIconUpload" :on-success="onSystemIconUploadSuccess" :limit="1" :show-file-list="false" :multiple="false">
            <img v-if="systemIcon" class="sys_verIco" :src="systemIcon" />
            <img v-else class="sys_verIco" src="../../../static/images/icon.png" />
          </el-upload>
          <ul class="sys_verboxUl">
            <li><span>系统名称:</span>
              <input type="text" v-model="systemName"
               v-focus="read" v-bind:readonly="read"
               maxlength="16"
               @dblclick="changeSystemName()"
               @blur="changeCount($event)"
               v-bind:class="read==false?'sys_verBor':''"
              />
            </li>
            <li><span>系统版本:</span><p>V{{sysVersion}}</p></li>
            <li><span>发布时间:</span><p>{{createTime}}</p></li>
          </ul>
        </div>
     </div>
  </div>
</template>

<script>
  export default{
    name:"Sys-Version",
    data(){
      return{
        systemIcon:localStorage.getItem("systemIcon"),
        systemName:localStorage.getItem("system"),
        systemId:localStorage.getItem("systemId"),
        sysVersion:localStorage.getItem("version"),
        createTime:localStorage.getItem("createTime"),
        read:true,
      }
    },
    directives: {
      focus: {
        componentUpdated: function (el, {value}){
          if (value){el.focus();}
        }
      },
    },
    created() {
      let self = this;
      if(localStorage.getItem("keyVer")){localStorage.removeItem("keyVer")};
      this.getSystemName();  //获取系统相关信息
      
      let imageUrl = this.$global.RequestUrl + '/sup/version/getImage?id=' + this.systemId;
      this.checkImgExists(imageUrl).then(function(){
        self.systemIcon = imageUrl + '&time=' + Date();
      }).catch(function(){
        self.systemIcon = "";
      })
    },
    mounted() {
      this.enterChange();
    },
    methods:{
      changeSystemName:function(){
        this.read = false;
      },
      //获取系统相关信息
      getSystemName:function(){
        let self = this;
        let [url,data] = ['/sup/version/query',''];
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.systemName=result.data.data[0].platformName;
            self.sysVersion=result.data.data[0].version;
            self.createTime=result.data.data[0].createTime;
          }else{
            self.$message({message:'删除失败',type:'warning'});
          }
        }).catch(function(erro){
           console.log(erro)
        })
      },
      //键盘回车确认修改系统名称事件
      enterChange:function(){
      	var self = this;
      	document.onkeyup = function(e) {
          var keyupStatus = localStorage.getItem("keyVer");
          if(keyupStatus == null){
            var keycode = document.all ? event.keyCode : e.which;
            if (keycode == 13) {
            	self.enterCount(self.systemName);
            	return false;
            }
          }
      	};
      },
      //输入框光标失去焦点事件
      changeCount:function(event){
        var self = this;
        self.read = true;
        if(event.target.value == localStorage.getItem("system")){return false}; //如果修改前后内容完全一样，则不修改
        var valueLength = event.target.value.length;
        if(valueLength == 0){self.$message({message:"编辑后的名称不得为空",type:'warning'});return false}
        var url = "/sup/version/update";
        var data = {id:localStorage.getItem("systemId"),platformName:event.target.value};
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.$message({message: '修改成功',type: 'success'});
            localStorage.setItem("system",event.target.value);
            self.$eventBus.$emit('changeSystem',event.target.value); //向Header组件传递数据
          }else{
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
          self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      //编辑系统名称后的回车事件
      enterCount:function(word){
        var self = this;
        self.read = true;
        if(word == localStorage.getItem("system")){return false}; //如果修改前后内容完全一样，则不修改
        var valueLength = word.length;
        if(valueLength == 0){self.$message({message:"编辑后的名称不得为空",type:'warning'});return false}
        var url = "/sup/version/update";
        var data = {id:localStorage.getItem("systemId"),platformName:word};
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.$message({message: '修改成功',type: 'success'});
            localStorage.setItem("system",word);
            self.$eventBus.$emit('changeSystem',word); //向Header组件传递数据
          }else{
            self.$message({message:result.data.msg,type:'warning'});
          }
        }).catch(function(erro){
          self.$message.error(erro.data.msg);
          console.log(erro)
        })
      },
      //系统图片即将上传事件
      beforeSystemIconUpload() {
        
      },
      //系统图标上传成功事件
      onSystemIconUploadSuccess() {
        var self = this;
        let newUrl = self.$global.RequestUrl + '/sup/version/getImage?id=' + self.systemId + '&time=' + Date();
        self.$eventBus.$emit('changeSystemIcon', newUrl);
        self.systemIcon = newUrl;
        self.$refs.upload.clearFiles();
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
      localStorage.setItem("keyVer",true);
    }
  }
</script>

<style>
  @import url("../../../static/css/SystemSettings/Sys-Version.css");
</style>
