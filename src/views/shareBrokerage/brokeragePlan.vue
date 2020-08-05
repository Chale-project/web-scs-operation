<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="方案编码">
              <a-input v-model="queryParam.commissionCode" placeholder="请输入方案编码" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="方案名称">
              <a-input v-model="queryParam.commissionName" placeholder="请输入方案名称" />
            </a-form-item>
          </a-col>

          <template v-if="advanced">
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
              <a-button type="primary" @click="queryBrokeragePlan">查询</a-button>
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
      <a-button type="primary" icon="plus" @click="handleBrokeragePlan('add')">新增</a-button>
      <a-button type="primary" icon="delete" @click="handleBrokeragePlan('batchDelete')">批量删除方案</a-button>
      <a-button type="primary" icon="delete" @click="handlePlanPro('batchDelete')">批量删除比例</a-button>
      <a-dropdown>
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="handleBrokeragePlan('batchEnabled')">
            <a-icon type="unlock" />启用
          </a-menu-item>
          <a-menu-item key="2" @click="handleBrokeragePlan('batchDisabled')">
            <a-icon type="lock" />禁用
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          批量操作方案
          <a-icon type="down" />
        </a-button>
      </a-dropdown>
      <a-dropdown>
        <a-menu slot="overlay">
          <a-menu-item key="3" @click="handlePlanPro('batchEnabled')">
            <a-icon type="unlock" />启用
          </a-menu-item>
          <a-menu-item key="4" @click="handlePlanPro('batchDisabled')">
            <a-icon type="lock" />禁用
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          批量操作比例
          <a-icon type="down" />
        </a-button>
      </a-dropdown>

    </div>

    <!--表格-->
    <a-table size="middle" :key="tableKey" :defaultExpandAllRows="true" :rowKey="record => record.id" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">

      <template slot="state" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">启用</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">禁用</a-tag>
      </template>

      <template slot="Action" slot-scope="text, record">
        <a @click="handlePlanPro('add', record)">添加分佣比</a>
        <a-divider type="vertical" />
        <a @click="handleBrokeragePlan('edit', record)">编辑</a>
        <a-divider type="vertical" />
        <a @click="handleBrokeragePlan('detail', record)">详情</a>
        <a-divider type="vertical" />
        <a @click="handleBrokeragePlan('delete', record)">删除</a>
        <a-divider type="vertical" />
        <a-dropdown>
          <a-menu slot="overlay">
            <a-menu-item key="1" @click="handleBrokeragePlan('enabled', record)">
              <a-icon type="check-circle" />启用
            </a-menu-item>
            <a-menu-item key="2" @click="handleBrokeragePlan('disabled', record)">
              <a-icon type="stop" />禁用
            </a-menu-item>
          </a-menu>
          <a>
            操作
            <a-icon type="down" />
          </a>
        </a-dropdown>
      </template>

      <a-table slot="expandedRowRender" slot-scope="record" :rowKey="record => record.id" :columns="innerColumns" :dataSource="record.commissionPlanModels" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeysPlan, onChange: updateSelectPlan }">
        <template slot="shopCommission" slot-scope="record">
          {{`${record}%`}}
        </template>

        <template slot="oneAgentCommission" slot-scope="record">
          {{`${record}%`}}
        </template>

        <template slot="twoAgentCommission" slot-scope="record">
          {{`${record}%`}}
        </template>

        <template slot="threeAgentCommission" slot-scope="record">
          {{`${record}%`}}
        </template>

        <template slot="commissionType" slot-scope="record">
          <a-tag v-if="record=='good'">商品利润</a-tag>
          <a-tag v-else-if="record=='order'">付款金额</a-tag>
        </template>
        <template slot="state" slot-scope="record">
          <a-tag v-if="record=='enabled'" color="#87d068">启用</a-tag>
          <a-tag v-else-if="record=='disabled'" color="#ff0000">禁用</a-tag>
        </template>
        <template slot="ActionPlan" slot-scope="text, record" class="table-operation">
          <a @click="handlePlanPro('edit', record)">编辑</a>
          <a-divider type="vertical" />
          <a @click="handlePlanPro('detail', record)">详情</a>
          <a-divider type="vertical" />
          <a @click="handlePlanPro('delete', record)">删除</a>
          <a-divider type="vertical" />
          <a-dropdown>
            <a-menu slot="overlay">
              <a-menu-item key="3" @click="handlePlanPro('enabled', record)">
                启用
              </a-menu-item>
              <a-menu-item key="4" @click="handlePlanPro('disabled', record)">
                禁用
              </a-menu-item>
            </a-menu>
            <a>
              操作
              <a-icon type="down" />
            </a>
          </a-dropdown>
        </template>
      </a-table>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal width="400px" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">

      <div class="modal-container" v-if="editType=='delete'">
        <p>确认删除所选方案？</p>
      </div>
      <div class="modal-container" v-else-if="editType=='batchDelete'">
        <p>确认批量删除所选项？</p>
      </div>
      <div class="modal-container" v-else-if="editType=='batchEnabled'">
        <p>确认批量启用所选方案？</p>
      </div>
      <div class="modal-container" v-else-if="editType=='batchDisabled'">
        <p>确认批量禁用所选方案？</p>
      </div>
      <div class="modal-container" v-else-if="editType=='enabled'">
        <p>确认启用所选方案？</p>
      </div>
      <div class="modal-container" v-else-if="editType=='disabled'">
        <p>确认禁用所选方案？</p>
      </div>
      <div class="modal-container" v-else>
        <a-form>
          <a-row :gutter="24">
            <a-col :md="24" :sm="24">
              <a-form-item label="方案编码" :required="true">
                <a-input v-model="formsA.commissionCode" :disabled="editType=='edit'||editType=='detail'" placeholder="请填写方案编码（由数字、字母、或“_”组成）" />
              </a-form-item>
            </a-col>
            <a-col :md="24" :sm="24">
              <a-form-item label="方案名称" :required="true">
                <a-input v-model="formsA.commissionName" :disabled="editType=='detail'" placeholder="请填写方案名称" />
              </a-form-item>
            </a-col>

          </a-row>
        </a-form>

      </div>

    </a-modal>

    <a-modal width="80%" :title="modalTitlePlan" :visible="visiblePlan" @ok="handleOkPlan" :confirmLoading="confirmLoadingPlan" @cancel="handleCancelPlan">
      <div class="modal-container">
        <a-form>
          <a-row :gutter="24">
            <a-col :md="12" :sm="24">
              <a-form-item label="分佣佣金计算方式" :required="true">
                <a-radio-group v-model="formsB.commissionType" :disabled="editTypePlan=='edit'||editTypePlan=='detail'">
                  <a-radio value="good">商品利润</a-radio>
                  <a-radio value="order">付款金额</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="商户/店铺佣金比" :required="true">
                <a-input type="number" v-model="formsB.shopCommission" :disabled="editTypePlan=='detail'" addonAfter="%" placeholder="请填写商户/店铺佣金比" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="一级代理佣金比" :required="true">
                <a-input type="number" v-model="formsB.oneAgentCommission" :disabled="editTypePlan=='detail'" addonAfter="%" placeholder="请填写一级代理佣金比" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="二级代理佣金比" :required="true">
                <a-input type="number" v-model="formsB.twoAgentCommission" :disabled="editTypePlan=='detail'" addonAfter="%" placeholder="请填写二级代理佣金比" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="三级代理佣金比" :required="true">
                <a-input type="number" v-model="formsB.threeAgentCommission" :disabled="editTypePlan=='detail'" addonAfter="%" placeholder="请填写三级代理佣金比" />
              </a-form-item>
            </a-col>
            <a-col :md="24" :sm="24">
              <a-form-item label="参与分佣商品分类" :required="true">
                <a-transfer :dataSource="goodsCategoryData" :listStyle="{width: '300px', height: '350px',}" :titles="['备选项', '所选项']" :render="item=>item.title" :targetKeys="targetKeysGoodsCategory" :selectedKeys="selectedKeysGoodsCategory" @change="handleChangeGoodsCategory" @selectChange="handleSelectChangeGoodsCategory" :disabled="editTypePlan=='detail'">
                  <a-button size="small" style="float:right;margin: 5px" @click="getMoreGoodsCategory(props.titleText)" slot="footer" slot-scope="props">
                    加载更多
                  </a-button>
                </a-transfer>
              </a-form-item>
            </a-col>
            <a-col :md="24" :sm="24">
              <a-form-item label="参与分佣商品" :required="true">
                <a-transfer :dataSource="goodsData" :listStyle="{width: '300px', height: '350px',}" :titles="['备选项', '所选项']" :render="item=>item.title" :targetKeys="targetKeysGoods" :selectedKeys="selectedKeysGoods" @change="handleChangeGoods" @selectChange="handleSelectChangeGoods" :disabled="editTypePlan=='detail'">
                  <a-button size="small" style="float:right;margin: 5px" @click="getMoreGoods(props.titleText)" slot="footer" slot-scope="props">
                    加载更多
                  </a-button>
                </a-transfer>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>

      </div>
    </a-modal>

    <a-modal width="400px" :title="modalTitlePlan" :visible="visiblePlans" @ok="handleOkPlan" :confirmLoading="confirmLoadingPlan" @cancel="handleCancelPlan">
      <div class="modal-container" v-if="editTypePlan=='delete'">
        <p>确认删除所选佣金比？</p>
      </div>
      <div class="modal-container" v-else-if="editTypePlan=='batchDelete'">
        <p>确认批量删除所选项？</p>
      </div>
      <div class="modal-container" v-else-if="editTypePlan=='batchEnabled'">
        <p>确认批量启用所选项？</p>
      </div>
      <div class="modal-container" v-else-if="editTypePlan=='batchDisabled'">
        <p>确认批量禁用所选项？</p>
      </div>
      <div class="modal-container" v-else-if="editTypePlan=='enabled'">
        <p>确认启用所选佣金比？</p>
      </div>
      <div class="modal-container" v-else-if="editTypePlan=='disabled'">
        <p>确认禁用所选佣金比？</p>
      </div>

    </a-modal>

  </div>
