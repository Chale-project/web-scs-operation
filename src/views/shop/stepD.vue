<template>
  <a-card :bordered="false" style="margin: -24px -24px 0px;">
    <result type="success" :description="description" :title="title"></result>
    <div class="but-step">
      <a-button type="primary" @click="finish">继续导入</a-button>
    </div>
  </a-card>

</template>

<script>
import { Result } from '@/components'
export default {
  name: 'stepD',
  components: {
    Result
  },
  data() {
    return {
      title: '提交成功',
      description:
        '已成功导入所选商品至所选分类，\n' + ' 请在商户端小程序“商品管理”->“出售中”查看已导入的商品。\n'
    }
  },
  methods: {
    finish() {
      this.$emit('finish')
    }
  }
}
</script>

<style lang="less" scoped>
.but-step {
  margin-top: 50px;
  text-align: center;
}
</style>