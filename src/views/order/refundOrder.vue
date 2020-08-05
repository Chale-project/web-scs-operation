<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="订单编号">
              <a-input v-model="queryParam.orderId" placeholder="请输入订单编号" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="售后状态">
              <a-select v-model="queryParam.chargeState" placeholder="请选择售后状态">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="apply">售后中</a-select-option>
                <a-select-option value="success">退款成功</a-select-option>
                <a-select-option value="fail">退款失败</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="订单来源店铺号">
                <a-input v-model="queryParam.sourceShopId" placeholder="请输入订单来源店铺号" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="活动类型">
                <a-select v-model="queryParam.saleType" placeholder="请选择活动类型">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="group">拼团</a-select-option>
                  <a-select-option value="seckill">秒杀</a-select-option>
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
              <a-button type="primary" @click="queryOrder">查询</a-button>
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
    <div class="table-operator"></div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">
      <template slot="orderFee" slot-scope="record">
        {{record/100}}
      </template>

      <template slot="refundFee" slot-scope="record">
        {{record/100}}
      </template>

      <template slot="saleType" slot-scope="record">
        <a-tag v-if="record=='group'" color="#ff0000">拼团</a-tag>
        <a-tag v-else-if="record=='seckill'" color="#87d068">秒杀</a-tag>
        <a-tag v-else>正常购买</a-tag>
      </template>

      <template slot="orderType" slot-scope="record">
        <a-tag v-if="record=='physical'">实物订单</a-tag>
        <a-tag v-else-if="record=='virtual'">虚拟订单</a-tag>
      </template>

      <template slot="orderState" slot-scope="record">
        <a-tag v-if="record=='unpay'">待付款</a-tag>
        <a-tag v-else-if="record=='paid'">已支付</a-tag>
        <a-tag v-else-if="record=='waitSending'">待发货</a-tag>
        <a-tag v-else-if="record=='waitGroup'">待成团</a-tag>
        <a-tag v-else-if="record=='shipped'">已发货</a-tag>
        <a-tag v-else-if="record=='arrived'">已送达</a-tag>
        <a-tag v-else-if="record=='waitReceiving'">待收货</a-tag>
        <a-tag v-else-if="record=='receipted'">已收货</a-tag>
        <a-tag v-else-if="record=='success'">已完成</a-tag>
        <a-tag v-else-if="record=='cancel'">已取消</a-tag>
        <a-tag v-else-if="record=='refund'">售后</a-tag>
        <a-tag v-else-if="record=='refunded'">已退款</a-tag>
        <a-tag v-else>未知</a-tag>
      </template>

      <template slot="chargeState" slot-scope="record">
        <a-tag v-if="record=='chargeWaiting'">待充值</a-tag>
        <a-tag v-else-if="record=='chargeSuccess'">充值成功</a-tag>
        <a-tag v-else-if="record=='chargeFail'">充值失败</a-tag>
        <a-tag v-else-if="record=='refunded'">已退款</a-tag>
        <a-tag v-else-if="record=='cancel'">取消充值</a-tag>
      </template>
      <template slot="refundState" slot-scope="record">
        <a-tag v-if="record=='apply'">售后中</a-tag>
        <a-tag v-else-if="record=='success'" color="#ff0000">退款成功</a-tag>
        <a-tag v-else-if="record=='fail'" color="#87d068">退款失败</a-tag>
      </template>

      <template slot="Action" slot-scope="text, record, index">
        <a @click="handleRefundOrder('detail', record)">详情</a>
        <a-divider type="vertical" v-if="record.refundState=='apply'" />
        <a @click="handleRefundOrder('refund', record, index)" v-if="record.refundState=='apply'">确认退款</a>

      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="editType=='detail'?'80%':editType=='deliver'?'800px':'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">

      <div class="modal-container" v-if="editType=='refund'">
        确认退款所选订单？
      </div>

      <div v-else class="modal-container">
        <a-card :bordered="false">
          <detail-list title="订单信息">
            <detail-list-item term="订单编号">{{orderInfo.orderId}}</detail-list-item>
            <detail-list-item term="订单状态">{{orderInfo.state=='unpay'?'待付款':orderInfo.state=='paid'?'已支付':orderInfo.state=='waitSending'?'待发货':orderInfo.state=='waitGroup'?'待成团':orderInfo.state=='shipped'?'已发货':orderInfo.state=='arrived'?'已送达':orderInfo.state=='waitReceiving'?'待收货':orderInfo.state=='receipted'?'已收货':orderInfo.state=='success'?'已完成':orderInfo.state=='cancel'?'已取消':orderInfo.state=='refund'?'售后':orderInfo.state=='refunded'?'已退款':'未知'}}</detail-list-item>

            <detail-list-item term="活动类型">{{orderInfo.saleType=='group'?'拼团':orderInfo.saleType=='seckill'?'秒杀':'正常购买'}}</detail-list-item>
            <detail-list-item term="支付方式" v-if="orderInfo.payType">{{orderInfo.payType=='weixin'?'微信':'其他'}}</detail-list-item>
            <detail-list-item term="下单时间" v-if="orderInfo.addDataTime">{{orderInfo.addDataTime}}</detail-list-item>
            <detail-list-item term="支付时间" v-if="orderInfo.paymentTime">{{orderInfo.paymentTime}}</detail-list-item>
            <detail-list-item term="发货时间" v-if="orderInfo.onsignTime">{{orderInfo.onsignTime}}</detail-list-item>
            <detail-list-item term="签收时间" v-if="orderInfo.endTime">{{orderInfo.endTime}}</detail-list-item>
            <detail-list-item term="完成时间" v-if="orderInfo.closeTime">{{orderInfo.closeTime}}</detail-list-item>
          </detail-list>
          <a-divider style="margin-bottom: 32px" />

          <detail-list title="收货人信息" v-if="orderInfo.orderType=='physicalGoods'">
            <detail-list-item term="收货人">{{orderInfo.receiver}}</detail-list-item>
            <detail-list-item term="联系手机">{{orderInfo.receiverMobile}}</detail-list-item>
            <p><span style="color:rgba(0,0,0,.85)">取货地址：</span>{{orderInfo.receiverAddress}}</p>
          </detail-list>
          <a-divider style="margin-bottom: 32px" v-if="orderInfo.orderType=='physicalGoods'" />

          <detail-list title="充值信息" v-if="orderInfo.orderType=='virtualGoods'">
            <detail-list-item term="充值账号" v-if="orderInfo.account">{{orderInfo.account}}</detail-list-item>
            <detail-list-item term="兑换方式" v-if="orderInfo.cardsInfo">{{orderInfo.cardsInfo}}</detail-list-item>
          </detail-list>
          <a-divider style="margin-bottom: 32px" v-if="orderInfo.orderType=='virtualGoods'" />

          <div class="card-item-title">订单商品</div>
          <a-table size="middle" style="margin-bottom: 24px" :columns="goodsColumns" :dataSource="orderInfo.orderDescModelList" :pagination="pagination">
            <template slot="itemImages" slot-scope="record">
              <img style="width:60px;" :src="record">
            </template>

            <template slot="price" slot-scope="record">
              {{record/100}}
            </template>

          </a-table>
          <a-divider style="margin-bottom: 32px" />

          <detail-list title="订单金额">
            <detail-list-item term="商品总额">￥{{orderInfo.goodsPrice/100}}</detail-list-item>
            <detail-list-item term="运费金额" v-if="orderInfo.deliveryCost">￥{{orderInfo.deliveryCost/100}}</detail-list-item>
            <detail-list-item term="会员折扣" v-if="orderInfo.memberAmount">￥{{orderInfo.memberAmount/100}}</detail-list-item>
            <detail-list-item term="优惠券抵扣" v-if="orderInfo.couponAmount">￥{{orderInfo.couponAmount/100}}</detail-list-item>
            <detail-list-item term="积分" v-if="orderInfo.pointsDeduction">￥{{orderInfo.pointsDeduction/100}}</detail-list-item>
            <detail-list-item term="订单金额" v-if="orderInfo.due">￥{{orderInfo.due/100}}</detail-list-item>
            <detail-list-item term="支付金额" v-if="orderInfo.state!='unpay'&&orderInfo.state!='cancel'&&orderInfo.payment">￥{{orderInfo.payment/100}}</detail-list-item>
            <detail-list-item term="退款金额" v-if="orderInfo.state=='refunded'">￥{{orderInfo.payment/100}}</detail-list-item>
          </detail-list>
          <a-divider style="margin-bottom: 32px" />

          <div class="card-item-title" v-if="orderInfo.deliveryOrderNo">物流信息</div>
          <a-row :gutter="48" v-if="orderInfo.deliveryOrderNo">
            <a-col :md="8" :sm="24">
              <div class="delivery-title">
                <a-icon type="gift" />包裹</div>
              <div class="delivery-content">
                <p class="delivery-content-list">送货方式：{{orderInfo.deliveryMode=='express'?'快递':orderInfo.deliveryMode=='logistics'?'物流':'其他'}}</p>
                <p class="delivery-content-list">承运单号：{{orderInfo.deliveryOrderNo}}</p>
                <p class="delivery-content-list">承运公司：{{orderInfo.deliveryCompany}}</p>
                <p class="delivery-content-list">承运人电话：{{orderInfo.deliveryPhoneNumber}}</p>
              </div>
            </a-col>

            <a-col :md="16" :sm="24">
              <div class="logistics-logs">
                <a-timeline>
                  <a-timeline-item :color="i==0?'green':'gray'" v-for="(v,i) of orderInfo.deliveryLogs" :key="i">{{v.itemInfo}} {{v.itemTime}}</a-timeline-item>
                </a-timeline>
              </div>
            </a-col>
          </a-row>

        </a-card>
      </div>
    </a-modal>

  </div>
