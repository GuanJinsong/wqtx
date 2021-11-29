<template>
  <div class="Dor_rooParentBefor">
    <!-- 报警分类选择 -->
    <div class="Dor_leftAfter">
      <div class="floorSwtBefor">
        <div class="editMM" style="width:255px;">
          <RegionFloorSelection1 v-on:regionFloorChanged="emergencyBroad2" v-bind:RegionFloorData="e_Application"/>
        </div>
        <div class="DorSwitBox"><p @click="AllFloorSwicth(true)">全开</p> <p @click="AllFloorSwicth(false)">全关</p></div>
      </div>
      <p class="floorNaBox"><span class="el-icon-office-building"></span>楼栋名：{{unitName}}</p>
      <div class="Dor_leftAfterBtn">
        <strong>排序：</strong>
        <button @click="alarmTypeSelect(6,1)" v-bind:class="alarmTypeSele==6?'alarmSect':''">亮度报警</button>
        <button @click="alarmTypeSelect(3,1)" v-bind:class="alarmTypeSele==3?'alarmSect':''">人员报警</button>
        <button @click="alarmTypeSelect(2,1)" v-bind:class="alarmTypeSele==2?'alarmSect':''">电量报警</button>
        <button @click="alarmTypeSelect(1,1)" v-bind:class="alarmTypeSele==1?'alarmSect':''">音量报警</button>
      </div>
    </div>
    <!-- 分页按钮 -->
    <p v-if="totalPage>1" class="changePage" @click="previousPage()" title="上一页"><span class="el-icon-back"></span></p>
    <p v-if="totalPage>1" class="changePage1" @click="nextPage()" title="下一页"><span class="el-icon-right"></span></p>
    <!-- 楼层下的房间-->
    <div class="Dor_rooParent">
      <div class="Dor_rooListBox" v-for="(list,index) in roomList" v-bind:key="index">
        <!-- 设备状态0 设备离线 -->
        <div class="Dor_rooListBoxAfter2 a0" v-if="list.onlineState==0">
          <div class="Dor_rooTitle">
            <span class="editIco el-icon-edit" @click="eitdeFloor(index,'focusName1')" @click.stop></span>
            <input type="text" class="titlePut" v-model="list.room" v-focus="isReadOnly ==index?true:''"
             @blur="changeCount(index,list.deviceId,$event)" v-bind:readonly="isReadOnly !==index"
             v-bind:disabled="isReadOnly !==index?true:false"
             v-bind:class="isEidt ==index?'Dor_eidt':''"></input>
            <i class="wsLine wsLineOut"></i>
            <el-switch class="roomSwitchIco ableColor"
               v-model="list.onlineState==1?true:false"  active-color="#13ce66" inactive-color="#626262" title="设备开关"
               active-text="开" inactive-text="关" :disabled="true">
             </el-switch>
          </div>
          <ul class="Dor_rooUl" @click="clickGetRoomImei(true,list,index)">
            <li>
              <div class="Dor_rooTable1"><div><img src="../../../static/images/sushe_24.png" alt=""/>
              <p>{{list.decibelValue}} dB</p> <p>音量</p></div></div>
            </li>
            <li>
              <div class="Dor_rooTable1" @click.stop>
                <div><img :src="offIco" class="mA_SwitchDis" title="电源开关" alt=""/>
                <p>{{list.powerValue}} mA</p> <p>电量</p></div>
              </div>
            </li>
            <li>
              <div class="Dor_rooTable1"><div><img src="../../../static/images/sushe_26.png" alt=""/>
              <p>{{list.beamValue}} Lux</p> <p>亮度</p></div>
              </div>
            </li>
            <li>
              <div class="Dor_rooTable1"><div><img src="../../../static/images/sushe_25.png" alt=""/>
              <p>{{list.human==0?'无':'有'}}</p> <p>人员</p></div>
              </div>
            </li>
          </ul>
        </div>
        <!-- 设备状态1 设备在线 -->
        <div v-else-if="list.onlineState==1" class="a1"
          v-bind:class="list.alarmNum>0?'Dor_rooListBoxAlarem':'Dor_rooListBoxAfter'">
          <div class="Dor_rooTitle">
            <span class="editIco el-icon-edit" @click.stop="eitdeFloor(index,'focusName1')"></span>
            <input type="text" class="titlePut" v-model="list.room" v-focus="isReadOnly ==index?true:''"
            @blur="changeCount(index,list.deviceId,$event)" v-bind:readonly="isReadOnly !==index"
            v-bind:disabled="isReadOnly !==index?true:false"
            v-bind:class="isEidt ==index?'Dor_eidt':''"></input>
            <i class="wsLine wsLineOn"></i>
           <el-switch class="roomSwitchIco ableColor"
              v-model="list.onlineState==1?true:false" title="设备开关"
              @change="onAndOffDevice(list.imei,list.onlineState==1?true:false,index,$event)"
              active-color="#13ce66" inactive-color="#626262" active-text="开" inactive-text="关">
            </el-switch>
          </div>
          <ul class="Dor_rooUl" @click="clickGetRoomImei(true,list,index)">
            <li>
              <div class="Dor_rooTable"><div><img :src="list.alarmState==1?soundImgTrueRed:soundImgTrue" alt=""/>
              <p>{{list.decibelValue}} dB</p> <p>音量</p></div></div>
            </li>
            <li>
              <div class="Dor_rooTable">
                <div>
                <img v-if="list.checkSwitch==1" :src="list.checkSwitchState==false?offIco:onIco" class="mA_SwitchAb" @click.stop="switchStatus(list.checkSwitchState,index,list.imei)" title="电源开关" alt=""/>
                <img v-else :src="offIco" @click.stop class="mA_SwitchDis" title="电源开关" alt=""/>
                <p :class="list.checkSwitch!=1 ? 'Dor_rooTable-disable-label' : ''">{{list.powerValue}} mA</p> <p :class="list.checkSwitch!=1 ? 'Dor_rooTable-disable-label' : ''">电量</p></div>
              </div>
            </li>
            <li>
              <div class="Dor_rooTable"><div><img :src="list.alarmState2==1?liumingTrueRed:liumingTrue" alt=""/>
              <p>{{list.beamValue}} Lux</p> <p>亮度</p></div></div>
            </li>
            <li>
              <div class="Dor_rooTable"><div><img :src="list.alarmState3==1?hunmanTrueRed:hunmanTrue" alt=""/>
              <p>{{list.human==0?'无':'有'}}</p> <p>人员</p></div></div>
            </li>
          </ul>
        </div>

        <!-- 设备状态2 设备在线，但是传感器检测状态关闭 -->
        <div class="Dor_rooListBoxAfter1 a2" v-else-if="list.onlineState==2">
          <div class="Dor_rooTitle">
            <span class="editIco el-icon-edit" @click="eitdeFloor(index,'focusName1')" @click.stop></span>
            <input type="text" class="titlePut" v-model="list.room" v-focus="isReadOnly ==index?true:''"
            @blur="changeCount(index,list.deviceId,$event)"  v-bind:readonly="isReadOnly !==index"
            v-bind:disabled="isReadOnly !==index?true:false"
            v-bind:class="isEidt ==index?'Dor_eidt':''"></input>
            <i class="wsLine wsLineOut"></i>
            <el-switch class="roomSwitchIco ableColor"
               v-model="list.onlineState==1?true:false" active-color="#13ce66" inactive-color="#626262"
               @change="onAndOffDevice(list.imei,list.onlineState==1?true:false,index,$event)"
               active-text="开" inactive-text="关">
             </el-switch>
          </div>
          <ul class="Dor_rooUl" @click="clickGetRoomImei(true,list,index)">
            <li>
              <div class="Dor_rooTable1"><div><img src="../../../static/images/sushe_24.png" alt=""/>
              <p>{{list.decibelValue}} dB</p> <p>音量</p></div>
              </div>
            </li>
            <li>
              <div class="Dor_rooTable1">
                <div>
                <img v-if="list.checkSwitch==1" :src="list.checkSwitchState==false?offIco:onIco" class="mA_SwitchAb" @click.stop="switchStatus(list.checkSwitchState,index,list.imei)" title="电源开关" alt=""/>
                <img v-else :src="offIco" class="mA_SwitchDis" title="电源开关" alt=""/>
                <p>{{list.powerValue}} mA</p> <p>电量</p></div>
              </div>
            </li>
            <li>
              <div class="Dor_rooTable1"><div><img src="../../../static/images/sushe_26.png" alt=""/>
              <p>{{list.beamValue}} Lux</p> <p>亮度</p></div>
              </div>
            </li>
            <li>
              <div class="Dor_rooTable1"><div><img src="../../../static/images/sushe_25.png" alt=""/>
              <p>{{list.human==0?'无':'有'}}</p> <p>人员</p></div>
              </div>
            </li>
          </ul>
        </div>

        <!-- 设备状态3 设备先失去检测能力，然后又掉线 -->
        <div class="Dor_rooListBoxAfter2" v-else-if="list.onlineState==3">
          <div class="Dor_rooTitle">
            <span class="editIco el-icon-edit" @click="eitdeFloor(index,'focusName1')" @click.stop></span>
            <input type="text" class="titlePut" v-model="list.room" v-focus="isReadOnly ==index?true:''" @blur="changeCount(index,list.deviceId,$event)" v-bind:readonly="isReadOnly !==index" v-bind:class="isEidt ==index?'Dor_eidt':''"></input>
            <i class="wsLine wsLineOut"></i>
            <el-switch class="roomSwitchIco ableColor cla1"
               v-model="list.onlineState==1?true:false" :disabled="true" title="设备开关"
               active-color="#13ce66" inactive-color="#626262"
               active-text="开" inactive-text="关">
             </el-switch>
          </div>
          <ul class="Dor_rooUl" @click="clickGetRoomImei(true,list,index)">
            <li>
              <div class="Dor_rooTable1"><div><img src="../../../static/images/sushe_24.png" alt=""/>
              <p>{{list.decibelValue}} dB</p> <p>音量</p></div></div>
            </li>
            <li>
              <div class="Dor_rooTable1">
                <div><img :src="offIco" class="mA_SwitchDis" title="电源开关" alt=""/>
                <p>{{list.powerValue}} mA</p> <p>电量</p></div>
              </div>
            </li>
            <li>
              <div class="Dor_rooTable1"><div><img src="../../../static/images/sushe_26.png" alt=""/>
              <p>{{list.beamValue}} Lux</p> <p>亮度</p></div>
              </div>
            </li>
            <li>
              <div class="Dor_rooTable1"><div><img src="../../../static/images/sushe_25.png" alt=""/>
              <p>{{list.human==0?'无':'有'}}</p> <p>人员</p></div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <!-- 设备状态4 设备不存在，这是模拟的设备,只用于展示避免页面出现空白区域 -->
      <div class="Dor_rooListBox" v-for="(item,ind) in (9-parseInt(roomList.length))" v-bind:key="ind+'n'">
        <div class="Dor_rooListBoxAfter2">
          <div class="Dor_rooTitle">
            <input type="text" value="" v-bind:readonly="true"></input>
          </div>
          <ul class="Dor_rooUl1">
            <li><div class="Dor_rooTable1"><div><img src="../../../static/images/sushe_24.png" alt=""/> <p>-- dB</p> <p>音量</p></div></div></li>
            <li><div class="Dor_rooTable1"><div><img src="../../../static/images/sushe_23.png" alt=""/> <p>-- mA</p> <p>电量</p></div></div></li>
            <li><div class="Dor_rooTable1"><div><img src="../../../static/images/sushe_26.png" alt=""/> <p>-- Lm</p> <p>亮度</p></div></div></li>
            <li><div class="Dor_rooTable1"><div><img src="../../../static/images/sushe_25.png" alt=""/> <p>--</p> <p>人员</p></div></div></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import Bus from "../../newObject/Bus.js";
