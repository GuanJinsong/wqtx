<!-- 账户管理 -->
<template>
  <div class="man_right">
    <div class="man_rRight">
      <div class="smallTitle"><div class="userListTitle"><p>账户列表</p> <button @click="openAndHide()">+ 添加</button></div></div>
      <div class="man_devTable acc_table">
        <el-table :data="tableData" style="width: 100%">
          <el-table-column type="index" label="序号"></el-table-column>
          <el-table-column prop="name" label="管理员账户"></el-table-column>
          <el-table-column prop="password" label="密码"></el-table-column>
          <el-table-column prop="userName" label="管理员名字"></el-table-column>
          <el-table-column prop="phone" label="管理员手机"></el-table-column>
          <el-table-column prop="unitStr" label="分管范围"></el-table-column>
          <el-table-column prop="addTimeStr" label="创建时间"></el-table-column>
          <el-table-column label="操作" width="180">
            <template slot-scope="scope">
              <button class="man_devEdit" @click="handleEdit(scope.$index, scope.row)"><span class="el-icon-edit"></span> 编辑</button>
              <button class="man_devDel" @click="handleDelete(scope.$index, scope.row)"><span class="el-icon-delete"></span> 删除</button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <pagingComponent v-show="totalPage>1"/>

        <!-- 设备编辑 -->
        <div class="editBox" v-if="editBox">
          <div class="editBoxAfter" style="width:400px;">
            <div class="editTitle"><p>添加账户</p><span @click="openAndHide">×</span></div>
            <ul class="editMode">
              <li><span class="man_devEditLi">账 户 名：</span><input class="man_devEditput" v-model="name" type="text" placeholder="请输入账户名"/></li>
              <li><span class="man_devEditLi">密 &nbsp;&nbsp;&nbsp; 码：</span><input class="man_devEditput" v-model="password" type="text" placeholder="请输入密码" /></li>
              <li><span class="man_devEditLi">管理员名：</span><input class="man_devEditput" type="text" v-model="userName" placeholder="请输入管理员名字"/></li>
              <li>
                <span class="man_devEditLi">分管范围：</span>
                <div class="weekSelectBox editMM">
                  <el-select v-model="tung" multiple collapse-tags @change="tungSelect" placeholder="请选择分管范围">
                    <el-option v-for="item in unitList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                  </el-select>
                </div>
              </li>
              <li><span class="man_devEditLi">手 机 号：</span><input class="man_devEditput" v-model="phone" type="text" placeholder="请输入管理员的手机号"/></li>
            </ul>
            <div class="editBtn"><button @click="addUserList()">确定</button> <button @click="openAndHide">取消</button></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import noMoreDataOther from '../publicComponemts/noMoreDataOther.vue'
