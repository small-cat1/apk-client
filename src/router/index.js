import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/pinia'
import {emitter} from '@/utils/bus'
import {InviteCodeManager} from "@/utils/inviteCode.js";
const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      requiresAuth: false,
      title: '首页',
      showTabbar: true
    }
  },
  {
    path: '/category',
    name: 'Category',
    component: () => import('@/views/Category.vue'),
    meta: {
      requiresAuth: false,
      title: '分类列表',
      showTabbar: true
    }
  },
  {
    path: '/account',
    name: 'Account',
    component: () => import('@/views/Account.vue'),
    meta: {
      requiresAuth: false,
      title: '账号',
      showTabbar: true
    }
  },
  {
    path: '/package',
    name: 'Package',
    component: () => import('@/views/Package.vue'),
    meta: {
      requiresAuth: false,
      title: '会员套餐',
      showTabbar: true
    }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/Search.vue'),
    meta: {
      requiresAuth: false,
      title: '搜索',
      showTabbar: false
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: {
      requiresAuth: false,
      title: '个人中心',
      showTabbar: true
    } // 个人中心页面本身不需要登录，页面内部按钮判断
  },
  // ===== 以下页面需要登录 =====
  {
    path: '/userMemberships',
    name: 'UserMemberships',
    component: () => import('@/views/userMemberships.vue'),
    meta: {
      requiresAuth: true,
      title: '会员权益',
      showTabbar: true
    }
  },

  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: {
      requiresAuth: true,
      title: '设置',
      showTabbar: true
    }
  },
  {
    path: '/orderList',
    name: 'OrderList',
    component: () => import('@/views/order-list.vue'),
    meta: {
      requiresAuth: true,
      title: '订单列表',
      showTabbar: true
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: {
      requiresAuth: false,
      title: '关于我们',
      showTabbar: false
    }
  },

  {
    path: '/commissionPage',
    name: 'CommissionPage',
    component: () => import('@/views/CommissionPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/subordinateList',
    name: 'SubordinateList',
    component: () => import('@/views/SubordinateList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/commissionDetail',
    name: 'CommissionDetail',
    component: () => import('@/views/CommissionDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/withdraw',
    name: 'Withdraw',
    component: () => import('@/views/Withdraw.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/withdrawRecord',
    name: 'WithdrawRecord',
    component: () => import('@/views/WithdrawRecord.vue'),
    meta: { requiresAuth: true }
  },

  {
    path: '/announcementList',
    name: 'AnnouncementList',
    component: () => import('@/views/AnnouncementList.vue'),
    meta: { requiresAuth: false, title: '系统公告' }
  },
  {
    path: '/announcementDetail',
    name: 'AnnouncementDetail',
    component: () => import('@/views/AnnouncementDetail.vue'),
    meta: { requiresAuth: false, title: '公告详情' }
  },
  {
    path: '/commissionRules',
    name: 'CommissionRules',
    component: () => import('@/views/CommissionRules.vue'),
    meta: { requiresAuth: true, title: '分佣规则' }
  },
  {
    path: '/:pathMatch(.*)*',  // ✅ 注意是 pathMatch
    name: 'NotFound',
    component: () => import('@/views/Error.vue'),
    meta: {
      title: '页面未找到',
      showTabbar: false
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from) => {
  // 全局处理邀请码
  const urlInviteCode = to.query.inviteCode
  if (urlInviteCode) {
    InviteCodeManager.set(urlInviteCode)
  }

  const userStore = useUserStore()
  const token = userStore.token
  // 未登录
  if (to.meta.requiresAuth && !token) {
    sessionStorage.setItem('redirectAfterLogin', to.fullPath)
    // 🎯 携带来源信息
    emitter.emit('show-login-modal', {
      source: 'router',
      targetPath: to.fullPath
    })
    return false  // 阻止导航
  }
  if(token){
    userStore.GetUserInfo()
  }
})

export default router
