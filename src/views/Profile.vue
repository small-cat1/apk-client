<template>
  <div class="profile">
    <van-nav-bar title="个人中心" fixed />

    <div class="content" >
      <!-- 用户信息区域 -->
      <div class="user-section">
        <template v-if="userStore.token">
          <!-- 已登录状态 -->
          <div class="user-info">
            <van-image
              v-if="userInfo.avatar"
              class="avatar"
              :src="userInfo.avatar"
              round
              width="60"
              height="60"
            />
            <div v-else class="avatar-icon">
              <van-icon name="user-o" size="30" />
            </div>
            <div class="user-details">
              <div class="username">{{ userInfo.username }}</div>
              <div class="user-level">
                <van-tag :type="memberships > 0 ? 'success' : 'default'">
                  {{ memberships > 0 ? 'VIP会员' : '普通用户' }}
                </van-tag>
              </div>
            </div>
            <van-icon name="arrow" />
          </div>

          <!-- VIP信息 -->
          <div v-if="memberships > 0" class="vip-info">
            <div class="vip-title">
              <van-icon name="diamond-o" color="#ff6b35" />
              VIP特权
            </div>
            <div class="vip-expire">
              到期时间：{{ formatDate(userInfo.vipExpireTime) }}
            </div>
          </div>


        </template>

        <template v-else>
          <!-- 未登录状态 -->
          <div class="guest-info" @click="showAuth">
            <div class="avatar-icon">
              <van-icon name="user-o" size="30" />
            </div>
            <div class="guest-details">
              <div class="guest-title">点击登录</div>
              <div class="guest-subtitle">登录后享受更多服务</div>
            </div>
            <van-icon name="arrow" />
          </div>
        </template>

      </div>
      <!-- 【新增】系统公告卡片（位置1：用户信息下方） -->
      <div  class="announcement-card">
        <div class="announcement-header">
          <div class="header-left">
            <van-icon name="volume-o" color="#ff6b35" size="18" />
            <span>系统公告</span>
          </div>
          <div class="header-right" @click="goToAnnouncementList">
            <span>查看全部</span>
            <van-icon name="arrow" />
          </div>
        </div>
      </div>

      <!-- 推广邀请卡片（精简版） -->
      <div v-if="userStore.token" class="invite-section">
        <van-cell-group inset>
          <div class="invite-card-mini">
            <div class="invite-header-mini">
              <div class="invite-title-mini">
                <van-icon name="friends-o" size="18" color="#07c160" />
                <span>邀请推广</span>
              </div>
              <van-tag type="success" size="medium">赚佣金</van-tag>
            </div>

            <!-- 邀请码 -->
            <div class="invite-code-mini">
              <div class="code-left">
                <span class="code-label-mini">邀请码</span>
                <span class="code-value-mini">{{ userInfo.referral_code }}</span>
              </div>
              <div class="code-buttons">
                <van-button
                  size="mini"
                  type="primary"
                  plain
                  icon="records"
                  @click="copyInviteCode"
                >
                  复制
                </van-button>
                <van-button
                  size="mini"
                  type="success"
                  icon="share-o"
                  @click="shareInvite"
                >
                  分享
                </van-button>
              </div>
            </div>
          </div>
        </van-cell-group>
      </div>
      <!-- 功能菜单 -->
      <div class="menu-section">
        <van-cell-group inset>
          <van-cell
            v-if="userStore.token"
            title="推广收益"
            icon="gold-coin-o"
            is-link
            @click="goToCommissionPage"
          >
          </van-cell>
          <van-cell
            v-if="userStore.token"
            title="我的下级"
            icon="friends-o"
            is-link
            @click="goToSubordinateList"
          >
            <template #value>
              <van-tag v-if="inviteStats.totalSubordinates > 0" type="success">
                {{ inviteStats.totalSubordinates }}人
              </van-tag>
            </template>
          </van-cell>
          <van-cell
            v-if="userStore.token"
            title="分佣明细"
            icon="balance-list-o"
            is-link
            @click="goToCommissionDetail"
          >
            <template #value>
              <span style="color: #ff6b35;">¥{{ commissionData.totalEarnings.toFixed(2) }}</span>
            </template>
          </van-cell>
          <van-cell
            v-if="userStore.token"
            title="提现"
            icon="balance-pay"
            is-link
            @click="goToWithdraw"
          >
            <template #value>
              <span style="color: #07c160;">¥{{ commissionData.availableAmount.toFixed(2) }}</span>
            </template>
          </van-cell>

          <van-cell
            v-if="userStore.token"
            title="分佣规则"
            icon="description"
            is-link
            @click="goToCommissionRules"
          >
            <template #label>
              <span style="font-size: 12px; color: #ff6b35;">当前比例：{{ currentCommissionRate }}%</span>
            </template>
          </van-cell>
          <van-cell
            v-if="userStore.token"
            title="提现记录"
            icon="bill-o"
            is-link
            @click="goToWithdrawRecord"
          />
          <van-cell
            v-if="userStore.token"
            title="会员权益"
            icon="gem-o"
            is-link
            @click="goToUserMemberships"
          />
          <van-cell
            v-if="userStore.token"
            title="订单列表"
            icon="orders-o"
            is-link
            @click="goToOrder"
          />
        </van-cell-group>
      </div>

      <!-- VIP升级 -->
      <div v-if="userStore.token && !userInfo.isVip" class="vip-section">
        <van-cell-group inset>
          <van-cell
            title="开通VIP"
            label="解锁所有应用，享受专属特权"
            icon="diamond-o"
            is-link
            @click="goToVip"
          >
            <template #right-icon>
              <van-tag type="warning">限时优惠</van-tag>
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <div v-if="userStore.token && userInfo.isVip" class="vip-section">
        <van-cell-group inset>
          <van-cell
            title="网络推荐"
            label="解锁网络限制，享受自由世界"
            icon="bar-chart-o"
            is-link
            @click="goToVip"
          >
          </van-cell>
        </van-cell-group>
      </div>

      <!-- 设置菜单 -->
      <div class="menu-section">
        <van-cell-group inset>
          <van-cell v-if="userStore.token" title="设置" icon="setting-o" is-link @click="goToSettings" />
          <van-cell title="关于我们" icon="info-o" is-link @click="goToAbout" />
          <van-cell
            v-if="userStore.token"
            title="退出登录"
            icon="sign"
            @click="handleLogout"
            title-style="color: #ee0a24"
          />
        </van-cell-group>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, watch, onUnmounted} from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/pinia'
