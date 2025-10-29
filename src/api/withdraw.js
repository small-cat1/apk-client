import service from '@/utils/request'

// 用户提现申请
export const userWithdraw = (data) => {
  return service({
    url: '/withdraw',
    method: 'post',
    data
  })
}



// 获取提现配置
export const getWithdrawConfig = () => {
  return service({
    url: '/withdraw/config',
    method: 'get',
  })
}


// 获取用户提现记录列表
export const getWithdrawRecords = (params) => {
  return service({
    url: '/withdraw/records',
    method: 'get',
    params
  })
}
