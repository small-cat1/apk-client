<template>
  <div class="subordinate-page">
    <van-nav-bar
      title="我的下级"
      left-arrow
      fixed
      @click-left="router.back()"
    />

    <div class="content" style="padding-top: 46px;">
      <!-- 统计概览 -->
      <div class="summary-card">
        <div class="summary-item">
          <div class="summary-value">{{ totalCount }}</div>
          <div class="summary-label">下级总数</div>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
          <div class="summary-value">{{ activeCount }}</div>
          <div class="summary-label">活跃用户</div>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
          <div class="summary-value">¥{{ totalCommission.toFixed(2) }}</div>
          <div class="summary-label">总佣金</div>
        </div>
      </div>

      <!-- 筛选标签 -->
      <div class="filter-section">
        <van-tabs v-model:active="activeTab" @change="onTabChange">
          <van-tab title="全部" name="all" />
          <van-tab title="今日新增" name="today" />
          <van-tab title="本月新增" name="month" />
        </van-tabs>
      </div>

      <!-- 下级列表 -->
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
              class="subordinate-item"
            >
              <div class="item-left">
                <van-image
                  v-if="item.avatar"
                  :src="item.avatar"
                  round
                  width="45"
                  height="45"
                />
                <div v-else class="avatar-placeholder">
                  <van-icon name="user-o" size="20" />
                </div>

                <div class="user-info">
                  <div class="username">{{ item.username }}</div>
                  <div class="register-time">
                    注册时间：{{ formatDate(item.registerTime) }}
                  </div>
                </div>
              </div>

              <div class="item-right">
                <div class="commission-amount">¥{{ item.commission.toFixed(2) }}</div>
                <div class="consumption">消费：¥{{ item.totalConsumption.toFixed(2) }}</div>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>

      <!-- 空状态 -->
      <van-empty
        v-if="!loading && list.length === 0"
        description="暂无下级用户"
        image="search"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()

const activeTab = ref('all')
const list = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = ref(20)

const totalCount = ref(0)
const activeCount = ref(0)
const totalCommission = ref(0)

const fetchSummary = async () => {
  try {
    // TODO: 调用API
    totalCount.value = 48
    activeCount.value = 35
    totalCommission.value = 2580.30
  } catch (error) {
    console.error('获取统计失败:', error)
  }
}

const fetchList = async (isRefresh = false) => {
  try {
    if (isRefresh) {
      page.value = 1
      list.value = []
      finished.value = false
    }

    // TODO: 调用API
    // const res = await api.getSubordinateList({
    //   page: page.value,
    //   pageSize: pageSize.value,
    //   type: activeTab.value
    // })

    // 模拟数据
    const mockData = Array.from({ length: pageSize.value }, (_, i) => ({
      id: page.value * pageSize.value + i,
      username: `用户${page.value * pageSize.value + i + 1}`,
      avatar: '',
      registerTime: new Date().getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      commission: Math.random() * 100,
      totalConsumption: Math.random() * 1000
    }))

    await new Promise(resolve => setTimeout(resolve, 500))

    if (isRefresh) {
      list.value = mockData
    } else {
      list.value = [...list.value, ...mockData]
    }

    page.value++

    if (mockData.length < pageSize.value) {
      finished.value = true
    }

    loading.value = false
    refreshing.value = false
  } catch (error) {
    console.error('获取列表失败:', error)
    showToast('加载失败')
    loading.value = false
    refreshing.value = false
  }
}

const onLoad = () => {
  fetchList()
}

const onRefresh = () => {
  fetchList(true)
  fetchSummary()
}

const onTabChange = () => {
  refreshing.value = true
  fetchList(true)
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

onMounted(() => {
  fetchSummary()
  fetchList()
})
</script>

<style scoped>
.subordinate-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.content {
  padding-bottom: 20px;
}

.summary-card {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 12px;
  padding: 20px;
  background: white;
  border-radius: 12px;
}

.summary-item {
  text-align: center;
}

.summary-value {
  font-size: 22px;
  font-weight: bold;
  color: #ff6b35;
  margin-bottom: 6px;
}

.summary-label {
  font-size: 13px;
  color: #969799;
}

.summary-divider {
  width: 1px;
  height: 40px;
  background: #ebedf0;
}

.filter-section {
  margin: 12px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.list-container {
  margin: 0 12px;
}

.subordinate-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  margin-bottom: 8px;
  background: white;
  border-radius: 8px;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.avatar-placeholder {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 15px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 4px;
}

.register-time {
  font-size: 12px;
  color: #969799;
}

.item-right {
  text-align: right;
}

.commission-amount {
  font-size: 16px;
  font-weight: bold;
  color: #ff6b35;
  margin-bottom: 4px;
}

.consumption {
  font-size: 12px;
  color: #969799;
}
</style>
