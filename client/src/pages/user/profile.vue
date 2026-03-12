<template>
  <view class="container">
    <view class="user-header" v-if="userInfo">
      <view class="avatar-section">
        <image class="avatar" :src="userInfo.avatar || '/static/default-avatar.png'"></image>
        <text class="nickname">{{ userInfo.nickname || '未设置昵称' }}</text>
      </view>
    </view>

    <view class="login-prompt" v-else>
      <text class="prompt-text">登录后查看个人信息</text>
      <view class="login-btn" @click="goToLogin">立即登录</view>
    </view>

    <view class="stats-card" v-if="userInfo">
      <view class="stat-item" @click="goTo('/pages/weight/history')">
        <text class="stat-value">{{ userStats.weight_record_days || 0 }}</text>
        <text class="stat-label">记录天数</text>
      </view>
      <view class="stat-item" @click="goTo('/pages/diet-plan/list')">
        <text class="stat-value">{{ userStats.completed_plans || 0 }}</text>
        <text class="stat-label">完成计划</text>
      </view>
      <view class="stat-item" @click="goTo('/pages/user/favorites')">
        <text class="stat-value">{{ userStats.favorite_recipes || 0 }}</text>
        <text class="stat-label">收藏食谱</text>
      </view>
    </view>

    <view class="menu-section" v-if="userInfo">
      <view class="menu-item" @click="goTo('/pages/user/preferences')">
        <text class="menu-icon">🍽️</text>
        <text class="menu-text">饮食偏好</text>
        <text class="menu-arrow">></text>
      </view>
      <view class="menu-item" @click="goTo('/pages/diet-plan/list')">
        <text class="menu-icon">📋</text>
        <text class="menu-text">我的减肥计划</text>
        <text class="menu-arrow">></text>
      </view>
      <view class="menu-item" @click="goTo('/pages/user/favorites')">
        <text class="menu-icon">❤️</text>
        <text class="menu-text">我的收藏</text>
        <text class="menu-arrow">></text>
      </view>
      <view class="menu-item" @click="goTo('/pages/weight/history')">
        <text class="menu-icon">⚖️</text>
        <text class="menu-text">体重记录</text>
        <text class="menu-arrow">></text>
      </view>
    </view>

    <view class="info-section" v-if="userInfo">
      <view class="section-title">健康信息</view>
      <view class="info-list">
        <view class="info-item">
          <text class="info-label">身高</text>
          <text class="info-value">{{ userInfo.height || '-' }} cm</text>
        </view>
        <view class="info-item">
          <text class="info-label">体重</text>
          <text class="info-value">{{ userInfo.weight || '-' }} kg</text>
        </view>
        <view class="info-item">
          <text class="info-label">目标体重</text>
          <text class="info-value">{{ userInfo.target_weight || '-' }} kg</text>
        </view>
        <view class="info-item">
          <text class="info-label">活动量</text>
          <text class="info-value">{{ getActivityText(userInfo.activity_level) }}</text>
        </view>
      </view>
      <view class="edit-btn" @click="showEditModal = true">编辑信息</view>
    </view>

    <view class="logout-btn" v-if="userInfo" @click="logout">
      <text>退出登录</text>
    </view>

    <uni-popup ref="editPopup" type="bottom">
      <view class="edit-modal">
        <view class="modal-header">
          <text class="modal-title">编辑健康信息</text>
          <text class="modal-close" @click="closeEditModal">×</text>
        </view>
        <view class="modal-body">
          <view class="edit-item">
            <text class="edit-label">昵称</text>
            <input class="edit-input" v-model="editForm.nickname" placeholder="请输入昵称" />
          </view>
          <view class="edit-item">
            <text class="edit-label">身高</text>
            <input class="edit-input" type="digit" v-model="editForm.height" placeholder="请输入身高" />
          </view>
          <view class="edit-item">
            <text class="edit-label">体重</text>
            <input class="edit-input" type="digit" v-model="editForm.weight" placeholder="请输入体重" />
          </view>
          <view class="edit-item">
            <text class="edit-label">目标体重</text>
            <input class="edit-input" type="digit" v-model="editForm.target_weight" placeholder="请输入目标体重" />
          </view>
          <view class="edit-item">
            <text class="edit-label">活动量</text>
            <picker :value="activityIndex" :range="activityOptions" range-key="label" @change="onActivityChange">
              <view class="edit-picker">
                <text>{{ activityOptions[activityIndex].label }}</text>
                <text class="picker-arrow">></text>
              </view>
            </picker>
          </view>
        </view>
        <view class="modal-footer">
          <view class="save-btn" @click="saveProfile">保存</view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import api from '../../utils/request'

