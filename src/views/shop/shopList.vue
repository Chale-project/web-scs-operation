<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="店铺名称">
              <a-input v-model="queryParam.shopName" placeholder="请输入店铺名称" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="店铺编号">
              <a-input v-model="queryParam.shopId" placeholder="请输入店铺编号" />
            </a-form-item>
          </a-col>
          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="商户名称">
                <a-input v-model="queryParam.merchantName" placeholder="请输入商户名称" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="商户编号">
                <a-input v-model="queryParam.merchantId" placeholder="请输入商户编号" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="联系电话">
                <a-input v-model="queryParam.phoneNumber" placeholder="请输入联系电话" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="所属代理商">
                <a-select v-model="queryParam.agentId" @focus="onFocusGetAgent" @popupScroll="scrollAgentLoading" placeholder="请选择">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option :value="v.id" v-for="(v,i) of agentList" :key="i">{{v.agentName}}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="所属业务员">
                <a-select placeholder="请选择" v-model="queryParam.salemanId">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option :value="v.id" v-for="(v,i) of bdList" :key="i">{{v.salesmanName}}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="所属行业">
                <a-select placeholder="请选择" v-model="queryParam.shopType">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="零售">零售</a-select-option>
                  <a-select-option value="餐饮">餐饮</a-select-option>
                  <a-select-option value="外卖">外卖</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="营业状态">
                <a-select placeholder="请选择" v-model="queryParam.businessState">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="enabled">营业中</a-select-option>
                  <a-select-option value="disabled">暂停营业</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="配送状态">
                <a-select placeholder="请选择" v-model="queryParam.deliveryState">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="enabled">可配送</a-select-option>
                  <a-select-option value="disabled">暂停配送</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="店铺状态">
                <a-select placeholder="请选择" v-model="queryParam.state">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="enabled">启用</a-select-option>
                  <a-select-option value="disabled">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="审核状态">
                <a-select placeholder="请选择" v-model="queryParam.auditState">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="pass">通过</a-select-option>
                  <a-select-option value="notpass">不通过</a-select-option>
                  <a-select-option value="not">未审核</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </template>
          <a-col :md="!advanced && 8 || 24" :sm="24">
            <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
              <a-button type="primary" @click="queryShop">查询</a-button>
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
      <a-button type="primary" icon="edit" @click="handleShop('edit')">编辑</a-button>
      <a-button type="primary" icon="swap" @click="handleShop('swap')">变更所属代理商/业务员</a-button>
      <a-dropdown>
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="handleShop('enabled')">
            <a-icon type="unlock" />启用
          </a-menu-item>
          <!-- lock | unlock -->
          <a-menu-item key="2" @click="handleShop('disabled')">
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
    <a-table size="middle" :scroll="{ x: 1500}" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">
      <template slot="shopName" slot-scope="record">
        <a-tooltip placement="topLeft">
          <template slot='title'>
            {{record}}
          </template>
          {{record}}
        </a-tooltip>
      </template>
      <template slot="merchantName" slot-scope="record">
        <a-tooltip placement="topLeft">
          <template slot='title'>
            {{record?record:'未编辑'}}
          </template>
          <span v-if="record">{{record}}</span>
          <a-tag v-else>未编辑</a-tag>
        </a-tooltip>
      </template>

      <template slot="shopNo" slot-scope="record">
        <template v-if="record">
          {{record}}
        </template>
        <template v-else>
          <a-tag>未关联</a-tag>
        </template>
      </template>

      <template slot="agentName" slot-scope="record">
        <template v-if="record">
          {{record}}
        </template>
        <template v-else>
          <a-tag>未关联</a-tag>
        </template>
      </template>

      <template slot="salemanName" slot-scope="record">
        <template v-if="record">
          {{record}}
        </template>
        <template v-else>
          <a-tag>未关联</a-tag>
        </template>
      </template>

      <template slot="businessState" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">营业中</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">暂停营业</a-tag>
        <span v-else>{{record}}</span>
      </template>

      <template slot="deliveryState" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">可配送</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">暂停配送</a-tag>
        <span v-else>{{record}}</span>
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
        <a @click="handleImgPreview(record.minpayqr)">收款码</a>
        <a-divider type="vertical" />
        <a @click="handleShop('detail', record)">详情</a>
        <a-divider type="vertical" />
        <a-dropdown>
          <a class="ant-dropdown-link">
            审核
            <a-icon type="down" /> </a>
          <a-menu slot="overlay">
            <a-menu-item @click="handleShop('pass', record, index)">
              <a href="javascript:;">通过</a>
            </a-menu-item>
            <a-menu-item @click="handleShop('notpass', record, index)">
              <a href="javascript:;">不通过</a>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="editType=='edit'?'800px':editType=='detail'?'800px':editType=='swap'?'800px':'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='pass'">确认审核通过所选店铺？</p>

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

      <p v-else-if="editType=='enabled'">确认启用所选店铺？</p>

      <div class="modal-container" v-else-if="editType=='disabled'">
        <a-form>
          <a-row :gutter="24">
            <a-col :md="24" :sm="24">
              <a-form-item label="禁用原因" :required="true">
                <a-textarea v-model="disableReason" :rows="4" placeholder="请填写禁用原因" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div class="modal-container" v-else-if="editType=='swap'">
        <a-form>
          <a-row :gutter="24">
            <a-col :md="10" :sm="10">
              <a-form-item label="当前所属代理商">
                <a-input v-model="forms.agentName" disabled />
              </a-form-item>
            </a-col>
            <a-col :md="4" :sm="4">
              <div :style="{height:'100px', lineHeight:'100px', textAlign:'center'}">
                <a-icon type="swap" :style="{color:'#1890ff'}" />
              </div>
            </a-col>
            <a-col :md="10" :sm="10">
              <a-form-item label="变更所属代理商" :required="true">
                <a-select v-model="belongAgentId" @focus="onFocusGetAgent" @popupScroll="scrollAgentLoading" @change="onChangeAgent" placeholder="请选择变更所属代理商">
                  <a-select-option value="" disabled>请选择变更所属代理商</a-select-option>
                  <a-select-option :value="v.id" v-for="(v,i) of agentList" :key="i">{{v.agentName}} <span style="color:#ccc;float:right;">{{v.grade=='one'?'一级代理':v.grade=='two'?'二级代理':v.grade=='three'?'三级代理':''}}</span></a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="10" :sm="10">
              <a-form-item label="当前所属业务员">
                <a-input v-model="forms.salemanName" disabled />
              </a-form-item>
            </a-col>
            <a-col :md="4" :sm="4">
              <div :style="{height:'100px', lineHeight:'100px', textAlign:'center'}">
                <a-icon type="swap" :style="{color:'#1890ff'}" />
              </div>
            </a-col>
            <a-col :md="10" :sm="10">
              <a-form-item label="变更所属业务员" :required="true">
                <a-select v-model="belongSalesManId" @popupScroll="scrollSalesManLoading" placeholder="请选择变变更所属业务员">
                  <a-select-option value="" disabled>请选择变更所属业务员</a-select-option>
                  <a-select-option :value="v.id" v-for="(v,i) of salesManList" :key="i">{{v.salesmanName}}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="24" :sm="24">
              <a-form-item>
                <a-icon type="info-circle" :style="{color:'red'}" /> 变更后请及时修改相关代理商佣金配比！
              </a-form-item>

            </a-col>

          </a-row>
        </a-form>

      </div>

      <div class="modal-container" v-else>
        <a-form>
          <a-row :gutter="24">
            <a-col :md="12" :sm="24">
              <a-form-item label="店铺名称" :required="true">
                <a-input v-model="forms.shopName" :disabled="editType=='edit'||editType=='detail'" placeholder="店铺名称" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="联系人电话" :required="true">
                <a-input v-model="forms.phoneNumber" maxlength="11" :disabled="editType=='edit'||editType=='detail'" placeholder="请输入有效的手机号" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="所属行业" :required="true">
                <a-select v-model="forms.shopType" :disabled="editType=='edit'||editType=='detail'" placeholder="请选择">
                  <a-select-option value="零售">零售</a-select-option>
                  <a-select-option value="餐饮">餐饮</a-select-option>
                  <a-select-option value="外卖">外卖</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="关联收呗店铺号">
                <a-input v-model="forms.shopNo" :disabled="editType=='detail'" placeholder="请输入关联收呗店铺号" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="店铺Logo">
                <div class="shop-image">
                  <img :src="forms.shopLogo?forms.shopLogo:defaultImage" alt="">
                </div>
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="收款码">
                <div class="shop-image">
                  <img :src="forms.minpayqr?forms.minpayqr:defaultImage" alt="">
                </div>
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24" v-if="forms.salemanName">
              <a-form-item label="关联业务经理">
                <a-input v-model="forms.salemanName" :disabled="true" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="店铺地址">
                <a-input v-model="forms.shopAddress" :disabled="editType=='detail'" placeholder="请输入店铺地址" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="店铺经度">
                <a-input v-model="forms.shopLongitude" :disabled="editType=='detail'" placeholder="请输入店铺经度" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="店铺维度">
                <a-input v-model="forms.shopLatitude" :disabled="editType=='detail'" placeholder="请输入店铺维度" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24" v-show="editType=='edit'">
              <a-form-item label="审核">
                <a-select v-model="forms.auditState" :disabled="editType=='detail'||editType=='edit'" placeholder="请选择">
                  <a-select-option value="pass">通过</a-select-option>
                  <a-select-option value="notpass">不通过</a-select-option>
                  <a-select-option value="not">未审核</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="24" :sm="24">
              <a-form-item label="店铺简介">
                <quill-editor v-model="shopDescription" :options="editorOption" :disabled="editType=='detail'" style="height:200px" ref="myQuillEditor"></quill-editor>
              </a-form-item>
            </a-col>

          </a-row>
        </a-form>
      </div>
    </a-modal>

    <!-- 查看图片模态框 -->
    <a-modal :visible="previewVisible" :footer="null" @cancel="previewCancel">
      <img style="width: 100%" :src="previewImage" />
    </a-modal>

  </div>
