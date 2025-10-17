import service from '@/utils/request'

// 获取热门分类
export const getTrendingCategory = () => {
  return service({
    url: '/getTrendingCategory',
    method: 'get',
  })
}


// 获取热门或者推荐的应用
export const getHotOrRecommendApplications = (data) => {
  return service({
    url: '/getHotOrRecommendApplications',
    method: 'get',
    data: data
  })
}
