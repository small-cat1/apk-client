<template>
  <div class="settings">
    <van-nav-bar
      title="设置"
      left-arrow
      fixed
      @click-left="$router.back()"
    />

    <div class="content" style="padding-top: 46px;">
      <!-- 账号安全 -->
      <div class="section-title">账号安全</div>
      <van-cell-group inset>
        <van-cell
          title="修改密码"
          icon="lock"
          is-link
          @click="showPasswordDialog = true"
        />
<!--        <van-cell-->
<!--          title="绑定手机"-->
<!--          icon="phone-o"-->
<!--          :value="userInfo.phone ? maskPhone(userInfo.phone) : '未绑定'"-->
<!--          is-link-->
<!--          @click="showPhoneDialog = true"-->
<!--        />-->
<!--        <van-cell-->
<!--          title="绑定邮箱"-->
<!--          icon="envelop-o"-->
<!--          :value="userInfo.email ? maskEmail(userInfo.email) : '未绑定'"-->
<!--          is-link-->
<!--          @click="showEmailDialog = true"-->
<!--        />-->
      </van-cell-group>




    </div>

    <!-- 修改密码弹窗 -->
    <van-dialog
      v-model:show="showPasswordDialog"
      title="修改密码"
      show-cancel-button
      :before-close="handlePasswordChange"
    >
      <div class="dialog-content">
        <van-field
          v-model="passwordForm.oldPassword"
          type="password"
          label="原密码"
          placeholder="请输入原密码"
          :rules="[{ required: true, message: '请输入原密码' }]"
        />
        <van-field
          v-model="passwordForm.newPassword"
          type="password"
          label="新密码"
          placeholder="请输入新密码(8-20位)"
          :rules="[
            { required: true, message: '请输入新密码' },
            { pattern: /^.{8,20}$/, message: '密码长度为8-20位' }
          ]"
        />
        <van-field
          v-model="passwordForm.confirmPassword"
          type="password"
          label="确认密码"
          placeholder="请再次输入新密码"
          :rules="[{ required: true, message: '请再次输入新密码' }]"
        />
      </div>
    </van-dialog>

    <!-- 绑定手机弹窗 -->
    <van-dialog
      v-model:show="showPhoneDialog"
      title="绑定手机"
      show-cancel-button
      :before-close="handlePhoneBind"
    >
      <div class="dialog-content">
        <van-field
          v-model="phoneForm.phone"
          type="tel"
          label="手机号"
          placeholder="请输入手机号"
          :rules="[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
          ]"
        />
        <van-field
          v-model="phoneForm.code"
          label="验证码"
          placeholder="请输入验证码"
          :rules="[{ required: true, message: '请输入验证码' }]"
        >
          <template #button>
            <van-button
              size="small"
              type="primary"
              :disabled="codeCounting"
              @click="sendPhoneCode"
            >
              {{ codeCounting ? `${countdown}s后重试` : '发送验证码' }}
            </van-button>
          </template>
        </van-field>
      </div>
    </van-dialog>

    <!-- 绑定邮箱弹窗 -->
    <van-dialog
      v-model:show="showEmailDialog"
      title="绑定邮箱"
      show-cancel-button
      :before-close="handleEmailBind"
    >
      <div class="dialog-content">
        <van-field
          v-model="emailForm.email"
          type="email"
          label="邮箱"
          placeholder="请输入邮箱地址"
          :rules="[
            { required: true, message: '请输入邮箱' },
            { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '请输入正确的邮箱' }
          ]"
        />
        <van-field
          v-model="emailForm.code"
          label="验证码"
          placeholder="请输入验证码"
          :rules="[{ required: true, message: '请输入验证码' }]"
        >
          <template #button>
            <van-button
              size="small"
              type="primary"
              :disabled="emailCounting"
              @click="sendEmailCode"
            >
              {{ emailCounting ? `${emailCountdown}s后重试` : '发送验证码' }}
            </van-button>
          </template>
        </van-field>
      </div>
    </van-dialog>


  </div>
</template>

<script setup>
import {ref, reactive, computed, onMounted, onUnmounted} from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/pinia'
import {
  showToast,
  showLoadingToast,
  closeToast,
  showConfirmDialog,
  showSuccessToast,
  showFailToast
} from 'vant'
import {changePassword} from "@/api/user.js";
import {emitter} from "@/utils/bus.js";

const router = useRouter()
const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo || {})

// 弹窗控制
const showPasswordDialog = ref(false)
const showPhoneDialog = ref(false)
const showEmailDialog = ref(false)

// 表单数据
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const phoneForm = reactive({
  phone: '',
  code: ''
})

const emailForm = reactive({
  email: '',
  code: ''
})

// 验证码倒计时
const codeCounting = ref(false)
const countdown = ref(60)
const emailCounting = ref(false)
const emailCountdown = ref(60)

