import service from '@/utils/request'

// @Summary 获取验证码
// @Produce  application/json
// @Router /base/captcha [post]
export const captcha = () => {
  return service({
    url: '/captcha',
    method: 'get'
  })
}

// @Summary 用户登录
// @Produce  application/json
// @Param data body {username:"string",password:"string"}
// @Router /base/login [post]
export const login = (data) => {
  return service({
    url: '/base/login',
    method: 'post',
    data: data
  })
}

// @Summary 用户注册
// @Produce  application/json
// @Router /base/register [post]
export const register = (data) => {
  return service({
    url: '/base/register',
    method: 'post',
    data: data
  })
}

export const logout = (data) => {
  return service({
    url: '/user/logout',
    method: 'post',
    data: data
  })
}




// @Summary 修改密码
// @Produce  application/json
// @Param data body {username:"string",password:"string",newPassword:"string"}
// @Router /user/changePassword [post]
export const changePassword = (data) => {
  return service({
    url: '/user/changePassword',
    method: 'post',
    data: data
  })
}


export const sendSmsCode = (data) => {
  return service({
    url: '/user/sendSmsCode',
    method: 'post',
    data: data
  })
}

export const resetPasswordByPhone = (data) => {
  return service({
    url: '/user/resetPasswordByPhone',
    method: 'post',
    data: data
  })
}

export const sendResetEmail = (data) => {
  return service({
    url: '/user/sendResetEmail',
    method: 'post',
    data: data
  })
}



// @Tags SysUser
// @Summary 设置用户信息
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body model.SysUser true "设置用户信息"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"修改成功"}"
// @Router /user/setSelfInfo [put]
export const setSelfInfo = (data) => {
  return service({
    url: '/user/setSelfInfo',
    method: 'put',
    data: data
  })
}

// @Tags User
// @Summary 获取用户信息
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Success 200 {string} json "{"success":true,"data":{},"msg":"获取成功"}"
// @Router /user/getUserInfo [get]
export const getUserInfo = () => {
  return service({
    url: '/user/getUserInfo',
    method: 'get'
  })
}




