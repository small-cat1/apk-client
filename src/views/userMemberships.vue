<template>
  <div class="membership-page">
    <van-nav-bar
      title="会员权益"
      fixed
      left-arrow
      @click-left="onClickLeft"
    />

    <div class="content" style="padding-top: 46px;">
      <!-- 当前生效权益卡片 -->
      <div class="active-benefit-card">
        <div class="card-header">
          <div class="header-left">
            <van-icon name="diamond" color="#ffd700" size="28" />
            <div class="header-text">
              <div class="current-level">{{ highestMembership?.plan_name || '暂无会员' }}</div>
              <div class="benefit-desc">当前享受权益</div>
            </div>
          </div>
          <van-icon name="arrow" color="#fff" />
        </div>

        <div v-if="highestMembership" class="benefit-summary">
          <div class="benefit-item">
            <div class="benefit-label">每日下载</div>
            <div class="benefit-value">{{ currentBenefits.dailyDownload }}</div>
          </div>
          <div class="benefit-item">
            <div class="benefit-label">本月下载</div>
            <div class="benefit-value">{{ currentBenefits.monthlyDownload }}</div>
          </div>
          <div class="benefit-item">
            <div class="benefit-label">会员到期</div>
            <div class="benefit-value">{{ getFarthestExpireDate() }}</div>
          </div>
        </div>

        <div class="active-tips">
          <van-icon name="info-o" size="12" />
          您当前拥有 {{ activeMemberships.length }} 个有效会员，享受最高等级权益
        </div>
      </div>

      <!-- 使用统计 -->
      <div v-if="highestMembership" class="usage-section">
        <van-cell-group inset>
          <van-cell title="今日使用情况">
            <template #label>
              <div class="usage-detail">
                <div class="usage-row">
                  <span>已使用</span>
                  <span class="usage-num">{{ totalDailyUsed }}</span>
                </div>
                <van-progress
                  :percentage="(totalDailyUsed / currentBenefits.dailyDownload) * 100"
                  stroke-width="8"
                  color="linear-gradient(to right, #667eea, #764ba2)"
                />
                <div class="usage-footer">
                  剩余 {{ currentBenefits.dailyDownload - totalDailyUsed }} 次
                </div>
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <!-- 拥有的会员列表 -->
      <div class="membership-section">
        <div class="section-title">
          <span>我的会员</span>
          <span class="count-badge">{{ activeMemberships.length }}</span>
        </div>

        <div class="membership-list">
          <div
            v-for="membership in sortedMemberships"
            :key="membership.id"
            class="membership-item"
            :class="{
              'expired': membership.status !== 1,
              'highest': isHighestLevel(membership)
            }"
            @click="showMembershipDetail(membership)"
          >
            <div class="item-left">
              <div class="plan-icon">
                <van-icon
                  :name="membership.status === 1 ? 'diamond-o' : 'clock-o'"
                  :color="getIconColor(membership)"
                  size="24"
                />
              </div>
              <div class="plan-info">
                <div class="plan-name">
                  {{ membership.plan_name }}
                  <van-tag
                    v-if="isHighestLevel(membership)"
                    type="warning"
                    size="mini"
                  >
                    当前生效
                  </van-tag>
                </div>
                <div class="plan-expire">
                  {{ getExpireText(membership) }}
                </div>
                <div v-if="membership.auto_renew && membership.status === 1" class="auto-renew-tag">
                  <van-icon name="replay" size="10" />
                  自动续费
                </div>
              </div>
            </div>
            <div class="item-right">
              <van-tag :type="getStatusType(membership.status)">
                {{ getStatusText(membership.status) }}
              </van-tag>
              <van-icon name="arrow" color="#c8c9cc" size="16" />
            </div>
          </div>

          <!-- 空状态 -->
          <van-empty
            v-if="allMemberships.length === 0"
            description="暂无会员"
            :image-size="80"
          >
            <van-button type="primary" round @click="goToBuy">
              立即开通会员
            </van-button>
          </van-empty>
        </div>
      </div>

      <!-- 权益对比说明 -->
      <div v-if="activeMemberships.length > 1" class="compare-section">
        <van-cell-group inset>
          <van-cell
            title="权益叠加说明"
            icon="question-o"
            is-link
            @click="showBenefitCompare"
          >
            <template #label>
              查看不同会员权益对比
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <!-- 快捷操作 -->
      <div class="action-section">
        <van-cell-group inset>
          <van-cell
            title="开通/升级会员"
            icon="add-o"
            is-link
            @click="goToBuy"
          >
            <template #label>
              查看更多会员套餐
            </template>
          </van-cell>
          <van-cell
            title="我的订单"
            icon="orders-o"
            is-link
            @click="goToOrders"
          />
          <van-cell
            title="使用帮助"
            icon="question-o"
            is-link
            @click="goToHelp"
          />
        </van-cell-group>
      </div>
    </div>

    <!-- 会员详情弹窗 -->
    <van-popup
      v-model:show="showDetailPopup"
      position="bottom"
      round
      :style="{ height: '80%' }"
    >
      <div class="detail-popup">
        <div class="popup-header">
          <div class="popup-title">会员详情</div>
          <van-icon name="cross" size="20" @click="showDetailPopup = false" />
        </div>
        <div v-if="selectedMembership" class="popup-content">
          <!-- 基本信息 -->
          <div class="detail-section">
            <div class="section-label">基本信息</div>
            <van-cell-group>
              <van-cell title="套餐名称" :value="selectedMembership.plan_name" />
              <van-cell title="套餐代码" :value="selectedMembership.plan_code" />
              <van-cell title="开始时间" :value="formatDate(selectedMembership.start_date)" />
              <van-cell
                title="到期时间"
                :value="selectedMembership.end_date ? formatDate(selectedMembership.end_date) : '永久有效'"
              />
              <van-cell
                title="剩余天数"
                :value="calculateDaysRemaining(selectedMembership.end_date) + ' 天'"
              />
            </van-cell-group>
          </div>

          <!-- 权益说明 -->
          <div class="detail-section">
            <div class="section-label">会员权益</div>
            <div class="benefit-detail">{{ selectedMembership.detail }}</div>
          </div>

          <!-- 使用情况 -->
          <div v-if="selectedMembership.status === 1" class="detail-section">
            <div class="section-label">使用情况</div>
            <van-cell-group>
              <van-cell title="今日已用" :value="`${selectedMembership.download_used_daily} 次`" />
              <van-cell title="本月已用" :value="`${selectedMembership.download_used_monthly} 次`" />
              <van-cell title="今日重置" :value="selectedMembership.last_reset_daily" />
              <van-cell title="本月重置" :value="selectedMembership.last_reset_monthly" />
            </van-cell-group>
          </div>

          <!-- 操作按钮 -->
          <div class="detail-actions">
            <van-button
              v-if="selectedMembership.status === 1 && selectedMembership.end_date"
              block
              type="primary"
              @click="renewMembership(selectedMembership)"
            >
              续费会员
            </van-button>
            <van-button
              v-if="selectedMembership.status === 1"
              block
              plain
              type="primary"
              @click="toggleAutoRenew(selectedMembership)"
            >
              {{ selectedMembership.auto_renew ? '关闭' : '开启' }}自动续费
            </van-button>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 权益对比弹窗 -->
    <van-popup
      v-model:show="showComparePopup"
      position="bottom"
      round
      :style="{ height: '70%' }"
    >
      <div class="compare-popup">
        <div class="popup-header">
          <div class="popup-title">权益对比</div>
          <van-icon name="cross" size="20" @click="showComparePopup = false" />
        </div>
        <div class="compare-content">
          <div class="compare-tip">
            <van-icon name="info-o" color="#1989fa" />
            当您拥有多个会员时，系统会自动为您选择最高等级的权益
          </div>
          <van-cell-group>
            <van-cell
              v-for="membership in activeMemberships"
              :key="membership.id"
              :title="membership.plan_name"
            >
              <template #label>
                <div class="compare-item-detail">
                  <div>{{ membership.detail }}</div>
                  <div class="compare-expire">到期: {{ formatDate(membership.end_date) }}</div>
                </div>
              </template>
              <template #right-icon>
                <van-tag v-if="isHighestLevel(membership)" type="warning">
                  当前生效
                </van-tag>
              </template>
            </van-cell>
          </van-cell-group>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showDialog, showToast, showConfirmDialog } from 'vant'

