
import { useStorage } from '@vueuse/core'

export class InviteCodeManager {
  static EXPIRE_DAYS = 7

  // 使用 VueUse 的响应式存储
  static inviteCode = useStorage('inviteCode', null)
  static inviteCodeTime = useStorage('inviteCodeTime', null)

  // 获取当前有效的邀请码
  static get() {
    const code = this.inviteCode.value
    const time = this.inviteCodeTime.value

    if (!code) return null

    // 检查是否过期
    if (time) {
      const days = (Date.now() - parseInt(time)) / (1000 * 60 * 60 * 24)
      if (days > this.EXPIRE_DAYS) {
        this.clear()
        return null
      }
    }

    return code
  }

  // 保存邀请码（带策略）
  static set(newCode, force = false) {
    const existingCode = this.get()

    // 策略1: 如果已存在且未过期，不覆盖（除非 force=true）
    if (existingCode && !force) {
      console.log('已有有效邀请码，跳过保存:', existingCode)
      return false
    }

    this.inviteCode.value = newCode
    this.inviteCodeTime.value = Date.now().toString()
    console.log('邀请码已保存:', newCode)
    return true
  }

  // 强制更新邀请码
  static forceSet(newCode) {
    return this.set(newCode, true)
  }

  // 清除邀请码
  static clear() {
    this.inviteCode.value = null
    this.inviteCodeTime.value = null
  }

  // 用户注册成功后清除
  static clearOnRegister() {
    this.clear()
    console.log('注册成功，邀请码已清除')
  }

  // 检查邀请码是否过期
  static isExpired() {
    const time = this.inviteCodeTime.value
    if (!time) return true

    const days = (Date.now() - parseInt(time)) / (1000 * 60 * 60 * 24)
    return days > this.EXPIRE_DAYS
  }

  // 获取邀请码剩余天数
  static getRemainingDays() {
    const time = this.inviteCodeTime.value
    if (!time) return 0

    const days = this.EXPIRE_DAYS - (Date.now() - parseInt(time)) / (1000 * 60 * 60 * 24)
    return Math.max(0, Math.ceil(days))
  }
}

// 如果你想在组件中使用响应式的邀请码
export function useInviteCode() {
  const inviteCode = useStorage('inviteCode', null)
  const inviteCodeTime = useStorage('inviteCodeTime', null)

  const get = () => InviteCodeManager.get()
  const set = (code, force = false) => InviteCodeManager.set(code, force)
  const clear = () => InviteCodeManager.clear()
  const isExpired = () => InviteCodeManager.isExpired()
  const getRemainingDays = () => InviteCodeManager.getRemainingDays()

  return {
    inviteCode,
    inviteCodeTime,
    get,
    set,
    clear,
    isExpired,
    getRemainingDays
  }
}
