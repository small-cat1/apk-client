<template>
  <div class="commission-detail-page">
    <van-nav-bar
      title="分佣明细"
      left-arrow
      fixed
      @click-left="router.back()"
    />

    <div class="content" style="padding-top: 46px;">
      <!-- 统计卡片 -->
      <div class="stats-card">
        <div class="stats-item">
          <div class="stats-value">¥{{ totalCommission.toFixed(2) }}</div>
          <div class="stats-label">累计佣金</div>
        </div>
        <div class="stats-divider"></div>
        <div class="stats-item">
          <div class="stats-value">{{ totalOrders }}</div>
          <div class="stats-label">订单数</div>
        </div>
      </div>

      <!-- 筛选 -->
      <div class="filter-section">
        <van-dropdown-menu>
          <van-dropdown-item v-model="filterType" :options="typeOptions" @change="onFilterChange" />
          <van-dropdown-item v-model="filterTime" :options="timeOptions" @change="onFilterChange" />
        </van-dropdown-menu>
      </div>

      <!-- 明细列表 -->
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
              class="detail-item"
            >
              <div class="item-header">
                <div class="order-info">
                  <span class="order-no">订单号：{{ item.orderNo }}</span>
                  <van-tag :type="item.status === 'settled' ? 'success' : 'warning'">
                    {{ item.status === 'settled' ? '已结算' : '待结算' }}
                  </van-tag>
                </div>
                <div class="order-time">{{ formatDateTime(item.createTime) }}</div>
              </div>

              <div class="item-body">
                <div class="user-info">
                  <van-icon name="user-o" />
                  <span>{{ item.username }}</span>
                </div>
                <div class="amount-info">
                  <div class="order-amount">订单金额：¥{{ item.orderAmount.toFixed(2) }}</div>
                  <div class="commission-rate">佣金比例：{{ (item.commissionRate * 100).toFixed(0) }}%</div>
                </div>
              </div>

              <div class="item-footer">
                <span class="commission-label">获得佣金</span>
                <span class="commission-amount">+¥{{ item.commission.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>

      <!-- 空状态 -->
      <van-empty
        v-if="!loading && list.length === 0"
        description="暂无分佣记录"
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

const filterType = ref('all')
const filterTime = ref('all')

const typeOptions = [
  { text: '全部类型', value: 'all' },
  { text: '已结算', value: 'settled' },
  { text: '待结算', value: 'pending' }
]

const timeOptions = [
  { text: '全部时间', value: 'all' },
  { text: '今天', value: 'today' },
  { text: '本周', value: 'week' },
  { text: '本月', value: 'month' }
]

const list = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = ref(20)

const totalCommission = ref(0)
const totalOrders = ref(0)

const fetchStats = async () => {
  try {
    // TODO: 调用API
    totalCommission.value = 2580.30
    totalOrders.value = 156
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
    // const res = await api.getCommissionDetail({
    //   page: page.value,
    //   pageSize: pageSize.value,
    //   type: filterType.value,
    //   time: filterTime.value
    // })

    // 模拟数据
    const mockData = Array.from({ length: pageSize.value }, (_, i) => ({
      id: page.value * pageSize.value + i,
      orderNo: `ORD${Date.now()}${i}`,
      username: `用户${i + 1}`,
      orderAmount: Math.random() * 500 + 50,
      commissionRate: 0.1,
      commission: (Math.random() * 500 + 50) * 0.1,
      status: Math.random() > 0.3 ? 'settled' : 'pending',
      createTime: new Date().getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000
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
  fetchStats()
}

const onFilterChange = () => {
  refreshing.value = true
  fetchList(true)
}

const formatDateTime = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

onMounted(() => {
  fetchStats()
  fetchList()
})
</script>

<style scoped>
.commission-detail-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.content {
  padding-bottom: 20px;
}

.stats-card {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 12px;
  padding: 20px;
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  border-radius: 12px;
  color: white;
}

.stats-item {
  text-align: center;
}

.stats-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 6px;
}

.stats-label {
  font-size: 13px;
  opacity: 0.9;
}

.stats-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.3);
}

.filter-section {
  margin: 0 12px 12px 12px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.list-container {
  margin: 0 12px;
}

.detail-item {
  padding: 16px;
  margin-bottom: 8px;
  background: white;
  border-radius: 8px;
}

.item-header {
  margin-bottom: 12px;
}

.order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.order-no {
  font-size: 13px;
  color: #646566;
}

.order-time {
  font-size: 12px;
  color: #969799;
}

.item-body {
  padding: 12px 0;
  border-top: 1px solid #f5f5f5;
  border-bottom: 1px solid #f5f5f5;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #323233;
  margin-bottom: 8px;
}

.amount-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #646566;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.commission-label {
  font-size: 14px;
  color: #646566;
}

.commission-amount {
  font-size: 18px;
  font-weight: bold;
  color: #ff6b35;
}
</style>
