import Vue from 'vue'
import Router from 'vue-router'
import { _constantRouterMap } from '@/config/router.config'

Vue.use(Router)
export const constantRouterMap = _constantRouterMap
export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})