// 手机号脱敏
const maskPhone = (phone) => {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 邮箱脱敏
const maskEmail = (email) => {
  if (!email) return ''
  const [name, domain] = email.split('@')
  const maskedName = name.length > 2
    ? name.substring(0, 2) + '***'
    : name + '***'
  return `${maskedName}@${domain}`
}



// 修改密码
const handlePasswordChange = async (action) => {
  if (action === 'confirm') {
    // 验证表单
    if (!passwordForm.oldPassword) {
      showToast('请输入原密码')
      return false
    }
    if (!passwordForm.newPassword) {
      showToast('请输入新密码')
      return false
    }
    if (passwordForm.newPassword.length < 8 || passwordForm.newPassword.length > 20) {
      showToast('密码长度为8-20位')
      return false
    }
    if (!passwordForm.confirmPassword) {
      showToast('请再次输入新密码')
      return false
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('两次输入的密码不一致')
      return false
    }
    showLoadingToast({
      message: '修改中...',
      forbidClick: true,
      duration: 0
    })
    // TODO: 调用API修改密码
     let resp = await changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      })
    if (resp.code === 0){
      showSuccessToast({
        message: '密码修改成功，请重新登录',
        duration: 2000,
        onClose: async () => {
          await userStore.LoginOut()
        }
      })
      return true
    }
    showFailToast({
      message: resp.msg || '密码修改失败',
    })
    passwordForm.value = {
      oldPassword:"",
      newPassword:"",
      confirmPassword:""
    }
    return false
  }
  return true
}

const handleAuthSuccess = (context) => {
  if (context?.source === 'download') {
    window.location.reload()
  }
}

onMounted(() => {
  emitter.on('auth-success', handleAuthSuccess)
})

onUnmounted(() => {
  emitter.off('auth-success', handleAuthSuccess)
})

// 发送手机验证码
const sendPhoneCode = () => {
  if (!phoneForm.phone) {
    showToast('请输入手机号')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(phoneForm.phone)) {
    showToast('请输入正确的手机号')
    return
  }

  showLoadingToast({
    message: '发送中...',
    forbidClick: true
  })

  // TODO: 调用API发送验证码
  setTimeout(() => {
    closeToast()
    showToast({
      message: '验证码已发送',
      type: 'success'
    })

    // 开始倒计时
    codeCounting.value = true
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
        codeCounting.value = false
      }
    }, 1000)
  }, 1000)
}

// 绑定手机
const handlePhoneBind = (action) => {
  if (action === 'confirm') {
    if (!phoneForm.phone || !phoneForm.code) {
      showToast('请填写完整信息')
      return false
    }

    showLoadingToast({
      message: '绑定中...',
      forbidClick: true,
      duration: 0
    })

    // TODO: 调用API绑定手机
    setTimeout(() => {
      closeToast()
      showToast({
        message: '绑定成功',
        type: 'success'
      })
      phoneForm.phone = ''
      phoneForm.code = ''
      return true
    }, 1500)
  }
  return true
}

// 发送邮箱验证码
const sendEmailCode = () => {
  if (!emailForm.email) {
    showToast('请输入邮箱')
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.email)) {
    showToast('请输入正确的邮箱')
    return
  }

  showLoadingToast({
    message: '发送中...',
    forbidClick: true
  })

  // TODO: 调用API发送验证码
  setTimeout(() => {
    closeToast()
    showToast({
      message: '验证码已发送',
      type: 'success'
    })

    emailCounting.value = true
    emailCountdown.value = 60
    const timer = setInterval(() => {
      emailCountdown.value--
      if (emailCountdown.value <= 0) {
        clearInterval(timer)
        emailCounting.value = false
      }
    }, 1000)
  }, 1000)
}

// 绑定邮箱
const handleEmailBind = (action) => {
  if (action === 'confirm') {
    if (!emailForm.email || !emailForm.code) {
      showToast('请填写完整信息')
      return false
    }

    showLoadingToast({
      message: '绑定中...',
      forbidClick: true,
      duration: 0
    })

    // TODO: 调用API绑定邮箱
    setTimeout(() => {
      closeToast()
      showToast({
        message: '绑定成功',
        type: 'success'
      })
      emailForm.email = ''
      emailForm.code = ''
      return true
    }, 1500)
  }
  return true
}







</script>

<style scoped>
.settings {
  background: #f7f8fa;
  min-height: 100vh;
}

.content {
  padding: 12px 0 60px 0;
}

.section-title {
  padding: 16px 16px 8px;
  color: #969799;
  font-size: 14px;
}

.dialog-content {
  padding: 16px 0;
}

.dialog-content .van-field {
  margin-bottom: 12px;
}
</style>
