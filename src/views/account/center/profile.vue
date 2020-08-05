<template>
  <div class="merchant-info">
    <a-row :gutter="48">
      <a-col :md="24" :sm="24">
        <a-card title="基本信息：" :bordered="false">
          <p>昵称：{{ user.info.userRealname }}</p>
          <p>账号：{{ user.info.userNickname }}</p>
          <p>邮箱：{{ user.info.userEmail }}</p>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'Profile',
  data () {
    return {
      info: {}
    }
  },
  computed: {
    ...mapState(['user'])
  },
  methods: {},
  created () {}
}
</script>

<style lang="less" scoped>
.account-settings-info-main {
  width: 100%;
  display: flex;
  height: 100%;
  overflow: auto;

  &.mobile {
    display: block;

    .account-settings-info-left {
      border-right: unset;
      border-bottom: 1px solid #e8e8e8;
      width: 100%;
      height: 50px;
      overflow-x: auto;
      overflow-y: scroll;
    }
    .account-settings-info-right {
      padding: 20px 40px;
    }
  }

  .account-settings-info-left {
    border-right: 1px solid #e8e8e8;
    width: 224px;
  }

  .account-settings-info-right {
    flex: 1 1;
    padding: 8px 40px;

    .account-settings-info-title {
      color: rgba(0, 0, 0, 0.85);
      font-size: 20px;
      font-weight: 500;
      line-height: 28px;
      margin-bottom: 12px;
    }
    .account-settings-info-view {
      padding-top: 12px;
    }
  }
}
</style>
