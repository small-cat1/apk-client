<template>
  <van-dialog
    v-model:show="visible"
    title="确认购买账号"
    show-cancel-button
    confirm-button-text="确认支付"
    :before-close="handleBeforeClose"
    @confirm="handleConfirm"
  >
    <div class="buy-dialog-content" v-if="app">
      <!-- 应用信息 -->
      <div class="app-summary">

        <CustomPic
          :pic-src="app.app_icon"
          :custom-style="{ width: '56px', height: '56px', borderRadius: '12px',objectFit:'cover',flexShrink:0 }"
          class="app-icon"
        />
        <div class="app-info">
          <h4>{{ app.app_name }}</h4>
          <p>{{ app.app_desc }}</p>
        </div>
      </div>

      <!-- 购买数量 -->
      <van-cell-group inset>
        <van-cell title="购买数量" />
        <div class="quantity-selector">
          <van-stepper
            v-model="purchaseQuantity"
            :min="1"
            :max="maxStock"
            button-size="28"
            input-width="60"
          />
          <span class="stock-info">库存剩余：{{ app.stock }} 个</span>
        </div>
      </van-cell-group>

      <!-- 账号信息展示（如果有的话） -->
      <van-cell-group inset v-if="app.account_details">
        <van-cell title="账号信息" />
        <div class="account-info-box">
          <div class="info-row">
            <span class="label">账号：</span>
            <span class="value">{{ app.account_details.username }}</span>
          </div>
          <div class="info-row">
            <span class="label">有效期：</span>
            <span class="value">{{ app.account_details.validity }}</span>
          </div>
        </div>
      </van-cell-group>

      <!-- 支付方式 -->
      <van-cell-group inset>
        <van-cell title="支付方式" />
        <van-radio-group v-model="paymentMethod">
          <van-cell
            v-for="method in paymentMethods"
            :key="method.value"
            clickable
            @click="paymentMethod = method.value"
          >
            <template #title>
              <div class="payment-method-item">
                <van-icon :name="method.icon" size="20" />
                <span>{{ method.name }}</span>
              </div>
            </template>
            <template #right-icon>
              <van-radio :name="method.value" />
            </template>
          </van-cell>
        </van-radio-group>
      </van-cell-group>

      <!-- 费用明细 -->
      <div class="price-detail">
        <div class="detail-row">
          <span>单价</span>
          <span>¥{{ app.account_price }}</span>
        </div>
        <div class="detail-row">
          <span>数量</span>
          <span>× {{ purchaseQuantity }}</span>
        </div>
        <div class="detail-row">
          <span>小计</span>
          <span>¥{{ (app.account_price * purchaseQuantity).toFixed(2) }}</span>
        </div>
        <div class="detail-row total">
          <span>实付金额</span>
          <span class="total-price">¥{{ finalPrice }}</span>
        </div>
      </div>

      <!-- 服务协议 -->
<!--      <div class="agreement">-->
<!--        <van-checkbox v-model="agreedToTerms">-->
<!--          我已阅读并同意-->
<!--          <span class="link" @click.stop="showTerms">《购买服务协议》</span>-->
<!--        </van-checkbox>-->
<!--      </div>-->
    </div>
  </van-dialog>
</template>

<script setup>
import {ref, computed, watch, onMounted} from 'vue'
import { showDialog } from 'vant'
import {createAccountOrder} from '@/api/order'
import CustomPic from '@/components/CustomPic.vue'
import {getPaymentMethods} from "@/api/payment.js";

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  app: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:show', 'confirm'])

const visible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const maxStock = computed(()=>{
  if (props.app.stock >= 3){
    return 3
  }else{
    return props.app.stock
  }
})
const purchaseQuantity = ref(1)
const paymentMethod = ref('')
const agreedToTerms = ref(false)
const paymentMethods = ref([]) // 支付方式



// 最终价格
const finalPrice = computed(() => {
  const price = props.app?.account_price || 0
  return (price * purchaseQuantity.value).toFixed(2)
})

// 关闭前确认
const handleBeforeClose = (action) => {
  if (action === 'confirm') {
    return true
  }
  return true
}

// 确认购买
const handleConfirm = async () => {
  try {
    const orderData = {
      appId: props.app.id,
      quantity: purchaseQuantity.value,
      amount: finalPrice.value,
      paymentMethod: paymentMethod.value
    }
    const res = await createAccountOrder(orderData)
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

// 监听弹窗打开/关闭
watch(() => props.show, async (newVal) => {
  if (newVal) {
    // 弹窗打开时重置数据并加载支付方式
    purchaseQuantity.value = 1
    paymentMethod.value = ''
    agreedToTerms.value = false
    // 加载支付方式
    await loadPayments()
  }
})
</script>

<style scoped>
.buy-dialog-content {
  padding: 16px;
  max-height: 65vh;
  overflow-y: auto;
}

.app-summary {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
}

.app-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}

.app-info h4 {
  margin: 0 0 4px 0;
  font-size: 15px;
  font-weight: 600;
}

.app-info p {
  margin: 0;
  font-size: 12px;
  color: #969799;
  line-height: 1.4;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: #f7f8fa;
  border-radius: 8px;
}

.stock-info {
  font-size: 12px;
  color: #969799;
}

.account-info-box {
  padding: 12px 16px;
  background: #f7f8fa;
  border-radius: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row .label {
  color: #969799;
}

.info-row .value {
  font-weight: 500;
  color: #323233;
}

.payment-method-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-detail {
  margin: 16px 0;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #646566;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-row.total {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #ebedf0;
  font-weight: 600;
  color: #323233;
}

.total-price {
  font-size: 20px;
  color: #ee0a24;
  font-weight: bold;
}

.agreement {
  margin-top: 16px;
  font-size: 12px;
}

.link {
  color: #1989fa;
  cursor: pointer;
}
</style>
