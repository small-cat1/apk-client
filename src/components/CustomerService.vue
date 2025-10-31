<template>
  <div v-if="config && config.enabled">
    <!-- 客服悬浮按钮 -->
    <div
      v-show="props.showFloatButton && showFloatBtn"
      class="customer-service"
      :style="positionStyle"
      @click="handleServiceClick"
    >
      <div
        class="service-btn"
        :class="serviceBtnClass"
        :title="config.tooltip || '联系客服'"
      >
        <van-icon :name="getIconName" size="24" />
        <span v-if="config.showText" class="btn-text">{{ getBtnText }}</span>
      </div>
    </div>

    <!-- 客服弹窗 -->
    <van-popup
      v-model:show="showServiceModal"
      position="bottom"
      :style="{ height: 'auto', maxHeight: '70%' }"
      round
      closeable
    >
      <div class="service-modal">
        <div class="service-header">
          <h3>联系客服</h3>
          <p class="service-subtitle">选择您方便的联系方式</p>
        </div>

        <div class="service-content">
          <van-cell-group>
            <!-- QQ客服 -->
            <van-cell
              v-if="config.contacts?.qq"
              title="QQ客服"
              icon="chat-o"
              is-link
              @click="openQQ"
            >
              <template #label>
                <span style="color: #969799;">QQ：{{ config.contacts.qq }}</span>
              </template>
            </van-cell>

            <!-- 微信客服 -->
            <van-cell
              v-if="config.contacts?.wechat"
              title="微信客服"
              icon="wechat"
              is-link
              @click="showWechatQrcode"
            >
              <template #label>
                <span style="color: #969799;">微信：{{ config.contacts.wechat }}</span>
              </template>
            </van-cell>

            <!-- 电话客服 -->
            <van-cell
              v-if="config.contacts?.phone"
              title="电话客服"
              icon="phone-o"
              is-link
              @click="callPhone"
            >
              <template #label>
                <span style="color: #969799;">{{ config.contacts.phone }}</span>
              </template>
            </van-cell>

            <!-- 邮箱客服 -->
            <van-cell
              v-if="config.contacts?.email"
              title="邮箱客服"
              icon="envelop-o"
              is-link
              @click="sendEmail"
            >
              <template #label>
                <span style="color: #969799;">{{ config.contacts.email }}</span>
              </template>
            </van-cell>

            <!-- 在线客服（第三方IM） -->
            <van-cell
              v-if="config.contacts?.im"
              title="在线客服"
              icon="service-o"
              is-link
              @click="openIM"
            >
              <template #label>
                <span style="color: #969799;">即时沟通，快速响应</span>
              </template>
            </van-cell>
          </van-cell-group>

          <!-- 工作时间提示 -->
          <div v-if="config.workTime" class="work-time-tip">
            <van-icon name="clock-o" />
            <span>工作时间：{{ config.workTime }}</span>
          </div>

          <!-- 自定义提示信息 -->
          <div v-if="config.notice" class="service-notice">
            <van-icon name="info-o" />
            <span>{{ config.notice }}</span>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 微信二维码弹窗 -->
    <van-dialog
      v-model:show="showWechatDialog"
      title="微信客服"
      :showConfirmButton="false"
      :closeOnClickOverlay="true"
    >
      <div class="wechat-qrcode">
        <CustomPic
          v-if="config.contacts?.wechatQrcode"
          :pic-src="config.contacts.wechatQrcode"
        />
<!--        <img v-if="config.contacts?.wechatQrcode" :src="config.contacts.wechatQrcode" alt="微信二维码" />-->
        <p class="wechat-id">微信号：{{ config.contacts?.wechat }}</p>
        <p class="wechat-tip">请使用微信扫描二维码或搜索微信号添加</p>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, onUnmounted} from 'vue'
import CustomPic from "./CustomPic.vue"
import { getCustomerServiceConfig } from '@/api/system'

// 接收props
const props = defineProps({
  showFloatButton: {
    type: Boolean,
    default: true  // 默认显示悬浮按钮
  }
})

const config = ref(null)
const showServiceModal = ref(false)
const showWechatDialog = ref(false)
const showFloatBtn = ref(true) // 🎯 新增：控制悬浮按钮显示

// 计算位置样式
const positionStyle = computed(() => {
  if (!config.value) return {}

  const position = config.value.position || {}
  return {
    right: position.right || '20px',
    bottom: position.bottom || '80px',
    zIndex: position.zIndex || 999
  }
})

