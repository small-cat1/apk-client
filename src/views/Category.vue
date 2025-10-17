<template>
  <div class="category-page">
    <!-- 顶部导航 -->
    <van-nav-bar title="应用分类" fixed>
      <template #right>
        <van-icon name="search" @click="$router.push('/search')" />
      </template>
    </van-nav-bar>

    <!-- 内容区域 -->
    <div class="content" style="padding-top: 46px;">
      <!-- 分类加载中 -->
      <van-loading
        v-if="categoriesLoading"
        class="loading-center"
        type="spinner"
      />

      <!-- 分类内容 -->
      <div v-else class="category-container">
        <!-- 左侧分类列表 -->
        <div class="category-sidebar">
          <div
            v-for="category in categories"
            :key="category.id"
            class="category-item"
            :class="{ active: activeCategory === category.id }"
            @click="selectCategory(category)"
          >
            <van-icon :name="category.icon" size="20" />
            <span class="category-name">{{ category.category_name }}</span>
          </div>
        </div>

        <!-- 右侧内容区 -->
        <div class="category-content">
          <van-pull-refresh v-model="refreshing" @refresh="onRefresh" >

            <!-- 排序和筛选 -->
<!--            <div class="filter-bar">-->
<!--              <van-dropdown-menu>-->
<!--                <van-dropdown-item-->
<!--                  v-model="sortType"-->
<!--                  :options="sortOptions"-->
<!--                  @change="onSortChange"-->
<!--                />-->
<!--                <van-dropdown-item-->
<!--                  v-model="filterType"-->
<!--                  :options="filterOptions"-->
<!--                  @change="onFilterChange"-->
<!--                />-->
<!--              </van-dropdown-menu>-->
<!--            </div>-->

            <!-- 应用列表 -->
            <div class="app-list" style="padding-top: 20px">
              <van-list
                v-model:loading="loading"
                :finished="finished"
                finished-text="没有更多了"
                @load="loadApps"
              >
                <app-card
                  v-for="app in apps"
                  :key="app.id"
                  :app="app"
                />
              </van-list>
            </div>

            <!-- 空状态 -->
            <van-empty
              v-if="!loading && apps.length === 0"
              description="暂无应用"
            />
          </van-pull-refresh>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref,  onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showFailToast, showSuccessToast, showToast } from 'vant'
import AppCard from '@/components/AppCard.vue'
import { useUserStore } from '@/pinia'
import { getCategoryList, getCategoryApps } from '@/api/category'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const categoriesLoading = ref(false)

const activeCategory = ref(null)
const sortType = ref('hot')
const filterType = ref('all')

const page = ref(1)
const apps = ref([])
const categories = ref([{
  "id": 0,
  "parent_id": 0,
  "category_name": "全部",
}])


// 排序选项
const sortOptions = [
  { text: '热门', value: 'hot' },
  { text: '最新', value: 'new' },
  { text: '评分', value: 'rating' },
  { text: '下载量', value: 'downloads' }
]

// 筛选选项
const filterOptions = [
  { text: '全部', value: 'all' },
  { text: '免费', value: 'free' },
  { text: '付费', value: 'paid' },
  { text: '精品', value: 'premium' }
]

// 加载分类列表
const loadCategories = async () => {
  categoriesLoading.value = true
  try {
    const res = await getCategoryList()
    if (!res.data || res.data.length === 0) {
      showToast('暂无分类数据')
      return
    }
    categories.value.push(...res.data)
    // 确定要激活的分类
    const categorySlug = route.query.type
    let targetCategory = null
    if (categorySlug) {
      // 优先使用路由参数指定的分类
      targetCategory = categories.value.find(c => c.category_code === categorySlug)
      if (!targetCategory) {
        console.warn(`分类 "${categorySlug}" 不存在`)
        showToast('指定的分类不存在')
        targetCategory = categories.value[0]
      }
    } else {
      // 使用第一个分类
      targetCategory = categories.value[0]
    }
    // 设置当前选中的分类
    activeCategory.value = targetCategory.id

    // 加载应用列表
    await loadApps()

  } catch (error) {
    showFailToast('加载分类失败')
    console.error('加载分类失败', error)
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
    const res = await getCategoryApps({
      categoryId: activeCategory.value,
      sortType: sortType.value,
      filterType: filterType.value,
      page: page.value,
      pageSize: 10
    })
    // 添加调试日志
    const { list ,total} = res.data
    if (list.length === 0) {
      finished.value = true
    } else {
      let totalPageSize = page.value*10
      if(total <= totalPageSize){
        finished.value = true
      }
      apps.value.push(...list)
      page.value++
    }
  } catch (error) {
    showFailToast('加载失败')
    console.error(error)
    finished.value = true
  } finally {
    loading.value = false
  }
}

// 重置并加载应用
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

// 排序变化
const onSortChange = () => {
  resetAndLoadApps()
}

// 筛选变化
const onFilterChange = () => {
  resetAndLoadApps()
}



onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.category-page {
  background: #f7f8fa;
  min-height: 100vh;
}

.content {
  height: calc(100vh - 96px);
  overflow: hidden;
}

.loading-center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.category-container {
  display: flex;
  height: 100%;
}

/* 左侧分类栏 */
.category-sidebar {
  width: 90px;
  background: white;
  overflow-y: auto;
  border-right: 1px solid #ebedf0;
  min-height: 100%;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.category-item.active {
  background: #f7f8fa;
  color: #1989fa;
}

.category-item .van-icon {
  margin-bottom: 4px;
}

.category-name {
  font-size: 12px;
  text-align: center;
}

/* 右侧内容区 */
.category-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.category-banner {
  margin-bottom: 12px;
}

/* 筛选栏 */
.filter-bar {
  margin-bottom: 12px;
  background: white;
}

/* 应用列表 */
.app-list {
  background: white;
  padding: 0 16px 16px;
}
</style>
