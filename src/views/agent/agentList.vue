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
              <a-form-item label="联系人手机号">
                <a-input v-model="queryParam.linkmanPhoneNumber" placeholder="请输入联系人手机号" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="代理商级别">
                <a-select placeholder="请选择" v-model="queryParam.grade">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="one">一级代理</a-select-option>
                  <a-select-option value="two">二级代理</a-select-option>
                  <a-select-option value="three">三级代理</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="归属业务员">
                <a-select placeholder="请选择" v-model="queryParam.salesmanId">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option :value="v.id" v-for="(v,i) of bdList" :key="i">{{v.salesmanName}}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="审核状态">
                <a-select placeholder="请选择" v-model="queryParam.auditState">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="not">未审核</a-select-option>
                  <a-select-option value="pass">通过</a-select-option>
                  <a-select-option value="notpass">不通过</a-select-option>
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
      <a-button type="primary" icon="plus" @click="handleAgent('add')">新增</a-button>
      <!-- <a-button type="primary" icon="edit" @click="handleAgent('edit')">编辑</a-button> -->
      <a-button type="primary" icon="pay-circle" @click="handleAgent('renew')">续费</a-button>
      <!-- <a-button type="primary" icon="delete" @click="handleAgent('delete')">删除</a-button> -->
      <a-dropdown>
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="handleAgent('pass')">
            <a-icon type="check-circle" />通过
          </a-menu-item>
          <a-menu-item key="2" @click="handleAgent('notpass')">
            <a-icon type="stop" />不通过
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          审核操作
          <a-icon type="down" />
        </a-button>
      </a-dropdown>
      <a-button type="primary" icon="key" @click="handleAgent('reset')">重置登录密码</a-button>
      <a-dropdown>
        <a-menu slot="overlay">
          <a-menu-item key="3" @click="handleAgent('enabled')">
            <a-icon type="unlock" />启用
          </a-menu-item>
          <a-menu-item key="4" @click="handleAgent('disabled')">
            <a-icon type="lock" />禁用
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          启禁操作
          <a-icon type="down" />
        </a-button>
      </a-dropdown>
    </div>

    <!--表格-->
    <a-table size="middle" :scroll="{ x: 1800}" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">

      <template slot="linkmanPhoneNumber" slot-scope="record">
        {{ mobileToStar(record) }}
      </template>

      <template slot="salesmanId" slot-scope="record">
        <span v-if="record==v.id" v-for="(v,i) of bdList" :key="i">{{v.salesmanName}}</span>
      </template>

      <template slot="grade" slot-scope="record">
        <a-tag v-if="record=='one'">一级代理</a-tag>
        <a-tag v-else-if="record=='two'">二级代理</a-tag>
        <a-tag v-else-if="record=='three'">三级代理</a-tag>
      </template>

      <template slot="state" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">启用</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">禁用</a-tag>
      </template>

      <template slot="auditState" slot-scope="record">
        <a-tag v-if="record=='not'">未审核</a-tag>
        <a-tag v-else-if="record=='pass'" color="#87d068">通过</a-tag>
        <a-tag v-else-if="record=='notpass'" color="#ff0000">不通过</a-tag>
      </template>
      <template slot="Action" slot-scope="text, record, index">
        <a @click="handleAgent('detail', record)">详情</a>
        <a-divider type="vertical" />
        <a @click="handleAgent('edit', record, index)">编辑</a>

      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="editType=='add'?'800px':editType=='edit'?'800px':editType=='detail'?'800px':'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='delete'">确认删除所选代理商？</p>
      <p v-else-if="editType=='enabled'">确认启用所选代理商？</p>
      <p v-else-if="editType=='disabled'">确认禁用所选代理商？</p>
      <p v-else-if="editType=='pass'">确认审核通过所选代理商？</p>

      <div class="modal-container" v-else-if="editType=='renew'">
        <a-form>
          <a-row :gutter="24">
            <a-col :md="24" :sm="24">
              <a-form-item label="续费金额" :required="true">
                <a-input type="number" v-model="renew.money" addonAfter="元" placeholder="请输入续费金额" />
              </a-form-item>
            </a-col>
            <a-col :md="24" :sm="24">
              <a-form-item label="续费套数" :required="true">
                <a-input type="number" v-model="renew.quota" addonAfter="套" placeholder="请输入续费套数" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div class="modal-container" v-else-if="editType=='notpass'">
        <a-form>
          <a-row :gutter="24">
            <a-col :md="24" :sm="24">
              <a-form-item label="不通过原因" :required="true">
                <a-textarea v-model="notPassCause" :rows="4" placeholder="请填写不通过原因" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <p v-else-if="editType=='reset'">确认重置所选代理商登陆密码？</p>

      <div class="modal-container" v-else>
        <a-form>
          <a-row :gutter="24">
            <a-col :md="12" :sm="24">
              <a-form-item label="代理商级别" :required="true">
                <a-radio-group v-model="forms.grade" :disabled="editType=='edit'||editType=='detail'" @change="onChangeAgentGrade">
                  <a-radio value="one">一级代理</a-radio>
                  <a-radio value="two">二级代理</a-radio>
                  <a-radio value="three">三级代理</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24" v-if="forms.grade!='one'">
              <a-form-item label="上级代理商" :required="true">
                <a-select v-model="forms.parentAgentId" :disabled="editType=='detail'" @change="onChangeParentAgent" @popupScroll="scrollParentAgentLoading" placeholder="请选择上级代理商">
                  <a-select-option value="" disabled>请选择上级代理商</a-select-option>
                  <a-select-option :value="v.id" v-for="(v,i) of parentAgentList" :key="i">{{v.agentName}}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="代理商名称" :required="true">
                <a-input v-model="forms.agentName" :disabled="editType=='detail'" placeholder="请输入代理商名称" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="联系人" :required="true">
                <a-input v-model="forms.linkmanName" :disabled="editType=='detail'" placeholder="请输入联系人" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="联系人电话" :required="true">
                <a-input v-model="forms.linkmanPhoneNumber" maxlength="11" :disabled="editType=='edit'||editType=='detail'" placeholder="请输入有效的手机号" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="关联业务经理" :required="true">
                <a-select v-model="forms.salesmanId" :disabled="editType=='detail'" placeholder="请选择业务经理">
                  <a-select-option :value="v.id" v-for="(v,i) of bdList" :key="i" :disabled="v.state=='disabled'?true:false">{{v.salesmanName}}{{v.state=='disabled'?'（该业务员已被禁用）':''}}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="结算方式" :required="true">
                <a-radio-group v-model="forms.accountChannel" :disabled="editType=='edit'||editType=='detail'" @change="onChangeAccountChannel">
                  <a-radio value="card">银行卡</a-radio>
                  <a-radio value="alipay">支付宝</a-radio>
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
              <a-form-item :label="forms.accountChannel=='card'?'银行卡账号':forms.accountChannel=='alipay'?'支付宝账号':''" :required="true">
                <a-input v-model="forms.accountNumber" :disabled="editType=='edit'||editType=='detail'" :placeholder="forms.accountChannel=='card'?'请输入银行卡号':forms.accountChannel=='alipay'?'请输入支付宝账号':'请输入'" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item :label="forms.accountChannel=='card'?'账号姓名':forms.accountChannel=='alipay'?'支付宝昵称':''" :required="true">
                <a-input v-model="forms.accountName" :disabled="editType=='edit'||editType=='detail'" :placeholder="forms.accountChannel=='card'?'请输入账号姓名':forms.accountChannel=='alipay'?'请输入支付宝昵称':'请输入'" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24" v-show="editType=='detail'">
              <a-form-item label="审核状态">
                <a-select v-model="forms.auditState" :disabled="editType=='detail'" placeholder="请选择" @change="onChangeAuditState">
                  <a-select-option value="not">未审核</a-select-option>
                  <a-select-option value="pass">通过</a-select-option>
                  <a-select-option value="notpass">不通过</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24" v-show="editType=='detail'&&forms.auditState=='notpass'">
              <a-form-item label="不通过原因" :required="true">
                <a-textarea v-model="forms.notPassCause" :disabled="editType=='detail'" placeholder="请输入不通过原因" />
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
  addAgent,
  getAgentInfo,
  modifyAgent,
  auditAgentOk,
  auditAgentNo,
  getAgentList,
  rechargeAgent,
  getBdListAll,
  resetAgentPwd,
  setAgentState
} from '@/api/common'
import { mobileToStar } from '@/utils/util'

