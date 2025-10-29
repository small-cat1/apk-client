<template>
  <div class="withdraw-record-page">
    <van-nav-bar
      title="提现记录"
      left-arrow
      fixed
      @click-left="router.back()"
    />

    <div class="content" style="padding-top: 46px;">
      <!-- 统计卡片 -->
      <div class="stats-card">
        <div class="stats-item">
          <div class="stats-value">¥{{ totalWithdrawn.toFixed(2) }}</div>
          <div class="stats-label">累计提现</div>
        </div>
        <div class="stats-divider"></div>
        <div class="stats-item">
          <div class="stats-value">{{ totalCount }}</div>
          <div class="stats-label">提现次数</div>
        </div>
      </div>

      <!-- 筛选 -->
      <div class="filter-section">
        <van-dropdown-menu>
          <van-dropdown-item v-model="filterStatus" :options="statusOptions" @change="onFilterChange" />
          <van-dropdown-item v-model="filterTime" :options="timeOptions" @change="onFilterChange" />
        </van-dropdown-menu>
      </div>

      <!-- 记录列表 -->
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
              class="record-item"
              @click="showDetail(item)"
            >
              <div class="item-left">
                <div class="item-icon" :class="getStatusClass(item.status)">
                  <van-icon :name="getStatusIcon(item.status)" size="24" />
                </div>
                <div class="item-info">
                  <div class="withdraw-type">{{ getWithdrawTypeText(item.withdrawType) }}</div>
                  <div class="withdraw-time">{{ formatDateTime(item.createTime) }}</div>
                  <div class="withdraw-account">{{ formatAccount(item.account) }}</div>
                </div>
              </div>

              <div class="item-right">
                <div class="withdraw-amount">-¥{{ item.amount.toFixed(2) }}</div>
                <van-tag :type="getStatusTagType(item.status)">
                  {{ getStatusText(item.status) }}
                </van-tag>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>

      <!-- 空状态 -->
      <van-empty
        v-if="!loading && list.length === 0"
        description="暂无提现记录"
        image="search"
      />
    </div>

    <!-- 详情弹窗 -->
    <van-popup v-model:show="showDetailPopup" position="bottom" round>
      <div class="detail-popup">
        <div class="detail-header">
          <div class="header-title">提现详情</div>
          <van-icon name="cross" @click="showDetailPopup = false" />
        </div>

        <div v-if="currentDetail" class="detail-content">
          <div class="detail-amount">
            <div class="amount-label">提现金额</div>
            <div class="amount-value">¥{{ currentDetail.amount.toFixed(2) }}</div>
          </div>

          <van-cell-group inset>
            <van-cell title="提现方式" :value="getWithdrawTypeText(currentDetail.withdrawType)" />
            <van-cell title="提现账号" :value="currentDetail.account" />
            <van-cell title="申请时间" :value="formatDateTime(currentDetail.createTime)" />
            <van-cell title="到账时间" :value="currentDetail.finishTime ? formatDateTime(currentDetail.finishTime) : '-'" />
            <van-cell title="订单号" :value="currentDetail.orderNo" />
            <van-cell title="状态">
              <template #value>
                <van-tag :type="getStatusTagType(currentDetail.status)">
                  {{ getStatusText(currentDetail.status) }}
                </van-tag>
              </template>
            </van-cell>
          </van-cell-group>

          <div v-if="currentDetail.remark" class="detail-remark">
            <div class="remark-title">备注</div>
            <div class="remark-content">{{ currentDetail.remark }}</div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import {getWithdrawRecords} from "@/api/withdraw.js";

const router = useRouter()

const filterStatus = ref('all')
const filterTime = ref('all')

const statusOptions = [
  { text: '全部状态', value: 'all' },
  { text: '审核中', value: 'pending' },
  { text: '已通过', value: 'success' },
  { text: '已拒绝', value: 'rejected' }
]

const timeOptions = [
  { text: '全部时间', value: 'all' },
  { text: '本周', value: 'week' },
  { text: '本月', value: 'month' },
  { text: '近三个月', value: 'quarter' }
]

