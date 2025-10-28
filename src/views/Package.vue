<template>
  <div class="package-page">
    <div class="custom-navbar">
      <div class="nav-left" @click="onClickLeft">
        <van-icon name="arrow-left" size="20" />
        <span>返回</span>
      </div>
      <div class="nav-title">会员套餐</div>
      <div class="nav-right" @click="contactService">
        <van-icon name="service-o" size="18" />
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <!-- VIP横幅 - 卡片式设计 -->
        <div class="vip-hero">
          <div class="hero-badge">
            <van-icon name="diamond" size="16" />
            <span>限时优惠</span>
          </div>
          <h1 class="hero-title">开启VIP之旅</h1>
          <p class="hero-subtitle">解锁全部高级功能，享受极致体验</p>

          <!-- 用户状态卡片 -->
          <div class="user-card" v-if="!userStore.userInfo?.isVip">
            <div class="card-icon">
              <van-icon name="user-circle-o" size="32" color="#fff" />
            </div>
            <div class="card-info">
              <div class="card-title">普通用户</div>
              <div class="card-desc">升级即享专属特权</div>
            </div>
            <van-icon name="arrow" size="16" color="rgba(255,255,255,0.6)" />
          </div>
          <div class="user-card vip" v-else>
            <div class="card-icon">
              <van-icon name="medal" size="32" color="#FFD700" />
            </div>
            <div class="card-info">
              <div class="card-title">VIP会员</div>
              <div class="card-desc">{{ userStore.userInfo.vipExpireTime }} 到期</div>
            </div>
            <van-button size="small" plain @click="renewVip">续费</van-button>
          </div>
        </div>

        <!-- 套餐选择 - 优化后的版本 -->
        <div class="section packages-section">
          <div class="section-header">
            <h2 class="section-title">选择套餐</h2>
            <div class="section-tip">越长越优惠</div>
          </div>

          <!-- 加载状态 -->
          <van-loading v-if="packagesLoading" size="24" vertical>
            加载中...
          </van-loading>

          <!-- 套餐列表 - 改为垂直卡片布局（更适合展示描述） -->
          <div v-else-if="packages.length > 0" class="packages-list">
            <div
              v-for="pkg in packages"
              :key="pkg.id"
              class="package-item"
              :class="{
                active: selectedPackage === pkg.id,
                recommended: pkg.is_featured
              }"
              @click="selectPackage(pkg)"
            >
              <!-- 推荐标签 -->
              <div class="item-badge" v-if="pkg.is_featured">
                <van-icon name="medal-o" size="12" />
                推荐
              </div>

              <!-- 终身标签 -->
              <div class="lifetime-badge" v-if="pkg.plan_type === 'lifetime'">
                <van-icon name="clock-o" size="12" />
                永久有效
              </div>

              <div class="item-header">
                <!-- 左侧信息 -->
                <div class="item-info">
                  <h3 class="item-name">{{ pkg.plan_name }}</h3>
                  <div class="item-duration">
                    <van-icon name="clock-o" size="14" />
                    {{ formatDuration(pkg) }}
                  </div>

                  <!-- 套餐描述 - 新增 -->
                  <div class="item-description" v-if="pkg.description">
                    <div
                      v-for="(line, index) in pkg.description.split('\n')"
                      :key="index"
                      class="desc-line"
                    >
                      <van-icon name="success" size="12" color="#07c160" />
                      <span>{{ line }}</span>
                    </div>
                  </div>
                </div>

                <!-- 右侧价格 -->
                <div class="item-pricing">
                  <div class="price-main">
                    <span class="currency">¥</span>
                    <span class="amount">{{ pkg.final_price }}</span>
                  </div>
                  <div class="price-original" v-if="pkg.base_price !== pkg.final_price">
                    ¥{{ pkg.base_price }}
                  </div>

                  <!-- 平均价格 - 只在非终身套餐显示 -->
                  <div class="price-average" v-if="pkg.plan_type !== 'lifetime'">
                    ¥{{ calculateAveragePrice(pkg.final_price, pkg.duration_days) }}/月
                  </div>

                  <!-- 优惠标签 -->
                  <div class="price-save" v-if="pkg.discount_percentage > 0">
                    <van-icon name="fire" size="10" />
                    省{{ pkg.discount_percentage }}%
                  </div>
                </div>
              </div>

              <!-- 平台支持 - 新增 -->
              <div class="item-platforms" v-if="pkg.platform && pkg.platform.length > 0">
                <van-tag
                  v-for="platform in pkg.platform"
                  :key="platform"
                  size="mini"
                  type="primary"
                  plain
                >
                  {{ platform === 'android' ? 'Android' : 'iOS' }}
                </van-tag>
              </div>

              <!-- 选中标记 -->
              <div class="item-check">
                <van-icon
                  :name="selectedPackage === pkg.id ? 'success' : 'circle'"
                  :color="selectedPackage === pkg.id ? '#ee0a24' : '#c8c9cc'"
                  size="22"
                />
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <van-empty v-else description="暂无套餐信息" />
        </div>

        <!-- 会员权益 -->
        <div class="section">
          <h2 class="section-title">会员特权</h2>
          <div class="benefits-list">
            <div v-for="benefit in benefits" :key="benefit.id" class="benefit-card">
              <div class="benefit-icon" :style="{ background: benefit.color }">
                <van-icon :name="benefit.icon" size="24" color="#fff" />
              </div>
              <div class="benefit-content">
                <div class="benefit-name">{{ benefit.name }}</div>
                <div class="benefit-desc">{{ benefit.desc }}</div>
              </div>
            </div>
          </div>
        </div>

      </van-pull-refresh>
    </div>

    <!-- 底部购买栏 -->
    <div class="bottom-purchase">
      <div class="purchase-info">
        <div class="info-label">合计</div>
        <div class="info-price">
          <span class="currency">¥</span>
          <span class="amount">{{ currentPackagePrice }}</span>
        </div>
        <div class="info-save" v-if="currentPackageOriginalPrice > currentPackagePrice">
          省¥{{ (currentPackageOriginalPrice - currentPackagePrice).toFixed(2) }}
        </div>
      </div>
      <van-button
        type="danger"
        size="large"
        round
        :disabled="!selectedPackage"
        :loading="purchaseLoading"
        @click="handlePurchase"
        class="purchase-button"
      >
        立即开通
      </van-button>
    </div>

    <!-- 支付弹窗 -->
    <PaymentPopup
      v-model:show="showPayment"
      title="确认支付"
      :package-info="selectedPackageInfo"
      :total-price="currentPackagePrice"
      total-label="应付金额"
      tip-text="支付即代表同意《会员服务协议》"
      :loading="paymentLoading"
      @confirm="onBuyConfirm"
      @close="handlePaymentClose"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import {
  showToast,
  showConfirmDialog,
  showDialog,
  showSuccessToast,
  showFailToast
} from 'vant'
import { useUserStore } from '@/pinia'
import PaymentPopup from '@/components/PaymentPopup.vue'
import { getMembershipPlans } from '@/api/membership'

