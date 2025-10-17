<template>
  <div class="order-list">
    <van-nav-bar title="我的订单" fixed left-arrow @click-left="onClickLeft" />

    <div class="content" style="padding-top: 46px;">
      <!-- 订单状态标签 -->
      <van-tabs v-model:active="activeTab" sticky offset-top="46px">
        <van-tab title="全部" name="all" />
        <van-tab title="待支付" name="pending" />
        <van-tab title="进行中" name="processing" />
        <van-tab title="已完成" name="completed" />
      </van-tabs>

      <!-- 订单列表 -->
      <div class="order-container">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="order-card"
            @click="goToOrderDetail(order.id)"
          >
            <div class="order-header">
              <span class="order-number">订单号：{{ order.id }}</span>
              <van-tag :type="getStatusType(order.status)">
                {{ getStatusText(order.status) }}
              </van-tag>
            </div>

            <div class="order-content">
              <div class="product-info">
                <div class="product-icon">{{ order.image }}</div>
                <div class="product-details">
                  <div class="product-title">{{ order.title }}</div>
                  <div class="product-time">{{ order.date }}</div>
                </div>
              </div>
              <div class="order-price">¥{{ order.amount }}</div>
            </div>

            <div class="order-footer">
              <van-button
                v-if="order.status === 'pending'"
                size="small"
                type="danger"
                @click.stop="handlePay(order.id)"
              >
                立即支付
              </van-button>
              <van-button
                v-if="order.status === 'pending'"
                size="small"
                plain
                @click.stop="handleCancel(order.id)"
              >
                取消订单
              </van-button>
              <van-button
                v-if="order.status === 'completed'"
                size="small"
                plain
                @click.stop="handleBuyAgain(order.id)"
              >
                再次购买
              </van-button>
            </div>
          </div>
        </van-list>

        <!-- 空状态 -->
        <van-empty
          v-if="filteredOrders.length === 0 && !loading"
          description="暂无订单"
          image="search"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const activeTab = ref('all')
const loading = ref(false)
const finished = ref(false)

// 模拟订单数据
const orders = ref([
  {
    id: '202410130001',
    title: '高级会员年卡',
    status: 'completed',
    date: '2024-10-10 14:30:25',
    amount: '298.00',
    image: '🎫'
  },
  {
    id: '202410120002',
    title: 'VIP专属课程包',
    status: 'processing',
    date: '2024-10-12 09:15:40',
    amount: '499.00',
    image: '📚'
  },
  {
    id: '202410080003',
    title: '月度订阅服务',
    status: 'pending',
    date: '2024-10-08 16:20:10',
    amount: '99.00',
    image: '⭐'
  },
  {
    id: '202410050004',
    title: '定制咨询服务',
    status: 'cancelled',
    date: '2024-10-05 11:45:30',
    amount: '1299.00',
    image: '💼'
  },
  {
    id: '202410010005',
    title: 'VIP会员月卡',
    status: 'completed',
    date: '2024-10-01 10:20:15',
    amount: '39.00',
    image: '💎'
  }
])

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') {
    return orders.value
  }
  return orders.value.filter(order => order.status === activeTab.value)
})

const getStatusType = (status) => {
  const typeMap = {
    completed: 'success',
    processing: 'primary',
    pending: 'warning',
    cancelled: 'default'
  }
  return typeMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    completed: '已完成',
    processing: '进行中',
    pending: '待支付',
    cancelled: '已取消'
  }
  return textMap[status] || '未知'
}

const onLoad = () => {
  loading.value = false
  finished.value = true
}

const onClickLeft = () => {
  router.back()
}

const goToOrderDetail = (orderId) => {
  showToast(`查看订单详情: ${orderId}`)
  // router.push(`/order/${orderId}`)
}

const handlePay = (orderId) => {
  showToast('跳转支付页面')
  // router.push(`/payment/${orderId}`)
}

const handleCancel = (orderId) => {
  showConfirmDialog({
    title: '取消订单',
    message: '确定要取消该订单吗？'
  }).then(() => {
    showToast('订单已取消')
    // 调用取消订单API
  }).catch(() => {
    // 用户取消操作
  })
}

const handleBuyAgain = (orderId) => {
  showToast('再次购买')
  // 实现再次购买逻辑
}
</script>

<style scoped>
.order-list {
  background: #f7f8fa;
  min-height: 100vh;
}

.content {
  padding-bottom: 20px;
}

.order-container {
  padding: 12px;
}

.order-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
}

.order-number {
  font-size: 12px;
  color: #969799;
}

.order-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.product-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.product-icon {
  font-size: 40px;
  margin-right: 12px;
}

.product-details {
  flex: 1;
}

.product-title {
  font-size: 14px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 4px;
}

.product-time {
  font-size: 12px;
  color: #969799;
}

.order-price {
  font-size: 18px;
  font-weight: bold;
  color: #ee0a24;
}

.order-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
</style>
