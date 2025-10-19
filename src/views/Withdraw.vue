<template>
  <div class="withdraw-page">
    <van-nav-bar
      title="申请提现"
      left-arrow
      fixed
      @click-left="router.back()"
    />

    <div class="content" style="padding-top: 46px;">
      <!-- 可提现金额 -->
      <div class="balance-card">
        <div class="balance-label">可提现金额（元）</div>
        <div class="balance-amount">{{ availableAmount.toFixed(2) }}</div>
        <div class="balance-tip">
          最低提现 ¥{{ minWithdrawAmount }}，最高单次提现 ¥{{ maxWithdrawAmount }}
        </div>
      </div>

      <!-- 提现表单 -->
      <van-form @submit="onSubmit">
        <!-- 提现金额 -->
        <van-cell-group inset>
          <van-field
            v-model="formData.amount"
            type="number"
            label="提现金额"
            placeholder="请输入提现金额"
            required
            :rules="[
              { required: true, message: '请输入提现金额' },
              { validator: validateAmount, message: '提现金额不符合要求' }
            ]"
          >
            <template #button>
              <van-button size="small" type="primary" @click="setAllAmount">全部</van-button>
            </template>
          </van-field>
        </van-cell-group>

        <!-- 提现方式 -->
        <van-cell-group inset style="margin-top: 12px;">
          <van-field
            v-model="withdrawTypeText"
            label="提现方式"
            placeholder="请选择提现方式"
            readonly
            required
            is-link
            @click="showWithdrawTypePicker = true"
          />
        </van-cell-group>

        <!-- 支付宝提现 -->
        <van-cell-group v-if="formData.withdrawType === 'alipay'" inset style="margin-top: 12px;">
          <van-field
            v-model="formData.alipayAccount"
            label="支付宝账号"
            placeholder="请输入支付宝账号"
            required
            :rules="[{ required: true, message: '请输入支付宝账号' }]"
          />
          <van-field
            v-model="formData.alipayName"
            label="真实姓名"
            placeholder="请输入支付宝实名姓名"
            required
            :rules="[{ required: true, message: '请输入真实姓名' }]"
          />
        </van-cell-group>

        <!-- 微信提现 -->
        <van-cell-group v-if="formData.withdrawType === 'wechat'" inset style="margin-top: 12px;">
          <van-field
            v-model="formData.wechatAccount"
            label="微信账号"
            placeholder="请输入微信号/手机号"
            required
            :rules="[{ required: true, message: '请输入微信账号' }]"
          />
          <van-field
            v-model="formData.wechatName"
            label="真实姓名"
            placeholder="请输入微信实名姓名"
            required
            :rules="[{ required: true, message: '请输入真实姓名' }]"
          />
        </van-cell-group>

        <!-- 银行卡提现 -->
        <van-cell-group v-if="formData.withdrawType === 'bank'" inset style="margin-top: 12px;">
          <van-field
            v-model="formData.bankName"
            label="开户银行"
            placeholder="请输入开户银行"
            required
            :rules="[{ required: true, message: '请输入开户银行' }]"
          />
          <van-field
            v-model="formData.bankAccount"
            label="银行卡号"
            placeholder="请输入银行卡号"
            required
            :rules="[{ required: true, message: '请输入银行卡号' }]"
          />
          <van-field
            v-model="formData.bankHolder"
            label="持卡人"
            placeholder="请输入持卡人姓名"
            required
            :rules="[{ required: true, message: '请输入持卡人姓名' }]"
          />
        </van-cell-group>

        <!-- 提现说明 -->
        <div class="withdraw-tips">
          <div class="tips-title">
            <van-icon name="warning-o" />
            提现说明
          </div>
          <div class="tips-content">
            <p>1. 请确保账号信息准确，否则可能导致提现失败</p>
            <p>2. 提现申请提交后1-3个工作日内到账</p>
            <p>3. 每日最多可提现3次</p>
            <p>4. 首次提现需要进行实名认证</p>
          </div>
        </div>

        <!-- 提交按钮 -->
        <div style="margin: 16px;">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :loading="submitting"
          >
            确认提现
          </van-button>
        </div>
      </van-form>
    </div>

    <!-- 提现方式选择器 -->
    <van-popup v-model:show="showWithdrawTypePicker" position="bottom">
      <van-picker
        :columns="withdrawTypeColumns"
        @confirm="onWithdrawTypeConfirm"
        @cancel="showWithdrawTypePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showDialog, showToast } from 'vant'

