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
              <a-form-item label="收货人">
                <a-input v-model="queryParam.receiver" placeholder="请输入收货人" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="收货人电话">
                <a-input v-model="queryParam.receiverMobile" placeholder="请输入收货人电话" />
              </a-form-item>
            </a-col>
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
      <!-- <a-button type="primary" icon="plus" @click="handleEntityOrder('add')">新增</a-button>
      <a-button type="primary" icon="edit" @click="handleEntityOrder('edit')">编辑</a-button>
      <a-button type="primary" icon="delete" @click="handleEntityOrder('delete')">删除</a-button> -->
    </div>

    <!--表格-->
    <a-table size="middle" :scroll="{ x: 1800}" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">
      <template slot="due" slot-scope="record">
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

      <template slot="Action" slot-scope="text, record, index">
        <a @click="handleEntityOrder('detail', record)">详情</a>
        <a-divider type="vertical" v-if="record.state=='waitSending'" />
        <a @click="handleEntityOrder('deliver', record, index)" v-if="record.state=='waitSending'">发货</a>
        <a-divider type="vertical" v-if="record.state=='waitGroup'||record.state=='shipped'||record.state=='arrived'||record.state=='waitReceiving'||record.state=='receipted'||record.state=='success'" />
        <a @click="handleEntityOrder('refund', record, index)" v-if="record.state=='waitGroup'||record.state=='shipped'||record.state=='arrived'||record.state=='waitReceiving'||record.state=='receipted'||record.state=='success'">申请退款</a>

      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="editType=='detail'?'80%':editType=='deliver'?'800px':'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='delete'">确认删除所选订单？</p>
      <p v-else-if="editType=='enabled'">确认启用所选订单？</p>
      <p v-else-if="editType=='disabled'">确认禁用所选订单？</p>

      <div v-else-if="editType=='deliver'" class="modal-container">
        <a-form>
          <a-row :gutter="24">
            <a-col :md="12" :sm="24">
              <a-form-item label="配送方式" :required="true">
                <a-radio-group v-model="forms.deliveryMode" @change="onChangeDeliveryMode">
                  <a-radio value="express">快递</a-radio>
                  <a-radio value="logistics">物流</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24" v-if="forms.deliveryMode=='express'">
              <a-form-item label="快递公司" :required="true">
                <a-select v-model="forms.deliveryCompany" placeholder="请选择">
                  <a-select-option value="顺丰快递">顺丰快递</a-select-option>
                  <a-select-option value="中通快递">中通快递</a-select-option>
                  <a-select-option value="申通快递">申通快递</a-select-option>
                  <a-select-option value="圆通快递">圆通快递</a-select-option>
                  <a-select-option value="韵达快递">韵达快递</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24" v-else-if="forms.deliveryMode=='logistics'">
              <a-form-item label="物流公司" :required="true">
                <a-input v-model="forms.deliveryCompany" placeholder="请输入物流公司名称" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="快递&物流单号" :required="true">
                <a-input v-model="forms.deliveryOrderNo" placeholder="请输入快递&物流单号" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div class="modal-container" v-else-if="editType=='refund'">
        <a-form>
          <a-row :gutter="24">
            <a-col :md="24" :sm="24">
              <a-form-item label="申请退款原因" :required="true">
                <a-textarea v-model="reason" :rows="4" placeholder="请填写申请退款原因" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
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

          <detail-list title="收货人信息">
            <detail-list-item term="收货人">{{orderInfo.receiver}}</detail-list-item>
            <detail-list-item term="联系手机">{{orderInfo.receiverMobile}}</detail-list-item>
            <p><span style="color:rgba(0,0,0,.85)">取货地址：</span>{{orderInfo.receiverAddress}}</p>
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
import { getEntityOrderInfo, getEntityOrderList, orderDeliver, applyRefundEntityOrder } from '@/api/common'
const columns = [
  {
    title: '订单编号',
    width: '13%',
    dataIndex: 'orderId'
  },
  {
    title: '订单金额',
    width: '7%',
    dataIndex: 'due',
    scopedSlots: { customRender: 'due' }
  },
  {
    title: '活动类型',
    width: '7%',
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
    title: '订单来源',
    width: '10%',
    dataIndex: 'sourceShopName'
  },
  {
    title: '来源店铺号',
    width: '13%',
    dataIndex: 'sourceShopId'
  },
  {
    title: '收货人',
    width: '7%',
    dataIndex: 'receiver'
  },
  {
    title: '收货人电话',
    width: '10%',
    dataIndex: 'receiverMobile'
  },
  {
    title: '活动编号',
    width: '13%',
    dataIndex: 'activityNum'
  },
  {
    title: '创建时间',
    width: '13%',
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
  name: 'entityOrder',
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
        receiver: null,
        receiverMobile: null,
        sourceShopId: null,
        state: '',
        activityNum: null,
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
      confirmLoading: !1,

      forms: {},

      reason: null // 退款原因
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
      this.queryParam.receiver = null
      this.queryParam.receiverMobile = null
      this.queryParam.sourceShopId = null
      this.queryParam.state = ''
      this.queryParam.activityNum = null
      this.queryParam.saleType = ''
      this.queryParam.startTime = ''
      this.queryParam.endTime = ''
    },

    // 查询
    queryOrder() {
      this.currentPage = 1
      this.getEntityOrderList()
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

    // 选择快递or物流
    onChangeDeliveryMode(e) {
      this.forms.deliveryCompany = null
    },

    // 取消
    handleCancel() {
      this.visible = !1
    },

    // 操作订单
    handleEntityOrder(e, o, i) {
      this.orderInfo = {}
      this.editType = e
      if (this.editType == 'detail') {
        this.modalTitle = '订单详情'
        this.getEntityOrderInfo(o.id)
      } else if (this.editType == 'deliver') {
        this.modalTitle = '订单发货'
        this.forms = {
          deliveryMode: 'express',
          deliveryCompany: null,
          deliveryOrderNo: null
        }
        this.initSelectedRows()
        this.selectedRows.push(o)
        this.selectedRowKeys.push(i)
        this.visible = !0
      } else if (this.editType == 'refund') {
        this.modalTitle = '申请退款'
        this.reason = null
        this.initSelectedRows()
        this.selectedRows.push(o)
        this.selectedRowKeys.push(i)
        this.visible = !0
      } else if (this.editType == 'delete') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择删除项!')
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
      }
    },

    // 确认
    handleOk() {
      const _type = this.editType
      if (_type == 'delete') {
        this.deletedEntityOrder()
      } else if (_type == 'deliver') {
        const flag = this.checkDeliverData()
        flag && this.deliverEntityOrder()
      } else if (_type == 'refund') {
        const flag = this.checkRefundData()
        flag && this.applyRefundOrder()
      } else if (_type == 'enabled') {
        this.enabledEntityOrder()
      } else if (_type == 'disabled') {
        this.disabledEntityOrder()
      } else if (_type == 'detail') {
        this.handleCancel()
      }
    },

    // 校验发货
    checkDeliverData() {
      if (!this.forms.deliveryMode) {
        this.$message.warning('请选择配送费方式！')
        return false
      } else if (!this.forms.deliveryCompany) {
        this.$message.warning('请输入快递物流公司名称！')
        return false
      } else if (!this.forms.deliveryOrderNo) {
        this.$message.warning('请输入物流单号！')
        return false
      } else {
        return true
      }
    },

    // 校验退款原因
    checkRefundData() {
      if (!this.reason) {
        this.$message.warning('请填写申请退款原因！')
        return false
      } else {
        return true
      }
    },

    //订单发货
    deliverEntityOrder() {
      const _id = this.selectedRows[0].id
      const data = { ...this.forms }
      data.id = _id
      orderDeliver(data).then(res => {
        if (res.code == 0) {
          this.visible = !1
          this.$message.success('发货成功！')
          this.getEntityOrderList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },

    // 申请退款
    applyRefundOrder() {
      const _id = this.selectedRows[0].id
      const data = {
        id: _id,
        reason: this.reason
      }
      applyRefundEntityOrder(data).then(res => {
        if (res.code == 0) {
          this.visible = !1
          this.$message.success('申请成功，等待处理！')
          this.getEntityOrderList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },

    deletedEntityOrder() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      removePlatformOrder(_idsArr).then(res => {
        if (res.code == 0) {
          this.visible = !1
          this.$message.success('删除成功！')
          this.getEntityOrderList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },

    // 获取订单数据列表
    getEntityOrderList() {
      this.initSelectedRows()
      const _queryParam = { ...this.queryParam }
      const _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: _queryParam
      }
      getEntityOrderList(_data)
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
    getEntityOrderInfo(id) {
      let _id = null
      if (id) _id = id
      else _id = this.selectedRows[0].id
      getEntityOrderInfo(_id)
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
      this.getEntityOrderList()
    }
  },
  created() {
    // 列表数据请求
    this.getEntityOrderList()
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
