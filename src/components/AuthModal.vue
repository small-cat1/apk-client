<template>
  <div>
    <van-popup
      v-model:show="visible"
      position="bottom"
      :style="{ height: '70%' }"
      round
      :closeable="false"
      @close="handleClose"
    >
      <div class="auth-modal">
        <!-- 标题栏 -->
        <div class="auth-header">
          <!-- 关闭按钮独立出来 -->
          <van-icon
            name="cross"
            class="close-btn"
            @click="visible = false"
          />
          <div class="auth-tabs">
            <div
              class="tab-item"
              :class="{ active: currentTab === 'login' }"
              @click="currentTab = 'login'"
            >
              登录
            </div>
            <div
              class="tab-item"
              :class="{ active: currentTab === 'register' }"
              @click="currentTab = 'register'"
            >
              注册
            </div>
          </div>
        </div>

        <!-- 登录表单 -->
        <div v-show="currentTab === 'login'" class="auth-form">
          <van-form @submit="handleLogin">
            <van-field
              v-model="loginForm.phone"
              name="phone"
              label="手机号"
              placeholder="请输入手机号"
              :rules="phoneRules"
              left-icon="user-o"
            />
            <van-field
              v-model="loginForm.password"
              type="password"
              name="password"
              label="密码"
              placeholder="请输入密码"
              :rules="passwordRules"
              left-icon="lock"
            />

            <!-- 图形验证码 -->
            <van-field
              v-model="loginForm.captcha"
              name="captcha"
              label="验证码"
              placeholder="请输入验证码"
              :rules="[{ required: true, message: '请输入验证码' }]"
              left-icon="shield-o"
            >
              <template #button>
                <img
                  :src="captchaImage"
                  class="captcha-img"
                  @click="refreshCaptcha"
                  alt="验证码"
                />
              </template>
            </van-field>

            <div class="auth-actions">
              <van-button
                round
                block
                type="primary"
                native-type="submit"
                :loading="loginLoading"
              >
                登录
              </van-button>
            </div>
            <div class="auth-links">
              <span @click="handleForgotPassword">忘记密码？</span>
            </div>
          </van-form>
        </div>

        <!-- 注册表单 -->
        <div v-show="currentTab === 'register'" class="auth-form">
          <van-form @submit="handleRegister">
            <van-field
              v-model="registerForm.phone"
              name="phone"
              label="手机号"
              placeholder="请输入手机号"
              type="tel"
              maxlength="11"
              :rules="phoneRules"
              left-icon="phone-o"
            />

            <van-field
              v-model="registerForm.email"
              name="email"
              label="邮箱"
              placeholder="请输入邮箱"
              :rules="emailRules"
              left-icon="envelop-o"
            />
            <van-field
              v-model="registerForm.password"
              type="password"
              name="password"
              label="密码"
              placeholder="请输入密码"
              :rules="passwordRules"
              left-icon="lock"
            />
            <van-field
              v-model="registerForm.confirmPassword"
              type="password"
              name="confirmPassword"
              label="确认密码"
              placeholder="请再次输入密码"
              :rules="confirmPasswordRules"
              left-icon="lock"
            />

            <!-- 图形验证码 -->
            <van-field
              v-model="registerForm.captcha"
              name="captcha"
              label="验证码"
              placeholder="请输入图形验证码"
              :rules="[{ required: true, message: '请输入验证码' }]"
              left-icon="shield-o"
            >
              <template #button>
                <img
                  :src="captchaImage"
                  class="captcha-img"
                  @click="refreshCaptcha"
                  alt="验证码"
                />
              </template>
            </van-field>

            <div class="auth-actions">
              <van-button
                round
                block
                type="primary"
                native-type="submit"
                :loading="registerLoading"
              >
                注册
              </van-button>
            </div>
            <div class="auth-agreement">
              <van-checkbox v-model="agreeTerms">
                我已阅读并同意
                <span class="link" @click="showTerms">《服务协议》</span>
                和
                <span class="link" @click="showPrivacy">《隐私政策》</span>
              </van-checkbox>
            </div>
          </van-form>
        </div>
      </div>
    </van-popup>
    <ResetPassword v-model:show="showResetPassword" />
  </div>

</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/pinia'
import {captcha, register} from "@/api/user.js"
import { showDialog, showFailToast, showSuccessToast, showToast } from 'vant'
import { emitter } from '@/utils/bus'
import ResetPassword from './ResetPassword.vue'
import {InviteCodeManager} from "@/utils/inviteCode.js";

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'success'])

const router = useRouter()
const userStore = useUserStore()

const visible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const currentTab = ref('login')
const loginLoading = ref(false)
const registerLoading = ref(false)
const agreeTerms = ref(false)
const showResetPassword = ref(false)

// 验证码相关
const captchaImage = ref('')
const captchaKey = ref('')