// 按钮样式类
const serviceBtnClass = computed(() => {
  if (!config.value) return ''

  // 如果只有一个联系方式，使用对应的颜色
  const contacts = config.value.contacts || {}
  const contactTypes = Object.keys(contacts).filter(key => contacts[key])

  if (contactTypes.length === 1) {
    const type = contactTypes[0]
    if (type === 'qq') return 'qq-btn'
    if (type === 'phone') return 'phone-btn'
    if (type === 'wechat') return 'wechat-btn'
  }

  return ''
})

// 获取图标名称
const getIconName = computed(() => {
  if (!config.value) return 'service-o'

  const contacts = config.value.contacts || {}
  const contactTypes = Object.keys(contacts).filter(key => contacts[key])

  if (contactTypes.length === 1) {
    const type = contactTypes[0]
    if (type === 'qq') return 'chat-o'
    if (type === 'phone') return 'phone-o'
    if (type === 'wechat') return 'wechat'
    if (type === 'email') return 'envelop-o'
  }

  return 'service-o'
})

// 获取按钮文字
const getBtnText = computed(() => {
  if (!config.value || !config.value.showText) return ''
  return config.value.buttonText || '客服'
})

// 点击客服按钮
const handleServiceClick = () => {
  if (!config.value) return

  const contacts = config.value.contacts || {}
  const contactTypes = Object.keys(contacts).filter(key => contacts[key])

  // 如果只有一个联系方式，直接打开
  if (contactTypes.length === 1) {
    const type = contactTypes[0]
    switch (type) {
      case 'qq':
        openQQ()
        break
      case 'phone':
        callPhone()
        break
      case 'wechat':
        showWechatQrcode()
        break
      case 'email':
        sendEmail()
        break
      case 'im':
        openIM()
        break
    }
  } else {
    // 多个联系方式，显示弹窗
    showServiceModal.value = true
  }
}

// 打开QQ客服
const openQQ = () => {
  const qq = config.value?.contacts?.qq
  if (!qq) return
  const url = `https://wpa.qq.com/msgrd?v=3&uin=${qq}&site=qq&menu=yes`
  window.open(url, '_blank')
  showServiceModal.value = false
}

// 显示微信二维码
const showWechatQrcode = () => {
  showServiceModal.value = false
  showWechatDialog.value = true
}

// 拨打电话
const callPhone = () => {
  const phone = config.value?.contacts?.phone
  if (!phone) return

  window.location.href = `tel:${phone}`
  showServiceModal.value = false
}

// 发送邮件
const sendEmail = () => {
  const email = config.value?.contacts?.email
  if (!email) return

  window.location.href = `mailto:${email}`
  showServiceModal.value = false
}

// 打开第三方IM
const openIM = () => {
  if (!config.value || !config.value.contacts?.im) return

  const imLink = config.value.imLink
  // 🎯 移动端直接打开链接
    if (imLink) {
      window.open(imLink, '_blank')  // 或者用 window.location.href = imLink
      return
    }
  const imType = config.value.imType
  const imConfig = config.value.imConfig || {}

  showServiceModal.value = false

  switch (imType) {
    case 'meiqia': // 美洽
      if (window._MEIQIA) {
        window._MEIQIA('showPanel')
      } else {
        loadMeiqia(imConfig.token)
      }
      break

    case 'qiyu': // 网易七鱼
      if (window.ysf) {
        window.ysf.open()
      } else {
        loadQiyu(imConfig.appKey)
      }
      break

    case 'udesk': // Udesk
      if (window.ud) {
        window.ud.open()
      } else {
        loadUdesk(imConfig.id)
      }
      break

    case 'custom': // 自定义脚本
      if (imConfig.openMethod && window[imConfig.openMethod]) {
        window[imConfig.openMethod]()
      }
      break
  }
}





// 加载美洽SDK
const loadMeiqia = (token) => {
  if (!token) return
  const script = document.createElement('script')
  script.src = `https://static.meiqia.com/widget/loader.js`
  script.async = true
  script.onload = () => {
    window._MEIQIA('entId', token)
    window._MEIQIA('showPanel')
  }
  document.body.appendChild(script)
}

// 加载网易七鱼SDK
const loadQiyu = (appKey) => {
  if (!appKey) return

  const script = document.createElement('script')
  script.src = 'https://qiyukf.com/script/YOUR_SCRIPT_ID.js'
  script.async = true
  script.onload = () => {
    window.ysf.config({ appKey })
    window.ysf.open()
  }
  document.body.appendChild(script)
}

