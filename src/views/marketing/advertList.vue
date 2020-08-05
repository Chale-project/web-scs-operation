<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="广告位编号">
              <a-input v-model="queryParam.advertisingNumber" placeholder="请输入广告位编号" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="广告位名称">
              <a-input v-model="queryParam.advertisingName" placeholder="请输入广告位名称" />
            </a-form-item>
          </a-col>
          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="状态">
                <a-select placeholder="请选择" v-model="queryParam.state">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="enabled">启用</a-select-option>
                  <a-select-option value="disabled">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </template>
          <a-col :md="!advanced && 8 || 24" :sm="24">
            <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
              <a-button type="primary" @click="queryAd">查询</a-button>
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
      <a-button type="primary" icon="plus" @click="modifyAd('add')">新增</a-button>
      <a-button type="primary" icon="edit" @click="modifyAd('edit')">编辑</a-button>
      <a-button type="primary" icon="delete" @click="modifyAd('delete')">删除</a-button>
      <a-dropdown>
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="modifyAd('enabled')">
            <a-icon type="unlock" />启用
          </a-menu-item>
          <a-menu-item key="2" @click="modifyAd('disabled')">
            <a-icon type="lock" />禁用
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          批量操作
          <a-icon type="down" />
        </a-button>
      </a-dropdown>
    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">

      <span slot="state" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">启用</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">禁用</a-tag>
      </span>

      <template slot="Action" slot-scope="text,record,index">
        <span>
          <a href="javascript:;" @click="modifyAd('detail', record)">详情</a>

        </span>
      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="editType=='add'?'75%':editType=='edit'?'75%':editType=='detail'?'75%':'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='delete'">确认删除此项码？</p>
      <p v-else-if="editType=='enabled'">确认启用所选广告位账号吗？</p>
      <p v-else-if="editType=='disabled'">确认禁用所选广告位账号吗？</p>
      <div class="modal-container" v-else>
        <a-form>
          <a-row :gutter="24">

            <a-col :md="12" :sm="24">
              <a-form-item label="广告位编号" :required="true">
                <a-input v-model="forms.advertisingNumber" :placeholder="editType=='detail'?'':'请输入广告位编号（以字母、数字或_连接）'" :disabled="editType=='edit'||editType=='detail'" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="广告位名称" :required="true">
                <a-input v-model="forms.advertisingName" :placeholder="editType=='detail'?'':'请输入广告位名称'" :disabled="editType=='detail'" />
              </a-form-item>
            </a-col>

            <a-col :md="24" :sm="24">
              <a-form-item label="图片上传" :required="true">
                <a-upload :action="action" :headers="headers" :disabled="editType=='detail'" :fileList="fileList" :showUploadList="false" :beforeUpload="beforeUpload" :remove="handleRemove" @change="handleChange">
                  <a-button type="primary">
                    <a-icon type="upload" /> 上传图片
                  </a-button>
                </a-upload>
              </a-form-item>
            </a-col>

            <a-col :md="24" :sm="24">
              <a-table size="small" :columns="filesColumns" :dataSource="filesLoadDatas" :loading="loading" :pagination="pagination" :locale="{emptyText: '没有上传的文件'}">

                <template slot="sort" slot-scope="text, record, index">
                  <a-input-number :disabled="editType=='detail'" :min="1" v-model="record.sort" />
                </template>

                <template slot="linkPath" slot-scope="text, record, index">
                  <a-input v-model="record.linkPath" :disabled="editType=='detail'" placeholder="请输入图片链接" />
                </template>

                <template slot="picPath" slot-scope="record">
                  <img v-if="record" :src="record" style="display: inline-block;width: 100%;">
                  <a-icon v-else type="picture" />
                </template>

                <template slot="Action" slot-scope="text, record, index" v-if="editType=='add'||editType=='edit'">
                  <a @click="removeFile(index)">
                    <a-icon type="delete" /></a>
                </template>

              </a-table>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script>
import Pagination from '@/components/pagination/pagination'
import { addAd, getAdInfo, modifyAd, removeAd, enabledAd, disabledAd, getAdList } from '@/api/common'

