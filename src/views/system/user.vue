<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="用户编号">
              <a-input v-model="queryParam.customerNumber" placeholder="请填写用户编号" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="用户手机号">
              <a-input v-model="queryParam.phoneNumber" placeholder="请填写用户手机号" />
            </a-form-item>
          </a-col>

          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="用户状态">
                <a-select placeholder="请选择" v-model="queryParam.state">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="enabled">启用</a-select-option>
                  <a-select-option value="disabled">禁用</a-select-option>
                  <a-select-option value="not">未激活</a-select-option>
                  <a-select-option value="unknown">未知</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </template>

          <a-col :md="!advanced && 8 || 24" :sm="24">
            <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
              <a-button type="primary" @click="queryUser">查询</a-button>
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
      <!-- <a-button type="primary" icon="delete" @click="modifyUser('delete')">删除</a-button>
      <a-button type="primary" icon="key" @click="modifyUser('reset')">重置用户登录密码</a-button> -->
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="modifyUser('enabled')">
            <a-icon type="unlock" />启用
          </a-menu-item>
          <!-- lock | unlock -->
          <a-menu-item key="2" @click="modifyUser('disabled')">
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
      <span slot="userStatus" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">启用</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">禁用</a-tag>
        <a-tag v-else-if="record=='not'" color="#faad14">未激活</a-tag>
        <a-tag v-else-if="record=='unknown'">未知</a-tag>
      </span>

      <template slot="Action" slot-scope="text,record">
        <span>
          <a href="javascript:;" @click="modifyUser('detail', record)">详情</a>
        </span>
      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新建编辑模态框 -->
    <a-modal :width="editType=='detail'?'800px':'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='delete'">确认删除此用户码？</p>
      <p v-else-if="editType=='reset'">确认重置此用户登录密码？</p>
      <p v-else-if="editType=='enabled'">确认启用所选用户码？</p>
      <p v-else-if="editType=='disabled'">确认禁用所选用户码？</p>
      <div class="modal-container" v-else>
        <a-form>
          <a-row :gutter="24">

            <a-col :md="12" :sm="24">
              <a-form-item label="用户编号">
                <a-input :value="forms.customerNumber" disabled />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="用户手机号">
                <a-input :value="forms.phoneNumber" disabled />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="用户昵称">
                <a-input :value="forms.nickname" disabled />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="用户真实名">
                <a-input :value="forms.name" disabled />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="用户性别">
                <a-input :value="forms.gender=='man'?'男':forms.userSex=='male'?'男':forms.userSex=='woman'?'女':'未知'" disabled />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="用户年龄">
                <a-input :value="forms.age>0?forms.age:''" disabled />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="用户邮箱">
                <a-input :value="forms.userEmail" disabled />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="用户身份证">
                <a-input :value="forms.idNumber" disabled />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="用户状态">
                <a-select placeholder="请选择" v-model="forms.state" disabled>
                  <a-select-option value="enabled">启用</a-select-option>
                  <a-select-option value="disabled">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="创建时间">
                <a-input :value="forms.joinTime" disabled />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="备注">
                <a-input :value="forms.remark" disabled />
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
import { getUserInfo, enabledUser, disabledUser, getUserList } from '@/api/system'

const columns = [
  {
    title: '用户编号',
    width: '15%',
    dataIndex: 'customerNumber'
  },
  {
    title: '用户手机号',
    width: '15%',
    dataIndex: 'phoneNumber'
  },
  {
    title: '用户昵称',
    width: '15%',
    dataIndex: 'nickname'
  },
  {
    title: '状态',
    width: '10%',
    dataIndex: 'state',
    align: 'center',
    scopedSlots: { customRender: 'userStatus' }
  },
  {
    title: '创建时间',
    width: '20%',
    dataIndex: 'joinTime'
  },
  {
    title: '操作',
    width: '10%',
    dataIndex: 'Action',
    align: 'center',
    scopedSlots: { customRender: 'Action' }
  }
]

export default {
  name: 'User',
  components: {
    Pagination
  },
  data() {
    return {
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        customerNumber: null,
        phoneNumber: null,
        state: ''
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

      selectedRowKeys: [], // 选中行键
      selectedRows: [], // 选中行键值,

      forms: {},
      editType: 'detail',
      modalTitle: '详情',
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
    queryUser() {
      this.getUserList()
    },

    // 重置
    resetQueryParam() {
      this.queryParam.customerNumber = null
      this.queryParam.phoneNumber = null
      this.queryParam.state = ''
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
        this.deleteUser()
      } else if (_type == 'reset') {
        this.resetUserPwd()
      } else if (_type == 'enabled') {
        this.enabledUser()
      } else if (_type == 'disabled') {
        this.disabledUser()
      } else {
        this.handleCancel()
      }
    },

    // 新建Or编辑Or启用Or禁用
    modifyUser(e, o) {
      this.editType = e
      if (this.editType == 'detail') {
        this.modalTitle = '详情'
        this.getUserInfo(o.id)
      } else if (this.editType == 'delete') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择删除项！')
          return false
        } else {
          this.modalTitle = '删除'
          this.visible = !0
        }
      } else if (this.editType == 'reset') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择重置密码项！')
          return false
        } else {
          this.modalTitle = '重置密码'
          this.visible = !0
        }
      } else if (this.editType == 'enabled') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择启用项！')
          return false
        } else {
          this.modalTitle = '启用'
          this.visible = !0
        }
      } else if (this.editType == 'disabled') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择禁用项！')
          return false
        } else {
          this.modalTitle = '禁用'
          this.visible = !0
        }
      }
    },

    // 删除菜单
    deleteUser() {},

    // 重置用户密码
    resetUserPwd() {},

    // 启用
    enabledUser() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      enabledUser(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('启用成功！')
            this.getUserList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 禁用
    disabledUser() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      disabledUser(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('禁用成功！')
            this.getUserList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 获取角色数据列表
    getUserList() {
      this.initSelectedRows()
      const _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      }
      getUserList(_data)
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

    // 获取用户信息
    getUserInfo(id) {
      getUserInfo(id)
        .then(res => {
          if (res.code == 0) {
            this.visible = !0
            this.forms = res.info
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 分页
    changePage(obj) {
      this.currentPage = obj.currentPage
      this.pageSize = obj.pageSize
      this.getUserList()
    }
  },
  created() {
    // 列表数据请求
    this.getUserList()
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
