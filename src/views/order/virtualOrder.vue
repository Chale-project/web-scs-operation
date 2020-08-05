<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="订单编号">
              <a-input v-model="queryParam.orderId" placeholder="订单编号" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="订单状态">
              <a-select v-model="queryParam.state" placeholder="请选择订单状态">
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
              <a-form-item label="订单来源店铺号">
                <a-input v-model="queryParam.sourceShopId" placeholder="请输入订单来源店铺号" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="活动编号">
                <a-input v-model="queryParam.activityNum" placeholder="请输入活动编号" />
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
              <a-form-item label="充值状态">
                <a-select v-model="queryParam.chargeState" placeholder="请选择充值状态">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="chargeWaiting">待充值</a-select-option>
                  <a-select-option value="chargeSuccess">充值成功</a-select-option>
                  <a-select-option value="chargeFail">充值失败</a-select-option>
                  <a-select-option value="refunded">已退款</a-select-option>
                  <a-select-option value="cancel">取消充值</a-select-option>
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
    <div class="table-operator">
      <a-upload :action="actionFile" accept=".csv" :fileList="fileCsvList" :headers="headers" :showUploadList="false" :beforeUpload="beforeCsvUpload" :remove="handleCsvRemove" @change="handleCsvChange">
        <a-button type="primary">
          <a-icon type="upload" /> 对账单
        </a-button>
      </a-upload>
    </div>

    <!--表格-->
    <a-table size="middle" :scroll="{ x: 1800}" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">
      <template slot="payment" slot-scope="record">
        {{record/100}}
      </template>

      <template slot="saleType" slot-scope="record">
        <a-tag v-if="record=='group'" color="#ff0000">拼团</a-tag>
        <a-tag v-else-if="record=='seckill'" color="#87d068">秒杀</a-tag>
        <a-tag v-else>正常购买</a-tag>
      </template>

      <template slot="state" slot-scope="record">
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
        <a-tag v-else-if="record=='chargeSuccess'" color="#87d068">充值成功</a-tag>
        <a-tag v-else-if="record=='chargeFail'" color="#ff0000">充值失败</a-tag>
        <a-tag v-else-if="record=='refunded'" color="#ff0000">已退款</a-tag>
        <a-tag v-else-if="record=='cancel'" color="#ff0000">取消充值</a-tag>
      </template>

      <template slot="Action" slot-scope="text, record, index">
        <a @click="handleVirtualOrder('detail', record)">详情</a>
        <template v-if="record.state!='unpay'&&record.state!='receipted'&&record.state!='success'&&record.state!='cancel'&&record.state!='refund'&&record.state!='refunded'&&record.chargeState!='chargeSuccess'">
          <a-divider type="vertical" />
          <a @click="handleVirtualOrder('supply', record, index)">补充</a>
          <a-divider type="vertical" />
          <a @click="handleVirtualOrder('refund', record, index)">审核退款</a>
        </template>
      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="editType=='detail'?'80%':'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='supply'">确认补充所选订单？</p>

      <div v-else-if="editType=='refund'" class="modal-container">
        <a-form>
          <a-row :gutter="24">
            <a-col :md="24" :sm="24">
              <a-form-item label="退款原因" :required="true">
                <a-textarea v-model="reason" :rows="4" placeholder="请填写退款原因" />
              </a-form-item>
            </a-col>

          </a-row>
        </a-form>
      </div>

      <div v-else-if="editType=='detail'" class="modal-container">
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

          <detail-list title="充值信息">
            <detail-list-item term="购买人">{{orderInfo.buyerNick}}</detail-list-item>
            <detail-list-item term="充值账号" v-if="orderInfo.account">{{orderInfo.account}}</detail-list-item>
            <p v-if="orderInfo.cardsInfo"><span style="color:rgba(0,0,0,.85)">兑换方式：</span>{{orderInfo.cardsInfo}}</p>
          </detail-list>
          <a-divider style="margin-bottom: 32px" />

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

          <detail-list title="充值失败" v-if="orderInfo.refundedReason">
            <detail-list-item term="退款原因">{{orderInfo.refundedReason}}</detail-list-item>
          </detail-list>

        </a-card>
      </div>
    </a-modal>

  </div>
</template>

