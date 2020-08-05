<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="操作员编号">
              <a-input v-model="queryParam.userNumber" placeholder="请输入操作员编号" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="操作员手机号">
              <a-input v-model="queryParam.userMobilePhone" placeholder="请输入手机号" />
            </a-form-item>
          </a-col>
          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="操作员登录名">
                <a-input v-model="queryParam.userLoginName" placeholder="请输入操作员登录名" />
              </a-form-item>
            </a-col>
            <!-- <a-col :md="8" :sm="24">
              <a-form-item label="操作员类型">
                <a-select placeholder="请选择" v-model="queryParam.operatorType">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option :value="v.typeCode" v-for="(v,i) of operatorTypeList" :key="i">{{ v.typeName }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="操作员级别">
                <a-select placeholder="请选择" v-model="queryParam.operatorLevel">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="super_admin">超级管理员</a-select-option>
                  <a-select-option value="belonging_admin">归属管理员</a-select-option>
                  <a-select-option value="ordinary_operator">普通操作员</a-select-option>
                </a-select>
              </a-form-item>
            </a-col> -->
            <a-col :md="8" :sm="24">
              <a-form-item label="操作员状态">
                <a-select placeholder="请选择" v-model="queryParam.operatorStatus">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="enabled">启用</a-select-option>
                  <a-select-option value="disabled">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </template>
          <a-col :md="!advanced && 8 || 24" :sm="24">
            <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
              <a-button type="primary" @click="queryOperator">查询</a-button>
              <a-button style="margin-left: 8px" @click="resetQueryParam">重置</a-button>
              <a @click="toggleAdvanced" style="margin-left: 8px">
                {{ advanced ? '收起' : '展开' }}
                <a-icon :type="advanced ? 'up' : 'down'" />
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!--功能按钮-->
    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="modifyOperator('add')">新增</a-button>
      <a-button type="primary" icon="edit" @click="modifyOperator('edit')">编辑</a-button>
      <a-button type="primary" icon="delete" @click="modifyOperator('delete')">删除</a-button>
      <a-button type="primary" icon="key" @click="modifyOperator('reset')">重置登录密码</a-button>
      <a-button type="primary" icon="setting" @click="modifyOperator('init')">初始化账号</a-button>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="modifyOperator('enabled')">
            <a-icon type="unlock" />启用
          </a-menu-item>
          <!-- lock | unlock -->
          <a-menu-item key="2" @click="modifyOperator('disabled')">
            <a-icon type="lock" />禁用
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          批量操作
          <a-icon type="down" />
        </a-button>
      </a-dropdown>
    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">
      <template slot="userMobilePhone" slot-scope="record">
        <span>{{ mobileToStar(record) }}</span>
      </template>

      <template slot="operatorType" slot-scope="record">
        <a-tag v-if="v.typeCode==record" v-for="(v,i) of operatorTypeList" :key="i">{{ v.typeName }}</a-tag>
      </template>

      <span slot="operatorLevel" slot-scope="record">
        <a-tag v-if="record=='super_admin'" color="#108ee9">超级管理员</a-tag>
        <a-tag v-if="record=='belonging_admin'" color="#2db7f5">归属管理员</a-tag>
        <a-tag v-if="record=='ordinary_operator'" color="#f0ad4e">普通操作员</a-tag>
        <a-tag v-else color="#f0ad4e">其他</a-tag>
      </span>

      <span slot="operatorStatus" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">启用</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">禁用</a-tag>
      </span>

      <template slot="Action" slot-scope="text,record">
        <span>
          <a href="javascript:;" @click="modifyOperator('detail', record)">详情</a>
        </span>
      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="editType=='add'?'800px':editType=='edit'?'800px':editType=='detail'?'800px':'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='delete'">确认删除此项码？</p>
      <p v-else-if="editType=='reset'">确认重置此操作员登录密码？</p>
      <p v-else-if="editType=='init'">确认初始化此操作员账号吗？</p>
      <p v-else-if="editType=='enabled'">确认启用所选操作员账号吗？</p>
      <p v-else-if="editType=='disabled'">确认禁用所选操作员账号吗？</p>
      <div class="modal-container" v-else>
        <a-form>
          <a-row :gutter="24">
            <a-col :md="12" :sm="24">
              <a-form-item label="操作员类型" :required="true">
                <a-select v-model="forms.operatorType" placeholder="请选择" :disabled="editType=='detail'">
                  <a-select-option :value="v.typeCode" v-for="(v,i) of operatorTypeList" :key="i">{{ v.typeName }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <!-- <a-col :md="12" :sm="24">
              <a-form-item label="操作员级别" :required="true">
                <a-select v-model="forms.operatorLevel" placeholder="请选择" :disabled="editType=='detail'">
                  <a-select-option value="ordinary_operator">普通操作员</a-select-option>
                  <a-select-option value="belonging_admin">归属管理员</a-select-option>
                  <a-select-option value="super_admin">超级管理员</a-select-option>
                </a-select>
              </a-form-item>
            </a-col> -->

            <a-col :md="12" :sm="24">
              <a-form-item label="操作员手机号" :required="true">
                <a-input v-model="forms.userMobilePhone" :placeholder="editType=='detail'?'':'请输入手机号'" :disabled="editType=='detail'" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="操作员登录名" :required="true">
                <a-input v-model="forms.userLoginName" :placeholder="editType=='detail'?'':'请输入登录名'" :disabled="editType=='detail'" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="操作员姓名" :required="true">
                <a-input v-model="forms.operatorName" :placeholder="editType=='detail'?'':'请输入操作员姓名'" :disabled="editType=='detail'" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="操作员年龄">
                <a-input v-model="forms.operatorAge" :placeholder="editType=='detail'?'':'请输入操作员年龄'" :disabled="editType=='detail'" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="操作员邮箱">
                <a-input v-model="forms.operatorEmail" :placeholder="editType=='detail'?'':'请输入操作员邮箱'" :disabled="editType=='detail'" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="操作员身份证">
                <a-input v-model="forms.operatorPid" :placeholder="editType=='detail'?'':'请输入操作员身份证'" :disabled="editType=='detail'" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="备注">
                <a-input v-model="forms.operatorRemark" :placeholder="editType=='detail'?'':'请输入备注'" :disabled="editType=='detail'" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24" v-show="editType=='edit'">
              <a-form-item label="是否启用">
                <a-select v-model="forms.operatorStatus" placeholder="请选择" :disabled="editType=='detail'">
                  <a-select-option value="enabled">启用</a-select-option>
                  <a-select-option value="disabled">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :md="24" :sm="24">
              <a-form-item label="选择角色">
                <a-checkbox-group :options="roleList" v-model="forms.roleIdList" :disabled="editType=='detail'" />
              </a-form-item>
            </a-col>

          </a-row>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script>
import Pagination from '@/components/pagination/pagination'
import { mobileToStar } from '@/utils/util'
import {
  addOperator,
  getOperatorInfo,
  modifyOperator,
  removeOperator,
  resetOperatorLoginPwd,
  initOperatorAccount,
  changeOperatorStatus,
  getOperatorList,
  getOperatorTypeList,
  getRoleAllList
} from '@/api/system'

const columns = [
  {
    title: '编号',
    width: 120,
    dataIndex: 'userNumber',
    align: 'center'
  },
  {
    title: '手机号',
    width: 120,
    dataIndex: 'userMobilePhone',
    scopedSlots: { customRender: 'userMobilePhone' }
  },
  {
    title: '登录名',
    width: 150,
    dataIndex: 'userLoginName'
  },
  {
    title: '名称',
    width: 130,
    dataIndex: 'operatorName'
  },
  {
    title: '类型',
    width: 120,
    dataIndex: 'operatorType',
    align: 'center',
    scopedSlots: { customRender: 'operatorType' }
  },
  {
    title: '级别',
    width: 100,
    dataIndex: 'operatorLevel',
    align: 'center',
    scopedSlots: { customRender: 'operatorLevel' }
  },
  {
    title: '状态',
    width: 100,
    dataIndex: 'operatorStatus',
    align: 'center',
    scopedSlots: { customRender: 'operatorStatus' }
  },
  {
    title: '操作',
    width: 100,
    dataIndex: 'Action',
    align: 'center',
    scopedSlots: { customRender: 'Action' }
  }
]

export default {
  name: 'Operator',
  components: {
    Pagination
  },
  data() {
    return {
      mobileToStar,
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        userNumber: null,
        userMobilePhone: null,
        userLoginName: null,
        operatorType: '',
        operatorLevel: '',
        operatorStatus: ''
      }, // 搜索查询参数

      columns, // 表头
      loadDatas: [], // 表格请求的数据
      pagination: false, // 不显示分页

      // 分页
      pageSizeOptions: ['10', '20', '50', '100'],
      currentPage: 1, // 当前的页数
      pageSize: 10, // 每页显示的条数
      totalPage: 0, // 总页数
      totalCount: 0, // 总条数
      loading: true,

      operatorTypeList: [], // 操作员类型
      roleList: [], // 操作员配置列表

      selectedRowKeys: [], // 选中行键
      selectedRows: [], // 选中行键值,

      forms: {},
      editType: 'add',
      modalTitle: '新增',
      visible: !1,
      confirmLoading: !1
    }
  },

  methods: {
    initSelectedRows() {
      this.selectedRowKeys = []
      this.selectedRows = []
    },

    // 高级搜索 展开/收起
    toggleAdvanced() {
      this.advanced = !this.advanced
    },

    // 查询
    queryOperator() {
      this.getOperatorList()
    },

    // 重置
    resetQueryParam() {
      this.queryParam.userNumber = null
      this.queryParam.userLoginName = null
      this.queryParam.userMobilePhone = null
      this.queryParam.operatorType = ''
      this.queryParam.operatorLevel = ''
      this.queryParam.operatorStatus = ''
    },

    // 选择跟新table中的某项
    updateSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },

    // 取消
    handleCancel() {
      this.visible = !1
    },

    // 确认
    handleOk() {
      const _type = this.editType
      if (_type == 'delete') {
        this.deleteOperator()
      } else if (_type == 'reset') {
        this.resetOperatorPwd()
      } else if (_type == 'init') {
        this.initOperatorUser()
      } else if (_type == 'enabled') {
        this.enabledDisOperatorUser()
      } else if (_type == 'disabled') {
        this.enabledDisOperatorUser()
      } else if (_type == 'detail') {
        this.handleCancel()
      } else {
        const flag = this.checkData()
        flag && this.addOrEditOperator()
      }
    },

    // 新增Or编辑菜单
    modifyOperator(e, o) {
      this.editType = e
      if (this.editType == 'add') {
        this.modalTitle = '新增'
        this.visible = !0
        this.forms = {
          operatorType: undefined,
          operatorLevel: 'ordinary_operator',
          userMobilePhone: null,
          userLoginName: null,
          operatorName: null,
          operatorAge: null,
          operatorEmail: null,
          operatorPid: null,
          operatorStatus: 'enabled',
          roleRemark: null,
          roleIdList: []
        }
      } else if (this.editType == 'edit') {
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择一个编辑项！')
          return false
        } else {
          this.modalTitle = '编辑'
          this.getOperatorInfo()
        }
      } else if (this.editType == 'delete') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择删除项！')
          return false
        } else {
          this.modalTitle = '删除'
          this.visible = !0
        }
      } else if (this.editType == 'reset') {
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择一个重置密码项！')
          return false
        } else {
          this.modalTitle = '重置密码'
          this.visible = !0
        }
      } else if (this.editType == 'init') {
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择一个初始化项！')
          return false
        } else {
          this.modalTitle = '初始化账号'
          this.visible = !0
        }
      } else if (this.editType == 'enabled') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择启用项！')
          return false
        } else {
          this.modalTitle = '启用账号'
          this.visible = !0
        }
      } else if (this.editType == 'disabled') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择禁用项！')
          return false
        } else {
          this.modalTitle = '禁用账号'
          this.visible = !0
        }
      } else if (this.editType == 'detail') {
        this.modalTitle = '详情'
        this.getOperatorInfo(o.id)
      }
    },

    // 数据校验
    checkData() {
      let flag = !0
      const mobileReg = /^(1)[0-9]{10}$/
      const emailReg = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/
      const pIdReg = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/
      if (!this.forms.operatorType) {
        flag = !1
        this.$message.warning('请选择操作员类型！')
        return false
      } else if (!mobileReg.test(this.forms.userMobilePhone)) {
        flag = !1
        this.$message.warning('请输入操作员有效手机号！')
        return false
      } else if (!this.forms.userLoginName) {
        flag = !1
        this.$message.warning('请输入操作员登录名！')
        return false
      } else if (!this.forms.operatorName) {
        flag = !1
        this.$message.warning('请输入操作员姓名！')
        return false
      } else if (this.forms.operatorEmail) {
        if (!emailReg.test(this.forms.operatorEmail)) {
          flag = !1
          this.$message.warning('请输入有效的邮箱！')
          return false
        } else {
          return flag
        }
      } else if (this.forms.operatorPid) {
        if (!pIdReg.test(this.forms.operatorEmail)) {
          flag = !1
          this.$message.warning('请输入有效的身份证号！')
          return false
        } else {
          return flag
        }
      } else {
        return flag
      }
    },

    // 添加操作员
    addOrEditOperator() {
      const _type = this.editType
      const data = this.forms
      switch (_type) {
        case 'add':
          addOperator(data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getOperatorList()
              } else {
                this.$message.error(res.msg)
              }
            })
            .catch(err => {
              console.log(err)
            })
          break
        case 'edit':
          modifyOperator(data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getOperatorList()
              } else {
                this.$message.error(res.msg)
              }
            })
            .catch(err => {
              console.log(err)
            })
          break
      }
    },

    // 删除操作员
    deleteOperator() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      removeOperator(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('删除成功！')
            this.getOperatorList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 重置操作员登录密码
    resetOperatorPwd() {
      const _id = this.selectedRows[0].id

      resetOperatorLoginPwd(_id)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('重置成功！')
            this.getOperatorList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 初始化操作员账号
    initOperatorUser() {
      const _id = this.selectedRows[0].id
      initOperatorAccount(_id)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('重置成功！')
            this.getOperatorList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 启用禁用操作员账号
    enabledDisOperatorUser() {
      const _status = this.editType
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })

      changeOperatorStatus(_status, _idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('操作成功！')
            this.getOperatorList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 获取操作员数据列表
    getOperatorList() {
      this.initSelectedRows()
      const _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      }
      getOperatorList(_data)
        .then(res => {
          this.loading = !1
          if (res.code == 0) {
            this.currentPage = res.page.currentPage
            this.pageSize = res.page.pageSize
            this.totalPage = res.page.totalPage
            this.totalCount = res.page.totalCount
            if (res.page.list.length > 0) {
              this.loadDatas = res.page.list
            } else {
              this.loadDatas = []
            }
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 获取操作员信息
    getOperatorInfo(id) {
      let _id = null
      if (id) _id = id
      else _id = this.selectedRows[0].id
      getOperatorInfo(_id)
        .then(res => {
          if (res.code == 0) {
            this.visible = !0
            this.forms = res.operator
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 获取操作员类型
    getOperatorTypeList() {
      getOperatorTypeList()
        .then(res => {
          if (res.code == 0) {
            const _list = res.typeList
            if (_list.length > 0) this.operatorTypeList = _list
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 获取角色配置
    getRoleList() {
      getRoleAllList()
        .then(res => {
          if (res.code == 0) {
            const _list = res.list
            if (_list.length > 0) this.setRoleList(_list)
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },
    //
    setRoleList(arr) {
      const _roleList = arr.map(item => {
        return { label: item.roleName, value: item.id }
      })
      this.roleList = _roleList
    },

    // 分页
    changePage(obj) {
      this.currentPage = obj.currentPage
      this.pageSize = obj.pageSize
      this.getOperatorList()
    }
  },
  created() {
    // 列表数据请求
    this.getOperatorList()
    this.getOperatorTypeList()
    this.getRoleList()
  }
}
</script>

<style lang="less" scoped>
/deep/ .ant-table table {
  table-layout: fixed;
}
/deep/ .ant-table table td {
  white-space: nowrap; /*控制单行显示*/
  overflow: hidden; /*超出隐藏*/
  text-overflow: ellipsis; /*隐藏的字符用省略号表示*/
}
.table-operator {
  margin-bottom: 10px;
}
.ant-pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
