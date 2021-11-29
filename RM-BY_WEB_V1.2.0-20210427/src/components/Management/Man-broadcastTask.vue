<!-- 任务广播 -->
<template>
  <div class="man_broParnet">
    <!-- 日常广播 -->
    <div v-if="userRel !==2">
      <div class="smallTitle">日常广播</div>
      <div class="man_broParnetAfter">
         <div class="man_broPlus"><button @click="addNewsTask()"><span class="el-icon-plus"></span> 添加</button></div>
         <div class="man_broTable">
           <el-table :data="taskList" style="width: 100%">
             <el-table-column prop="radioName" label="任务" width="180"></el-table-column>
             <el-table-column prop="radioTime" label="时间" width="180"></el-table-column>
             <el-table-column prop="weekRange" label="重复"></el-table-column>
             <el-table-column prop="unitRange" label="广播范围"></el-table-column>
             <el-table-column prop="radioContent" label="广播内容"></el-table-column>
             <el-table-column label="操作" width="180">
               <template slot-scope="scope">
                 <button class="man_broEdit" @click="handleEdit(scope.row)"><span class="el-icon-edit"></span> 编辑</button>
                 <button class="man_broDel" @click="handleDelete(scope.row)"><span class="el-icon-delete"></span> 删除</button>
               </template>
             </el-table-column>
           </el-table>
           <!-- 分页 -->
           <pagingComponentTask v-show="task_totalPage>1"/>
         </div>
      </div>
    </div>
    <!-- 添加或编辑日常广播 -->
    <div class="editBox" v-if="broadcast">
      <div class="editBoxAfter" style="width:500px;">
        <div class="editTitle"><p>添加/编辑</p><span @click="openAndHideBroadcast">×</span></div>
        <ul class="editMode">
          <li><span class="man_broEditLi">任务：</span><p class="man_broEditPut"><input type="text" v-model="m_task" placeholder="请输入任务名称"/></p></li>
          <li><span class="man_broEditLi">时间：</span>
             <div class="editTime" style="width:250px;">
               <el-time-picker v-model="m_time" arrow-control value-format="HH:mm:ss" :picker-options="{}" placeholder="任意时间点"></el-time-picker>
             </div>
          </li>
          <li><span class="man_broEditLi">重复：</span>
             <div class="editMM" style="width:250px;">
               <el-select v-model="m_repeat" multiple collapse-tags placeholder="请选择" @change="repeatSelect">
                 <el-option v-for="item in m_repeatOpt" :key="item.value" :label="item.label" :value="item.value"></el-option>
               </el-select>
             </div>
          </li>
          <li><span class="man_broEditLi">广播范围：</span>
            <div class="editMM" style="width:250px;">
              <RegionSelection v-if="userRel==1" v-on:regionChanged="emergencyBroad1" v-bind:RegionSelectData="m_Application"/>
              <RegionSelectionUnAll v-if="userRel==3" v-on:regionChanged="emergencyBroad1" v-bind:RegionSelectData="m_Application"/>
            </div>
          </li>
          <li><span class="man_broEditLi">广播内容：</span>
            <div class="editMM" style="width:250px;">
              <el-radio-group v-model="m_BroaContent">
                <el-radio :label="1">广播铃声</el-radio>
                <el-radio :label="2">广播语音</el-radio>
              </el-radio-group>
            </div>
          </li>
          <li v-if="m_BroaContent==1"><span class="man_broEditLi">铃声选择：</span>
            <div class="editMM" style="width:250px;">
              <RingtoneSelection v-on:ringingChanged="ringingUpdata1" v-bind:RingtoneSelectData="m_ringingTone"/>
            </div>
          </li>
          <li v-if="m_BroaContent==2"><span class="man_broEditLi">语音文本：</span><p class="man_broEditPut"><input type="text" v-model="m_voiceText" maxlength="80" placeholder="请输入语音文本(80字以内)"/></p></li>
        </ul>
        <div class="editBtn"><button @click="nullTaskChecking()">确定</button> <button @click="openAndHideBroadcast">取消</button></div>
      </div>
    </div>

    <!-- 紧急插播 -->
    <div class="smallTitle">紧急插播</div>
    <div style="padding:5px 0px 5px 28px;">
    <div style="width: 470px;display:inline-block;vertical-align:top;margin-right:10px;">
      <div class="man_broCutInBtn">
        <div class="editMM" style="width:325px;">
          <RegionFloorSelection v-on:regionFloorChanged="emergencyBroad2" v-bind:RegionFloorData="e_Application"/>
        </div>
        <button @click="emergencyBroadcast()"><span class="el-icon-s-promotion"></span> 确定</button>
      </div>
      <div class="man_broCutIarent">
        <textarea class="man_broCutIn" v-model="broadcastTxt" maxlength="80" @keyup="broadcastLeng" @blur="broadcastTxtBurl" placeholder="请输入插播内容(80字以内)..."></textarea>
        <p class="taskWordLength">{{broadcastTxt.length}}/80</p>
      </div>
    </div>

    <div class="man_selectWord">
      <p class="man_selectWordTitle">常用语选择：</p>
      <ul class="man_selectList">
        <li v-for="(listWord,index) in selectWordList" v-bind:key="index"
        v-bind:class="index===wordIndex?'man_wordColor':''">
        <span @click="selectWord(index,listWord)">{{listWord.radioContent}} </span>
        <i class="el-icon-circle-close" @click="deleteCommomWordList(listWord.radioNewsId)"></i>
        </li>
        <h4 class="man_selectWordTip" v-if="selectWordList.length==0">你还没有常用语,赶快添加吧</h4>
      </ul>
      <div class="man_wordPut">
        <input type="text" v-model="addSelectWord" maxlength="80" placeholder="请输入你需要的常用语."/>
        <p>{{addSelectWord.length}}/80</p>
        <button @click="addNewsWord">添加</button>
      </div>
    </div>
    </div>
    <!-- 音量设置 -->
    <div class="smallTitle">音量设置</div>
    <div class="man_volume">
      <span class="man_outline el-icon-remove-outline" title="减小音量" @click="reduceVolume()"></span>
      <el-slider class="man_vSlider" v-model="sliderValue" :min="0" :max="5"></el-slider>
      <span class="man_outline el-icon-circle-plus-outline" title="增加音量" @click="plusVolume()"></span>
      <img class="man_volumeIco" src="../../../static/images/volume.png" />
      <span class="man_volumeVal">{{sliderValue}}</span>
      <button class="man_volBtn" @click="saveVolume()">保存修改</button>
    </div>
  </div>