const router = useRouter()
const userStore = useUserStore()

// ===== 状态 =====
const packagesLoading = ref(false)
const refreshing = ref(false)
const purchaseLoading = ref(false)
const showPayment = ref(false)
const paymentLoading = ref(false)

const packages = ref([])
const selectedPackage = ref(null)

const benefits = ref([
  { id: 1, name: '无限下载', desc: '所有应用免费下载', icon: 'down', color: '#1989fa' },
  { id: 2, name: '极速下载', desc: '专属高速通道', icon: 'fire-o', color: '#ee0a24' },
  { id: 3, name: '去除广告', desc: '享受纯净体验', icon: 'shield-o', color: '#07c160' },
  { id: 4, name: '专属客服', desc: '7x24小时服务', icon: 'service-o', color: '#ff976a' },
])

// ===== 计算属性 =====

// 当前选中的套餐信息
const selectedPackageInfo = computed(() => {
  return packages.value.find(p => p.id === selectedPackage.value) || {}
})

// 当前套餐价格
const currentPackagePrice = computed(() => {
  return selectedPackageInfo.value.final_price || 0
})

// 当前套餐原价
const currentPackageOriginalPrice = computed(() => {
  return selectedPackageInfo.value.base_price || 0
})

// 支付弹窗订单信息
const paymentOrderInfo = computed(() => {
  const info = selectedPackageInfo.value
  const result = [
    { label: '套餐编码', value: info.plan_code || '' },
    { label: '套餐', value: info.plan_name || '' },
    { label: '时长', value: formatDuration(info) || '' }
  ]

  if (info.base_price !== info.final_price) {
    result.push({
      label: '原价',
      value: `¥${info.base_price}`,
      isPrice: true
    })
  }

  if (info.discount_percentage > 0) {
    result.push({
      label: '优惠',
      value: `省${info.discount_percentage}%`
    })
  }

  return result
})