// 加载Udesk SDK
const loadUdesk = (id) => {
  if (!id) return

  const script = document.createElement('script')
  script.src = `https://assets.udesk.cn/im_client/js/udeskSDK.js?id=${id}`
  script.async = true
  document.body.appendChild(script)
}

// 获取配置
const fetchConfig = async () => {
  try {
    const res = await getCustomerServiceConfig()
    if (res.code === 0) {
      config.value = res.data
      // 如果有第三方IM且需要预加载
      if (config.value.contacts?.im && config.value.preload) {
        preloadIMScript()
      }
    }
  } catch (error) {
    console.error('获取客服配置失败:', error)
  }
}

// 预加载IM脚本
const preloadIMScript = () => {
  const imType = config.value.imType
  const imConfig = config.value.imConfig || {}

  switch (imType) {
    case 'meiqia':
      loadMeiqia(imConfig.token)
      break
    case 'qiyu':
      loadQiyu(imConfig.appKey)
      break
    case 'udesk':
      loadUdesk(imConfig.id)
      break
  }
}


// 🎯 修改：打开弹窗（不影响悬浮按钮状态）
const openServiceModal = () => {
  showServiceModal.value = true
}

// 🎯 修改：关闭弹窗（不影响悬浮按钮状态）
const closeServiceModal = () => {
  showServiceModal.value = false
}

// 🎯 修改：显示悬浮按钮（不打开弹窗）
const showFloatButton = () => {
  showFloatBtn.value = true
}

// 🎯 修改：隐藏悬浮按钮（不影响弹窗）
const hideFloatButton = () => {
  showFloatBtn.value = false
}

onMounted(() => {
  fetchConfig()
})



// 暴露方法给父组件
defineExpose({
  openServiceModal,    // 打开弹窗
  closeServiceModal,   // 关闭弹窗
  showFloatButton,     // 显示悬浮按钮
  hideFloatButton      // 隐藏悬浮按钮
})
</script>

<style scoped>
.customer-service {
  position: fixed;
  cursor: pointer;
  transition: all 0.3s ease;
}

.service-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  overflow: hidden;
}

.service-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}

.service-btn:active {
  transform: translateY(0);
}

/* QQ客服特殊样式 */
.qq-btn {
  background: linear-gradient(135deg, #12b7f5 0%, #0e8cc7 100%);
  box-shadow: 0 4px 12px rgba(18, 183, 245, 0.4);
}

/* 微信客服样式 */
.wechat-btn {
  background: linear-gradient(135deg, #09bb07 0%, #078707 100%);
  box-shadow: 0 4px 12px rgba(9, 187, 7, 0.4);
}

/* 电话客服样式 */
.phone-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
}

/* 显示文字时的样式 */
.service-btn:has(.btn-text) {
  width: auto;
  padding: 0 16px;
  border-radius: 25px;
  gap: 6px;
}

.btn-text {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

/* 动画效果 */
@keyframes pulse {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  50% {
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.6);
  }
}

.service-btn {
  animation: pulse 2s ease-in-out infinite;
}

/* 弹窗样式 */
.service-modal {
  padding: 20px;
}

.service-header {
  text-align: center;
  margin-bottom: 20px;
}

.service-header h3 {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 8px 0;
}

.service-subtitle {
  font-size: 14px;
  color: #969799;
  margin: 0;
}

.service-content {
  padding: 10px 0;
}

.work-time-tip {
  margin-top: 20px;
  padding: 12px 16px;
  background: #fff7e6;
  border-radius: 8px;
  font-size: 14px;
  color: #ed6a0c;
  display: flex;
  align-items: center;
  gap: 8px;
}

.service-notice {
  margin-top: 16px;
  padding: 12px 16px;
  background: #f7f8fa;
  border-radius: 8px;
  font-size: 14px;
  color: #646566;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  line-height: 1.6;
}

/* 微信二维码样式 */
.wechat-qrcode {
  padding: 20px;
  text-align: center;
}

.wechat-qrcode img {
  width: 200px;
  height: 200px;
  margin: 0 auto 16px;
  display: block;
  border-radius: 8px;
  border: 1px solid #ebedf0;
}

.wechat-id {
  font-size: 16px;
  font-weight: 500;
  color: #323233;
  margin: 0 0 8px 0;
}

.wechat-tip {
  font-size: 14px;
  color: #969799;
  margin: 0;
  line-height: 1.6;
}
</style>
