// eslint-disable-next-line
import { UserLayout, BasicLayout, RouteView, BlankLayout, PageView } from '@/components/layouts'

export const asyncRouterMap = []

/**
 * 基础路由
 * @type { *[] }
 */
export const _constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      },
      {
        path: 'recoverPassword',
        name: 'recoverPassword',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/recoverPassword'),
        meta: { title: '修改密码', hidden: true }
      }
    ]
  },
  // account
  {
    path: '/account',
    component: BasicLayout,
    name: 'account',
    meta: { title: '个人页', icon: 'user', permission: ['user'] },
    children: [
      {
        path: '/account/center',
        name: 'center',
        component: () => import('@/views/account/center/profile'),
        meta: { title: '个人信息', permission: ['user'] }
      },
      {
        path: '/account/settings',
        name: 'settings',
        component: () => import('@/views/account/settings/Index'),
        meta: { title: '个人设置', hideHeader: true, permission: ['user'] },
        redirect: '/account/settings/base',
        alwaysShow: true,
        children: [
          {
            path: '/account/settings/base',
            name: 'BaseSettings',
            component: () => import('@/views/account/settings/BaseSetting'),
            meta: { title: '基本设置', hidden: true, permission: ['user'] }
          },
          {
            path: '/account/settings/modifyPassword',
            name: 'modifyPassword',
            component: () => import('@/views/account/settings/modifyPassword'),
            meta: { title: '安全设置', hidden: true, permission: ['user'] }
          }
        ]
      }
    ]
  },
  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  }

]
