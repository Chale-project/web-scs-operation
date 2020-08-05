<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="代理商名称">
              <a-input v-model="queryParam.agentName" placeholder="请输入代理商名称" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="代理商编号">
              <a-input v-model="queryParam.agentId" placeholder="请输入代理商编号" />
            </a-form-item>
          </a-col>

          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="审核状态">
                <a-select placeholder="请选择" v-model="queryParam.state">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="not">未审核</a-select-option>
                  <a-select-option value="pass">通过</a-select-option>
                  <a-select-option value="notpass">不通过</a-select-option>
                  <a-select-option value="correct">冲正</a-select-option>
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
              <a-button type="primary" @click="queryAgent">查询</a-button>
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
      <a-button type="primary" icon="check-circle" @click="handleAgent('pass')">审核通过</a-button>
      <a-button type="primary" icon="stop" @click="handleAgent('notpass')">审核不通过</a-button>
    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">

      <template slot="grade" slot-scope="record">
        <a-tag v-if="record=='one'">一级代理</a-tag>
        <a-tag v-else-if="record=='two'">二级代理</a-tag>
        <a-tag v-else-if="record=='three'">三级代理</a-tag>
      </template>

      <template slot="money" slot-scope="record">
        {{record/100}}
      </template>

      <template slot="state" slot-scope="record">
        <a-tag v-if="record=='not'">未审核</a-tag>
        <a-tag v-else-if="record=='pass'" color="#87d068">通过</a-tag>
        <a-tag v-else-if="record=='notpass'" color="#ff0000">不通过</a-tag>
        <a-tag v-else-if="record=='correct'" color="#ff5500">冲正</a-tag>
      </template>
      <template slot="Action" slot-scope="text, record, index">
        <a @click="handleAgent('correct', record, index)" v-if="record.state=='pass'">冲正</a>
      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">

      <div class="modal-container" v-if="editType=='pass'">
        <p>确认审核通过所选代理商续费申请？</p>
      </div>
      <div class="modal-container" v-else-if="editType=='notpass'">
        <p>确认审核不通过所选代理商续费申请？</p>
      </div>
      <div class="modal-container" v-else-if="editType=='correct'">
        <a-form>
          <a-row :gutter="24">
            <a-col :md="24" :sm="24">
              <a-form-item label="冲正原因" :required="true">
                <a-input v-model="correct.correctReason" placeholder="请输入冲正原因" />
              </a-form-item>
            </a-col>
            <a-col :md="24" :sm="24">
              <a-form-item label="冲正描述">
                <a-textarea v-model="correct.correctDescribe" :rows="4" placeholder="请填写冲正描述" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <div class="modal-container" v-else>
        <!-- <a-form>
          <a-row :gutter="24">
            <a-col :md="24" :sm="24">
              <a-form-item label="不通过原因" :required="true">
                <a-textarea v-model="notPassCause" :rows="4" placeholder="请填写不通过原因" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form> -->
      </div>

    </a-modal>
  </div>
</template>

<script>
import Pagination from '@/components/pagination/pagination'
import { getRechargeAgentList, auditRechargeAgentOk, auditRechargeAgentNo, correctRechargeAgent } from '@/api/common'
import { mobileToStar } from '@/utils/util'

const columns = [
  {
    title: '代理商编号',
    width: '15%',
    dataIndex: 'agentId'
  },
  {
    title: '代理商名称',
    width: '15%',
    dataIndex: 'agentName'
  },
  {
    title: '代理商级别',
    width: '10%',
    align: 'center',
    dataIndex: 'grade',
    scopedSlots: { customRender: 'grade' }
  },
  {
    title: '续费金额',
    width: '15%',
    dataIndex: 'money',
    scopedSlots: { customRender: 'money' }
  },

  {
    title: '续费套数',
    width: '10%',
    dataIndex: 'quota'
  },
  {
    title: '状态',
    width: '10%',
    align: 'center',
    dataIndex: 'state',
    scopedSlots: { customRender: 'state' }
  },
  {
    title: '创建时间',
    width: '15%',
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
  name: 'renew',
  components: {
    Pagination
  },
  data() {
    return {
      mobileToStar,
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        agentName: null,
        agentId: null,
        linkmanPhoneNumber: null,
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

      correct: {
        correctReason: '',
        correctDescribe: null
      },

      editType: 'pass',
      modalTitle: '审核通过',
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
    queryAgent() {
      this.currentPage = 1
      this.getRenewAgentList()
    },

    // 重置
    resetQueryParam() {
      this.dateTime = []

      this.queryParam.linkmanPhoneNumber = null
      this.queryParam.agentName = null
      this.queryParam.agentId = null
      this.queryParam.state = ''
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
      if (_type == 'pass') {
        this.passRenewAgent()
      } else if (_type == 'notpass') {
        this.notPassRenewAgent()
      } else if (_type == 'correct') {
        const flag = this.checkCorrectData()
        flag && this.correctRenewAgent()
      }
    },

    // 操作续费
    handleAgent(e, o, i) {
      this.editType = e
      if (this.editType == 'pass') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择审核通过项！')
          return false
        } else {
          this.modalTitle = '审核通过'
          this.visible = !0
        }
      } else if (this.editType == 'notpass') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择审核不通过项！')
          return false
        } else {
          this.modalTitle = '审核不通过'
          this.visible = !0
        }
      } else if (this.editType == 'correct') {
        this.initSelectedRows()
        this.selectedRows.push(o)
        this.selectedRowKeys.push(i)
        this.modalTitle = '续费冲正'
        this.visible = !0
      }
    },

    //审核不通过数据校验
    checkNotpassData() {
      if (!this.notPassCause) {
        this.$message.warning('请填写不通过原因！')
        return false
      } else {
        return true
      }
    },

    //冲正数据校验
    checkCorrectData() {
      const _data = this.correct
      if (!_data.correctReason) {
        this.$message.warning('请选择冲正原因！')
        return false
      } else {
        return true
      }
    },

    // 通过
    passRenewAgent() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      auditRechargeAgentOk(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('审核成功！')
            this.getRenewAgentList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 不通过
    notPassRenewAgent() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      auditRechargeAgentNo(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('审核成功！')
            this.getRenewAgentList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 冲正
    correctRenewAgent() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      const _data = this.correct
      _data.ids = _idsArr
      correctRechargeAgent(_data)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('冲正成功！')
            this.getRenewAgentList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 获取续费数据列表
    getRenewAgentList() {
      this.initSelectedRows()

      const _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      }
      getRechargeAgentList(_data)
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

    // 分页
    changePage(obj) {
      this.currentPage = obj.currentPage
      this.pageSize = obj.pageSize
      this.getRenewAgentList()
    }
  },
  created() {
    // 列表数据请求
    this.getRenewAgentList()
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
  max-height: 650px;
  padding: 0 12px;
  overflow-y: auto;
}
</style>
