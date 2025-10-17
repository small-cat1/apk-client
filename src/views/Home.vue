<template>
  <div class="home-dynamic">
    <!-- 动态背景 -->
    <div class="animated-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>
    <!-- 内容层 -->
    <div class="content-layer">
      <!-- 搜索卡片 -->
      <div class="glass-search" @click="$router.push('/search')">
        <van-icon name="search" size="18" color="#999" />
        <span class="search-placeholder">探索你感兴趣的应用</span>
        <div class="mic-icon">
          <van-icon name="search" size="18"  style="color: #667eea" />
        </div>
      </div>
      <!-- 动态标签云 -->
      <div class="trending-tags">
        <div class="tag-cloud">
          <div
            v-for="(tag, index) in trendingTags"
            :key="tag.id"
            class="cloud-tag"
            :style="getTagStyle(index)"
            @click="handleTagClick(tag)"
          >

            <span class="tag-icon">{{ tag.emoji_icon }}</span>
            <span class="tag-text">{{ tag.category_name }}</span>
            <span class="tag-count">{{ tag.app_count }}</span>
          </div>
        </div>
      </div>
      <!-- 推荐列表 -->
      <div class="recommend-list">
        <div class="list-header">
          <h2>💎 编辑精选</h2>
        </div>
        <van-list
          v-model:loading="loading"
          v-model:error="error"
          error-text="加载失败，请稍后再试"
          v-model:finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div
            v-for="app in recommendApps"
            :key="app.id"
            class="recommend-item"
          >
            <CustomPic
              :pic-src="app.app_icon"
              custom-class="item-icon"
            />
            <div class="item-info">
              <h3>{{ app.app_name }}</h3>
              <p>{{ app.description }}</p>
              <div class="item-tags">
                <span v-if="app.is_hot" class="mini-tag">
                  热门
                </span>
                <span v-if="app.is_recommend" class="mini-tag">
                  推荐
                </span>
              </div>
            </div>
            <download-button
              :app="app"
            />
          </div>
        </van-list>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref,  onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {getTrendingCategory,  getHotOrRecommendApplications} from "@/api/home.js";
import {showToast} from "vant";
import CustomPic from '@/components/CustomPic.vue'
import DownloadButton from '@/components/DownloadButton.vue'

const router = useRouter()
const loading = ref(false)
const error = ref(false) // 新增：错误状态
const finished = ref(false) // 新增：是否加载完成

const trendingTags = ref()
const recommendApps = ref([])

const getTagStyle = (index) => {
  const positions = [
    { top: '10%', left: '5%' },
    { top: '15%', right: '10%' },
    { top: '40%', left: '15%' },
    { top: '45%', right: '5%' },
    { top: '70%', left: '8%' },
    { top: '75%', right: '12%' }
  ]
  return positions[index] || {}
}

const handleTagClick = (tag) => {
  router.push(`/category?type=${tag.category_code}`)
}




const onLoad = async () => {
  try {
    loading.value = true
    error.value = false
    await getAppData()
  } catch (err) {
    error.value = true
    console.error('加载失败:', err)
  } finally {
    loading.value = false
  }
}

const getAppData = async () => {
  try {
    const resp = await getHotOrRecommendApplications()
    if (resp.code === 0) {
      recommendApps.value = resp.data
      error.value = false
      // ✅ 标记加载完成
      finished.value = true
    } else {
      error.value = true
      finished.value = true
      showToast(resp.message || '加载失败')
      throw new Error(resp.message)
    }
  } catch (err) {
    error.value = true
    finished.value = true
    throw err
  }
}


const getTrendingTags = async ()=>{
   const resp = await  getTrendingCategory()
  if(resp.code === 0){
    trendingTags.value = resp.data
  }
}


onMounted(() => {
  getTrendingTags()
})
</script>




<style scoped>
.home-dynamic {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

/* 动态背景 */
.animated-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  z-index: 0;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: float 20s ease-in-out infinite;
}

.orb-1 {
  width: 300px;
  height: 300px;
  background: #f093fb;
  top: -100px;
  left: -100px;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: #4facfe;
  bottom: -150px;
  right: -150px;
  animation-delay: -5s;
}

.orb-3 {
  width: 250px;
  height: 250px;
  background: #43e97b;
  top: 50%;
  right: -100px;
  animation-delay: -10s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

/* 内容层 */
.content-layer {
  position: relative;
  z-index: 1;
  padding: 16px 16px 60px;
}

/* 搜索卡片 */
.glass-search {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  margin-bottom: 20px;
  cursor: pointer;
}

.search-placeholder {
  flex: 1;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.mic-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
}

/* 标签云 */
.trending-tags {
  position: relative;
  height: 200px;
  margin-bottom: 20px;
}

.tag-cloud {
  position: relative;
  width: 100%;
  height: 100%;
}

.cloud-tag {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
  animation: float 3s ease-in-out infinite;
}

.cloud-tag:nth-child(2) { animation-delay: -1s; }
.cloud-tag:nth-child(3) { animation-delay: -2s; }

.cloud-tag:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.35);
}

.tag-count {
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 11px;
}

/* 推荐列表 */
.recommend-list {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.list-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: white;
}

.recommend-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.recommend-item:active {
  transform: scale(0.98);
  background: rgba(255, 255, 255, 0.15);
}

/* ✅ 修改图标样式，适配 CustomPic 组件 */
:deep(.item-icon) {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  object-fit: cover;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-info h3 {
  margin: 0 0 4px 0;
  font-size: 15px;
  font-weight: 600;
  color: white;
}

.item-info p {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.mini-tag {
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 11px;
  color: white;
}

.recommend-item .van-button {
  background: white;
  color: #667eea;
  border: none;
}
</style>