import { showDialog, showToast } from 'vant'
import { emitter } from "@/utils/bus.js"

const router = useRouter()
const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo || {})
const memberships = computed(() => userStore.userInfo.memberships.length || 0)
// 当前分佣比例
const currentCommissionRate = ref(10)
// 最低提现金额
const minWithdrawAmount = ref(10)



// 分佣数据
const commissionData = ref({
  availableAmount: 0,
  totalEarnings: 0,
  withdrawnAmount: 0,
  frozenAmount: 0
})

// 邀请统计数据
const inviteStats = ref({
  totalSubordinates: 0,
  todayConsumption: 0,
  todayCommission: 0,
  monthCommission: 0
})
// 【新增】公告相关数据
const latestAnnouncements = ref([])
const unreadAnnouncementCount = ref(0)

// 【新增】获取最新公告（首页显示3条）
const fetchLatestAnnouncements = async () => {
  try {
    // TODO: 调用后端API
    // const res = await api.getLatestAnnouncements({ limit: 3 })
    // latestAnnouncements.value = res.data.list
    // unreadAnnouncementCount.value = res.data.unreadCount

    // 示例数据
    latestAnnouncements.value = [
      {
        id: 1,
        title: '分佣规则将于3天后调整，请及时查看',
        type: 2, // 1=紧急，2=重要，3=普通
        createdAt: new Date().getTime() - 2 * 60 * 60 * 1000,
        isRead: false
      },
      {
        id: 2,
        title: 'VIP会员权益升级通知',
        type: 3,
        createdAt: new Date().getTime() - 24 * 60 * 60 * 1000,
        isRead: true
      },
      {
        id: 3,
        title: '系统维护通知：今晚22:00-24:00',
        type: 1,
        createdAt: new Date().getTime() - 3 * 60 * 60 * 1000,
        isRead: false
      }
    ]
    unreadAnnouncementCount.value = 2

  } catch (error) {
    console.error('获取公告失败:', error)
  }

}

// 【新增】获取公告类型文本
const getTypeText = (type) => {
  const map = {
    1: '紧急',
    2: '重要',
    3: '通知'
  }
  return map[type] || '通知'
}

// 【新增】格式化时间
const formatTime = (timestamp) => {
  const now = new Date().getTime()
  const diff = now - timestamp

  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`
  } else if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
  } else if (diff < 7 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`
  } else {
    const date = new Date(timestamp)
    return `${date.getMonth() + 1}-${date.getDate()}`
  }
}

