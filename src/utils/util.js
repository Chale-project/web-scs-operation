export function timeFix () {
  const time = new Date()
  const hour = time.getHours()
  return hour < 9 ? '早上好' : (hour <= 11 ? '上午好' : (hour <= 13 ? '中午好' : (hour < 20 ? '下午好' : '晚上好')))
}

export function welcome () {
  const arr = ['休息一会儿吧', '准备吃什么呢?', '要不要打一把 DOTA', '我猜你可能累了']
  const index = Math.floor((Math.random() * arr.length))
  return arr[index]
}

/**
 * 触发 window.resize
 */
export function triggerWindowResizeEvent () {
  const event = document.createEvent('HTMLEvents')
  event.initEvent('resize', true, true)
  event.eventType = 'message'
  window.dispatchEvent(event)
}

/**
 * Remove loading animate
 * @param id parent element id or class
 * @param timeout
 */
export function removeLoadingAnimate (id = '', timeout = 1500) {
  if (id === '') {
    return
  }
  setTimeout(() => {
    document.body.removeChild(document.getElementById(id))
  }, timeout)
}

// 构建菜单树
export const toTree = (data) => {
  // 删除 所有 children,以防止多次调用
  data.forEach(function (item) {
    delete item.children
  })

  // 将数据存储为 以 id 为 KEY 的 map 索引数据列
  var map = {}
  data.forEach(function (item, index) {
    map[item.id] = item
    map[item.id].key = item.id
    map[item.id].value = item.id
    map[item.id].title = item.menuName
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

// 手机号隐藏中间四位
export const mobileToStar = (mobile) => {
  var str = mobile.substring(0, 3) + '****' + mobile.substring(7, 11)
  return str
}

// 人名隐藏名
export const nameToStar = (name) => {
  var str = name.substring(0, 1) + '****'
  return str
}

// 时间字符串截取
export const timeIntercept = (timeStr) => {
  var _Date = new Date(timeStr)
  var year = _Date.getFullYear()
  var month = _Date.getMonth() + 1
  var day = _Date.getDate()
  var hour = _Date.getHours()
  var minute = _Date.getMinutes()
  var second = _Date.getSeconds()
  return [year, month, day].map(formatNumber).join('-')
}

export const formatNumber = (n) => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
