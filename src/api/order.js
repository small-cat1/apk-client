import service from '@/utils/request'

/**
 * 账号商品下单
 */
export function createAccountOrder(data) {
  return service({
    url: '/api/order/account',
    method: 'post',
    data
  })
}

/**
 * 会员套餐下单
 */
export function createMembershipOrder(data) {
  return service({
    url: '/api/order/membership',
    method: 'post',
    data
  })
}


/**
 * 获取订单列表
 */
export function getOrderList(params) {
  return service({
    url: '/api/order/list',
    method: 'get',
    params
  })
}


/**
 * 获取订单详情
 */
export function getOrderDetail(orderId) {
  return service({
    url: `/api/order/${orderId}`,
    method: 'get'
  })
}


