<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="商品名称">
              <a-input v-model="queryParam.title" placeholder="请输入商品名称" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="商品条码">
              <a-input v-model="queryParam.shapeCode" placeholder="请输入商品条码" />
            </a-form-item>
          </a-col>

          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="商品类目">
                <a-cascader v-model="queryParam.categoryId" :options="categoryTreeData" @change="onChangeQueryCategory" expandTrigger="hover" placeholder="请选择商品类目" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="商品状态">
                <a-select v-model="queryParam.state" placeholder="请选择">
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

    <!--功能按钮-->
    <div class="table-operator">
      <a-upload :action="actionFile" accept=".csv" :fileList="fileCsvList" :headers="headers" :showUploadList="false" :beforeUpload="beforeCsvUpload" :remove="handleCsvRemove" @change="handleCsvChange">
        <a-button type="primary">
          <a-icon type="upload" /> 批量导入商品
        </a-button>
      </a-upload>
      <a-button type="primary" icon="plus" @click="handleGoods('add')">新增</a-button>
      <a-button type="primary" icon="edit" @click="handleGoods('edit')">编辑</a-button>
      <a-button type="primary" icon="delete" @click="handleGoods('delete')">删除</a-button>
      <!-- <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="handleGoods('enabled')">
            <a-icon type="unlock" />启用
          </a-menu-item>
          <a-menu-item key="2" @click="handleGoods('disabled')">
            <a-icon type="lock" />禁用
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          批量操作
          <a-icon type="down" />
        </a-button>
      </a-dropdown> -->
    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">
      <template slot="coverImage" slot-scope="record">
        <img style="width:60px;" :src="record">
      </template>

      <template slot="state" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">启用</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">禁用</a-tag>
      </template>

      <template slot="Action" slot-scope="text, record, index">
        <a @click="handleGoods('detail', record)">详情</a>
      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="editType=='add'?'80%':editType=='edit'?'80%':editType=='detail'?'80%':editType=='delete'?'400px':'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='delete'">确认删除所选商品？</p>
      <p v-else-if="editType=='enabled'">确认启用所选商品？</p>
      <p v-else-if="editType=='disabled'">确认禁用所选商品？</p>

      <div v-else class="modal-container">
        <a-card title="商品信息" :bordered="false">
          <a-form>
            <a-row :gutter="24">
              <a-col :md="12" :sm="24">
                <a-form-item label="商品名称" :required="true">
                  <a-input v-model="forms.title" :disabled="editType=='detail'" placeholder="请输入商品名称" />
                </a-form-item>
              </a-col>

              <a-col :md="12" :sm="24">
                <a-form-item label="商品分类" :required="true">
                  <a-cascader v-model="forms.categoryIds" :disabled="editType=='detail'" :options="categoryTreeData" @change="onChangeCategory" expandTrigger="hover" placeholder="请选择商品类目" />
                </a-form-item>
              </a-col>

              <a-col :md="12" :sm="24">
                <a-form-item label="商品条码">
                  <a-input v-model="forms.shapeCode" :disabled="editType=='detail'" placeholder="请输入商品条码" />
                </a-form-item>
              </a-col>

            </a-row>
          </a-form>
        </a-card>

        <a-card title="商品图片" :bordered="false">
          <div class="clearfix">
            <a-upload :action="action" :headers="headers" :disabled="editType=='detail'" listType="picture-card" :fileList="fileList" @preview="handlePreview" @change="handleChange">
              <div v-if="fileList.length < 5">
                <a-icon type="plus" />
                <div class="ant-upload-text">上传</div>
              </div>
            </a-upload>
          </div>
        </a-card>

        <a-card title="商品SKU" :bordered="false">
          <a slot="extra" @click="addSkuItem" v-if="editType=='add'||editType=='edit'">
            <a-icon type="plus-circle" style="font-size: 24px;" /></a>
          <a-table :columns="skuColumns" :dataSource="skuLoadDatas" :pagination="pagination">
            <template slot="specificationItems" slot-scope="text, record">
              <a-input :disabled="editType=='detail'" v-model="record.specificationItems" />
            </template>
            <template slot="descPrice" slot-scope="text, record">
              <a-input type="number" :disabled="editType=='detail'" v-model="record.descPrice" />
            </template>
            <!-- <template slot="commodityCode" slot-scope="text, record">
              <a-input type="number" :disabled="editType=='detail'" v-model="record.commodityCode" />
            </template> -->

            <template slot="itemImages" slot-scope="text, record, index">
              <div class="sku-item-image">
                <a-upload :action="action" :headers="headers" :disabled="editType=='detail'" listType="picture-card" class="avatar-uploader box-upload-sku-item-image" :showUploadList="false" @change="uploadSkuItemImage($event,index)">
                  <img :src="record.itemImages" width="40" />
                </a-upload>
              </div>
            </template>
            <template slot="Action" slot-scope="text, record, index">
              <a @click="removeSkuItem(index)">移除</a>
            </template>
          </a-table>
        </a-card>

        <a-card title="商品详情" :bordered="false">
          <quill-editor v-model="forms.spec" :options="editorOption" :disabled="editType=='detail'" style="height:450px" ref="myQuillEditor"></quill-editor>
        </a-card>

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
  getGoodsCategory,
  addGoods,
  getGoodsList,
  getGoodsInfo,
  modifyGoods,
  deletedGoods,
  importFile,
  uploadFile
} from '@/api/common'
import { quillEditor, Quill } from 'vue-quill-editor'
import { ImageExtend, QuillWatch } from 'quill-image-extend-module'
Quill.register('modules/ImageExtend', ImageExtend)
const columns = [
  {
    title: '商品条码',
    width: '20%',
    dataIndex: 'shapeCode'
  },

  {
    title: '商品名称',
    width: '20%',
    dataIndex: 'title'
  },
  {
    title: '商品图片',
    width: 100,
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
    title: '商品状态',
    width: '10%',
    dataIndex: 'state',
    scopedSlots: { customRender: 'state' }
  },

  {
    title: '操作',
    width: '10%',
    align: 'center',
    dataIndex: 'Action',
    scopedSlots: { customRender: 'Action' }
  }
]

