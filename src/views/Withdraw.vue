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
        <div class="balance-amount">{{ commissionAvailable.toFixed(2) }}</div>
        <div class="balance-tip">
          最低提现 ¥{{ withdrawConfig.minWithdraw }}，最高单次提现 ¥{{ withdrawConfig.maxWithdraw }}
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
            @click="openWithdrawTypePicker"
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
        @cancel="closeWithdrawTypePicker"
      />
    </van-popup>
  </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import { useRouter } from 'vue-router'
import {showDialog, showFailToast, showLoadingToast, showToast} from 'vant'
import {useUserStore} from "@/pinia";
import {getWithdrawConfig, userWithdraw} from "@/api/withdraw"
const router = useRouter()
const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo || {})
const minWithdrawAmount = computed(() => withdrawConfig.value?.minWithdraw || 0)
const maxWithdrawAmount = computed(() => withdrawConfig.value?.maxWithdraw || 0)
const commissionAvailable = computed(() => userStore.commissionAvailable)

// 提现配置
const withdrawConfig = ref({
  minWithdraw: 0,
  maxWithdraw: 0,
  dailyWithdrawCount: 0,
  withdrawMethods: [],
  settlementCycle: '',
  withdrawFee: 0,
  withdrawProcessDays: ''
})

const configLoading = ref(false)

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
const amountError = ref('')
const submitting = ref(false)
const showWithdrawTypePicker = ref(false)


// 所有提现方式
const allWithdrawTypes = [
  { text: '支付宝', value: 'alipay' },
  { text: '微信', value: 'wechat' },
  { text: '银行卡', value: 'bank' }
]
const withdrawTypeColumns = computed(() => {
  if (!withdrawConfig.value?.withdrawMethods) {
    return []
  }
  return allWithdrawTypes.filter(item =>
    withdrawConfig.value.withdrawMethods.includes(item.value)
  )
})
const withdrawTypeText = computed(() => {
  const type = withdrawTypeColumns.value.find(
    item => item.value === formData.value.withdrawType
  )
  return type ? type.text : ''
})
// ✅ 优化6：重置账户字段
const resetAccountFields = () => {
  formData.value.alipayAccount = ''
  formData.value.alipayName = ''
  formData.value.wechatAccount = ''
  formData.value.wechatName = ''
  formData.value.bankName = ''
  formData.value.bankAccount = ''
  formData.value.bankHolder = ''
}

// ✅ 优化4：改进验证逻辑（不弹toast）
const validateAmount = (val) => {
  const amount = parseFloat(val)

  if (!val || isNaN(amount) || amount <= 0) {
    amountError.value = '请输入有效金额'
    return false
  }

  if (amount < minWithdrawAmount.value) {
    amountError.value = `最低提现金额为 ¥${minWithdrawAmount.value}`
    return false
  }

  if (amount > maxWithdrawAmount.value) {
    amountError.value = `单次最高提现金额为 ¥${maxWithdrawAmount.value}`
    return false
  }

  if (amount > commissionAvailable.value) {
    amountError.value = '提现金额不能大于可提现金额'
    return false
  }

  amountError.value = ''
  return true
}

// ✅ 优化5：全部提现逻辑优化
const setAllAmount = () => {
  const available = commissionAvailable.value

  if (available <= 0) {
    showToast('暂无可提现金额')
    return
  }

  if (available > maxWithdrawAmount.value) {
    formData.value.amount = maxWithdrawAmount.value.toString()
    showToast(`已设置为最大提现金额 ¥${maxWithdrawAmount.value}`)
  } else if (available < minWithdrawAmount.value) {
    showToast(`可提现金额不足最低提现金额 ¥${minWithdrawAmount.value}`)
  } else {
    formData.value.amount = available.toString()
  }
  // 触发验证
  validateAmount(formData.value.amount)
}


