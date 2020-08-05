<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="活动编号">
              <a-input v-model="queryParam.activityNum" placeholder="请输入活动编号" />
            </a-form-item>
          </a-col>

          <a-col :md="8" :sm="24">
            <a-form-item label="商品名称">
              <a-input v-model="queryParam.goodsName" placeholder="请输入商品名称" />
            </a-form-item>
          </a-col>

          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="活动状态">
                <a-select v-model="queryParam.state" placeholder="请选择">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="notStart">未开始</a-select-option>
                  <a-select-option value="started">进行中</a-select-option>
                  <a-select-option value="over">已结束</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :md="8" :sm="24">
              <a-form-item label="库存小于数量">
                <a-input v-model="queryParam.lessNum" placeholder="请输入库存小于数量" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="拼团人数">
                <a-input v-model="queryParam.groupPeopleCount" placeholder="请输入拼团人数" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="商品类型">
                <a-select v-model="queryParam.platformGoodsType" placeholder="请选择">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="physical">实物商品</a-select-option>
                  <a-select-option value="virtual">虚拟商品</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="活动时间">
                <a-range-picker v-model="dateTime" :allowClear="false" @change="onChangeDateTime" />
              </a-form-item>
            </a-col>
          </template>
          <a-col :md="!advanced && 8 || 24" :sm="24">
            <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
              <a-button type="primary" @click="queryGroupGoods">查询</a-button>
              <a-button style="margin-left: 8px" @click="resetGroupQueryParam">重置</a-button>
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
      <a-button type="primary" icon="plus" @click="handleGroupGoods('add')">新增活动商品</a-button>
      <!-- <a-button type="primary" icon="edit" @click="handleGroupGoods('edit')">编辑</a-button> -->
      <a-button type="primary" icon="delete" @click="handleGroupGoods('delete')">删除</a-button>
    </div>

    <!--表格-->
    <a-table size="middle" :scroll="{ x: 1500}" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">
      <template slot="titles" slot-scope="record">
        <a-tooltip placement="topLeft">
          <template slot='title'>
            {{record}}
          </template>
          {{record}}
        </a-tooltip>
      </template>

      <template slot="coverImage" slot-scope="record">
        <img style="width:60px;" :src="record">
      </template>

      <template slot="originalPrice" slot-scope="record">
        {{record/100}}
      </template>

      <template slot="groupPrice" slot-scope="record">
        {{record/100}}
      </template>

      <template slot="limitation" slot-scope="record">
        {{record==0?'不限购':record}}
      </template>

      <template slot="platformGoodsType" slot-scope="record">
        <a-tag v-if="record=='physical'" color="#87d068">实物商品</a-tag>
        <a-tag v-else-if="record=='virtual'">虚拟商品</a-tag>
      </template>

      <template slot="state" slot-scope="record">
        <a-tag v-if="record=='notStart'">未开始</a-tag>
        <a-tag v-else-if="record=='started'" color="#87d068">进行中</a-tag>
        <a-tag v-else-if="record=='over'" color="#ff0000">已结束</a-tag>
      </template>

      <template slot="activityTime" slot-scope="text, record">
        {{record.startTime}}<br>
        {{record.endTime}}
      </template>

      <template slot="Action" slot-scope="text, record, index">
        <a @click="handleGroupGoods('list', record, index)">拼团列表</a>
        <a-divider type="vertical" />
        <a @click="handleGroupGoods('detail', record)">活动详情</a>
      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增 -->
    <a-modal width="80%" :footer="null" :title="modalTitle" :visible="visible" :confirmLoading="confirmLoading" @cancel="handleCancelAdd">
      <p v-if="editType=='delete'">确认删除所选商品？</p>

      <div v-else class="modal-container">
        <a-card title="新增步骤" :bordered="false">
          <a-steps :current="currentTab">
            <a-step title="选择商品" description="请选择您要为那个商品创建拼团活动；" />
            <a-step title="设置活动价" description="请所选商品的拼团价格及活动库存；" />
            <a-step title="其他设置" description="请设置该活动商品持续时间及限购数量；" />
            <a-step title="完成" description="恭喜您的拼团商品已创建。" />
          </a-steps>
        </a-card>

        <!-- step one -->
        <a-card title="选择商品" :bordered="false" v-if="currentTab==0">
          <div class="step-page-search-wrapper">
            <a-form>
              <a-row :gutter="24">
                <a-col :md="8" :sm="24">
                  <a-form-item label="商品类型" :labelCol="{span:8}" :wrapperCol="{span:16}">
                    <a-select v-model="queryParamGoods.platformGoodsType" placeholder="请选择商品类型" @change="onChangePlatformGoodsType">
                      <a-select-option value="physical">实物商品</a-select-option>
                      <a-select-option value="virtual">虚拟商品</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :md="8" :sm="24">
                  <a-form-item label="商品名称" :label-col="{span:8}" :wrapper-col="{span:16}">
                    <a-input v-model="queryParamGoods.goodsName" placeholder="商品名称" />
                  </a-form-item>
                </a-col>

                <template v-if="advanced">
                  <a-col :md="8" :sm="24">
                    <a-form-item label="商品类目" :label-col="{span:8}" :wrapper-col="{span:16}">
                      <a-cascader v-model="queryParamGoods.categoryId" :options="categoryTreeData" expandTrigger="hover" placeholder="请选择商品类目" />
                    </a-form-item>
                  </a-col>
                </template>
                <a-col :md="!advanced && 8 || 24" :sm="24">
                  <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
                    <a-button type="primary" @click="queryGoods">查询</a-button>
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

          <div class="step-page-table-wrapper">
            <!--表格-->
            <a-table size="middle" :columns="columnsGoods" :dataSource="loadDatasGoods" :loading="loadingGoods" :pagination="pagination" :rowSelection="{type:'radio', selectedRowKeys: selectedRowKeysGoods, onChange: updateSelectGoods }">
              <template slot="coverImage" slot-scope="record">
                <img style="width:60px; height:60px;" :src="record">
              </template>

              <template slot="salePrice" slot-scope="record">
                {{record/100}}
              </template>

            </a-table>
            <!--分页-->
            <Pagination :current="currentPageGoods" :pageSizeOptions="pageSizeOptionsGoods" :pageSize="pageSizeGoods" :total="totalCountGoods" :totalPage="totalPageGoods" @change="changePageGoods"></Pagination>

          </div>

        </a-card>

        <a-card title="设置活动价及库存" :bordered="false" v-else-if="currentTab==1">
          <template v-if="forms.goodsGroupDescModels.length>0">
            <a-table :columns="skuColumns" :dataSource="forms.goodsGroupDescModels" :pagination="pagination">

              <template slot="descPrice" slot-scope="record">
                {{record/100}}
              </template>

              <template slot="groupPrice" slot-scope="text, record">
                <a-input type="number" :disabled="editType=='detail'" v-model="record.groupPrice" placeholder="请输入团购价格（最多两位小数）" />
              </template>

              <template slot="groupNum" slot-scope="text, record">
                <a-input type="number" :disabled="editType=='detail'" v-model="record.groupNum" placeholder="请输入团购库存数" />
              </template>

            </a-table>

          </template>
          <template v-else>
            <a-form>
              <a-row :gutter="24">
                <a-col :md="12" :sm="24">
                  <a-form-item label="团购价格" :required="true">
                    <a-input type="number" v-model="forms.groupPrice" :disabled="editType=='detail'" placeholder="请输入团购价格" />
                  </a-form-item>
                </a-col>

                <a-col :md="12" :sm="24">
                  <a-form-item label="团购库存">
                    <a-input type="number" v-model="forms.groupNum" :disabled="editType=='detail'" placeholder="请输入团购库存" />
                  </a-form-item>
                </a-col>

              </a-row>
            </a-form>
          </template>

        </a-card>

        <a-card title="其他设置" :bordered="false" v-else-if="currentTab==2">
          <a-form>
            <a-row :gutter="24">

              <a-col :md="12" :sm="24">
                <a-form-item label="活动时间" :required="true">
                  <a-range-picker v-model="groupDateTime" show-time :allowClear="false" :format="dateFormat" @change="onChangeGroupDateTime" style="width:100%;" />
                </a-form-item>
              </a-col>

              <a-col :md="12" :sm="24">
                <a-form-item label="拼团人数" :required="true">
                  <a-input type="number" v-model="forms.groupPeopleCount" :disabled="editType=='detail'" placeholder="请输入拼团人数" />
                </a-form-item>
              </a-col>

              <a-col :md="12" :sm="24">
                <a-form-item label="持续时间" :required="true">
                  <a-input type="number" v-model="forms.groupTime" :disabled="editType=='detail'" addonAfter="小时" placeholder="请输入持续时间" />
                </a-form-item>
              </a-col>

              <a-col :md="12" :sm="24">
                <a-form-item label="限购数量">
                  <a-input type="number" v-model="forms.limitation" :disabled="editType=='detail'" placeholder="请输入限购数量（0：表示不限购）" />
                </a-form-item>
              </a-col>

            </a-row>
          </a-form>
        </a-card>

        <a-card title="创建完成" :bordered="false" v-else-if="currentTab==3">
          <result type="success" :description="descriptions" :title="title"></result>
        </a-card>

      </div>
      <div class="modal-container-footer">
        <a-button type="default" :icon="currentTab==0?'close-circle':currentTab==3?'close-circle':'arrow-left'" @click="prevStep">{{currentTab==0?'取消':currentTab==3?'取消':'上一步'}}</a-button>
        <a-button type="primary" icon="arrow-right" style="margin-left: 10px" @click="nextStep">{{currentTab==2?'确认':currentTab==3?'继续添加':'下一步'}}</a-button>
      </div>
    </a-modal>

    <!-- 编辑or详情or删除 -->
    <a-modal :width="editType=='delete'?'400px':'80%'" :title="modalTitle" :visible="visibleMID" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='delete'">确认删除所选商品？</p>

      <div v-else class="modal-container">

        <a-card title="商品" :bordered="false">

          <detail-list title="商品信息">
            <detail-list-item term="商品标题">{{forms.title}}</detail-list-item>
            <detail-list-item term="商品原售价">{{forms.originalPrice/100}} 元</detail-list-item>
            <detail-list-item term="商品库存">{{forms.num}}</detail-list-item>
          </detail-list>
          <a-divider style="margin-bottom: 32px" />
        </a-card>

        <a-card title="活动价及库存" :bordered="false">
          <template v-if="forms.goodsGroupDescModels">
            <a-table :columns="skuColumns" :dataSource="forms.goodsGroupDescModels" :pagination="pagination">

              <template slot="descPrice" slot-scope="record">
                {{record/100}}
              </template>

              <template slot="groupPrice" slot-scope="text, record">
                <a-input type="number" :disabled="editType=='detail'" v-model="record.groupPrice" placeholder="请输入团购价格（最多两位小数）" />
              </template>

              <template slot="groupNum" slot-scope="text, record">
                <a-input type="number" :disabled="editType=='detail'" v-model="record.groupNum" placeholder="请输入团购库存数" />
              </template>

            </a-table>

          </template>
          <template v-else>
            <a-form>
              <a-row :gutter="24">
                <a-col :md="12" :sm="24">
                  <a-form-item label="团购价格" :required="true">
                    <a-input type="number" v-model="forms.groupPrice" :disabled="editType=='detail'" placeholder="请输入团购价格" />
                  </a-form-item>
                </a-col>

                <a-col :md="12" :sm="24">
                  <a-form-item label="团购库存">
                    <a-input type="number" v-model="forms.groupNum" :disabled="editType=='detail'" placeholder="请输入团购库存" />
                  </a-form-item>
                </a-col>

              </a-row>
            </a-form>
          </template>

        </a-card>

        <a-card title="其他" :bordered="false">
          <a-form>
            <a-row :gutter="24">

              <a-col :md="12" :sm="24">
                <a-form-item label="活动时间" :required="true">
                  <a-range-picker v-model="groupDateTime" show-time :allowClear="false" :format="dateFormat" :disabled="editType=='detail'" @change="onChangeGroupDateTime" style="width:100%;" />
                </a-form-item>
              </a-col>

              <a-col :md="12" :sm="24">
                <a-form-item label="拼团人数" :required="true">
                  <a-input type="number" v-model="forms.groupPeopleCount" :disabled="editType=='detail'" placeholder="请输入团购价格" />
                </a-form-item>
              </a-col>

              <a-col :md="12" :sm="24">
                <a-form-item label="持续时间" :required="true">
                  <a-input type="number" v-model="forms.groupTime" :disabled="editType=='detail'" addonAfter="小时" placeholder="请输入团购库存" />
                </a-form-item>
              </a-col>

              <a-col :md="12" :sm="24">
                <a-form-item label="限购数量">
                  <a-input type="number" v-model="forms.limitation" :disabled="editType=='detail'" placeholder="请输入限购数量（0：表示不限购）" />
                </a-form-item>
              </a-col>

            </a-row>
          </a-form>
        </a-card>

      </div>
    </a-modal>

    <!-- 团列表 -->
    <a-modal width="80%" title="团列表" :visible="visibleGroup" @ok="handleOkGroup" :confirmLoading="confirmLoadingGroup" @cancel="handleCancelGroup">
      <div class="modal-container">

        <div class="step-page-search-wrapper">
          <a-form>
            <a-row :gutter="24">
              <a-col :md="8" :sm="24">
                <a-form-item label="团编号" :label-col="{span:8}" :wrapper-col="{span:16}">
                  <a-input v-model="queryParamGroup.groupOrderId" placeholder="团购编号" />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item label="团状态" :labelCol="{span:8}" :wrapperCol="{span:16}">
                  <a-select v-model="queryParamGroup.state" placeholder="请选择团状态">
                    <a-select-option value="">全部</a-select-option>
                    <a-select-option value="waitGroup">待成团</a-select-option>
                    <a-select-option value="success">团成功</a-select-option>
                    <a-select-option value="fail">团失败</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>

              <a-col :md="8" :sm="24">
                <span class="table-page-search-submitButtons">
                  <a-button type="primary" @click="queryGroup">查询</a-button>
                  <a-button style="margin-left: 8px" @click="resetQueryParamGroup">重置</a-button>
                </span>
              </a-col>
            </a-row>
          </a-form>
        </div>

        <div class="step-page-table-wrapper">
          <!--表格-->
          <a-table size="middle" :columns="columnsGroup" :dataSource="loadDatasGroup" :loading="loadingGroup" :pagination="pagination" :rowSelection="{type:'radio', selectedRowKeys: selectedRowKeysGroup, onChange: updateSelectGroup }">
            <template slot="userList" slot-scope="record">
              <span v-for="(v,i) of record" :key="i">
                <a-badge dot v-if="v.isMaster=='true'">
                  <a-avatar shape="square" :src="v.headPic" />
                </a-badge>
                <a-avatar shape="square" :src="v.headPic" v-else />
              </span>
            </template>
            <template slot="state" slot-scope="record">
              <a-tag v-if="record=='waitGroup'">待成团</a-tag>
              <a-tag v-else-if="record=='success'" color="#87d068">团成功</a-tag>
              <a-tag v-else-if="record=='fail'" color="#ff0000">团失败</a-tag>
            </template>

          </a-table>
          <!--分页-->
          <Pagination :current="currentPageGroup" :pageSizeOptions="pageSizeOptionsGroup" :pageSize="pageSizeGroup" :total="totalCountGroup" :totalPage="totalPageGroup" @change="changePageGroup"></Pagination>

        </div>

      </div>

    </a-modal>

  </div>