const columns = [
  {
    title: '代理商编号',
    width: '12%',
    dataIndex: 'agentId'
  },
  {
    title: '代理商名称',
    width: '10%',
    dataIndex: 'agentName'
  },
  {
    title: '代理商级别',
    align: 'center',
    dataIndex: 'grade',
    scopedSlots: { customRender: 'grade' }
  },
  {
    title: '联系人',
    dataIndex: 'linkmanName'
  },
  {
    title: '上级代理商名称',
    width: '10%',
    dataIndex: 'parentAgentName'
  },
  {
    title: '上级代理商编号',
    width: '12%',
    dataIndex: 'parentAgentId'
  },

  {
    title: '剩余套数',
    align: 'center',
    dataIndex: 'quota'
  },
  {
    title: '已售套数',
    align: 'center',
    dataIndex: 'usedCodeCount'
  },
  {
    title: '审核状态',
    align: 'center',
    dataIndex: 'auditState',
    scopedSlots: { customRender: 'auditState' }
  },
  {
    title: '状态',
    align: 'center',
    dataIndex: 'state',
    scopedSlots: { customRender: 'state' }
  },
  {
    title: '归属业务员',
    dataIndex: 'salesmanId',
    scopedSlots: { customRender: 'salesmanId' }
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
  name: 'Agent',
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
        grade: '',
        salesmanId: '',
        auditState: '',
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

      renew: {
        money: null,
        quota: null
      },

      forms: {},
      editType: 'add',
      modalTitle: '新增',
      visible: !1,
      confirmLoading: !1,

      grade: 'one',
      currentPAPage: 1, // 当前的页数
      pagePASize: 10, // 每页显示的条数
      totalPAPage: 0, // 总页数
      totalPACount: 0, // 总条数

      parentAgentList: [], // 一级代理商list

      bdList: [] // 业务经理
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
      this.getAgentList()
    },

    // 重置
    resetQueryParam() {
      this.dateTime = []

      this.queryParam.agentName = null
      this.queryParam.agentId = null
      this.queryParam.linkmanPhoneNumber = null
      this.queryParam.grade = ''
      this.queryParam.salesmanId = ''
      this.queryParam.auditState = ''
      this.queryParam.startTime = ''
      this.queryParam.endTime = ''
    },

    // 选择跟新table中的某项
    updateSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },

    //切换代理商级别
    onChangeAgentGrade(e) {
      if (e.target.value == 'one') this.forms.parentAgentId = ''
      else if (e.target.value == 'two') {
        this.forms.parentAgentId = ''
        this.currentPAPage = 1
        this.parentAgentList = []
        this.grade = 'one'
        this.getParentAgentList()
      } else if (e.target.value == 'three') {
        this.forms.parentAgentId = ''
        this.currentPAPage = 1
        this.parentAgentList = []
        this.grade = 'two'
        this.getParentAgentList()
      }
    },

    //选择父级代理商
    onChangeParentAgent(e) {},

    // 切换结算方式
    onChangeAccountChannel(e) {
      if (e.target.value == 'alipay') {
        this.forms.bankName = null
        this.forms.bankAddress = null
        this.forms.accountName = null
      }
    },

    //切换审核状态
    onChangeAuditState(e) {
      if (e != 'not') this.forms.notPassCause = null
    },

    // 取消
    handleCancel() {
      this.visible = !1
    },

    // 确认
    handleOk() {
      const _type = this.editType
      if (_type == 'delete') {
        this.deleteAgent()
      } else if (_type == 'pass') {
        this.passAgent()
      } else if (_type == 'notpass') {
        const flag = this.checkNotpassData()
        flag && this.notPassAgent()
      } else if (_type == 'enabled' || _type == 'disabled') {
        this.setAgentState()
      } else if (_type == 'detail') {
        this.handleCancel()
      } else if (_type == 'renew') {
        const flag = this.checkRenewData()
        flag && this.renewAgent()
      } else if (_type == 'reset') {
        this.resetAgentPassword()
      } else {
        const flag = this.checkData()
        flag && this.addOrEditAgent()
      }
    },

    // 操作代理商
    handleAgent(e, o, i) {
      this.editType = e
      if (this.editType == 'add') {
        this.modalTitle = '新增'
        this.visible = !0
        this.forms = {
          grade: 'one',
          parentAgentId: '',
          agentName: null,
          linkmanName: null,
          linkmanPhoneNumber: null,
          salesmanId: null,
          accountChannel: 'card',
          bankName: null,
          bankAddress: null,
          accountName: null,
          accountNumber: null,
          remark: null,
          auditState: 'not',
          notPassCause: null
        }
      } else if (this.editType == 'edit') {
        this.initSelectedRows()
        this.selectedRows.push(o)
        this.selectedRowKeys.push(i)
        this.modalTitle = '编辑'
        this.grade = o.grade == 'two' ? 'one' : o.grade == 'three' ? 'two' : 'one'
        this.getParentAgentList()
        this.getAgentInfo(o.id)
      } else if (this.editType == 'renew') {
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择一个续费项！')
          return false
        } else {
          this.modalTitle = '续费'
          this.visible = !0
        }
      } else if (this.editType == 'delete') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择删除项！')
          return false
        } else {
          this.modalTitle = '删除'
          this.visible = !0
        }
      } else if (this.editType == 'pass') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择审核通过项！')
          return false
        } else {
          this.modalTitle = '审核通过'
          this.visible = !0
        }
      } else if (this.editType == 'notpass') {
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择一个审核不通过项！')
          return false
        } else {
          this.modalTitle = '审核不通过'
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
        this.grade = o.grade == 'two' ? 'one' : o.grade == 'three' ? 'two' : 'one'
        this.getParentAgentList()
        this.getAgentInfo(o.id)
      } else if (this.editType == 'reset') {
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择一个重置密码项！')
          return false
        } else {
          this.modalTitle = '重置密码'
          this.visible = !0
        }
      }
    },

    // 数据校验
    checkData() {
      let flag = !0
      const _formsData = this.forms
      const mobileReg = /^(1)[0-9]{10}$/
      const number = /^\d+$/
      if (_formsData.grade == 'two' && !_formsData.parentAgentId) {
        flag = !1
        this.$message.warning('请选择所属一级代理商！')
        return false
      }
      if (_formsData.grade == 'three' && !_formsData.parentAgentId) {
        flag = !1
        this.$message.warning('请选择所属二级代理商！')
        return false
      }
      if (!_formsData.agentName) {
        flag = !1
        this.$message.warning('请输入代理商名称！')
        return false
      } else if (!_formsData.linkmanName) {
        flag = !1
        this.$message.warning('请输入联系人！')
        return false
      } else if (!mobileReg.test(_formsData.linkmanPhoneNumber)) {
        flag = !1
        this.$message.warning('请输入有效的手机号！')
        return false
      } else if (!_formsData.salesmanId) {
        flag = !1
        this.$message.warning('请选择业务经理！')
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

    //续费数据校验
    checkRenewData() {
      const reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/
      const number = /^\d+$/
      const _data = this.renew
      if (!reg.test(_data.money)) {
        this.$message.warning('请填写续费金额！')
        return false
      } else if (!number.test(_data.quota)) {
        this.$message.warning('请填写整数套数字！')
        return false
      } else if (_data.quota < 1) {
        this.$message.warning('套数必须大于0！')
        return false
      } else {
        return true
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

    // 添加店铺
    addOrEditAgent() {
      const _type = this.editType
      const _data = this.forms

      switch (_type) {
        case 'add':
          addAgent(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getAgentList()
              } else {
                this.$message.error(res.msg)
              }
            })
            .catch(err => {
              console.log(err)
            })
          break
        case 'edit':
          modifyAgent(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getAgentList()
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

    // 续费
    renewAgent() {
      const _obj = this.selectedRows[0]
      const _data = {
        agentId: _obj.id,
        money: this.renew.money * 100,
        quota: this.renew.quota
      }
      rechargeAgent(_data)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('续充成功！')
            this.getAgentList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 删除
    deleteAgent() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      removeAgent(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('代理商已删除！')
            this.getAgentList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 通过
    passAgent() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      auditAgentOk(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('审核成功！')
            this.getAgentList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 不通过
    notPassAgent() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      const _data = {
        id: _idsArr[0],
        notPassCause: this.notPassCause
      }
      auditAgentNo(_data)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('审核成功！')
            this.getAgentList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 重置代理商密码
    resetAgentPassword() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      resetAgentPwd(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('重置成功！')
            this.getAgentList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 批量启用禁用
    setAgentState() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      const data = {
        idArr: _idsArr,
        state: this.editType == 'enabled' ? 'enabled' : 'disabled'
      }
      setAgentState(data)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('操作成功！')
            this.getAgentList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 获取代理商数据列表
    getAgentList() {
      this.initSelectedRows()

      const _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      }
      getAgentList(_data)
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

    // 获取代理商信息
    getAgentInfo(id) {
      let _id = null
      if (id) _id = id
      else _id = this.selectedRows[0].id
      getAgentInfo(_id)
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

    //获取父级代理商列表
    getParentAgentList() {
      const _data = {
        pageSize: this.pagePASize,
        currentPage: this.currentPAPage,
        where: { grade: this.grade }
      }
      getAgentList(_data)
        .then(res => {
          this.loading = !1
          if (res.code == 0) {
            this.currentPAPage = res.page.currentPage
            this.pagePASize = res.page.pageSize
            this.totalPAPage = res.page.totalPage
            this.totalPACount = res.page.totalCount
            let _list = res.page.list

            this.parentAgentList = _list
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 获取业务经理数据列表
    getBdList() {
      getBdListAll()
        .then(res => {
          this.loading = !1
          if (res.code == 0) {
            if (res.list.length > 0) {
              this.bdList = res.list
            } else {
              this.bdList = []
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
      this.getAgentList()
    },

    //下拉列表滚动时的回调
    scrollParentAgentLoading() {
      this.currentPAPage = this.currentPAPage + 1
      if (this.currentPAPage <= this.totalPAPage) {
        this.getParentAgentList()
      }
    }
  },
  created() {
    // 列表数据请求
    this.getAgentList()
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
  max-height: 650px;
  padding: 0 12px;
  overflow-y: auto;
}
</style>
