import Vue from 'vue'
import axios from 'axios'
import { VueAxios } from './axios'
import notification from 'ant-design-vue/es/notification'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import store from '@/store'

// 创建 axios 实例
const service = axios.create({
  baseURL: '/gateway', // api base_url
  timeout: 6000 // 请求超时时间
})

const err = (error) => {
  if (error.response) {
    const data = error.response.data
    const token = Vue.ls.get(ACCESS_TOKEN)
    if (error.response.status === 401) {
      notification.error({ message: 'Unauthorized', description: 'Authorization verification failed' })
      if (token) {
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } else if (error.response.status === 403) {
      notification.error({ message: 'Forbidden', description: data.message })
    }
  } else {
    notification.error({ message: 'timeout', description: '服务器撸猫去啦，请稍后重试！' })
  }
  return Promise.reject(error)
}

// request interceptor
service.interceptors.request.use(config => {
  const token = Vue.ls.get(ACCESS_TOKEN)
  if (token) {
    config.headers['token'] = token // 让每个请求携带自定义 token 请根据实际情况自行修改
  }
  return config
}, err)

// response interceptor
service.interceptors.response.use((response) => {
  const data = response.data
  const token = Vue.ls.get(ACCESS_TOKEN)
  if (data.code === 403) {
    notification.error({ message: '没有权限', description: data.msg })
  } else if (data.code === 401) {
    notification.error({ message: '登录超时', description: data.msg, duration: 2 })
    if (token) {
      store.dispatch('Logout').then(() => {
        setTimeout(() => {
          window.location.reload()
        }, 500)
      })
    }
  } else {
    return response.data
  }
}, err)

const installer = {
  vm: {},
  install (Vue, router = {}) {
    Vue.use(VueAxios, router, service)
  }
}

export {
  installer as VueAxios,
  service as axios
}
