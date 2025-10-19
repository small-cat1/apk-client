<template>
  <div class="commission-rules-page">
    <van-nav-bar
      title="分佣规则"
      left-arrow
      fixed
      @click-left="router.back()"
    >
      <template #right>
        <van-icon
          v-if="isAdmin"
          name="edit"
          @click="showEditPopup = true"
        />
      </template>
    </van-nav-bar>

    <div class="content" style="padding-top: 46px;">
      <!-- 当前规则 -->
      <div class="current-rule-card">
        <div class="rule-header">
          <van-icon name="award-o" size="24" color="#ff6b35" />
          <span>当前分佣规则</span>
        </div>

        <div class="rule-content">
          <div class="rule-item">
            <span class="rule-label">基础分佣比例</span>
            <span class="rule-value">{{ rules.basicRate }}%</span>
          </div>
          <div class="rule-item">
            <span class="rule-label">最低提现金额</span>
            <span class="rule-value">¥{{ rules.minWithdraw }}</span>
          </div>
          <div class="rule-item">
            <span class="rule-label">单次最高提现</span>
            <span class="rule-value">¥{{ rules.maxWithdraw }}</span>
          </div>
          <div class="rule-item">
            <span class="rule-label">每日提现次数</span>
            <span class="rule-value">{{ rules.dailyWithdrawCount }}次</span>
          </div>
          <div class="rule-item">
            <span class="rule-label">分佣结算周期</span>
            <span class="rule-value">{{ rules.settlementCycle }}</span>
          </div>
        </div>
      </div>

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
                当下级用户消费时，您将获得订单金额的 {{ rules.basicRate }}% 作为佣金。例如：下级消费100元，您可获得{{ rules.basicRate }}元佣金。
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

    <!-- 编辑规则弹窗（仅管理员可见） -->
    <van-popup v-model:show="showEditPopup" position="bottom" :style="{ height: '80%' }">
      <div class="edit-popup">
        <van-nav-bar
          title="编辑分佣规则"
          left-text="取消"
          right-text="保存"
          @click-left="showEditPopup = false"
          @click-right="saveRules"
        />

        <div class="edit-content">
          <van-form>
            <van-cell-group inset>
              <van-field
                v-model="editRules.basicRate"
                type="number"
                label="基础分佣比例"
                placeholder="请输入比例"
                right-icon="%"
              />
              <van-field
                v-model="editRules.minWithdraw"
                type="number"
                label="最低提现金额"
                placeholder="请输入金额"
                left-icon="balance-o"
              />
              <van-field
                v-model="editRules.maxWithdraw"
                type="number"
                label="单次最高提现"
                placeholder="请输入金额"
                left-icon="balance-o"
              />
              <van-field
                v-model="editRules.dailyWithdrawCount"
                type="number"
                label="每日提现次数"
                placeholder="请输入次数"
              />
              <van-field
                v-model="editRules.settlementCycle"
                label="结算周期"
                placeholder="例如：订单完成后立即结算"
              />
            </van-cell-group>

            <!-- 阶梯规则编辑 -->
            <van-cell-group inset style="margin-top: 12px;">
              <div class="edit-section-title">阶梯分佣规则</div>

              <div
                v-for="(tier, index) in editRules.tiers"
                :key="index"
                class="edit-tier-item"
              >
                <div class="edit-tier-header">
                  <span>等级 {{ index + 1 }}</span>
                  <van-button
                    v-if="editRules.tiers.length > 1"
                    size="mini"
                    type="danger"
                    plain
                    @click="removeTier(index)"
                  >
                    删除
                  </van-button>
                </div>

                <van-field
                  v-model="tier.name"
                  label="等级名称"
                  placeholder="例如：青铜推广员"
                />
                <van-field
                  v-model="tier.minSubordinates"
                  type="number"
                  label="最低下级数"
                  placeholder="达到此人数可享受该比例"
                />
                <van-field
                  v-model="tier.rate"
                  type="number"
                  label="分佣比例"
                  placeholder="请输入比例"
                  right-icon="%"
                />
              </div>

              <van-button
                block
                plain
                type="primary"
                icon="plus"
                style="margin: 12px 0;"
                @click="addTier"
              >
                添加阶梯
              </van-button>
            </van-cell-group>
          </van-form>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/pinia'
import { showToast, showDialog } from 'vant'

const router = useRouter()
const userStore = useUserStore()

// 判断是否是管理员
const isAdmin = computed(() => {
  return userStore.userInfo?.role === 'admin' || userStore.userInfo?.isAdmin
})

