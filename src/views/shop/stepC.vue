<template>
  <div>
    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="categoryTreeData" :loading="loading" :pagination="pagination" :defaultExpandAllRows="defaultExpandAllRows" :rowSelection="{type:'radio', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">

    </a-table>

    <div class="but-step">
      <a-button @click="prevStep">上一步</a-button>
      <a-button style="margin-left: 10px" type="primary" @click="submitImport">提交</a-button>
    </div>

  </div>
</template>

<script>
import { getShopCategory } from '@/api/common'
const columns = [
  {
    title: '分类名',
    width: '20%',
    dataIndex: 'name'
  },

  {
    title: '已有商品数',
    width: '20%',
    dataIndex: 'goodsNumber',
    align: 'center'
  }
]

export default {
  name: 'stepC',
  components: {},
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

      columns, // 表头
      categoryTreeData: [], // 表格请求的数据
      pagination: false, // 不显示分页
      // 分页
      loading: false,
      defaultExpandAllRows: !1,
      selectedRowKeys: [], // 选中行键
      selectedRows: [] // 选中行键值,
    }
  },
  methods: {
    //上一步
    prevStep() {
      this.$emit('prevStep')
    },

    submitImport() {
      if (this.selectedRows.length < 1) {
        this.$message.warning('请选择要导入到那个分类下！')
        return
      }
      this.$emit('import', this.selectedRows)
    },

    initSelectedRows() {
      this.selectedRowKeys = []
      this.selectedRows = []
    },
    // 选择跟新table中的某项
    updateSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },

    // 获取商品分类数据
    geCategoryList() {
      getShopCategory(this.shopId)
        .then(res => {
          this.loading = !1
          if (res.code == 0) {
            const _listArr = res.list
            if (_listArr.length > 0) {
              this.categoryTreeData = _listArr
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

    // 分页
    changePage(obj) {
      this.currentPage = obj.currentPage
      this.pageSize = obj.pageSize
      this.geCategoryList()
    }
  },

  mounted() {
    // 列表数据请求
    this.geCategoryList()
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
/deep/ .record {
  bottom: 92px;
}

.but-step {
  margin-top: 30px;
  text-align: center;
}
.modal-container {
  max-height: 650px;
  padding: 0 12px;
  overflow-y: auto;
}
</style>