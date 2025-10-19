import service from "@/utils/request.js";


export const getAnnouncementList = (params) => {
  return service({
    url: '/getAnnouncementList',
    method: 'get',
    params
  })
}


export const getAnnouncementDetail = (params) => {
  return service({
    url: '/getAnnouncementDetail',
    method: 'get',
    params
  })
}
