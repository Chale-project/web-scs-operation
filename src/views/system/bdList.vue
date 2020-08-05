<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="业务员编号">
              <a-input v-model="queryParam.salesmanNumber" placeholder="请输入业务员编号" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="手机号">
              <a-input v-model="queryParam.phoneNumber" placeholder="请输入手机号" />
            </a-form-item>
          </a-col>
          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="业务员姓名">
                <a-input v-model="queryParam.salesmanName" placeholder="请输入业务员姓名" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="状态">
                <a-select placeholder="请选择" v-model="queryParam.state">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="enabled">启用</a-select-option>
                  <a-select-option value="disabled">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="创建时间">
                <a-range-picker v-model="dateTime" :allowClear="false" @change="onChangeDateTime" />
              </a-form-item>
            </a-col>
          </template>
          <a-col :md="!advanced && 8 || 24" :sm="24">
            <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
              <a-button type="primary" @click="queryBd">查询</a-button>
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
      <a-button type="primary" icon="plus" @click="handleBd('add')">新增</a-button>
      <a-button type="primary" icon="edit" @click="handleBd('edit')">编辑</a-button>
      <!-- <a-button type="primary" icon="delete" @click="handleBd('delete')">删除</a-button> -->
      <a-dropdown>
        <a-menu slot="overlay">
          <a-menu-item key="3" @click="handleBd('enabled')">
            <a-icon type="unlock" />启用
          </a-menu-item>
          <!-- lock | unlock -->
          <a-menu-item key="4" @click="handleBd('disabled')">
            <a-icon type="lock" />禁用
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          状态操作
          <a-icon type="down" />
        </a-button>
      </a-dropdown>
    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">

      <template slot="phoneNumber" slot-scope="record">
        {{ mobileToStar(record) }}
      </template>

      <template slot="state" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">启用</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">禁用</a-tag>
      </template>

      <template slot="Action" slot-scope="text, record, index">
        <a @click="handleBd('detail', record)">详情</a>
      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="editType=='add'?'800px':editType=='edit'?'800px':editType=='detail'?'800px':'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='delete'">确认删除所选业务员？</p>

      <p v-else-if="editType=='enabled'">确认启用所选业务员？</p>
      <p v-else-if="editType=='disabled'">确认禁用所选业务员？</p>

      <div class="modal-container" v-else>
        <a-form>
          <a-row :gutter="24">
            <a-col :md="12" :sm="24">
              <a-form-item label="业务员姓名" :required="true">
                <a-input v-model="forms.salesmanName" :disabled="editType=='edit'||editType=='detail'" placeholder="请输入业务员姓名" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="业务员电话" :required="true">
                <a-input v-model="forms.phoneNumber" maxlength="11" :disabled="editType=='edit'||editType=='detail'" placeholder="请输入有效的手机号" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="结算方式" :required="true">
                <a-radio-group v-model="forms.accountChannel" :disabled="editType=='edit'||editType=='detail'" @change="onChangeAccountChannel">
                  <a-radio value="card">银行卡</a-radio>
                  <a-radio value="alipay">支付宝</a-radio>
                  <a-radio value="wechat">微信</a-radio>
                  <a-radio value="qq">QQ钱包</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <template v-if="forms.accountChannel=='card'">
              <a-col :md="12" :sm="24">
                <a-form-item label="开户行" :required="true">
                  <a-select v-model="forms.bankName" :disabled="editType=='edit'||editType=='detail'" placeholder="请选择">
                    <a-select-option value="boc">中国银行</a-select-option>
                    <a-select-option value="agr">中国农业银行</a-select-option>
                    <a-select-option value="icbc">中国工商银行</a-select-option>
                    <a-select-option value="ccb">中国建设银行</a-select-option>
                    <a-select-option value="cmb">招商银行</a-select-option>
                    <a-select-option value="cib">兴业银行</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="12" :sm="24">
                <a-form-item label="开户支行" :required="true">
                  <a-input v-model="forms.bankAddress" :disabled="editType=='edit'||editType=='detail'" placeholder="请输入开户支行" />
                </a-form-item>
              </a-col>
            </template>
            <a-col :md="12" :sm="24">
              <a-form-item :label="forms.accountChannel=='card'?'银行卡账号':forms.accountChannel=='alipay'?'支付宝账号':forms.accountChannel=='wechat'?'微信账号':forms.accountChannel=='qq'?'QQ账号':''" :required="true">
                <a-input v-model="forms.accountNumber" :disabled="editType=='edit'||editType=='detail'" :placeholder="forms.accountChannel=='card'?'请输入银行卡号':forms.accountChannel=='alipay'?'请输入支付宝账号':forms.accountChannel=='wechat'?'请输入微信账号':forms.accountChannel=='qq'?'请输入QQ号':'请输入'" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item :label="forms.accountChannel=='card'?'账号姓名':forms.accountChannel=='alipay'?'支付宝昵称':forms.accountChannel=='wechat'?'微信昵称':forms.accountChannel=='qq'?'QQ昵称':''" :required="true">
                <a-input v-model="forms.accountName" :disabled="editType=='edit'||editType=='detail'" :placeholder="forms.accountChannel=='card'?'请输入账号姓名':forms.accountChannel=='alipay'?'请输入支付宝昵称':forms.accountChannel=='wechat'?'请输入微信昵称':forms.accountChannel=='qq'?'请输入QQ昵称':'请输入'" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="备注">
                <a-textarea v-model="forms.remark" :disabled="editType=='detail'" placeholder="请输入备注" />
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

