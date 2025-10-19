import {login, getUserInfo, logout} from '@/api/user'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import {showFailToast, showLoadingToast} from "vant";

export const useUserStore = defineStore('user', () => {
  const loadingInstance = ref(null)
  const userInfo = ref({
    id:"",
    uuid:'',
    username: "北城流年",
    email: "1111@qq.com",
    phone: "13163707701",
    account_status: 1,
    referral_code:"",
    last_login_at:"",
    last_login_ip:"",
    memberships:[]
  })
  const token = useStorage('token', '')
  const currentToken = computed(() => token.value || '')
  const setUserInfo = (val) => {
    userInfo.value = val
  }
  const setToken = (val) => {
    token.value = val
  }
  const ResetUserInfo = (value = {}) => {
    userInfo.value = {
      ...userInfo.value,
      ...value
    }
  }
  /* 获取用户信息*/
  const GetUserInfo = async () => {
    const res = await getUserInfo()
    if (res.code === 0) {
      setUserInfo(res.data.userInfo)
    }
    return res
  }
  /* 登录*/
  const LoginIn = async (loginInfo) => {
    try {
      loadingInstance.value = showLoadingToast({
        message: '登录中，请稍候...',
        forbidClick: true,
      })
      const res = await login(loginInfo)
      if (res.code === 0) {
        // 登陆成功，设置用户信息和权限相关信息
        setUserInfo(res.data.user)
        setToken(res.data.token)
      }
      return res
      // 全部操作均结束，关闭loading并返回
    } catch (error) {
      console.error('LoginIn error:', error)
      showFailToast("登录失败,"+error)
    } finally {
      loadingInstance.value?.close()
    }
  }
  /* 登出*/
  const LoginOut = async () => {
    const res = await logout()
    // 登出失败
    if (res.code !== 0) {
      return
    }
    await ClearStorage()
    // 把路由定向到登录页，无需等待直接reload
    window.location.reload()
  }
  /* 清理数据 */
  const ClearStorage = async () => {
    token.value = ''
    // 使用remove方法正确删除cookie
    sessionStorage.clear()
  }

  return {
    userInfo,
    token: currentToken,
    ResetUserInfo,
    GetUserInfo,
    LoginIn,
    LoginOut,
    setToken,
    loadingInstance,
    ClearStorage
  }
})
