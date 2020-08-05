<template>
  <div class="account-settings-info-view">
    <a-row :gutter="16">
      <a-col :md="24" :lg="16">

        <a-form layout="vertical">
          <a-form-item label="登录名">
            <a-input v-model="userInfo.userLoginName" disabled placeholder="请输入昵称" />
          </a-form-item>
          <a-form-item label="手机号">
            <a-input v-model="userInfo.userMobilePhone" disabled placeholder="请输入手机号" />
          </a-form-item>
          <a-form-item label="姓名">
            <a-input v-model="userInfo.operatorName" placeholder="请输入姓名" />
          </a-form-item>
          <a-form-item label="年龄">
            <a-input v-model="userInfo.operatorAge" placeholder="请输入年龄" />
          </a-form-item>
          <a-form-item label="性别">
            <a-select v-model="userInfo.operatorSex" placeholder="请选择">
              <a-select-option value="man">男</a-select-option>
              <a-select-option value="woman">女</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="电子邮件">
            <a-input v-model="userInfo.operatorEmail" placeholder="exp@admin.com" />
          </a-form-item>

          <a-form-item>
            <a-button type="primary" :loading="loadingSave" @click="butSave">保存</a-button>
          </a-form-item>
        </a-form>

      </a-col>
      <!-- <a-col :md="24" :lg="8" :style="{ minHeight: '180px' }">
        <div class="ant-upload-preview" @click="$refs.modal.edit(1)">
          <a-icon type="cloud-upload-o" class="upload-icon" />
          <div class="mask">
            <a-icon type="plus" />
          </div>
          <img :src="option.img" />
        </div>
      </a-col> -->

    </a-row>

    <avatar-modal ref="modal">

    </avatar-modal>
  </div>
</template>

<script>
import AvatarModal from './AvatarModal'
import { getAppOperatorInfo, modifyOperator } from '@/api/system'

export default {
  components: {
    AvatarModal
  },
  data () {
    return {
      loadingSave: !1,
      userInfo: {},
      // cropper
      preview: {},
      option: {
        img: '/logo.png',
        info: true,
        size: 1,
        outputType: 'jpeg',
        canScale: false,
        autoCrop: true,
        // 只有自动截图开启 宽度高度才生效
        autoCropWidth: 180,
        autoCropHeight: 180,
        fixedBox: true,
        // 开启宽度和高度比例
        fixed: true,
        fixedNumber: [1, 1]
      }
    }
  },
  created () {
    this.getAppOperatorInfo()
  },
  methods: {
    // 保存
    butSave () {
      const _data = { ...this.userInfo }
      this.loadingSave = !0
      modifyOperator(_data)
        .then(res => {
          this.loadingSave = !1
          if (res.code == 0) {
            this.$message.success('修改成功！')
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          this.loadingSave = !1
          console.log(err)
        })
    },

    // 获取当前登录操作员信息
    getAppOperatorInfo () {
      getAppOperatorInfo()
        .then(res => {
          if (res.code == 0) {
            if (res.operator) {
              this.userInfo = res.operator
            }
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
.avatar-upload-wrapper {
  height: 200px;
  width: 100%;
}

.ant-upload-preview {
  position: relative;
  margin: 0 auto;
  width: 100%;
  max-width: 180px;
  border-radius: 50%;
  box-shadow: 0 0 4px #ccc;

  .upload-icon {
    position: absolute;
    top: 0;
    right: 10px;
    font-size: 1.4rem;
    padding: 0.5rem;
    background: rgba(222, 221, 221, 0.7);
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.2);
  }
  .mask {
    opacity: 0;
    position: absolute;
    background: rgba(0, 0, 0, 0.4);
    cursor: pointer;
    transition: opacity 0.4s;

    &:hover {
      opacity: 1;
    }

    i {
      font-size: 2rem;
      position: absolute;
      top: 50%;
      left: 50%;
      margin-left: -1rem;
      margin-top: -1rem;
      color: #d6d6d6;
    }
  }

  img,
  .mask {
    width: 100%;
    max-width: 180px;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
  }
}
</style>
