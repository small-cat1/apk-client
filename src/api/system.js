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

