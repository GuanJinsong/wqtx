<!-- 设备管理 -->
<template>
  <div class="man_right">
    <div class="man_rLeft">
      <div class="smallTitle">设备列表</div>
      <!-- 树形图组件 -->
      <div class="man_devTree"><Tree/></div>
    </div>
    <div class="man_rRight">
      <div class="smallTitle">设备管理</div>
      <div class="man_devTable">
        <el-table :data="tableData" style="width: 100%">
          <el-table-column type="index" label="序号" width="80"></el-table-column>
          <el-table-column prop="date" label="设备名称" width="180"></el-table-column>
          <el-table-column prop="name" label="设备状态" width="180"></el-table-column>
          <el-table-column prop="address" label="地址"></el-table-column>
          <el-table-column label="操作" width="180">
            <template slot-scope="scope">
              <button class="man_devEdit" @click="handleEdit(scope.$index, scope.row)"><span class="el-icon-edit"></span> 编辑</button>
              <button class="man_devDel" @click="handleDelete(scope.$index, scope.row)"><span class="el-icon-delete"></span> 删除</button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 暂无数据 -->
        <noMoreDataOther v-if="deviceList.length==0"/>
        <!-- 分页 -->
        <pagingComponent v-if="totalPage>1"/>

        <!-- 设备编辑 -->
        <div class="editBox" v-if="editBox">
          <div class="editBoxAfter" style="width:400px;">
            <div class="editTitle"><p>编辑</p><span @click="openAndHide">×</span></div>
            <ul class="editMode">
              <li><span class="man_devEditLi">设备名称：</span><input class="man_devEditput" type="text" /></li>
            </ul>
            <div class="editBtn"><button>确定</button> <button @click="openAndHide">取消</button></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  var pageSize = 20;
  import noMoreDataOther from "../publicComponemts/noMoreDataOther.vue";
  import pagingComponent from "../publicComponemts/pagingComponent.vue";
  import Tree from "../publicComponemts/Tree.vue"
  export default{
    name:"Man-deviceManagement",
    components:{
      Tree:Tree,
      noMoreDataOther:noMoreDataOther,
      pagingComponent:pagingComponent
    },
    data(){
      return{
        editBox:false,
        deviceList:[],        //设备列表
        totalPage:1,          //定义总页数
        tableData: [{
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }, {
          date: '2016-05-02',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }
        ]
      }
    },
    methods:{
      handleEdit:function(data,data1){
        console.log(data)
        console.log(data1)
        this.openAndHide();
      },
      handleDelete:function(data,data1){
        console.log(data)
        console.log(data1)
      },
      //定义编辑窗口的开与关
      openAndHide:function(){
        if(this.editBox){this.editBox=false}else{this.editBox=true}
      }
    }
  }
</script>

<style>
  @import url("../../../static/css/Management/Man-deviceManagement.css");
</style>
