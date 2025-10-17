<template>
  <div>
  <van-popup
    v-model:show="visible"
    position="bottom"
    :style="{ height: '60%' }"
    round
    closeable
    @close="handleClose"
  >
    <div class="reset-password-modal">
      <div class="reset-header">
        <h3>找回密码</h3>
      </div>

      <!-- 步骤1: 选择找回方式 -->
      <div v-if="resetStep === 1" class="reset-content">
        <van-cell-group>
          <van-cell
            title="通过手机号找回"
            icon="phone-o"
            is-link
            @click="selectResetType('phone')"
          >
            <template #label>
              <span style="color: #969799;">向绑定手机发送验证码</span>
            </template>
          </van-cell>
          <van-cell
            title="通过邮箱找回"
            icon="envelop-o"
            is-link
            @click="selectResetType('email')"
          >
            <template #label>
              <span style="color: #969799;">向绑定邮箱发送验证链接</span>
            </template>
          </van-cell>
        </van-cell-group>

        <div class="help-tip">
          <van-icon name="info-o" />
          <span>无法通过以上方式找回？</span>
          <span class="link" @click="handleContactService">联系客服</span>

        </div>
      </div>

      <!-- 步骤2: 手机号验证 -->
      <div v-if="resetStep === 2 && resetType === 'phone'" class="reset-content">
        <van-form @submit="onResetByPhone">
          <van-field
            v-model="resetForm.phone"
            name="phone"
            label="手机号"
            placeholder="请输入注册时的手机号"
            type="tel"
            maxlength="11"
            :rules="[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
            ]"
          />
          <van-field
            v-model="resetForm.code"
            name="code"
            label="验证码"
            placeholder="请输入验证码"
            maxlength="6"
            :rules="[{ required: true, message: '请输入验证码' }]"
          >
            <template #button>
              <van-button
                size="small"
                type="primary"
                :disabled="countdown > 0"
                @click="sendPhoneCode"
              >
                {{ countdown > 0 ? `${countdown}秒后重试` : '发送验证码' }}
              </van-button>
            </template>
          </van-field>
          <van-field
            v-model="resetForm.newPassword"
            type="password"
            name="newPassword"
            label="新密码"
            placeholder="请输入新密码"
            :rules="[
              { required: true, message: '请输入新密码' },
              { pattern: /^.{6,20}$/, message: '密码长度6-20位' }
            ]"
          />
          <van-field
            v-model="resetForm.confirmPassword"
            type="password"
            name="confirmPassword"
            label="确认密码"
            placeholder="请再次输入新密码"
            :rules="[
              { required: true, message: '请确认密码' },
              { validator: (val) => val === resetForm.newPassword, message: '两次密码不一致' }
            ]"
          />
          <div style="margin: 16px;">
            <van-button
              round
              block
              type="primary"
              native-type="submit"
              :loading="resetLoading"
            >
              重置密码
            </van-button>
            <div class="back-link" @click="goBack">
              <van-icon name="arrow-left" />
              <span>返回上一步</span>
            </div>
          </div>
        </van-form>
      </div>

      <!-- 步骤3: 邮箱验证 -->
      <div v-if="resetStep === 2 && resetType === 'email'" class="reset-content">
        <van-form @submit="onResetByEmail">
          <van-field
            v-model="resetForm.email"
            name="email"
            label="邮箱"
            placeholder="请输入注册时的邮箱"
            :rules="[
              { required: true, message: '请输入邮箱' },
              { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' }
            ]"
          />
          <div style="margin: 16px;">
            <van-button
              round
              block
              type="primary"
              native-type="submit"
              :loading="resetLoading"
            >
              发送重置链接
            </van-button>
            <p class="tip-text">
              重置链接将发送到您的邮箱，请注意查收（可能在垃圾邮件中）
            </p>
            <div class="back-link" @click="goBack">
              <van-icon name="arrow-left" />
              <span>返回上一步</span>
            </div>
          </div>
        </van-form>
      </div>
    </div>
  </van-popup>
  </div>
