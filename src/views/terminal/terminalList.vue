<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="终端编号">
              <a-input v-model="queryParam.terminalNumber" placeholder="请输入终端编号" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="商户门店">
              <a-cascader v-model="queryParam.merchantShopId" :options="merchantShopData" @change="onChangeQueryMerchantShop" expandTrigger="hover" placeholder="请选择商户门店" />
            </a-form-item>
          </a-col>

          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="终端类型">
                <a-select placeholder="请选择" v-model="queryParam.terminalType">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="polymerization">静态台卡</a-select-option>
                  <a-select-option value="trumpet">云喇叭</a-select-option>
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
              <a-button type="primary" @click="queryTerminal">查询</a-button>
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
      <a-button type="primary" icon="plus" @click="handleTerminal('add')">新增终端绑定</a-button>
      <a-button type="primary" icon="edit" @click="handleTerminal('edit')">编辑</a-button>
      <!-- <a-button type="primary" icon="delete" @click="handleTerminal('delete')">删除</a-button> -->

    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">
      <template slot="terminalType" slot-scope="record">
        <a-tag v-if="record=='polymerization'">静态台卡</a-tag>
        <a-tag v-else-if="record=='trumpet'">云喇叭</a-tag>
      </template>

    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="editType=='delete'?'400px':'800px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='delete'">确认删除所选终端？</p>

      <div v-else class="modal-container">

        <a-form>
          <a-row :gutter="24">

            <a-col :md="12" :sm="24">
              <a-form-item label="所属商户/店铺" :required="true">
                <a-cascader v-model="forms.mchShopIds" :disabled="editType=='edit'||editType=='detail'" :options="merchantShopData" @change="onChangeMerchantShop" expandTrigger="hover" placeholder="请选择所属商户/店铺" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="终端类型" :required="true">
                <a-select v-model="forms.terminalType" :disabled="editType=='edit'||editType=='detail'" placeholder="请选择">
                  <a-select-option value="polymerization">静态台卡</a-select-option>
                  <a-select-option value="trumpet">云喇叭</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="终端编号" :required="true">
                <a-input v-model="forms.terminalNumber" :disabled="editType=='detail'" placeholder="请输入终端编号" />
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
  bindTerminal,
  getTerminalInfo,
  getTerminalList,
  modifyTerminal,
  removeTerminal,
  getMerchantShopAll,
  uploadFile
} from '@/api/common'

const columns = [
  {
    title: '终端编号',
    width: '30%',
    dataIndex: 'terminalNumber'
  },

  {
    title: '所属商户',
    width: '20%',
    dataIndex: 'mchName'
  },

  {
    title: '所属店铺',
    width: '20%',
    dataIndex: 'shopName'
  },

  {
    title: '终端类型',
    width: '20%',
    dataIndex: 'terminalType',
    scopedSlots: { customRender: 'terminalType' }
  }
]

export default {
  name: 'terminalList',
  components: {
    Pagination
  },
  data() {
    return {
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        // 搜索查询参数
        terminalNumber: null,
        merchantShopId: [],
        terminalType: '',
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

      forms: {},
      merchantShopData: [], // 终端分类树结构数据

      editType: 'add',
      modalTitle: '新增',
      visible: !1,
      confirmLoading: !1,

      action: uploadFile,
      headers: { token: this.$ls.get('Access_Token') },
      imageLoading: !1
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

    onChangeQueryMerchantShop(e) {
      console.log(e)
    },

    // 重置
    resetQueryParam() {
      this.dateTime = []

      this.queryParam.terminalNumber = null
      this.queryParam.merchantShopId = []
      this.queryParam.terminalType = ''
      this.queryParam.startTime = ''
      this.queryParam.endTime = ''
    },

    // 查询
    queryTerminal() {
      this.getTerminalList()
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

    // 选择终端分类
    onChangeMerchantShop(e) {
      console.log(e)
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
          this.forms.terminalImage = imgUrl
        } else {
          this.$message.error('上传失败!')
        }
      }
    },

    // 取消
    handleCancel() {
      this.visible = !1
    },

    // 操作商户
    handleTerminal(e, o) {
      this.forms = {}
      this.editType = e
      if (this.editType == 'add') {
        this.modalTitle = '新增'
        this.visible = !0
        this.forms = {
          mchShopIds: [],
          terminalType: 'polymerization',
          terminalNumber: null
        }
      } else if (this.editType == 'detail') {
        this.modalTitle = '详情'
        this.getTerminalInfo(o.id)
      } else if (this.editType == 'edit') {
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择一个编辑项!')
          return false
        } else {
          this.getTerminalInfo()
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
      }
    },

    // 确认
    handleOk() {
      const _type = this.editType
      if (_type == 'delete') {
        this.deletedTerminal()
      } else if (_type == 'detail') {
        this.handleCancel()
      } else {
        const flag = this.checkData()
        flag && this.addOrEditTerminal()
      }
    },

    // 数据校验
    checkData() {
      let flag = !0
      const _datas = this.forms
      if (_datas.mchShopIds.length < 1) {
        flag = !1
        this.$message.warning('请选择终端所属商户店铺！')
        return false
      }
      if (!_datas.terminalType) {
        flag = !1
        this.$message.warning('请选择终端类型！')
        return false
      }

      if (!_datas.terminalNumber) {
        flag = !1
        this.$message.warning('请输入终端编号！')
        return false
      }

      return flag
    },

    // 添加、修改终端
    addOrEditTerminal() {
      const _type = this.editType

      const _data = { ...this.forms }
      _data.mchNo = _data.mchShopIds[0]
      _data.shopId = _data.mchShopIds[1]
      switch (_type) {
        case 'add':
          bindTerminal(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getTerminalList()
              } else {
                this.$message.error(res.msg)
              }
            })
            .catch(err => {
              console.log(err)
            })
          break
        case 'edit':
          modifyTerminal(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getTerminalList()
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

    deletedTerminal() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      removeTerminal(_idsArr).then(res => {
        if (res.code == 0) {
          this.visible = !1
          this.$message.success('删除成功！')
          this.getTerminalList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },

    // 获取终端分类数据
    geMerchantShopList() {
      getMerchantShopAll({ parentId: null })
        .then(res => {
          this.loading = !1
          if (res.code == 0) {
            if (res.result.length > 0) {
              const _listArr = res.result
              this.merchantShopData = _listArr
            } else {
              this.merchantShopData = []
            }
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 获取终端数据列表
    getTerminalList() {
      this.initSelectedRows()
      const _queryParam = { ...this.queryParam }
      _queryParam.merchantShopId = _queryParam.merchantShopId[_queryParam.merchantShopId.length - 1] || null
      const _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: _queryParam
      }
      getTerminalList(_data)
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

    // 获取终端信息
    getTerminalInfo(id) {
      let _id = null
      if (id) _id = id
      else _id = this.selectedRows[0].id
      getTerminalInfo(_id)
        .then(res => {
          if (res.code == 0) {
            this.visible = !0
            const _info = res.result
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
      this.getTerminalList()
    }
  },
  created() {
    // 列表数据请求
    this.geMerchantShopList()
    this.getTerminalList()
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
