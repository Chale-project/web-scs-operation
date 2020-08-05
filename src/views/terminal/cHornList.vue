<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="喇叭名称">
              <a-input v-model="queryParam.title" placeholder="喇叭名称" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="喇叭品牌">
              <a-input v-model="queryParam.brand" placeholder="喇叭品牌" />
            </a-form-item>
          </a-col>

          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="使用状态">
                <a-select placeholder="请选择" v-model="queryParam.state">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="not">未使用</a-select-option>
                  <a-select-option value="pass">已使用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </template>
          <a-col :md="!advanced && 8 || 24" :sm="24">
            <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
              <a-button type="primary" @click="queryTCard">查询</a-button>
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
      <a-button type="primary" icon="plus" @click="handleTCard('add')">导入喇叭</a-button>
    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">
      <template slot="polymerizationUrl" slot-scope="record">
        <template v-if="record">
          <img :src="record" @click="handleImgPreview(record)" style="width:60px;">
        </template>
        <template v-else>
          <a-tag>未关联</a-tag>
        </template>
      </template>

      <template slot="state" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">未使用</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">已使用</a-tag>
      </template>

    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="editType=='add'?'400px':'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <div class="modal-container">
        <a-form>
          <a-row :gutter="24">
            <a-col :md="24" :sm="24">
              <a-form-item label="生成聚合码数量" :required="true">
                <a-input type="number" v-model="forms.number" addonAfter="个" placeholder="请输入一次性生成聚合码数量" />
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
import Pagination from '@/components/pagination/pagination'

import { addTCard, getTrumpetList } from '@/api/common'

const columns = [
  {
    title: '喇叭名称',
    width: '15%',
    dataIndex: 'title'
  },

  {
    title: '品牌',
    width: '10%',
    dataIndex: 'brand',
    scopedSlots: { customRender: '' }
  },
	{
    title: '型号',
    width: '10%',
    dataIndex: 'modelNumber'
 },
  {
    title: '设备序列号',
    width: '15%',
    dataIndex: 'serialNumber'
  },
  {
    title: '使用店铺',
    width: '15%',
    dataIndex: 'shopName'
  },

  {
    title: '使用状态',
    width: '10%',
    dataIndex: 'state',
    scopedSlots: { customRender: 'state' }
  },
  {
    title: '创建时间',
    width: '10%',
    align: 'center',
    dataIndex: 'addDataTime'
  }
]

export default {
  name: 'TCard',
  components: {
    Pagination
  },
  data() {
    return {
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        polymerizationCode: null,
        shopName: null,
        state: ''
      }, // 搜索查询参数

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

      forms: {},
      editType: 'add',
      modalTitle: '新增',
      visible: !1,
      confirmLoading: !1,

      //查看收款码
      previewVisible: !1,
      previewImage: ''
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

    // 查询
    queryTCard() {
      this.getTrumpetList()
    },

    // 重置
    resetQueryParam() {
      this.queryParam.polymerizationCode = null
      this.queryParam.shopName = null
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
      this.previewImage = e
      this.previewVisible = !0
    },

    // 取消
    handleCancel() {
      this.visible = !1
    },

    // 确认
    handleOk() {
      const _type = this.editType
      if (_type == 'detail') {
        this.handleCancel()
      } else {
        const flag = this.checkData()
        flag && this.addOrEditTCard()
      }
    },

    // 操作业务员
    handleTCard(e, o) {
      this.editType = e
      if (this.editType == 'add') {
        this.modalTitle = '新增'
        this.visible = !0
        this.forms = {
          number: null,
          state: 'disabled'
        }
      } else if (this.editType == 'detail') {
        this.modalTitle = '详情'
        this.getTCardInfo(o.id)
      }
    },

    // 数据校验
    checkData() {
      let flag = !0
      const _formsData = this.forms
      const number = /^\d+$/
      if (!number.test(_formsData.number)) {
        flag = !1
        this.$message.warning('请输入有效的生成数量！')
        return false
      }
      return flag
    },

    // 添加编辑
    addOrEditTCard() {
      const _type = this.editType
      const _data = this.forms
      switch (_type) {
        case 'add':
          addTCard(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getTrumpetList()
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

    // 获取业务员数据列表
    getTrumpetList() {
      this.initSelectedRows()

      const _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      }
      getTrumpetList(_data)
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

    // 分页
    changePage(obj) {
      this.currentPage = obj.currentPage
      this.pageSize = obj.pageSize
      this.getTrumpetList()
    }
  },
  created() {
    // 列表数据请求
    this.getTrumpetList()
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
  max-height: 600px;
  padding: 0 12px;
  overflow-y: auto;
}
.no-data {
  color: #999;
}
/deep/ .quill-editor:not(.bubble) .ql-container,
.quill-editor:not(.bubble) .ql-container .ql-editor {
  height: 80px;
}
</style>
