<template>
  <view class="container">
    <view class="header-card">
      <view class="header-title">
        <text class="title">今日食谱推荐</text>
        <text class="subtitle">根据您的健康数据智能推荐</text>
      </view>
      <view class="refresh-btn" @click="generateMenu">
        <text>🔄 换一批</text>
      </view>
    </view>

    <view class="calories-setting" v-if="showSetting">
      <view class="setting-item">
        <text class="setting-label">目标热量 (kcal)</text>
        <input class="setting-input" type="number" v-model="targetCalories" placeholder="2000" />
      </view>
      <view class="setting-actions">
        <view class="btn-cancel" @click="showSetting = false">取消</view>
        <view class="btn-confirm" @click="confirmSetting">确定</view>
      </view>
    </view>

    <view class="menu-summary" v-if="dailyMenu">
      <view class="summary-item">
        <text class="summary-label">总热量</text>
        <text class="summary-value">{{ dailyMenu.total_calories || 0 }}kcal</text>
      </view>
      <view class="summary-divider"></view>
      <view class="summary-item" @click="showSetting = true">
        <text class="summary-label">目标热量</text>
        <text class="summary-value">{{ targetCalories }}kcal</text>
      </view>
    </view>

    <view class="loading" v-if="loading">
      <text>正在生成食谱...</text>
    </view>

    <view class="meals-container" v-if="dailyMenu && !loading">
      <view class="meal-section" v-if="dailyMenu.breakfast">
        <view class="meal-header">
          <text class="meal-icon">🌅</text>
          <text class="meal-title">早餐</text>
          <text class="meal-cal">{{ dailyMenu.breakfast.calories }}kcal</text>
        </view>
        <recipe-card :recipe="dailyMenu.breakfast" @click="goToDetail(dailyMenu.breakfast.id)" />
      </view>

      <view class="meal-section" v-if="dailyMenu.lunch">
        <view class="meal-header">
          <text class="meal-icon">☀️</text>
          <text class="meal-title">午餐</text>
          <text class="meal-cal">{{ dailyMenu.lunch.calories }}kcal</text>
        </view>
        <recipe-card :recipe="dailyMenu.lunch" @click="goToDetail(dailyMenu.lunch.id)" />
      </view>

      <view class="meal-section" v-if="dailyMenu.dinner">
        <view class="meal-header">
          <text class="meal-icon">🌙</text>
          <text class="meal-title">晚餐</text>
          <text class="meal-cal">{{ dailyMenu.dinner.calories }}kcal</text>
        </view>
        <recipe-card :recipe="dailyMenu.dinner" @click="goToDetail(dailyMenu.dinner.id)" />
      </view>
    </view>

    <view class="empty-state" v-if="!dailyMenu && !loading">
      <text>点击上方"换一批"生成食谱</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRecipeStore } from '../../stores/recipe'
import { useUserStore } from '../../stores/user'

const recipeStore = useRecipeStore()
const userStore = useUserStore()

const dailyMenu = ref(null)
const loading = ref(false)
const targetCalories = ref(2000)
const showSetting = ref(false)

const generateMenu = async () => {
  loading.value = true
  try {
    const res = await recipeStore.generateDailyMenu({
      calories_target: targetCalories.value
    })
    dailyMenu.value = res
  } finally {
    loading.value = false
  }
}

const confirmSetting = () => {
  showSetting.value = false
  generateMenu()
}

const goToDetail = (id) => {
  uni.navigateTo({ url: `/pages/recipe/detail?id=${id}` })
}

onMounted(() => {
  const userInfo = userStore.userInfo
  if (userInfo?.height && userInfo?.weight) {
    const bmr = userInfo.gender === 'male'
      ? 88.362 + (13.397 * userInfo.weight) + (4.799 * userInfo.height) - (5.677 * (userInfo.age || 25))
      : 447.593 + (9.247 * userInfo.weight) + (3.098 * userInfo.height) - (4.330 * (userInfo.age || 25))
    
    const activityFactors = { sedentary: 1.2, light: 1.375, moderate: 1.55, heavy: 1.725 }
    const factor = activityFactors[userInfo.activity_level] || 1.55
    targetCalories.value = Math.round(bmr * factor)
  }
  
  generateMenu()
})

uni.onPullDownRefresh(() => {
  generateMenu().finally(() => {
    uni.stopPullDownRefresh()
  })
})
</script>

<style scoped>
.container {
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.header-card {
  background: linear-gradient(135deg, #4CAF50, #8BC34A);
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.header-title {
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.subtitle {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.2);
  padding: 15rpx 30rpx;
  border-radius: 30rpx;
  color: #fff;
  font-size: 26rpx;
}

.calories-setting {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.setting-label {
  font-size: 28rpx;
  color: #333;
}

.setting-input {
  width: 200rpx;
  height: 60rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  text-align: center;
  font-size: 28rpx;
}

.setting-actions {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
}

.btn-cancel, .btn-confirm {
  padding: 15rpx 40rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-confirm {
  background: #4CAF50;
  color: #fff;
}

.menu-summary {
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.summary-item {
  text-align: center;
}

.summary-label {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.summary-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #4CAF50;
}

.summary-divider {
  width: 1rpx;
  height: 50rpx;
  background: #eee;
}

.loading {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
}

.meals-container {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.meal-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.meal-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.meal-icon {
  font-size: 36rpx;
  margin-right: 15rpx;
}

.meal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.meal-cal {
  font-size: 26rpx;
  color: #4CAF50;
  background: #E8F5E9;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
}
</style>
