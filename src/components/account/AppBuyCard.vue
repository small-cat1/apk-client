<template>
  <div class="app-buy-card">
    <div class="card-content">
      <!-- 左侧应用信息 -->
      <div class="app-info" >
        <CustomPic
          :pic-src="app.app_icon"
          class="app-icon"
        />
        <div class="app-details">
          <h3 class="app-name">{{ app.app_name }}</h3>
          <p class="app-desc">{{ app.app_desc }}</p>

          <!-- 标签 -->
          <div class="app-tags">
            <van-tag type="danger" size="mini" v-if="app.is_hot">热门</van-tag>
            <van-tag type="warning" size="mini" v-if="app.is_official">官方</van-tag>
            <van-tag type="success" size="mini" v-if="app.is_recommend">推荐</van-tag>
          </div>

          <!-- 统计信息 -->
          <div class="app-stats">
            <div class="stat-item">
              <van-icon name="user-o" size="12" />
              <span>{{ formatNumber(app.sales_count) }}人购买</span>
            </div>
            <div class="stat-item">
              <van-rate
                v-model="app.rating"
                :size="12"
                color="#ffd21e"
                void-icon="star"
                void-color="#eee"
                readonly
                allow-half
              />
              <span>{{ app.rating }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧价格和购买 -->
      <div class="app-action">
        <div class="price-section">
          <div class="price-main">
            <span class="currency">¥</span>
            <span class="amount">{{ app.account_price }}</span>
          </div>
          <div class="original-price" v-if="app.original_price">
            ¥{{ app.original_price }}
          </div>
        </div>
        <van-button
          type="primary"
          size="small"
          round
          block
          :disabled="app.stock <= 0"
          @click.stop="$emit('buy', app)"
        >
          {{ app.stock > 0 ? '立即购买' : '已售罄' }}
        </van-button>
        <!-- 库存提示 -->
        <div class="stock-tip" v-if="app.stock > 0 && app.stock <= 10">
          仅剩{{ app.stock }}个
        </div>
      </div>
    </div>


  </div>
</template>

<script setup>
import CustomPic from '@/components/CustomPic.vue'

defineProps({
  app: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['buy'])

// 格式化数字
const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num
}


</script>

<style scoped>
.app-buy-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}

.app-buy-card:active {
  transform: scale(0.98);
}

.card-content {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

/* 左侧应用信息 */
.app-info {
  flex: 1;
  display: flex;
  gap: 12px;
  min-width: 0;
}

.app-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  flex-shrink: 0;
  object-fit: cover;
}

.app-details {
  flex: 1;
  min-width: 0;
}

.app-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #323233;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-desc {
  font-size: 13px;
  color: #969799;
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.app-tags {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.app-stats {
  display: flex;
  gap: 12px;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #969799;
}

/* 右侧价格和购买 */
.app-action {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  min-width: 85px;
}

.price-section {
  text-align: right;
}

.price-main {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  color: #ee0a24;
  line-height: 1;
  margin-bottom: 2px;
}

.currency {
  font-size: 12px;
  font-weight: 500;
}

.amount {
  font-size: 22px;
  font-weight: bold;
}



.original-price {
  font-size: 12px;
  color: #969799;
  text-decoration: line-through;
}

.stock-tip {
  font-size: 11px;
  color: #ee0a24;
  margin-top: 4px;
  text-align: center;
}


</style>
