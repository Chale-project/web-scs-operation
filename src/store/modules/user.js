import Vue from 'vue'
import { login, refreshToken, logout, getUserInfo, getUserMenuList, getUserPermission } from '@/api/user'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { welcome } from '@/utils/util'
import defaultAvatar from '@/assets/logo.png'

const user = {
  state: {
    token: '',
    name: '',
    welcome: '',
    avatar: '',
    roles: [],
    info: {}
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, { name, welcome }) => {
      state.name = name
      state.welcome = welcome
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar || defaultAvatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_INFO: (state, info) => {
      state.info = info
    }
  },

  actions: {
    // 登录
    Login ({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        login(userInfo).then(response => {
          if (response.code === 0) {
            const _token = response.access_token
            Vue.ls.set(ACCESS_TOKEN, _token, 7 * 24 * 60 * 60 * 1000)
            commit('SET_TOKEN', _token)
          }
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登录
    RefreshToken ({ commit }) {
      return new Promise((resolve, reject) => {
        refreshToken().then(response => {
          if (response.code === 0) {
            const _token = response.access_token
            Vue.ls.set(ACCESS_TOKEN, _token, 7 * 24 * 60 * 60 * 1000)
            commit('SET_TOKEN', _token)
          }
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    GetUserMenuList () {
      return new Promise((resolve, reject) => {
        getUserMenuList().then(response => {
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetUserInfo ({ commit }) {
      return new Promise((resolve, reject) => {
        getUserInfo().then(response => {
          if (response.code === 0) {
            if (response.user) {
              const _user = response.user
              commit('SET_NAME', { name: _user.userRealname, welcome: welcome() })
              commit('SET_AVATAR', _user.userAvatar)
              commit('SET_INFO', _user)
              resolve(response)
            } else {
              reject(new Error('getInfo: roles must be a non-null array !'))
            }
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户权限列表
    GetUserPermission ({
      commit
    }) {
      return new Promise((resolve, reject) => {
        getUserPermission().then(response => {
          if (response.code === 0) {
            commit('SET_ROLES', response.perms)
            resolve(response)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    Logout ({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout().then(response => {
          commit('SET_TOKEN', '')
          commit('SET_NAME', '')
          commit('SET_AVATAR', '')
          commit('SET_ROLES', [])
          Vue.ls.remove(ACCESS_TOKEN)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    }

  }
}

export default user