const columns = [
  {
    title: '编号',
    width: '20%',
    dataIndex: 'advertisingNumber'
  },
  {
    title: '名称',
    width: '25%',
    dataIndex: 'advertisingName'
  },
  {
    title: '状态',
    width: '15%',
    dataIndex: 'state',
    align: 'center',
    scopedSlots: { customRender: 'state' }
  },
  {
    title: '添加时间',
    width: '20%',
    dataIndex: 'addDataTime',
    align: 'center'
  },
  {
    title: '操作',
    width: '15%',
    dataIndex: 'Action',
    align: 'center',
    scopedSlots: { customRender: 'Action' }
  }
]
const filesColumns = [
  {
    title: '排序',
    width: 100,
    dataIndex: 'sort',
    scopedSlots: { customRender: 'sort' }
  },
  {
    title: '图片外链',
    width: '50%',
    dataIndex: 'linkPath',
    scopedSlots: { customRender: 'linkPath' }
  },
  {
    title: '缩略图',
    width: 60,
    dataIndex: 'picPath',
    align: 'center',
    scopedSlots: { customRender: 'picPath' }
  },

  {
    title: '操作',
    width: '15%',
    align: 'center',
    dataIndex: 'Action',
    scopedSlots: { customRender: 'Action' }
  }
]

