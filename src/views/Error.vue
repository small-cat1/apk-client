<template>
  <div class="error-page">
    <div class="error-content">
      <van-empty
        class="custom-empty"
        image="error"
        image-size="160"
        description=""
      >
        <template #description>
          <div class="error-text">
            <p class="error-title">404</p>
            <p class="error-subtitle">页面被神秘力量吸走了</p>
            <p class="error-desc">您访问的页面不存在或已被移除</p>
          </div>
        </template>
      </van-empty>
      <van-button
        type="primary"
        round
        block
        @click="toDashboard"
      >
        返回首页
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/pinia'
import { useRouter } from 'vue-router'
import {emitter} from '@/utils/bus'

const router = useRouter()

const toDashboard = () => {
  try {
    // 手机端默认返回首页
    router.push({ path: '/home' })
  } catch (error) {

    const userStore = useUserStore()
    emitter.emit('show-error', {
      code: '401',
      message: '检测到权限变更，请重新登录',
      fn: () => {
        userStore.LoginOut()
        router.push({ name: 'Home', replace: true })
      }
    })
  }
}
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  background: #f7f8fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.error-content {
  width: 100%;
  max-width: 400px;
  text-align: center;
}

/* 更紧凑的版本 */
.custom-empty {
  padding: 0;
  margin-bottom: 16px;
}

.error-title {
  font-size: 42px;  /* 再小一点 */
  font-weight: bold;
  color: #1989fa;
  margin: 0 0 8px 0;
  letter-spacing: 1px;
}

.error-subtitle {
  font-size: 16px;  /* 副标题也小一点 */
  font-weight: 600;
  color: #323233;
  margin: 0 0 6px 0;
}

.error-desc {
  font-size: 13px;
  color: #969799;
  margin: 0;
  line-height: 1.5;
}

.error-text {
  margin-bottom: 24px;  /* 减小底部间距 */
}
</style>