const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo)
const userStats = ref({})
const showEditModal = ref(false)
const editPopup = ref(null)

const activityOptions = [
  { value: 'sedentary', label: '久坐不动' },
  { value: 'light', label: '轻度活动' },
  { value: 'moderate', label: '中度活动' },
  { value: 'heavy', label: '重度活动' }
]

const activityIndex = ref(2)

const editForm = reactive({
  nickname: '',
  height: '',
  weight: '',
  target_weight: '',
  activity_level: 'moderate'
})

const getActivityText = (level) => {
  const option = activityOptions.find(o => o.value === level)
  return option ? option.label : '中度活动'
}

const goTo = (url) => {
  uni.navigateTo({ url })
}

const goToLogin = () => {
  uni.navigateTo({ url: '/pages/login/login' })
}

const loadStats = async () => {
  if (!userStore.token) return
  try {
    const res = await api.get('/users/stats')
    userStats.value = res
  } catch (error) {
    console.error(error)
  }
}

const openEditModal = () => {
  editForm.nickname = userInfo.value?.nickname || ''
  editForm.height = userInfo.value?.height || ''
  editForm.weight = userInfo.value?.weight || ''
  editForm.target_weight = userInfo.value?.target_weight || ''
  editForm.activity_level = userInfo.value?.activity_level || 'moderate'
  activityIndex.value = activityOptions.findIndex(o => o.value === editForm.activity_level)
  editPopup.value.open()
}

const closeEditModal = () => {
  editPopup.value.close()
}

const onActivityChange = (e) => {
  activityIndex.value = e.detail.value
  editForm.activity_level = activityOptions[activityIndex.value].value
}

const saveProfile = async () => {
  try {
    await userStore.updateProfile({
      nickname: editForm.nickname,
      height: editForm.height ? parseFloat(editForm.height) : null,
      weight: editForm.weight ? parseFloat(editForm.weight) : null,
      target_weight: editForm.target_weight ? parseFloat(editForm.target_weight) : null,
      activity_level: editForm.activity_level
    })
    
    uni.showToast({ title: '保存成功', icon: 'success' })
    closeEditModal()
    loadStats()
  } catch (error) {
    console.error(error)
  }
}

const logout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.showToast({ title: '已退出登录', icon: 'success' })
      }
    }
  })
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.container {
  padding: 20rpx;
  padding-bottom: 120rpx;
  min-height: 100vh;
  background: #f5f5f5;
}

.user-header {
  background: linear-gradient(135deg, #4CAF50, #8BC34A);
  border-radius: 20rpx;
  padding: 40rpx;
  display: flex;
  justify-content: center;
  margin-bottom: 20rpx;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  border: 4rpx solid #fff;
  margin-bottom: 15rpx;
}

.nickname {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}

.login-prompt {
  background: #fff;
  border-radius: 20rpx;
  padding: 60rpx;
  text-align: center;
  margin-bottom: 20rpx;
}

.prompt-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 20rpx;
  display: block;
}

.login-btn {
  background: #4CAF50;
  color: #fff;
  padding: 20rpx 60rpx;
  border-radius: 40rpx;
  display: inline-block;
  font-size: 28rpx;
}

.stats-card {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #4CAF50;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
}

.menu-section {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.menu-text {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.menu-arrow {
  font-size: 28rpx;
  color: #ccc;
}

.info-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: #666;
}

.info-value {
  font-size: 28rpx;
  color: #333;
}

.edit-btn {
  background: #4CAF50;
  color: #fff;
  text-align: center;
  padding: 20rpx 0;
  border-radius: 40rpx;
  margin-top: 20rpx;
  font-size: 28rpx;
}

.logout-btn {
  background: #fff;
  text-align: center;
  padding: 30rpx 0;
  border-radius: 16rpx;
  color: #f44336;
  font-size: 30rpx;
}

.edit-modal {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 30rpx;
  max-height: 80vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 48rpx;
  color: #999;
  line-height: 1;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.edit-item {
  display: flex;
  align-items: center;
}

.edit-label {
  width: 160rpx;
  font-size: 28rpx;
  color: #333;
}

.edit-input {
  flex: 1;
  height: 70rpx;
  border: 1rpx solid #ddd;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.edit-picker {
  flex: 1;
  height: 70rpx;
  border: 1rpx solid #ddd;
  border-radius: 12rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 28rpx;
}

.picker-arrow {
  color: #999;
}

.modal-footer {
  margin-top: 30rpx;
}

.save-btn {
  background: #4CAF50;
  color: #fff;
  text-align: center;
  padding: 25rpx 0;
  border-radius: 40rpx;
  font-size: 30rpx;
}
</style>
