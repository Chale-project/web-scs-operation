import { axios } from '@/utils/request'

/**
 * 文件上传
 */
export const uploadFile = '/gateway/basic/file/upload'
export const importFile = '/gateway/commodityStocks/uploadCommodityStocks'
export const importShopGoodsFile = '/gateway/goods/uploadgoods/shop'

export const getSmsCode = (mobile) => axios.get('operation/forgetPasswordSmsSend/' + mobile)

/**
 * 统计分析
 */
// 获取统计分析数据
export const getAnalysisData = (paramObj) => axios.post('/Analyze/info', paramObj)

/**
 * 广告位
 */
// 添加广告位
export const addAd = (paramObj) => axios.post('Advertising/add', paramObj)

// 分页查询广告位
export const getAdList = (paramObj) => axios.post('Advertising/list', paramObj)

// 查询广告位
export const getAdInfo = (id) => axios.get('Advertising/info/' + id)

// 修改广告位
export const modifyAd = (paramObj) => axios.put('Advertising/modify', paramObj)

// 删除广告位
export const removeAd = (ids) => axios.delete('Advertising/deleted/' + ids)

// 启用广告位
export const enabledAd = (ids) => axios.put('Advertising/startAdvertising/' + ids)

// 禁用广告位
export const disabledAd = (ids) => axios.put('Advertising/stopAdvertising/' + ids)

// 广告分组
// 分页查询广告位
export const getAllAdvertGroup = (paramObj) => axios.get('/advertGroup/getList', paramObj)

/**
 * 代理商
 */
// 获取代理商等级规则配置
export const getAgentQuotaRule = (paramObj) => axios.get('agentData/getAgentQuotaRule', paramObj)

// 添加代理商
export const addAgent = (paramObj) => axios.post('agentData/add', paramObj)

// 查询代理商
export const getAgentInfo = (id) => axios.get('agentData/info/' + id)

// 修改代理商
export const modifyAgent = (paramObj) => axios.put('agentData/modify', paramObj)

// 删除代理商
export const removeAgent = (ids) => axios.delete('agentData/deleted/' + ids)

// 审核通过
export const auditAgentOk = (ids) => axios.put('agentData/auditAgentOk/' + ids)

// 审核不通过
export const auditAgentNo = (paramObj) => axios.put('agentData/auditAgentNo', paramObj)

// 分页获取代理商
export const getAgentList = (paramObj) => axios.post('agentData/list', paramObj)

// 重置代理商登陆密码
export const resetAgentPwd = (id) => axios.put('agentData/resetLoginPwd/' + id)

// 启用or禁用
export const setAgentState = (paramObj) => axios.put('agentData/modifyAgentState/' + paramObj.state + '/' + paramObj.idArr)

// 划分父子级代理商
export const modifyParentAgent = (paramObj) => axios.post('agentData/modifyParentAgent', paramObj)

/**
 * 充值续费
 */
// 一级代理商充值
export const rechargeAgent = (paramObj) => axios.post('agentQuotaRecharge/add', paramObj)

// 续费申请列表
export const getRechargeAgentList = (paramObj) => axios.post('agentQuotaRecharge/list', paramObj)

// 审核通过
export const auditRechargeAgentOk = (ids) => axios.put('agentQuotaRecharge/auditPass/' + ids)

// 审核不通过
export const auditRechargeAgentNo = (ids) => axios.put('agentQuotaRecharge/auditNotpass/' + ids)

// 冲正续费
export const correctRechargeAgent = (paramObj) => axios.post('agentQuotaRecharge/correct', paramObj)

/**
 * 商品库
 */
// 获取商品分类
export const getGoodsCategory = () => axios.post('commodityCategory/queryAll')

// 批量导入商品
export const importCsvGoods = (paramObj) => axios.post('commodityStocks/uploadCommodityStocks', paramObj)

// 添加商品
export const addGoods = (paramObj) => axios.post('commodityStocks/add', paramObj)