// 【新增】跳转到公告列表
const goToAnnouncementList = () => {
  router.push('/announcementList')
}

// 【新增】跳转到公告详情
const goToAnnouncementDetail = (item) => {
  router.push({
    path: '/announcementDetail',
    query: { id: item.id }
  })
}


// 获取分佣数据
const fetchCommissionData = async () => {
  try {
    // TODO: 调用后端API
    // const res = await api.getCommissionData()
    // commissionData.value = res.data

    // 示例数据
    commissionData.value = {
      availableAmount: 158.50,
      totalEarnings: 2580.30,
      withdrawnAmount: 2400.00,
      frozenAmount: 21.80
    }
  } catch (error) {
    console.error('获取分佣数据失败:', error)
  }
}

// 获取邀请统计
const fetchInviteStats = async () => {
  try {
    // TODO: 调用后端API
    // const res = await api.getInviteStats()
    // inviteStats.value = res.data

    // 示例数据
    inviteStats.value = {
      totalSubordinates: 48,
      todayConsumption: 235.60,
      todayCommission: 23.56,
      monthCommission: 580.30
    }
  } catch (error) {
    console.error('获取邀请统计失败:', error)
  }
}

// 获取当前分佣比例
const fetchCommissionRate = async () => {
  try {
    currentCommissionRate.value = 10
  } catch (error) {
    console.error('获取分佣比例失败:', error)
  }
}
// 复制邀请码
const copyInviteCode = () => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(userInfo.value.referral_code).then(() => {
      showToast({
        message: '邀请码已复制',
        type: 'success'
      })
    }).catch(() => {
      fallbackCopy(userInfo.value.referral_code)
    })
  } else {
    fallbackCopy(userInfo.value.referral_code)
  }
}

// 备用复制方法
const fallbackCopy = (text) => {
  const input = document.createElement('input')
  input.value = text
  document.body.appendChild(input)
  input.select()
  document.execCommand('copy')
  document.body.removeChild(input)
  showToast({
    message: '已复制到剪贴板',
    type: 'success'
  })
}

// 分享邀请
const shareInvite = () => {
  const inviteUrl = `${window.location.origin}/register?code=${userInfo.value.referral_code}`
  const shareText = `【推广赚钱】使用我的邀请码 ${userInfo.value.referral_code} 注册，一起赚取收益！注册链接：${inviteUrl}`

  if (navigator.share) {
    navigator.share({
      title: '邀请好友注册',
      text: shareText,
      url: inviteUrl
    }).then(() => {
      showToast('分享成功')
    }).catch((error) => {
      if (error.name !== 'AbortError') {
        fallbackCopy(shareText)
      }
    })
  } else {
    fallbackCopy(shareText)
    showToast({
      message: '推广链接已复制，快去分享吧！',
      type: 'success',
      duration: 3000
    })
  }
}

// 去收益详情页
const goToCommissionPage = () => {
  router.push('/commissionPage')
}

// 去提现页面
const goToWithdraw = () => {
  if (commissionData.value.availableAmount < minWithdrawAmount.value) {
    showToast(`最低提现金额为 ¥${minWithdrawAmount.value}`)
    return
  }
  router.push('/withdraw')
}

// 查看下级列表
const goToSubordinateList = () => {
  router.push('/subordinateList')
}

// 查看分佣明细
const goToCommissionDetail = () => {
  router.push('/commissionDetail')
}

// 查看提现记录
const goToWithdrawRecord = () => {
  router.push('/withdrawRecord')
}

// 查看分佣规则
const goToCommissionRules = () => {
  router.push('/commissionRules')
}
const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('zh-CN')
}

const goToUserMemberships = () => {
  if(userInfo.value.memberships?.length === 0){
    showToast("普通会员暂无权益！")
    return
  }
  router.push('/userMemberships')
}

const goToOrder = () => {
  router.push('/orderList')
}

const goToVip = () => {
  router.push('/package')
}

const goToSettings = () => {
  router.push('/settings')
}

const goToAbout = () => {
  router.push('/about')
}

const showAuth = () => {
  emitter.emit("show-login-modal")
}

const handleLogout = () => {
  showDialog({
    title: '提示',
    message: '确定要退出登录吗？'
  }).then(() => {
    userStore.LoginOut()
    showToast({
      message: '已退出登录',
      type: 'success'
    })
  }).catch(() => {
    // 取消退出
  })
}
const handleAuthSuccess = (context) => {
  if (context?.source === 'download') {
    window.location.reload()
  }
}

