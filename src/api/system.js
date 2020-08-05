import { axios } from '@/utils/request'
/**
 * 系统栏目菜单
 */
// 获取应用菜单列表
export const getMenuList = () => axios.get('/basic/menu/list')

/**
 * 系统角色
 */
// 添加系统角色
export const addRole = (paramObj) => axios.post('/basic/role/app/add', paramObj)

// 查询系统角色
export const getRoleInfo = (id) => axios.get('/basic/role/app/info/' + id)

// 修改系统角色
export const modifyRole = (paramObj) => axios.put('/basic/role/app/modify', paramObj)

// 删除系统角色
export const removeRole = (ids) => axios.delete('/basic/role/app/remove/' + ids)

// 分页获取系统角色
export const getRoleList = (paramObj) => axios.post('/basic/role/app/pageList', paramObj)

// 获取全部系统角色
export const getRoleAllList = () => axios.get('/basic/role/app/select')

/**
 * 系统操作员
 */

// 查询当前登录系统操作员信息
export const getAppOperatorInfo = () => axios.get('/basic/operator/app/info')

// 添加系统操作员
export const addOperator = (paramObj) => axios.post('/basic/operator/app/add', paramObj)

// 查询系统操作员
export const getOperatorInfo = (id) => axios.get('/basic/operator/app/info/' + id)

// 修改系统操作员
export const modifyOperator = (paramObj) => axios.put('/basic/operator/app/modify', paramObj)

// 删除系统操作员
export const removeOperator = (ids) => axios.delete('/basic/operator/app/remove/' + ids)

// 修改操作员密码
export const modifyOperatorLoginPwd = (oldPassword, newPassword) => axios.put('/basic/operator/app/modifyLoginPwd/' + oldPassword + '/' + newPassword)

// 重置操作员登录密码
export const resetOperatorLoginPwd = (id) => axios.put('/basic/operator/app/resetLoginPwd/' + id)

// 初始化当前应用操作员用户账号
export const initOperatorAccount = (id) => axios.post('/basic/operator/app/initOperatorUser/' + id)

// 启禁当前应用操作员状态
export const changeOperatorStatus = (status, ids) => axios.put('/basic/operator/app/status/' + status + '/' + ids)

// 分页获取系统操作员
export const getOperatorList = (paramObj) => axios.post('/basic/operator/app/pageList', paramObj)

// 获取系统操作员类型
export const getOperatorTypeList = () => axios.get('/basic/operatorType/app/select')

/**
 * 用户管理
 */
// 查询用户
export const getUserInfo = (id) => axios.get('/customer/info/' + id)

// 启用用户
export const enabledUser = (ids) => axios.put('/customer/startAdvertising/' + ids)

// 禁用用户
export const disabledUser = (ids) => axios.put('/customer/stopAdvertising/' + ids)

// 分页获取用户
export const getUserList = (paramObj) => axios.post('/customer/list', paramObj)