</template>

<script>
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import Pagination from '@/components/pagination/pagination'
import { Result } from '@/components'
import DetailList from '@/components/tools/DetailList'
const DetailListItem = DetailList.Item
import moment from 'moment'
import 'moment/locale/zh-cn'
moment.locale('zh-cn')
import {
  addPlatformGroupGoods,
  getPlatformGroupGoodsList,
  getPlatformGroupGoodsInfo,
  modifyPlatformGroupGoods,
  removePlatformGroupGoods,
  getPlatformGCategoryAll,
  getPlatformGoodsList,
  getPlatformGroupList,
  uploadFile
} from '@/api/common'
import { quillEditor, Quill } from 'vue-quill-editor'
import { ImageExtend, QuillWatch } from 'quill-image-extend-module'
Quill.register('modules/ImageExtend', ImageExtend)
const columns = [
  {
    title: '活动编号',
    width: '15%',
    dataIndex: 'activityNum'
  },
  {
    title: '商品名称',
    width: '10%',
    dataIndex: 'title',
    scopedSlots: { customRender: 'titles' }
  },

  {
    title: '商品图片',
    width: 80,
    dataIndex: 'coverImage',
    scopedSlots: { customRender: 'coverImage' }
  },

  {
    title: '原售价',
    width: '8%',
    dataIndex: 'originalPrice',
    scopedSlots: { customRender: 'originalPrice' }
  },

  {
    title: '拼团价',
    width: '8%',
    dataIndex: 'groupPrice',
    scopedSlots: { customRender: 'groupPrice' }
  },

  {
    title: '团人数',
    width: '7%',
    dataIndex: 'groupPeopleCount'
  },

  {
    title: '团库存',
    width: '7%',
    dataIndex: 'num'
  },

  {
    title: '限购数',
    width: '10%',
    dataIndex: 'limitation',
    scopedSlots: { customRender: 'limitation' }
  },

  {
    title: '商品类型',
    width: '10%',
    dataIndex: 'platformGoodsType',
    scopedSlots: { customRender: 'platformGoodsType' }
  },

  {
    title: '活动状态',
    width: '10%',
    dataIndex: 'state',
    scopedSlots: { customRender: 'state' }
  },

  {
    title: '活动时间',
    width: '15%',
    dataIndex: 'activityTime',
    scopedSlots: { customRender: 'activityTime' }
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

const columnsGoods = [
  {
    title: '标题',
    width: '20%',
    dataIndex: 'goodsName'
  },
  {
    title: '商品图片',
    width: 60,
    dataIndex: 'coverImage',
    align: 'center',
    scopedSlots: { customRender: 'coverImage' }
  },

  {
    title: '所属分类',
    width: '20%',
    dataIndex: 'categoryNames'
  },

  {
    title: '商品售价(元)',
    width: '15%',
    dataIndex: 'salePrice',
    scopedSlots: { customRender: 'salePrice' }
  }
]

const skuColumns = [
  {
    title: '规格名称',
    width: '30%',
    dataIndex: 'specificationItems',
    scopedSlots: { customRender: 'specificationItems' }
  },

  {
    title: '销售价格(元)',
    width: '15%',
    dataIndex: 'descPrice',
    scopedSlots: { customRender: 'descPrice' }
  },

  {
    title: '团购价格(元)',
    width: '25%',
    dataIndex: 'groupPrice',
    scopedSlots: { customRender: 'groupPrice' }
  },

  {
    title: '团购库存',
    width: '20%',
    dataIndex: 'groupNum',
    scopedSlots: { customRender: 'groupNum' }
  }
]

const columnsGroup = [
  {
    title: '团编号',
    width: '20%',
    dataIndex: 'groupOrderId'
  },

  {
    title: '团人数',
    width: '15%',
    dataIndex: 'groupPeopleCount'
  },

  {
    title: '团成员',
    width: '30%',
    dataIndex: 'userList',
    scopedSlots: { customRender: 'userList' }
  },

  {
    title: '结束时间',
    width: '20%',
    dataIndex: 'endGroupTime'
  },

  {
    title: '团状态',
    width: '15%',
    dataIndex: 'state',
    scopedSlots: { customRender: 'state' }
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
  name: 'Merchant',
  components: {
    Pagination,
    quillEditor,
    Result,
    DetailList,
    DetailListItem
  },
  data() {
    return {
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        // 搜索查询参数
        activityNum: null,
        goodsName: null,
        groupPeopleCount: null,
        lessNum: null,
        state: '',
        platformGoodsType: '',
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

      currentTab: 0, // 当前步骤

      dateFormat: 'YYYY-MM-DD HH:mm:ss',

      groupDateTime: [],

      forms: {
        startTime: null,
        goodsId: null,
        goodsGroupDescModels: [],
        groupNum: null,
        groupPrice: null,
        groupTime: null,
        groupPeopleCount: null,
        limitation: '0',
        endTime: null
      },

      editType: 'add',
      modalTitle: '新增',
      visible: !1,
      confirmLoading: !1,

      visibleMID: !1,

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
      },

      // 正常商品搜索条件
      queryParamGoods: {
        goodsName: null,
        platformGoodsType: 'physical',
        categoryId: []
      },

      categoryTreeData: [], // 商品分类树结构数据

      columnsGoods, // 表头
      loadDatasGoods: [], // 表格请求的数据

      //Sku
      skuColumns,

      // 正常商品分页
      pageSizeOptionsGoods: ['10', '30', '50', '100'],
      currentPageGoods: 1, // 当前的页数
      pageSizeGoods: 10, // 每页显示的条数
      totalPageGoods: 0, // 总页数
      totalCountGoods: 0, // 总条数
      loadingGoods: false,

      selectedRowKeysGoods: [], // 选中行键
      selectedRowsGoods: [], // 选中行键值,

      title: '创建成功',
      descriptions: '团购商品已成功创建，\n' + ' 请在消费者端小程序“首页”->“拼团购”查看已上架的商品。\n',

      // 团列表
      visibleGroup: !1,
      confirmLoadingGroup: !1,

      columnsGroup, // 表头
      loadDatasGroup: [], // 表格请求的数据

      // 团分页
      // 正常商品搜索条件
      queryParamGroup: {
        groupOrderId: null,
        state: ''
      },

      pageSizeOptionsGroup: ['10', '30', '50', '100'],
      currentPageGroup: 1, // 当前的页数
      pageSizeGroup: 10, // 每页显示的条数
      totalPageGroup: 0, // 总页数
      totalCountGroup: 0, // 总条数
      loadingGroup: false,

      selectedRowKeysGroup: [], // 选中行键
      selectedRowsGroup: [] // 选中行键值,
    }
  },

  methods: {
    //活动商品
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

    // 查询
    queryGroupGoods() {
      this.currentPage = 1

      this.getGroupGoodsList()
    },

    // 重置
    resetGroupQueryParam() {
      this.dateTime = []

      this.queryParam.activityNum = null
      this.queryParam.goodsName = null
      this.queryParam.groupPeopleCount = null
      this.queryParam.lessNum = null
      this.queryParam.state = ''
      this.queryParam.platformGoodsType = ''
      this.queryParam.startTime = ''
      this.queryParam.endtTime = ''
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

    // 正常商品查询
    queryGoods() {
      this.getGoodsList()
    },

    // 正常商品重置
    resetQueryParam() {
      this.queryParam.goodsName = null
      this.queryParam.platformGoodsType = 'physical'
      this.queryParam.categoryId = []
    },

    //正常商品
    initSelectedRowsGoods() {
      this.selectedRowKeysGoods = []
      this.selectedRowsGoods = []
    },

    // 正常商品类型选择
    onChangePlatformGoodsType(e) {
      this.queryParamGoods.platformGoodsType = e
      this.currentPageGoods = 1
      this.geCategoryList()
      this.getGoodsList()
    },

    // 选择跟新商品 table中的某项
    updateSelectGoods(selectedRowKeys, selectedRows) {
      this.selectedRowKeysGoods = selectedRowKeys
      this.selectedRowsGoods = selectedRows
      this.forms.goodsId = selectedRows[0].id
      this.forms.goodsGroupDescModels = selectedRows[0].commodityDescModelList || []
    },

    //初始化提交数据
    initFormData() {
      this.forms = {
        startTime: null,
        goodsId: null,
        goodsGroupDescModels: [],
        groupNum: null,
        groupPrice: null,
        groupTime: null,
        groupPeopleCount: null,
        limitation: '0',
        endTime: null
      }
      this.groupDateTime = []
    },

    //上一步
    prevStep() {
      if (this.currentTab > 0 && this.currentTab < 3) {
        this.currentTab -= 1
      } else if (this.currentTab == 0 || this.currentTab == 3) {
        this.visible = !1
        this.currentTab = 0
        this.currentPageGoods = 1

        this.initFormData()
      }
    },

    //下一步
    nextStep() {
      if (this.currentTab == 0) {
        const flag = this.checkStepOneData()
        if (flag) this.currentTab += 1
      } else if (this.currentTab == 1) {
        const flag = this.checkStepTwoData()
        if (flag) this.currentTab += 1
      } else if (this.currentTab == 2) {
        const flag = this.checkStepThreeData()
        if (flag) this.addOrEditGroupGoods()
      } else if (this.currentTab == 3) {
        this.currentTab = 0
        this.initFormData()
        this.geCategoryList()
        this.getGoodsList()
      }
    },

    //  拼团时间
    onChangeGroupDateTime(dates, dateStrings) {
      this.groupDateTime = dates
      this.forms.startTime = dateStrings[0]
      this.forms.endTime = dateStrings[1]
    },

    // 取消
    handleCancelAdd() {
      this.visible = !1
      this.currentTab = 0
      this.currentPageGoods = 1
      this.initFormData()
    },

    // 操作商品
    handleGroupGoods(e, o, i) {
      this.forms = {}
      this.editType = e
      if (this.editType == 'add') {
        this.modalTitle = '新增'
        this.visible = !0
        this.currentPageGoods = 1
        this.initFormData()
        this.geCategoryList()
        this.getGoodsList()
      } else if (this.editType == 'detail') {
        this.modalTitle = '详情'
        this.getGroupGoodsInfo(o.id)
      } else if (this.editType == 'edit') {
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择一个编辑项!')
          return false
        } else {
          this.getGroupGoodsInfo()
          this.modalTitle = '编辑'
        }
      } else if (this.editType == 'delete') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择删除项!')
          return false
        } else {
          this.modalTitle = '删除'
          this.visibleMID = !0
        }
      } else if (this.editType == 'list') {
        this.initSelectedRows()
        this.selectedRows.push(o)
        this.selectedRowKeys.push(i)
        this.getGroupList()
      }
    },

    handleCancel() {
      this.visibleMID = !1
    },

    // 确认
    handleOk() {
      const _type = this.editType
      if (_type == 'delete') {
        this.deletedGroupGoods()
      } else if (_type == 'detail') {
        this.handleCancel()
      } else {
        const flagTwo = this.checkStepTwoData()
        const flagThree = this.checkStepThreeData()
        flagTwo && flagThree && this.addOrEditGroupGoods()
      }
    },

    checkStepOneData() {
      const _datas = this.forms
      if (!_datas.goodsId) {
        this.$message.warning('请选择活动商品！')
        return false
      } else {
        return true
      }
    },

    checkStepTwoData() {
      let flag = !0
      let moneyReg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/
      const _datas = this.forms
      if (_datas.goodsGroupDescModels.length > 0) {
        for (const i in _datas.goodsGroupDescModels) {
          if (!moneyReg.test(_datas.goodsGroupDescModels[i].groupPrice)) {
            flag = !1
            this.$message.warning(`请填写第 ${+i + 1} 行商品有效的活动价格！`)
            return false
          } else if (_datas.goodsGroupDescModels[i].groupNum <= 0) {
            flag = !1
            this.$message.warning(`请填写第 ${+i + 1} 行商品有效的活动库存！`)
            return false
          }

          if (_datas.goodsGroupDescModels[i].groupPrice - _datas.goodsGroupDescModels[i].descPrice / 100 > 0) {
            flag = !1
            this.$message.warning(`第 ${+i + 1} 行商品活动价格必须小于销售价格！`)
            return false
          }
        }
      } else {
        if (!moneyReg.test(_datas.groupPrice)) {
          flag = !1
          this.$message.warning('请填写商品有效的活动价格！')
          return false
        } else if (_datas.groupNum <= 0) {
          flag = !1
          this.$message.warning('请填写商品活动库存！')
          return false
        }
      }
      return flag
    },

    checkStepThreeData() {
      let flag = !0
      const reg = /^\d+$/
      const _datas = this.forms
      if (!_datas.startTime && !_datas.endTime) {
        flag = !1
        this.$message.warning('请选择活动的开始时间和结束时间！')
        return false
      }
      if (_datas.groupPeopleCount <= 0) {
        flag = !1
        this.$message.warning('请输入有效的成团人数！')
        return false
      }
      if (!reg.test(_datas.groupTime)) {
        flag = !1
        this.$message.warning('请输入有效的团持续时间！')
        return false
      } else {
        if (_datas.groupTime <= 0) {
          flag = !1
          this.$message.warning('请输入持续时间必须大于0！')
          return false
        }
      }
      return flag
    },

    // 添加、修改活动商品
    addOrEditGroupGoods() {
      const _type = this.editType

      const _data = { ...this.forms }

      switch (_type) {
        case 'add':
          addPlatformGroupGoods(_data)
            .then(res => {
              if (res.code == 0) {
                this.currentTab += 1
                this.initFormData()
                this.getGroupGoodsList()
              } else {
                this.$message.error(res.msg)
              }
            })
            .catch(err => {
              console.log(err)
            })
          break
        case 'edit':
          modifyPlatformGroupGoods(_data)
            .then(res => {
              if (res.code == 0) {
                this.visibleMID = !1
                this.$message.success('操作成功！')
                this.getGroupGoodsList()
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

    deletedGroupGoods() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      removePlatformGroupGoods(_idsArr).then(res => {
        if (res.code == 0) {
          this.visibleMID = !1
          this.$message.success('删除成功！')
          this.getGroupGoodsList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },

    // 获取商品数据列表
    getGroupGoodsList() {
      this.initSelectedRows()
      const _queryParam = { ...this.queryParam }
      const _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: _queryParam
      }
      getPlatformGroupGoodsList(_data)
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

    // 获取活动商品信息
    getGroupGoodsInfo(id) {
      let _id = null
      if (id) _id = id
      else _id = this.selectedRows[0].id
      getPlatformGroupGoodsInfo(_id)
        .then(res => {
          if (res.code == 0) {
            this.visibleMID = !0
            const _info = res.info
            const _startDate = moment(_info.startTime, this.dateFormat)
            const _endDate = moment(_info.endTime, this.dateFormat)
            this.groupDateTime = [_startDate, _endDate]
            this.forms = _info
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
      this.getGroupGoodsList()
    },

    // 获取商品分类数据
    geCategoryList() {
      getPlatformGCategoryAll({ parentId: null, platformGoodsType: this.queryParamGoods.platformGoodsType })
        .then(res => {
          this.loading = !1
          if (res.code == 0) {
            if (res.result.length > 0) {
              const _listArr = res.result
              const _categoryTreeData = this.toTree(_listArr)
              this.categoryTreeData = _categoryTreeData
            } else {
              this.categoryTreeData = []
            }
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 构造商品分类树结构
    toTree(data) {
      var map = {}
      data.forEach(function(item, index) {
        map[item.id] = item
        map[item.id].key = item.id
        map[item.id].value = item.id
        map[item.id].label = item.categoryName
      })
      var val = []
      data.forEach(function(item) {
        var parent = map[item.parentId]
        if (parent) {
          ;(parent.children || (parent.children = [])).push(item)
        } else {
          val.push(item)
        }
      })
      return val
    },

    //获取实物 、虚拟商品（除话费流量商品）
    getGoodsList() {
      this.initSelectedRowsGoods()
      const _queryParamGoods = { ...this.queryParamGoods }
      _queryParamGoods.categoryId = _queryParamGoods.categoryId[_queryParamGoods.categoryId.length - 1] || null
      const _data = {
        pageSize: this.pageSizeGoods,
        currentPage: this.currentPageGoods,
        where: _queryParamGoods
      }
      getPlatformGoodsList(_data)
        .then(res => {
          this.loading = !1
          if (res.code == 0) {
            this.currentPageGoods = res.page.currentPage
            this.pageSizeGoods = res.page.pageSize
            this.totalPageGoods = res.page.totalPage
            this.totalCountGoods = res.page.totalCount
            if (res.page.list.length > 0) {
              this.loadDatasGoods = res.page.list
            } else {
              this.loadDatasGoods = []
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
    changePageGoods(obj) {
      this.currentPageGoods = obj.currentPage
      this.pageSizeGoods = obj.pageSize
      this.getGoodsList()
    },

    /**
     * 团相关
     */
    // 正常商品查询
    queryGroup() {
      this.currentPageGroup = 1
      this.getGroupList()
    },

    // 正常商品重置
    resetQueryParamGroup() {
      this.queryParamGroup.groupOrderId = null
      this.queryParamGroup.state = ''
    },

    // 选择跟新table中的某项
    updateSelectGroup(selectedRowKeys, selectedRows) {
      this.selectedRowKeysGroup = selectedRowKeys
      this.selectedRowsGroup = selectedRows
    },

    //正常商品
    initSelectedRowsGroup() {
      this.selectedRowKeysGroup = []
      this.selectedRowsGroup = []
    },

    handleCancelGroup() {
      this.visibleGroup = !1
    },

    // 确认
    handleOkGroup() {
      this.visibleGroup = !1
    },

    // 获取该商品下的团列表
    getGroupList(id) {
      this.initSelectedRowsGroup()
      const _queryParamGroup = { ...this.queryParamGroup }
      _queryParamGroup.goodsGroupId = id || this.selectedRows[0].id

      const _data = {
        pageSize: this.pageSizeGroup,
        currentPage: this.currentPageGroup,
        where: _queryParamGroup
      }
      getPlatformGroupList(_data)
        .then(res => {
          this.loadingGroup = !1
          if (res.code == 0) {
            this.visibleGroup = !0

            this.currentPageGroup = res.page.currentPage
            this.pageSizeGroup = res.page.pageSize
            this.totalPageGroup = res.page.totalPage
            this.totalCountGroup = res.page.totalCount
            if (res.page.list.length > 0) {
              this.loadDatasGroup = res.page.list
            } else {
              this.loadDatasGroup = []
            }
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 团分页
    changePageGroup() {
      this.currentPageGroup = obj.currentPage
      this.pageSizeGroup = obj.pageSize
      this.getGroupList()
    }
  },

  created() {
    // 列表数据请求
    this.getGroupGoodsList()
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
/deep/ .ant-table .ant-table-content .ant-table-tbody > tr {
  height: 85px;
}
.table-operator {
  margin-bottom: 10px;
}
.ant-pagination {
  margin-top: 20px;
  text-align: center;
}
.modal-container {
  position: relative;
  max-height: 650px;
  margin-bottom: 50px;
  padding: 0 12px 50px;
  overflow-y: auto;
}
.modal-container-footer {
  position: absolute;
  width: 100%;
  height: 50px;
  left: 0;
  bottom: 0;
  text-align: center;
}
</style>
