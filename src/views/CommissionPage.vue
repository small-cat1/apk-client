<template>
  <div class="commission-page">
    <van-nav-bar
      title="推广收益"
      left-arrow
      fixed
      @click-left="router.back()"
    />

    <div class="content" style="padding-top: 46px;">
      <!-- 收益总览卡片 -->
      <div class="overview-card">
        <div class="overview-header">
          <van-icon name="gold-coin-o" size="24" color="#ff6b35" />
          <span>收益总览</span>
        </div>

        <div class="main-amount">
          <div class="amount-label">可提现金额（元）</div>
          <div class="amount-value">{{ commissionData.availableAmount.toFixed(2) }}</div>
          <van-button
            type="primary"
            round
            size="small"
            :disabled="commissionData.availableAmount < minWithdrawAmount"
            @click="goToWithdraw"
          >
            立即提现
          </van-button>
        </div>

        <div class="amount-grid">
          <div class="grid-item">
            <div class="grid-value">¥{{ commissionData.totalEarnings.toFixed(2) }}</div>
            <div class="grid-label">累计收益</div>
          </div>
          <div class="grid-item">
            <div class="grid-value">¥{{ commissionData.withdrawnAmount.toFixed(2) }}</div>
            <div class="grid-label">已提现</div>
          </div>
          <div class="grid-item">
            <div class="grid-value">¥{{ commissionData.frozenAmount.toFixed(2) }}</div>
            <div class="grid-label">冻结中</div>
          </div>
        </div>
      </div>

      <!-- 收益统计 -->
      <div class="stats-section">
        <van-cell-group inset>
          <div class="stats-header">
            <van-icon name="chart-trending-o" />
            收益统计
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">¥{{ statsData.todayEarnings.toFixed(2) }}</div>
              <div class="stat-label">今日收益</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">¥{{ statsData.yesterdayEarnings.toFixed(2) }}</div>
              <div class="stat-label">昨日收益</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">¥{{ statsData.weekEarnings.toFixed(2) }}</div>
              <div class="stat-label">本周收益</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">¥{{ statsData.monthEarnings.toFixed(2) }}</div>
              <div class="stat-label">本月收益</div>
            </div>
          </div>
        </van-cell-group>
      </div>

      <!-- 团队数据 -->
      <div class="team-section">
        <van-cell-group inset>
          <div class="stats-header">
            <van-icon name="friends-o" />
            团队数据
          </div>

          <van-cell title="团队总人数" :value="`${teamData.totalMembers}人`" />
          <van-cell title="今日新增" :value="`${teamData.todayNew}人`" />
          <van-cell title="活跃用户" :value="`${teamData.activeMembers}人`" />
          <van-cell title="团队消费" :value="`¥${teamData.totalConsumption.toFixed(2)}`" />
        </van-cell-group>
      </div>

      <!-- 快捷入口 -->
      <div class="quick-actions">
        <van-cell-group inset>
          <van-cell
            title="我的下级"
            icon="friends-o"
            is-link
            @click="goToSubordinateList"
          />
          <van-cell
            title="分佣明细"
            icon="balance-list-o"
            is-link
            @click="goToCommissionDetail"
          />
          <van-cell
            title="提现记录"
            icon="bill-o"
            is-link
            @click="goToWithdrawRecord"
          />
        </van-cell-group>
      </div>

      <!-- 提现说明 -->
      <div class="withdraw-tips">
        <div class="tips-title">
          <van-icon name="info-o" />
          提现说明
        </div>
        <div class="tips-content">
          <p>1. 最低提现金额为 ¥{{ minWithdrawAmount }}，提现后1-3个工作日到账</p>
          <p>2. 每日最多可提现3次，单次最高提现金额为 ¥5000</p>
          <p>3. 首次提现需要绑定支付宝或微信账号</p>
          <p>4. 下级用户消费后即可获得分佣，分佣比例为10%</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const minWithdrawAmount = ref(10)

const commissionData = ref({
  availableAmount: 0,
  totalEarnings: 0,
  withdrawnAmount: 0,
  frozenAmount: 0
})

const statsData = ref({
  todayEarnings: 0,
  yesterdayEarnings: 0,
  weekEarnings: 0,
  monthEarnings: 0
})

const teamData = ref({
  totalMembers: 0,
  todayNew: 0,
  activeMembers: 0,
  totalConsumption: 0
})

const fetchData = async () => {
  try {
    // TODO: 调用API
    commissionData.value = {
      availableAmount: 158.50,
      totalEarnings: 2580.30,
      withdrawnAmount: 2400.00,
      frozenAmount: 21.80
    }

    statsData.value = {
      todayEarnings: 23.56,
      yesterdayEarnings: 45.80,
      weekEarnings: 186.50,
      monthEarnings: 580.30
    }

    teamData.value = {
      totalMembers: 48,
      todayNew: 3,
      activeMembers: 35,
      totalConsumption: 15680.50
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

const goToWithdraw = () => {
  router.push('/withdraw')
}

const goToSubordinateList = () => {
  router.push('/subordinateList')
}

const goToCommissionDetail = () => {
  router.push('/commissionDetail')
}

const goToWithdrawRecord = () => {
  router.push('/withdrawRecord')
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.commission-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.content {
  padding: 12px 0 60px 0;
}

.overview-card {
  margin: 12px;
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  border-radius: 12px;
  padding: 20px;
  color: white;
}

.overview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
}

.main-amount {
  text-align: center;
  padding: 20px 0;
}

.amount-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.amount-value {
  font-size: 40px;
  font-weight: bold;
  margin-bottom: 16px;
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.grid-item {
  text-align: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}

.grid-value {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
}

.grid-label {
  font-size: 12px;
  opacity: 0.9;
}

.stats-section,
.team-section,
.quick-actions {
  margin: 12px 0;
}

.stats-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  font-size: 16px;
  font-weight: bold;
  color: #323233;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 0 16px 16px 16px;
}

.stat-card {
  text-align: center;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #ff6b35;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #969799;
}

.withdraw-tips {
  margin: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
}

.tips-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 12px;
}

.tips-content {
  font-size: 13px;
  color: #646566;
  line-height: 1.6;
}

.tips-content p {
  margin: 8px 0;
}
</style>
