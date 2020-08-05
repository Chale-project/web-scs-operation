<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="商品名称">
              <a-input v-model="queryParam.goodsName" placeholder="请输入商品名称" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="商品类目">
              <a-cascader v-model="queryParam.categoryId" :options="categoryTreeData" @change="onChangeQueryCategory" expandTrigger="hover" placeholder="请选择商品类目" />
            </a-form-item>
          </a-col>
          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="商品编号">
                <a-input v-model="queryParam.goodsId" placeholder="请输入商品编号" />
              </a-form-item>
            </a-col>
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
              <a-button type="primary" @click="queryVirtualGoods">查询</a-button>
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
      <a-button type="primary" icon="plus" @click="handleVirtualGoods('add')">新增</a-button>
      <a-button type="primary" icon="edit" @click="handleVirtualGoods('edit')">编辑</a-button>
      <a-button type="primary" icon="delete" @click="handleVirtualGoods('delete')">删除</a-button>
      <a-dropdown>
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="handleVirtualGoods('batchUp')">
            <a-icon type="upload" />上架
          </a-menu-item>
          <a-menu-item key="2" @click="handleVirtualGoods('batchDown')">
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
      <template slot="goodsImage" slot-scope="record">
        <img style="width:60px;" :src="record">
      </template>
      <template slot="goodsType" slot-scope="record">
        <a-tag v-if="record=='0'">话费</a-tag>
        <a-tag v-else-if="record=='2'">流量</a-tag>
        <a-tag v-else-if="record=='5'">直充</a-tag>
        <a-tag v-else-if="record=='6'">卡密</a-tag>
      </template>
      <template slot="purchasingPrice" slot-scope="record">
        {{record/100}}
      </template>
      <template slot="salePrice" slot-scope="record">
        {{record/100}}
      </template>

      <template slot="isMarketable" slot-scope="text, record, index">
        <div>
          <a-switch checkedChildren="上" unCheckedChildren="下" :checked="text=='put'?true:false" @change="handleVirtualGoods('updown',record,index,$event)" />
        </div>
      </template>

      <template slot="Action" slot-scope="text, record">
        <a @click="handleVirtualGoods('detail', record)">详情</a>
      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="editType=='add'?'70%':editType=='edit'?'70%':editType=='detail'?'70%':editType=='delete'?'400px':'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
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
                <a-form-item label="商品类型" :required="true">
                  <a-radio-group v-model="forms.goodsType" :disabled="editType=='detail'" @change="onChangeGoodsType">
                    <a-radio value="0">话费</a-radio>
                    <a-radio value="2">流量</a-radio>
                    <a-radio value="5">直充</a-radio>
                    <a-radio value="6">卡密</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>
              <a-col :md="12" :sm="24" v-if="forms.goodsType=='0'||forms.goodsType=='2'">
                <a-form-item label="所属运营商" :required="true">
                  <a-radio-group v-model="forms.operation" :disabled="editType=='detail'">
                    <a-radio :value="0">中国联通</a-radio>
                    <a-radio :value="1">中国移动</a-radio>
                    <a-radio :value="2">中国电信</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>

              <a-col :md="12" :sm="24">
                <a-form-item label="商品编号">
                  <a-input type="number" v-model="forms.goodsId" :disabled="editType=='detail'" placeholder="请输入商品编号" />
                </a-form-item>
              </a-col>

              <a-col :md="12" :sm="24" v-if="forms.goodsType=='2'">
                <a-form-item label="流量值" :required="true">
                  <a-select v-model="forms.flowSize" :disabled="editType=='detail'" placeholder="请选择">
                    <template v-if="forms.operation==0">
                      <a-select-option :value="l" v-for="(l,t) of llLFlowSizeList" :key="t">{{l}}</a-select-option>
                    </template>
                    <template v-else-if="forms.operation==1">
                      <a-select-option :value="y" v-for="(y,d) of llYFlowSizeList" :key="d">{{y}}</a-select-option>
                    </template> <template v-else-if="forms.operation==2">
                      <a-select-option :value="d" v-for="(d,x) of llDFlowSizeList" :key="x">{{d}}</a-select-option>
                    </template>
                  </a-select>
                </a-form-item>
              </a-col>

              <a-col :md="12" :sm="24">
                <a-form-item label="商品面值" :required="true">
                  <a-input type="number" v-model="forms.faceValue" :disabled="editType=='detail'" addonAfter="元" placeholder="请输入商品面值" />
                </a-form-item>
              </a-col>

              <a-col :md="12" :sm="24">
                <a-form-item label="商品售价" :required="true">
                  <a-input type="number" v-model="forms.salePrice" :disabled="editType=='detail'" addonAfter="元" placeholder="请输入商品售价" />
                </a-form-item>
              </a-col>

              <a-col :md="12" :sm="24">
                <a-form-item label="商品进价" :required="true">
                  <a-input type="number" v-model="forms.purchasingPrice" :disabled="editType=='detail'" addonAfter="元" placeholder="请输入商品进价" />
                </a-form-item>
              </a-col>

            </a-row>
          </a-form>
        </a-card>

        <a-card title="商品图片" :bordered="false" :required="true">
          <div class="clearfix">
            <a-upload :action="action" :headers="headers" :disabled="editType=='detail'" :showUploadList="false" listType="picture-card" :beforeUpload="beforeUpload" @change="handleChange">
              <img v-if="forms.goodsImage" :src="forms.goodsImage" width="100" />
              <div v-else>
                <a-icon :type="imageLoading ? 'loading' : 'plus'" />
                <div class="ant-upload-text">上传</div>
              </div>
            </a-upload>
          </div>
        </a-card>

        <a-card title="商品详情" :bordered="false">
          <quill-editor v-model="forms.virtualGoodsSpec" :options="editorOption" :disabled="editType=='detail'" style="height:200px" ref="myQuillEditor"></quill-editor>
        </a-card>

      </div>
    </a-modal>

  </div>