// 分页查询商品
export const getGoodsList = (paramObj) => axios.post('commodityStocks/list', paramObj)

// 查询商品
export const getGoodsInfo = (id) => axios.get('commodityStocks/info/' + id)

// 修改商品
export const modifyGoods = (paramObj) => axios.put('commodityStocks/modify', paramObj)

// 批量删除商品
export const deletedGoods = (ids) => axios.delete('commodityStocks/deleted/' + ids)

/**
 * 商户
 */
// 添加商户
export const addMerchant = (paramObj) => axios.post('merchant/add', paramObj)

// 查询商户
export const getMerchantInfo = (id) => axios.get('merchant/info/' + id)

// 修改商户
export const editMerchant = (paramObj) => axios.put('merchant/modify', paramObj)

// 删除商户
export const removeMerchant = (ids) => axios.delete('merchant/deleted/' + ids)

// 启用商户
export const enabledMerchant = (ids) => axios.put('merchant/startAdvertising/' + ids)

// 禁用商户
export const disabledMerchant = (ids) => axios.put('merchant/stopAdvertising/' + ids)

// 获取所有商户
export const getMerchantList = (paramObj) => axios.post('merchant/list', paramObj)

/**
 * 店铺
 */
// 店铺
export const getShopInfo = (id) => axios.get('shop/getShopInfo/' + id)

// 分页查询店铺
export const getShopList = (paramObj) => axios.post('shop/list', paramObj)

// 修改代理商
export const modifyShop = (paramObj) => axios.put('shop/modifyShop', paramObj)

// 审核通过
export const auditShopOk = (id) => axios.put('shop/auditShopOk/' + id)

// 审核不通过
export const auditShopNo = (paramObj) => axios.put('shop/auditShopNo', paramObj)

// 启用店铺
export const enabledShop = (id) => axios.put('shop/startShop/' + id)

// 禁用店铺
export const disabledShop = (paramObj) => axios.put('shop/stopShop', paramObj)

// 收款二维码
export const getPayCode = (id) => axios.get('shop/modifyQrCodePath/' + id)

// 变更所属代理商
export const modifyBelongAgent = (paramObj) => axios.post('shop/modifyAgent', paramObj)

/**
 * 业务经理
 */
// 添加业务经理
export const addBd = (paramObj) => axios.post('salesman/add', paramObj)

// 查询业务经理
export const getBdInfo = (id) => axios.get('salesman/info/' + id)

// 修改业务经理
export const modifyBd = (paramObj) => axios.put('salesman/modify', paramObj)

// 删除业务经理
export const removeBd = (ids) => axios.delete('salesman/deleted/' + ids)

// 审核通过
export const auditBdOk = (ids) => axios.put('salesman/auditAgentOk/' + ids)

// 审核不通过
export const auditBdNo = (paramObj) => axios.put('salesman/auditAgentNo', paramObj)

// 启用
export const enabledBd = (ids) => axios.put('salesman/start/' + ids)

// 禁用
export const disabledBd = (ids) => axios.put('salesman/stop/' + ids)

// 分页获取业务经理
export const getBdList = (paramObj) => axios.post('salesman/list', paramObj)

// 获取所有业务经理
export const getBdListAll = (paramObj) => axios.get('salesman/getSalesman', paramObj)

// 获取代理商所属业务经理
export const getSalesManListData = (paramObj) => axios.post('salesman/allList', paramObj)

/**
 * 积分记录
 */
// 查询积分记录
export const getIntegralRecordInfo = (id) => axios.get('/exchange/record/info/' + id)

// 兑换成功积分记录
export const successIntegralRecord = (ids) => axios.put('/exchange/record/startpath/' + ids)

// 兑换失败积分记录
export const failIntegralRecord = (paramObj) => axios.post('/exchange/record/stop/record', paramObj)

// 导出积分记录
export const exportIntegralRecord = (paramObj) => axios.put('/exchange/record/export', paramObj, { responseType: 'blob' })

