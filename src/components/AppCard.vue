<template>
  <div class="app-card-glass" >
    <div class="card-content">
      <!-- 左侧图标 -->
      <div class="app-icon-wrapper">
        <custom-pic
          :pic-src="app.app_icon"
          :custom-style="{ width: '56px', height: '56px', borderRadius: '14px' }"
          class="app-icon"
        />
      </div>

      <!-- 中间内容 -->
      <div class="app-info">
        <div class="app-title">{{ app.app_name }}</div>
        <div class="app-desc">{{ app.description }}</div>

        <!-- 标签 -->
        <div class="tags-wrapper">
          <span v-if="app.is_hot" class="tag tag-hot">热门</span>
          <span v-if="app.is_recommend" class="tag tag-recommend">推荐</span>
        </div>
      </div>
      <!-- 右侧按钮 -->
      <div class="app-action">
        <download-button
          :app="app"
          @download="handleDownload"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import DownloadButton from './DownloadButton.vue'
import CustomPic from './CustomPic.vue'

const props = defineProps({
  app: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['download'])
const router = useRouter()

const goToDetail = () => {
  router.push(`/app/${props.app.id}`)
}

const handleDownload = (event) => {
  event.stopPropagation() // 阻止冒泡，避免触发卡片点击
  emit('download', props.app)
}
</script>

<style scoped>
.app-card-glass {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.app-card-glass:active {
  transform: scale(0.98);
  background: rgba(255, 255, 255, 0.2);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 图标区域 */
.app-icon-wrapper {
  flex-shrink: 0;
}

.app-icon {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 信息区域 */
.app-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.app-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-desc {
  font-size: 10px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 标签 */
.tags-wrapper {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.tag-hot {
  background: rgba(237, 25, 26, 30);
  color: #fff;
  border: 1px solid rgba(255, 77, 79, 0.4);
}

.tag-recommend {
  background: rgb(20, 231, 129);
  color: #fff;
  border: 1px solid rgba(25, 190, 107, 0.4);
}

/* 按钮区域 */
.app-action {
  flex-shrink: 0;
}

</style>
