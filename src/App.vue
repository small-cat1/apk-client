<template>
  <div id="app">
    <router-view />

    <!-- 底部导航 -->
    <van-tabbar
      v-if="showTabbar"
      route
      fixed
      placeholder
      active-color="#1989fa"
      inactive-color="#7d7e80"
    >
      <van-tabbar-item to="/home" icon="wap-home-o">
        首页
      </van-tabbar-item>
      <van-tabbar-item to="/category" icon="apps-o">
        应用
      </van-tabbar-item>
      <van-tabbar-item to="/account" icon="friends">
        账户
      </van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">
        我的
      </van-tabbar-item>
    </van-tabbar>
    <!-- 全局错误处理 -->
    <ErrorView />
    <!-- 登录弹窗 -->
    <auth-modal
      v-model:show="showAuthModal"
      @success="onAuthSuccess"
    />
    <!-- 🎯 全局客服组件 -->
    <CustomerService ref="customerServiceRef"     />
  </div>
</template>

<script setup>
import {ref, computed, onMounted, onUnmounted} from 'vue'
import { useRoute, useRouter } from 'vue-router'  // ✅ 新增 useRouter
import ErrorView from '@/components/Error.vue'
import AuthModal from '@/components/AuthModal.vue'
import CustomerService from '@/components/CustomerService.vue' // 🎯 引入客服组件
import {emitter} from "@/utils/bus.js";

const route = useRoute()  // ✅ 改名为 route，以示区别
const router = useRouter()  // ✅ 新增 router 实例

const showAuthModal = ref(false)
const loginContext = ref(null) // 🎯 保存登录上下文
const customerServiceRef = ref(null)

// 根据路由 meta 信息判断是否显示 tabbar
const showTabbar = computed(() => {
  return route.meta?.showTabbar !== false
})



// 监听全局登录事件
const handleShowLogin = (context) => {
  loginContext.value = context // 保存上下文
  showAuthModal.value = true
}

const onAuthSuccess = () => {
  showAuthModal.value = false
  // 🎯 根据来源处理不同逻辑
  if (loginContext.value?.source === 'router') {
    // 来自路由守卫 → 跳转页面
    const redirectPath = sessionStorage.getItem('redirectAfterLogin')
    if (redirectPath) {
      sessionStorage.removeItem('redirectAfterLogin')
      router.push(redirectPath)
    }
  }

  // 如果是 download 来源，DownloadButton 会自己处理
  loginContext.value = null // 清空上下文
}

onMounted(() => {
  emitter.on('show-login-modal', handleShowLogin)
// ✅ 挂载到全局
  window.$customerService = {
    openModal: () => customerServiceRef.value?.openServiceModal(),      // 打开弹窗
    closeModal: () => customerServiceRef.value?.closeServiceModal(),    // 关闭弹窗
    show: () => customerServiceRef.value?.showFloatButton(),            // 显示悬浮按钮
    hide: () => customerServiceRef.value?.hideFloatButton()             // 隐藏悬浮按钮
  }
})

onUnmounted(() => {
  emitter.off('show-login-modal', handleShowLogin)
})
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

</style>
