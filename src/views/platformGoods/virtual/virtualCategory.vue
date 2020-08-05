<template>
  <div style="background:#fff ;padding:25px;position: relative">

    <!--功能按钮-->
    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="handleVirtualCategory('add')">添加</a-button>
      <a-button type="primary" icon="edit" @click="handleVirtualCategory('edit')">编辑</a-button>
      <a-button type="primary" icon="delete" @click="handleVirtualCategory('delete')">删除</a-button>
      <a-dropdown>
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="handleVirtualCategory('enabled')">
            <a-icon type="unlock" />启用
          </a-menu-item>
          <a-menu-item key="2" @click="handleVirtualCategory('disabled')">
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
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'radio', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">
      <template slot="categoryLogo" slot-scope="record">
        <img style="width:60px;" :src="record">
      </template>

      <template slot="status" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">启用</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">禁用</a-tag>
      </template>

    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="editType=='edit'?'800px':editType=='add'?'800px':'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='delete'">确认删除所选虚拟商品分类？</p>
      <p v-else-if="editType=='enabled'">确认启用所选虚拟商品分类？</p>
      <p v-else-if="editType=='disabled'">确认禁用所选虚拟商品分类？</p>
      <div class="modal-container" v-else>
        <a-form>
          <a-row :gutter="24">
            <a-col :md="12" :sm="24">
              <a-form-item label="分类名称" :required="true">
                <a-input v-model="forms.categoryName" placeholder="请输入分类名称" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="上级分类" :required="true">
                <a-tree-select :dropdownStyle="{ maxHeight: '400px', overflow: 'auto' }" :treeData="categoryTreeData" treeDefaultExpandAll placeholder='请选择所属上级分类' v-model="forms.parentId" @change="onChangeParentCategory">
                </a-tree-select>
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="分类icon" :required="true">
                <a-upload :action="action" :headers="headers" :showUploadList="false" listType="picture-card" :beforeUpload="beforeUpload" @change="handleChange">
                  <img v-if="forms.categoryLogo" :src="forms.categoryLogo" width="100" />
                  <div v-else>
                    <a-icon :type="imageLoading ? 'loading' : 'plus'" />
                    <div class="ant-upload-text">上传</div>
                  </div>
                </a-upload>
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="分类描述">
                <a-textarea v-model="forms.describe" :rows="5" placeholder="请输入分类描述" />
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
  addPlatformGCategory,
  getPlatformGCategoryList,
  getPlatformGCategoryInfo,
  modifyPlatformGCategory,
  removePlatformGCategory,
  getPlatformGCategoryAll,
  setPlatformGCategoryState,
  uploadFile
} from '@/api/common'

const columns = [
  {
    title: '分类名称',
    width: '20%',
    dataIndex: 'categoryName'
  },
  {
    title: '分类icon',
    width: 100,
    align: 'center',
    dataIndex: 'categoryLogo',
    scopedSlots: { customRender: 'categoryLogo' }
  },
  {
    title: '父级类名',
    width: '20%',
    dataIndex: 'parentName'
  },
  {
    title: '状态',
    width: '20%',
    dataIndex: 'status',
    scopedSlots: { customRender: 'status' }
  }
]

