import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/'
import { VueAxios } from '@/utils/request' // axios 不建议引入到 Vue 原型链上

import './core/use'
import bootstrap from './core/bootstrap'
import '@/permission' // permission control
import '@/utils/filter' // global filter

Vue.config.productionTip = false

Vue.use(VueAxios, router)

new Vue({
  router,
  store,
  created () {
    bootstrap()
    if (this.$router.history.current.name !== 'login') {
      setInterval(() => { // 每隔1.5小时刷新token
        store.dispatch('RefreshToken').then(data => {
          console.log('token刷新成功')
        }).catch(() => {
          console.log('token刷新失败')
        })
      }, 1.5 * 60 * 60 * 1000)
    }
  },
  render: h => h(App)
}).$mount('#app')