</template>

<script>
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import Pagination from '@/components/pagination/pagination'
import {
  getShopInfo,
  getShopList,
  auditShopOk,
  auditShopNo,
  enabledShop,
  disabledShop,
  modifyShop,
  getPayCode,
  getAgentList,
  getBdListAll,
  modifyBelongAgent,
  getSalesManListData
} from '@/api/common'
import { mobileToStar } from '@/utils/util'
import QRCode from 'qrcode'

import { quillEditor, Quill } from 'vue-quill-editor'
import { ImageExtend, QuillWatch, uploadFile } from 'quill-image-extend-module'
Quill.register('modules/ImageExtend', ImageExtend)

const columns = [
  {
    title: '店铺名称',
    width: '10%',
    dataIndex: 'shopName',
    scopedSlots: { customRender: 'shopName' }
  },
  {
    title: '联系电话',
    width: '10%',
    dataIndex: 'phoneNumber'
  },
  {
    title: '所属商户',
    width: '10%',
    dataIndex: 'merchantName',
    scopedSlots: { customRender: 'merchantName' }
  },
  {
    title: '所属代理商',
    width: '10%',
    dataIndex: 'agentName',
    scopedSlots: { customRender: 'agentName' }
  },
  {
    title: '所属业务员',
    width: '10%',
    dataIndex: 'salemanName',
    scopedSlots: { customRender: 'salemanName' }
  },
  {
    title: '收呗店铺号',
    width: '10%',
    dataIndex: 'shopNo',
    scopedSlots: { customRender: 'shopNo' }
  },
  {
    title: '所属行业',
    width: '8%',
    align: 'center',
    dataIndex: 'shopType'
  },
  {
    title: '营业状态',
    width: '10%',
    align: 'center',
    dataIndex: 'businessState',
    scopedSlots: { customRender: 'businessState' }
  },

  {
    title: '配送状态',
    width: '10%',
    align: 'center',
    dataIndex: 'deliveryState',
    scopedSlots: { customRender: 'deliveryState' }
  },

  {
    title: '店铺状态',
    width: '10%',
    align: 'center',
    dataIndex: 'state',
    scopedSlots: { customRender: 'state' }
  },

  {
    title: '审核状态',
    width: '10%',
    align: 'center',
    dataIndex: 'auditState',
    scopedSlots: { customRender: 'auditState' }
  },
  {
    title: '操作',
    width: '200px',
    align: 'center',
    fixed: 'right',
    dataIndex: 'Action',
    scopedSlots: { customRender: 'Action' }
  }
]
const toolbarOptions = [
  [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
  ['bold', 'italic', 'underline', 'strike'], // toggled buttons
  ['blockquote'],

  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }], // outdent/indent

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ align: [] }],
  ['image'],
  ['clean'] // remove formatting button
]

