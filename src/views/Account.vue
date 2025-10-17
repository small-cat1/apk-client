<template>
  <div class="account-page">
    <!-- 顶部导航 -->
    <van-nav-bar title="账户" fixed placeholder>
      <template #right>
        <van-icon name="search" @click="$router.push('/search')" />
      </template>
    </van-nav-bar>

    <!-- 内容区域 -->
    <div class="content">
      <!-- 横向滚动分类 -->
      <div class="category-scroll-wrapper" v-if="!categoriesLoading">
        <div class="category-scroll">
          <div
            v-for="category in categories"
            :key="category.id"
            class="category-chip"
            :class="{ active: activeCategory === category.id }"
            @click="selectCategory(category)"
          >
            <van-icon :name="category.icon" size="18" />
            <span>{{ category.category_name }}</span>
          </div>
        </div>
      </div>

      <!-- 应用列表 -->
      <div class="app-list-container">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <!-- 筛选栏 - 下拉选择 -->
          <div class="filter-bar">
            <van-dropdown-menu active-color="#667eea">
              <!-- 综合排序 -->
              <van-dropdown-item
                v-model="sortType"
                :options="sortOptions"
                @change="onSortChange"
              />

              <!-- 价格筛选 -->
              <van-dropdown-item
                v-model="priceSort"
                :options="priceSortOptions"
                @change="onPriceSortChange"
              />

              <!-- 上架时间筛选 -->
              <van-dropdown-item
                v-model="timeSort"
                :options="timeSortOptions"
                @change="onTimeSortChange"
              />

              <!-- 购买量筛选 -->
              <van-dropdown-item
                v-model="salesSort"
                :options="salesSortOptions"
                @change="onSalesSortChange"
              />
            </van-dropdown-menu>
          </div>

          <!-- 应用卡片列表 -->
          <div class="app-cards">
            <van-list
              v-model:loading="loading"
              :finished="finished"
              :immediate-check="false"
              finished-text="没有更多了"
              @load="loadApps"
            >
              <app-buy-card
                v-for="app in apps"
                :key="app.id"
                :app="app"
                @buy="handleBuy"
              />
            </van-list>

            <!-- 空状态 -->
            <van-empty
              v-if="!loading && apps.length === 0"
              description="暂无应用"
            />
          </div>
        </van-pull-refresh>
      </div>
    </div>

    <!-- 购买弹窗 -->
     <buy-dialog
      v-model:show="showBuyDialog"
      :app="selectedApp"
      @confirm="onBuyConfirm"
    />

  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import { useUserStore } from '@/pinia'
import AppBuyCard from '@/components/account/AppBuyCard.vue'
import BuyDialog from '@/components/account/BuyDialog.vue'
import {getAccountCategoryList, getAccountAppListByCategory} from '@/api/category'
import { emitter } from '@/utils/bus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const categoriesLoading = ref(false)
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const showBuyDialog = ref(false)

const activeCategory = ref(null)
const sortType = ref('default')
const priceSort = ref('')
const timeSort = ref('')
const salesSort = ref('')
const page = ref(1)

const categories = ref([{
  "id": 0,
  "parent_id": 0,
  "category_name": "全部",
}])
const apps = ref([])
const selectedApp = ref(null)

// 综合排序选项
const sortOptions = [
  { text: '综合排序', value: 'default' }
]

// 价格排序选项
const priceSortOptions = [
  { text: '价格', value: '' },
  { text: '价格从低到高', value: 'price_asc' },
  { text: '价格从高到低', value: 'price_desc' }
]

// 上架时间排序选项
const timeSortOptions = [
  { text: '上架时间', value: '' },
  { text: '最新上架', value: 'time_desc' },
  { text: '最早上架', value: 'time_asc' }
]

// 购买量排序选项
const salesSortOptions = [
  { text: '购买量', value: '' },
  { text: '购买量从高到低', value: 'sales_desc' },
  { text: '购买量从低到高', value: 'sales_asc' }
]

// 获取当前实际排序值
const getCurrentSortValue = () => {
  if (priceSort.value) return priceSort.value
  if (timeSort.value) return timeSort.value
  if (salesSort.value) return salesSort.value
  return sortType.value
}

// 综合排序改变
const onSortChange = () => {
  // 选择综合排序时，清空其他筛选
  priceSort.value = ''
  timeSort.value = ''
  salesSort.value = ''
  resetAndLoadApps()
}

// 价格排序改变
const onPriceSortChange = (value) => {
  if (value) {
    // 选择价格排序时，清空其他筛选
    sortType.value = 'default'
    timeSort.value = ''
    salesSort.value = ''
    resetAndLoadApps()
  }else{
    onSortChange()
  }
}

