<template>
  <div class="merchant-info">
    <a-card title="修改密码：" :bordered="false">
      <a-row :gutter="48">
        <a-col :md="16" :sm="16">
          <a-form layout="vertical">
            <a-form-item label="旧密码：">
              <a-input type="password" v-model="oldPassword" placeholder="请输入旧密码" />
            </a-form-item>
            <a-form-item label="新密码：">
              <a-input type="password" v-model="newPassword" placeholder="请输入新密码" />
            </a-form-item>

            <a-form-item>
              <a-button type="primary" @click="confirmModify">确认修改</a-button>
            </a-form-item>
          </a-form>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import md5 from 'md5'
import { modifyOperatorLoginPwd } from '@/api/system'

export default {
  name: 'ModifyPassword',
  data () {
    return {
      oldPassword: null,
      newPassword: null
    }
  },

  methods: {
    ...mapActions(['Logout']),
    // checkData
    checkData () {
      let flag = !0
      if (!this.oldPassword) {
        flag = !1
        this.$message.warning('请填写旧密码！')
        return false
      } else if (!this.newPassword) {
        flag = !1
        this.$message.warning('请填写新密码！')
        return false
      } else {
        return flag
      }
    },

    // 确认修改
    confirmModify () {
      const flag = this.checkData()
      flag && this.modifyPassword()
    },

    // 获取角色信息
    modifyPassword () {
      const oldPassword = md5(this.oldPassword)
      const newPassword = md5(this.newPassword)

      modifyOperatorLoginPwd(oldPassword, newPassword)
        .then(res => {
          if (res.code == 0) {
            this.$message.success('修改成功')
            this.Logout()
              .then(() => {
                this.$message.warning('修改成功，请重新登录！')
                setTimeout(() => {
                  window.location.reload()
                }, 1e3)
              })
              .catch(err => {
                console.log(err)
              })
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    }
  }
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