import pagingComponent from '../publicComponemts/pagingComponent.vue'
import Tree from '../publicComponemts/Tree.vue'
var self = ''
export default{
  name: 'Man-deviceManagement',
  components: {
    Tree: Tree,
    noMoreDataOther: noMoreDataOther,
    pagingComponent: pagingComponent
  },
  data() {
    return {
      editBox: false,
		    imageUrl: '',
      deviceList: [], // 设备列表
      totalPage: 1, // 定义总页数
      unitList: [],
      tung: '', // 新用户分管范围
      tableData: [], // 定义当前的列表数据
      name: '', // 新用户账号名
      password: '', // 新用户账号密码
      userName: '', // 账号使用者名
      phone: '', // 账号使用者手机号
      editUserId: null // 保存当前正在编辑的账户id
    }
  },
  created() {
    self = this
    this.getUnitAndFloor()
    this.getUserList(1, 20)
  },
  mounted() {
    // 监听子组件 pagingComponent传过来的数据
    this.$eventBus.$on('updataPage', this.updataAccManPage)
  },
  methods: {
    // 根据分页子组件返回的数据请求新的报警记录数据
    updataAccManPage: function(page, type) {
      if (type == 'accMan') { this.getUserList(page) }
    },
    // 定义编辑窗口的开与关
    openAndHide: function() {
      self.editUserId = null // 重置可能存在的用户id
      if (self.editBox) { self.editBox = false } else {
        self.tung = '' // 新用户分管范围
        self.name = '' // 新用户账号名
        self.password = '' // 新用户账号密码
        self.userName = '' // 账号使用者名
        self.phone = '' // 账号使用者手机号
        self.editBox = true
      }
    },
    // 获取所有楼栋信息
    getUnitAndFloor: function() {
      var url = '/sdm/unit/getUnitFloor'
      self.$http.post(url).then(function(result) {
        console.log(result)
        if (result.data.flag) {
          if (result.data.rows.length > 0) {
            var list = result.data.rows
            var unitArry = []
            for (var i = 0; i < list.length; i++) {
              var lit = {value: list[i].unitId, label: list[i].unitName, unitCode: list[i].unitCode}
              unitArry.push(lit)
            }
            self.unitList = unitArry
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
    // 获取用户列表
    getUserList: function(page) {
      var url = '/sdm/user/getUserList'
      var data = {pageNo: page, pageSize: 20}
      self.$http.post(url, data).then(function(result) {
        console.log(result)
        if (result.data.flag) {
          // 向分页组件传递分页数据，并且传递分页类型标记字段“accMan”
          self.$eventBus.$emit('deviceListDataReturn', result.data, 'accMan')
          self.totalPage = result.data.totalPage // 获取总共有多少页
          if (result.data.dataList.length > 0) {
            self.tableData = result.data.dataList
          } else {
            self.tableData = []
          }
        } else {
          self.tableData = []
        }
      }).catch(function(erro) {
        console.log(erro)
      })
    },
    // 新增/编辑用户
    addUserList: function() {
      if (self.name == '') { self.$message({message: '账户名不得为空', type: 'warning'}); return false }
      if (self.name.match(/[\x01-\xFF]*/) == false) { self.$message({message: '账户名不得使用中文', type: 'warning'}); return false }
      if (self.password == '') { self.$message({message: '账户密码不得为空', type: 'warning'}); return false }
      if (self.password.match(/[\x01-\xFF]*/) == false) { self.$message({message: '密码不得使用中文', type: 'warning'}); return false }
      if (self.userName == '') { self.$message({message: '管理员名字不得为空', type: 'warning'}); return false }
      if (self.tung == '') { self.$message({message: '分管范围不得为空', type: 'warning'}); return false }
      var phoneTes = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
      if (!phoneTes.test(self.phone)) { self.$message({message: '手机号码格式不规范或为空.', type: 'warning'}); return false }
      var url = '/sdm/user/editUser'
      var data = ''
      if (self.editUserId == null) {
        data = {name: self.name, password: self.password, phone: self.phone, userName: self.userName, unitData: self.tung}
      } else {
        data = {userId: self.editUserId, name: self.name, password: self.password, phone: self.phone, userName: self.userName, unitData: self.tung}
      }
      self.$http.post(url, data).then(function(result) {
        console.log(result)
        if (result.data.flag) {
          self.$message({message: '添加成功', type: 'success'})
          self.openAndHide()
          self.getUserList(1) // 重新获取用户列表
        } else {
          self.$message({message: result.data.msg, type: 'warning'})
        }
      }).catch(function(erro) {
        self.$message({message: erro.data.msg, type: 'warning'})
      })
    },
    // 点击用户列表后的编辑按钮，打开弹窗
    handleEdit: function(index, listResult) {
      self.openAndHide()
      self.tung = listResult.unitData // 新用户分管范围
      self.name = listResult.name // 新用户账号名
      self.password = listResult.password // 新用户账号密码
      self.userName = listResult.userName // 账号使用者名
      self.phone = listResult.phone // 账号使用者手机号
      self.editUserId = listResult.userId // 当前编辑的用户id
    },
    // 删除用户列表
    handleDelete: function(index, listResult) {
      self.$confirm('是否删除 ' + listResult.name + ' 这个账号?', '删除提示', {confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      }).then(() => {
        var url = '/sdm/user/delUser'
        var data = {'userId': listResult.userId}
        self.$http.post(url, data).then(function(result) {
          console.log(result)
          if (result.data.flag) {
            self.$message({message: '删除成功', type: 'success'})
            self.getUserList(1) // 重新获取用户列表
          } else {
            self.$message({message: '删除失败', type: 'warning'})
          }
        }).catch(function(erro) {
          console.log(erro)
        })
      }).catch(() => {})
      // self.tableData.splice(index,1);
    },
    // 编辑弹窗下的范围选择结果获取
    tungSelect: function(data) {
      console.log(data)
    }
  },
  beforeDestroy() {
    this.$eventBus.$off('updataPage') // 关闭兄弟组件之间传递信息时$on会多次触发的问题
  }
}
</script>

<style>
  @import url("../../../static/css/Management/Man-accountManagement.css");
</style>