export default {
  name: 'shopList',
  components: {
    Pagination,
    quillEditor
  },
  data() {
    return {
      mobileToStar,
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        // 搜索查询参数
        shopName: null,
        shopId: null,
        merchantName: null,
        merchantId: null,
        phoneNumber: null,
        agentId: '',
        salemanId: '',

        shopType: '',
        businessState: '',
        deliveryState: '',
        auditState: '',
        state: ''
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

      forms: {},
      editType: 'edit',
      modalTitle: '编辑',
      visible: !1,
      confirmLoading: !1,

      currentPageAgent: 1,
      pageSizeAgent: 10,
      totalPageAgent: 0,
      totalCountAgent: 0,
      agentList: [], // 代理商
      bdList: [], // 业务经理

      //查看收款码
      previewVisible: !1,
      previewImage: '',

      //详情聚合码
      minpayqr: '',

      // 不通过原因
      notPassCause: null,

      // 禁用原因
      disableReason: null,

      // 变更所属代理商ID 业务员
      belongAgentId: '',
      belongSalesManId: '',
      currentPageSalesMan: 1,
      pageSizeSalesMan: 10,
      totalPageSalesMan: 0,
      totalCountSalesMan: 0,
      salesManList: [], // 代理商业务经理

      defaultImage: '/logo.png',

      shopDescription: null,

      editorOption: {
        placeholder: '请输入文本...',
        theme: 'snow',
        modules: {
          ImageExtend: {
            loading: true,
            name: 'file',
            headers: xhr => {
              xhr.setRequestHeader('token', this.$ls.get('Access_Token'))
            },
            action: uploadFile,
            response: res => {
              return res.url
            }
          },
          toolbar: {
            container: toolbarOptions,
            handlers: {
              image: function() {
                QuillWatch.emit(this.quill.id)
              }
            }
          }
        }
      }
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
    queryShop() {
      this.currentPage = 1
      this.getShopList()
    },

    // 重置
    resetQueryParam() {
      this.dateTime = []

      this.queryParam.shopName = null
      this.queryParam.shopId = null
      this.queryParam.merchantName = null
      this.queryParam.merchantId = null
      this.queryParam.phoneNumber = null
      this.queryParam.agentId = ''
      this.queryParam.salemanId = ''
      this.queryParam.shopType = ''
      this.queryParam.businessState = ''
      this.queryParam.deliveryState = ''
      this.queryParam.auditState = ''
      this.queryParam.state = ''
    },

    // 选择跟新table中的某项
    updateSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },

    //关闭图片查看
    previewCancel() {
      this.previewVisible = !1
    },

    //查看图片
    handleImgPreview(e) {
      if (e) (this.previewImage = e), (this.previewVisible = !0)
      else this.$message.warning('请关联收呗店铺号后在获取！')
    },

    // 获取收款码
    getPayCode(id, index) {
      const _listData = this.loadDatas
      if (!_listData[index].shopNo) {
        this.$message.warning('请关联收呗店铺号后在获取！')
        return
      } else {
        getPayCode(id)
          .then(res => {
            if (res.code == 0) {
              _listData[index].gatheringTscPath = res.result
              this.$message.success('获取成功！')
            } else {
              this.$message.error(res.msg)
            }
          })
          .catch(err => {
            console.log(err)
          })
      }
    },

    // 取消
    handleCancel() {
      this.visible = !1
    },

    // 确认
    handleOk() {
      const _type = this.editType
      if (_type == 'enabled') {
        this.enabledShop()
      } else if (_type == 'disabled') {
        const flag = this.checkDisabledData()
        flag && this.disabledShop()
      } else if (_type == 'detail') {
        this.handleCancel()
      } else if (_type == 'pass') {
        this.passShop()
      } else if (_type == 'notpass') {
        const flag = this.checkNotpassData()
        flag && this.notpassShop()
      } else if (_type == 'swap') {
        const flag = this.checkSwapData()
        flag && this.swapShopAgent()
      } else {
        const flag = this.checkData()
        flag && this.addOrEditShop()
      }
    },

    // 操作店铺
    handleShop(e, o, i) {
      this.editType = e
      if (this.editType == 'edit') {
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择一个编辑项！')
          return false
        } else {
          this.modalTitle = '编辑'
          this.getShopInfo()
        }
      } else if (this.editType == 'pass') {
        this.initSelectedRows()
        this.selectedRows.push(o)
        this.selectedRowKeys.push(i)
        this.modalTitle = '审核通过'
        this.visible = !0
      } else if (this.editType == 'notpass') {
        this.initSelectedRows()
        this.selectedRows.push(o)
        this.selectedRowKeys.push(i)
        this.modalTitle = '审核不通过'
        this.visible = !0
      } else if (this.editType == 'enabled') {
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择一个启用项！')
          return false
        } else {
          this.modalTitle = '启用'
          this.visible = !0
        }
      } else if (this.editType == 'disabled') {
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择一个禁用项！')
          return false
        } else {
          this.modalTitle = '禁用'
          this.visible = !0
        }
      } else if (this.editType == 'swap') {
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择一个变更项！')
          return false
        } else {
          this.modalTitle = '变更所属代理商/业务员'
          this.belongAgentId = ''
          this.belongSalesManId = ''
          this.getShopInfo()
          this.visible = !0
        }
      } else if (this.editType == 'detail') {
        this.modalTitle = '详情'
        this.visible = !0
        this.getShopInfo(o.shopId)
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

    //禁用数据校验
    checkDisabledData() {
      if (!this.disableReason) {
        this.$message.warning('请填写禁用原因！')
        return false
      } else {
        return true
      }
    },

    // 变更代理商 业务员
    checkSwapData() {
      if (!this.belongAgentId) {
        this.$message.warning('请选择变更所属代理商！')
        return false
      } else if (!this.belongSalesManId) {
        this.$message.warning('请选择变更所属业务员！')
        return false
      } else {
        return true
      }
    },

    // 数据校验
    checkData() {
      const mobileReg = /^(1)[0-9]{10}$/
      if (!this.forms.shopName) {
        this.$message.warning('请输入店铺名称！')
        return false
      } else if (!mobileReg.test(this.forms.phoneNumber)) {
        this.$message.warning('请输入有效的手机号！')
        return false
      } else if (!this.forms.shopType) {
        this.$message.warning('请输入所属行业！')
        return false
      } else {
        return true
      }
    },

    // 添加编辑店铺
    addOrEditShop() {
      const _type = this.editType
      const _data = this.forms
      _data.shopIntro = this.shopDescription
      switch (_type) {
        case 'add':
          addShop(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getShopList()
              } else {
                this.$message.error(res.msg)
              }
            })
            .catch(err => {
              console.log(err)
            })
          break
        case 'edit':
          modifyShop(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getShopList()
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

    // 通过
    passShop() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      auditShopOk(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('审核成功！')
            this.getShopList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 不通过
    notpassShop() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      const _data = {
        id: _idsArr[0],
        notPassCause: this.notPassCause
      }
      auditShopNo(_data)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('操作成功！')
            this.getShopList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 启用
    enabledShop() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      enabledShop(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('启用成功！')
            this.getShopList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 禁用
    disabledShop() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      const _data = {
        id: _idsArr[0],
        disableReason: this.disableReason
      }
      disabledShop(_data)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('禁用成功！')
            this.getShopList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 变更店铺所属代理商/业务员
    swapShopAgent() {
      const _idsArr = this.selectedRows.map(item => {
        return item.shopId
      })
      const _data = {
        shopId: _idsArr[0],
        agentId: this.belongAgentId,
        salemanId: this.belongSalesManId
      }
      modifyBelongAgent(_data)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('变更成功！')
            this.getShopList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 获取店铺数据列表
    getShopList() {
      this.initSelectedRows()

      const _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      }
      getShopList(_data)
        .then(res => {
          this.loading = !1
          if (res.code == 0) {
            this.currentPage = res.page.currentPage
            this.pageSize = res.page.pageSize
            this.totalPage = res.page.totalPage
            this.totalCount = res.page.totalCount
            if (res.page.list.length > 0) {
              this.loadDatas = res.page.list
              // this.setQrCode(res.page.list)
            } else {
              this.loadDatas = []
            }
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {})
    },

    setQrCode(list) {
      for (const i in list) {
        if (list[i].minpayqr) {
          QRCode.toDataURL(list[i].minpayqr, { width: 200 }).then(res => {
            list[i].minpayqr = res
          })
        }
      }
      this.loadDatas = list
    },

    // 获取店铺信息
    getShopInfo(id) {
      let _id = null
      if (id) _id = id
      else _id = this.selectedRows[0].shopId
      getShopInfo(_id)
        .then(res => {
          if (res.code == 0) {
            this.visible = !0
            this.forms = res.result
            if (res.result.shopIntro) this.shopDescription = decodeURIComponent(res.result.shopIntro)
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    //获取焦点时获取代理商
    onFocusGetAgent() {
      if (this.agentList.length < 1) {
        this.currentPageAgent = 1
        this.getAgentList()
      }
    },

    // 改变时获取代理商下面的业务员
    onChangeAgent() {
      this.currentPageSalesMan = 1
      this.salesManList = []
      this.getSalesManList()
    },

    // 获取代理商数据列表
    getAgentList() {
      const _data = {
        pageSize: this.pageSizeAgent,
        currentPage: this.currentPageAgent,
        where: {
          // state: 'enabled',
          // auditState: 'pass'
        }
      }
      getAgentList(_data)
        .then(res => {
          this.loading = !1
          if (res.code == 0) {
            this.currentPageAgent = res.page.currentPage
            this.pageSizeAgent = res.page.pageSize
            this.totalPageAgent = res.page.totalPage
            this.totalCountAgent = res.page.totalCount

            let _list = res.page.list
            let _agentList = this.agentList
            if (_list.length > 0) {
              const _newList = _agentList.concat(_list)
              this.agentList = _newList
            } else {
              this.agentList = []
            }
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {})
    },

    //下拉列表滚动时的回调
    scrollAgentLoading() {
      this.currentPageAgent = this.currentPageAgent + 1
      if (this.currentPageAgent <= this.totalPageAgent) {
        this.getAgentList()
      }
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

    // 获取代理商下的业务经理列表
    getSalesManList() {
      const _data = {
        pageSize: this.pageSizeSalesMan,
        currentPage: this.currentPageSalesMan,
        where: {
          agentDataId: this.belongAgentId
          // state: 'enabled',
          // auditState: 'pass'
        }
      }
      getSalesManListData(_data)
        .then(res => {
          this.loading = !1
          if (res.code == 0) {
            this.currentPageSalesMan = res.page.currentPage
            this.pageSizeSalesMan = res.page.pageSize
            this.totalPageSalesMan = res.page.totalPage
            this.totalCountSalesMan = res.page.totalCount

            let _list = res.page.list
            let _salesManList = this.salesManList
            if (_list.length > 0) {
              const _newList = _salesManList.concat(_list)
              this.salesManList = _newList
            } else {
              this.salesManList = []
            }
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {})
    },

    //下拉列表滚动时的回调
    scrollSalesManLoading() {
      this.currentPageSalesMan = this.currentPageSalesMan + 1
      if (this.currentPageSalesMan <= this.totalPageSalesMan) {
        this.getSalesManList()
      }
    },

    // 分页
    changePage(obj) {
      this.currentPage = obj.currentPage
      this.pageSize = obj.pageSize
      this.getShopList()
    }
  },
  created() {
    // 列表数据请求
    this.getBdList()
    this.getShopList()
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
.shop-image {
  width: 100px;
  height: 100px;
  text-align: center;
  overflow: hidden;
}
.shop-image img {
  width: 100%;
}
</style>
