import service from '@/utils/request'

/**
 * 获取分类列表
 */
export const getCategoryList = () => {
  return service({
    url: '/categories',
    method: 'get'
  })
}

// 获取账号列表的应用分类
export const getAccountCategoryList = () => {
  return service({
    url: '/account/categories',
    method: 'get'
  })
}

/**
 * 获取分类下的应用列表
 */
export const getCategoryApps = (params) => {
  return service({
    url: '/categories/apps',
    method: 'get',
    params
  })
}

// 根据分类获取账号应用
export const getAccountAppListByCategory = (params) => {
  return service({
    url: '/categories/account/apps',
    method: 'get',
    params
  })
}