</template>

<script>
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import Pagination from '@/components/pagination/pagination'
import {
  addPlatformVirtualGoods,
  getPlatformGoodsList,
  getPlatformGoodsInfo,
  modifyPlatformGoods,
  removePlatformGoods,
  getPlatformGCategoryAll,
  setPlatformGoodsIsMarketable,
  uploadFile
} from '@/api/common'
import { quillEditor, Quill } from 'vue-quill-editor'
import { ImageExtend, QuillWatch } from 'quill-image-extend-module'
Quill.register('modules/ImageExtend', ImageExtend)
const columns = [
  {
    title: '商品名称',
    width: '20%',
    dataIndex: 'goodsName'
  },
  {
    title: '商品图片',
    width: 100,
    dataIndex: 'goodsImage',
    scopedSlots: { customRender: 'goodsImage' }
  },
  {
    title: '商品编号',
    width: '10%',
    dataIndex: 'goodsId'
  },
  {
    title: '所属分类',
    width: '18%',
    dataIndex: 'categoryNames'
  },
  {
    title: '商品类型',
    width: '10%',
    dataIndex: 'goodsType',
    scopedSlots: { customRender: 'goodsType' }
  },
  {
    title: '商品进价',
    width: '10%',
    dataIndex: 'purchasingPrice',
    scopedSlots: { customRender: 'purchasingPrice' }
  },
  {
    title: '商品售价',
    width: '10%',
    dataIndex: 'salePrice',
    scopedSlots: { customRender: 'salePrice' }
  },
  {
    title: '上下架状态',
    width: '12%',
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

const llLFlowSizeList = ['20M', '30M', '50M', '100M', '200M', '300M', '500M', '1G']
const llYFlowSizeList = ['10M', '20M', '30M', '50M', '100M', '200M', '500M', '1G', '2G', '3G', '4G', '6G', '11G']
const llDFlowSizeList = ['5M', '10M', '30M', '50M', '100M', '200M', '500M', '1G']
export default {
  name: 'virtualList',
  components: {
    Pagination,
    quillEditor
  },
  data() {
    return {
      llLFlowSizeList,
      llYFlowSizeList,
      llDFlowSizeList,
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        // 搜索查询参数
        goodsName: null,
        categoryId: [],
        goodsId: null,
        platformGoodsType: 'virtual',
        isMarketable: ''
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
      categoryTreeData: [], // 商品分类树结构数据

      editType: 'add',
      modalTitle: '新增',
      visible: !1,
      confirmLoading: !1,

      action: uploadFile,
      headers: { token: this.$ls.get('Access_Token') },
      imageLoading: !1,

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
      this.queryParam.goodsId = null
      this.queryParam.isMarketable = ''
      this.queryParam.startTime = ''
      this.queryParam.endTime = ''
    },

    // 查询
    queryVirtualGoods() {
      this.getVirtualGoodsList()
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

    // 选择商品类型
    onChangeGoodsType(e) {
      const _type = e.target.value
      if (_type == '5' || _type == '6') {
        this.forms.operation = null
        this.forms.flowSize = null
      }
      if (_type == '0' || _type == '5' || _type == '6') {
        this.forms.flowSize = null
      }
    },

    //文件上传前过滤
    beforeUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isGIF = file.type === 'image/gif'
      const isPNG = file.type === 'image/png'
      const isBMP = file.type === 'image/bmp'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG && !isGIF && !isPNG && !isBMP) {
        this.$message.warning('上传图片必须是JPG/GIF/PNG/BMP 格式!')
      }
      if (!isLt2M) {
        this.$message.warning('上传图片大小不能超过 2MB!')
      }

      return (isJPG || isBMP || isGIF || isPNG) && isLt2M
    },

    //上传后回调
    handleChange(info) {
      if (info.file.status === 'uploading') {
        this.imageLoading = !0
        return
      }
      if (info.file.status == 'done') {
        this.imageLoading = !1
        if (info.file.response.code == 0) {
          const imgUrl = info.file.response.url
          this.forms.goodsImage = imgUrl
        } else {
          this.$message.error('上传失败!')
        }
      }
    },

    // 取消
    handleCancel() {
      this.visible = !1
    },

    // 操作商品
    handleVirtualGoods(e, o, i, t) {
      this.forms = {}
      this.editType = e
      if (this.editType == 'add') {
        this.modalTitle = '新增'
        this.visible = !0
        this.forms = {
          goodsName: null,
          categoryIds: [],
          goodsImage: null,
          goodsType: null,
          goodsId: null,
          faceValue: null,
          salePrice: null,
          purchasingPrice: null,
          flowSize: null,
          operation: null,
          virtualGoodsSpec: null,
          isMarketable: 'put'
        }
      } else if (this.editType == 'detail') {
        this.modalTitle = '详情'
        this.getVirtualGoodsInfo(o.id)
      } else if (this.editType == 'edit') {
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择一个编辑项!')
          return false
        } else {
          this.getVirtualGoodsInfo()
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
        this.deletedVirtualGoods()
      } else if (_type == 'detail') {
        this.handleCancel()
      } else if (_type == 'batchUp' || _type == 'batchDown') {
        this.setGoodsUpDown()
      } else {
        const flag = this.checkData()
        flag && this.addOrEditVirtualGoods()
      }
    },

    // 数据校验
    checkData() {
      let flag = !0
      let reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/
      const _datas = this.forms
      if (!_datas.goodsName) {
        flag = !1
        this.$message.warning('请输入商品名称！')
        return false
      } else if (_datas.categoryIds.length < 1) {
        flag = !1
        this.$message.warning('请选择商品分类！')
        return false
      }
      if (!_datas.goodsType) {
        flag = !1
        this.$message.warning('请选择商品类型！')
        return false
      } else {
        if (_datas.goodsType == '0') {
          if (_datas.operation == null) {
            flag = !1
            this.$message.warning('请选择运营商！')
            return false
          }
        } else if (_datas.goodsType == '2') {
          if (_datas.operation == null) {
            flag = !1
            this.$message.warning('请选择运营商！')
            return false
          }
          if (!_datas.flowSize) {
            flag = !1
            this.$message.warning('请选择流量值！')
            return false
          }
        }
      }
      if (!reg.test(_datas.faceValue)) {
        flag = !1
        this.$message.warning('请输入有效的商品面值！')
        return false
      }
      if (!reg.test(_datas.salePrice)) {
        flag = !1
        this.$message.warning('请输入有效的商品售价！')
        return false
      }
      if (!reg.test(_datas.purchasingPrice)) {
        flag = !1
        this.$message.warning('请输入有效的商品进价！')
        return false
      }
      if (!_datas.goodsImage) {
        flag = !1
        this.$message.warning('请上传商品图片！')
        return false
      }
      return flag
    },

    // 添加、修改商品
    addOrEditVirtualGoods() {
      const _type = this.editType

      const _data = { ...this.forms }

      switch (_type) {
        case 'add':
          addPlatformVirtualGoods(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getVirtualGoodsList()
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
                this.getVirtualGoodsList()
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

    deletedVirtualGoods() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      removePlatformGoods(_idsArr).then(res => {
        if (res.code == 0) {
          this.visible = !1
          this.$message.success('删除成功！')
          this.getVirtualGoodsList()
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
            this.getVirtualGoodsList()
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
      getPlatformGCategoryAll({ parentId: null, platformGoodsType: 'virtual' })
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
    getVirtualGoodsList() {
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
    getVirtualGoodsInfo(id) {
      let _id = null
      if (id) _id = id
      else _id = this.selectedRows[0].id
      getPlatformGoodsInfo(_id)
        .then(res => {
          if (res.code == 0) {
            this.visible = !0
            const _info = res.result
            if (_info.flowSize != null) {
              if (_info.flowSize % 1024 == 0) _info.flowSize = _info.flowSize / 1024 + 'G'
              else _info.flowSize = _info.flowSize + 'M'
            }
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
      this.getVirtualGoodsList()
    }
  },
  created() {
    // 列表数据请求
    this.geCategoryList()
    this.getVirtualGoodsList()
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