import RegionFloorSelection1 from '../publicComponemts/RegionFloorSelection1.vue'
var page = 1 // 默认情况下的设备列表分页
var page1 = 1 // 带有报警类型排序的设备列表分页
var importWs0 = null, importWs1 = null, importWs2 = null, importWs3 = null, importWs4 = null, importWs5 = null, importWs6 = null, importWs7 = null, importWs8 = null, importWs9 = null
var setInter = null
var loading = '' // 定义loading
var opt = {
  lock: true,
  text: '数据获取中...',
  spinner: 'el-icon-loading',
  customClass: 'loadingClass',
  background: 'rgba(0, 0, 0, 0.5)'
}
export default{
  name: 'Dor-roomList',
  components: {RegionFloorSelection1: RegionFloorSelection1},
  data() {
    return {
      isReadOnly: -1,
      isEidt: -1,
      soundImgTrue: '../../../static/images/sushe_10.png',
      soundImgTrueRed: '../../../static/images/sushe_17.png',
      powerTrue: '../../../static/images/sushe_12.png',
      powerTrueRed: '../../../static/images/sushe_19.png',
      hunmanTrue: '../../../static/images/sushe_14.png',
      hunmanTrueRed: '../../../static/images/sushe_21.png',
      liumingTrue: '../../../static/images/sushe_15.png',
      liumingTrueRed: '../../../static/images/sushe_22.png',
      onIco: '../../../static/images/on.png',
      offIco: '../../../static/images/off.png',
      unitList: [], // 定义全开/全关下拉框的数据
      unitName: '', // 定义当前楼栋的名称
      unitId: '', // 定义当前楼栋的id
      floorId: '', // 定义当前楼层的id
      floorName: '', // 定义当前选中的楼层名称
      floorCode: '', // 定义楼层的code
      roomList: [], // 定义当前页的房间集合
      totalPage: 1, // 定义该层总共有几页的房间，每页九个房间
      Dswitch_v: false,
      disbaleValue: false, // 设置禁用电源设备开关
      alarmTypeSele: 0, // 定义当前选中的排序类型
      roomName: '', // 定义初始编辑时的房间名称
      editAble: false, // 定义是否允许宿舍名称编辑
      e_Application: [], // 选中的电源全关/全开区域
      roomIndex: 0, // 定义当前选中的房间索引值
      heartState: false
    }
  },
  directives: {
    focus: {
      componentUpdated: function (el, {value}) {
        if (value) { el.focus() }
      }
    }
  },
  created() {
    this.getUnitAndFloor() // 获取所有的楼栋
  },
  mounted() {
    // 监听兄弟组件 Dor-tree传过来的数据
    this.$eventBus.$on('updataRoomList', this.updataRoomLists)
    // 监听兄弟组件 Dor-alarmLog传过来的数据
    this.$eventBus.$on('updataRoomAlearm', this.updataRoomAlearms)
  },
  methods: {
    // 获取 设备全开全关 返回的范围
    emergencyBroad2: function(data) {
      let newArr = []
      if (data[0][1] == '00000') {
        let list = this.unitList
        for (let i = 0; i < list.length; i++) {
          let llt = list[i].children
          for (let n = 0; n < llt.length; llt++) {
            newArr.push(llt[n].value)
          }
        }
      } else {
        for (let i = 0; i < data.length; i++) { newArr.push(data[i][1]) } // 取出所有选中的楼层floorCode
      }
      this.e_Application = newArr
    },
    // 当处理报警记录时，返回当前还剩余未处理的报警记录数量，当数量为0时，红色的报警框消失
    updataRoomAlearms: function(data) {
      this.roomList[this.roomIndex].alarmNum = data
    },
    // 修改房间号可编辑状态
    eitdeFloor: function(index) {
      this.isReadOnly = parseInt(index)
      this.isEidt = parseInt(index)
      this.roomName = JSON.parse(JSON.stringify(this.roomList[index].room))
    },
    // 获取可选择的栋数
    getUnitAndFloor: function() {
      let self = this
      let url = '/sdm/unit/getUnitFloor'
      self.$http.post(url).then(function(result) {
        if (result.data.flag) {
          if (result.data.rows.length > 0) {
            let dataList = result.data.rows
            for (let i = 0; i < dataList.length; i++) {
              let list = {value: '', label: '', children: []}
              let floorList = dataList[i].floorData
              list.value = dataList[i].unitCode
              list.label = dataList[i].unitName
              for (let q = 0; q < floorList.length; q++) {
                let florlst = {value: '', label: ''}
                florlst.value = floorList[q].floorCode
                florlst.label = floorList[q].floorName
                list.children.push(florlst)
              }
              self.unitList.push(list)
            }
            console.log(self.unitList)
          }
        }
      }).catch(function(erro) {
        console.log(erro)
      })
    },
    // 宿舍名称编辑后输入框失去焦点事件
    changeCount: function(index, deviceId, event) {
      let self = this
      self.isReadOnly = -1; self.isEidt = -1
      if (event.target.value == self.roomName && event.target.value !== '') { return false }; // 如果修改前后内容完全一样，则不修改
      let [valueLength, url, data] = [event.target.value.length, '/sdm/device/editDevice', {'deviceId': deviceId, 'room': event.target.value}]
      self.$http.post(url, data).then(function(result) {
        console.log(result)
        if (result.data.flag) {
          if (valueLength == 0) {
            self.$message({message: '修改成功! 由于编辑后的房间名称为空，所以将恢复成初始编号', type: 'success'})
          } else {
            self.$message({message: '修改成功', type: 'success'})
          }
          self.roomList[index].room = result.data.msg
        } else {
          self.$message({message: result.data.msg, type: 'warning'})
        }
      }).catch(function(erro) {
        self.$message.error(erro.data.msg)
        console.log(erro)
      })
    },
    // 点击房间，获取房间对应的最新数据和历史信息
    // 点击房间后。获取房间的imei码，传给兄弟组件Dor-alarmLog，获取具体的信息
    clickGetRoomImei: function(state, result, index) {
      this.roomIndex = index
      this.$eventBus.$emit('updataRoomLogList', {state, result})
    },
    // 获取兄弟组件Dor-tree传过来的数据
    updataRoomLists: function(rest) {
      console.log(rest)
      window.clearInterval(setInter); setInter = null // 切换楼层时需要短暂关闭心跳
      page = 1; let self = this
      self.unitName = rest.unit.unitName // 定义当前楼栋的名称
      self.unitId = rest.unit.unitId // 定义当前楼栋的id
      self.floorId = rest.floor.floorId // 楼层id
      self.floorName = rest.floor.floorName // 楼层名称
      self.floorCode = rest.floor.floorCode // 楼层code
      self.startWebSocket(false, '123', 20) // 销毁之前可能存在的websocket
      loading = self.$loading(opt) // 打开请求loading
      // 这里的true/false用于定义是否取消报警类型排序是否选中的状态
      setTimeout(function() { self.getFloorRoomData(rest.floor.floorId, true) }, 500)
    },
    // ===============================根据左边选中的楼层请求楼层对应的房间数据开始===================================
    // 针对每层楼电源全开全关
    AllFloorSwicth: function(state) {
      let self = this
      // var list = self.e_Application; var newArr = [];
      if (self.e_Application.length == 0) { self.$message({message: '请选择电源全部开启/关闭范围', type: 'warning'}); return false }
      // for(var i=0;i<list.length;i++){newArr.push(list[i][1]);}   //取出所有选中的楼层floorCode
      let tip = state == false ? '是否确定关闭选中楼层所有设备电源?' : '是否确定开启选中楼层所有设备电源?'
      self.$confirm(tip, '提示', {confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      }).then(() => {
        let [url, data] = ['/sdm/device/editSwitchBatch', {'floorCode': self.e_Application.toString(), 'checkSwitchState': state == true ? 1 : 0}]
        loading = this.$loading(opt) // 打开请求loading
        setTimeout(function() {
          self.$http.post(url, data).then(function(result) {
            console.log(result)
            if (result.data.flag) {
              if (self.alarmTypeSele == 0) {
                // 这里的true/false用于定义是否取消报警类型排序是否选中的状态
                self.getFloorRoomData(self.floorId, false)
              } else {
                // 这里的true/false用于定义是否取消报警类型排序是否选中的状态
                self.alarmTypeSelect(self.alarmTypeSele, page1)
              }
              loading.close() // 请求操作完成后关闭loading
              self.$message({message: result.data.msg, type: 'success'})
            } else {
              loading.close() // 请求操作完成后关闭loading
              self.$message({message: result.data.msg, type: 'warning'})
            }
          }).catch(function(erro) {
            loading.close() // 请求操作完成后关闭loading
            self.$message.error(erro.data.msg)
          })
        }, 500)
      }).catch(() => {})
    },
    // 获取上一页数据
    previousPage: function() {
      let self = this
      window.clearInterval(setInter); setInter = null // 关闭清除已存在的心跳
      if (page == 1) { self.$message({message: '当前已经是第一页', type: 'warning'}); return false };
      page--; page1--
      self.startWebSocket(false, '', 20) // 关闭之前可能存在的实时通讯
      loading = this.$loading(opt) // 打开请求loading

      // 这里点击分页时要判断当前的全部设备数据请求的类型，
      // 如果是默认初始请求走getFloorRoomData  否则走alarmTypeSelect
      if (self.alarmTypeSele == 0) {
        // 这里的true/false用于定义是否取消报警类型排序是否选中的状态
        setTimeout(function() { self.getFloorRoomData(self.floorId, false) }, 500)
      } else {
        // 这里的true/false用于定义是否取消报警类型排序是否选中的状态
        setTimeout(function() { self.alarmTypeSelect(self.alarmTypeSele, page1) }, 500)
      }
    },
    // 获取下一页数据
    nextPage: function() {
      let self = this
      window.clearInterval(setInter); setInter = null // 关闭清除已存在的心跳
      if (page == self.totalPage) { self.$message({message: '已经是最后一页', type: 'warning'}); return false };
      page++; page1++
      self.startWebSocket(false, '', 20) // 关闭之前可能存在的实时通讯
      loading = this.$loading(opt) // 打开请求loading
      // 这里点击分页时要判断当前的全部设备数据请求的类型，
      // 如果是默认初始请求走getFloorRoomData  否则走alarmTypeSelect
      if (self.alarmTypeSele == 0) {
        // 这里的true/false用于定义是否取消报警类型排序是否选中的状态
        setTimeout(function() { self.getFloorRoomData(self.floorId, false) }, 500)
      } else {
        // 这里的true/false用于定义是否取消报警类型排序是否选中的状态
        setTimeout(function() { self.alarmTypeSelect(self.alarmTypeSele, page1) }, 500)
      }
    },
    // 获取具体楼层的所有房间数据
    getFloorRoomData: function(floorId, alarmTypeState) {
      let self = this
      // 当点击具体的楼层时取消报警类型的选中状态
      if (alarmTypeState) { self.alarmTypeSele = 0 }
      let [url, data] = ['/sdm/device/getFloorDevice', {'pageNo': page, 'pageSize': 9, 'floorId': floorId}]
      self.floorId = floorId
      loading = this.$loading(opt) // 打开请求loading
      self.$http.post(url, data).then(function(result) {
        console.log(result)
        if (result.data.flag) {
          self.totalPage = result.data.totalPage // 获取总共有多少页
          page = result.data.page // 获取当前页
          if (result.data.dataList.length > 0) {
            // onlineState 0设备掉线 1设备在线 2设备在线但是不进行检测  4设备不存在
            let list = result.data.dataList
            list.forEach(function(arr, index) {
              arr.checkSwitchState = arr.checkSwitchState != 0
              arr.checkSwitch = arr.onlineState == 1 && arr.checkSwitch == 1 ? 1 : 2 // 根据设备是否失能状态修改电源开关可用状态
              // alarmState,alarmState1,alarmState2,alarmState3 定义音量，电量，人体报警状态，亮度，
              let newArry = {alarmState: 0, alarmState1: 0, alarmState2: 0, alarmState3: 0}
              Object.assign(arr, newArry)
            })
            self.roomList = list
            if (setInter == null) { self.heartCheck() } // 激活心跳
            self.clickGetRoomImei(false, self.roomList[0], 0) // 默认获取第一个房间的信息,传入一个索引为0的值
            for (let i = 0; i < self.roomList.length; i++) {
              let imei = self.roomList[i].imei
              if (self.roomList[i].onlineState == 1) { self.startWebSocket(true, imei, i); console.log('socket开始' + i) }
            }
          } else { self.roomList = [] }
          loading.close() // 请求操作完成后关闭loading
        } else {
          self.roomList = []
          loading.close() // 请求操作完成后关闭loading
        }
      }).catch(function(erro) {
        loading.close() // 请求操作完成后关闭loading
      })
    },
    // ===============================根据左边选中的楼层请求楼层对应的房间数据结束===================================

    // =====================================报警类型选择开始==================================
    alarmTypeSelect: function(alarmType, newpage) {
      let self = this; page1 = newpage
      window.clearInterval(setInter); setInter = null // 点击报警类型排序时需要短暂关闭心跳
      self.startWebSocket(false, '', 20) // 关闭之前可能存在的websocket
      self.alarmTypeSele = alarmType // 定义当前选中的报警类型
      let [url, data] = ['/sdm/device/getUnitDevice', {pageNo: newpage, pageSize: 9, unitId: self.unitId, alarmType: alarmType}]
      loading = this.$loading(opt) // 打开请求loading
      self.$http.post(url, data).then(function(result) {
        console.log(result)
        if (result.data.flag) {
          self.totalPage = result.data.totalPage // 获取总共有多少页
          page = result.data.page // 获取当前页
          if (result.data.dataList.length > 0) {
            let list = result.data.dataList
            list.forEach(function(arr, index) {
              arr.checkSwitchState = arr.checkSwitchState != 0
              arr.checkSwitch = arr.onlineState == 1 ? 1 : 2 // 根据设备是否失能状态修改电源开关可用状态
              let newArry = {alarmState: 0, alarmState1: 0, alarmState2: 0, alarmState3: 0}
              Object.assign(arr, newArry)
            })
            self.roomList = list
            if (setInter == null) { self.heartCheck() } // 激活心跳
            self.clickGetRoomImei(false, self.roomList[0], 0) // 默认获取第一个房间的信息,传入一个索引为0的值
            for (let i = 0; i < self.roomList.length; i++) {
              let imei = self.roomList[i].imei
              if (self.roomList[i].onlineState == 1) { self.startWebSocket(true, imei, i) }
            }
          } else { self.roomList = [] }
          loading.close() // 请求操作完成后关闭loading
        } else {
          self.roomList = []
          loading.close() // 请求操作完成后关闭loading
        }
      }).catch(function(erro) {
        console.log(erro)
        loading.close() // 请求操作完成后关闭loading
      })
    },
    // =====================================报警类型选择结束==================================

    // ==================================webSocket实时通讯开始=============================
    startWebSocket: function(status, data, index) {
      let self = this
      let url = self.$global.socketUrl + '/sdm/websocketmany'
      if (status) {
        switch (Number(index)) {
          case 0 :
            if (importWs0 == null) {
              importWs0 = new WebSocket(url) // 连接服务器
              importWs0.onopen = function(event) { importWs0.send(data) }
              importWs0.onmessage = function(event) { self.webSocketReturn(event, 0) }
              importWs0.onclose = function(event) { self.roomList[0].onlineState = event.code == 1000 ? 2 : 0; importWs0 = null }
              importWs0.onerror = function(event) { self.roomList[0].onlineState = 0; importWs0 = null }
            }
            break
          case 1 :
            if (importWs1 == null) {
              importWs1 = new WebSocket(url) // 连接服务器
              importWs1.onopen = function(event) { importWs1.send(data) }
              importWs1.onmessage = function(event) { self.webSocketReturn(event, 1) }
              importWs1.onclose = function(event) { self.roomList[1].onlineState = event.code == 1000 ? 2 : 0; importWs1 = null }
              importWs1.onerror = function(event) { self.roomList[1].onlineState = 0; importWs1 = null }
            }
            break
          case 2 :
            if (importWs2 == null) {
              importWs2 = new WebSocket(url) // 连接服务器
              importWs2.onopen = function(event) { importWs2.send(data) }
              importWs2.onmessage = function(event) { self.webSocketReturn(event, 2) }
              importWs2.onclose = function(event) { self.roomList[2].onlineState = event.code == 1000 ? 2 : 0; importWs2 = null }
              importWs2.onerror = function(event) { self.roomList[2].onlineState = 0; importWs2 = null }
            }
            break
          case 3 :
            if (importWs3 == null) {
              importWs3 = new WebSocket(url) // 连接服务器
              importWs3.onopen = function(event) { importWs3.send(data) }
              importWs3.onmessage = function(event) { self.webSocketReturn(event, 3) }
              importWs3.onclose = function(event) { self.roomList[3].onlineState = event.code == 1000 ? 2 : 0; importWs3 = null }
              importWs3.onerror = function(event) { self.roomList[3].onlineState = 0; importWs3 = null }
            }
            break
          case 4 :
            if (importWs4 == null) {
              importWs4 = new WebSocket(url) // 连接服务器
              importWs4.onopen = function(event) { importWs4.send(data) }
              importWs4.onmessage = function(event) { self.webSocketReturn(event, 4) }
              importWs4.onclose = function(event) { self.roomList[4].onlineState = event.code == 1000 ? 2 : 0; importWs4 = null }
              importWs4.onerror = function(event) { self.roomList[4].onlineState = 0; importWs4 = null }
            }
            break
          case 5 :
            if (importWs5 == null) {
              importWs5 = new WebSocket(url) // 连接服务器
              importWs5.onopen = function(event) { importWs5.send(data) }
              importWs5.onmessage = function(event) { self.webSocketReturn(event, 5) }
              importWs5.onclose = function(event) { self.roomList[5].onlineState = event.code == 1000 ? 2 : 0; importWs5 = null }
              importWs5.onerror = function(event) { self.roomList[5].onlineState = 0; importWs5 = null }
            }
            break
          case 6 :
            if (importWs6 == null) {
              importWs6 = new WebSocket(url) // 连接服务器
              importWs6.onopen = function(event) { importWs6.send(data) }
              importWs6.onmessage = function(event) { self.webSocketReturn(event, 6) }
              importWs6.onclose = function(event) { self.roomList[6].onlineState = event.code == 1000 ? 2 : 0; importWs6 = null }
              importWs6.onerror = function(event) { self.roomList[6].onlineState = 0; importWs6 = null }
            }
            break
          case 7 :
            if (importWs7 == null) {
              importWs7 = new WebSocket(url) // 连接服务器
              importWs7.onopen = function(event) { importWs7.send(data) }
              importWs7.onmessage = function(event) { self.webSocketReturn(event, 7) }
              importWs7.onclose = function(event) { self.roomList[7].onlineState = event.code == 1000 ? 2 : 0; importWs7 = null }
              importWs7.onerror = function(event) { self.roomList[7].onlineState = 0; importWs7 = null }
            }
            break
          case 8 :
            if (importWs8 == null) {
              importWs8 = new WebSocket(url) // 连接服务器
              importWs8.onopen = function(event) { importWs8.send(data) }
              importWs8.onmessage = function(event) { self.webSocketReturn(event, 8) }
              importWs8.onclose = function(event) { self.roomList[8].onlineState = event.code == 1000 ? 2 : 0; importWs8 = null }
              importWs8.onerror = function(event) { self.roomList[8].onlineState = 0; importWs8 = null }
            }
            break
        }
      } else {
        switch (Number(index)) {
          case 0 :if (importWs0 !== null) { importWs0.close(); importWs0 = null } break
          case 1 :if (importWs1 !== null) { importWs1.close(); importWs1 = null } break
          case 2 :if (importWs2 !== null) { importWs2.close(); importWs2 = null } break
          case 3 :if (importWs3 !== null) { importWs3.close(); importWs3 = null } break
          case 4 :if (importWs4 !== null) { importWs4.close(); importWs4 = null } break
          case 5 :if (importWs5 !== null) { importWs5.close(); importWs5 = null } break
          case 6 :if (importWs6 !== null) { importWs6.close(); importWs6 = null } break
          case 7 :if (importWs7 !== null) { importWs7.close(); importWs7 = null } break
          case 8 :if (importWs8 !== null) { importWs8.close(); importWs8 = null } break
          default:
            if (importWs0 !== null) { importWs0.close(); importWs0 = null }
            if (importWs1 !== null) { importWs1.close(); importWs1 = null }
            if (importWs2 !== null) { importWs2.close(); importWs2 = null }
            if (importWs3 !== null) { importWs3.close(); importWs3 = null }
            if (importWs4 !== null) { importWs4.close(); importWs4 = null }
            if (importWs5 !== null) { importWs5.close(); importWs5 = null }
            if (importWs6 !== null) { importWs6.close(); importWs6 = null }
            if (importWs7 !== null) { importWs7.close(); importWs7 = null }
            if (importWs8 !== null) { importWs8.close(); importWs8 = null }
        }
      }
    },
    // websocket返回值处理函数
    webSocketReturn: function(result, index) {
      let self = this
      let dataList = JSON.parse(result.data)
      // console.log("索引："+index+" 类型："+dataList[0].parameterType+" 类型值： "+dataList[0].value+" 报警状态值 "+dataList[0].alarmState)
      // parameterType有1/2/3/6/7/11/12/13  分贝/电流/人体/流明度/无电源开关/设备上线/设备掉线/电源开关alarmState=1表示报警，反之不报警
      // onlineState 0设备掉线 1设备在线 2设备不存在
      if (dataList[0].parameterType == 1) {
        self.roomList[index].decibelValue = dataList[0].value
        self.roomList[index].alarmState = dataList[0].alarmState // 分贝 alarmState定义得到了报警信息
        self.roomList[index].onlineState = 1 // 分贝，电流，人体，流明度任意以参数有数据，都表示设备在线
      } else if (dataList[0].parameterType == 2) {
        self.roomList[index].powerValue = dataList[0].value
        self.roomList[index].alarmState1 = dataList[0].alarmState // 电流 alarmState1定义得到了报警信息（由于电流检测比较特殊，这里配置了状态alarmState1，但实际并未使用，暂时保留）
        self.roomList[index].onlineState = 1 // 分贝，电流，人体，流明度任意以参数有数据，都表示设备在线
      } else if (dataList[0].parameterType == 3) {
        self.roomList[index].human = dataList[0].value
        self.roomList[index].alarmState3 = dataList[0].alarmState // 人体 alarmState3定义得到了报警信息
        self.roomList[index].onlineState = 1 // 分贝，电流，人体，流明度任意以参数有数据，都表示设备在线
      } else if (dataList[0].parameterType == 6) {
        self.roomList[index].beamValue = dataList[0].value
        self.roomList[index].alarmState2 = dataList[0].alarmState // 流明度 alarmState2定义得到了报警信息
        self.roomList[index].onlineState = 1 // 分贝，电流，人体，流明度任意以参数有数据，都表示设备在线
      } else if (dataList[0].parameterType == 7) {
        self.roomList[index].checkSwitch = 0 // 当返回的类型为7是说明无电源开关，此时需要屏蔽电源开关按钮
        self.roomList[index].onlineState = 1 // 分贝，电流，人体，流明度任意以参数有数据，都表示设备在线
      } else if (dataList[0].parameterType == 11) {
        self.roomList[index].onlineState = 1
      } else if (dataList[0].parameterType == 12) {
        self.roomList[index].onlineState = 0
      } else if (dataList[0].parameterType == 13) {
        self.roomList[index].checkSwitchState = dataList[0].value != 0
      }
      // 如果websocket得到了一个报警信息状态alarmState=1，那么对于的那个检测类型parameterType要变红色
      // 且对于的当前房间的alarmNum>0,此时房间的边框也变成红色，所以我们随意赋值alarmNum一个大于0的值
      if (dataList[0].alarmState == 1) { self.roomList[index].alarmNum = self.roomList[index].alarmNum + 1 }
    },
    // 设置设备心跳请求
    heartCheck: function() {
      let self = this
      setInter = window.setInterval(heartFn, 30000)
      function heartFn() {
        let [url, data] = ['', '']
        // self.alarmTypeSele==0表示当前的房间列表不是按类型排序的，反之是类型排序
        if (self.alarmTypeSele == 0) {
          url = '/sdm/device/getFloorDevice'
          data = {'pageNo': page, 'pageSize': 9, 'floorId': self.floorId}
        } else {
          url = '/sdm/device/getUnitDevice'
          data = {pageNo: page, pageSize: 9, unitId: self.unitId, alarmType: self.alarmTypeSele}
        }
        self.$http.post(url, data).then(function(result) {
          console.log(result)
          if (result.data.flag) {
            if (result.data.dataList.length > 0) {
              var [newlist, listt] = [result.data.dataList, JSON.parse(JSON.stringify(self.roomList))]
              newlist.forEach(function(ast, ind) {
                // console.log("新："+ast.onlineState+" "+"旧："+list[ind].onlineState);
                if (ast.onlineState !== listt[ind].onlineState && ast.onlineState == 1 && ast.deviceId == listt[ind].deviceId) {
                  switch (Number(ind)) {
                    case 0 :importWs0 = null; break
                    case 1 :importWs1 = null; break
                    case 2 :importWs2 = null; break
                    case 3 :importWs3 = null; break
                    case 4 :importWs4 = null; break
                    case 5 :importWs5 = null; break
                    case 6 :importWs6 = null; break
                    case 7 :importWs7 = null; break
                    case 8 :importWs8 = null; break
                  }
                  self.startWebSocket(true, ast.imei, ind)
                }
              })
            }
          }
        }).catch(function(erro) {
          console.log(erro)
        })
      }
    },
    // ==================================webSocket实时通讯结束=============================
    // =====================================房间设备电源开关开始============================
    // 房间设备电源开关按钮
    switchStatus: function(state, index, imei) {
      let [self, tip] = [this, state == false ? '是否确定开启设备电源?' : '是否确定关闭设备电源?']
      self.$confirm(tip, '提示', {confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      }).then(() => {
        self.switchRequest(state == false ? 1 : 0, index, imei) // 1表示开启0表示关闭
      }).catch(() => {})
    },
    // 房间设备电源开关开启与关闭请求
    switchRequest: function(state, index, imei) {
      let [self, url, data] = [this, '/sdm/device/editSwitch', {'imei': imei, 'state': state}]
      loading = this.$loading(opt) // 打开请求loading
      setTimeout(function() {
        self.$http.post(url, data).then(function(result) {
          console.log(result)
          if (result.data.flag) {
            self.roomList[index].checkSwitchState = state != 0
            loading.close() // 请求操作完成后关闭loading
            self.$message({message: '操作成功', type: 'success'})
          } else {
            self.roomList[index].checkSwitchState = state == 0
            loading.close() // 请求操作完成后关闭loading
            self.$message({message: result.data.msg, type: 'warning'})
          }
        }).catch(function(erro) {
          self.roomList[index].checkSwitchState = state == 0
          loading.close() // 请求操作完成后关闭loading
          self.$message.error(erro.data.msg)
        })
      }, 500)
    },
    // =====================================房间设备电源开关结束============================

    // =====================================房间设备开启与关闭开始============================
    // 询问是否开启或关闭设备
    onAndOffDevice: function(imei, state, index, onOff) {
      let self = this
      let tip = state == true ? '是否确定关闭这个房间的设备检测?' : '是否确定开启这个房间的设备检测?'
      self.$confirm(tip, '提示', {confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      }).then(() => {
        self.sureOnAndOffDevice(imei, !state, index, onOff) // 确认进行设备开启与关闭的操作
      }).catch(() => {
      })
    },
    // 确认进行设备开启与关闭的操作
    sureOnAndOffDevice: function(imei, state, index, onOff) {
      var [self, url, data] = [this, '/sdm/device/editDeviceSwitch', {'imei': imei, 'state': state == true ? 1 : 2}]
      loading = this.$loading(opt) // 打开请求loading
      setTimeout(function() {
        self.$http.post(url, data).then(function(result) {
          if (result.data.flag) {
            loading.close() // 请求操作完成后关闭loading
            var sta = state == true ? 1 : 2
            self.roomList[index].onlineState = sta
            self.startWebSocket(sta == 1, imei, index) // 重新执行webSocket
            // 判断当前传感器是否失能,如果失能那么电源开关按钮也要禁用掉
            if (state == true) { self.roomList[index].checkSwitch = 1 } else { self.roomList[index].checkSwitch = 2 };
            self.$message({message: '操作成功', type: 'success'})
          } else {
            loading.close() // 请求操作完成后关闭loading
            self.$message({message: result.data.msg, type: 'warning'})
          }
        }).catch(function(erro) {
          loading.close() // 请求操作完成后关闭loading
          self.$message.error(erro.data.msg)
        })
      }, 500)
    }
    // =====================================房间设备开启与关闭结束============================
  },
  beforeDestroy() {
    console.log('销毁了')
    clearInterval(setInter); setInter = null
    this.$eventBus.$off('updataRoomList') // 关闭兄弟组件之间传递信息时$on会多次触发的问题
    this.startWebSocket(false, '123', 20) // 页面销毁时销毁websocket
  }
}
</script>

<style>
  @import url("../../../static/css/DormitoryMonitoring/Dor-roomList.css");
</style>
