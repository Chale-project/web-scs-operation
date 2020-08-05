<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="订单流水号">
              <a-input v-model="queryParam.orderNumber" placeholder="请输入结算流水号" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="订单状态">
              <a-select placeholder="请选择" v-model="queryParam.orderState">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="unpay">待付款</a-select-option>
                <a-select-option value="paid">已支付</a-select-option>
                <a-select-option value="waitSending">待发货</a-select-option>
                <a-select-option value="waitGroup">待成团</a-select-option>
                <a-select-option value="shipped">已发货</a-select-option>
                <a-select-option value="arrived">已送达</a-select-option>
                <a-select-option value="waitReceiving">待收货</a-select-option>
                <a-select-option value="receipted">已收货</a-select-option>
                <a-select-option value="success">已完成</a-select-option>
                <a-select-option value="cancel">已取消</a-select-option>
                <a-select-option value="refund">售后</a-select-option>
                <a-select-option value="refunded">已退款</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="商品编号">
                <a-input v-model="queryParam.commodityCode" placeholder="请输入商品编号" />
              </a-form-item>
            </a-col>

            <a-col :md="8" :sm="24">
              <a-form-item label="分佣方式">
                <a-select placeholder="请选择" v-model="queryParam.commissionCloseType">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="good">商品利润</a-select-option>
                  <a-select-option value="order">付款金额</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :md="8" :sm="24">
              <a-form-item label="结算时间">
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

    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">

      <template slot="payment" slot-scope="record">
        {{record/100}}
      </template>

      <template slot="orderState" slot-scope="record">
        <span v-if="record=='unpay'">待付款</span>
        <span v-else-if="record=='paid'">已支付</span>
        <span v-else-if="record=='waitSending'">待发货</span>
        <span v-else-if="record=='waitGroup'">待成团</span>
        <span v-else-if="record=='shipped'">已发货</span>
        <span v-else-if="record=='arrived'">已送达</span>
        <span v-else-if="record=='waitReceiving'">待收货</span>
        <span v-else-if="record=='receipted'">已收货</span>
        <span v-else-if="record=='success'">已完成</span>
        <span v-else-if="record=='cancel'">已取消</span>
        <span v-else-if="record=='refund'">售后</span>
        <span v-else-if="record=='refunded'">已退款</span>
      </template>

      <template slot="commissionCloseType" slot-scope="record">
        {{record=='good'?'商品利润':'付款金额'}}
      </template>

      <template slot="state" slot-scope="record">
        <a-tag v-if="record=='wait'">未结算</a-tag>
        <a-tag v-else-if="record=='already'">已结算</a-tag>
        <a-tag v-else-if="record=='arrived'">已到账</a-tag>
        <a-tag v-else-if="record=='waitCorrect'">待冲正</a-tag>
        <a-tag v-else-if="record=='correct'">冲正</a-tag>
        <a-tag v-else-if="record=='cancel'">已作废</a-tag>
      </template>

      <template slot="Action" slot-scope="text, record, index">
        <a @click="handleBrokerageOrder('detail', record)">详情</a>
        <a-divider type="vertical" v-if="record.state!='wait'&&record.state!='correct'" />
        <a @click="handleBrokerageOrder('correct', record, index)" v-if="record.state!='wait'&&record.state!='correct'">冲正</a>
      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="editType=='detail'?'800px':'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">

      <div class="modal-container" v-if="editType=='correct'">
        <a-form>
          <a-row :gutter="24">
            <a-col :md="24" :sm="24">
              <a-form-item label="冲正原因" :required="true">
                <a-select v-model="correct.correctReason" placeholder="请选择">
                  <a-select-option value="" disabled>请选择冲正原因</a-select-option>
                  <a-select-option value="退款">退款</a-select-option>
                </a-select>
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
        <detail-list title="订单详情">
          <detail-list-item term="订单编号">{{brokerageOrderInfo.orderNumber}}</detail-list-item>
          <detail-list-item term="订单状态">{{brokerageOrderInfo.orderState=='unpay'?'待付款':brokerageOrderInfo.orderState=='paid'?'待付款':brokerageOrderInfo.orderState=='waitSending'?'待付款':brokerageOrderInfo.orderState=='waitGroup'?'待付款':brokerageOrderInfo.orderState=='shipped'?'待付款':brokerageOrderInfo.orderState=='arrived'?'待付款':brokerageOrderInfo.orderState=='waitReceiving'?'待付款':brokerageOrderInfo.orderState=='receipted'?'待付款':brokerageOrderInfo.orderState=='success'?'待付款':brokerageOrderInfo.orderState=='cancel'?'待付款':brokerageOrderInfo.orderState=='refund'?'待付款':brokerageOrderInfo.orderState=='refunded'?'待付款':'未知'}}</detail-list-item>
          <detail-list-item term="实付金额">{{brokerageOrderInfo.payment/100}}</detail-list-item>
          <detail-list-item term="商品名称">{{brokerageOrderInfo.goodsName}}</detail-list-item>
          <detail-list-item term="商品编号">{{brokerageOrderInfo.commodityCode}}</detail-list-item>
          <detail-list-item term="来源商户">{{brokerageOrderInfo.shopName}}</detail-list-item>
          <detail-list-item term="商户编号">{{brokerageOrderInfo.shopId}}</detail-list-item>
        </detail-list>
        <a-divider style="margin-bottom: 32px" />

        <detail-list title="分佣信息">
          <detail-list-item term="分佣方式">{{brokerageOrderInfo.commissionCloseType=='good'?'商品利润':'付款金额'}}</detail-list-item>
          <detail-list-item term="结算状态">{{brokerageOrderInfo.state=='wait'?'未结算':brokerageOrderInfo.state=='already'?'已结算':brokerageOrderInfo.state=='arrived'?'已到账':brokerageOrderInfo.state=='waitCorrect'?'待冲正':brokerageOrderInfo.state=='correct'?'冲正':brokerageOrderInfo.state=='cancel'?'已作废':''}}</detail-list-item>
          <detail-list-item term="商户佣金">{{brokerageOrderInfo.shopCommission}}</detail-list-item>
          <detail-list-item term="代理商佣金">{{brokerageOrderInfo.agentCommission}}</detail-list-item>
          <detail-list-item term="结算日期">{{brokerageOrderInfo.settlementTime}}</detail-list-item>
        </detail-list>
        <a-divider style="margin-bottom: 32px" />

        <detail-list title="冲正详情" :col='2' v-if="brokerageOrderInfo.state=='correct'">
          <detail-list-item term="冲正原因">{{brokerageOrderInfo.correctReason}}</detail-list-item>
          <detail-list-item term="冲正描述">{{brokerageOrderInfo.correctDescribe}}</detail-list-item>
        </detail-list>

      </div>
    </a-modal>
  </div>