// 登录表单
const loginForm = reactive({
  phone: '',
  password: '',
  captcha: ''
})

// 注册表单
const registerForm = reactive({
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  captcha: '',
})

const phoneRules = [
  { required: true, message: '请输入手机号' },
  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式' }
]

const emailRules = [
  { required: true, message: '请输入邮箱' },
  { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '请输入正确的邮箱格式' }
]

const passwordRules = [
  { required: true, message: '请输入密码' },
  { pattern: /^.{8,20}$/, message: '密码长度为8-20位' }
]

const confirmPasswordRules = [
  { required: true, message: '请确认密码' },
  {
    validator: (value) => value === registerForm.password,
    message: '两次输入的密码不一致'
  }
]

// 获取图形验证码
const getCaptcha = async () => {
  const ele = await captcha()
  if(ele.code === 0){
    captchaImage.value = ele.data.picPath // base64图片
    captchaKey.value = ele.data.captchaId // 验证码key
    return
  }
  showFailToast('获取验证码失败，'+ele.msg)
}

// 刷新验证码
const refreshCaptcha = () => {
  getCaptcha()
}

// 监听弹窗显示状态
watch(visible, (newVal) => {
  if (newVal) {
    getCaptcha() // 打开弹窗时获取验证码
  }
})

// 监听tab切换
watch(currentTab, () => {
  getCaptcha() // 切换tab时刷新验证码
})

// 监听全局登录弹窗事件
const handleShowLoginModal = () => {
  visible.value = true
}

onMounted(() => {
  emitter.on('show-login-modal', handleShowLoginModal)
})

onUnmounted(() => {
  emitter.off('show-login-modal', handleShowLoginModal)
})



// 方法
const handleLogin = async () => {
  loginLoading.value = true
  let resp = await userStore.LoginIn({
    phone: loginForm.phone,
    password: loginForm.password,
    captcha: loginForm.captcha,
    captchaKey: captchaKey.value
  })
  if(resp){
    loginLoading.value = false
    showSuccessToast('登录成功')
    emit('success')
    // 🎯 触发全局事件（不带上下文，由各组件自己判断）
    emitter.emit('auth-success')
  }else{
    loginLoading.value = false
    refreshCaptcha() // 登录失败后刷新验证码
  }
}

const handleRegister = async () => {
  if (!agreeTerms.value) {
    showFailToast('请先同意服务协议和隐私政策')
    return
  }
  registerLoading.value = true
  try {
    const savedCode = InviteCodeManager.get()
    let resp = await register({
      phone: registerForm.phone,
      email: registerForm.email,
      password: registerForm.password,
      captcha: registerForm.captcha,
      captchaKey: captchaKey.value,
      inviteCode:savedCode
    })
    if (resp.code !== 0) {
      showFailToast(resp.msg || '注册失败')
      refreshCaptcha()
      return
    }
    showSuccessToast('注册成功，请登录')
    currentTab.value = 'login'
    resetForms()
  } catch (error) {
    showFailToast(error.message || '注册失败')
    refreshCaptcha()
  } finally {
    registerLoading.value = false
  }
}

const handleForgotPassword = () => {
  showResetPassword.value = true
}

const showTerms = () => {
  showToast('服务协议')
}

const showPrivacy = () => {
  showToast('隐私政策')
}

const handleClose = () => {
  resetForms()
}

const resetForms = () => {
  Object.assign(loginForm, { phone: '', password: '', captcha: '' })
  Object.assign(registerForm, {
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    captcha: ''
  })
  agreeTerms.value = false
  currentTab.value = 'login'
}
</script>

<style scoped>
.auth-modal {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.auth-header {
  margin-bottom: 30px;
  position: relative;
}

.close-btn {
  position: absolute;
  top: -20px;
  right: 0;
  z-index: 10;
}

.auth-tabs {
  margin-top: 8px;
  display: flex;
  background: #f7f8fa;
  border-radius: 6px;
  padding: 4px;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-item.active {
  background: white;
  color: #1989fa;
  font-weight: bold;
}

.auth-form {
  padding: 0 10px;
}

.auth-actions {
  margin: 30px 0 20px 0;
}

.auth-links {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.auth-links span {
  color: #1989fa;
  font-size: 14px;
  cursor: pointer;
}

.auth-links :deep(.van-divider) {
  margin: 0 8px;
}

.auth-agreement {
  margin-top: 20px;
  font-size: 12px;
  color: #969799;
}

.link {
  color: #1989fa !important;
  cursor: pointer;
}

:deep(.van-field__label) {
  width: 80px;
}

.captcha-img {
  height: 32px;
  width: 80px;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid #ebedf0;
  object-fit: cover;
}

.captcha-img:hover {
  opacity: 0.8;
}
</style>
