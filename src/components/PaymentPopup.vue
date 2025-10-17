<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    round
    :style="{ maxHeight: '70vh' }"
    class="payment-popup"
    @closed="handleClosed"
  >
    <div class="payment-container">
      <!-- 头部 -->
      <div class="payment-header">
        <h3>{{ title }}</h3>
        <van-icon name="cross" @click="handleClose" size="20" />
      </div>

      <!-- 订单摘要 -->
      <div class="payment-summary">
        <div class="summary-item" >
          <span class="label">套餐</span>
          <span class="value" :class="{ price: false }">{{ packageInfo.plan_name }}</span>
        </div>
        <div class="summary-item" >
          <span class="label">时长</span>
          <span class="value" :class="{ price: false }">{{ formatDuration(packageInfo.duration_days) }}</span>
        </div>
        <div class="summary-divider" v-if="totalPrice"></div>
        <div class="summary-total" v-if="totalPrice">
          <span class="label">{{ totalLabel }}</span>
          <span class="value price">¥{{ totalPrice }}</span>
        </div>
      </div>

      <!-- 支付方式 -->
      <div class="payment-methods">
        <div class="methods-title">支付方式</div>
        <van-radio-group v-model="selectedMethod">
          <div
            v-for="method in paymentMethods"
            :key="method.value"
            class="method-item"
            @click="selectedMethod = method.value"
          >
            <div class="method-left">
              <van-icon :name="method.icon" size="28" />
              <span class="method-name">{{ method.name }}</span>
              <van-tag v-if="method.tag" type="danger" size="mini">{{ method.tag }}</van-tag>
            </div>
            <van-radio :name="method.value" />
          </div>
        </van-radio-group>
      </div>

      <!-- 底部操作 -->
      <div class="payment-action">
        <van-button
          type="danger"
          size="large"
          round
          block
          :loading="loading"
          :disabled="!selectedMethod"
          @click="handleConfirm"
        >
          {{ confirmText || `确认支付 ¥${totalPrice}` }}
        </van-button>
        <div class="payment-tip" v-if="tipText">
          <van-icon name="info-o" size="12" />
          {{ tipText }}
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import {onMounted, ref, watch} from 'vue'
import {createMembershipOrder} from "@/api/order.js";
import {showDialog, showLoadingToast} from "vant";
import {getPaymentMethods} from "@/api/payment.js";

const props = defineProps({
  // 控制显示隐藏
  show: {
    type: Boolean,
    default: false
  },
  // 弹窗标题
  title: {
    type: String,
    default: '确认支付'
  },
  // 安装包信息
  packageInfo: {
    type: Object,
    default: {},
    // 示例: [{ label: '套餐', value: '月卡' }, { label: '时长', value: '1个月' }]
  },
  // 总价
  totalPrice: {
    type: [Number, String],
    default: 0
  },
  // 总价标签
  totalLabel: {
    type: String,
    default: '应付金额'
  },
  // 确认按钮文字
  confirmText: {
    type: String,
    default: ''
  },
  // 底部提示文字
  tipText: {
    type: String,
    default: '支付即代表同意《会员服务协议》'
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'confirm', 'close', 'closed', 'change-method'])

const visible = ref(false)
const selectedMethod = ref('')
const paymentMethods = ref([])

watch(() => props.show, (newVal) => {
  visible.value = newVal
}, { immediate: true })

// 监听 visible 变化，同步到父组件
watch(visible, (newVal) => {
  emit('update:show', newVal)
})

// 监听支付方式变化
watch(selectedMethod, (newVal) => {
  emit('change-method', newVal)
})
const formatDuration = (days) => {
  if (!days) return '终身'
  if (days === 30) return '1个月'
  if (days === 90) return '3个月'
  if (days === 180) return '6个月'
  if (days === 365) return '12个月'
  return `${Math.round(days / 30)}个月`
}
// 关闭弹窗
const handleClose = () => {
  visible.value = false
  emit('close')
}

// 弹窗关闭后的回调
const handleClosed = () => {
  emit('closed')
}

// 确认购买
const handleConfirm = async() => {
  try {
    const orderData = {
      packageId: props.packageInfo.id,
      paymentMethod: selectedMethod.value
    }
    console.log(orderData)
    const res = await createMembershipOrder(orderData)
    if(res.code === 0){
      emit('confirm', {
        orderId: res.data.orderId,
        ...orderData
      })
      return
    }
    await showDialog({
      message: res.msg || '创建订单失败'
    })
  } catch (error) {
    await showDialog({
      message: error.message || '创建订单失败'
    })
  }
}


const loadPayments = async ()=>{
    let resp = await getPaymentMethods()
    if(resp.code === 0){
      paymentMethods.value = resp.data
      return
    }
  await showDialog({
    message: resp.msg
  })
}

onMounted(() => {
  loadPayments()
})
// 暴露方法给父组件
defineExpose({
  close: handleClose
})
</script>

<style scoped>
.payment-popup {
  z-index: 9999;
}

.payment-container {
  padding: 20px;
}

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.payment-header h3 {
  font-size: 18px;
  font-weight: bold;
  color: #323233;
  margin: 0;
}

.payment-header .van-icon {
  cursor: pointer;
  padding: 4px;
  margin: -4px;
}

.payment-summary {
  background: #f7f8fa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.summary-item .label {
  color: #646566;
}

.summary-item .value {
  color: #323233;
  font-weight: 500;
}

.summary-item .value.price {
  color: #ee0a24;
  font-weight: bold;
}

.summary-divider {
  height: 1px;
  background: #ebedf0;
  margin: 8px 0;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 15px;
}

.summary-total .label {
  color: #646566;
  font-weight: 500;
}

.summary-total .value.price {
  font-size: 20px;
  font-weight: bold;
  color: #ee0a24;
}

.payment-methods {
  margin-bottom: 20px;
}

.methods-title {
  font-size: 15px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 12px;
}

.method-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.method-item:last-child {
  margin-bottom: 0;
}

.method-item:active {
  background: #ebedf0;
}

.method-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.method-name {
  font-size: 15px;
  color: #323233;
}

.payment-action {
  padding-top: 12px;
}

.payment-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 12px;
  font-size: 11px;
  color: #969799;
}
</style>
