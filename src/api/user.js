import { axios } from '@/utils/request'

const api = {
  token: '/api/token',
  recoverPassword: '/operation/forget',
  refreshToken: '/api/refresh',
  destory: '/api/destory',
  userInfo: '/basic/user/app/info',
  menuList: '/basic/menu/nav',
  proms: '/basic/menu/perms/list'
}

export default api

export function login (parameter) {
  return axios({
    url: api.token,
    method: 'post',
    data: parameter
  })
}

export function recoverPassword (parameter) {
  return axios({
    url: api.recoverPassword,
    method: 'post',
    data: parameter
  })
}

export function refreshToken () {
  return axios({
    url: api.refreshToken,
    method: 'post'
  })
}

export function logout () {
  return axios({
    url: api.destory,
    method: 'put'
  })
}

export function getUserInfo () {
  return axios({
    url: api.userInfo,
    method: 'get'
  })
}

export function getUserMenuList () {
  return axios({
    url: api.menuList,
    method: 'get'
  })
}

export function getUserPermission () {
  return axios({
    url: api.proms,
    method: 'get'
  })
}
