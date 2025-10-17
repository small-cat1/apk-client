<template>
  <div class="membership-order-page">
    <van-nav-bar
      title="购买会员套餐"
      fixed
      left-arrow
      @click-left="onClickLeft"
    />

    <div class="content" style="padding-top: 46px;">
      <!-- 套餐信息 -->
      <div class="plan-section">
        <div class="section-title">选择套餐</div>
        <van-radio-group v-model="selectedPlan">
          <div
            v-for="plan in membershipPlans"
            :key="plan.id"
            class="plan-card"
            :class="{ active: selectedPlan === plan.id }"
            @click="selectedPlan = plan.id"
          >
            <div class="plan-header">
              <div class="plan-info">
                <div class="plan-name">{{ plan.name }}</div>
                <div class="plan-desc">{{ plan.description }}</div>
              </div>
              <van-radio :name="plan.id" />
            </div>
            <div class="plan-benefits">
              <div
                v-for="benefit in plan.benefits"
                :key="benefit"
                class="benefit-item"
              >
                <van-icon name="passed" color="#07c160" size="14" />
                <span>{{ benefit }}</span>
              </div>
            </div>
            <div class="plan-footer">
              <span class="price">¥{{ plan.price }}</span>
              <van-tag v-if="plan.tag" type="danger" size="mini">
                {{ plan.tag }}
              </van-tag>
            </div>
          </div>
        </van-radio-group>
      </div>

      <!-- 支付方式 -->
      <div class="payment-section">
        <div class="section-title">支付方式</div>
        <van-radio-group v-model="paymentMethod">
          <van-cell
            v-for="method in paymentMethods"
            :key="method.value"
            clickable
            @click="paymentMethod = method.value"
          >
            <template #title>
              <div class="payment-method-item">
                <van-icon :name="method.icon" size="24" />
                <span>{{ method.label }}</span>
              </div>
            </template>
            <template #right-icon>
              <van-radio :name="method.value" />
            </template>
          </van-cell>
        </van-radio-group>
      </div>

      <!-- 优惠券 -->
      <div class="coupon-section">
        <van-cell
          title="优惠券"
          :value="selectedCoupon ? `-¥${selectedCoupon.amount}` : '暂无可用'"
          is-link
          @click="showCouponPopup = true"
        />
      </div>

      <!-- 费用明细 -->
      <div class="price-section">
        <div class="section-title">费用明细</div>
        <div class="price-detail">
          <div class="detail-row">
            <span>套餐金额</span>
            <span>¥{{ currentPlan?.price || 0 }}</span>
          </div>
          <div v-if="selectedCoupon" class="detail-row discount">
            <span>优惠券</span>
            <span>-¥{{ selectedCoupon.amount }}</span>
          </div>
          <div class="detail-row total">
            <span>实付金额</span>
            <span class="total-price">¥{{ finalPrice }}</span>
          </div>
        </div>
      </div>

      <!-- 服务协议 -->
      <div class="agreement-section">
        <van-checkbox v-model="agreedToTerms">
          我已阅读并同意
          <span class="link" @click.stop="showTerms">《会员服务协议》</span>
        </van-checkbox>
      </div>
    </div>

    <!-- 底部提交按钮 -->
    <div class="submit-bar">
      <div class="submit-info">
        <span class="submit-label">合计：</span>
        <span class="submit-price">¥{{ finalPrice }}</span>
      </div>
      <van-button
        type="primary"
        size="large"
        round
        :disabled="!selectedPlan || !agreedToTerms"
        @click="handleSubmit"
      >
        确认支付
      </van-button>
    </div>

    <!-- 优惠券选择弹窗 -->
    <van-popup
      v-model:show="showCouponPopup"
      position="bottom"
      round
      :style="{ height: '60%' }"
    >
      <div class="coupon-popup">
        <div class="popup-header">
          <div class="popup-title">选择优惠券</div>
          <van-icon name="cross" size="20" @click="showCouponPopup = false" />
        </div>
        <div class="coupon-list">
          <div
            v-for="coupon in availableCoupons"
            :key="coupon.id"
            class="coupon-item"
            :class="{ selected: selectedCoupon?.id === coupon.id }"
            @click="selectCoupon(coupon)"
          >
            <div class="coupon-amount">¥{{ coupon.amount }}</div>
            <div class="coupon-info">
              <div class="coupon-name">{{ coupon.name }}</div>
              <div class="coupon-condition">满{{ coupon.condition }}可用</div>
            </div>
            <van-icon
              v-if="selectedCoupon?.id === coupon.id"
              name="success"
              color="#07c160"
            />
          </div>
          <div class="coupon-item empty" @click="selectCoupon(null)">
            <span>不使用优惠券</span>
            <van-icon
              v-if="!selectedCoupon"
              name="success"
              color="#07c160"
            />
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showDialog, showToast, showConfirmDialog } from 'vant'
import { createMembershipOrder } from '@/api/order'

const router = useRouter()

