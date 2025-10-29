import {login, getUserInfo, logout} from '@/api/user'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import {showFailToast, showLoadingToast} from "vant"

export const useUserStore = defineStore('user', () => {
  const loadingInstance = ref(null)
  const userInfo = ref({
    // 基本信息
    id: 0,
    uuid: '',
    username: '',
    email: '',
    phone: '',

    // 账户状态
    accountStatus: '',
    accountStatusText: '',
    emailVerified: false,
    phoneVerified: false,
    twoFactorEnabled: false,

    // 推荐码
    referralCode: '',

    // 登录信息
    loginCount: 0,
    lastLoginAt: null,
    createdAt: null,

    // 聚合信息
    isVerified: false,
    hasMembership: false,
    isNewUser: false,
    securityLevel: '',

    // ✅ 会员信息（单个对象，匹配后端）
    membership: null,

    // 佣金信息
    commission: null,

    // 统计信息
    statistics: null,

    // 推荐信息
    referral: null,
  })

  const token = useStorage('token', '')
  const currentToken = computed(() => token.value || '')

  // ==================== 会员相关 Computed ====================

  // ✅ 是否有会员
  const hasMembership = computed(() => {
    return userInfo.value.membership !== null && userInfo.value.membership !== undefined
  })

  // ✅ 获取会员信息
  const membershipInfo = computed(() => {
    return userInfo.value.membership
  })

  // ✅ 会员套餐名称
  const membershipPlanName = computed(() => {
    return userInfo.value.membership?.planName || '未开通'
  })

  // ✅ 会员到期时间
  const membershipExpireAt = computed(() => {
    return userInfo.value.membership?.expireAt || null
  })

  // ✅ 是否是终身会员
  const isLifetimeMembership = computed(() => {
    return userInfo.value.membership && !userInfo.value.membership.expireAt
  })

  // ✅ 会员是否已过期
  const isMembershipExpired = computed(() => {
    if (!userInfo.value.membership) return true
    if (!userInfo.value.membership.expireAt) return false // 终身会员
    return new Date(userInfo.value.membership.expireAt) < new Date()
  })

  // ✅ 会员状态文本
  const membershipStatusText = computed(() => {
    if (!userInfo.value.membership) return '未开通'
    if (!userInfo.value.membership.expireAt) return '终身会员'
    if (new Date(userInfo.value.membership.expireAt) < new Date()) return '已过期'
    return '正常'
  })

  // ✅ 会员剩余天数
  const membershipRemainingDays = computed(() => {
    if (!userInfo.value.membership?.expireAt) return null
    const now = new Date()
    const expireDate = new Date(userInfo.value.membership.expireAt)
    const diff = expireDate - now
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  })

  // ==================== 其他信息 Computed ====================

  // 佣金可用余额
  const commissionAvailable = computed(() => {
    return userInfo.value.commission?.available || 0
  })

  // 总收益
  const commissionTotal = computed(() => {
    return userInfo.value.commission?.total || 0
  })

  // 下载次数
  const downloadCount = computed(() => {
    return userInfo.value.statistics?.downloads || 0
  })

  // 订单数
  const orderCount = computed(() => {
    return userInfo.value.statistics?.orders || 0
  })

  // 推荐人数
  const referralCount = computed(() => {
    return userInfo.value.referral?.directCount || 0
  })

  // ==================== Actions ====================

  const setUserInfo = (val) => {
    userInfo.value = {
      ...userInfo.value,
      ...val,
      // ✅ 确保 membership 字段正确（防止 undefined）
      membership: val.membership || null,
      commission: val.commission || null,
      statistics: val.statistics || null,
      referral: val.referral || null,
    }
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
    sessionStorage.clear()
    // ✅ 重置用户信息
    userInfo.value = {
      id: 0,
      uuid: '',
      username: '',
      membership: null,
      commission: null,
      statistics: null,
      referral: null,
    }
  }

  return {
    // State
    userInfo,
    token: currentToken,
    loadingInstance,

    // ✅ 会员相关 Computed
    hasMembership,
    membershipInfo,
    membershipPlanName,
    membershipExpireAt,
    isLifetimeMembership,
    isMembershipExpired,
    membershipStatusText,
    membershipRemainingDays,

    // ✅ 其他信息 Computed
    commissionAvailable,
    commissionTotal,
    downloadCount,
    orderCount,
    referralCount,

    // Actions
    ResetUserInfo,
    GetUserInfo,
    LoginIn,
    LoginOut,
    setToken,
    ClearStorage
  }
})