</template>

<script setup>
import {ref, reactive, computed} from 'vue'
import { showSuccessToast, showFailToast, showDialog } from 'vant'
import { sendSmsCode, resetPasswordByPhone, sendResetEmail } from '@/api/user'

// 🎯 关键修复:接收父组件的 show prop
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show'])

// 🎯 关键修复:使用 computed 实现双向绑定
const visible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})
// 客服组件引用
const resetStep = ref(1) // 1: 选择方式, 2: 填写信息
const resetType = ref('') // 'phone' | 'email'
const resetLoading = ref(false)
const countdown = ref(0)
let timer = null

const resetForm = reactive({
  phone: '',
  email: '',
  code: '',
  newPassword: '',
  confirmPassword: ''
})

// 关闭弹窗时重置状态
const handleClose = () => {
  resetStep.value = 1
  resetType.value = ''
  Object.assign(resetForm, {
    phone: '',
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  })
  if (timer) {
    clearInterval(timer)
    countdown.value = 0
  }
}
// 返回上一步
const goBack = () => {
  resetStep.value = 1
  resetType.value = ''
  // 清空表单数据
  Object.assign(resetForm, {
    phone: '',
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  })
  // 清除倒计时
  if (timer) {
    clearInterval(timer)
    countdown.value = 0
  }
}

// 选择找回方式
const selectResetType = (type) => {
  resetType.value = type
  resetStep.value = 2
}

// 发送手机验证码
const sendPhoneCode = async () => {
  if (!resetForm.phone) {
    showFailToast('请输入手机号')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(resetForm.phone)) {
    showFailToast('手机号格式不正确')
    return
  }

  try {
    await sendSmsCode({ phone: resetForm.phone, type: 'reset' })
    showSuccessToast('验证码已发送')

    // 倒计时
    countdown.value = 60
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    showFailToast(error.message || '发送失败')
  }
}

// 通过手机号重置
const onResetByPhone = async () => {
  resetLoading.value = true
  try {
    await resetPasswordByPhone({
      phone: resetForm.phone,
      code: resetForm.code,
      newPassword: resetForm.newPassword
    })
    showSuccessToast('密码重置成功，请重新登录')
    visible.value = false // 关闭弹窗
    handleClose()
  } catch (error) {
    showFailToast(error.message || '重置失败')
  } finally {
    resetLoading.value = false
  }
}

// 通过邮箱重置
const onResetByEmail = async () => {
  resetLoading.value = true
  try {
    await sendResetEmail({ email: resetForm.email })
    showDialog({
      title: '邮件已发送',
      message: '重置链接已发送到您的邮箱，请在24小时内完成重置。如未收到，请检查垃圾邮件。',
      confirmButtonText: '我知道了'
    }).then(() => {
      visible.value = false
      handleClose()
    })
  } catch (error) {
    showFailToast(error.message || '发送失败')
  } finally {
    resetLoading.value = false
  }
}

// 联系客服（兜底方案）
const handleContactService = () => {
  // 先关闭找回密码弹窗
  visible.value = false
  // 延迟打开客服弹窗，避免动画冲突
  setTimeout(() => {
    window.$customerService?.open()
  }, 300)
}
</script>

<style scoped>
.reset-password-modal {
  padding: 20px;
}

.reset-header {
  text-align: center;
  margin-bottom: 20px;
}

.reset-header h3 {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.reset-content {
  padding: 10px 0;
}

.help-tip {
  margin-top: 30px;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  color: #646566;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.help-tip .link {
  color: #1989fa;
  cursor: pointer;
}

.tip-text {
  margin-top: 12px;
  font-size: 12px;
  color: #969799;
  text-align: center;
  line-height: 1.6;
}
.back-link {
  margin-top: 16px;
  text-align: center;
  font-size: 14px;
  color: #1989fa;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px;
}

.back-link:active {
  opacity: 0.6;
}
</style>
