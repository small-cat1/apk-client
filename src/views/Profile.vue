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
                <van-tag :type="hasMembership ? 'success' : 'default'">
                  {{ hasMembership ? 'VIP会员' : '普通用户' }}
                </van-tag>
              </div>
            </div>
            <van-icon name="arrow" />
          </div>

          <!-- VIP信息 -->
          <div v-if="hasMembership" class="vip-info">
            <div class="vip-title">
              <van-icon name="diamond-o" color="#ff6b35" />
              VIP特权
            </div>
            <div class="vip-expire">
              到期时间：{{ formatDate(membershipInfo.ExpireAt) }}
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

      <!-- 系统公告卡片 -->
      <div class="announcement-card">
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

      <!-- ✅ 邀请推广卡片（简化版 - 点击直接显示二维码） -->
      <div v-if="userStore.token" class="invite-section">
        <van-cell-group inset>
          <div class="invite-card-simple" @click="showQRCode">
            <div class="invite-content">
              <div class="invite-title-mini">
                <van-icon name="friends-o" size="18" color="#07c160" />
                <span>邀请推广</span>
              </div>
              <div class="invite-subtitle">点击查看推广二维码</div>
            </div>
            <div class="invite-right">
              <van-tag type="success" size="medium">赚佣金</van-tag>
              <van-icon name="arrow" size="16" color="#969799" />
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
              <van-tag v-if="referralCount > 0" type="success">
                {{ referralCount }}人
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
              <span style="color: #ff6b35;">¥{{ commissionTotal.toFixed(2) }}</span>
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
              <span style="color: #07c160;">¥{{ commissionAvailable.toFixed(2) }}</span>
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

    <!-- ✅ 二维码弹窗（简化版） -->
    <van-popup
      v-model:show="showQRCodePopup"
      round
      closeable
      :style="{ padding: '30px 20px', width: '85%', maxWidth: '340px' }"
    >
      <div class="qrcode-popup">
        <div class="qrcode-title">
          <van-icon name="qrcode" size="24" color="#07c160" />
          <span>推广二维码</span>
        </div>

        <div class="qrcode-desc">
          分享此二维码给好友，好友扫码注册后<br />您即可获得推广收益
        </div>

        <div class="qrcode-container">
          <canvas ref="qrcodeCanvas"></canvas>
        </div>

        <div class="qrcode-actions">
          <van-button
            type="primary"
            block
            round
            icon="photo-o"
            @click="downloadQRCode"
          >
            保存二维码图片
          </van-button>
        </div>

        <div class="qrcode-tip">
          长按二维码图片可以保存或分享给好友
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, watch, onUnmounted, nextTick} from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/pinia'
import { showDialog, showToast } from 'vant'
import { emitter } from "@/utils/bus.js"
import QRCode from 'qrcode'  // ✅ 引入二维码库

const router = useRouter()
const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo || {})
const hasMembership = computed(() => userStore.hasMembership)
const membershipInfo = computed(() => userStore.membershipInfo)
const referralCount = computed(() => userStore.referralCount)
const commissionAvailable = computed(() => userStore.commissionAvailable)
const commissionTotal = computed(() => userStore.commissionTotal)

// 当前分佣比例
const currentCommissionRate = ref(10)
// 最低提现金额
const minWithdrawAmount = ref(10)

// ✅ 二维码相关
const showQRCodePopup = ref(false)
const qrcodeCanvas = ref(null)
const inviteUrl = computed(() => {
  // ✅ 生成邀请链接：当前域名 + ?inviteCode=xxx
  return `${window.location.origin}?inviteCode=${userInfo.value.referral_code}`
})

// ✅ 显示二维码
const showQRCode = async () => {
  showQRCodePopup.value = true

  // 等待DOM渲染
  await nextTick()

  // 生成二维码
  try {
    await QRCode.toCanvas(qrcodeCanvas.value, inviteUrl.value, {
      width: 260,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
  } catch (error) {
    console.error('生成二维码失败:', error)
    showToast('生成二维码失败')
  }
}

// ✅ 下载二维码
const downloadQRCode = () => {
  if (!qrcodeCanvas.value) return

  try {
    // 将 canvas 转换为图片并下载
    const url = qrcodeCanvas.value.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `invite_qrcode_${userInfo.value.referral_code}.png`
    link.href = url
    link.click()

    showToast({
      message: '二维码已保存',
      type: 'success'
    })
  } catch (error) {
    console.error('下载二维码失败:', error)
    showToast('下载失败，请重试')
  }
}
// 跳转到公告列表
const goToAnnouncementList = () => {
  router.push('/announcementList')
}


// 获取当前分佣比例
const fetchCommissionRate = async () => {
  try {
    currentCommissionRate.value = 10
  } catch (error) {
    console.error('获取分佣比例失败:', error)
  }
}

// 去收益详情页
const goToCommissionPage = () => {
  router.push('/commissionPage')
}

// 去提现页面
const goToWithdraw = () => {
  if (commissionAvailable.value < minWithdrawAmount.value) {
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

// 查看分佣规则
const goToCommissionRules = () => {
  router.push('/commissionDetail')
}

// 查看提现记录
const goToWithdrawRecord = () => {
  router.push('/withdrawRecord')
}

// 查看会员权益
const goToUserMemberships = () => {
  if(hasMembership){
    showToast("普通会员暂无权益！")
    return
  }
  router.push('/userMemberships')
}

// 去订单页面
const goToOrder = () => {
  router.push('/order')
}

// 去VIP页面
const goToVip = () => {
  router.push('/vip')
}

// 去设置页面
const goToSettings = () => {
  router.push('/settings')
}

// 去关于我们
const goToAbout = () => {
  router.push('/about')
}

// 显示登录
const showAuth = () => {
  emitter.emit('show-auth', { source: 'profile' })
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '永久'
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 退出登录
const handleLogout = () => {
  showDialog({
    title: '确认退出',
    message: '确定要退出登录吗？',
    showCancelButton: true,
    confirmButtonText: '退出',
    confirmButtonColor: '#ee0a24'
  }).then(() => {
    userStore.LoginOut().then(() => {
      showToast({
        message: '已退出登录',
        type: 'success'
      })
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
    fetchCommissionRate()
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

.vip-expire {
  font-size: 12px;
  opacity: 0.9;
}

/* ✅ 邀请推广卡片（简化版） */
.invite-section {
  margin: 12px 0;
}

.invite-card-simple {
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.invite-card-simple:active {
  background: #f7f8fa;
}

.invite-left {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #f0fff4, #e6f9ed);
  border-radius: 12px;
}

.invite-content {
  flex: 1;
  margin-left: 12px;
}

.invite-title {
  font-size: 15px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 4px;
}

.invite-subtitle {
  font-size: 12px;
  color: #969799;
}

.invite-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-section {
  margin: 12px 0;
}

.vip-section {
  margin: 12px 0;
}

/* 公告卡片样式 */
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

/* ✅ 二维码弹窗样式（简化版） */
.qrcode-popup {
  text-align: center;
}

.qrcode-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 12px;
}

.qrcode-desc {
  font-size: 13px;
  color: #646566;
  line-height: 1.6;
  margin-bottom: 20px;
}

.qrcode-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: #f7f8fa;
  border-radius: 12px;
  margin-bottom: 20px;
}

.qrcode-container canvas {
  display: block;
}

.qrcode-actions {
  margin-bottom: 12px;
}

.qrcode-tip {
  font-size: 12px;
  color: #969799;
  line-height: 1.5;
}
</style>