// 分页获取积分记录
export const getIntegralRecordList = (paramObj) => axios.post('/exchange/record/page/list', paramObj)

/**
 * 优惠券
 */
// 新增优惠券
export const addCoupon = (paramObj) => axios.post('/coupon/add', paramObj)

export const pageQueryCoupon = (paramObj) => axios.post('/coupon/pageQuery', paramObj)

// 修改优惠券基本信息
export const modifyCouponBasic = (paramObj) => axios.post('/coupon/modifyCouponBasic', paramObj)

/**
 * 平台商品类目
 */
// 添加类目
export const addPlatformGCategory = (paramObj) => axios.post('virtualGoods/category/add', paramObj)

// 分页查询
export const getPlatformGCategoryList = (paramObj) => axios.post('virtualGoods/category/pageQuery', paramObj)

// 查询详情
export const getPlatformGCategoryInfo = (id) => axios.get('virtualGoods/category/info/' + id)

// 编辑分类
export const modifyPlatformGCategory = (paramObj) => axios.put('virtualGoods/category/modify', paramObj)

// 删除分类
export const removePlatformGCategory = (id) => axios.delete('virtualGoods/category/delete/' + id)

// 查询
export const getPlatformGCategoryAll = (paramObj) => axios.post('virtualGoods/category/query', paramObj)

// 启用or禁用
export const setPlatformGCategoryState = (paramObj) => axios.put('virtualGoods/category/modifyState/' + paramObj.state + '/' + paramObj.idArr)

/**
 * 平台商品
 */
// 新增虚拟商品
export const addPlatformVirtualGoods = (paramObj) => axios.post('virtualGoods/add', paramObj)

// 新增实物商品
export const addPlatformEntityGoods = (paramObj) => axios.post('physicalGoods/add', paramObj)

// 分页查询
export const getPlatformGoodsList = (paramObj) => axios.post('virtualGoods/pageQuery', paramObj)

// 修改
export const modifyPlatformGoods = (paramObj) => axios.put('virtualGoods/modify', paramObj)

// 删除
export const removePlatformGoods = (id) => axios.delete('virtualGoods/delete/' + id)

// 详情
export const getPlatformGoodsInfo = (id) => axios.get('virtualGoods/info/' + id)

// 上下架
export const setPlatformGoodsIsMarketable = (paramObj) => axios.put('virtualGoods/modifyIsMarketable/' + paramObj.state + '/' + paramObj.idArr)

/**
 * 平台虚拟商品
 */
//  传虚拟商品对账单
export const importVirtualFile = '/gateway/virtualGoods/sellRecord/statementOfAccount'

// 分页查询
export const getVirtualSellRecordList = (paramObj) => axios.post('virtualGoods/sellRecord/pageQuery', paramObj)

/**
 * 台卡管理
 */
// 添加太卡
export const addTCard = (paramObj) => axios.get('shopPolymerization/getPolymerizationCode/' + paramObj.number)

// 获取太卡列表
export const getTCardList = (paramObj) => axios.post('shopPolymerization/list', paramObj)

/**
 * 终端管理
 */
// 获取商户及店铺
export const getMerchantShopAll = (id) => axios.get('shop/getShopNoList')

// 绑定终端
export const bindTerminal = (paramObj) => axios.post('terminal/add', paramObj)

// 查询终端信息
export const getTerminalInfo = (id) => axios.get('terminal/info/' + id)

// 获取终端列表
export const getTerminalList = (paramObj) => axios.post('terminal/pageQuery', paramObj)

// 修改终端
export const modifyTerminal = (paramObj) => axios.put('terminal/modify', paramObj)

// 删除终端
export const removeTerminal = (ids) => axios.delete('terminal/delete/' + ids)

/*
 * 喇叭终端管理
 */
// 获取喇叭设备列表
export const getTrumpetList = (paramObj) => axios.post('trumpet/pageQuery', paramObj)

