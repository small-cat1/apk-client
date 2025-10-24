<template>
  <div class="announcement-list-page">
    <van-nav-bar
      title="系统公告"
      left-arrow
      fixed
      @click-left="router.back()"
    />

    <div class="content" style="padding-top: 46px;">
      <!-- 筛选标签 -->
      <van-tabs v-model:active="activeTab" @change="onTabChange" sticky>
        <van-tab title="全部" name="all" />
        <van-tab title="紧急" name="1" />
        <van-tab title="重要" name="2" />
        <van-tab title="通知" name="3" />
      </van-tabs>

      <!-- 公告列表 -->
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div class="list-container">
            <div
              v-for="item in list"
              :key="item.id"
              class="announcement-list-item"
              @click="goToDetail(item)"
            >
              <div class="item-header">
                <div class="badge-wrapper">
                  <div class="type-badge" :class="`type-${item.type}`">
                    {{ getTypeText(item.type) }}
                  </div>
                  <van-badge dot v-if="!item.is_read" />
                </div>
                <div class="item-time">{{ formatTime(item.created_at) }}</div>
              </div>

              <div class="item-title" :class="{ 'unread': !item.isRead }">
                {{ item.title }}
              </div>

              <div class="item-summary" v-if="item.summary">
                {{ item.summary }}
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>

      <!-- 空状态 -->
      <van-empty
        v-if="!loading && list.length === 0"
        description="暂无公告"
        image="search"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import {getAnnouncementList} from "@/api/announcement.js"
const router = useRouter()

const activeTab = ref('all')
const list = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = ref(20)

const fetchList = async (isRefresh = false) => {
  try {
    if (isRefresh) {
      page.value = 1
      list.value = []
      finished.value = false
      loading.value = true // 设置 loading 为 true，防止 van-list 重复触发
    }

    const res = await getAnnouncementList({
      page: page.value,
      pageSize: pageSize.value,
      type: activeTab.value === 'all' ? null : activeTab.value
    })

    // 使用真实的 API 响应数据
    const data = res.data.list|| []

    if (isRefresh) {
      list.value = data
    } else {
      list.value = [...list.value, ...data]
    }

    page.value++

    // 判断是否还有更多数据
    if (data.length < pageSize.value) {
      finished.value = true
    }

    loading.value = false
    refreshing.value = false
  } catch (error) {
    console.error('获取列表失败:', error)
    showToast('加载失败')
    loading.value = false
    refreshing.value = false
    finished.value = true // 发生错误时也要设置 finished，避免无限请求
  }
}
const onLoad = () => {
  fetchList()
}

const onRefresh = () => {
  fetchList(true)
}

const onTabChange = () => {
  page.value = 1
  list.value = []
  finished.value = false
  loading.value = true
  fetchList(true)
}

const goToDetail = (item) => {
  router.push({
    path: '/announcementDetail',
    query: { id: item.id }
  })
}


const getTypeText = (type) => {
  const map = {
    1: '紧急',
    2: '重要',
    3: '通知'
  }
  return map[type] || '通知'
}

const formatTime = (timestamp) => {
  const now = new Date().getTime()
  const diff = now - timestamp

  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`
  } else if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
  } else if (diff < 7 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`
  } else {
    const date = new Date(timestamp)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }
}


</script>

<style scoped>
.announcement-list-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.content {
  padding-bottom: 20px;
}

.list-container {
  padding: 12px;
}

.announcement-list-item {
  padding: 16px;
  margin-bottom: 8px;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.announcement-list-item:active {
  background: #f7f8fa;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.badge-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
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

.item-time {
  font-size: 12px;
  color: #969799;
}

.item-title {
  font-size: 15px;
  color: #323233;
  margin-bottom: 6px;
  line-height: 1.4;
}

.item-title.unread {
  font-weight: bold;
}

.item-summary {
  font-size: 13px;
  color: #646566;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
