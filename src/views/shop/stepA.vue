<template>
  <div>
    <a-form style="max-width: 500px; margin: 40px auto 0;">
      <a-form-item label="选择店铺" :labelCol="labelCol" :wrapperCol="wrapperCol" :required="true">
        <a-select placeholder="请选择店铺" v-model="shopId" @change="onChangeShop" @popupScroll="scrollShopLoading">
          <a-select-option value="" disabled>请选择店铺</a-select-option>
          <a-select-option :value="v.shopId" v-for="(v,i) of shopList" :key="i">{{v.shopName}}</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item :wrapperCol="{span: 19, offset: 5}">
        <a-button type="primary" @click="nextStep">下一步</a-button>
      </a-form-item>
    </a-form>
    <a-divider />

  </div>
</template>

<script>
import { getShopList } from '@/api/common'
export default {
  name: 'stepA',

  data() {
    return {
      labelCol: { lg: { span: 5 }, sm: { span: 5 } },
      wrapperCol: { lg: { span: 19 }, sm: { span: 19 } },

      currentPage: 1, // 当前的页数
      pageSize: 10, // 每页显示的条数
      totalPage: 0, // 总页数
      totalCount: 0, // 总条数
      shopList: [],
      shopId: ''
    }
  },
  methods: {
    nextStep() {
      if (!this.shopId) {
        this.$message.warning('请选择店铺！')
        return
      }
      // 先校验，通过表单校验后，才进入下一步
      this.$emit('nextStep', this.shopId)
    },

    //选择店铺
    onChangeShop(e) {},

    // 获取店铺数据列表
    getShopList() {
      const _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: {
          state: 'enabled',
          auditState: 'pass'
        }
      }
      getShopList(_data)
        .then(res => {
          this.loading = !1
          if (res.code == 0) {
            this.currentPage = res.page.currentPage
            this.pageSize = res.page.pageSize
            this.totalPage = res.page.totalPage
            this.totalCount = res.page.totalCount

            let _list = res.page.list
            let _shopList = this.shopList
            if (_list.length > 0) {
              const _newList = _shopList.concat(_list)
              this.shopList = _newList
            } else {
              this.shopList = []
            }
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {})
    },

    //下拉列表滚动时的回调
    scrollShopLoading() {
      this.currentPage = this.currentPage + 1
      if (this.currentPage <= this.totalPage) {
        this.getShopList()
      }
    }
  },
  created() {
    this.getShopList()
  }
}
</script>

<style lang="less" scoped>
</style>