const list = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = ref(20)

const totalWithdrawn = ref(0)
const totalCount = ref(0)

const showDetailPopup = ref(false)
const currentDetail = ref(null)

const fetchList = async (isRefresh = false) => {
  try {
    if (isRefresh) {
      page.value = 1
      list.value = []
      finished.value = false
    }
    // TODO: 调用API
    const res = await getWithdrawRecords({
      page: page.value,
      pageSize: pageSize.value,
      status: filterStatus.value,
      time: filterTime.value
    })
    if(res.code === 0){
      // ✅ 使用别名避免变量名冲突
      const {
        list: newList,           // 别名
        total: totalRecords,     // 别名
        totalWithdrawn: withdrawn, // 别名
        totalCount: count         // 别名
      } = res.data
      // ✅ 正确赋值
      totalWithdrawn.value = withdrawn
      totalCount.value = count

      // ✅ 判断是否加载完成
      if (newList.length === 0) {
        finished.value = true
      } else {
        const totalPageSize = page.value * pageSize.value
        if (totalRecords <= totalPageSize) {
          finished.value = true
        }
        list.value.push(...newList)  // ✅ 使用 newList
        page.value++
      }
      return
    }
    finished.value = true
  } catch (error) {
    console.error('获取列表失败:', error)
    showToast('加载失败')
    loading.value = false
    refreshing.value = false
    finished.value = true
  }
}

const onLoad = () => {
  fetchList()
}

const onRefresh = () => {
  fetchList(true)
}

const onFilterChange = () => {
  refreshing.value = true
  fetchList(true)
}

const showDetail = (item) => {
  currentDetail.value = item
  showDetailPopup.value = true
}

const getWithdrawTypeText = (type) => {
  const map = {
    alipay: '支付宝',
    wechat: '微信',
    bank: '银行卡'
  }
  return map[type] || type
}

const getStatusText = (status) => {
  const map = {
    pending: '审核中',
    success: '已通过',
    rejected: '已拒绝'
  }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = {
    pending: 'warning',
    success: 'success',
    rejected: 'danger'
  }
  return map[status] || 'default'
}

const getStatusClass = (status) => {
  return `status-${status}`
}

const getStatusIcon = (status) => {
  const map = {
    pending: 'clock-o',
    success: 'checked',
    rejected: 'close'
  }
  return map[status] || 'clock-o'
}

const formatAccount = (account) => {
  return account || '-'
}

const formatDateTime = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}


</script>

<style scoped>
.withdraw-record-page {
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
  background: linear-gradient(135deg, #667eea, #764ba2);
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

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  margin-bottom: 8px;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.record-item:active {
  background: #f7f8fa;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.item-icon {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.status-pending {
  background: #ff976a;
}

.status-success {
  background: #07c160;
}

.status-rejected {
  background: #ee0a24;
}

.item-info {
  flex: 1;
}

.withdraw-type {
  font-size: 15px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 4px;
}

.withdraw-time {
  font-size: 12px;
  color: #969799;
  margin-bottom: 2px;
}

.withdraw-account {
  font-size: 12px;
  color: #969799;
}

.item-right {
  text-align: right;
}

.withdraw-amount {
  font-size: 18px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 6px;
}

/* 详情弹窗 */
.detail-popup {
  padding: 20px;
  max-height: 80vh;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  color: #323233;
}

.detail-amount {
  text-align: center;
  padding: 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  color: white;
  margin-bottom: 16px;
}

.amount-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.amount-value {
  font-size: 36px;
  font-weight: bold;
}

.detail-remark {
  margin-top: 16px;
  padding: 12px;
  background: #fff7e6;
  border-radius: 8px;
}

.remark-title {
  font-size: 13px;
  font-weight: bold;
  color: #ff6b35;
  margin-bottom: 6px;
}

.remark-content {
  font-size: 13px;
  color: #646566;
  line-height: 1.5;
}
</style>
