<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <!--功能按钮-->
    <div class="table-operator" style="margin-bottom:50px;">
      <a-upload :action="actionFile" accept=".csv" :fileList="fileCsvList" :headers="headers" :data="{shopId: shopId}" :showUploadList="false" :beforeUpload="beforeCsvUpload" :remove="handleCsvRemove" @change="handleCsvChange">
        <a-button type="primary">
          <a-icon type="upload" /> 为店铺导入商品
        </a-button>
      </a-upload>
    </div>

    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="商品名称">
              <a-input v-model="queryParam.title" placeholder="商品名称" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="商品条码">
              <a-input v-model="queryParam.shapeCode" placeholder="商品条码" />
            </a-form-item>
          </a-col>
          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="商品类目">
                <a-cascader v-model="queryParam.categoryId" :options="categoryTreeData" @change="onChangeQueryCategory" expandTrigger="hover" placeholder="请选择商品类目" />
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

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">
      <template slot="coverImage" slot-scope="record">
        <img style="width:60px;" :src="record">
      </template>

      <template slot="suggestedPrice" slot-scope="text, record">
        <a-input type="number" v-model="record.suggestedPrice" placeholder="售价最多支持小数后两位" />
      </template>

      <template slot="stock" slot-scope="text, record">
        <a-input type="number" v-model="record.stock" placeholder="库存至少1件" />
      </template>

      <template slot="Action" slot-scope="text, record, index">
        <a @click="handleGoods('detail', record)">详情</a>
      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="editType=='detail'?'80%':'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">

      <div class="modal-container">
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
                  <a-input v-model="forms.shapeCode" :disabled="editType=='detail'" placeholder="请输入商品商品条码" />
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
            <template slot="specificationItems" slot-scope="text, record, index">
              <a-input :disabled="editType=='detail'" v-model="record.specificationItems" />
            </template>
            <template slot="descPrice" slot-scope="text, record, index">
              <a-input type="number" :disabled="editType=='detail'" v-model="record.descPrice" />
            </template>

            <template slot="itemImages" slot-scope="text, record, index">
              <div class="sku-item-image">
                <a-upload :action="action" :headers="headers" :disabled="editType=='detail'" listType="picture-card" class="avatar-uploader box-upload-sku-item-image" :showUploadList="false" @change="uploadSkuItemImage($event,index)">
                  <img :src="record.itemImages" width="40" />
                </a-upload>
              </div>
            </template>
            <template slot="Action" slot-scope="text, record, index">
              <a @click="removeSkuItem(index)" :disabled="editType=='detail'">移除</a>
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

    <div class="but-step">
      <a-button @click="prevStep">上一步</a-button>
      <a-button style="margin-left: 10px" type="primary" @click="nextStep">下一步</a-button>
    </div>

  </div>
</template>


<script>
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import Pagination from '@/components/pagination/pagination'
import { getGoodsCategory, getCanImprotGoods, getGoodsInfo, uploadFile, importShopGoodsFile } from '@/api/common'
import { quillEditor, Quill } from 'vue-quill-editor'
import { ImageExtend, QuillWatch } from 'quill-image-extend-module'
Quill.register('modules/ImageExtend', ImageExtend)
const columns = [
  {
    title: '标题',
    width: '20%',
    dataIndex: 'title'
  },

  {
    title: '商品图片',
    width: 80,
    dataIndex: 'coverImage',
    align: 'center',
    scopedSlots: { customRender: 'coverImage' }
  },

  {
    title: '所属分类',
    width: '15%',
    dataIndex: 'categoryNames'
  },

  {
    title: '建议零售价',
    width: '15%',
    dataIndex: 'suggestedPrice',
    scopedSlots: { customRender: 'suggestedPrice' }
  },

  {
    title: '库存',
    width: '10%',
    dataIndex: 'stock',
    scopedSlots: { customRender: 'stock' }
  },

  {
    title: '商品条码',
    width: '10%',
    dataIndex: 'shapeCode'
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
    width: '50%',
    dataIndex: 'specificationItems',
    scopedSlots: { customRender: 'specificationItems' }
  },

  {
    title: '销售价格',
    width: '20%',
    dataIndex: 'descPrice',
    scopedSlots: { customRender: 'descPrice' }
  },

  {
    title: '规格图片',
    width: '10%',
    dataIndex: 'itemImages',
    scopedSlots: { customRender: 'itemImages' }
  },
  {
    title: '操作',
    width: '20%',
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
  name: 'stepB',
  components: {
    Pagination,
    quillEditor
  },
  props: {
    shopId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      labelCol: { lg: { span: 5 }, sm: { span: 5 } },
      wrapperCol: { lg: { span: 19 }, sm: { span: 19 } },

      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        // 搜索查询参数
        title: null,
        shapeCode: null,
        categoryId: []
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

      actionFile: importShopGoodsFile,
      fileCsvList: [],

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
    // 导入Csv文件
    // 文件上传前过滤
    beforeCsvUpload(file) {
      let _flag = !0
      const isCsv =
        file.type === 'application/vnd.ms-excel' ||
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      const isLt3M = file.size / 1024 / 1024 < 3

      if (!isCsv) {
        this.$message.error('上传文件格式必须是 excel文件!')
        _flag = !1
      }
      if (!isLt3M) {
        this.$message.error('上传文件大小不能超过 3MB!')
        _flag = !1
      }

      return isCsv && isLt3M
    },

    handleCsvRemove(e) {
      console.log(e)
    },

    // 导入商品
    handleCsvChange({ file, fileList }) {
      this.fileCsvList = fileList
      if (file.status == 'done') {
        if (file.response) {
          if (file.response.code == 0) {
            this.$message.success('导入成功！')
          } else {
            this.$message.error(file.response.msg)
          }
        }
      }
    },

    //上一步
    prevStep() {
      this.$emit('prevStep')
    },

    //下一步
    nextStep() {
      if (this.selectedRows.length < 1) {
        this.$message.warning('请选择要导入的商品！')
        return
      }
      const _flag = this.checkGoodsPriceStock()
      _flag && this.$emit('nextStep', this.selectedRows)
    },

    //校验价格
    checkGoodsPriceStock() {
      let flag = !0
      const selectedgoodsList = [...this.selectedRows]
      const moneyReg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/
      for (const i in selectedgoodsList) {
        if (!moneyReg.test(selectedgoodsList[i].suggestedPrice)) {
          flag = !1
          this.$message.warning('请输入有效的商品售价！')
          break
        } else if (selectedgoodsList[i].stock < 1) {
          flag = !1
          this.$message.warning('商品库存至少1件！')
          break
        }
      }
      return flag
    },

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

    // 操作商户 detail、edit、enabled、disabled
    handleGoods(e, o) {
      this.forms = {}
      this.editType = e
      if (this.editType == 'detail') {
        this.modalTitle = '详情'
        this.getGoodsInfo(o.id)
      }
    },

    // 确认
    handleOk() {
      const _type = this.editType
      if (_type == 'detail') {
        this.handleCancel()
      }
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
      _queryParam.shopId = this.shopId
      _queryParam.categoryId = _queryParam.categoryId[_queryParam.categoryId.length - 1] || null
      const _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: _queryParam
      }
      getCanImprotGoods(_data)
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
/deep/ .ant-pagination {
  position: relative;
  text-align: center;
}

.but-step {
  position: fixed;
  width: calc(100% - 265px);
  right: 0;
  bottom: 0;
  padding: 25px 15px;
  text-align: center;
  background: #fff;
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