const router = useRouter()

// 定义会员等级权重（数字越大等级越高）
const PLAN_LEVELS = {
  'VIP_LIFETIME': 100,
  'VIP_YEAR': 30,
  'VIP_SEASON': 20,
  'VIP_MONTH': 10,
}

// 模拟多个会员数据
const allMemberships = ref([
  {
    id: 1,
    plan_code: 'VIP_MONTH',
    plan_name: 'VIP月卡',
    detail: '每日下载50次，高速通道，无广告',
    status: 1,
    start_date: '2025-10-01',
    end_date: '2025-11-01',
    auto_renew: 0,
    download_used_daily: 12,
    download_used_monthly: 156,
    last_reset_daily: '2025-10-16',
    last_reset_monthly: '2025-10-01',
    created_at: '2025-10-01 14:30:00',
    updated_at: '2025-10-16 09:15:00'
  },
  {
    id: 2,
    plan_code: 'VIP_YEAR',
    plan_name: 'VIP年卡',
    detail: '每日下载200次，高速通道，无广告，专属客服，优先体验',
    status: 1,
    start_date: '2025-01-15',
    end_date: '2026-01-15',
    auto_renew: 1,
    download_used_daily: 45,
    download_used_monthly: 890,
    last_reset_daily: '2025-10-16',
    last_reset_monthly: '2025-10-01',
    created_at: '2025-01-15 10:00:00',
    updated_at: '2025-10-16 08:30:00'
  }
])

