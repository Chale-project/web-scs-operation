<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">

          <a-col :md="8" :sm="24">
            <a-form-item label="方案代码">
              <a-input v-model="queryParam.commissionCode" placeholder="请输入方案代码" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="方案名称">
              <a-input v-model="queryParam.commissionName" placeholder="请输入方案名称" />
            </a-form-item>
          </a-col>

          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="方案状态">
                <a-select placeholder="请选择" v-model="queryParam.commissionState">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="enabled">启用</a-select-option>
                  <a-select-option value="disabled">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :md="8" :sm="24">
              <a-form-item label="商品编号">
                <a-input v-model="queryParam.commodityCode" placeholder="请输入商品编号" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="商品名称">
                <a-input v-model="queryParam.goodsName" placeholder="请输入商品名称" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="商品状态">
                <a-select placeholder="请选择" v-model="queryParam.goodsState">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="put">上架中</a-select-option>
                  <a-select-option value="out">已下架</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="规则状态">
                <a-select placeholder="请选择" v-model="queryParam.commissionPlanState">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="enabled">启用</a-select-option>
                  <a-select-option value="disabled">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="分佣状态">
                <a-select placeholder="请选择" v-model="queryParam.state">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="enabled">启用</a-select-option>
                  <a-select-option value="disabled">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :md="8" :sm="24">
              <a-form-item label="分佣方式">
                <a-select placeholder="请选择" v-model="queryParam.commissionType">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="good">商品利润</a-select-option>
                  <a-select-option value="order">付款金额</a-select-option>
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
              <a-button type="primary" @click="queryBrokerageOrder">查询</a-button>
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
      <a-button type="primary" icon="delete" @click="handleBGoods('batchDelete')">批量删除</a-button>

      <a-dropdown>
        <a-menu slot="overlay">
          <a-menu-item key="3" @click="handleBGoods('batchEnabled')">
            <a-icon type="unlock" />启用
          </a-menu-item>
          <a-menu-item key="4" @click="handleBGoods('batchDisabled')">
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
    <a-table size="middle" :scroll="{ x: 1800}" :rowKey="record => record.id" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">

      <template slot="commissionType" slot-scope="record">
        {{record=='good'?'商品利润':'付款金额'}}
      </template>

      <template slot="shopCommission" slot-scope="record">
        {{`${record}%`}}
      </template>

      <template slot="oneAgentCommission" slot-scope="record">
        {{`${record}%`}}
      </template>

      <template slot="goodsState" slot-scope="text,record" v-if="record.goodsName">
        <a-tag v-if="text=='put'" color="#87d068">上架中</a-tag>
        <a-tag v-else-if="text=='out'" color="#ff0000">已下架</a-tag>
        <a-tag v-else>未知</a-tag>
      </template>

      <template slot="commissionState" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">启用</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">禁用</a-tag>
      </template>

      <template slot="commissionPlanState" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">启用</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">禁用</a-tag>
      </template>

      <template slot="state" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">启用</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">禁用</a-tag>
      </template>

      <template slot="Action" slot-scope="text, record">
        <a @click="handleBGoods('delete', record)">删除</a>
        <a-divider type="vertical" />
        <a-dropdown>
          <a-menu slot="overlay">
            <a-menu-item key="1" @click="handleBGoods('enabled', record)">
              <a-icon type="check-circle" />启用
            </a-menu-item>
            <a-menu-item key="2" @click="handleBGoods('disabled', record)">
              <a-icon type="stop" />禁用
            </a-menu-item>
          </a-menu>
          <a>
            操作
            <a-icon type="down" />
          </a>
        </a-dropdown>
      </template>

    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="editType=='detail'?'800px':'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <div class="modal-container" v-if="editType=='batchEnabled'">
        <p>确认批量启用所选项？</p>
      </div>
      <div class="modal-container" v-else-if="editType=='batchDisabled'">
        <p>确认批量禁用所选项？</p>
      </div>

      <div class="modal-container" v-else-if="editType=='enabled'">
        <p>确认启用所选佣金规则？</p>
      </div>
      <div class="modal-container" v-else-if="editType=='disabled'">
        <p>确认禁用所选佣金规则？</p>
      </div>

      <div class="modal-container" v-else-if="editType=='delete'">
        <p>确认删除所选佣金规则？</p>
      </div>
      <div class="modal-container" v-else-if="editType=='batchDelete'">
        <p>确认批量删除所选佣金规则？</p>
      </div>
    </a-modal>
  </div>
</template>

<script>
import Pagination from '@/components/pagination/pagination'
import { removePlanRule, getBGsCyList, setBatchPlanRuleState } from '@/api/common'

