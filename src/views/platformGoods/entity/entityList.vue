<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="商品名称">
              <a-input v-model="queryParam.goodsName" placeholder="商品名称" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="商品类目">
              <a-cascader v-model="queryParam.categoryId" :options="categoryTreeData" @change="onChangeQueryCategory" expandTrigger="hover" placeholder="请选择商品类目" />
            </a-form-item>
          </a-col>

          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="上下架状态">
                <a-select v-model="queryParam.isMarketable" placeholder="请选择">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="put">上架中</a-select-option>
                  <a-select-option value="out">已下架</a-select-option>
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
      <a-button type="primary" icon="plus" @click="handleEntityGoods('add')">新增</a-button>
      <a-button type="primary" icon="edit" @click="handleEntityGoods('edit')">编辑</a-button>
      <a-button type="primary" icon="delete" @click="handleEntityGoods('delete')">删除</a-button>
      <a-dropdown>
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="handleEntityGoods('batchUp')">
            <a-icon type="upload" />上架
          </a-menu-item>
          <a-menu-item key="2" @click="handleEntityGoods('batchDown')">
            <a-icon type="download" />下架
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          批量上下架
          <a-icon type="down" />
        </a-button>
      </a-dropdown>
    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">
      <template slot="coverImage" slot-scope="record">
        <img style="width:60px;" :src="record">
      </template>

      <template slot="salePrice" slot-scope="record">
        {{record/100}}
      </template>

      <template slot="isMarketable" slot-scope="text, record, index">
        <div>
          <a-switch checkedChildren="上" unCheckedChildren="下" :checked="text=='put'?true:false" @change="handleEntityGoods('updown',record,index,$event)" />
        </div>
      </template>

      <template slot="Action" slot-scope="text, record, index">
        <a @click="handleEntityGoods('detail', record)">详情</a>
      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="editType=='add'?'80%':editType=='edit'?'80%':editType=='detail'?'80%':editType=='delete'?'400px':'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='delete'">确认删除所选商品？</p>
      <p v-else-if="editType=='batchUp'">确认上架所选商品？</p>
      <p v-else-if="editType=='batchDown'">确认下架所选商品？</p>

      <div v-else class="modal-container">
        <a-card title="商品信息" :bordered="false">
          <a-form>
            <a-row :gutter="24">
              <a-col :md="12" :sm="24">
                <a-form-item label="商品名称" :required="true">
                  <a-input v-model="forms.goodsName" :disabled="editType=='detail'" placeholder="请输入商品名称" />
                </a-form-item>
              </a-col>

              <a-col :md="12" :sm="24">
                <a-form-item label="商品分类" :required="true">
                  <a-cascader v-model="forms.categoryIds" :disabled="editType=='detail'" :options="categoryTreeData" @change="onChangeCategory" expandTrigger="hover" placeholder="请选择商品类目" />
                </a-form-item>
              </a-col>

              <a-col :md="12" :sm="24">
                <a-form-item label="商品条码">
                  <a-input v-model="forms.commodityCode" :disabled="editType=='detail'" placeholder="请输入商品扫描码" />
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
              <a-input :disabled="editType=='detail'" v-model="record.specificationItems" placeholder="请输入规格名称" />
            </template>
            <template slot="purchasingPrice" slot-scope="text, record">
              <a-input type="number" :disabled="editType=='detail'" v-model="record.purchasingPrice" placeholder="请输入规格进价" />
            </template>
            <template slot="descPrice" slot-scope="text, record">
              <a-input type="number" :disabled="editType=='detail'" v-model="record.descPrice" placeholder="请输入规格售价" />
            </template>
            <template slot="number" slot-scope="text, record">
              <a-input type="number" :disabled="editType=='detail'" v-model="record.number" placeholder="请输入规格库存" />
            </template>

            <template slot="itemImages" slot-scope="text, record, index">
              <div class="sku-item-image">
                <a-upload :action="action" :headers="headers" :disabled="editType=='detail'" listType="picture-card" class="avatar-uploader box-upload-sku-item-image" :showUploadList="false" @change="uploadSkuItemImage($event,index)">
                  <img :src="record.itemImages" width="40" />
                </a-upload>
              </div>
            </template>
            <template slot="Action" slot-scope="text, record, index">
              <a @click="removeSkuItem(record,index)">移除</a>
            </template>
          </a-table>
        </a-card>

        <a-card title="商品详情" :bordered="false">
          <quill-editor v-model="forms.virtualGoodsSpec" :options="editorOption" :disabled="editType=='detail'" style="height:450px" ref="myQuillEditor"></quill-editor>
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
  getPlatformGCategoryAll,
  addPlatformEntityGoods,
  getPlatformGoodsList,
  getPlatformGoodsInfo,
  modifyPlatformGoods,
  removePlatformGoods,
  setPlatformGoodsIsMarketable,
  importFile,
  uploadFile
} from '@/api/common'
import { quillEditor, Quill } from 'vue-quill-editor'
import { ImageExtend, QuillWatch } from 'quill-image-extend-module'
Quill.register('modules/ImageExtend', ImageExtend)
const columns = [
  {
    title: '商品条码',
    width: '15%',
    dataIndex: 'commodityCode'
  },

  {
    title: '商品名称',
    width: '20%',
    dataIndex: 'goodsName'
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
    title: '商品售价',
    width: '10%',
    dataIndex: 'salePrice',
    scopedSlots: { customRender: 'salePrice' }
  },

  {
    title: '上下架状态',
    width: '10%',
    dataIndex: 'isMarketable',
    scopedSlots: { customRender: 'isMarketable' }
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
    width: '30%',
    dataIndex: 'specificationItems',
    scopedSlots: { customRender: 'specificationItems' }
  },

  {
    title: '商品进价',
    width: '15%',
    dataIndex: 'purchasingPrice',
    scopedSlots: { customRender: 'purchasingPrice' }
  },

  {
    title: '销售价格',
    width: '15%',
    dataIndex: 'descPrice',
    scopedSlots: { customRender: 'descPrice' }
  },

  {
    title: '销售库存',
    width: '20%',
    dataIndex: 'number',
    scopedSlots: { customRender: 'number' }
  },

  {
    title: '规格图片',
    width: '10%',
    dataIndex: 'itemImages',
    scopedSlots: { customRender: 'itemImages' }
  },
  {
    title: '操作',
    width: '10%',
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
        goodsName: null,
        categoryId: [],
        platformGoodsType: 'physical',
        isMarketable: '',
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

      this.queryParam.goodsName = null
      this.queryParam.categoryId = []
      this.queryParam.isMarketable = ''
      this.queryParam.startTime = ''
      this.queryParam.endTime = ''
    },

    // 查询
    queryGoods() {
      this.currentPage = 1
      this.getEntityGoodsList()
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
            this.getEntityGoodsList()
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
        purchasingPrice: null,
        descPrice: null,
        number: null,
        itemImages: null
      }
      _skuList.push(obj)
    },

    //移除skuitem
    removeSkuItem(record, index) {
      const _skuList = this.skuLoadDatas
      _skuList.splice(index, 1)
      if (this.editType == 'edit')
        if (record.id) {
          this.forms.removeGoodDescIds.push(record.id)
        }
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

    // 操作商品
    handleEntityGoods(e, o, i, t) {
      this.forms = {}
      this.editType = e
      if (this.editType == 'add') {
        this.fileList = []
        this.skuLoadDatas = [
          {
            specificationItems: null,
            purchasingPrice: null,
            descPrice: null,
            number: null,
            itemImages: null
          }
        ]

        this.modalTitle = '新增'
        this.visible = !0
        this.forms = {
          goodsName: null,
          categoryIds: [],
          commodityCode: '',
          image: null,
          virtualGoodsSpec: null,
          isMarketable: 'put'
        }
      } else if (this.editType == 'detail') {
        this.modalTitle = '详情'
        this.getEntityGoodsInfo(o.id)
      } else if (this.editType == 'edit') {
        this.fileList = []

        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择一个编辑项!')
          return false
        } else {
          this.getEntityGoodsInfo()
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
      } else if (this.editType == 'updown') {
        // 指定单个上下架
        this.initSelectedRows()
        this.selectedRows.push(o)
        this.selectedRowKeys.push(i)
        let ud = t ? 'put' : 'out'
        this.setGoodsUpDown(ud)
      } else if (this.editType == 'batchUp') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择上架商品!')
          return false
        } else {
          this.modalTitle = '上架'
          this.visible = !0
        }
      } else if (this.editType == 'batchDown') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择下架商品!')
          return false
        } else {
          this.modalTitle = '下架'
          this.visible = !0
        }
      }
    },

    // 确认
    handleOk() {
      const _type = this.editType
      if (_type == 'delete') {
        this.deletedEntityGoods()
      } else if (_type == 'batchUp' || _type == 'batchDown') {
        this.setGoodsUpDown()
      } else if (_type == 'detail') {
        this.handleCancel()
      } else {
        const flag = this.checkData()
        flag && this.addOrEditEntityGoods()
      }
    },

    // 数据校验
    checkData() {
      let flag = !0
      let reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/
      const _datas = this.forms
      let _skuLoadDatas = [...this.skuLoadDatas]
      if (!_datas.goodsName) {
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
          } else if (!reg.test(_skuLoadDatas[i].purchasingPrice)) {
            flag = !1
            this.$message.warning('请输入有效的商品进价！')
            break
          } else if (!reg.test(_skuLoadDatas[i].descPrice)) {
            flag = !1
            this.$message.warning('请输入有效的商品售价！')
            break
          } else if (!_skuLoadDatas[i].number) {
            flag = !1
            this.$message.warning('请输入有效的商品库存！')
            break
          } else if (!_skuLoadDatas[i].itemImages) {
            flag = !1
            this.$message.warning('请上传规格图片！')
            break
          }
        }
      }
      return flag
    },

    // 添加、修改商品
    addOrEditEntityGoods() {
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
          addPlatformEntityGoods(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getEntityGoodsList()
              } else {
                this.$message.error(res.msg)
              }
            })
            .catch(err => {
              console.log(err)
            })
          break
        case 'edit':
          modifyPlatformGoods(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getEntityGoodsList()
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

    deletedEntityGoods() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      removePlatformGoods(_idsArr).then(res => {
        if (res.code == 0) {
          this.visible = !1
          this.$message.success('删除成功！')
          this.getEntityGoodsList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },

    // 批量商品上下架
    setGoodsUpDown(ud) {
      let _editType = this.editType

      let _ud = _editType == 'batchUp' ? 'put' : _editType == 'batchDown' ? 'out' : ud
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })

      const data = {
        state: _ud,
        idArr: _idsArr
      }
      setPlatformGoodsIsMarketable(data)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('操作成功！')
            this.getEntityGoodsList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 获取商品分类数据
    getEntityCategoryList() {
      getPlatformGCategoryAll({ parentId: null, platformGoodsType: 'physical' })
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

    // 获取商品数据列表
    getEntityGoodsList() {
      this.initSelectedRows()
      const _queryParam = { ...this.queryParam }
      _queryParam.categoryId = _queryParam.categoryId[_queryParam.categoryId.length - 1] || null
      const _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: _queryParam
      }
      getPlatformGoodsList(_data)
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
    getEntityGoodsInfo(id) {
      let _id = null
      if (id) _id = id
      else _id = this.selectedRows[0].id
      getPlatformGoodsInfo(_id)
        .then(res => {
          if (res.code == 0) {
            this.visible = !0
            this.forms = res.result
            const _images = res.result.image.split(',')
            const imageArr = []
            _images.forEach((item, index) => {
              const obj = {}
              obj.url = item
              obj.uid = index
              obj.name = item
              imageArr.push(obj)
            })
            this.fileList = imageArr

            if (res.result.commodityDescModelList.length > 0) {
              this.skuLoadDatas = res.result.commodityDescModelList
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
      this.getEntityGoodsList()
    }
  },
  created() {
    // 列表数据请求
    this.getEntityCategoryList()
    this.getEntityGoodsList()
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