// ===== 方法 =====

// 格式化时长 - 优化版本，支持 plan_type
const formatDuration = (pkg) => {
  // 优先判断套餐类型
  if (pkg.plan_type === 'lifetime') {
    return '永久有效'
  }

  const days = pkg.duration_days
  if (!days) return '永久有效'

  // 精确匹配常见时长
  if (days === 7) return '7天'
  if (days === 30) return '1个月'
  if (days === 90) return '3个月'
  if (days === 180) return '6个月'
  if (days === 365) return '12个月'

  // 计算月数
  if (days >= 30) {
    const months = Math.round(days / 30)
    return `${months}个月`
  }

  // 小于30天直接显示天数
  return `${days}天`
}

// 计算平均每月价格
const calculateAveragePrice = (price, days) => {
  if (!days) return price
  const months = Math.max(1, Math.round(days / 30))
  return (price / months).toFixed(1)
}

// 加载套餐列表
const loadPackages = async () => {
  packagesLoading.value = true
  try {
    const res = await getMembershipPlans()
    if (res.code === 0 && res.data) {
      packages.value = res.data
      // 默认选中第一个套餐或推荐套餐
      const recommendedPkg = packages.value.find(p => p.is_featured)
      selectedPackage.value = recommendedPkg?.id || packages.value[0]?.id || null
    } else {
      showFailToast(res.msg || '加载套餐失败')
    }
  } catch (error) {
    console.error('加载套餐失败', error)
    showFailToast('加载套餐失败')
  } finally {
    packagesLoading.value = false
  }
}

// 下拉刷新
const onRefresh = async () => {
  await loadPackages()
  refreshing.value = false
  showSuccessToast('刷新成功')
}

// 选择套餐
const selectPackage = (pkg) => {
  selectedPackage.value = pkg.id
}

// 更新VIP
const renewVip = () => {
  showToast('请选择续费套餐')
}

// 处理购买
const handlePurchase = async () => {
  if (!userStore.token) {
    showConfirmDialog({
      title: '提示',
      message: '请先登录后再购买',
      confirmButtonText: '去登录'
    }).then(() => {
      router.push('/login')
    }).catch(() => {})
    return
  }

  showPayment.value = true
}

// 确认购买
const onBuyConfirm = async (orderData) => {
  paymentLoading.value = true
  try {
    showSuccessToast('订单创建成功')
    paymentLoading.value = false
    // 跳转到支付页面
    router.push({
      path: '/order/pay',
      query: {orderId: orderData.orderId}
    })
  } catch (error) {
    console.error('创建订单失败', error)
    showFailToast(error.message || '创建订单失败')
  } finally {
    paymentLoading.value = false
  }
}

// 关闭支付弹窗
const handlePaymentClose = () => {
  showPayment.value = false
}

// 联系客服
const contactService = () => {
  if (window.$customerService) {
    window.$customerService.open()
  } else {
    showToast('客服功能暂未开放')
  }
}

// 返回
const onClickLeft = () => {
  router.back()
}

// 隐藏全局客服
const hideGlobalCustomerService = () => {
  if (window.$customerService) {
    window.$customerService.hide()
  }
}

// 显示全局客服
const showGlobalCustomerService = () => {
  if (window.$customerService) {
    window.$customerService.show()
  }
}

onMounted(() => {
  loadPackages()
  hideGlobalCustomerService()
})

onBeforeUnmount(() => {
  showGlobalCustomerService()
})
</script>

<style scoped>
.package-page {
  background: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 90px;
}