</template>

<script>
import Pagination from '@/components/pagination/pagination'
import DetailList from '@/components/tools/DetailList'
const DetailListItem = DetailList.Item
import { getRefundOrderInfo, getRefundOrderList, setRefundOrder } from '@/api/common'
const columns = [
  {
    title: '订单编号',
    width: '10%',
    dataIndex: 'orderNumber'
  },
  {
    title: '退款金额',
    width: '10%',
    dataIndex: 'refundFee',
    scopedSlots: { customRender: 'refundFee' }
  },
  {
    title: '售后状态',
    width: '10%',
    dataIndex: 'refundState',
    scopedSlots: { customRender: 'refundState' }
  },

  {
    title: '活动类型',
    width: '10%',
    dataIndex: 'saleType',
    scopedSlots: { customRender: 'saleType' }
  },

  {
    title: '订单类型',
    width: '10%',
    dataIndex: 'orderType',
    scopedSlots: { customRender: 'orderType' }
  },
  {
    title: '订单状态',
    width: '10%',
    dataIndex: 'orderState',
    scopedSlots: { customRender: 'orderState' }
  },
  {
    title: '充值状态(虚)',
    width: '10%',
    dataIndex: 'chargeState',
    scopedSlots: { customRender: 'chargeState' }
  },

  {
    title: '订单金额',
    width: '10%',
    dataIndex: 'orderFee',
    scopedSlots: { customRender: 'orderFee' }
  },

  {
    title: '订单来源',
    width: '10%',
    dataIndex: 'sourceShopName'
  },

  {
    title: '来源店铺号',
    width: '10%',
    dataIndex: 'sourceShopId'
  },

  {
    title: '创建时间',
    width: '10%',
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

const goodsColumns = [
  {
    title: '商品名称',
    width: '40%',
    dataIndex: 'goodsTitle'
  },

  {
    title: '规格图片',
    width: 100,
    dataIndex: 'itemImages',
    scopedSlots: { customRender: 'itemImages' }
  },
  {
    title: '规格名称',
    width: '30%',
    dataIndex: 'specificationItems'
  },

  {
    title: '价格',
    width: '10%',
    dataIndex: 'price',
    scopedSlots: { customRender: 'price' }
  },
  {
    title: '数量',
    width: '10%',
    dataIndex: 'num'
  }
]

export default {
  name: 'refundOrder',
  components: {
    Pagination,
    DetailList,
    DetailListItem
  },
  data() {
    return {
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        // 搜索查询参数
        orderId: null,
        sourceShopId: null,
        chargeState: '',
        saleType: '',
        startTime: '',
        endTime: ''
      },
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

      //
      goodsColumns,

      orderInfo: {},

      editType: 'detail',
      modalTitle: '订单详情',
      visible: !1,
      confirmLoading: !1
    }
  },

  methods: {
    initSelectedRows() {
      this.selectedRowKeys = []
      this.selectedRows = []
    },

    // 时间筛选
    onChangeDateTime(e, l) {
      this.dateTime = e
      this.queryParam.startTime = l[0]
      this.queryParam.endTime = l[1]
    },

    // 重置
    resetQueryParam() {
      this.dateTime = []

      this.queryParam.orderId = null
      this.queryParam.sourceShopId = null
      this.queryParam.chargeState = ''
      this.queryParam.saleType = ''
      this.queryParam.startTime = ''
      this.queryParam.endTime = ''
    },

    // 查询
    queryOrder() {
      this.currentPage = 1
      this.getRefundOrderList()
    },

    // 高级搜索 展开/收起
    toggleAdvanced() {
      this.advanced = !this.advanced
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

    // 操作订单
    handleRefundOrder(e, o, i) {
      this.orderInfo = {}
      this.editType = e
      if (this.editType == 'detail') {
        this.modalTitle = '订单详情'
        this.getRefundOrderInfo(o.id)
      } else if (this.editType == 'refund') {
        this.modalTitle = '确认退款'
        this.refundReason = null
        this.initSelectedRows()
        this.selectedRows.push(o)
        this.selectedRowKeys.push(i)
        this.visible = !0
      }
    },

    // 确认
    handleOk() {
      const _type = this.editType
      if (_type == 'detail') {
        this.handleCancel()
      } else if (_type == 'refund') {
        this.sureRefund()
      }
    },

    // 申请退款
    sureRefund() {
      const _id = this.selectedRows[0].id

      setRefundOrder(_id).then(res => {
        if (res.code == 0) {
          this.visible = !1
          this.$message.success('退款成功！')
          this.getRefundOrderList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },

    // 获取订单数据列表
    getRefundOrderList() {
      this.initSelectedRows()
      const _queryParam = { ...this.queryParam }
      const _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: _queryParam
      }
      getRefundOrderList(_data)
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

    // 获取订单信息
    getRefundOrderInfo(id) {
      let _id = null
      if (id) _id = id
      else _id = this.selectedRows[0].id
      getRefundOrderInfo(_id)
        .then(res => {
          if (res.code == 0) {
            this.visible = !0
            const _info = res.result
            this.orderInfo = _info
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
      this.getRefundOrderList()
    }
  },
  created() {
    // 列表数据请求
    this.getRefundOrderList()
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
.card-item-title {
  font-size: 16px;
  margin-bottom: 16px;
  color: rgba(0, 0, 0, 0.85);
  font-weight: 500;
}
</style>