</template>

<script>
import Pagination from '@/components/pagination/pagination'
import DetailList from '@/components/tools/DetailList'
const DetailListItem = DetailList.Item
import { modifyBrokerageOrder, getBrokerageOrderList, correctBrokerageOrder } from '@/api/common'

const columns = [
  {
    title: '订单编号',
    dataIndex: 'orderNumber'
  },
  {
    title: '商品编号',
    dataIndex: 'commodityCode'
  },
  {
    title: '商品名称',
    dataIndex: 'goodsName'
  },
  {
    title: '实付金额',
    align: 'center',
    dataIndex: 'payment',
    scopedSlots: { customRender: 'payment' }
  },
  {
    title: '订单状态',
    align: 'center',
    dataIndex: 'orderState',
    scopedSlots: { customRender: 'orderState' }
  },
  {
    title: '分佣方式',
    align: 'center',
    dataIndex: 'commissionCloseType',
    scopedSlots: { customRender: 'commissionCloseType' }
  },
  {
    title: '商户佣金',
    align: 'center',
    dataIndex: 'shopCommission'
  },
  {
    title: '代理商佣金',
    align: 'center',
    dataIndex: 'agentCommission'
  },
  {
    title: '结算状态',
    align: 'center',
    dataIndex: 'state',
    scopedSlots: { customRender: 'state' }
  },
  {
    title: '结算日期',
    align: 'center',
    dataIndex: 'settlementTime'
  },
  {
    title: '操作',
    align: 'center',
    dataIndex: 'Action',
    scopedSlots: { customRender: 'Action' }
  }
]

export default {
  name: 'brokerageOrder',
  components: {
    Pagination,
    DetailList,
    DetailListItem
  },
  data() {
    return {
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        orderNumber: null,
        commodityCode: null,
        orderState: '',
        commissionCloseType: '',
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

      correct: {
        correctReason: '',
        correctDescribe: null
      },

      brokerageOrderInfo: {},

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

    // 时间筛选
    onChangeDateTime(e, l) {
      this.dateTime = e
      this.queryParam.startTime = l[0]
      this.queryParam.endTime = l[1]
    },

    // 查询
    queryBrokerageOrder() {
      this.currentPage = 1
      this.getBrokerageOrderList()
    },

    // 重置
    resetQueryParam() {
      this.dateTime = []

      this.queryParam.orderNumber = null
      this.queryParam.commodityCode = null
      this.commissionCloseType = ''
      this.queryParam.orderState = ''
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
      if (_type == 'detail') {
        this.handleCancel()
      } else if (_type == 'correct') {
        const flag = this.checkCorrectData()
        flag && this.correctBrokerageOrder()
      }
    },

    // 操作结算订单
    handleBrokerageOrder(e, o, i) {
      this.editType = e
      this.brokerageOrderInfo = o
      if (this.editType == 'correct') {
        this.initSelectedRows()
        this.selectedRows.push(o)
        this.selectedRowKeys.push(i)
        this.modalTitle = '分佣订单冲正'
        this.visible = !0
      } else if (this.editType == 'detail') {
        this.modalTitle = '详情'
        this.visible = !0
      }
    },

    //冲正数据校验
    checkCorrectData() {
      const _data = this.correct
      if (!_data.correctReason) {
        this.$message.warning('请选择冲正原因！')
        return false
      } else if (!_data.correctDescribe) {
        this.$message.warning('请填写冲正描述！')
        return false
      } else {
        return true
      }
    },

    // 冲正
    correctBrokerageOrder() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      const _data = this.correct
      _data.ids = _idsArr
      correctBrokerageOrder(_data)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('冲正成功！')
            this.getBrokerageOrderList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 获取结算订单数据列表
    getBrokerageOrderList() {
      this.initSelectedRows()

      const _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      }
      getBrokerageOrderList(_data)
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
      this.getBrokerageOrderList()
    }
  },
  created() {
    // 列表数据请求
    this.getBrokerageOrderList()
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
