import service from '@/utils/request'



/**
 * 获取客服配置
 */
export function getCustomerServiceConfig() {
  return service({
    url: '/customer-service/config',
    method: 'get'
  })
}


/**
 * 更新客服配置 (后台管理用)
 */
export function updateCustomerServiceConfig(data) {
  return request({
    url: '/api/system/customer-service/config',
    method: 'put',
    data
  })
}
