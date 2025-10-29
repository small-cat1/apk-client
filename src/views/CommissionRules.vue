<template>
  <div class="commission-rules-page">
    <van-nav-bar
      title="分佣规则"
      left-arrow
      fixed
      @click-left="router.back()"
    >
    </van-nav-bar>

    <div class="content" style="padding-top: 46px;">
      <!-- 阶梯分佣 -->
      <div class="tier-section">
        <van-cell-group inset>
          <div class="section-header">
            <van-icon name="chart-trending-o" />
            阶梯分佣规则
          </div>

          <div class="tier-list">
            <div
              v-for="(tier, index) in rules.tiers"
              :key="index"
              class="tier-item"
            >
              <div class="tier-level">
                <van-icon name="medal-o" :color="getTierColor(index)" />
                <span>{{ tier.name }}</span>
              </div>
              <div class="tier-condition">
                下级达到 {{ tier.minSubordinates }} 人
              </div>
              <div class="tier-rate">
                分佣比例：<span class="rate-value">{{ tier.rate }}%</span>
              </div>
            </div>
          </div>
        </van-cell-group>
      </div>

      <!-- 说明 -->
      <div class="rule-description">
        <van-cell-group inset>
          <div class="section-header">
            <van-icon name="info-o" />
            规则说明
          </div>

          <div class="description-content">
            <div class="desc-item">
              <div class="desc-title">1. 分佣计算方式</div>
              <div class="desc-text">
                当下级用户消费时，您将获得订单金额*分佣比例的金额作为佣金。例如：您当前是{{currentRuleTiers.name}},下级消费100元，您可获得{{ 100*currentRuleTiers.rate/100 }}元佣金。
              </div>
            </div>

            <div class="desc-item">
              <div class="desc-title">2. 阶梯分佣</div>
              <div class="desc-text">
                根据您的下级用户数量，可享受更高的分佣比例。下级用户数量越多，分佣比例越高。
              </div>
            </div>

            <div class="desc-item">
              <div class="desc-title">3. 提现规则</div>
              <div class="desc-text">
                • 最低提现金额：¥{{ rules.minWithdraw }}<br/>
                • 单次最高提现：¥{{ rules.maxWithdraw }}<br/>
                • 每日最多提现{{ rules.dailyWithdrawCount }}次<br/>
                • 提现后1-3个工作日到账
              </div>
            </div>

            <div class="desc-item">
              <div class="desc-title">4. 结算周期</div>
              <div class="desc-text">
                {{ rules.settlementCycle }}。确认收货后佣金自动结算到您的账户。
              </div>
            </div>
          </div>
        </van-cell-group>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/pinia'
import {showToast, showDialog, showFailToast} from 'vant'
import {getCommissionRules} from "@/api/commission";

const router = useRouter()
const userStore = useUserStore()



// 当前规则
const rules = ref({})

const currentRuleTiers = ref({})

// 获取规则
const fetchRules = async () => {
  try {
    // TODO: 调用后端API
    const res = await getCommissionRules()
    if(res.code !== 0){
      showFailToast(res.msg || '获取规则失败')
      return
    }
    rules.value = res.data
    if(res.data.tiers.length > 0){
      currentRuleTiers.value = res.data.tiers[0]
    }
    // 示例数据已在上面定义
  } catch (error) {
    console.error('获取规则失败:', error)
    showToast('获取规则失败')
  }
}

// 获取阶梯颜色
const getTierColor = (index) => {
  const colors = ['#cd7f32', '#c0c0c0', '#ffd700', '#e5e4e2', '#b9f2ff']
  return colors[index] || '#ff6b35'
}

onMounted(() => {
  fetchRules()
})
</script>

<style scoped>
.commission-rules-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.content {
  padding: 12px 0 60px 0;
}



/* 阶梯分佣 */
.tier-section {
  margin: 12px 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  font-size: 16px;
  font-weight: bold;
  color: #323233;
}

.tier-list {
  padding: 0 16px 16px 16px;
}

.tier-item {
  padding: 14px;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #f7f8fa, #fff);
  border-radius: 8px;
  border-left: 4px solid #ff6b35;
}

.tier-item:last-child {
  margin-bottom: 0;
}

.tier-level {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 6px;
}

.tier-condition {
  font-size: 13px;
  color: #646566;
  margin-bottom: 4px;
}

.tier-rate {
  font-size: 13px;
  color: #646566;
}

.tier-rate .rate-value {
  font-size: 16px;
  font-weight: bold;
  color: #ff6b35;
}

/* 规则说明 */
.rule-description {
  margin: 12px 0;
}

.description-content {
  padding: 0 16px 16px 16px;
}

.desc-item {
  margin-bottom: 16px;
}

.desc-item:last-child {
  margin-bottom: 0;
}

.desc-title {
  font-size: 14px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 6px;
}

.desc-text {
  font-size: 13px;
  color: #646566;
  line-height: 1.6;
}

</style>