/* 自定义导航栏 */
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 46px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 15px;
  color: #323233;
  cursor: pointer;
  padding: 8px 0;
}

.nav-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.nav-right {
  padding: 8px;
  cursor: pointer;
}

/* 内容区域 */
.content {
  padding-top: 46px;
}

/* VIP Hero区域 */
.vip-hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px 16px;
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;
}

.vip-hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 4px 12px;
  border-radius: 20px;
  color: white;
  font-size: 12px;
  margin-bottom: 16px;
}

.hero-title {
  font-size: 28px;
  font-weight: bold;
  color: white;
  margin: 0 0 8px 0;
}

.hero-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 20px;
}

.user-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.card-icon {
  flex-shrink: 0;
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
}

.card-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

/* 区块样式 */
.section {
  background: white;
  padding: 20px 16px;
  margin-bottom: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #323233;
  margin: 0 0 16px 0;
}

.section-tip {
  font-size: 12px;
  color: #ee0a24;
  background: #fff1f0;
  padding: 4px 8px;
  border-radius: 4px;
}

/* ========== 套餐列表 - 优化后的垂直卡片样式 ========== */
.packages-section {
  padding: 16px;
}

.packages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.package-item {
  position: relative;
  background: white;
  border: 2px solid #ebedf0;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.package-item.active {
  border-color: #ee0a24;
  background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
  box-shadow: 0 8px 16px rgba(238, 10, 36, 0.15);
  transform: scale(1.02);
}

.package-item.recommended {
  border-color: #ff976a;
}

/* 推荐标签 */
.item-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #ee0a24, #ff6034);
  color: white;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 3px;
  box-shadow: 0 2px 8px rgba(238, 10, 36, 0.3);
}

/* 终身标签 */
.lifetime-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #07c160, #38f);
  color: white;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 3px;
  box-shadow: 0 2px 8px rgba(7, 193, 96, 0.3);
}

.package-item.recommended .lifetime-badge {
  top: 40px;
}

/* 头部布局 */
.item-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 18px;
  font-weight: bold;
  color: #323233;
  margin: 0 0 8px 0;
}

.item-duration {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #969799;
  margin-bottom: 12px;
}

/* 套餐描述 - 新增 */
.item-description {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
}

.desc-line {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  color: #646566;
  line-height: 1.6;
}

.desc-line .van-icon {
  margin-top: 2px;
  flex-shrink: 0;
}

/* 价格区域 */
.item-pricing {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  flex-shrink: 0;
}

.price-main {
  display: flex;
  align-items: baseline;
  margin-bottom: 4px;
}

.currency {
  font-size: 16px;
  color: #ee0a24;
  font-weight: 500;
}

.amount {
  font-size: 28px;
  font-weight: bold;
  color: #ee0a24;
  line-height: 1;
}

.price-original {
  font-size: 12px;
  color: #969799;
  text-decoration: line-through;
  margin-bottom: 4px;
}

.price-average {
  font-size: 11px;
  color: #969799;
  margin-bottom: 4px;
}

.price-save {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  color: #ee0a24;
  background: #fff1f0;
  padding: 3px 8px;
  border-radius: 10px;
}

/* 平台支持 - 新增 */
.item-platforms {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px dashed #ebedf0;
}

/* 选中标记 */
.item-check {
  position: absolute;
  bottom: 16px;
  right: 16px;
}

/* 权益列表 */
.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.benefit-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
}

.benefit-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.benefit-content {
  flex: 1;
}

.benefit-name {
  font-size: 15px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 4px;
}

.benefit-desc {
  font-size: 12px;
  color: #969799;
}

/* 底部购买栏 */
.bottom-purchase {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 999;
}

.purchase-info {
  flex: 1;
}

.info-label {
  font-size: 12px;
  color: #969799;
  margin-bottom: 2px;
}

.info-price {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.info-price .currency {
  font-size: 14px;
  color: #ee0a24;
  font-weight: 500;
}

.info-price .amount {
  font-size: 24px;
  font-weight: bold;
  color: #ee0a24;
}

.info-save {
  font-size: 11px;
  color: #07c160;
  margin-top: 2px;
}

.purchase-button {
  width: 140px;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
}
</style>