const router = useRouter()

const availableAmount = ref(158.50)
const minWithdrawAmount = ref(10)
const maxWithdrawAmount = ref(5000)

const formData = ref({
  amount: '',
  withdrawType: '',
  alipayAccount: '',
  alipayName: '',
  wechatAccount: '',
  wechatName: '',
  bankName: '',
  bankAccount: '',
  bankHolder: ''
})

const submitting = ref(false)
const showWithdrawTypePicker = ref(false)

const withdrawTypeColumns = [
  { text: '支付宝', value: 'alipay' },
  { text: '微信', value: 'wechat' },
  { text: '银行卡', value: 'bank' }
]

const withdrawTypeText = computed(() => {
  const type = withdrawTypeColumns.find(item => item.value === formData.value.withdrawType)
  return type ? type.text : ''
})

const validateAmount = (val) => {
  const amount = parseFloat(val)
  if (isNaN(amount)) {
    return false
  }
  if (amount < minWithdrawAmount.value) {
    showToast(`最低提现金额为 ¥${minWithdrawAmount.value}`)
    return false
  }
  if (amount > maxWithdrawAmount.value) {
    showToast(`单次最高提现金额为 ¥${maxWithdrawAmount.value}`)
    return false
  }
  if (amount > availableAmount.value) {
    showToast('提现金额不能大于可提现金额')
    return false
  }
  return true
}

const setAllAmount = () => {
  if (availableAmount.value > maxWithdrawAmount.value) {
    formData.value.amount = maxWithdrawAmount.value.toString()
    showToast(`已设置为最大提现金额 ¥${maxWithdrawAmount.value}`)
  } else {
    formData.value.amount = availableAmount.value.toString()
  }
}

const onWithdrawTypeConfirm = ({ selectedValues }) => {
  formData.value.withdrawType = selectedValues[0]
  showWithdrawTypePicker.value = false
}

const onSubmit = async () => {
  if (!formData.value.withdrawType) {
    showToast('请选择提现方式')
    return
  }

  showDialog({
    title: '确认提现',
    message: `确认提现 ¥${formData.value.amount} 到${withdrawTypeText.value}吗？`,
    showCancelButton: true
  }).then(async () => {
    try {
      submitting.value = true

      // TODO: 调用API
      // await api.submitWithdraw(formData.value)

      await new Promise(resolve => setTimeout(resolve, 1000))

      showToast({
        message: '提现申请已提交',
        type: 'success'
      })

      setTimeout(() => {
        router.back()
      }, 1500)
    } catch (error) {
      console.error('提现失败:', error)
      showToast('提现申请失败，请重试')
    } finally {
      submitting.value = false
    }
  }).catch(() => {
    // 取消
  })
}
</script>

<style scoped>
.withdraw-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.content {
  padding-bottom: 20px;
}

.balance-card {
  margin: 12px;
  padding: 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  text-align: center;
  color: white;
}

.balance-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.balance-amount {
  font-size: 40px;
  font-weight: bold;
  margin-bottom: 8px;
}

.balance-tip {
  font-size: 12px;
  opacity: 0.8;
}

.withdraw-tips {
  margin: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
}

.tips-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: bold;
  color: #ff6b35;
  margin-bottom: 12px;
}

.tips-content {
  font-size: 13px;
  color: #646566;
  line-height: 1.6;
}

.tips-content p {
  margin: 8px 0;
}
</style>