<script>
import Pagination from '@/components/pagination/pagination'
import DetailList from '@/components/tools/DetailList'
const DetailListItem = DetailList.Item
import {
  getVirtualOrderInfo,
  getVirtualOrderList,
  supplyRechargeOrder,
  applyRefundVirtualOrder,
  importVirtualFile
} from '@/api/common'
const columns = [
  {
    title: '订单编号',
    width: '15%',
    dataIndex: 'orderId'
  },

  {
    title: '订单金额',
    width: '7%',
    dataIndex: 'payment',
    scopedSlots: { customRender: 'payment' }
  },

  {
    title: '活动类型',
    width: '8%',
    dataIndex: 'saleType',
    scopedSlots: { customRender: 'saleType' }
  },

  {
    title: '订单状态',
    width: '7%',
    dataIndex: 'state',
    scopedSlots: { customRender: 'state' }
  },

  {
    title: '充值状态',
    width: '8%',
    dataIndex: 'chargeState',
    scopedSlots: { customRender: 'chargeState' }
  },

  {
    title: '订单来源',
    width: '13%',
    dataIndex: 'sourceShopName'
  },

  {
    title: '来源店铺号',
    width: '13%',
    dataIndex: 'sourceShopId'
  },
  {
    title: '活动编号',
    width: '14%',
    dataIndex: 'activityNum'
  },
  {
    title: '创建时间',
    width: '15%',
    dataIndex: 'addDataTime'
  },

  {
    title: '操作',
    width: '180px',
    align: 'center',
    fixed: 'right',
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
  name: 'virtualOrder',
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
        state: '',
        saleType: '',
        activityNum: null,
        chargeState: '',
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
      confirmLoading: !1,

      reason: null, // 退款原因

      actionFile: importVirtualFile,
      headers: { token: this.$ls.get('Access_Token') },
      fileCsvList: []
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
      this.queryParam.state = ''
      this.queryParam.saleType = ''
      this.queryParam.activityNum = null
      this.queryParam.chargeState = ''
      this.queryParam.startTime = ''
      this.queryParam.endTime = ''
    },

    // 查询
    queryOrder() {
      this.currentPage = 1
      this.getVirtualOrderList()
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

    // 导入Csv文件
    // 文件上传前过滤
    beforeCsvUpload(file) {
      const isCsv = file.type === 'application/vnd.ms-excel'
      const isLt3M = file.size / 1024 / 1024 < 3

      if (!isCsv) {
        this.$message.error('上传文件格式必须是 .csv格式!')
      }
      if (!isLt3M) {
        this.$message.error('上传文件大小不能超过 3MB!')
      }

      return isCsv && isLt3M
    },

    handleCsvRemove(e) {
      console.log(e)
    },

    // 导入对账单
    handleCsvChange({ file, fileList }) {
      this.fileCsvList = fileList
      if (file.status == 'done') {
        if (file.response) {
          if (file.response.code == 0) {
            this.$message.success('导入成功！')
            this.currentPage = 1
            this.getVirtualOrderList()
          } else {
            this.$message.error(file.response.msg)
          }
        }
      }
    },

    // 选择快递or物流
    onChangeDeliveryMode(e) {
      this.forms.deliveryCompany = null
    },

    // 取消
    handleCancel() {
      this.visible = !1
    },

    // 操作订单
    handleVirtualOrder(e, o, i) {
      this.orderInfo = {}
      this.editType = e
      if (this.editType == 'detail') {
        this.modalTitle = '订单详情'
        this.getVirtualOrderInfo(o.id)
      } else if (this.editType == 'supply') {
        this.modalTitle = '补充'
        this.initSelectedRows()
        this.selectedRows.push(o)
        this.selectedRowKeys.push(i)
        this.visible = !0
      } else if (this.editType == 'refund') {
        this.modalTitle = '审核退款'
        this.initSelectedRows()
        this.selectedRows.push(o)
        this.selectedRowKeys.push(i)
        this.visible = !0
      }
    },

    // 确认
    handleOk() {
      const _type = this.editType
      if (_type == 'delete') {
        this.deletedVirtualOrder()
      } else if (_type == 'supply') {
        this.supplyVirtualOrder()
      } else if (_type == 'refund') {
        const flag = this.checkRefundData()
        flag && this.refundVirtualOrder()
      }
    },

    checkRefundData() {
      if (!this.reason) {
        this.$message.warning('请输入退款原因！')
        return false
      } else {
        return true
      }
    },

    // 订单补充
    supplyVirtualOrder() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      supplyRechargeOrder(_idsArr).then(res => {
        if (res.code == 0) {
          this.visible = !1
          this.$message.success('操作成功！')
          this.getVirtualOrderList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },

    //订单退款
    refundVirtualOrder() {
      const _id = this.selectedRows[0].id
      const data = { id: _id, reason: this.reason }
      applyRefundVirtualOrder(data).then(res => {
        if (res.code == 0) {
          this.visible = !1
          this.$message.success('操作成功！')
          this.getVirtualOrderList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },

    // 获取订单数据列表
    getVirtualOrderList() {
      this.initSelectedRows()
      const _queryParam = { ...this.queryParam }
      const _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: _queryParam
      }
      getVirtualOrderList(_data)
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
    getVirtualOrderInfo(id) {
      let _id = null
      if (id) _id = id
      else _id = this.selectedRows[0].id
      getVirtualOrderInfo(_id)
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
      this.getVirtualOrderList()
    }
  },
  created() {
    // 列表数据请求
    this.getVirtualOrderList()
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