const showDetailPopup = ref(false)
const showComparePopup = ref(false)
const selectedMembership = ref(null)

const activeMemberships = computed(() => {
  return allMemberships.value.filter(m => m.status === 1)
})

const sortedMemberships = computed(() => {
  return [...allMemberships.value].sort((a, b) => {
    if (a.status !== b.status) return b.status - a.status
    const levelA = PLAN_LEVELS[a.plan_code] || 0
    const levelB = PLAN_LEVELS[b.plan_code] || 0
    return levelB - levelA
  })
})

const highestMembership = computed(() => {
  if (activeMemberships.value.length === 0) return null
  return activeMemberships.value.reduce((highest, current) => {
    const highestLevel = PLAN_LEVELS[highest.plan_code] || 0
    const currentLevel = PLAN_LEVELS[current.plan_code] || 0
    return currentLevel > highestLevel ? current : highest
  })
})

const currentBenefits = computed(() => {
  if (!highestMembership.value) {
    return { dailyDownload: 0, monthlyDownload: 0 }
  }
  const benefits = {
    'VIP_LIFETIME': { dailyDownload: 999, monthlyDownload: 99999 },
    'VIP_YEAR': { dailyDownload: 200, monthlyDownload: 6000 },
    'VIP_SEASON': { dailyDownload: 100, monthlyDownload: 3000 },
    'VIP_MONTH': { dailyDownload: 50, monthlyDownload: 1500 }
  }
  return benefits[highestMembership.value.plan_code] || { dailyDownload: 0, monthlyDownload: 0 }
})

const totalDailyUsed = computed(() => {
  if (activeMemberships.value.length === 0) return 0
  return Math.max(...activeMemberships.value.map(m => m.download_used_daily))
})

const isHighestLevel = (membership) => {
  return highestMembership.value?.id === membership.id
}

const getIconColor = (membership) => {
  if (membership.status !== 1) return '#c8c9cc'
  if (isHighestLevel(membership)) return '#ffd700'
  return '#1989fa'
}

const getFarthestExpireDate = () => {
  if (activeMemberships.value.length === 0) return '-'
  const dates = activeMemberships.value.filter(m => m.end_date).map(m => new Date(m.end_date))
  if (dates.length === 0) return '永久有效'
  const farthest = new Date(Math.max(...dates))
  return formatDate(farthest.toISOString().split('T')[0])
}

const getExpireText = (membership) => {
  if (!membership.end_date) return '永久有效'
  const days = calculateDaysRemaining(membership.end_date)
  if (membership.status !== 1) return `已于 ${formatDate(membership.end_date)} 到期`
  return `剩余 ${days} 天`
}

const calculateDaysRemaining = (endDate) => {
  if (!endDate) return '永久'
  const end = new Date(endDate)
  const now = new Date()
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
}

const getStatusType = (status) => {
  return status === 1 ? 'success' : 'default'
}

