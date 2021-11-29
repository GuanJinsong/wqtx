<template>
  <div class="Dor_treParent">
    <el-collapse v-model="activeName" accordion>
      <el-collapse-item v-for="(unit,index) in unitList" v-bind:key="index" :name="index.toString()">
        <template slot="title">
          <div class="Dor_treTitle">
            <span class="el-icon-edit" v-on:click.self="clickEitdeMe(index,unit.unitName)" @click.stop></span>
            <input type="text" v-focus="isReadOnly ==index?true:''"
            v-bind:readonly="isReadOnly !==index?true:false"
            v-bind:disabled="isReadOnly !==index?true:false"
            v-model="unit.unitName"
            v-bind:class="isEidt ==index?'Dor_eidt':''"
            @blur="changeCount(index,unit.unitId,$event)">
            </input>

          </div>
        </template>
        <ul class="Dor_treUl">
          <li v-for="(list,indexF) in unit.floorData" v-bind:key="indexF" v-bind:class="floorId ==list.floorId?'selectColor':''" @click="getFloorRoomData(unit,list)">
            <span class="el-icon-edit" v-on:click.self="clickEitdeFloor(indexF,list.floorName)" @click.stop></span>
            <input type="text" v-focusFloor="floorReadOnly ==indexF?true:''"
              v-bind:readonly="floorReadOnly !==indexF?true:false"
              v-bind:disabled="floorReadOnly !==indexF?true:false"
              v-model="list.floorName"
              v-bind:class="floorEidt ==indexF?'Dor_eidt':''"
              @blur="changeCountFloor(index,indexF,list.floorId,$event)">
            </input>
          </li>
        </ul>
      </el-collapse-item>
    </el-collapse>
    <noMoreData v-if="unitList.length == 0"/>
  </div>
</template>

<script>
import noMoreData from '../publicComponemts/noMoreData.vue'
// import Bus from "../../newObject/Bus.js";
export default{
  name: 'Dor-tree',
  components: {
    noMoreData: noMoreData
  },
  data() {
    return {
      activeName: '0',
      isReadOnly: -1,
      isEidt: -1,
      floorReadOnly: -1,
      floorEidt: -1,
      unitList: [],
      floorId: '',
      eitdUnit: '', // 当前正在编辑的单元名称
      eitdfloor: '' // 当前正在编辑的楼层
    }
  },
  directives: {
    focus: {
      componentUpdated: function (el, {value}) {
        if (value) { el.focus() }
      }
    },
    focusFloor: {
      componentUpdated: function (el, {value}) {
        if (value) {
          el.focus()
          // //控制光标始终在文本之后
          // var range = document.createRange();
          // range.selectNodeContents(el);
          // range.collapse(false);
          // var sel = window.getSelection();
          // //判断光标位置，如不需要可删除
          // if(sel.anchorOffset!=0){return;};
          // sel.removeAllRanges();
          // sel.addRange(range);
        }
      }
    }
  },
  created() {
    this.getUnitAndFloor()
  },
  methods: {
    // 获取单元以及楼层信息
    getUnitAndFloor: function() {
      var self = this
      var url = '/sdm/unit/getUnitFloor'
      self.$http.post(url).then(function(result) {
        console.log(result)
        if (result.data.flag) {
          if (result.data.rows.length > 0) {
            self.unitList = result.data.rows
            var froolId = result.data.rows[0].floorData[0].floorId
            console.log(froolId)
            self.floorId = froolId
            // 默认初次获取第一栋第一层的宿舍房间数据
            self.getFloorRoomData(result.data.rows[0], result.data.rows[0].floorData[0])
          } else {
            self.unitList = []
          }
        } else {
          self.unitList = []
        }
      }).catch(function(erro) {
        console.log(erro)
      })
    },
    // 点击解除单元楼只读属性
    clickEitdeMe: function(index, eitdUnit) {
      this.isReadOnly = parseInt(index)
      this.isEidt = parseInt(index)
      this.eitdUnit = eitdUnit
    },
    // 获取单元(栋)编辑后输入框失去焦点事件
    changeCount: function(index, unitId, event) {
      var self = this
      self.isReadOnly = -1; self.isEidt = -1
      // 如果修改后的内容为空，则不修改
      if (event.target.value == '') {
        self.$message({message: '修改的结果不得为空！', type: 'warning'})
        self.unitList[index].unitName = self.eitdUnit
        return false
      };
      if (event.target.value == self.eitdUnit) { return false }; // 如果修改前后内容完全一样，则不修改
      var url = '/sdm/unit/editUnit'
      var data = {'unitId': unitId, 'unitName': event.target.value}
      self.$http.post(url, data).then(function(result) {
        // console.log(result)
        if (result.data.flag) {
          self.$message({message: '修改成功1', type: 'success'})
        } else {
          self.$message({message: result.data.msg, type: 'warning'})
        }
      }).catch(function(erro) {
        self.$message.error(erro.data.msg)
        console.log(erro)
      })
    },
    // 点击解除具体的楼层只读属性
    clickEitdeFloor: function(index, eitdfloor) {
      this.floorReadOnly = parseInt(index)
      this.floorEidt = parseInt(index)
      this.eitdfloor = eitdfloor
    },
    // 获取具体的楼层编辑后输入框失去焦点事件
    changeCountFloor: function(index, floorIndex, froolId, event) {
      var self = this
      self.floorReadOnly = -1; self.floorEidt = -1
      // 如果修改后的内容为空，则不修改
      if (event.target.value == '') {
        self.$message({message: '修改的结果不得为空！', type: 'warning'})
        self.unitList[index].floorData[floorIndex].floorName = self.eitdfloor
        return false
      };
      if (event.target.value == self.eitdfloor) { return false }; // 如果修改前后内容完全一样，则不修改
      var url = '/sdm/unit/editFloor'
      var data = {'floorId': froolId, 'floorName': event.target.value}
      self.$http.post(url, data).then(function(result) {
        // console.log(result)
        if (result.data.flag) {
          self.$message({message: '修改成功2', type: 'success'})
        } else {
          self.$message({message: result.data.msg, type: 'warning'})
        }
      }).catch(function(erro) {
        self.$message.error(erro.data.msg)
        console.log(erro)
      })
    },
    // 点击具体的楼层，获取该楼层的所有房间数据
    getFloorRoomData: function(unit, floor) {
      var self = this
      self.$nextTick(() => {
        self.floorId = floor.floorId
        var unitData = {unit: unit, floor: floor}
        // 将得到的房间数据传给Dor-roomList兄弟组件，这里应用到了兄弟组件传值的方法，具体可以自己去了解一下
        self.$eventBus.$emit('updataRoomList', unitData)
      })
    }
  }
}
</script>

<style>
  @import url("../../../static/css/DormitoryMonitoring/Dor-tree.css");
</style>