const skuColumns = [
  {
    title: '规格名称',
    width: '35%',
    dataIndex: 'specificationItems',
    scopedSlots: { customRender: 'specificationItems' }
  },

  {
    title: '销售价格',
    width: '20%',
    dataIndex: 'descPrice',
    scopedSlots: { customRender: 'descPrice' }
  },

  // {
  //   title: '商品条码',
  //   width: '20%',
  //   dataIndex: 'commodityCode',
  //   scopedSlots: { customRender: 'commodityCode' }
  // },

  {
    title: '规格图片',
    width: '10%',
    dataIndex: 'itemImages',
    scopedSlots: { customRender: 'itemImages' }
  },
  {
    title: '操作',
    width: '15%',
    align: 'center',
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
  name: 'goodsList',
  components: {
    Pagination,
    quillEditor
  },
  data() {
    return {
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        // 搜索查询参数
        title: null,
        shapeCode: null,
        categoryId: [],
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

      //
      skuColumns,
      skuLoadDatas: [],

      forms: {},
      categoryTreeData: [], // 商品分类树结构数据

      editType: 'add',
      modalTitle: '新增',
      visible: !1,
      confirmLoading: !1,

      actionFile: importFile,
      fileCsvList: [],
      flag: !0,

      action: uploadFile,
      headers: { token: this.$ls.get('Access_Token') },
      previewVisible: !1,
      fileList: [],
      previewImage: '',

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

    // 时间筛选
    onChangeDateTime(e, l) {
      this.dateTime = e
      this.queryParam.startTime = l[0]
      this.queryParam.endTime = l[1]
    },

    onChangeQueryCategory(e) {
      console.log(e)
    },

    // 重置
    resetQueryParam() {
      this.dateTime = []

      this.queryParam.title = null
      this.queryParam.shapeCode = null
      this.queryParam.categoryId = []
      this.queryParam.state = ''
    },

    // 查询
    queryGoods() {
      this.currentPage = 1

      this.getGoodsList()
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
      console.log(file)
      let _flag = !0
      const isCsv = file.type === 'application/vnd.ms-excel'
      const isLt3M = file.size / 1024 / 1024 < 3

      if (!isCsv) {
        this.$message.error('上传文件格式必须是 .csv格式!')
        _flag = !1
      }
      if (!isLt3M) {
        this.$message.error('上传文件大小不能超过 3MB!')
        _flag = !1
      }

      this.flag = _flag
      return isCsv && isLt3M
    },

    handleCsvRemove(e) {
      console.log(e)
    },

    // 导入商品
    handleCsvChange({ file, fileList }) {
      console.log(file)
      this.fileCsvList = fileList
      if (file.status == 'done') {
        if (file.response) {
          if (file.response.code == 0) {
            this.$message.success('导入成功！')
            this.currentPage = 1
            this.getGoodsList()
          } else {
            this.$message.error(file.response.msg)
          }
        }
      }
    },

    // 选择商品分类
    onChangeCategory(e) {
      console.log(e)
    },

    // 关闭查看图片
    previewCancel() {
      this.previewVisible = !1
    },

    // 查看图片
    handlePreview(file) {
      this.previewImage = file.url || file.thumbUrl
      this.previewVisible = !0
    },

    // 上传商品图
    handleChange({ file, fileList }) {
      const pos = file.name.lastIndexOf('.')
      const lastName = file.name.substring(pos, file.name.length)
      const supportTypes = ['.jpeg', '.png', '.jpg'] // jpeg、 png、 jpg
      if (supportTypes.indexOf(lastName.toLowerCase()) <= -1) {
        this.$message.error('商品图片仅支持 jpeg、 png、 jpg 3种格式！')
        return
      }
      if (file.size / (1024 * 1024) > 1) {
        this.$message.error('上传商品图片大小应小于2Mb！')
        return
      }
      this.fileList = fileList
    },

    //添加skuitem
    addSkuItem() {
      const _skuList = this.skuLoadDatas
      const obj = {
        specificationItems: null,
        descPrice: null,
        // commodityCode: null,
        itemImages: null
      }
      _skuList.push(obj)
    },

    //移除skuitem
    removeSkuItem(index) {
      const _skuList = this.skuLoadDatas
      _skuList.splice(index, 1)
    },

    //上传规格图
    uploadSkuItemImage(info, i) {
      if (info.file.status === 'done') {
        if (info.file.response) {
          if (info.file.response.code == 0) {
            this.skuLoadDatas[i].itemImages = info.file.response.url
          } else {
            this.$message.error(file.response.msg)
          }
        }
      }
    },

    // 取消
    handleCancel() {
      this.visible = !1
    },

    // 操作商品 detail、edit、enabled、disabled
    handleGoods(e, o) {
      this.forms = {}
      this.editType = e
      if (this.editType == 'add') {
        this.fileList = []
        this.skuLoadDatas = [
          {
            specificationItems: null,
            descPrice: null,
            // commodityCode: null,
            itemImages: null
          }
        ]

        this.modalTitle = '新增'
        this.visible = !0
        this.forms = {
          title: null,
          categoryIds: [],
          image: null,
          spec: null,
          state: 'enabled'
        }
      } else if (this.editType == 'detail') {
        this.modalTitle = '详情'
        this.getGoodsInfo(o.id)
      } else if (this.editType == 'edit') {
        this.fileList = []

        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择一个编辑项!')
          return false
        } else {
          this.getGoodsInfo()
          this.modalTitle = '编辑'
        }
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
        this.deletedGoods()
      } else if (_type == 'enabled') {
        this.enabledGoods()
      } else if (_type == 'disabled') {
        this.disabledGoods()
      } else if (_type == 'detail') {
        this.handleCancel()
      } else {
        const flag = this.checkData()
        flag && this.addOrEditGoods()
      }
    },

    // 数据校验
    checkData() {
      let flag = !0
      let reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/
      const _datas = this.forms
      let _skuLoadDatas = [...this.skuLoadDatas]
      if (!_datas.title) {
        flag = !1
        this.$message.warning('请输入商品名称！')
        return false
      } else if (_datas.categoryIds.length < 1) {
        flag = !1
        this.$message.warning('请选择商品分类！')
        return false
      } else if (this.fileList.length < 1) {
        flag = !1
        this.$message.warning('请上传商品图片！')
        return false
      } else if (_skuLoadDatas.length < 1) {
        flag = !1
        this.$message.warning('请添加商品sku！')
        return false
      } else if (_skuLoadDatas.length > 0) {
        for (const i in _skuLoadDatas) {
          if (!_skuLoadDatas[i].specificationItems) {
            flag = !1
            this.$message.warning('请输入规格名称！')
            break
          } else if (!reg.test(_skuLoadDatas[i].descPrice)) {
            flag = !1
            this.$message.warning('请输入有效的商品售价！')
            break
          }
          // else if (!_skuLoadDatas[i].commodityCode) {
          //   flag = !1
          //   this.$message.warning('请输入商品条码！')
          //   break
          // }
          else if (!_skuLoadDatas[i].itemImages) {
            flag = !1
            this.$message.warning('请上传规格图片！')
            break
          }
        }
      }
      return flag
    },

    // 添加、修改商品
    addOrEditGoods() {
      const _type = this.editType
      const _images = this.fileList.map(item => {
        if (item.response) {
          return item.response.url
        } else {
          return item.url
        }
      })
      const _skuList = this.skuLoadDatas
      const _data = { ...this.forms }

      _data.image = _images.join(',')
      _data.commodityDescModelList = _skuList
      switch (_type) {
        case 'add':
          addGoods(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getGoodsList()
              } else {
                this.$message.error(res.msg)
              }
            })
            .catch(err => {
              console.log(err)
            })
          break
        case 'edit':
          modifyGoods(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getGoodsList()
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

    deletedGoods() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      deletedGoods(_idsArr).then(res => {
        if (res.code == 0) {
          this.visible = !1
          this.$message.success('删除成功！')
          this.getGoodsList()
        } else {
          this.$message.error(res.msg)
        }
      })
      this.getGoodsList()
    },

    // 启用
    enabledGoods() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      enabledGoods(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('启用成功！')
            this.getGoodsList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 禁用
    disabledGoods() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      disabledGoods(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('禁用成功！')
            this.getGoodsList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 获取商品分类数据
    geCategoryList() {
      getGoodsCategory()
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
        map[item.id].label = item.name
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

    // 获取商品数据列表
    getGoodsList() {
      this.initSelectedRows()
      const _queryParam = { ...this.queryParam }
      _queryParam.categoryId = _queryParam.categoryId[_queryParam.categoryId.length - 1] || null
      const _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: _queryParam
      }
      getGoodsList(_data)
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

    // 获取商品信息
    getGoodsInfo(id) {
      let _id = null
      if (id) _id = id
      else _id = this.selectedRows[0].id
      getGoodsInfo(_id)
        .then(res => {
          if (res.code == 0) {
            this.visible = !0
            this.forms = res.info
            const _images = res.info.image.split(',')
            const imageArr = []
            _images.forEach((item, index) => {
              const obj = {}
              obj.url = item
              obj.uid = index
              obj.name = item
              imageArr.push(obj)
            })
            this.fileList = imageArr

            if (res.info.commodityDescModelList.length > 0) {
              this.skuLoadDatas = res.info.commodityDescModelList
            } else {
              this.skuLoadDatas = []
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
      this.getGoodsList()
    }
  },
  created() {
    // 列表数据请求
    this.geCategoryList()
    this.getGoodsList()
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
.sku-item-image {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 50px;
  text-align: center;
}

/deep/ .sku-item-image .ant-upload.ant-upload-select-picture-card {
  width: 100%;
  height: 100%;
}
</style>