export default {
  name: 'virtualCategory',
  components: {
    Pagination
  },
  data() {
    return {
      advanced: false, // 高级搜索 展开/关闭

      dateTime: [],

      columns, // 表头
      loadDatas: [], // 表格请求的数据
      pagination: false, // 不显示分页

      // 分页
      pageSizeOptions: ['10', '30', '50', '100'],
      currentPage: 1, // 当前的页数
      pageSize: 99999999, // 每页显示的条数
      totalPage: 0, // 总页数
      totalCount: 0, // 总条数
      loading: false,

      selectedRowKeys: [], // 选中行键
      selectedRows: [], // 选中行键值,

      categoryTreeData: [],

      //图片上传
      action: uploadFile,
      headers: { token: this.$ls.get('Access_Token') },
      imageLoading: !1,

      forms: {},
      editType: 'add',
      modalTitle: '新增',
      visible: !1,
      confirmLoading: !1
    }
  },

  methods: {
    initSelectedRows() {
      this.selectedRowKeys = []
      this.selectedRows = []
    },

    // 选择跟新table中的某项
    updateSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },

    // 选择父级分类
    onChangeParentCategory(v) {
      this.forms.parentId = v
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
          this.forms.categoryLogo = imgUrl
        } else {
          this.$message.error('上传失败!')
        }
      }
    },

    // 取消
    handleCancel() {
      this.visible = !1
    },

    // 确认
    handleOk() {
      const _type = this.editType
      if (_type == 'delete') {
        this.deleteVirtualCategory()
      } else if (_type == 'enabled' || _type == 'disabled') {
        this.setVirtualCategoryState()
      } else {
        const flag = this.checkData()
        flag && this.addOrEditVirtualCategory()
      }
    },

    // 操作店铺
    handleVirtualCategory(e, o) {
      this.editType = e
      if (this.editType == 'add') {
        this.modalTitle = '新建'
        this.visible = !0

        this.forms = {
          categoryName: null,
          parentId: '0',
          categoryLogo: null,
          status: 'enabled',
          platformGoodsType: 'virtual',
          describe: ''
        }
      } else if (this.editType == 'edit') {
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择编辑项！')
          return false
        } else {
          this.modalTitle = '编辑'
          this.getVirtualCategoryInfo()
        }
      } else if (this.editType == 'delete') {
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择删除项！')
          return false
        } else {
          this.modalTitle = '删除'
          this.visible = !0
        }
      } else if (this.editType == 'enabled') {
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择启用项！')
          return false
        } else {
          this.modalTitle = '启用'
          this.visible = !0
        }
      } else if (this.editType == 'disabled') {
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择禁用项！')
          return false
        } else {
          this.modalTitle = '禁用'
          this.visible = !0
        }
      }
    },

    // 数据校验
    checkData() {
      if (!this.forms.categoryName) {
        this.$message.warning('请输入分类名称！')
        return false
      } else if (!this.forms.parentId) {
        this.$message.warning('请选择上级分类！')
        return false
      } else if (!this.forms.categoryLogo) {
        this.$message.warning('请上传分类icon！')
        return false
      } else {
        return true
      }
    },

    // 添加店铺
    addOrEditVirtualCategory() {
      const _type = this.editType
      const _data = this.forms

      switch (_type) {
        case 'add':
          addPlatformGCategory(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getVirtualCategory()
                this.getVirtualCategoryList()
              } else {
                this.$message.error(res.msg)
              }
            })
            .catch(err => {
              console.log(err)
            })
          break
        case 'edit':
          modifyPlatformGCategory(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getVirtualCategory()
                this.getVirtualCategoryList()
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

    // 删除
    deleteVirtualCategory() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      removePlatformGCategory(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('删除成功！')
            this.getVirtualCategory()
            this.getVirtualCategoryList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 批量启用禁用
    setVirtualCategoryState() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      const data = {
        idArr: _idsArr,
        state: this.editType == 'enabled' ? 'enabled' : 'disabled'
      }
      setPlatformGCategoryState(data)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('操作成功！')
            this.getVirtualCategory()
            this.getVirtualCategoryList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 构造分类树结构
    toTree(data) {
      var map = {}
      data.forEach(function(item, index) {
        map[item.id] = item
        map[item.id].key = item.id
        map[item.id].value = item.id
        map[item.id].title = item.categoryName
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

    // 获取虚拟商品分类一级分类
    getVirtualCategory() {
      const _data = {
        parentId: '0',
        platformGoodsType: 'virtual'
      }
      getPlatformGCategoryAll(_data)
        .then(res => {
          this.loading = !1
          if (res.code == 0) {
            if (res.result.length > 0) {
              this.setVirtualCategorySelect(res.result)
            } else {
              this.categoryTreeData = [
                {
                  title: '一级分类',
                  value: '0',
                  key: '0'
                }
              ]
            }
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 构造分类选择
    setVirtualCategorySelect(arr) {
      const _pCateList = this.toTrees(arr)
      _pCateList.forEach(pitem => {
        delete pitem.addDataTime
        delete pitem.modifyDataTime
        delete pitem.categoryLogo
        delete pitem.categoryName
        delete pitem.describe
        delete pitem.hasChild
        delete pitem.id
        delete pitem.isDelete
        delete pitem.parentId
        delete pitem.status
        let _cCateList = pitem.children
        _cCateList &&
          _cCateList.forEach(citem => {
            delete pitem.addDataTime
            delete pitem.modifyDataTime
            delete pitem.categoryLogo
            delete pitem.categoryName
            delete pitem.describe
            delete pitem.hasChild
            delete pitem.id
            delete pitem.isDelete
            delete pitem.parentId
            delete pitem.status
          })
      })
      this.categoryTreeData = [
        {
          title: '一级分类',
          value: '0',
          key: '0',
          children: _pCateList
        }
      ]
    },

    // 构造分类树结构
    toTrees(data) {
      var map = {}
      data.forEach(function(item, index) {
        map[item.id] = item
        map[item.id].key = item.id
        map[item.id].value = item.id
        map[item.id].title = item.categoryName
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

    // 获取虚拟商品分类数据列表
    getVirtualCategoryList() {
      this.initSelectedRows()
      const _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: {
          platformGoodsType: 'virtual'
        }
      }
      getPlatformGCategoryList(_data)
        .then(res => {
          this.loading = !1
          if (res.code == 0) {
            this.currentPage = res.page.currentPage
            this.pageSize = res.page.pageSize
            this.totalPage = res.page.totalPage
            this.totalCount = res.page.totalCount
            if (res.page.list.length > 0) {
              this.setVirtualCategoryShow(res.page.list)
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

    // 构造分类展示
    setVirtualCategoryShow(arr) {
      const _categoryList = this.toTree(arr)
      this.loadDatas = _categoryList
    },

    // 获取虚拟商品分类信息
    getVirtualCategoryInfo(id) {
      let _id = null
      if (id) _id = id
      else _id = this.selectedRows[0].id
      getPlatformGCategoryInfo(_id)
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

    // 分页
    changePage(obj) {
      this.currentPage = obj.currentPage
      this.pageSize = obj.pageSize
      this.getVirtualCategoryList()
    }
  },
  created() {
    // 列表数据请求
    this.getVirtualCategory()
    this.getVirtualCategoryList()
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
</style>