// 上架时间排序改变
const onTimeSortChange = (value) => {
  if (value) {
    // 选择时间排序时，清空其他筛选
    sortType.value = 'default'
    priceSort.value = ''
    salesSort.value = ''
    resetAndLoadApps()
  }else{
    onSortChange()
  }
}

// 购买量排序改变
const onSalesSortChange = (value) => {
  if (value) {
    // 选择购买量排序时，清空其他筛选
    sortType.value = 'default'
    priceSort.value = ''
    timeSort.value = ''
    resetAndLoadApps()
  }else{
    onSortChange()
  }
}

// 加载分类列表
const loadCategories = async () => {
  categoriesLoading.value = true
  try {
    const res = await getAccountCategoryList()
    if (!res.data || res.data.length === 0) {
      showFailToast('暂无分类数据')
      finished.value = true
      return
    }
    categories.value.push(...res.data)
    // 确定要激活的分类
    const categorySlug = route.query.type
    let targetCategory = null
    if (categorySlug) {
      targetCategory = categories.value.find(c => c.category_code === categorySlug)
      if (!targetCategory) {
        targetCategory = categories.value[0]
      }
    } else {
      targetCategory = categories.value[0]
    }

    activeCategory.value = targetCategory.id
    // 等待 DOM 更新后加载应用
    await nextTick()
    await loadApps()

  } catch (error) {
    showFailToast('加载分类失败')
    console.error(error)
    finished.value = true
  } finally {
    categoriesLoading.value = false
  }
}

// 监听路由参数变化
watch(
  () => route.query.type,
  async (newType) => {
    if (categories.value.length > 0 && newType) {
      const targetCategory = categories.value.find(c => c.category_code === newType)
      if (targetCategory && targetCategory.id !== activeCategory.value) {
        activeCategory.value = targetCategory.id
        resetAndLoadApps()
      }
    }
  }
)

// 选择分类
const selectCategory = (category) => {
  if (activeCategory.value === category.id) return
  activeCategory.value = category.id
  resetAndLoadApps()
}

// 加载应用列表
const loadApps = async () => {
  if (finished.value) return
  loading.value = true
  try {
    const currentSort = getCurrentSortValue()
    const res = await getAccountAppListByCategory({
      categoryId: activeCategory.value,
      sortType: currentSort,
      page: page.value,
      pageSize: 10
    })
    if(res.code === 0){
      const { list ,total} = res.data
      if (list.length === 0 ) {
        finished.value = true
      } else {
        let totalPageSize = page.value*10
        if(total <= totalPageSize){
          finished.value = true
        }
        apps.value.push(...list)
        page.value++
      }
      return
    }
    finished.value = true
  } catch (error) {
    showFailToast('加载失败')
    console.error(error)
    finished.value = true
  } finally {
    loading.value = false
  }
}

// 重置并加载
const resetAndLoadApps = () => {
  page.value = 1
  apps.value = []
  finished.value = false
  loadApps()
}

// 刷新
const onRefresh = async () => {
  page.value = 1
  apps.value = []
  finished.value = false
  await loadApps()
  refreshing.value = false
  showSuccessToast('刷新成功')
}

// 处理购买
const handleBuy = (app) => {
  if (!userStore.token) {
    emitter.emit('show-login-modal', { source: 'buy' })
    return
  }
  selectedApp.value = app
  showBuyDialog.value = true
}

// 确认购买
const onBuyConfirm = async (orderData) => {
  try {
    showSuccessToast('订单创建成功')
    showBuyDialog.value = false
    // 跳转到订单支付页面
    await router.push({
      path: '/order/pay',
      query: {orderId: orderData.orderId}
    })
  } catch (error) {
    showFailToast('创建订单失败')
  }
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.account-page {
  background: #f7f8fa;
  min-height: 100vh;
}

.content {
  padding-bottom: 60px;
}

/* 横向滚动分类 */
.category-scroll-wrapper {
  background: white;
  padding: 12px 0;
  position: sticky;
  top: 46px;
  z-index: 99;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.category-scroll {
  display: flex;
  gap: 12px;
  padding: 0 16px;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.category-scroll::-webkit-scrollbar {
  display: none;
}

.category-chip {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f7f8fa;
  border-radius: 20px;
  font-size: 14px;
  color: #646566;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.category-chip.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.category-chip:active {
  transform: scale(0.95);
}

/* 应用列表容器 */
.app-list-container {
  min-height: calc(100vh - 158px);
}

/* 筛选栏 */
.filter-bar {
  background: white;
  margin-bottom: 12px;
}

/* 应用卡片列表 */
.app-cards {
  padding: 0 12px 12px;
}
</style>
