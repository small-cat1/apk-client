<template>
  <div class="download-button">
    <van-button
      type="primary"
      size="small"
      round
      @click="handleDownload"
    >
      {{ props.app.is_free ? '免费':'' }}
      下载
    </van-button>
    <!-- iOS账号弹窗 -->
    <van-dialog
      v-model:show="showCenter"
      :show-cancel-button="false"
      :show-confirm-button="false"
      :close-on-click-overlay="true"
      :overlay="true"
      :lock-scroll="true"
      :lazy-render="true"
      :width="320"
      class-name="ios-download-dialog"
      teleport="body"
    >
      <template #title>
        <div class="custom-title">
          <van-icon name="apple-o" size="28" color="#1989fa" />
          <span>iOS 下载说明</span>
        </div>
      </template>

      <div class="dialog-body">
        <p class="dialog-tip">请使用以下账号登录 App Store 下载</p>

        <!-- 账号信息 -->
        <div class="account-section" v-if="iosAccountInfo">
          <div class="section-label">
            <van-icon name="user-circle-o" size="16" />
            <span>账号信息</span>
          </div>
          <div class="account-text">{{ iosAccountInfo }}</div>
        </div>

        <!-- 使用步骤 -->
        <div class="steps-section">
          <div class="section-label">
            <van-icon name="guide-o" size="16" />
            <span>使用步骤</span>
          </div>
          <ol class="step-list">
            <li>复制上方 Apple ID 和密码</li>
            <li>打开 App Store,点击右上角头像</li>
            <li>退出当前账号,使用上方账号登录</li>
            <li>搜索并下载应用</li>
            <li>下载完成后退出该账号,登录回自己的账号</li>
          </ol>
        </div>

        <!-- 警告提示 -->
        <div class="warning-box">
          <van-icon name="warning-o" size="14" color="#ff976a" />
          <span>请勿在 iCloud 或其他地方登录此账号</span>
        </div>

        <!-- 自定义确认按钮 -->
        <van-button
          type="primary"
          block
          round
          @touchstart.stop="handleDialogClose"
          @click.stop="handleDialogClose"
          class="confirm-btn"
        >
          我知道了
        </van-button>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted, nextTick, watch} from 'vue'
import { useUserStore } from '@/pinia'
import { closeToast, showFailToast, showLoadingToast, showSuccessToast } from 'vant'
import { downloadApp } from "@/api/app.js"
import { useRouter } from 'vue-router'
import { emitter } from "@/utils/bus.js"
import { device } from "@/utils/device.js"

const router = useRouter()
const props = defineProps({
  app: {
    type: Object,
    required: true
  },
})

const userStore = useUserStore()
const showCenter = ref(false)
const iosAccountInfo = ref(null)

// 处理弹窗关闭
const handleDialogClose = (event) => {
  // 防止重复触发（touchstart 和 click 都会触发）
  if (event) {
    event.preventDefault()
  }

  showCenter.value = false

  // 延迟清空数据，确保弹窗关闭动画完成
  setTimeout(() => {
    iosAccountInfo.value = null
  }, 300)
}

// 监听弹窗状态变化
watch(showCenter, (newVal) => {
  if (!newVal) {
    // 弹窗关闭时清理数据
    setTimeout(() => {
      iosAccountInfo.value = null
    }, 300)
  }
})

const handleDownload = () => {
  if (!userStore.token) {
    emitter.emit('show-login-modal', {
      source: 'download',
      appId: props.app.id
    })
    return
  }
  startDownload()
}

const handleAuthSuccess = (context) => {
  if (context?.source === 'download') {
    startDownload()
  }
}

const startDownload = async () => {
  if (!device.isIOS && !device.isAndroid) {
    showFailToast("设备类型不支持!")
    return
  }

  showLoadingToast({
    message: '正在获取下载信息...',
    forbidClick: true,
    duration: 0
  })

  try {
    const resp = await downloadApp({
      appId: props.app.id,
      osType: device.osType,
    })

    closeToast()

    if (resp.code === 0) {
      if (!resp.data.can_download) {
        showFailToast({
          message: resp.data.download_reason,
          duration: 2000,
          onClose: () => {
            router.push('/package')
          }
        })
        return
      }

      if (device.isAndroid) {
        const a = document.createElement('a')
        a.href = resp.data.package_url
        a.target = '_blank'
        a.rel = 'noopener noreferrer'
        a.download = `${props.app.name}.apk`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        showSuccessToast('开始下载...')
      }

      if (device.isIOS) {
        iosAccountInfo.value = resp.data.package_detail
        // 确保数据设置后再显示弹窗
        nextTick(() => {
          showCenter.value = true
        })
      }
    } else {
      showFailToast(resp.msg || '获取下载信息失败')
    }
  } catch (error) {
    closeToast()
    console.error('下载失败:', error)
    showFailToast('网络错误,请重试')
  }
}

onMounted(() => {
  emitter.on('auth-success', handleAuthSuccess)
})

onUnmounted(() => {
  emitter.off('auth-success', handleAuthSuccess)
})

defineExpose({
  startDownload,
})
</script>

<style scoped>
.download-button {
  display: inline-block;
}

:deep(.van-button) {
  min-width: 60px;
  font-size: 12px;
}

:deep(.van-button--primary) {
  background: linear-gradient(135deg, #1989fa, #1976d2);
  border: none;
}

:deep(.van-overlay) {
  background-color: rgba(0, 0, 0, 0.6) !important;
}

:deep(.ios-download-dialog) {
  max-height: 80vh;
  overflow: hidden;
  border-radius: 16px;
}

:deep(.ios-download-dialog .van-dialog__header) {
  padding: 20px 20px 16px;
  font-size: 16px;
}

:deep(.ios-download-dialog .van-dialog__content) {
  padding: 0;
  max-height: calc(80vh - 60px);
  overflow-y: auto;
}

.custom-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 17px;
  font-weight: 600;
  color: #323233;
}

.dialog-body {
  padding: 0 20px 20px;
}

.dialog-tip {
  text-align: center;
  font-size: 13px;
  color: #969799;
  margin: 0 0 16px;
  line-height: 1.5;
}

.account-section {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #646566;
  font-weight: 500;
  margin-bottom: 8px;
}

.account-text {
  background: white;
  border-radius: 6px;
  padding: 10px;
  font-size: 14px;
  color: #323233;
  word-break: break-all;
  line-height: 1.6;
}

.steps-section {
  background: #fff7e6;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.step-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  color: #646566;
  line-height: 1.8;
}

.step-list li {
  margin-bottom: 4px;
}

.warning-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  background: #fff7e6;
  border-radius: 6px;
  font-size: 12px;
  color: #ff976a;
  margin-bottom: 16px;
}

:deep(.van-dialog__content)::-webkit-scrollbar {
  width: 4px;
}

:deep(.van-dialog__content)::-webkit-scrollbar-thumb {
  background: #dcdee0;
  border-radius: 2px;
}

.confirm-btn {
  margin-top: 4px;
  height: 44px;
  font-size: 15px;
  font-weight: 500;
}
</style>