const showEditPopup = ref(false)

// 当前规则
const rules = ref({
  basicRate: 10,
  minWithdraw: 10,
  maxWithdraw: 5000,
  dailyWithdrawCount: 3,
  settlementCycle: '订单完成后立即结算',
  tiers: [
    { name: '青铜推广员', minSubordinates: 0, rate: 10 },
    { name: '白银推广员', minSubordinates: 10, rate: 12 },
    { name: '黄金推广员', minSubordinates: 30, rate: 15 },
    { name: '铂金推广员', minSubordinates: 50, rate: 18 },
    { name: '钻石推广员', minSubordinates: 100, rate: 20 }
  ]
})

// 编辑中的规则
const editRules = ref({
  basicRate: '',
  minWithdraw: '',
  maxWithdraw: '',
  dailyWithdrawCount: '',
  settlementCycle: '',
  tiers: []
})

// 获取规则
const fetchRules = async () => {
  try {
    // TODO: 调用后端API
    // const res = await api.getCommissionRules()
    // rules.value = res.data

    // 示例数据已在上面定义
  } catch (error) {
    console.error('获取规则失败:', error)
    showToast('获取规则失败')
  }
}

// 打开编辑弹窗时复制当前规则
const openEditPopup = () => {
  editRules.value = JSON.parse(JSON.stringify(rules.value))
  showEditPopup.value = true
}

// 添加阶梯
const addTier = () => {
  editRules.value.tiers.push({
    name: '',
    minSubordinates: 0,
    rate: 0
  })
}

// 删除阶梯
const removeTier = (index) => {
  showDialog({
    title: '确认删除',
    message: '确定要删除这个阶梯吗？'
  }).then(() => {
    editRules.value.tiers.splice(index, 1)
  }).catch(() => {
    // 取消
  })
}

// 保存规则
const saveRules = async () => {
  // 验证
  if (!editRules.value.basicRate || editRules.value.basicRate <= 0) {
    showToast('请输入正确的基础分佣比例')
    return
  }

  if (!editRules.value.minWithdraw || editRules.value.minWithdraw <= 0) {
    showToast('请输入正确的最低提现金额')
    return
  }

  if (!editRules.value.maxWithdraw || editRules.value.maxWithdraw <= 0) {
    showToast('请输入正确的最高提现金额')
    return
  }

  if (parseFloat(editRules.value.minWithdraw) > parseFloat(editRules.value.maxWithdraw)) {
    showToast('最低提现金额不能大于最高提现金额')
    return
  }

  // 验证阶梯规则
  for (let i = 0; i < editRules.value.tiers.length; i++) {
    const tier = editRules.value.tiers[i]
    if (!tier.name) {
      showToast(`请输入第${i + 1}个阶梯的名称`)
      return
    }
    if (!tier.minSubordinates && tier.minSubordinates !== 0) {
      showToast(`请输入第${i + 1}个阶梯的最低下级数`)
      return
    }
    if (!tier.rate || tier.rate <= 0) {
      showToast(`请输入第${i + 1}个阶梯的分佣比例`)
      return
    }
  }

  // 按最低下级数排序
  editRules.value.tiers.sort((a, b) => a.minSubordinates - b.minSubordinates)

  try {
    // TODO: 调用后端API
    // await api.updateCommissionRules(editRules.value)

    await new Promise(resolve => setTimeout(resolve, 500))

    rules.value = JSON.parse(JSON.stringify(editRules.value))
    showEditPopup.value = false
    showToast({
      message: '保存成功',
      type: 'success'
    })
  } catch (error) {
    console.error('保存失败:', error)
    showToast('保存失败，请重试')
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

/* 当前规则卡片 */
.current-rule-card {
  margin: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #fff9f0, #fff);
  border-radius: 12px;
  border: 2px solid #ff6b35;
}

.rule-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 16px;
}

.rule-content {
  background: white;
  border-radius: 8px;
  padding: 12px;
}

.rule-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.rule-item:last-child {
  border-bottom: none;
}

.rule-label {
  font-size: 14px;
  color: #646566;
}

.rule-value {
  font-size: 15px;
  font-weight: bold;
  color: #ff6b35;
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

/* 编辑弹窗 */
.edit-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.edit-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}

.edit-section-title {
  padding: 16px;
  font-size: 15px;
  font-weight: bold;
  color: #323233;
}

.edit-tier-item {
  padding: 12px;
  margin: 0 16px 12px 16px;
  background: #f7f8fa;
  border-radius: 8px;
}

.edit-tier-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: bold;
  color: #323233;
}
</style>