// csv导入喇叭设备
export const uploadTrumpets = (paramObj) => axios.post('trumpet/uploadTrumpets', paramObj)

// 分页查询
export const removeTrumpets = (paramObj) => axios.delete('trumpet/pageQuery', paramObj)

/**
 * 商品导入
 */
// 获取能导入的商品
export const getCanImprotGoods = (paramObj) => axios.post('commodityStocks/goods/list', paramObj)

// 获取已经导入的商品
export const getCanImportedGoods = (paramObj) => axios.post('commodityStocks/inputGoods/list', paramObj)

// 获取分类（分类至）
export const getShopCategory = (id) => axios.get('commodityStocks/list/' + id)

// 确认导入商品
export const submitImportGoods = (paramObj) => axios.put('commodityStocks/import/' + paramObj.shopId + '/' + paramObj.categoryId + '/' + paramObj.gids)

/**
 * 区域查询
 */
// 省级区域
export const getPrivinceList = () => axios.get('basic/region/province/select/')

/**
 * 秒杀商品
 */
// 添加秒杀商品
export const addSeckillGoods = (paramObj) => axios.post('platform/seckillGoods/add', paramObj)

// 秒杀活动列表
export const getSeckillGoods = (paramObj) => axios.post('platform/seckillGoods/list', paramObj)

/**
 * 拼团商品
 */
// 添加拼团商品
export const addPlatformGroupGoods = (paramObj) => axios.post('goodsGroup/add', paramObj)

// 获取拼团商品信息
export const getPlatformGroupGoodsInfo = (id) => axios.get('goodsGroup/info/' + id)

// 修改拼团商品
export const modifyPlatformGroupGoods = (paramObj) => axios.put('goodsGroup/modify', paramObj)

// 删除拼团商品
export const removePlatformGroupGoods = (ids) => axios.put('goodsGroup/delete/' + ids)

// 获取拼团商品列表
export const getPlatformGroupGoodsList = (paramObj) => axios.post('goodsGroup/list', paramObj)

// 获取商品拼团列表
export const getPlatformGroupList = (paramObj) => axios.post('orderGroup/page', paramObj)

/**
 * 秒杀商品
 */
// 添加秒杀商品
export const addPlatformSeckillGoods = (paramObj) => axios.post('goodsSeckill/add', paramObj)

// 获取秒杀商品信息
export const getPlatformSeckillGoodsInfo = (id) => axios.get('goodsSeckill/info/' + id)

// 修改秒杀商品
export const modifyPlatformSeckillGoods = (paramObj) => axios.put('goodsSeckill/modify', paramObj)

// 删除秒杀商品
export const removePlatformSeckillGoods = (ids) => axios.put('goodsSeckill/delete/' + ids)

// 获取秒杀商品列表
export const getPlatformSeckillGoodsList = (paramObj) => axios.post('goodsSeckill/list', paramObj)

/**
 * 实物商品订单
 */
// 获取实物订单信息
export const getEntityOrderInfo = (id) => axios.get('physicalGoodsOrder/info/' + id)

// 获取实物订单列表
export const getEntityOrderList = (paramObj) => axios.post('physicalGoodsOrder/pageQuery', paramObj)

// 订单发货
export const orderDeliver = (paramObj) => axios.post('physicalGoodsOrder/shipments', paramObj)

// 申请退款
export const applyRefund = (paramObj) => axios.put('physicalGoodsOrder/refund', paramObj)

/**
 * 虚拟商品订单
 */
// 获取虚拟商品订单信息
export const getVirtualOrderInfo = (id) => axios.get('virtualGoodsOrder/info/' + id)

// 获取虚拟商品订单列表
export const getVirtualOrderList = (paramObj) => axios.post('virtualGoodsOrder/pageQuery', paramObj)

// 订单补充
export const supplyRechargeOrder = (ids) => axios.get('virtualGoodsOrder/change/' + ids)

/**
 * 售后订单
 */