const openWithdrawTypePicker = () => {
  if (withdrawTypeColumns.value.length === 0) {
    showToast('暂无可用的提现方式')
    return
  }
  showWithdrawTypePicker.value = true
}

const closeWithdrawTypePicker = () => {
  showWithdrawTypePicker.value = false
}
// 修复：Vant 4 的 Picker 组件 confirm 事件参数格式
// ✅ 优化7：Picker确认处理（兼容Vant 4）
const onWithdrawTypeConfirm = (value) => {
  // 兼容 Vant 3 和 Vant 4
  const selectedType = value.selectedValues?.[0] || value.selectedOptions?.[0]?.value
  if (!selectedType) {
    showToast('请选择提现方式')
    return
  }
  // 切换提现方式时清理数据
  resetAccountFields()

  // 设置新的提现方式
  formData.value.withdrawType = selectedType
  showWithdrawTypePicker.value = false
}

// ✅ 优化8：提交处理优化
const onSubmit = async () => {
  // 验证金额
  if (!validateAmount(formData.value.amount)) {
    showToast(amountError.value || '请检查提现金额')
    return
  }

  // 验证提现方式
  if (!formData.value.withdrawType) {
    showToast('请选择提现方式')
    return
  }

  // 验证账户信息
  if (!validateAccountInfo()) {
    return
  }
// ✅ 构建请求数据，将 amount 转为数字
  const requestData = {
    ...formData.value,
    amount: parseFloat(formData.value.amount)  // 转为数字
  }
  // 确认对话框
  showDialog({
    title: '确认提现',
    message: `确认提现 ¥${formData.value.amount} 到${withdrawTypeText.value}吗？`,
    showCancelButton: true
  }).then(async () => {
    try {
      submitting.value = true
      const resp = await userWithdraw(requestData)

      if (resp.code === 0) {
        showToast({
          message: '提现申请已提交',
          type: 'success'
        })
        // ✅ 优化：不刷新页面，更新状态后跳转
        setTimeout(async () => {
          router.push('/withdrawRecord')  // 跳转到提现记录
        }, 1500)
        return
      }

      showFailToast(resp.msg || "提现申请失败")
    } catch (error) {
      console.error('提现失败:', error)
      showFailToast(error.message || '提现申请失败，请重试')
    } finally {
      submitting.value = false
    }
  }).catch(() => {
    // 取消操作
  })
}


// ✅ 新增：验证账户信息
const validateAccountInfo = () => {
  const { withdrawType } = formData.value

  if (withdrawType === 'alipay') {
    if (!formData.value.alipayAccount) {
      showToast('请输入支付宝账号')
      return false
    }
    if (!formData.value.alipayName) {
      showToast('请输入支付宝实名姓名')
      return false
    }
  } else if (withdrawType === 'wechat') {
    if (!formData.value.wechatAccount) {
      showToast('请输入微信账号')
      return false
    }
    if (!formData.value.wechatName) {
      showToast('请输入微信实名姓名')
      return false
    }
  } else if (withdrawType === 'bank') {
    if (!formData.value.bankName) {
      showToast('请输入开户银行')
      return false
    }
    if (!formData.value.bankAccount) {
      showToast('请输入银行卡号')
      return false
    }
    if (!formData.value.bankHolder) {
      showToast('请输入持卡人姓名')
      return false
    }
  }
  return true
}

// 获取提现配置
const loadWithdrawConfig = async () => {
  const toast = showLoadingToast({
    message: '加载配置中...',
    forbidClick: true,
    duration: 0
  })

  try {
    const res = await getWithdrawConfig()
    if (res.code === 0 && res.data) {
      withdrawConfig.value = { ...res.data }
    } else {
      showToast('获取配置失败，使用默认配置')
    }
  } catch (error) {
    console.error('获取提现配置失败:', error)
    showToast('获取配置失败，请刷新重试')
  } finally {
    toast.close()
  }
}

// 3. 页面加载时获取配置
onMounted(() => {
  loadWithdrawConfig()
})
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
