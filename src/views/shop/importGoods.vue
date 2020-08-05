<template>
  <a-card :bordered="false">
    <a-steps :current="currentTab">
      <a-step title="选择店铺" description="请选择您要为那个店铺导入商品；" />
      <a-step title="选择商品" description="请选择您将要导入的商品；" />
      <a-step title="分类至" description="将您选择的这些商品分类到您商户端小程序已有的分类中；" />
      <a-step title="完成" description="请在商户端查看已导入的商品。" />
    </a-steps>
    <div class="import-content">
      <stepA v-if="currentTab === 0" @nextStep="nextStep" />
      <stepB v-if="currentTab === 1" @nextStep="nextStep" @prevStep="prevStep" :shopId="shopId" />
      <stepC v-if="currentTab === 2" @import="importGoods" @prevStep="prevStep" :shopId="shopId" />
      <stepD v-if="currentTab === 3" @prevStep="prevStep" @finish="finish" />
    </div>
  </a-card>
</template>

<script>
import stepA from './stepA'
import stepB from './stepB'
import stepC from './stepC'
import stepD from './stepD'
import { submitImportGoods } from '@/api/common'

export default {
  name: 'importGoods',
  components: {
    stepA,
    stepB,
    stepC,
    stepD
  },
  data() {
    return {
      currentTab: 0,
      shopId: '',
      goodsList: []
    }
  },

  methods: {
    //上一步
    prevStep() {
      if (this.currentTab > 0) {
        this.currentTab -= 1
      }
    },

    // 下一步
    nextStep(e) {
      if (this.currentTab == 0) {
        this.shopId = e
      } else if (this.currentTab == 1) {
        this.goodsList = e
      }

      if (this.currentTab < 2) {
        this.currentTab += 1
      }
    },

    //导入商品
    importGoods(e) {
      const _shopId = this.shopId
      const _goodsList = [...this.goodsList]
      const _cid = e[0].id
      const _gids = _goodsList.map(item => {
        return `${item.id}~${item.suggestedPrice}&${item.stock}`
      })
      const _data = {
        shopId: _shopId,
        categoryId: _cid,
        gids: _gids
      }
      submitImportGoods(_data).then(res => {
        if (res.code == 0) {
          this.currentTab += 1
        } else {
          this.$message.error(res.msg)
        }
      })
    },

    //导入完成，继续导入
    finish() {
      this.currentTab = 0
      this.shopId = ''
      this.goodsList = []
    }
  },
  created() {}
}
</script>

<style lang="less" scoped>
.import-content {
  margin-top: 30px;
}
</style>
