<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="商户名称">
              <a-input v-model="queryParam.merchantName" placeholder="请输入商户名称" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="联系电话">
              <a-input v-model="queryParam.phoneNumber" placeholder="请输入联系电话" />
            </a-form-item>
          </a-col>
          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="商户编号">
                <a-input v-model="queryParam.merchantNumber" placeholder="请输入商户编号" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="支付商户号">
                <a-input v-model="queryParam.mchNo" placeholder="请输入支付商户号" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="商户状态">
                <a-select placeholder="请选择" v-model="queryParam.operationState">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="yes">启用</a-select-option>
                  <a-select-option value="not">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="商户来源">
                <a-select placeholder="请选择" v-model="queryParam.remark">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="自主注册用户">自主注册用户</a-select-option>
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
              <a-button type="primary" @click="queryMerchant">查询</a-button>
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
      <!--add、edit、approve、unlock、disable-->
      <a-button type="primary" icon="edit" @click="handleMerchant('edit')">编辑</a-button>
    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">
      <template slot="merchantName" slot-scope="record">
        <template v-if="record">
          <a-tooltip placement="topLeft">
            <template slot='title'>
              {{record}}
            </template>
            {{record}}
          </a-tooltip>
        </template>
        <template v-else>
          <a-tag>未编辑</a-tag>
        </template>
      </template>

      <template slot="mchNo" slot-scope="record">
        <template v-if="record">
          {{record}}
        </template>
        <template v-else>
          <a-tag>未关联</a-tag>
        </template>
      </template>

      <template slot="operationState" slot-scope="record">
        <a-tag v-if="record=='yes'" color="#87d068">启用</a-tag>
        <a-tag v-else-if="record=='no'" color="#ff0000">禁用</a-tag>
      </template>

      <template slot="Action" slot-scope="text, record, index">
        <a @click="handleMerchant('detail', record)">详情</a>
      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="editType=='add'?'800px':editType=='edit'?'800px':editType=='detail'?'800px':'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='delete'">确认删除所选商户？</p>

      <div class="modal-container" v-else>
        <a-form>
          <a-row :gutter="24">
            <a-col :md="12" :sm="24">
              <a-form-item label="商户名称" :required="true">
                <a-input v-model="forms.merchantName" :disabled="editType=='detail'" placeholder="请输入商户名称" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="联系人电话" :required="true">
                <a-input v-model="forms.phoneNumber" maxlength="11" :disabled="editType=='edit'||editType=='detail'" placeholder="请输入有效的手机号" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="联系人邮箱">
                <a-input v-model="forms.mail" :disabled="editType=='detail'" placeholder="请输入联系人邮箱" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="支付商户号" :required="true">
                <a-input v-model="forms.mchNo" :disabled="editType=='detail'" placeholder="请输入支付商户号" />
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
  addMerchant,
  editMerchant,
  removeMerchant,
  enabledMerchant,
  disabledMerchant,
  getMerchantInfo,
  getMerchantList
} from '@/api/common'
import { mobileToStar } from '@/utils/util'

