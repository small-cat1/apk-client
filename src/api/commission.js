import service from '@/utils/request'

/**
 * 获取佣金规则
 */
export const getCommissionRules = () => {
  return service({
    url: '/commissionTier',
    method: 'get'
  })
}


/**
 * 获取佣金明细
 */
export const getCommissionDetail = () => {
  return service({
    url: '/commissionDetail/getCommissionDetailList',
    method: 'get'
  })
}
