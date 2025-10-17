<template>
  <van-overlay :show="true" @click="closeModal">
    <div class="error-preview-wrapper" @click.stop>
      <div class="error-preview">
        <!-- 头部 -->
        <div class="error-header">
          <h3 class="error-title">{{ displayData.title }}</h3>
          <van-icon name="cross" @click="closeModal" />
        </div>

        <!-- 内容 -->
        <div class="error-content">
          <!-- 错误类型 -->
          <div class="error-section">
            <div class="section-label">错误类型</div>
            <div class="error-type">
              <van-icon
                :name="displayData.icon"
                :color="displayData.color"
                size="20"
              />
              <span>{{ displayData.type }}</span>
            </div>
          </div>

          <!-- 具体错误 -->
          <div class="error-section">
            <div class="section-label">具体错误</div>
            <div class="error-message">
              {{ displayData.message }}
            </div>
          </div>

          <!-- 提示信息 -->
          <div v-if="displayData.tips" class="error-section">
            <div class="section-label">提示</div>
            <div class="error-tips">
              <van-icon name="bulb-o" color="#1989fa" size="18" />
              <span>{{ displayData.tips }}</span>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="error-footer">
          <van-button
            type="primary"
            block
            round
            @click="handleConfirm"
          >
            确定
          </van-button>
        </div>
      </div>
    </div>
  </van-overlay>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  errorData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'confirm'])

const presetErrors = {
  500: {
    title: '检测到接口错误',
    type: '服务器发生内部错误',
    icon: 'warning-o',
    color: '#ee0a24',
    tips: '此类错误内容常见于后台panic，请先查看后台日志，如果影响您正常使用可强制登出清理缓存'
  },
  404: {
    title: '资源未找到',
    type: 'Not Found',
    icon: 'info-o',
    color: '#ff976a',
    tips: '此类错误多为接口未注册（或未重启）或者请求路径（方法）与api路径（方法）不符'
  },
  401: {
    title: '身份认证失败',
    type: '身份令牌无效',
    icon: 'lock',
    color: '#7232dd',
    tips: '您的身份认证已过期或无效，请重新登录。'
  },
  network: {
    title: '网络错误',
    type: 'Network Error',
    icon: 'close',
    color: '#969799',
    tips: '无法连接到服务器，请检查您的网络连接。'
  }
}

const displayData = computed(() => {
  const preset = presetErrors[props.errorData.code]
  if (preset) {
    return {
      ...preset,
      message: props.errorData.message || '没有提供额外信息。'
    }
  }

  return {
    title: '未知错误',
    type: '检测到请求错误',
    icon: 'question-o',
    color: '#969799',
    message: props.errorData.message || '发生了一个未知错误。',
    tips: '请检查控制台获取更多信息。'
  }
})

const closeModal = () => {
  emit('close')
}

const handleConfirm = () => {
  emit('confirm', props.errorData.code)
  closeModal()
}
</script>

<style scoped>
.error-preview-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 16px;
}

.error-preview {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  overflow: hidden;
}

.error-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #f7f8fa;
}

.error-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin: 0;
}

.error-header .van-icon {
  color: #969799;
  font-size: 20px;
}

.error-content {
  padding: 16px;
}

.error-section {
  margin-bottom: 16px;
}

.error-section:last-child {
  margin-bottom: 0;
}

.section-label {
  font-size: 12px;
  color: #969799;
  text-transform: uppercase;
  margin-bottom: 8px;
  font-weight: 500;
}

.error-type {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #323233;
}

.error-message {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 12px;
  font-size: 13px;
  color: #646566;
  line-height: 1.6;
}

.error-tips {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #646566;
  line-height: 1.6;
}

.error-tips .van-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.error-footer {
  padding: 12px 16px 16px;
}
</style>