onMounted(() => {
  if (userStore.token) {
    fetchCommissionData()
    fetchInviteStats()
    fetchCommissionRate()
    fetchLatestAnnouncements() // 【新增】获取公告
    emitter.on('auth-success', handleAuthSuccess)
  }
})

onUnmounted(() => {
  emitter.off('auth-success', handleAuthSuccess)
})
</script>

<style scoped>
.profile {
  background: #f7f8fa;
  min-height: 100vh;
}

.content {
  padding: 44px 0 60px 0;
}

/* 用户信息区域 */
.user-section {
  margin: 12px;
  background: white;
  border-radius: 8px;
  padding: 20px 16px;
}

.user-info, .guest-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.avatar-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.user-details, .guest-details {
  flex: 1;
  margin-left: 12px;
}

.username {
  font-size: 18px;
  font-weight: bold;
  color: #323233;
}

.user-level {
  margin-top: 4px;
}

.guest-title {
  font-size: 16px;
  color: #323233;
}

.guest-subtitle {
  font-size: 12px;
  color: #969799;
  margin-top: 4px;
}

.vip-info {
  margin-top: 16px;
  padding: 12px;
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  border-radius: 8px;
  color: white;
}

.vip-title {
  display: flex;
  align-items: center;
  font-weight: bold;
  margin-bottom: 8px;
}

.vip-title .van-icon {
  margin-right: 4px;
}

.vip-benefits {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.vip-benefits span {
  font-size: 12px;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
}

.vip-expire {
  font-size: 12px;
  opacity: 0.9;
}

/* 推广收益折叠区域 */
.promotion-section {
  margin: 12px 0;
}

.promotion-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #fff9f0, #fff);
  cursor: pointer;
  transition: background 0.3s;
}

.promotion-summary:active {
  background: #fff5eb;
}

.summary-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-title {
  font-size: 14px;
  color: #646566;
}

.summary-amount {
  font-size: 20px;
  font-weight: bold;
  color: #ff6b35;
}

.summary-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-icon {
  color: #969799;
  transition: transform 0.3s;
}

/* 折叠详情内容 */
.commission-detail {
  padding: 16px;
  background: white;
}

.earnings-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 16px 0;
  background: #f7f8fa;
  border-radius: 8px;
  margin-bottom: 12px;
}

.earning-item {
  text-align: center;
  flex: 1;
}

.earning-value {
  font-size: 18px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 4px;
}

.earning-label {
  font-size: 12px;
  color: #969799;
}

.earning-divider {
  width: 1px;
  height: 30px;
  background: #ebedf0;
}

.today-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.today-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f7f8fa;
  border-radius: 6px;
  font-size: 13px;
  color: #646566;
}

/* 邀请推广卡片 */
/* 邀请推广卡片（精简版） */
.invite-section {
  margin: 12px 0;
}

.invite-card-mini {
  padding: 12px 16px;
}

.invite-header-mini {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.invite-title-mini {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: bold;
  color: #323233;
}

.invite-code-mini {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: linear-gradient(135deg, #f0fff4, #fff);
  border: 1px solid #07c160;
  border-radius: 8px;
}

.code-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.code-label-mini {
  font-size: 12px;
  color: #969799;
}

.code-value-mini {
  font-size: 16px;
  font-weight: bold;
  color: #07c160;
  letter-spacing: 1px;
}

.code-buttons {
  display: flex;
  gap: 8px;
}

.menu-section {
  margin: 12px 0;
}

.vip-section {
  margin: 12px 0;
}

/* 【新增】公告卡片样式 */
.announcement-card {
  margin: 12px;
  background: white;
  border-radius: 8px;
  padding: 12px 16px;
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: bold;
  color: #323233;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #969799;
  cursor: pointer;
}

.announcement-swipe {
  min-height: 60px;
}

.announcement-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  cursor: pointer;
}

.announcement-badge {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
  color: white;
}

.announcement-badge.type-1 {
  background: #ff4d4f;
}

.announcement-badge.type-2 {
  background: #fa8c16;
}

.announcement-badge.type-3 {
  background: #1890ff;
}

.announcement-content {
  flex: 1;
  min-width: 0;
}

.announcement-title {
  font-size: 14px;
  color: #323233;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.announcement-time {
  font-size: 12px;
  color: #969799;
}
</style>
