<template>
  <div class="main">
    <a-form id="formLogin" class="user-layout-login" ref="formLogin" :form="form" @submit="handleSubmit">
      <a-tabs :activeKey="customActiveKey" :tabBarStyle="{ textAlign: 'center', borderBottom: 'unset' }" @change="handleTabClick">

        <a-tab-pane key="tab2" tab="手机号找回密码">
          <a-form-item>
            <a-input size="large" type="text" placeholder="手机号" maxlength="11" v-decorator="[ 'phoneNumber', {rules: [{ required: true, pattern: /^1[0-9]\d{9}$/, message: '请输入有效的手机号' }, { validator: handleUserMobile }], validateTrigger: 'blur' }]">
              <a-icon slot="prefix" type='mobile' :style="{ color: 'rgba(0,0,0,.25)' }" />
            </a-input>
          </a-form-item>
          <!-- <a-row :gutter="16" v-show="showImgCaptcha">
            <a-col class="gutter-row" :span="16">
              <a-form-item fieldDecoratorId="imgCaptcha" :fieldDecoratorOptions="{rules: [{ required: true, message: '请输入图形验证码' }], validateTrigger: 'blur'}">
                <a-input size="large" type="text" v-model="formLogin.imgCaptcha" placeholder="'请输入图形验证码">
                  <a-icon slot="prefix" type='safety' :style="{ color: 'rgba(0,0,0,.25)' }" />
                </a-input>
              </a-form-item>
            </a-col>
            <a-col class="gutter-row" :span="8">
              <span class="ivu-input-prefix captcha-img" @click="changeImgCaptcha">
                <img class="getCaptcha" :src="captchaImg?captchaImg:''" alt="" style="background:#eee;">
              </span>
            </a-col>
          </a-row> -->

          <a-row :gutter="16">
            <a-col class="gutter-row" :span="16">
              <a-form-item>
                <a-input size="large" type="text" placeholder="验证码" v-decorator="[ 'smsCode', {rules: [{ required: true, message: '请输入验证码' }], validateTrigger: 'blur'}]">
                  <a-icon slot="prefix" type='mail' :style="{ color: 'rgba(0,0,0,.25)' }" />
                </a-input>
              </a-form-item>
            </a-col>
            <a-col class="gutter-row" :span="8">
              <span class="ivu-input-prefix">
                <a-button class="getCaptcha" :disabled="state.smsSendBtn" @click.stop.prevent="getCaptcha" v-text="!state.smsSendBtn&&'获取验证码'||(state.time+' s')"></a-button>
              </span>
            </a-col>
          </a-row>

        </a-tab-pane>
      </a-tabs>

      <a-form-item>
        <router-link :to="{ name: 'login' }" class="forge-password"> 立即登录 </router-link>
      </a-form-item>

      <a-form-item style="margin-top:24px">
        <a-button size="large" type="primary" htmlType="submit" class="login-button" :loading="state.loginBtn" @click.stop.prevent="handleSubmit" :disabled="state.loginBtn">找回密码
        </a-button>
      </a-form-item>

    </a-form>

  </div>
</template>

<script>
import md5 from 'md5'
import { mapActions } from 'vuex'
import { timeFix } from '@/utils/util'
import { recoverPassword } from '@/api/user'
import { getSmsCode } from '@/api/common'

export default {
  data() {
    return {
      customActiveKey: 'tab2',
      // login type: 0 telephone, 1 username, 2 email
      loginType: 0,
      form: this.$form.createForm(this),
      state: {
        loginBtn: false,
        time: 60,
        smsSendBtn: false
      }
    }
  },
  created() {},
  methods: {
    handleUserMobile(rule, value, callback) {
      const regex = /^1[0-9]\d{9}$/
      if (regex.test(value)) {
        this.loginType = 0
      } else {
        this.loginType = 1
      }
      callback()
    },

    handleTabClick(key) {
      this.customActiveKey = key
    },
    handleSubmit() {
      let that = this
      let flag = false

      const {
        form: { validateFields },
        state,
        customActiveKey
      } = this

      state.loginBtn = true

      const validateFieldsKey = customActiveKey === 'tab2' ? ['phoneNumber', 'smsCode'] : ['userNumber', 'userSecret']

      validateFields(validateFieldsKey, { force: true }, (err, values) => {
        if (!err) {
          const params = { ...values }
          recoverPassword(params)
            .then(res => {
              if (res.code === 0) {
                that.loginBtn = false
                that.$message.success('密码重置成功，即将跳转至登录页。', 3)
                setTimeout(() => {
                  that.$router.push({ name: 'login' })
                }, 3000)
              } else {
                this.loginBtn = false
                that.$message.error(res.msg)
              }
            })
            .catch(err => {})
            .finally(() => {
              state.loginBtn = false
            })
        } else {
          setTimeout(() => {
            state.loginBtn = false
          }, 600)
        }
      })
    },

    getCaptcha(e) {
      e.preventDefault()
      let that = this

      this.form.validateFields(['phoneNumber'], { force: true }, (err, values) => {
        if (!err) {
          this.state.smsSendBtn = true

          let interval = window.setInterval(() => {
            if (that.state.time-- <= 0) {
              that.state.time = 60
              that.state.smsSendBtn = false
              window.clearInterval(interval)
            }
          }, 1000)
          const params = { ...values }
          const hide = this.$message.loading('验证码发送中..', 0)
          getSmsCode(params.phoneNumber)
            .then(res => {
              if (res.code == 0) {
                setTimeout(hide, 3000)
              } else {
                setTimeout(hide, 1)
                clearInterval(interval)
                that.state.time = 60
                that.state.smsSendBtn = false
                that.$message.error(res.msg)
              }
            })
            .catch(err => {
              console.log(err)
            })
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.user-layout-login {
  label {
    font-size: 14px;
  }

  .getCaptcha {
    display: block;
    width: 100%;
    height: 40px;
  }

  .forge-password {
    font-size: 14px;
  }

  button.login-button {
    padding: 0 15px;
    font-size: 16px;
    height: 40px;
    width: 100%;
  }

  .user-login-other {
    text-align: left;
    margin-top: 24px;
    line-height: 22px;

    .item-icon {
      font-size: 24px;
      color: rgba(0, 0, 0, 0.2);
      margin-left: 16px;
      vertical-align: middle;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: #1890ff;
      }
    }

    .register {
      float: right;
    }
  }
}
</style>
