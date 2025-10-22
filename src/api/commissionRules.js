import service from '@/utils/request'

/**
 * 获取分类列表
 */
export const getCommissionRules = () => {
  return service({
    url: '/commissionTier',
    method: 'get'
  })
}