export default {
  name: 'AdList',
  components: {
    Pagination
  },
  data() {
    return {
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        advertisingNumber: '',
        advertisingName: null,
        state: ''
      }, // 搜索查询参数

      columns, // 表头
      loadDatas: [], // 表格请求的数据
      pagination: false, // 不显示分页

      // 分页
      pageSizeOptions: ['10', '20', '50', '100'],
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

      action: '/gateway/basic/file/upload',
      headers: { token: this.$ls.get('Access_Token') },

      fileList: [],
      filesColumns,
      filesLoadDatas: [],
      addFilesLoadDatas: [],

      flag: !0
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
    queryAd() {
      this.currentPage = 1
      this.getAdList()
    },

    // 重置
    resetQueryParam() {
      this.queryParam.advertisingNumber = ''
      this.queryParam.advertisingName = null
      this.queryParam.state = ''
    },

    // 选择跟新table中的某项
    updateSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },

    // 取消
    handleCancel() {
      this.visible = !1
    },

    // 确认
    handleOk() {
      const _type = this.editType
      if (_type == 'delete') {
        this.deleteAd()
      } else if (_type == 'reset') {
        this.resetAdPwd()
      } else if (_type == 'init') {
        this.initAdUser()
      } else if (_type == 'enabled') {
        this.enabledAd()
      } else if (_type == 'disabled') {
        this.disabledAd()
      } else if (_type == 'detail') {
        this.handleCancel()
      } else {
        const flag = this.checkData()
        flag && this.addOrEditAd()
      }
    },

    // 新增Or编辑菜单
    modifyAd(e, o, index) {
      this.editType = e
      if (this.editType == 'add') {
        this.modalTitle = '新增'
        this.visible = !0

        this.fileList = []
        this.filesLoadDatas = []

        this.forms = {
          advertisingNumber: '',
          advertisingName: null,
          state: 'enabled',
          files: []
        }
      } else if (this.editType == 'edit') {
        this.fileList = []

        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择一个编辑项！')
          return false
        } else {
          this.modalTitle = '编辑'
          this.getAdInfo()
        }
      } else if (this.editType == 'delete') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择删除项！')
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
      } else if (this.editType == 'detail') {
        this.modalTitle = '详情'
        this.getAdInfo(o.id)
      }
    },

    // 数据校验
    checkData() {
      let flag = !0
      const reg = /^\w+$/
      if (!reg.test(this.forms.advertisingNumber)) {
        flag = !1
        this.$message.warning('请输入有效的广告编号！')
        return false
      } else if (!this.forms.advertisingName) {
        flag = !1
        this.$message.warning('请输入广告名称！')
        return false
      } else if (this.filesLoadDatas.length < 1) {
        flag = !1
        this.$message.warning('请上传广告图片！')
        return false
      } else {
        return flag
      }
    },

    // 文件上传前过滤
    beforeUpload(file) {
      let _flag = !0

      const isJPG = file.type === 'image/jpeg'
      const isGIF = file.type === 'image/gif'
      const isPNG = file.type === 'image/png'
      const isBMP = file.type === 'image/bmp'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG && !isGIF && !isPNG && !isBMP) {
        this.$message.error('上传图片必须是JPG/GIF/PNG/BMP 格式!')
        _flag = !1
      }
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 2MB!')
        _flag = !1
      }

      this.flag = _flag
      return (isJPG || isBMP || isGIF || isPNG) && isLt2M
    },

    handleChange({ file, fileList }) {
      this.fileList = fileList
      if (file.status == 'done') {
        if (!this.flag) this.fileList = []
        const _type = this.editType
        const _filesArrUnFilter = this.fileList.map(item => {
          if (item.response) {
            const obj = {}
            obj.url = item.response.url
            obj.name = item.name
            return obj
          }
        })
        const _filesArr = _filesArrUnFilter.filter(item => {
          return item
        })
        const _Arrfiles = [_filesArr.pop()]
        const _addFilesLoadDatas = this.addFilesLoadDatas

        _Arrfiles.forEach((item, index) => {
          const obj = {}
          if (_type == 'add') {
            obj.picPath = item.url
            obj.linkPath = null
            obj.sort = index
          } else if (_type == 'edit') {
            obj.picPath = item.url
            obj.linkPath = null
            obj.sort = index
          }
          _addFilesLoadDatas.push(obj)
        })
        if (_type == 'add') {
          this.filesLoadDatas = _addFilesLoadDatas
        } else if (_type == 'edit') {
          const oldFilesLoadDatas = [...this.filesLoadDatas]
          const _lastIndex = _addFilesLoadDatas.length
          this.filesLoadDatas = oldFilesLoadDatas.concat(_addFilesLoadDatas[_lastIndex - 1])
        }
      }
    },

    handleRemove(e) {
      console.log(e)
    },

    removeFile(e) {
      const _type = this.editType
      if (_type == 'add') {
        this.fileList.splice(e, 1)
      }
      const _filesLoadDatas = this.filesLoadDatas
      _filesLoadDatas.splice(e, 1)
      this.filesLoadDatas = _filesLoadDatas
    },

    // 添加广告位
    addOrEditAd() {
      const _type = this.editType
      const _filesArr = [...this.filesLoadDatas]
      const _data = { ...this.forms }
      _data.files = _filesArr
      console.log(_data)
      switch (_type) {
        case 'add':
          addAd(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getAdList()
              } else {
                this.$message.error(res.msg)
              }
            })
            .catch(err => {
              console.log(err)
            })
          break
        case 'edit':
          modifyAd(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getAdList()
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

    // 删除广告位
    deleteAd() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      removeAd(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('删除成功！')
            this.getAdList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 启用
    enabledAd() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })

      enabledAd(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('启用成功！')
            this.getAdList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 禁用
    disabledAd() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })

      disabledAd(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('禁用成功！')
            this.getAdList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 获取广告位数据列表
    getAdList() {
      this.initSelectedRows()
      const _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      }
      getAdList(_data)
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

    // 获取广告位信息
    getAdInfo(id) {
      let _id = null
      if (id) _id = id
      else _id = this.selectedRows[0].id
      getAdInfo(_id)
        .then(res => {
          if (res.code == 0) {
            this.visible = !0
            this.forms = res.info
            const _files = res.info.files
            if (_files && _files.length > 0) {
              this.filesLoadDatas = _files
            } else {
              this.filesLoadDatas = []
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
      this.getAdList()
    }
  },
  created() {
    // 列表数据请求
    this.getAdList()
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
/deep/ .ant-table.ant-table-small {
  border: 0;
}
.table-operator {
  margin-bottom: 10px;
}
.ant-pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
