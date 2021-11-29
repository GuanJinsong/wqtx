<!-- 报警条件 -->
<template>
  <div class="man_alaParnet">
    <div class="smallTitle">报警条件</div>
    <div class="man_alaParnetAfter">
      <div class="man_conTable">
        <el-table :data="tableData" style="width: 100%">
          <el-table-column prop="date" label="分呗" width="180"></el-table-column>
          <el-table-column prop="name" label="分呗持续时间" width="180"></el-table-column>
          <el-table-column prop="address" label="广播内容"></el-table-column>
          <el-table-column label="操作" width="180">
            <template slot-scope="scope">
              <button class="man_conEdit" @click="handleEdit(scope.$index, scope.row)"><span class="el-icon-edit"></span> 编辑</button>
              <button class="man_conDel" @click="handleDelete(scope.$index, scope.row)"><span class="el-icon-delete"></span> 删除</button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 添加或编辑报警 -->
      <div class="editBox" v-if="condit">
        <div class="editBoxAfter" style="width:500px;">
          <div class="editTitle"><p>添加/编辑</p><span @click="openAndHideCondit">×</span></div>
          <ul class="editMode">
            <li><span class="man_conEditLi">分呗：</span><p class="man_conEditPut"><input type="text"/><i>dB</i></p></li>
            <li><span class="man_conEditLi">持续时间：</span><p class="man_conEditPut"><input type="text" /><i>S</i></p></li>
            <li><span class="man_conEditLi">声音选择：</span>
              <div class="editMM" style="width:250px;">
                <el-select v-model="value2" multiple collapse-tags placeholder="请选择">
                  <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
              </div>
            </li>
          </ul>
          <div class="editBtn"><button>确定</button> <button>取消</button></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default{
    name:"Man-alarmConditions",
    data(){
      return{
        condit:false,
        tableData: [{
          date: '<60dB',
          name: '6s',
          address: '设备报警'
        }, {
          date: '<60dB',
          name: '6s',
          address: '设备报警'
        }]
      }
    },
    methods:{
      openAndHideCondit:function(){
        if(this.condit){this.condit=false}else{this.condit=true}
      },
      handleEdit:function(data,data1){
        console.log(data)
        console.log(data1)
        this.openAndHideCondit();
      },
      handleDelete:function(data,data1){
        console.log(data)
        console.log(data1)
      },
    }
  }
</script>

<style>
  @import url("../../../static/css/Management/Man-alarmConditions.css");
</style>
