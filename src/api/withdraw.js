import service from '@/utils/request'

// 用户提现申请
export const userWithdraw = (data) => {
  return service({
    url: '/user/withdraw',
    method: 'post',
    data
  })
}



// 用户提现申请
export const getWithdrawConfig = () => {
  return service({
    url: '/user/withdraw-config',
    method: 'get',
  })
}