</template>

<script>
import Pagination from '@/components/pagination/pagination'
import {
  getBrokeragePlanInfo,
  addBrokeragePlan,
  modifyBrokeragePlan,
  removeBrokeragePlan,
  getBrokeragePlanList,
  setBrokeragePlanState,
  setBatchBrokeragePlanState,
  setBatchPlanProState
} from '@/api/common'
import { getPlanProInfo, addPlanPro, modifyPlanPro, removePlanPro, setPlanProState } from '@/api/common'
import { getPlatformGCategoryList, getPlatformGoodsList } from '@/api/common'

const columns = [
  {
    title: '方案编码',
    width: '15%',
    dataIndex: 'commissionCode'
  },
  {
    title: '方案名称',
    width: '15%',
    dataIndex: 'commissionName'
  },
  {
    title: '状态',
    width: '20%',
    align: 'center',
    dataIndex: 'state',
    scopedSlots: { customRender: 'state' }
  },

  {
    title: '操作',
    width: '30%',
    align: 'right',
    dataIndex: 'Action',
    scopedSlots: { customRender: 'Action' }
  }
]

const innerColumns = [
  {
    title: '佣金计算方式',
    width: '15%',
    align: 'center',
    dataIndex: 'commissionType',
    scopedSlots: { customRender: 'commissionType' }
  },
  {
    title: '商户佣金比',
    width: '10%',
    align: 'center',
    dataIndex: 'shopCommission',
    scopedSlots: { customRender: 'shopCommission' }
  },
  {
    title: '一级代理',
    width: '10%',
    align: 'center',
    dataIndex: 'oneAgentCommission',
    scopedSlots: { customRender: 'oneAgentCommission' }
  },

  {
    title: '二级代理',
    width: '10%',
    align: 'center',
    dataIndex: 'twoAgentCommission',
    scopedSlots: { customRender: 'twoAgentCommission' }
  },
  {
    title: '三级代理',
    width: '10%',
    align: 'center',
    dataIndex: 'threeAgentCommission',
    scopedSlots: { customRender: 'threeAgentCommission' }
  },

  {
    title: '状态',
    width: '15%',
    align: 'center',
    dataIndex: 'state',
    scopedSlots: { customRender: 'state' }
  },

  {
    title: '操作',
    width: '30%',
    align: 'right',
    dataIndex: 'ActionPlan',
    scopedSlots: { customRender: 'ActionPlan' }
  }
]
export default {
  name: 'brokeragePlan',
  components: {
    Pagination
  },
  data() {
    return {
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        commissionCode: null,
        commissionName: null,
        state: '',
        startTime: '',
        endTime: ''
      }, // 搜索查询参数

      dateTime: [],

      tableKey: 0,

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

      selectedRowKeys: [], // 方案选中行键
      selectedRows: [], // 方案选中行键值,

      formsA: {},
      editType: 'add',
      modalTitle: '新增',
      visible: !1,
      confirmLoading: !1,

      innerColumns, // 比例表头
      innerData: [], // 比例表格请求的数据

      selectedRowKeysPlan: [], // 比例选中行键
      selectedRowsPlan: [], // 比例选中行键值,

      formsB: {},
      editTypePlan: 'add',
      modalTitlePlan: '新增',
      visiblePlan: !1,
      visiblePlans: !1,
      confirmLoadingPlan: !1,

      operationId: null, // 操作数据id
      //商品分类相关
      currentPageCategory: 1,
      pageSizeCategory: 10,
      totalPageCategory: 0,
      totalCountCategory: 0,

      originalGoodsCategoryData: [],
      goodsCategoryData: [],
      targetKeysGoodsCategory: [],
      selectedKeysGoodsCategory: [],
      disabledGoodsCategory: !1,

      //商品相关
      currentPageGoods: 1,
      pageSizeGoods: 10,
      totalPageGoods: 0,
      totalCountGoods: 0,
      originalGoodsData: [],
      goodsData: [],
      targetKeysGoods: [],
      selectedKeysGoods: [],
      disabledGoods: !1
    }
  },

  methods: {
    initSelectedRows() {
      this.selectedRowKeys = []
      this.selectedRows = []
      this.selectedRowKeysPlan = []
      this.selectedRowsPlan = []
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
    queryBrokeragePlan() {
      this.currentPage = 1
      this.getBrokeragePlanList()
    },

    // 重置
    resetQueryParam() {
      this.dateTime = []

      this.queryParam.commissionCode = null
      this.queryParam.commissionName = null
      this.queryParam.state = ''
      this.queryParam.startTime = ''
      this.queryParam.endTime = ''
    },

    // 选择跟新table中的某项
    updateSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },

    // 取消方案
    handleCancel() {
      this.visible = !1
    },

    // 确认方案
    handleOk() {
      const _type = this.editType
      if (_type == 'delete' || _type == 'batchDelete') {
        this.deleteBrokeragePlan()
      } else if (_type == 'enabled' || _type == 'disabled') {
        this.setBrokeragePlanState()
      } else if (_type == 'batchEnabled' || _type == 'batchDisabled') {
        this.setBatchBrokeragePlanState()
      } else if (_type == 'detail') {
        this.handleCancel()
      } else {
        const flag = this.checkData()
        flag && this.addOrEditBrokeragePlan()
      }
    },

    // 操作方案
    handleBrokeragePlan(e, o) {
      this.editType = e

      if (o) this.operationId = o.id
      else this.operationId = null

      if (e == 'add') {
        this.modalTitle = '新增'
        this.visible = !0
        this.formsA = {
          commissionCode: null,
          commissionName: null,
          state: 'enabled'
        }
      } else if (e == 'edit') {
        this.modalTitle = '编辑'
        this.getBrokeragePlanInfo(o.id)
      } else if (e == 'delete') {
        this.modalTitle = '删除'
        this.visible = !0
      } else if (e == 'batchDelete') {
        // 批量删
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择删除方案项！')
          return false
        } else {
          this.modalTitle = '批量删除'
          this.visible = !0
        }
      } else if (e == 'enabled') {
        this.modalTitle = '启用'
        this.visible = !0
      } else if (e == 'disabled') {
        this.modalTitle = '禁用'
        this.visible = !0
      } else if (e == 'batchEnabled') {
        // 批量删
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择批量启用方案项！')
          return false
        } else {
          this.modalTitle = '批量启用'
          this.visible = !0
        }
      } else if (e == 'batchDisabled') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择批量禁用方案项！')
          return false
        } else {
          this.modalTitle = '批量禁用'
          this.visible = !0
        }
      } else if (e == 'detail') {
        this.modalTitle = '详情'
        this.getBrokeragePlanInfo(o.id)
      }
    },

    //禁用数据校验
    checkData() {
      let flag = !0
      const _formsAData = this.formsA
      const reg = /^\w+$/
      if (!_formsAData.commissionCode) {
        flag = !1
        this.$message.warning('请输入方案编码！')
        return false
      } else if (!reg.test(_formsAData.commissionCode)) {
        flag = !1
        this.$message.warning('请输入有效的方案编码！')
        return false
      } else if (!_formsAData.commissionName) {
        flag = !1
        this.$message.warning('请输入方案名称！')
        return false
      }
      return flag
    },

    // 添加编辑方案
    addOrEditBrokeragePlan() {
      const _type = this.editType
      const _data = this.formsA

      switch (_type) {
        case 'add':
          addBrokeragePlan(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getBrokeragePlanList()
              } else {
                this.$message.error(res.msg)
              }
            })
            .catch(err => {
              console.log(err)
            })
          break
        case 'edit':
          modifyBrokeragePlan(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getBrokeragePlanList()
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

    // 删除方案
    deleteBrokeragePlan() {
      let _idsArr = []
      const _id = this.operationId
      const _idArr = this.selectedRowKeys

      if (_id) _idsArr.push(_id)
      else _idsArr = _idArr

      removeBrokeragePlan(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('操作成功！')
            this.getBrokeragePlanList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 启用禁用方案
    setBrokeragePlanState() {
      const data = {
        id: this.operationId,
        state: this.editType
      }
      setBrokeragePlanState(data)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('操作成功！')
            this.getBrokeragePlanList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 批量启用禁用方案
    setBatchBrokeragePlanState() {
      const data = {
        idArr: this.selectedRowKeys,
        state: this.editType == 'batchEnabled' ? 'enabled' : 'disabled'
      }
      setBatchBrokeragePlanState(data)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('操作成功！')
            this.getBrokeragePlanList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 获取方案数据列表
    getBrokeragePlanList() {
      this.initSelectedRows()

      const _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      }
      getBrokeragePlanList(_data)
        .then(res => {
          this.loading = !1
          if (res.code == 0) {
            ++this.tableKey
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

    // 获取方案信息
    getBrokeragePlanInfo(id) {
      getBrokeragePlanInfo(id)
        .then(res => {
          if (res.code == 0) {
            this.visible = !0
            this.formsA = res.result
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 分页方案
    changePage(obj) {
      this.currentPage = obj.currentPage
      this.pageSize = obj.pageSize
      this.getBrokeragePlanList()
    },

    //
    //
    //
    //
    //

    // 选择跟新table中的某项
    updateSelectPlan(selectedRowKeys, selectedRows) {
      this.selectedRowKeysPlan = selectedRowKeys
      this.selectedRowsPlan = selectedRows
    },

    //
    //初始化商品分类选择
    initGoodsCategory() {
      this.targetKeysGoodsCategory = []
      this.selectedKeysGoodsCategory = []
      this.goodsCategoryData = this.originalGoodsCategoryData
    },

    //初始化商品选择
    initGoods() {
      this.targetKeysGoods = []
      this.selectedKeysGoods = []
      this.goodsData = this.originalGoodsData
    },

    //商品分类两栏改变
    handleChangeGoodsCategory(nextTargetKeys, direction, moveKeys) {
      this.targetKeysGoodsCategory = nextTargetKeys
    },

    //商品分类选中项发生改变
    handleSelectChangeGoodsCategory(sourceSelectedKeys, targetSelectedKeys) {
      this.selectedKeysGoodsCategory = [...sourceSelectedKeys, ...targetSelectedKeys]
    },

    //加载更多商品分类
    getMoreGoodsCategory(e) {
      if (e == '备选项') {
        this.currentPageCategory = this.currentPageCategory + 1
        if (this.currentPageCategory <= this.totalPageCategory) {
          this.getGoodsCategoryData()
        } else {
          this.$message.warning('没有更多了！')
        }
      } else if (e == '备选项') {
        //TODO
      }
    },

    //商品两栏改变
    handleChangeGoods(nextTargetKeys, direction, moveKeys) {
      this.targetKeysGoods = nextTargetKeys
    },

    //商品选中项发生改变
    handleSelectChangeGoods(sourceSelectedKeys, targetSelectedKeys) {
      this.selectedKeysGoods = [...sourceSelectedKeys, ...targetSelectedKeys]
    },

    //加载更多商品
    getMoreGoods(e) {
      if (e == '备选项') {
        this.currentPageGoods = this.currentPageGoods + 1
        if (this.currentPageGoods <= this.totalPageGoods) {
          this.getGoodsData()
        } else {
          this.$message.warning('没有更多了！')
        }
      } else if (e == '备选项') {
        //TODO
      }
    },

    // 取消比例
    handleCancelPlan() {
      this.visiblePlan = !1
      this.visiblePlans = !1
    },

    // 确认比例
    handleOkPlan() {
      const _type = this.editTypePlan
      if (_type == 'delete' || _type == 'batchDelete') {
        this.deletePlanPro()
      } else if (_type == 'enabled' || _type == 'disabled') {
        this.setPlanProState()
      } else if (_type == 'batchEnabled' || _type == 'batchDisabled') {
        this.setBatchPlanProState()
      } else if (_type == 'detail') {
        this.handleCancelPlan()
      } else {
        const flag = this.checkDataPlanPro()
        flag && this.addOrEditPlanPro()
      }
    },

    // 操作比例
    handlePlanPro(e, o) {
      this.editTypePlan = e
      if (o) this.operationId = o.id
      else this.operationId = null

      if (e == 'add') {
        this.modalTitlePlan = '新增'
        this.visiblePlan = !0
        this.initGoodsCategory()
        this.initGoods()
        this.formsB = {
          commissionId: o.id,
          commissionType: 'good', // good:'商品利润'；order:'付款金额'
          shopCommission: null,
          oneAgentCommission: null,
          twoAgentCommission: null,
          threeAgentCommission: null,
          virtualGoodsModels: [],
          virtualGoodsCategoryModels: [],
          state: 'enabled'
        }
      } else if (e == 'edit') {
        this.modalTitlePlan = '编辑'
        this.getPlanProInfo(o.id)
      } else if (e == 'delete') {
        this.modalTitlePlan = '删除'
        this.visiblePlans = !0
      } else if (e == 'batchDelete') {
        // 批量删
        if (this.selectedRowsPlan.length < 1) {
          this.$message.warning('请选择删除佣金比项！')
          return false
        } else {
          this.modalTitlePlan = '批量删除'
          this.visiblePlans = !0
        }
      } else if (e == 'enabled') {
        this.modalTitlePlan = '启用'
        this.visiblePlans = !0
      } else if (e == 'disabled') {
        this.modalTitlePlan = '禁用'
        this.visiblePlans = !0
      } else if (e == 'batchEnabled') {
        // 批启用
        if (this.selectedRowsPlan.length < 1) {
          this.$message.warning('请选择批量启用佣金比项！')
          return false
        } else {
          this.modalTitlePlan = '批量启用'
          this.visiblePlans = !0
        }
      } else if (e == 'batchDisabled') {
        // 批启用
        if (this.selectedRowsPlan.length < 1) {
          this.$message.warning('请选择批量禁用佣金比项！')
          return false
        } else {
          this.modalTitlePlan = '批量禁用'
          this.visiblePlans = !0
        }
      } else if (e == 'detail') {
        this.modalTitlePlan = '详情'
        this.getPlanProInfo(o.id)
      }
    },

    //校验添加分佣比例
    checkDataPlanPro() {
      let flag = !0
      const _formsBData = this.formsB
      const reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/
      if (!_formsBData.commissionType) {
        flag = !1
        this.$message.warning('请选择佣金佣金计算方式！')
        return false
      } else if (!reg.test(_formsBData.shopCommission)) {
        flag = !1
        this.$message.warning('请输入有效的店铺佣金比！')
        return false
      } else if (!reg.test(_formsBData.oneAgentCommission)) {
        flag = !1
        this.$message.warning('请输入有效的一级代理佣金比！')
        return false
      } else if (!reg.test(_formsBData.twoAgentCommission)) {
        flag = !1
        this.$message.warning('请输入有效的二级代理佣金比！')
        return false
      } else if (!_formsBData.threeAgentCommission) {
        flag = !1
        this.$message.warning('请输入有效的三级代理佣金比！')
        return false
      }
      // else if (this.targetKeysGoodsCategory.length < 1) {
      //   flag = !1
      //   this.$message.warning('请选择参与分佣的商品分类！')
      //   return false
      // }
      // else if (this.targetKeysGoods.length < 1) {
      //   flag = !1
      //   this.$message.warning('请选择参与分佣的商品！')
      //   return false
      // }
      return flag
    },

    // 添加编辑比例
    addOrEditPlanPro() {
      const _type = this.editTypePlan
      const _data = this.formsB
      const _virtualGoodsCategoryModels = this.targetKeysGoodsCategory
      const _virtualGoodsModels = this.targetKeysGoods

      let _categoryModelsArr = []
      _virtualGoodsCategoryModels.map(i => {
        _categoryModelsArr.push({ id: i })
      })
      _data.virtualGoodsCategoryModels = _categoryModelsArr

      let _goodsModelsArr = []
      _virtualGoodsModels.map(i => {
        _goodsModelsArr.push({ id: i })
      })
      _data.virtualGoodsModels = _goodsModelsArr

      switch (_type) {
        case 'add':
          addPlanPro(_data)
            .then(res => {
              if (res.code == 0) {
                this.visiblePlan = !1
                this.$message.success('操作成功！')
                this.getBrokeragePlanList()
              } else {
                this.$message.error(res.msg)
              }
            })
            .catch(err => {
              console.log(err)
            })
          break
        case 'edit':
          modifyPlanPro(_data)
            .then(res => {
              if (res.code == 0) {
                this.visiblePlan = !1
                this.$message.success('操作成功！')
                this.getBrokeragePlanList()
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

    // 删除比例
    deletePlanPro() {
      let _idsArr = []
      const _id = this.operationId
      const _idArr = this.selectedRowKeysPlan

      if (_id) _idsArr.push(_id)
      else _idsArr = _idArr

      removePlanPro(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visiblePlans = !1
            this.$message.success('操作成功！')
            this.getBrokeragePlanList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 启用禁用比例
    setPlanProState() {
      const data = {
        id: this.operationId,
        state: this.editTypePlan
      }
      setPlanProState(data)
        .then(res => {
          if (res.code == 0) {
            this.visiblePlans = !1
            this.$message.success('操作成功！')
            this.getBrokeragePlanList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 批量启用禁用比例
    setBatchPlanProState() {
      const data = {
        idArr: this.selectedRowKeysPlan,
        state: this.editTypePlan == 'batchEnabled' ? 'enabled' : 'disabled'
      }
      setBatchPlanProState(data)
        .then(res => {
          if (res.code == 0) {
            this.visiblePlans = !1
            this.$message.success('操作成功！')
            this.getBrokeragePlanList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 获取比例信息
    getPlanProInfo(id) {
      this.initGoodsCategory()
      this.initGoods()

      getPlanProInfo(id)
        .then(res => {
          if (res.code == 0) {
            this.visiblePlan = !0
            const _result = res.result
            const categoryModelsList = _result.virtualGoodsCategoryModels
            if (categoryModelsList.length > 0) {
              categoryModelsList.map(i => {
                this.targetKeysGoodsCategory.push(i.id)
              })
            }
            const goodsModelsList = _result.virtualGoodsModels
            if (goodsModelsList.length > 0) {
              goodsModelsList.map(i => {
                this.targetKeysGoods.push(i.id)
              })
            }
            this.formsB = res.result
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    //获取商品分类
    getGoodsCategoryData() {
      const _data = {
        pageSize: this.pageSizeCategory,
        currentPage: this.currentPageCategory,
        where: {}
      }
      getPlatformGCategoryList(_data).then(res => {
        if (res.code == 0) {
          this.currentPageCategory = res.page.currentPage
          this.pageSizeCategory = res.page.pageSize
          this.totalPageCategory = res.page.totalPage
          this.totalCountCategory = res.page.totalCount
          let _list = res.page.list
          let _goodsCategoryList = this.goodsCategoryData
          if (_list.length > 0) {
            _list.map(i => {
              i.key = i.id
              i.title = i.categoryName
            })
            const _newList = _goodsCategoryList.concat(_list)
            this.originalGoodsCategoryData = _newList
            this.goodsCategoryData = _newList
          } else {
            this.originalGoodsCategoryData = []
            this.goodsCategoryData = []
          }
        } else {
          this.$message.error(res.msg)
        }
      })
    },

    //获取商品
    getGoodsData() {
      const _data = {
        pageSize: this.pageSizeGoods,
        currentPage: this.currentPageGoods,
        where: {}
      }
      getPlatformGoodsList(_data).then(res => {
        if (res.code == 0) {
          this.currentPageGoods = res.page.currentPage
          this.pageSizeGoods = res.page.pageSize
          this.totalPageGoods = res.page.totalPage
          this.totalCountGoods = res.page.totalCount
          let _list = res.page.list
          let _goodsList = this.goodsData
          if (_list.length > 0) {
            _list.map(i => {
              i.key = i.id
              i.title = i.goodsName
            })
            const _newList = _goodsList.concat(_list)
            this.originalGoodsData = _newList
            this.goodsData = _newList
          } else {
            this.originalGoodsData = []
            this.goodsData = []
          }
        } else {
          this.$message.error(res.msg)
        }
      })
    }
  },
  created() {
    // 列表数据请求
    this.getBrokeragePlanList()
    this.getGoodsCategoryData()
    this.getGoodsData()
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
