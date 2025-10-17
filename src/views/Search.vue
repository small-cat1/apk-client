<template>
  <div class="search-page">
    <van-nav-bar
      title="搜索"
      left-arrow
      fixed
      @click-left="onClickLeft"
    />
    <!-- 搜索栏 -->
    <div class="search-container" style="padding-top: 46px;">

      <van-search
        v-model="searchKeyword"
        placeholder="搜索应用"
        show-action
        autofocus
      >
        <template #action>
          <div @click="onSearch">搜索</div>
        </template>
      </van-search>

      <!-- 内容区域 -->
      <div class="content">
        <!-- 搜索历史 -->
        <div v-if="!searchKeyword && searchHistory.length" class="section">
          <div class="section-header">
            <div class="section-title">搜索历史</div>
            <van-icon name="delete-o" @click="clearHistory" />
          </div>
          <div class="history-tags">
            <van-tag
              v-for="(item, index) in searchHistory"
              :key="index"
              size="large"
              plain
              @click="selectHistory(item)"
            >
              {{ item }}
            </van-tag>
          </div>
        </div>

        <!-- 搜索结果 -->
        <div v-if="showResult" class="search-result">
          <div class="result-header">
            <span class="result-count">找到 {{ totalCount }} 个结果</span>
            <van-dropdown-menu>
              <van-dropdown-item v-model="sortType" :options="sortOptions" @change="onSortChange" />
            </van-dropdown-menu>
          </div>

          <van-list
            v-model:loading="loading"
            :finished="finished"
            :offset="100"
            finished-text="没有更多了"
            @load="loadSearchResult"
          >
            <app-card
              v-for="app in searchResults"
              :key="app.id"
              :app="app"
              @download="handleDownload"
            />
          </van-list>

          <!-- 空状态 -->
          <van-empty
            v-if="!loading && searchResults.length === 0"
            description="没有找到相关应用"
          >
            <van-button type="primary" round @click="showResult = false">
              换个关键词试试
            </van-button>
          </van-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  showConfirmDialog,
  showFailToast,
  showLoadingToast,
  showSuccessToast,
  showToast
} from 'vant'
import AppCard from '@/components/AppCard.vue'
import { useUserStore } from '@/pinia'
import { searchApps } from "@/api/app.js"

const router = useRouter()
const userStore = useUserStore()

const searchKeyword = ref('')
const showResult = ref(false)
const loading = ref(false)
const finished = ref(false)
const sortType = ref('hot')
const totalCount = ref(0)
const page = ref(1)

const searchResults = ref([])
const searchHistory = ref([])

// 排序选项
const sortOptions = [
  { text: '综合排序', value: 'hot' },
  { text: '最新', value: 'new' },
  { text: '评分最高', value: 'rating' },
  { text: '下载量', value: 'downloads' }
]


const onClickLeft = () => {
  const historyLength = window.history.length;
  // 判断浏览器历史记录中是否有上一页
  if (historyLength > 1) {
    // 如果有，则返回上一页
    router.back();
  } else {
    // 如果没有，则路由到首页
    router.push('/');
  }
}

// 监听搜索关键词变化
watch(searchKeyword, (newVal) => {
  // 清空搜索结果
  showResult.value = false
  searchResults.value = []
})

// 加载搜索历史
const loadSearchHistory = () => {
  const history = localStorage.getItem('searchHistory')
  if (history) {
    searchHistory.value = JSON.parse(history)
  }
}

// 保存搜索历史
const saveSearchHistory = (keyword) => {
  if (!keyword) return
  // 移除重复的
  searchHistory.value = searchHistory.value.filter(item => item !== keyword)
  // 添加到开头
  searchHistory.value.unshift(keyword)
  // 最多保存10条
  if (searchHistory.value.length > 10) {
    searchHistory.value = searchHistory.value.slice(0, 10)
  }
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

// 清空搜索历史
const clearHistory = () => {
  showConfirmDialog({
    title: '提示',
    message: '确定要清空搜索历史吗？'
  }).then(() => {
    searchHistory.value = []
    localStorage.removeItem('searchHistory')
    showSuccessToast('已清空')
  }).catch(() => {})
}

// 选择历史记录
const selectHistory = (keyword) => {
  searchKeyword.value = keyword
}

// 搜索
const onSearch = async () => {
  if (!searchKeyword.value.trim()) {
    showToast('请输入搜索关键词')
    return
  }
  saveSearchHistory(searchKeyword.value)
  // 重置所有状态
  showResult.value = false
  searchResults.value = []
  page.value = 1
  finished.value = false
  loading.value = false
  // 使用 nextTick 确保 DOM 更新后再显示结果
  await nextTick()
  showResult.value = true
}

// 加载搜索结果
const loadSearchResult = async () => {
  if (finished.value) {
    return
  }
  try {
    const res = await searchApps({
      keyword: searchKeyword.value,
      sortType: sortType.value,
      page: page.value,
      pageSize: 10
    })
    const { list, total } = res.data
    totalCount.value = total || 0
    if (!list || list.length === 0) {
      finished.value = true
    } else {
      searchResults.value.push(...list)
      page.value++
      // 如果返回的数据少于 pageSize，说明没有更多了
      if (list.length < 10) {
        finished.value = true
      }
    }
  } catch (error) {
    finished.value = true
    console.log('请求失败', error)
    showFailToast('搜索失败')
  } finally {
    loading.value = false
  }
}

// 排序变化
const onSortChange = async () => {
  searchResults.value = []
  page.value = 1
  finished.value = false
  loading.value = false

  // 确保状态重置后再触发加载
  await nextTick()
  // 如果需要手动触发，可以调用 loadSearchResult
  if (showResult.value) {
    loadSearchResult()
  }
}

// 下载应用
const handleDownload = (app) => {
  if (!userStore.token) {
    showFailToast('请先登录')
    router.push('/login')
    return
  }

  showLoadingToast({ message: '准备下载...', forbidClick: true })
  setTimeout(() => {
    showSuccessToast('开始下载')
  }, 1000)
}

// 初始化
loadSearchHistory()
</script>

<style scoped>
.search-page {
  background: #f7f8fa;
  min-height: 100vh;
}
.search-container {
  min-height: 100vh;
}
.content {
  padding: 12px;
}

/* 通用section样式 */
.section {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 12px;
}

/* 搜索历史 */
.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}



/* 搜索结果 */
.search-result {
  background: white;
  border-radius: 8px;
  padding: 16px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.result-count {
  font-size: 14px;
  color: #646566;
}
</style>