const columns = [
  {
    title: '商户编号',
    width: '15%',
    dataIndex: 'merchantNumber'
  },
  {
    title: '商户名称',
    width: '15%',
    dataIndex: 'merchantName',
    scopedSlots: { customRender: 'merchantName' }
  },
  {
    title: '联系电话',
    width: '10%',
    dataIndex: 'phoneNumber'
  },
  {
    title: '支付商户号',
    width: '15%',
    dataIndex: 'mchNo',
    scopedSlots: { customRender: 'mchNo' }
  },
  {
    title: '商户来源',
    width: '10%',
    dataIndex: 'remark'
  },
  {
    title: '创建时间',
    width: '15%',
    dataIndex: 'addDataTime'
  },

  {
    title: '商户状态',
    width: '10%',
    align: 'center',
    dataIndex: 'operationState',
    scopedSlots: { customRender: 'operationState' }
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
  name: 'merchantList',
  components: {
    Pagination
  },
  data() {
    return {
      mobileToStar,
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        merchantName: null,
        phoneNumber: null,
        merchantNumber: null,
        mchNo: null,
        operationState: '',
        remark: '',
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
      loading: false,

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

    // 时间筛选
    onChangeDateTime(e, l) {
      this.dateTime = e
      this.queryParam.startTime = l[0]
      this.queryParam.endTime = l[1]
    },

    // 查询
    queryMerchant() {
      this.currentPage = 1
      this.getMerchantList()
    },

    // 重置
    resetQueryParam() {
      this.dateTime = []
      this.queryParam.merchantName = null
      this.queryParam.phoneNumber = null
      this.queryParam.merchantNumber = null
      this.queryParam.mchNo = null
      this.queryParam.operationState = ''
      this.queryParam.remark = ''
      this.queryParam.startTime = ''
      this.queryParam.endTime = ''
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
        this.deleteMerchant()
      } else if (_type == 'enabled') {
        this.enabledMerchant()
      } else if (_type == 'disabled') {
        this.disabledMerchant()
      } else if (_type == 'detail') {
        this.handleCancel()
      } else {
        const flag = this.checkData()
        flag && this.addOrEditMerchant()
      }
    },

    // 操作商户 detail、edit、approve、unlock、disable
    handleMerchant(e, o) {
      this.editType = e
      if (this.editType == 'add') {
        this.modalTitle = '新增'
        this.visible = !0
        this.forms = {
          merchantName: null,
          phoneNumber: null,
          mail: null,
          mchNo: null,
          remark: null,
          operationState: 'not'
        }
      } else if (this.editType == 'detail') {
        this.modalTitle = '详情'
        this.visible = !0
        this.getMerchantInfo(o.id)
      } else if (this.editType == 'edit') {
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择一个编辑项！')
          return false
        } else {
          this.modalTitle = '编辑'
          this.getMerchantInfo()
        }
      } else if (this.editType == 'delete') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择删除项！')
          return false
        } else {
          this.modalTitle = '删除'
          this.visible = !0
        }
      }
      // else if (this.editType == 'pass') {
      //   if (this.selectedRows.length != 1) {
      //     this.$message.warning('请选择一个审核项！')
      //     return false
      //   } else {
      //     this.modalTitle = '通过审核'
      //     this.visible = !0
      //   }
      // } else if (this.editType == 'notpass') {
      //   if (this.selectedRows.length != 1) {
      //     this.$message.warning('请选择一个审核项！')
      //     return false
      //   } else {
      //     this.modalTitle = '不通过审核'
      //     this.visible = !0
      //   }
      // }
      else if (this.editType == 'enabled') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择启用项！')
          return false
        } else {
          // 启用操作 支持批量
          this.modalTitle = '启用'
          this.visible = !0
        }
      } else if (this.editType == 'disabled') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择禁用项！')
          return false
        } else {
          // 禁用操作 支持批量
          this.modalTitle = '禁用'
          this.visible = !0
        }
      }
    },

    // 数据校验
    checkData() {
      let flag = !0
      const mobileReg = /^(1)[0-9]{10}$/
      if (!this.forms.merchantName) {
        flag = !1
        this.$message.warning('请输入商户名称！')
        return false
      } else if (!mobileReg.test(this.forms.phoneNumber)) {
        flag = !1
        this.$message.warning('请输入有效的手机号！')
        return false
      } else if (!this.forms.mchNo) {
        flag = !1
        this.$message.warning('请输入支付商户号！')
        return false
      } else {
        return flag
      }
    },

    // 添加编辑商户
    addOrEditMerchant() {
      const _type = this.editType
      const _data = this.forms
      switch (_type) {
        case 'add':
          addMerchant(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getMerchantList()
              } else {
                this.$message.error(res.msg)
              }
            })
            .catch(err => {
              console.log(err)
            })
          break
        case 'edit':
          editMerchant(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getMerchantList()
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
    deleteMerchant() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      removeMerchant(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('商户已删除！')
            this.getMerchantList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 启用
    enabledMerchant() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      enabledMerchant(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('启用成功！')
            this.getMerchantList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 禁用
    disabledMerchant() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      disabledMerchant(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('禁用成功！')
            this.getMerchantList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 获取商户数据列表
    getMerchantList() {
      this.initSelectedRows()
      const _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      }
      getMerchantList(_data)
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

    // 获取商户信息
    getMerchantInfo(id) {
      let _id = null
      if (id) _id = id
      else _id = this.selectedRows[0].id
      getMerchantInfo(_id)
        .then(res => {
          if (res.code == 0) {
            this.visible = !0
            this.forms = res.result
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
      this.getMerchantList()
    }
  },
  created() {
    // 列表数据请求
    this.getMerchantList()
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
