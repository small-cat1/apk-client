import service from '@/utils/request'

/**
 * 获取应用分类
 */
export function getAppCategories() {
  return service({
    url: '/api/account/apps',
    method: 'get'
  })
}

/**
 * 获取账户套餐列表
 */
export function getAccountPackages(params) {
  return service({
    url: '/api/account/packages',
    method: 'get',
    params
  })
}