// 会员套餐列表
const membershipPlans = ref([
  {
    id: 1,
    code: 'VIP_MONTH',
    name: 'VIP月卡',
    description: '适合短期使用',
    price: '19.9',
    benefits: ['每日下载50次', '高速通道', '无广告'],
    tag: null
  },
  {
    id: 2,
    code: 'VIP_SEASON',
    name: 'VIP季卡',
    description: '最受欢迎',
    price: '49.9',
    benefits: ['每日下载100次', '高速通道', '无广告', '专属客服'],
    tag: '省25%'
  },
  {
    id: 3,
    code: 'VIP_YEAR',
    name: 'VIP年卡',
    description: '超值划算',
    price: '159.9',
    benefits: ['每日下载200次', '高速通道', '无广告', '专属客服', '优先体验'],
    tag: '省33%'
  },
  {
    id: 4,
    code: 'VIP_LIFETIME',
    name: 'VIP终身',
    description: '一次购买永久有效',
    price: '399.9',
    benefits: ['无限下载', '高速通道', '无广告', '专属客服', '所有特权'],
    tag: '推荐'
  }
])

// 支付方式
const paymentMethods = [
  { label: '微信支付', value: 'wechat', icon: 'wechat-pay' },
  { label: '支付宝', value: 'alipay', icon: 'alipay' },
]

// 可用优惠券
const availableCoupons = ref([
  { id: 1, name: '新人专享券', amount: 5, condition: 10 },
  { id: 2, name: '满减优惠券', amount: 10, condition: 50 },
  { id: 3, name: '超级会员券', amount: 20, condition: 100 }
])

const selectedPlan = ref(2) // 默认选中季卡
const paymentMethod = ref('wechat')
const selectedCoupon = ref(null)
const agreedToTerms = ref(false)
const showCouponPopup = ref(false)

// 当前选中的套餐
const currentPlan = computed(() => {
  return membershipPlans.value.find(p => p.id === selectedPlan.value)
})

// 最终价格
const finalPrice = computed(() => {
  const basePrice = parseFloat(currentPlan.value?.price || 0)
  const discount = selectedCoupon.value?.amount || 0
  return Math.max(0, basePrice - discount).toFixed(2)
})

// 返回
const onClickLeft = () => {
  router.back()
}

// 选择优惠券
const selectCoupon = (coupon) => {
  selectedCoupon.value = coupon
  showCouponPopup.value = false
}

// 查看协议
const showTerms = () => {
  showDialog({
    title: '会员服务协议',
    message: '这里是会员服务协议的内容...',
    confirmButtonText: '我知道了'
  })
}

// 提交订单
const handleSubmit = async () => {
  if (!agreedToTerms.value) {
    showToast('请先阅读并同意服务协议')
    return
  }

  showConfirmDialog({
    title: '确认支付',
    message: `确认支付 ¥${finalPrice.value} 购买 ${currentPlan.value.name}？`
  }).then(async () => {
    try {
      const orderData = {
        planId: selectedPlan.value,
        planCode: currentPlan.value.code,
        paymentMethod: paymentMethod.value,
        couponId: selectedCoupon.value?.id,
        amount: finalPrice.value
      }

      const res = await createMembershipOrder(orderData)

      showToast({ message: '订单创建成功', type: 'success' })

      // 跳转到支付页面
      router.push({
        path: '/order/pay',
        query: { orderId: res.data.orderId, type: 'membership' }
      })
    } catch (error) {
      showToast({ message: error.message || '创建订单失败', type: 'fail' })
    }
  })
}
</script>

<style scoped>
.membership-order-page {
  background: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 80px;
}

.content {
  padding: 0 0 20px 0;
}

.section-title {
  padding: 16px;
  font-size: 16px;
  font-weight: bold;
  color: #323233;
}

.plan-section {
  background: white;
  margin-bottom: 12px;
}

.plan-card {
  margin: 0 12px 12px;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.plan-card.active {
  border-color: #1989fa;
  background: #fff;
  box-shadow: 0 2px 12px rgba(25, 137, 250, 0.2);
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.plan-info {
  flex: 1;
}

.plan-name {
  font-size: 18px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 4px;
}

.plan-desc {
  font-size: 13px;
  color: #969799;
}

.plan-benefits {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #646566;
}

.plan-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #ebedf0;
}

.price {
  font-size: 24px;
  font-weight: bold;
  color: #ee0a24;
}

.payment-section,
.coupon-section {
  background: white;
  margin-bottom: 12px;
}

.payment-method-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.price-section {
  background: white;
  margin-bottom: 12px;
}

.price-detail {
  padding: 0 16px 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  color: #646566;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-row.discount {
  color: #ee0a24;
}

.detail-row.total {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #ebedf0;
  font-size: 16px;
  font-weight: bold;
  color: #323233;
}

.total-price {
  font-size: 24px;
  color: #ee0a24;
}

.agreement-section {
  padding: 16px;
  font-size: 12px;
}

.link {
  color: #1989fa;
}

.submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 12px 16px;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 100;
}

.submit-info {
  flex: 1;
}

.submit-label {
  font-size: 14px;
  color: #646566;
}

.submit-price {
  font-size: 22px;
  font-weight: bold;
  color: #ee0a24;
  margin-left: 4px;
}

.coupon-popup {
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

.coupon-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.coupon-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fff7e6;
  border: 1px solid #ffd21e;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
}

.coupon-item.selected {
  border-color: #07c160;
  background: #f0f9ff;
}

.coupon-item.empty {
  background: #f7f8fa;
  border-color: #ebedf0;
  justify-content: space-between;
}

.coupon-amount {
  font-size: 24px;
  font-weight: bold;
  color: #ee0a24;
  min-width: 80px;
  text-align: center;
}

.coupon-info {
  flex: 1;
}

.coupon-name {
  font-size: 15px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 4px;
}

.coupon-condition {
  font-size: 12px;
  color: #969799;
}
</style>
