import { constantRouterMap } from '@/router'
import { UserLayout, BasicLayout, RouteView, BlankLayout, PageView } from '@/components/layouts'

const _import = require('@/router/_import_' + process.env.NODE_ENV) // 获取组件的方法

function filterAsyncRouter (asyncRouterList) {
  const asyncRouterMap = setAsyncRouters(asyncRouterList)
  for (const i in asyncRouterMap) {
    const children = asyncRouterMap[i].children
    if (asyncRouterMap[i].component) {
      if (asyncRouterMap[i].component === 'BasicLayout') { // Layout组件特殊处理
        asyncRouterMap[i].component = BasicLayout
      } else if (asyncRouterMap[i].component === 'RouteView') { // Layout组件特殊处理
        asyncRouterMap[i].component = RouteView
      } else if (asyncRouterMap[i].component === 'PageView') { // Layout组件特殊处理
        asyncRouterMap[i].component = PageView
      } else {
        asyncRouterMap[i].component = _import(asyncRouterMap[i].component)
      }
    }
    for (const j in children) {
      const grandChildren = children[j].children
      if (children[j].component) {
        if (children[j].component === 'BasicLayout') { // Layout组件特殊处理
          children[j].component = BasicLayout
        } else if (children[j].component === 'RouteView') { // Layout组件特殊处理
          children[j].component = RouteView
        } else if (children[j].component === 'PageView') { // Layout组件特殊处理
          children[j].component = PageView
        } else {
          children[j].component = _import(children[j].component)
        }
      }
      for (const k in grandChildren) {
        if (grandChildren[k].component) {
          if (grandChildren[k].component === 'BasicLayout') { // Layout组件特殊处理
            grandChildren[k].component = BasicLayout
          } else if (grandChildren[k].component === 'RouteView') { // Layout组件特殊处理
            grandChildren[k].component = RouteView
          } else if (grandChildren[k].component === 'PageView') { // Layout组件特殊处理
            grandChildren[k].component = PageView
          } else {
            grandChildren[k].component = _import(grandChildren[k].component)
          }
        }
      }
    }
  }

  console.log(asyncRouterMap)
  return asyncRouterMap
}

// 构建菜单树
function toTree (data) {
  // 删除 所有 children,以防止多次调用
  data.forEach(function (item) {
    delete item.children
  })

  // 将数据存储为 以 id 为 KEY 的 map 索引数据列
  var map = {}
  data.forEach(function (item) {
    map[item.id] = item
  })
  // console.log(map);
  var val = []
  data.forEach(function (item) {
    // 以当前遍历项，的pid,去map对象中找到索引的id
    var parent = map[item.parentMenuId]
    // 好绕啊，如果找到索引，那么说明此项不在顶级当中,那么需要把此项添加到，他对应的父级中
    if (parent) {
      (parent.children || (parent.children = [])).push(item)
    } else {
      // 如果没有在map中找到对应的索引ID,那么直接把 当前的item添加到 val结果集中，作为顶级
      val.push(item)
    }
  })
  return val
}

function setAsyncRouters (asyncRouterList) {
  const menuMap = asyncRouterList
  for (const i in menuMap) {
    const category = menuMap[i].children
    menuMap[i].path = `${menuMap[i].menuPath}`
    menuMap[i].name = menuMap[i].menuCode
    if (menuMap[i].menuContextPath) {
      menuMap[i].redirect = menuMap[i].menuContextPath
    }
    if (menuMap[i].menuRemark) {
      menuMap[i].component = menuMap[i].menuRemark
    }
    menuMap[i].meta = {
      title: menuMap[i].menuName,
      icon: menuMap[i].menuIcon,
      permission: [menuMap[i].menuPerms]
    }
    for (const j in category) {
      const subMenuMap = category[j].children
      category[j].path = `${category[j].menuPath}`
      category[j].name = category[j].menuCode
      if (category[j].menuContextPath) {
        category[j].redirect = category[j].menuContextPath
      }
      if (category[j].menuRemark) {
        category[j].component = category[j].menuRemark
      }
      category[j].meta = {
        title: category[j].menuName,
        icon: category[j].menuIcon,
        permission: [category[j].menuPerms]
      }
      for (const k in subMenuMap) {
        subMenuMap[k].path = `${subMenuMap[k].menuPath}`
        subMenuMap[k].name = subMenuMap[k].menuCode
        if (subMenuMap[k].menuContextPath) {
          subMenuMap[k].redirect = subMenuMap[k].menuContextPath
        }
        if (subMenuMap[k].menuRemark) {
          subMenuMap[k].component = subMenuMap[k].menuRemark
        }
        subMenuMap[k].meta = {
          title: subMenuMap[k].menuName,
          icon: subMenuMap[k].menuIcon,
          permission: [subMenuMap[k].menuPerms]
        }
      }
    }
  }
  for (const i in menuMap) {
    delete menuMap[i].id
    delete menuMap[i].addDataTime
    delete menuMap[i].appId
    delete menuMap[i].menuCode
    delete menuMap[i].menuContextPath
    delete menuMap[i].menuIcon
    delete menuMap[i].menuName
    delete menuMap[i].menuPath
    delete menuMap[i].menuPerms
    delete menuMap[i].menuRemark
    delete menuMap[i].menuShowType
    delete menuMap[i].menuStatus
    delete menuMap[i].menuType
    delete menuMap[i].modifyDataTime
    delete menuMap[i].open
    delete menuMap[i].parentMenuId
    delete menuMap[i].parentMenuName
    delete menuMap[i].sortNo
    delete menuMap[i].subMenuList

    const category = menuMap[i].children
    for (const j in category) {
      delete category[j].id
      delete category[j].addDataTime
      delete category[j].appId
      delete category[j].menuCode
      delete category[j].menuContextPath
      delete category[j].menuIcon
      delete category[j].menuName
      delete category[j].menuPath
      delete category[j].menuPerms
      delete category[j].menuRemark
      delete category[j].menuShowType
      delete category[j].menuStatus
      delete category[j].menuType
      delete category[j].modifyDataTime
      delete category[j].open
      delete category[j].parentMenuId
      delete category[j].parentMenuName
      delete category[j].sortNo
      delete category[j].subMenuList
    }
  }
  return menuMap
}

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    }
  },
  actions: {
    GenerateMenuList ({ commit }, res) {
      return new Promise((resolve, reject) => {
        const data = res.res
        console.log(data)
        if (data.code === 0) {
          if (data.menuList.length > 0) {
            const menuList = data.menuList
            const accessedRouters = filterAsyncRouter(menuList)
            const _accessedRouters = [{
              path: '/',
              name: 'index',
              component: BasicLayout,
              meta: { title: '首页' },
              // redirect: '/dashboard/analysis',
              children: accessedRouters
            }]
            commit('SET_ROUTERS', _accessedRouters)
            resolve()
          }
        } else {
          this.$message.warning('还未给该用户添加菜单权限相关！')
          reject(data)
        }
      })
    }
  }
}

export default permission
