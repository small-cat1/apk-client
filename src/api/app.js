import service from '@/utils/request'



export const downloadApp = (data) => {
  return service({
    url: '/app/downloadApp',
    method: 'post',
    data:data
  })
}


export const searchApps = (params) => {
  return service({
    url: '/app/searchApp',
    method: 'get',
    params
  })
}


