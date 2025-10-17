<template>
  <div class="profile">
    <van-nav-bar title="个人中心" fixed />

    <div class="content" style="padding-top: 46px;">
      <!-- 用户信息区域 -->
      <div class="user-section">
        <template v-if="userStore.token">
          <!-- 已登录状态 -->
          <div class="user-info">
            <!-- 如果有头像就显示图片，否则显示图标 -->
            <van-image
              v-if="userInfo.avatar"
              class="avatar"
              :src="userInfo.avatar"
              round
              width="60"
              height="60"
            />
            <div v-else class="avatar-icon">
              <van-icon name="user-o" size="30" />
            </div>
            <div class="user-details">
              <div class="username">{{ userInfo.username }}</div>
              <div class="user-level">
                <van-tag :type="userInfo.vipLevel > 0 ? 'success' : 'default'">
                  {{ userInfo.vipLevel > 0 ? 'VIP会员' : '普通用户' }}
                </van-tag>
              </div>
            </div>
            <van-icon name="arrow" />
          </div>

          <!-- VIP信息 -->
          <div v-if="userInfo.vipLevel > 0" class="vip-info">
            <div class="vip-title">
              <van-icon name="diamond-o" color="#ff6b35" />
              VIP特权
            </div>
            <div class="vip-benefits">
              <span>无限下载</span>
              <span>专享应用</span>
              <span>优先客服</span>
            </div>
            <div class="vip-expire">
              到期时间：{{ formatDate(userInfo.vipExpireTime) }}
            </div>
          </div>
        </template>

        <template v-else>
          <!-- 未登录状态 -->
          <div class="guest-info" @click="showAuth">
            <div class="avatar-icon">
              <van-icon name="user-o" size="30" />
            </div>
            <div class="guest-details">
              <div class="guest-title">点击登录</div>
              <div class="guest-subtitle">登录后享受更多服务</div>
            </div>
            <van-icon name="arrow" />
          </div>
        </template>
      </div>

      <!-- 功能菜单 -->
      <div class="menu-section">
        <van-cell-group inset>
          <van-cell
            v-if="userStore.token"
            title="会员权益"
            icon="gem-o"
            is-link
            @click="goToUserMemberships"
          />
          <van-cell
            v-if="userStore.token"
            title="订单列表"
            icon="orders-o"
            is-link
            @click="goToOrder"
          />
<!--          <van-cell-->
<!--            v-if="userStore.token"-->
<!--            title="下载历史"-->
<!--            icon="records"-->
<!--            is-link-->
<!--            @click="goToHistory"-->
<!--          />-->
        </van-cell-group>
      </div>

      <!-- VIP升级 -->
      <div v-if="userStore.token && !userInfo.isVip" class="vip-section">
        <van-cell-group inset>
          <van-cell
            title="开通VIP"
            label="解锁所有应用，享受专属特权"
            icon="diamond-o"
            is-link
            @click="goToVip"
          >
            <template #right-icon>
              <van-tag type="warning">限时优惠</van-tag>
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <div v-if="userStore.token && userInfo.isVip" class="vip-section">
        <van-cell-group inset>
          <van-cell
            title="网络推荐"
            label="解锁网络限制，享受自由世界"
            icon="bar-chart-o"
            is-link
            @click="goToVip"
          >
          </van-cell>
        </van-cell-group>
      </div>

      <!-- 设置菜单 -->
      <div class="menu-section">
        <van-cell-group inset>
          <van-cell v-if="userStore.token" title="设置" icon="setting-o" is-link @click="goToSettings" />
          <van-cell title="关于我们" icon="info-o" is-link @click="goToAbout" />
          <van-cell
            v-if="userStore.token"
            title="退出登录"
            icon="sign"
            @click="handleLogout"
            title-style="color: #ee0a24"
          />
        </van-cell-group>
      </div>
    </div>


  </div>
</template>

<script setup>
import { ref, computed,  } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/pinia'
import { showDialog, showToast } from 'vant'
import {emitter} from "@/utils/bus.js";

const router = useRouter()
const userStore = useUserStore()


const userInfo = computed(() => userStore.userInfo || {})

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('zh-CN')
}

// 这些方法不再需要 checkLogin，路由守卫会处理
const goToUserMemberships = () => {
  console.log(userInfo.value.memberships.length)
  if(userInfo.value.memberships.length === 0){
    showToast("普通会员暂无权益！")
    return
  }
  router.push('/userMemberships')
}
const goToOrder = () => {
  router.push('/orderList')
}

const goToVip = () => {
  router.push('/package')
}

const goToSettings = () => {
  router.push('/settings')
}

const goToAbout = () => {
  router.push('/about')
}
const showAuth = () => {
  emitter.emit("show-login-modal")
}
const handleLogout = () => {
  showDialog({
    title: '提示',
    message: '确定要退出登录吗？'
  }).then(() => {
    userStore.LoginOut()
    showToast({
      message: '已退出登录',
      type: 'success'
    })
  }).catch(() => {
    // 取消退出
  })
}


</script>

<style scoped>
.profile {
  background: #f7f8fa;
  min-height: 100vh;
}

.content {
  padding: 0 0 60px 0;
}

.user-section {
  margin: 12px;
  background: white;
  border-radius: 8px;
  padding: 20px 16px;
}

.user-info, .guest-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-details, .guest-details {
  flex: 1;
  margin-left: 12px;
}

.username {
  font-size: 18px;
  font-weight: bold;
  color: #323233;
}

.user-level {
  margin-top: 4px;
}

.guest-title {
  font-size: 16px;
  color: #323233;
}

.guest-subtitle {
  font-size: 12px;
  color: #969799;
  margin-top: 4px;
}

.vip-info {
  margin-top: 16px;
  padding: 12px;
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  border-radius: 8px;
  color: white;
}

.vip-title {
  display: flex;
  align-items: center;
  font-weight: bold;
  margin-bottom: 8px;
}

.vip-title .van-icon {
  margin-right: 4px;
}

.vip-benefits {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.vip-benefits span {
  font-size: 12px;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
}

.vip-expire {
  font-size: 12px;
  opacity: 0.9;
}

.menu-section {
  margin: 12px 0;
}

.vip-section {
  margin: 12px 0;
}
</style>
