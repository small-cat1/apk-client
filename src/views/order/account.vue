<template>
  <div class="account-order-page">
    <van-nav-bar
      title="购买应用账号"
      fixed
      left-arrow
      @click-left="onClickLeft"
    />

    <div class="content" style="padding-top: 46px;">
      <!-- 应用信息 -->
      <div class="app-section">
        <div class="app-card">
          <img :src="app.icon" class="app-icon" />
          <div class="app-info">
            <div class="app-name">{{ app.app_name }}</div>
            <div class="app-desc">{{ app.app_desc }}</div>
          </div>
        </div>
      </div>

      <!-- 时长选择 -->
      <div class="duration-section">
        <div class="section-title">选择使用时长</div>
        <van-radio-group v-model="selectedDuration">
          <div
            v-for="duration in durationOptions"
            :key="duration.value"
            class="duration-card"
            :class="{ active: selectedDuration === duration.value }"
            @click="selectedDuration = duration.value"
          >
            <div class="duration-header">
              <div class="duration-info">
                <div class="duration-label">{{ duration.label }}</div>
                <div class="duration-desc">{{ duration.description }}</div>
              </div>
              <van-radio :name="duration.value" />
            </div>
            <div class="duration-footer">
              <span class="duration-price">¥{{ duration.price }}</span>
              <van-tag v-if="duration.discount" type="danger" size="mini">
                {{ duration.discount }}
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

      <!-- 费用明细 -->
      <div class="price-section">
        <div class="section-title">费用明细</div>
        <div class="price-detail">
          <div class="detail-row">
            <span>商品金额</span>
            <span>¥{{ currentDuration?.price || 0 }}</span>
          </div>
          <div class="detail-row total">
            <span>实付金额</span>
            <span class="total-price">¥{{ currentDuration?.price || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- 购买须知 -->
      <div class="notice-section">
        <div class="section-title">购买须知</div>
        <div class="notice-content">
          <div class="notice-item">
            <van-icon name="passed" color="#07c160" size="14" />
            <span>账号为独享账号，仅供您个人使用</span>
          </div>
          <div class="notice-item">
            <van-icon name="passed" color="#07c160" size="14" />
            <span>购买后请及时修改密码</span>
          </div>
          <div class="notice-item">
            <van-icon name="passed" color="#07c160" size="14" />
            <span>到期前会提醒您续费</span>
          </div>
          <div class="notice-item">
            <van-icon name="warning-o" color="#ff976a" size="14" />
            <span>请勿与他人共享账号，否则可能被封禁</span>
          </div>
        </div>
      </div>

      <!-- 服务协议 -->
      <div class="agreement-section">
        <van-checkbox v-model="agreedToTerms">
          我已阅读并同意
          <span class="link" @click.stop="showTerms">《账号购买协议》</span>
        </van-checkbox>
      </div>
    </div>

    <!-- 底部提交按钮 -->
    <div class="submit-bar">
      <div class="submit-info">
        <span class="submit-label">合计：</span>
        <span class="submit-price">¥{{ currentDuration?.price || 0 }}</span>
      </div>
      <van-button
        type="primary"
        size="large"
        round
        :disabled="!selectedDuration || !agreedToTerms"
        @click="handleSubmit"
      >
        确认支付
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showDialog, showToast, showConfirmDialog } from 'vant'
import { createAccountOrder } from '@/api/order'
import { getAppDetail } from '@/api/app'

const router = useRouter()
const route = useRoute()

// 应用信息
const app = ref({
  id: null,
  icon: '',
  app_name: '',
  app_desc: '',
  price: 0
})

// 时长选项
const durationOptions = computed(() => {
  const basePrice = parseFloat(app.value.price || 0)
  return [
    {
      label: '1个月',
      value: 'month',
      price: basePrice.toFixed(2),
      description: '适合短期使用',
      discount: null
    },
    {
      label: '3个月',
      value: 'quarter',
      price: (basePrice * 2.7).toFixed(2),
      description: '节省10%',
      discount: '省10%'
    },
    {
      label: '6个月',
      value: 'half_year',
      price: (basePrice * 5).toFixed(2),
      description: '节省17%',
      discount: '省17%'
    },
    {
      label: '12个月',
      value: 'year',
      price: (basePrice * 9).toFixed(2),
      description: '节省25%',
      discount: '省25%'
    }
  ]
})

// 支付方式
const paymentMethods = [
  { label: '微信支付', value: 'wechat', icon: 'wechat-pay' },
  { label: '支付宝', value: 'alipay', icon: 'alipay' },
]

const selectedDuration = ref('month')
const paymentMethod = ref('wechat')
const agreedToTerms = ref(false)

// 当前选中的时长
const currentDuration = computed(() => {
  return durationOptions.value.find(d => d.value === selectedDuration.value)
})

// 返回
const onClickLeft = () => {
  router.back()
}

// 查看协议
const showTerms = () => {
  showDialog({
    title: '账号购买协议',
    message: '这里是账号购买协议的内容...',
    confirmButtonText: '我知道了'
  })
}

// 加载应用详情
const loadAppDetail = async () => {
  try {
    const appId = route.query.appId
    if (!appId) {
      showToast('缺少应用ID')
      router.back()
      return
    }

    const res = await getAppDetail(appId)
    app.value = res.data
  } catch (error) {
    showToast({ message: '加载应用信息失败', type: 'fail' })
    router.back()
  }
}

// 提交订单
const handleSubmit = async () => {
  if (!agreedToTerms.value) {
    showToast('请先阅读并同意购买协议')
    return
  }

  showConfirmDialog({
    title: '确认支付',
    message: `确认支付 ¥${currentDuration.value.price} 购买 ${app.value.app_name} ${currentDuration.value.label}？`
  }).then(async () => {
    try {
      const orderData = {
        appId: app.value.id,
        durationType: selectedDuration.value,
        paymentMethod: paymentMethod.value,
        amount: currentDuration.value.price
      }

      const res = await createAccountOrder(orderData)

      showToast({ message: '订单创建成功', type: 'success' })

      // 跳转到支付页面
      router.push({
        path: '/order/pay',
        query: { orderId: res.data.orderId, type: 'account' }
      })
    } catch (error) {
      showToast({ message: error.message || '创建订单失败', type: 'fail' })
    }
  })
}

onMounted(() => {
  loadAppDetail()
})
</script>

<style scoped>
.account-order-page {
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

.app-section {
  background: white;
  padding: 16px;
  margin-bottom: 12px;
}

.app-card {
  display: flex;
  gap: 12px;
  align-items: center;
}

.app-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: cover;
}

.app-info {
  flex: 1;
}

.app-name {
  font-size: 18px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 6px;
}

.app-desc {
  font-size: 13px;
  color: #969799;
  line-height: 1.5;
}

.duration-section {
  background: white;
  margin-bottom: 12px;
}

.duration-card {
  margin: 0 12px 12px;
  padding: 16px;
  background: #