import {
  addBd,
  getBdInfo,
  modifyBd,
  removeBd,
  enabledBd,
  disabledBd,
  auditBdOk,
  auditBdNo,
  getBdList
} from '@/api/common'
import { mobileToStar } from '@/utils/util'

const columns = [
  {
    title: '编号',
    width: '15%',
    dataIndex: 'salesmanNumber'
  },
  {
    title: '姓名',
    width: '15%',
    dataIndex: 'salesmanName'
  },
  {
    title: '手机号',
    width: '15%',
    dataIndex: 'phoneNumber',
    scopedSlots: { customRender: 'phoneNumber' }
  },

  {
    title: '状态',
    width: '15%',
    align: 'center',
    dataIndex: 'state',
    scopedSlots: { customRender: 'state' }
  },
  {
    title: '创建时间',
    width: '20%',
    align: 'center',
    dataIndex: 'addDataTime'
  },
  {
    title: '操作',
    width: '10%',
    align: 'center',
    dataIndex: 'Action',
    scopedSlots: { customRender: 'Action' }
  }
]

export default {
  name: 'Bd',
  components: {
    Pagination
  },
  data() {
    return {
      mobileToStar,
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        salesmanNumber: null,
        salesmanName: null,
        phoneNumber: null,
        state: '',
        startTime: '',
        endTime: ''
      }, // 搜索查询参数

      dateTime: [],

      columns, // 表头
      loadDatas: [], // 表格请求的数据
      pagination: false, // 不显示分页

      // 分页
      pageSizeOptions: ['10', '30', '50', '100'],
      currentPage: 1, // 当前的页数
      pageSize: 10, // 每页显示的条数
      totalPage: 0, // 总页数
      totalCount: 0, // 总条数
      loading: true,

      selectedRowKeys: [], // 选中行键
      selectedRows: [], // 选中行键值,

      notPassCause: null, // 不通过原因

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

    // 时间筛选
    onChangeDateTime(e, l) {
      this.dateTime = e
      this.queryParam.startTime = l[0]
      this.queryParam.endTime = l[1]
    },

    // 查询
    queryBd() {
      this.getBdList()
    },

    // 重置
    resetQueryParam() {
      this.dateTime = []

      this.queryParam.salesmanNumber = null
      this.queryParam.salesmanName = null
      this.queryParam.phoneNumber = null
      this.queryParam.state = ''
      this.queryParam.startTime = ''
      this.queryParam.endTime = ''
    },

    // 选择跟新table中的某项
    updateSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },

    // 切换结算方式
    onChangeAccountChannel(e) {
      if (e.target.value != 'card') {
        this.forms.bankName = null
        this.forms.bankAddress = null
      }
    },

    // 取消
    handleCancel() {
      this.visible = !1
    },

    // 确认
    handleOk() {
      const _type = this.editType
      if (_type == 'delete') {
        this.deleteBd()
      } else if (_type == 'pass') {
        this.passBd()
      } else if (_type == 'notpass') {
        const flag = this.checkNotpassData()
        flag && this.notPassBd()
      } else if (_type == 'enabled') {
        this.enabledBd()
      } else if (_type == 'disabled') {
        this.disabledBd()
      } else if (_type == 'detail') {
        this.handleCancel()
      } else {
        const flag = this.checkData()
        flag && this.addOrEditBd()
      }
    },

    // 操作业务员
    handleBd(e, o) {
      this.editType = e
      if (this.editType == 'add') {
        this.modalTitle = '新增'
        this.visible = !0
        this.forms = {
          salesmanName: null,
          phoneNumber: null,
          accountChannel: 'card',
          bankName: null,
          bankAddress: null,
          accountName: null,
          accountNumber: null,
          remark: null,
          state: 'enabled',
          notPassCause: null
        }
      } else if (this.editType == 'edit') {
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择一个编辑项！')
          return false
        } else {
          this.modalTitle = '编辑'
          this.getBdInfo()
        }
      } else if (this.editType == 'delete') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择删除项！')
          return false
        } else {
          this.modalTitle = '删除'
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
      } else if (this.editType == 'detail') {
        this.modalTitle = '详情'
        this.getBdInfo(o.id)
      }
    },

    // 数据校验
    checkData() {
      let flag = !0
      const _formsData = this.forms
      const mobileReg = /^(1)[0-9]{10}$/
      const number = /^\d+$/
      if (!_formsData.salesmanName) {
        flag = !1
        this.$message.warning('请输入业务员姓名！')
        return false
      } else if (!mobileReg.test(_formsData.phoneNumber)) {
        flag = !1
        this.$message.warning('请输入有效的手机号！')
        return false
      }
      if (_formsData.accountChannel == 'card') {
        if (!_formsData.bankName) {
          flag = !1
          this.$message.warning('请选择开户行！')
          return false
        } else if (!_formsData.bankAddress) {
          flag = !1
          this.$message.warning('请输入开户支行！')
          return false
        }
      }
      if (!_formsData.accountNumber) {
        flag = !1
        this.$message.warning('请输入结算账号！')
        return false
      }
      if (!_formsData.accountName) {
        flag = !1
        this.$message.warning('请输入账号名称！')
        return false
      }
      return flag
    },

    // 添加编辑
    addOrEditBd() {
      const _type = this.editType
      const _data = this.forms
      switch (_type) {
        case 'add':
          addBd(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getBdList()
              } else {
                this.$message.error(res.msg)
              }
            })
            .catch(err => {
              console.log(err)
            })
          break
        case 'edit':
          modifyBd(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getBdList()
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

    // 删除
    deleteBd() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      removeBd(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('业务员已删除！')
            this.getBdList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 启用
    enabledBd() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      enabledBd(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('启用成功！')
            this.getBdList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 禁用
    disabledBd() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      disabledBd(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('禁用成功！')
            this.getBdList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 获取业务员数据列表
    getBdList() {
      this.initSelectedRows()

      const _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      }
      getBdList(_data)
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

    // 获取业务员信息
    getBdInfo(id) {
      let _id = null
      if (id) _id = id
      else _id = this.selectedRows[0].id
      getBdInfo(_id)
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
      this.getBdList()
    }
  },
  created() {
    // 列表数据请求
    this.getBdList()
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

.modal-container {
  max-height: 600px;
  padding: 0 12px;
  overflow-y: auto;
}
.no-data {
  color: #999;
}
/deep/ .quill-editor:not(.bubble) .ql-container,
.quill-editor:not(.bubble) .ql-container .ql-editor {
  height: 80px;
}
</style>
