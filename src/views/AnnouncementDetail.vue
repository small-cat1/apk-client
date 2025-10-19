<template>
  <div class="announcement-detail-page">
    <van-nav-bar
      title="公告详情"
      left-arrow
      fixed
      @click-left="router.back()"
    />

    <div class="content" style="padding-top: 46px;">
      <div v-if="loading" class="loading-wrapper">
        <van-loading type="spinner" />
      </div>

      <div v-else-if="announcement" class="detail-container">
        <!-- 公告头部 -->
        <div class="detail-header">
          <div class="header-top">
            <div class="type-badge" :class="`type-${announcement.type}`">
              {{ getTypeText(announcement.type) }}
            </div>
            <div class="publish-time">
              {{ formatDateTime(announcement.created_at) }}
            </div>
          </div>

          <h1 class="detail-title">{{ announcement.title }}</h1>
        </div>

        <!-- 公告内容 -->
        <div class="detail-content" v-html="announcement.content"></div>

        <!-- 附件（如果有） -->
        <div v-if="announcement.attachments && announcement.attachments.length > 0" class="attachments">
          <div class="attachments-title">
            <van-icon name="paperclip" />
            附件
          </div>
          <div
            v-for="(file, index) in announcement.attachments"
            :key="index"
            class="attachment-item"
            @click="downloadFile(file)"
          >
            <van-icon name="description" />
            <span class="file-name">{{ file.name }}</span>
            <van-icon name="down" />
          </div>
        </div>

        <!-- 相关链接 -->
        <div v-if="announcement.link_url" class="related-link">
          <van-button
            type="primary"
            block
            round
            @click="goToLink(announcement.link_url)"
          >
            查看详细内容
          </van-button>
        </div>
      </div>

      <van-empty v-else description="公告不存在" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import {getAnnouncementDetail} from "@/api/announcement.js"

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const announcement = ref(null)

const fetchDetail = async () => {
  try {
    loading.value = true
    const id = route.query.id

    if (!id) {
      showToast('公告ID不存在')
      loading.value = false
      return
    }

    // 调用后端API
    const res = await getAnnouncementDetail({ id })
    announcement.value = res.data || res

    // 标记已读
    if (announcement.value) {
      markAsRead(id)
    }
  } catch (error) {
    console.error('获取详情失败:', error)
    showToast('加载失败')
    announcement.value = null
  } finally {
    loading.value = false
  }
}

const markAsRead = async (id) => {
  try {
    // TODO: 如果有标记已读的API，在这里调用
    // await markAnnouncementAsRead({ id })
  } catch (error) {
    console.error('标记已读失败:', error)
  }
}

const getTypeText = (type) => {
  const map = {
    1: '紧急',
    2: '重要',
    3: '通知'
  }
  return map[type] || '通知'
}

const formatDateTime = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const downloadFile = (file) => {
  // 下载附件
  window.open(file.url, '_blank')
}

const goToLink = (url) => {
  // 如果是内部链接，使用路由跳转
  if (url.startsWith('/')) {
    router.push(url)
  } else {
    // 外部链接，新窗口打开
    window.open(url, '_blank')
  }
}

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
.announcement-detail-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.content {
  padding-bottom: 20px;
}

.loading-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.detail-container {
  margin: 12px;
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.detail-header {
  padding-bottom: 20px;
  border-bottom: 1px solid #f5f5f5;
  margin-bottom: 20px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.type-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.type-badge.type-1 {
  background: #ff4d4f;
}

.type-badge.type-2 {
  background: #fa8c16;
}

.type-badge.type-3 {
  background: #1890ff;
}

.publish-time {
  font-size: 13px;
  color: #969799;
}

.detail-title {
  font-size: 20px;
  font-weight: bold;
  color: #323233;
  line-height: 1.5;
  margin: 0;
}

.detail-content {
  font-size: 15px;
  color: #323233;
  line-height: 1.8;
}

.detail-content :deep(h3) {
  font-size: 17px;
  font-weight: bold;
  color: #323233;
  margin: 20px 0 12px 0;
}

.detail-content :deep(p) {
  margin: 12px 0;
}

.detail-content :deep(strong) {
  color: #ff6b35;
  font-weight: bold;
}

.attachments {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f5f5f5;
}

.attachments-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 12px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.attachment-item:active {
  background: #ebedf0;
}

.file-name {
  flex: 1;
  font-size: 14px;
  color: #323233;
}

.related-link {
  margin-top: 24px;
}
</style>
