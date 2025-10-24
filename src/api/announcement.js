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

// 标记公告为已读
export function markAnnouncementAsRead(data) {
  return service({
    url: '/announcement/mark-read',
    method: 'post',
    data
  })
}