// 申请实物订单售后
export const applyRefundEntityOrder = (paramObj) => axios.put('physicalGoodsOrder/apply/refund/' + paramObj.id + '/' + paramObj.reason)

// 申请虚拟订单售后
export const applyRefundVirtualOrder = (paramObj) => axios.put('virtualGoodsOrder/apply/refund/' + paramObj.id + '/' + paramObj.reason)

// 获取售后订单信息
export const getRefundOrderInfo = (id) => axios.get('orderRefund/info/' + id)

// 获取佣金结算清单列表
export const getRefundOrderList = (paramObj) => axios.post('orderRefund/list', paramObj)

// 确认退款
export const setRefundOrder = (id) => axios.get('orderRefund/refund/' + id)

/**
 * 佣金方案
 */
// 获取佣金方案信息
export const getBrokeragePlanInfo = (id) => axios.get('commission/info/' + id)

// 添加佣金方案
export const addBrokeragePlan = (paramObj) => axios.post('commission/add', paramObj)

// 编辑佣金方案
export const modifyBrokeragePlan = (paramObj) => axios.post('commission/modify', paramObj)

// 删除佣金方案
export const removeBrokeragePlan = (id) => axios.delete('commission/remove/' + id)

// 启用or禁用佣金方案
export const setBrokeragePlanState = (paramObj) => axios.post('commission/modifyState', paramObj)

// 批量启用or禁用佣金方案
export const setBatchBrokeragePlanState = (paramObj) => axios.put('commission/modifyEnabledState/' + paramObj.state + '/' + paramObj.idArr)

// 获取佣金方案列表
export const getBrokeragePlanList = (paramObj) => axios.post('commission/list', paramObj)

/**
 * 佣金方案比例
 */
// 获取佣金比例信息
export const getPlanProInfo = (id) => axios.get('commissionPlan/info/' + id)

// 添加佣金比例
export const addPlanPro = (paramObj) => axios.post('commissionPlan/add', paramObj)

// 编辑佣金比例
export const modifyPlanPro = (paramObj) => axios.post('commissionPlan/modify', paramObj)

// 删除佣金比例
export const removePlanPro = (id) => axios.delete('commissionPlan/remove/' + id)

// 启用禁用佣金比例
export const setPlanProState = (paramObj) => axios.post('commissionPlan/modifyState', paramObj)

// 批量启用or禁用佣金方案
export const setBatchPlanProState = (paramObj) => axios.put('commissionPlan/modifyEnabledState/' + paramObj.state + '/' + paramObj.idArr)

// 获取佣金比例列表
export const getPlanProList = (paramObj) => axios.post('commissionPlan/list', paramObj)

/**
 * 佣金规则
 */
// 删除佣金规则
export const removePlanRule = (id) => axios.delete('commissionPlanRule/remove/' + id)

// 批量启用or禁用佣金方案规则
export const setBatchPlanRuleState = (paramObj) => axios.put('commissionPlanRule/modifyEnabledState/' + paramObj.state + '/' + paramObj.idArr)

/**
 * 商品佣金 商品分类清单
 */
// 获取佣金商品列表
export const getBGsCyList = (paramObj) => axios.post('commissionPlanRule/list', paramObj)

/**
 * 分佣订单
 */

// 冲正分佣订单
export const correctBrokerageOrder = (paramObj) => axios.post('commissionRecordDesc/correct', paramObj)

// 获取分佣订单列表
export const getBrokerageOrderList = (paramObj) => axios.post('commissionRecordDesc/list', paramObj)

/**
 * 佣金结算清单
 */

// 获取佣金结算清单列表
export const getBrokerageSettlementList = (paramObj) => axios.post('commissionGeneral/list', paramObj)

// 冲正佣金结算清单
export const correctSettlement = (paramObj) => axios.put('commissionGeneral/reverse', paramObj)

// 结算佣金结算清单
export const setSettlement = (paramObj) => axios.put('commissionGeneral/settlement', paramObj)
