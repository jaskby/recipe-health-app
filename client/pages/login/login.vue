<template>
  <view class="container">
    <view class="login-card">
      <view class="logo-section">
        <text class="logo">🥗</text>
        <text class="app-name">食谱健康</text>
        <text class="app-slogan">科学饮食，健康生活</text>
      </view>

      <view class="form-section">
        <view class="form-item">
          <text class="form-icon">📱</text>
          <input class="form-input" type="number" v-model="phone" placeholder="请输入手机号" maxlength="11" />
        </view>
        <view class="form-item">
          <text class="form-icon">🔒</text>
          <input class="form-input" :password="!showPassword" v-model="password" placeholder="请输入密码" maxlength="20" />
          <text class="toggle-password" @click="showPassword = !showPassword">{{ showPassword ? '👁️' : '👁️‍🗨️' }}</text>
        </view>
      </view>

      <view class="login-btn" @click="handleLogin">
        <text>{{ isRegister ? '注册' : '登录' }}</text>
      </view>

      <view class="switch-mode">
        <text @click="isRegister = !isRegister">
          {{ isRegister ? '已有账号？去登录' : '没有账号？去注册' }}
        </text>
      </view>

      <view class="divider">
        <text>其他登录方式</text>
      </view>

      <view class="other-login">
        <view class="login-item" @click="wechatLogin">
          <text class="login-icon">💬</text>
          <text class="login-text">微信登录</text>
        </view>
      </view>

      <view class="guest-entry" @click="guestLogin">
        <text>先逛逛 ></text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()

const phone = ref('')
const password = ref('')
const showPassword = ref(false)
const isRegister = ref(false)

const handleLogin = async () => {
  if (!phone.value || !password.value) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }

  if (phone.value.length !== 11) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  try {
    if (isRegister.value) {
      await userStore.register(phone.value, password.value)
    } else {
      await userStore.login(phone.value, password.value)
    }
    
    uni.showToast({ title: isRegister.value ? '注册成功' : '登录成功', icon: 'success' })
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 1500)
  } catch (error) {
    console.error(error)
  }
}

const wechatLogin = async () => {
  uni.showToast({ title: '微信登录功能开发中', icon: 'none' })
}

const guestLogin = () => {
  uni.switchTab({ url: '/pages/index/index' })
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #4CAF50, #8BC34A);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.login-card {
  width: 100%;
  background: #fff;
  border-radius: 30rpx;
  padding: 50rpx 40rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.1);
}

.logo-section {
  text-align: center;
  margin-bottom: 50rpx;
}

.logo {
  font-size: 100rpx;
  display: block;
  margin-bottom: 20rpx;
}

.app-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.app-slogan {
  font-size: 26rpx;
  color: #999;
}

.form-section {
  margin-bottom: 40rpx;
}

.form-item {
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #eee;
  padding: 25rpx 0;
}

.form-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.form-input {
  flex: 1;
  font-size: 30rpx;
}

.toggle-password {
  font-size: 32rpx;
  padding: 10rpx;
}

.login-btn {
  background: linear-gradient(135deg, #4CAF50, #8BC34A);
  text-align: center;
  padding: 30rpx 0;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 25rpx;
}

.switch-mode {
  text-align: center;
  margin-bottom: 40rpx;
}

.switch-mode text {
  font-size: 26rpx;
  color: #4CAF50;
}

.divider {
  text-align: center;
  position: relative;
  margin-bottom: 40rpx;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 30%;
  height: 1rpx;
  background: #eee;
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.divider text {
  font-size: 24rpx;
  color: #999;
  background: #fff;
  padding: 0 20rpx;
}

.other-login {
  display: flex;
  justify-content: center;
  margin-bottom: 30rpx;
}

.login-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 40rpx;
}

.login-icon {
  font-size: 60rpx;
  margin-bottom: 10rpx;
}

.login-text {
  font-size: 24rpx;
  color: #666;
}

.guest-entry {
  text-align: center;
}

.guest-entry text {
  font-size: 26rpx;
  color: #999;
}
</style>