const getStatusText = (status) => {
  const statusMap = { 0: '已过期', 1: '使用中', 2: '已暂停' }
  return statusMap[status] || '未知'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const onClickLeft = () => router.back()

const showMembershipDetail = (membership) => {
  selectedMembership.value = membership
  showDetailPopup.value = true
}

const showBenefitCompare = () => {
  showComparePopup.value = true
}

const renewMembership = (membership) => {
  showDetailPopup.value = false
  router.push({ path: '/package', query: { planId: membership.plan_id } })
}

const toggleAutoRenew = (membership) => {
  showConfirmDialog({
    title: '自动续费设置',
    message: membership.auto_renew ? '关闭后将不会在到期时自动续费' : '开启后将在到期前自动续费',
  }).then(() => {
    membership.auto_renew = membership.auto_renew ? 0 : 1
    showToast({ message: membership.auto_renew ? '已开启自动续费' : '已关闭自动续费', type: 'success' })
  })
}

const goToBuy = () => router.push('/package')
const goToOrders = () => router.push('/orderList')
const goToHelp = () => {
  showDialog({
    title: '权益说明',
    message: '当您拥有多个会员时：\n\n1. 系统会自动为您选择最高等级的权益\n2. 所有会员独立计时，互不影响\n3. 低等级会员到期后，自动切换到次高等级\n\n示例：\n月卡50次/天 + 年卡200次/天\n→ 实际享受200次/天',
    confirmButtonText: '我知道了'
  })
}
</script>

<style scoped>
.membership-page {
  background: #f7f8fa;
  min-height: 100vh;
}

.content {
  padding: 0 0 60px 0;
}

.active-benefit-card {
  margin: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 20px;
  color: white;
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-text {
  display: flex;
  flex-direction: column;
}

.current-level {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 4px;
}

.benefit-desc {
  font-size: 13px;
  opacity: 0.85;
}

.benefit-summary {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.benefit-item {
  text-align: center;
}

.benefit-label {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 6px;
}

.benefit-value {
  font-size: 18px;
  font-weight: bold;
}

.active-tips {
  margin-top: 12px;
  font-size: 12px;
  opacity: 0.85;
  display: flex;
  align-items: center;
  gap: 4px;
}

.usage-section {
  margin: 12px 0;
}

.usage-detail {
  padding-top: 12px;
}

.usage-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #646566;
}

.usage-num {
  font-weight: bold;
  color: #323233;
  font-size: 16px;
}

.usage-footer {
  margin-top: 8px;
  font-size: 12px;
  color: #969799;
}

.membership-section {
  margin: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 12px;
}

.count-badge {
  background: #1989fa;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.membership-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.membership-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f7f8fa;
  cursor: pointer;
  transition: background 0.2s;
}

.membership-item:last-child {
  border-bottom: none;
}

.membership-item:active {
  background: #f7f8fa;
}

.membership-item.expired {
  opacity: 0.5;
}

.membership-item.highest {
  background: linear-gradient(to right, #fff7e6, #ffffff);
}

.item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.plan-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f7f8fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.plan-info {
  flex: 1;
}

.plan-name {
  font-size: 15px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.plan-expire {
  font-size: 13px;
  color: #646566;
  margin-bottom: 2px;
}

.auto-renew-tag {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  color: #07c160;
  margin-top: 2px;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.compare-section,
.action-section {
  margin: 12px 0;
}

.detail-popup,
.compare-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
}

.popup-title {
  font-size: 16px;
  font-weight: bold;
}

.popup-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px;
}

.detail-section {
  margin-top: 16px;
}

.section-label {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: bold;
  color: #646566;
}

.benefit-detail {
  padding: 12px 16px;
  background: #f7f8fa;
  margin: 0 16px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  color: #323233;
}

.detail-actions {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.compare-content {
  flex: 1;
  overflow-y: auto;
}

.compare-tip {
  padding: 16px;
  background: #ecf5ff;
  color: #1989fa;
  font-size: 13px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  line-height: 1.6;
}

.compare-item-detail {
  margin-top: 4px;
  font-size: 13px;
  line-height: 1.6;
  color: #646566;
}

.compare-expire {
  margin-top: 4px;
  color: #969799;
  font-size: 12px;
}
</style>
