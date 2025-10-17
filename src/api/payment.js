import service from "@/utils/request.js";


/**
 * 支付订单
 */
export function payOrder(data) {
  return service({
    url: '/api/order/pay',
    method: 'post',
    data
  })
}



export function getPaymentMethods(params) {
  return service({
    url: '/paymentMethods',
    method: 'get',
    params
  })
}