const columns = [
  {
    title: '方案名称',
    width: '8%',
    dataIndex: 'commissionName'
  },
  {
    title: '方案代码',
    width: '6%',
    dataIndex: 'commissionCode'
  },
  {
    title: '商品类目',
    width: '6%',
    dataIndex: 'categoryName'
  },
  {
    title: '商品编号',
    width: '10%',
    dataIndex: 'commodityCode'
  },
  {
    title: '商品名称',
    width: '10%',
    dataIndex: 'goodsName'
  },
  {
    title: '商品状态',
    width: '6%',
    align: 'center',
    dataIndex: 'goodsState',
    scopedSlots: { customRender: 'goodsState' }
  },
  {
    title: '分佣方式',
    width: '6%',
    align: 'center',
    dataIndex: 'commissionType',
    scopedSlots: { customRender: 'commissionType' }
  },
  {
    title: '商户配比',
    width: '7%',
    align: 'center',
    dataIndex: 'shopCommission',
    scopedSlots: { customRender: 'shopCommission' }
  },
  {
    title: '一级代理配比',
    width: '7%',
    align: 'center',
    dataIndex: 'oneAgentCommission',
    scopedSlots: { customRender: 'oneAgentCommission' }
  },

  {
    title: '方案状态',
    width: '7%',
    align: 'center',
    dataIndex: 'commissionState',
    scopedSlots: { customRender: 'commissionState' }
  },
  {
    title: '规则状态',
    width: '7%',
    align: 'center',
    dataIndex: 'commissionPlanState',
    scopedSlots: { customRender: 'commissionPlanState' }
  },
  {
    title: '分佣状态',
    width: '7%',
    align: 'center',
    dataIndex: 'state',
    scopedSlots: { customRender: 'state' }
  },
  {
    title: '创建时间',
    width: '13%',
    align: 'center',
    dataIndex: 'addDataTime'
  },
  {
    title: '操作',
    width: '150px',
    align: 'center',
    fixed: 'right',
    dataIndex: 'Action',
    scopedSlots: { customRender: 'Action' }
  }
]

export default {
  name: 'brokerageGoods',
  components: {
    Pagination
  },
  data() {
    return {
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        commissionCode: null,
        commissionName: null,
        commodityCode: null,
        goodsName: null,
        commissionType: '',
        goodsState: '',
        commissionState: '',
        commissionPlanState: '',
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

      operationId: null, // 操作数据id

      editType: 'batchEnabled',
      modalTitle: '批量启用',
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
    queryBrokerageOrder() {
      this.currentPage = 1
      this.getBGsCyList()
    },

    // 重置
    resetQueryParam() {
      this.dateTime = []

      this.queryParam.commissionCode = null
      this.queryParam.commissionName = null
      this.queryParam.commodityCode = null
      this.queryParam.goodsName = null
      this.queryParam.commissionType = ''
      this.queryParam.goodsState = ''
      this.queryParam.commissionState = ''
      this.queryParam.commissionPlanState = ''
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
      if (_type == 'enabled' || _type == 'disabled') {
        this.setBGoodsState()
      } else if (_type == 'batchEnabled' || _type == 'batchDisabled') {
        this.setBatchBGoodsState()
      } else if (_type == 'delete' || _type == 'batchDelete') {
        this.deleteBGoods()
      }
    },

    // 操作商品佣金
    handleBGoods(e, o) {
      this.editType = e
      if (o) this.operationId = o.id
      else this.operationId = null

      if (e == 'enabled') {
        this.modalTitle = '启用'
        this.visible = !0
      } else if (e == 'disabled') {
        this.modalTitle = '禁用'
        this.visible = !0
      } else if (e == 'batchEnabled') {
        // 批启用
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择批量启用佣金商品项！')
          return false
        } else {
          this.modalTitle = '批量启用'
          this.visible = !0
        }
      } else if (e == 'batchDisabled') {
        // 批启用
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择批量禁用佣金商品项！')
          return false
        } else {
          this.modalTitle = '批量禁用'
          this.visible = !0
        }
      } else if (e == 'delete') {
        this.modalTitle = '删除'
        this.visible = !0
      } else if (e == 'batchDelete') {
        // 批量删
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择删除佣金商品项！')
          return false
        } else {
          this.modalTitle = '批量删除'
          this.visible = !0
        }
      }
    },

    // 删除比例
    deleteBGoods() {
      let _idsArr = []
      const _id = this.operationId
      const _idArr = this.selectedRowKeys

      if (_id) _idsArr.push(_id)
      else _idsArr = _idArr

      removePlanRule(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('操作成功！')
            this.getBGsCyList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 启用禁用比例
    setBGoodsState() {
      const data = {
        idArr: this.operationId,
        state: this.editType
      }
      setBatchPlanRuleState(data)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('操作成功！')
            this.getBGsCyList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 批量启用禁用比例
    setBatchBGoodsState() {
      const data = {
        idArr: this.selectedRowKeys,
        state: this.editType == 'batchEnabled' ? 'enabled' : 'disabled'
      }
      setBatchPlanRuleState(data)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('操作成功！')
            this.getBGsCyList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 获取结算订单数据列表
    getBGsCyList() {
      this.initSelectedRows()

      const _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      }
      getBGsCyList(_data)
        .then(res => {
          this.loading = !1
          if (res.code == 0) {
            this.currentPage = res.result.currentPage
            this.pageSize = res.result.pageSize
            this.totalPage = res.result.totalPage
            this.totalCount = res.result.totalCount
            if (res.result.list.length > 0) {
              this.loadDatas = res.result.list
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
      this.getBGsCyList()
    }
  },
  created() {
    // 列表数据请求
    this.getBGsCyList()
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
