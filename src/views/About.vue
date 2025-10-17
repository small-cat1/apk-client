<template>
  <div class="about">
    <van-nav-bar title="关于我们" fixed left-arrow @click-left="onClickLeft" />

    <div class="content" style="padding-top: 46px;">
      <!-- 顶部Banner -->
      <div class="banner-section">
        <div class="banner-content">
          <van-icon name="shop-o" size="60" color="#fff" />
          <h1 class="app-name">应用商店</h1>
          <p class="app-slogan">致力于为用户提供优质服务</p>
        </div>
      </div>

      <!-- 公司简介 -->
      <van-cell-group inset class="section">
        <div class="section-title">
          <van-icon name="info-o" />
          <span>公司简介</span>
        </div>
        <div class="section-content">
          <p>我们是一家专注于提供优质数字服务的创新型公司。自成立以来，我们始终坚持以用户为中心，不断优化产品体验，为广大用户提供便捷、高效的服务解决方案。</p>
          <p style="margin-top: 12px;">通过技术创新和持续改进，我们致力于成为行业内最值得信赖的服务提供商。</p>
        </div>
      </van-cell-group>

      <!-- 核心价值 -->
      <van-cell-group inset class="section">
        <div class="section-title">
          <van-icon name="star-o" />
          <span>核心价值</span>
        </div>
        <div class="value-list">
          <div class="value-item">
            <div class="value-icon" style="background: #ecf5ff;">
              <van-icon name="like-o" size="24" color="#409eff" />
            </div>
            <div class="value-content">
              <h3>用户至上</h3>
              <p>始终将用户体验放在首位</p>
            </div>
          </div>
          <div class="value-item">
            <div class="value-icon" style="background: #f4f4f5;">
              <van-icon name="shield-o" size="24" color="#909399" />
            </div>
            <div class="value-content">
              <h3>品质保证</h3>
              <p>严格把控服务质量标准</p>
            </div>
          </div>
          <div class="value-item">
            <div class="value-icon" style="background: #f0f9ff;">
              <van-icon name="fire-o" size="24" color="#67c23a" />
            </div>
            <div class="value-content">
              <h3>持续创新</h3>
              <p>不断探索新技术新方案</p>
            </div>
          </div>
        </div>
      </van-cell-group>

<!--      &lt;!&ndash; 联系我们 &ndash;&gt;-->
<!--      <van-cell-group inset class="section">-->
<!--        <div class="section-title">-->
<!--          <van-icon name="phone-o" />-->
<!--          <span>联系我们</span>-->
<!--        </div>-->
<!--        <van-cell-->
<!--          title="客服热线"-->
<!--          icon="phone-o"-->
<!--          value="400-888-8888"-->
<!--          is-link-->
<!--          @click="callPhone('400-888-8888')"-->
<!--        />-->
<!--        <van-cell-->
<!--          title="电子邮箱"-->
<!--          icon="envelop-o"-->
<!--          value="support@example.com"-->
<!--          is-link-->
<!--          @click="copyEmail('support@example.com')"-->
<!--        />-->
<!--        <van-cell-->
<!--          title="公司地址"-->
<!--          icon="location-o"-->
<!--          value="北京市朝阳区创新大厦18层"-->
<!--          is-link-->
<!--        />-->
<!--      </van-cell-group>-->

<!--      &lt;!&ndash; 服务时间 &ndash;&gt;-->
<!--      <van-cell-group inset class="section">-->
<!--        <div class="section-title">-->
<!--          <van-icon name="clock-o" />-->
<!--          <span>服务时间</span>-->
<!--        </div>-->
<!--        <van-cell title="工作日" value="09:00 - 18:00" />-->
<!--        <van-cell title="周末及节假日" value="10:00 - 17:00" />-->
<!--      </van-cell-group>-->

<!--      &lt;!&ndash; 关注我们 &ndash;&gt;-->
<!--      <van-cell-group inset class="section">-->
<!--        <div class="section-title">-->
<!--          <van-icon name="wechat" />-->
<!--          <span>关注我们</span>-->
<!--        </div>-->
<!--        <div class="social-links">-->
<!--          <div class="social-item" @click="showQRCode('wechat')">-->
<!--            <van-icon name="wechat" size="32" color="#07c160" />-->
<!--            <span>微信公众号</span>-->
<!--          </div>-->
<!--          <div class="social-item" @click="showQRCode('weibo')">-->
<!--            <van-icon name="weibo" size="32" color="#ff6b6b" />-->
<!--            <span>官方微博</span>-->
<!--          </div>-->
<!--          <div class="social-item" @click="showQRCode('qq')">-->
<!--            <van-icon name="qq" size="32" color="#12b7f5" />-->
<!--            <span>QQ交流群</span>-->
<!--          </div>-->
<!--        </div>-->
<!--      </van-cell-group>-->

<!--      &lt;!&ndash; 版本信息 &ndash;&gt;-->
<!--      <div class="version-info">-->
<!--        <p>当前版本：v1.0.0</p>-->
<!--        <p>© 2024 All Rights Reserved</p>-->
<!--      </div>-->
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()

const onClickLeft = () => {
  router.back()
}

const callPhone = (phone) => {
  window.location.href = `tel:${phone}`
}

const copyEmail = (email) => {
  navigator.clipboard.writeText(email).then(() => {
    showToast('邮箱已复制到剪贴板')
  }).catch(() => {
    showToast('复制失败')
  })
}

const showQRCode = (type) => {
  const typeMap = {
    wechat: '微信公众号',
    weibo: '官方微博',
    qq: 'QQ交流群'
  }
  showToast(`请扫描${typeMap[type]}二维码`)
}
</script>

<style scoped>
.about {
  background: #f7f8fa;
  min-height: 100vh;
}

.content {
  padding-bottom: 20px;
}

.banner-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  text-align: center;
}

.banner-content {
  color: white;
}

.app-name {
  font-size: 24px;
  font-weight: bold;
  margin: 12px 0 8px;
}

.app-slogan {
  font-size: 14px;
  opacity: 0.9;
}

.section {
  margin: 12px 0;
}

.section-title {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 500;
  color: #323233;
}

.section-title .van-icon {
  margin-right: 8px;
  color: #667eea;
}

.section-content {
  padding: 0 16px 16px;
  font-size: 14px;
  line-height: 1.6;
  color: #646566;
}

.value-list {
  padding: 0 16px 12px;
}

.value-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
}

.value-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.value-content h3 {
  font-size: 15px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 4px;
}

.value-content p {
  font-size: 13px;
  color: #969799;
}

.social-links {
  display: flex;
  justify-content: space-around;
  padding: 16px;
}

.social-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.social-item span {
  font-size: 12px;
  color: #646566;
}

.version-info {
  text-align: center;
  padding: 20px;
  font-size: 12px;
  color: #969799;
}

.version-info p {
  margin: 4px 0;
}
</style>