</template>

<script>
  var page = 1;
  var stus = false;
  var loading = "";  //定义loading
  var opt = {
      lock: true,
      text: '数据获取中...',
      spinner: 'el-icon-loading',
      customClass:'loadingClass',
      background: 'rgba(0, 0, 0, 0.5)',
  }
  //import Bus from "../../newObject/Bus.js";
  import pagingComponentTask from "../publicComponemts/pagingComponent.vue";
  import RegionSelection from "../publicComponemts/RegionSelection.vue";
  import RegionFloorSelection from "../publicComponemts/RegionFloorSelection.vue";
  import RingtoneSelection from "../publicComponemts/RingtoneSelection.vue";
  import RegionSelectionUnAll from "../publicComponemts/RegionSelectionUnAll.vue"
  export default{
    name:"Man-broadcastTask",
    components:{RegionSelection:RegionSelection,
      pagingComponentTask:pagingComponentTask,
      RingtoneSelection:RingtoneSelection,
      RegionFloorSelection:RegionFloorSelection,
      RegionSelectionUnAll:RegionSelectionUnAll,
    },
    data(){
      return{
        userRel:Number(localStorage.getItem("rel")),  //定义当前的用户身份
        broadcast:false,
        taskList:[],            //任务列表
        task_totalPage:1,            //定义总页数
        radioId:'',           //任务id
        m_task:"",            //任务名称
        m_time:"",            //选中的时间
        m_repeat: [],         //选中的重复结果
        //可用的重复选择值
        m_repeatOpt: [
          {value: '每天',label: '每天'},
          {value: '星期日',label: '星期日'},
          {value: '星期一',label: '星期一'},
          {value: '星期二',label: '星期二'},
          {value: '星期三',label: '星期三'},
          {value: '星期四',label: '星期四'},
          {value: '星期五',label: '星期五'},
          {value: '星期六',label: '星期六'},
        ],
        m_Application:[],       //选中的范围结果
        props: { multiple: true },
        scopeSelection: [{value:"00000",label:'全部'}],     //范围可选择值
        m_BroaContent:1,
        m_ringingTone:'',      //铃声code
        m_ringingContent:"",   //铃声名字
        m_voiceText:"",        //语音文本
        e_Application:[],      //紧急广播播放区域
        broadcastTxt:"",       //紧急插播文本
        broadcastTxtLengt:0,   //定义紧急插播文本的长度
        selectWordList:[],
        wordIndex:"",          //常用语选择后的索引值
        addSelectWord:"",      //新添加的常用语输入框
        sliderValue:2,         //定义音量默认等级
		    volumeId:"",           //定义音量id
      }
    },
    created() {
      this.getUnitAndFloor();
      this.getTaskList(page);
      this.getVolume(); //获取音量值
      this.getNewsWord();  //获取常用语数据
    },
    mounted() {
      //监听子组件 pagingComponent传过来的数据
      this.$eventBus.$on("updataPage",this.updataPage);
    },
    methods:{
      //根据分页子组件返回的数据请求新的报警记录数据
      updataPage:function(page,type){
        if(type == "task"){this.getTaskList(page);}
      },
      //获取可选择的栋数
      getUnitAndFloor:function(){
        var self = this;
        var url = "/sdm/unit/getUnitFloor";
        self.$http.post(url).then(function(result){
          console.log(result)
          if(result.data.flag){
            if(result.data.rows.length>0){
              for(var i=0;i<result.data.rows.length;i++){
                var list = {value: "",label: ''};
                list.value = result.data.rows[i].unitCode;
                list.label = result.data.rows[i].unitName;
                self.scopeSelection.push(list);
              }
            }
          }
        }).catch(function(erro){
           console.log(erro)
        })
      },
      //获取 日常广播 返回的范围
      emergencyBroad1:function(data){
        this.m_Application=data;
      },
      //获取 紧急插播 返回的范围
      emergencyBroad2:function(data){
        this.e_Application=data;
      },
      //获取返回的铃声类型
      ringingUpdata1:function(data){
        this.m_ringingTone = data.value;
        this.m_ringingContent = data.label;
      },
      //获取 重复 项选中后的结果
      repeatSelect:function(data){
        var self = this;
        if(data.length>0){
          var MM = data.slice(-1)
          if(MM == "每天"){
            self.m_repeat=[];self.m_repeat.push("每天")
          }else{
            data.forEach(function(arr,index){
              if(arr == "每天"){self.m_repeat.splice(index,1)}
            })
            if(data.length == 7){
              var stst = 1;
              data.forEach(function(arr,index){
                if(arr == "每天"){stst = 0;}
              })
              if(stst == 1){self.m_repeat=[];self.m_repeat.push("每天")};
            }
          }
        }
      },
      //打开或关闭编辑弹窗
      openAndHideBroadcast:function(){
        if(this.broadcast){this.broadcast=false}else{this.broadcast=true}
      },
      //打开弹窗 添加新的广播任务
      addNewsTask:function(){
        this.openAndHideBroadcast();
        this.radioId = "";         //清空任务id
        this.m_task="";            //任务名称
        this.m_time="";            //选中的时间
        this.m_repeat=[];         //选中的重复结果
        this.m_Application=[];       //选中的范围结果
        this.m_BroaContent=1;
        this.m_ringingTone="";      //铃声结果
        this.m_voiceText="";         //语音文本
      },
      //正则验证
      nullTaskChecking:function(){
        var self = this;
        if(self.m_task == ""){self.$message({message:'广播任务名称不得为空',type:'warning'});return false;}
        if(self.m_time == "" || self.m_time == null){self.$message({message:'时间不得为空',type:'warning'});return false;}
        if(self.m_repeat == ""){self.$message({message:'重复不得为空',type:'warning'});return false;}
        if(self.m_Application == ""){self.$message({message:'广播范围不得为空',type:'warning'});return false;}
        if(self.m_BroaContent == 1){
          if(self.m_ringingTone == ""){self.$message({message:'铃声选择不得为空',type:'warning'});return false;}
        }else{
          if(self.m_voiceText == "" || self.m_voiceText.length>100){self.$message({message:'语音文本不得为空,或大于100字',type:'warning'});return false;}
        }
        self.saveNewsTaskData();   //验证通过后开始执行保存
      },
      //保存编辑后的弹窗内的数据
      saveNewsTaskData:function(){
        var self = this;
        var url = "/sdm/radio/editRadio";
        var broType = ""
        if(self.m_BroaContent ==1){
          broType = {"radioContent":self.m_ringingContent,"radioCode":self.m_ringingTone,}
        }else{
          broType = {"radioContent":this.m_voiceText,"radioCode":"",}
        }
        var unitData = [];
        var unitCodeData = [];
        var unitList = self.m_Application;
        if(self.scopeSelection.length>0){
          self.scopeSelection.forEach(function(arr,index){
            var code = arr.value;
            if(unitList.length>0){
              unitList.forEach(function(dat,index){
                if(code == dat){unitData.push(arr.label);unitCodeData.push(arr.value);}
              })
            }
          })
        }
        var data = {
          "radioId":self.radioId,
          "radioName":self.m_task,
          "radioTime":self.m_time,
          "radioType":self.m_BroaContent,
          "weekData":self.m_repeat,
          "unitData":unitData,
          "unitCodeData":unitCodeData
        };
        Object.assign(data,broType);
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.getTaskList(page);
            self.$message({message:'添加成功',type: 'success'});
          }else{
            self.$message({message:result.data.msg,type:'warning'});
          }
          self.openAndHideBroadcast();   //关闭编辑弹窗
        }).catch(function(erro){
           console.log(erro)
           self.openAndHideBroadcast();   //关闭编辑弹窗
        })
      },
      //获取广播任务列表
      getTaskList:function(page){
        var self = this;
        var url = "/sdm/radio/getRadioList";
        var data = {"pageNo":page,"pageSize":20};
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.$eventBus.$emit('deviceListDataReturn',result.data,'task');  //生成分页
            self.taskList = result.data.dataList;
            self.task_totalPage = result.data.totalPage;  //获取总共有多少页
            page = result.data.page;   //获取当前页
          }
        }).catch(function(erro){
           console.log(erro)
        })
      },
      //点击编辑按钮，打开编辑弹窗
      handleEdit:function(reslut){
        this.m_voiceText = "";    //编辑弹窗前先清空历史可能存留的m_voiceText历史数据
        this.openAndHideBroadcast();
        this.radioId = reslut.radioId;           //任务id
        this.m_task = reslut.radioName;            //任务名称
        this.m_time = reslut.radioTime;            //选中的时间
        this.m_repeat = reslut.weekData;         //选中的重复结果
        this.m_Application = reslut.unitCodeData;       //选中的范围结果
        this.m_BroaContent = reslut.radioType;
        this.m_ringingTone = reslut.radioCode;          //铃声结果
        //语音文本
        if(reslut.radioType == 1){
          this.m_ringingContent = reslut.radioContent;
        }else{
          this.m_voiceText = reslut.radioContent;
        }
      },
      //点击删除按钮，删除列表
      handleDelete:function(reslut){
        var self = this;
        console.log(reslut.radioId);
        self.$confirm('是否删除这条任务?', '提示', {confirmButtonText: '确定',cancelButtonText: '取消',type: 'warning'
            }).then(() => {
              var url = "/sdm/radio/delRadio";
              var data = {"radioId":reslut.radioId};
              self.$http.post(url,data).then(function(result){
                console.log(result)
                if(result.data.flag){
                  self.$message({message:'删除成功',type: 'success'});
                  self.getTaskList(page);
                }else{
                  self.$message({message:result.data.msg,type: 'warning'});
                }
              }).catch(function(erro){
                 console.log(erro)
              })
            }).catch(() => {});
      },
      //紧急插播
      emergencyBroadcast:function(){
        var self = this;
        if(self.broadcastTxt == "" || self.broadcastTxt.length>80){self.$message({message:"广播内容不得为空,或大于80字",type: 'warning'});return false;}
        if(self.e_Application == ""){self.$message({message:"请选择广播覆盖区域",type: 'warning'});return false;}
        let [floorCode,imeiList,unitData] = [[],[],JSON.parse(localStorage.getItem('unitData'))];
        let allCode = JSON.parse(JSON.stringify(self.e_Application))[0][1];
        if(allCode == "00000"){
          floorCode.push(allCode); imeiList = [];
        }else{
          let aaaa = sortClass(self.e_Application);  //定义选中的楼层以及房间数据
          //将self.e_Application的数据传入sortClass 然后根据楼层code将相同的code数据进行归类，返回分类后的数据
          function sortClass(sortData){
            const groupBy = (array, f) => {
              let groups = {};
              array.forEach((o) => {
                let group = JSON.stringify(f(o));groups[group] = groups[group] || []; groups[group].push(o);
              });
              return Object.keys(groups).map((group) => {return groups[group];});
            };
            // 返回需要分组的对象
            const sorted = groupBy(sortData, (item) => {return item[1];});
            return sorted;
          };

          //根据全部的楼层信息数据unitData，以及当前选中的楼层数据aaaa(已经经过分类)进行code值对比，
          //当发现unitData[i].floorName 等于aaaa[n][0][1] 的值时，再判断unitData[i].roomLeng==aaaa[n].length
          //如果相等那么取出当前的unitData[i].floorName值存入 变量floorCode中，floorCode主要用于收集当前楼层所有的房间都被选中了
          //那么就获取该楼层的floorCode，如果该楼层的房间并没有全部被选中，那么就取对应的所有房间imei(房间唯一code值)
          //然后将得到的房间code存入imeiList,其实就是根据情况分别收集floorCode，和imei
          for(let i=0;i<unitData.length;i++){
            let bbb = unitData[i].floorName;
            for(let n=0;n<aaaa.length;n++){
              if(bbb == aaaa[n][0][1] && unitData[i].roomLeng==aaaa[n].length){
                floorCode.push(bbb);
              }else if(bbb == aaaa[n][0][1] && unitData[i].roomLeng !==aaaa[n].length){
                let tt = aaaa[n];
                for(let v=0;v<tt.length;v++){imeiList.push(tt[v][2]);}
              }
            }
          }
        }
        loading = self.$loading(opt);   //打开请求loading
        let [url,data] = ['/sdm/radio/urgentRadio',{"content":self.broadcastTxt,"floorCodeList":floorCode,imeiList:imeiList}];
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.$message({message:'添加成功',type: 'success'});
          }else{
            self.$message({message:result.data.msg,type: 'warning'});
          }
          loading.close();  //请求操作完成后关闭loading
        }).catch(function(erro){
           loading.close();  //请求操作完成后关闭loading
           self.$message({message:erro.data.msg,type: 'warning'});
        })
      },
      //keyup事件监听广播输入框
      broadcastLeng:function(){
        var txtLength = this.broadcastTxt.length;
        this.broadcastTxtLengt = txtLength;
      },
      //编辑插播输入框
      broadcastTxtBurl:function(){
        if(this.wordIndex !== ""){
          var selectWord = this.selectWordList[this.wordIndex].radioContent;
          if(this.broadcastTxt !== selectWord){this.wordIndex = "";}
        }
      },
      //选择常用插播语言
      selectWord:function(index,data){
        this.wordIndex = index;
        this.broadcastTxt = data.radioContent;
      },
      //或取所有的常用语
      getNewsWord:function(){
        var self = this;
        var url = "/sdm/radionews/getRadioNews";
        var data = "";
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.selectWordList = result.data.rows;
          }else{
            self.$message({message:result.data.msg,type: 'warning'});
          }
        }).catch(function(erro){
           self.$message({message:erro.data.msg,type: 'warning'});
        })
      },
      //添加新的常用语
      addNewsWord:function(){
        var self = this;
        if(self.addSelectWord !== ""){
          var url = "/sdm/radionews/editRadioNews";
          var data = {"radioContent":self.addSelectWord};
          self.$http.post(url,data).then(function(result){
            console.log(result)
            if(result.data.flag){
              self.$message({message:"添加成功！",type: 'success'});
              self.addSelectWord = "";
              self.getNewsWord();  //重新获取常用语列表
            }else{
              self.$message({message:result.data.msg,type: 'warning'});
            }
          }).catch(function(erro){
             self.$message({message:erro.data.msg,type: 'warning'});
          })
        }else{
          self.$message({message:"输入框不得为空",type:'warning'});
        }
      },
      //删除常用语
      deleteCommomWordList:function(newId){
        var self = this;
        var url = "/sdm/radionews/delRadioNews";
        var data = {radioNewsId:newId};
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.$message({message:"删除成功！",type: 'success'});
            self.getNewsWord();  //重新获取常用语列表
          }else{
            self.$message({message:result.data.msg,type: 'warning'});
          }
        }).catch(function(erro){
           self.$message({message:erro.data.msg,type: 'warning'});
        })
      },

      //添加/减小 语音音量
      reduceVolume:function(){
        var slider = this.sliderValue;
        if(slider !==0){
          this.sliderValue = slider-1;
        }else{
          this.sliderValue = 0;
          this.$message({message:"已经是最小音量了",type: 'warning'});
        }
      },
      plusVolume:function(){
        var slider = this.sliderValue;
        if(slider !==5){
          this.sliderValue = slider+1;
        }else{
          this.sliderValue = 5;
          this.$message({message:"已经是最大音量了",type: 'warning'});
        }
      },
      //保存修改后的音量值
      saveVolume:function(){
        var self = this;
        var url = "/sdm/volume/editVolume";
        var data = {"gear":self.sliderValue,"volumeId":1};
        loading = self.$loading(opt);   //打开请求loading
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            self.$message({message:"修改成功！",type: 'success'});
          }else{
            self.$message({message:result.data.msg,type: 'warning'});
          }
          loading.close();  //请求操作完成后关闭loading
        }).catch(function(erro){
           console.log(erro)
           loading.close();  //请求操作完成后关闭loading
           self.$message({message:erro.data.msg,type: 'warning'});
        })
      },
      //获取音量值
      getVolume:function(){
        var self = this;
        var url = "/sdm/volume/getVolume";
        var data = "";
        self.$http.post(url,data).then(function(result){
          console.log(result)
          if(result.data.flag){
            if(result.data.data !== null){
              self.sliderValue = result.data.data.gear
              self.volumeId = result.data.data.volumeId
            }
          }else{
            self.sliderValue = 0; self.volumeId = "";
            self.$message({message:result.data.msg,type: 'warning'});
          }
        }).catch(function(erro){
           console.log(erro)
           self.$message({message:erro.data.msg,type: 'warning'});
        })
      }
    },
    beforeDestroy(){
      this.$eventBus.$off('updataPage');  //关闭兄弟组件之间传递信息时$on会多次触发的问题
    }
  }
</script>

<style>
  @import url("../../../static/css/Management/Man-broadcastTask.css");
</style>
