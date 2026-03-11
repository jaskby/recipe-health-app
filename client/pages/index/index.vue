<template>
  <view class="container">
    <view class="header">
      <view class="greeting">
        <text class="greeting-text">{{ greeting }}</text>
        <text class="nickname">{{ userInfo?.nickname || '用户' }}</text>
      </view>
      <view class="location" @click="showLocationPicker = true">
        <text class="iconfont">📍</text>
        <text>{{ currentRegion }}</text>
      </view>
    </view>

    <view class="quick-actions">
      <view class="action-item" @click="goTo('/pages/recipe/random')">
        <view class="action-icon">🎲</view>
        <text class="action-text">随机推荐</text>
      </view>
      <view class="action-item" @click="goTo('/pages/recipe/recommend')">
        <view class="action-icon">🍽️</view>
        <text class="action-text">每日食谱</text>
      </view>
      <view class="action-item" @click="goTo('/pages/diet-plan/create')">
        <view class="action-icon">📋</view>
        <text class="action-text">减肥计划</text>
      </view>
      <view class="action-item" @click="goTo('/pages/weight/record')">
        <view class="action-icon">⚖️</view>
        <text class="action-text">记录体重</text>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">今日食材价格波动</text>
        <text class="section-more" @click="goTo('/pages/ingredients/ingredients')">查看全部 ></text>
      </view>
      
      <view class="price-changes">
        <view class="change-card rising">
          <view class="change-header">
            <text class="change-title">📈 涨幅榜</text>
          </view>
          <view class="change-list">
            <view class="change-item" v-for="item in topChanges.rising.slice(0, 3)" :key="item.id">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-change text-danger">+{{ item.change_percent }}%</text>
            </view>
            <view class="empty-tip" v-if="topChanges.rising.length === 0">暂无数据</view>
          </view>
        </view>
        
        <view class="change-card falling">
          <view class="change-header">
            <text class="change-title">📉 跌幅榜</text>
          </view>
          <view class="change-list">
            <view class="change-item" v-for="item in topChanges.falling.slice(0, 3)" :key="item.id">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-change text-success">{{ item.change_percent }}%</text>
            </view>
            <view class="empty-tip" v-if="topChanges.falling.length === 0">暂无数据</view>
          </view>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">推荐食谱</text>
        <text class="section-more" @click="goTo('/pages/recipe/recommend')">更多 ></text>
      </view>
      
      <scroll-view scroll-x class="recipe-scroll">
        <view class="recipe-cards">
          <view class="recipe-card" v-for="recipe in recommendRecipes" :key="recipe.id" @click="goToRecipe(recipe.id)">
            <image class="recipe-image" :src="recipe.image || '/static/default-food.png'" mode="aspectFill"></image>
            <view class="recipe-info">
              <text class="recipe-name">{{ recipe.name }}</text>
              <view class="recipe-meta">
                <text class="recipe-cal">{{ recipe.calories }}kcal</text>
                <text class="recipe-time">{{ recipe.cooking_time }}分钟</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="section" v-if="activePlan">
      <view class="section-header">
        <text class="section-title">进行中的减肥计划</text>
        <text class="section-more" @click="goTo('/pages/diet-plan/list')">查看 ></text>
      </view>
      
      <view class="plan-card" @click="goTo(`/pages/diet-plan/detail?id=${activePlan.id}`)">
        <view class="plan-progress">
          <view class="progress-info">
            <text class="progress-label">目标进度</text>
            <text class="progress-value">{{ planProgress }}%</text>
          </view>
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: planProgress + '%' }"></view>
          </view>
        </view>
        <view class="plan-stats">
          <view class="stat-item">
            <text class="stat-value">{{ activePlan.start_weight }}kg</text>
            <text class="stat-label">起始体重</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ activePlan.target_weight }}kg</text>
            <text class="stat-label">目标体重</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ activePlan.total_days }}天</text>
            <text class="stat-label">计划周期</text>
          </view>
        </view>
      </view>
    </view>

    <view class="section" v-if="todayWeight">
      <view class="section-header">
        <text class="section-title">今日体重</text>
      </view>
      
      <view class="weight-card">
        <text class="weight-value">{{ todayWeight.weight }}</text>
        <text class="weight-unit">kg</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import { useIngredientStore } from '../../stores/ingredient'
import { useRecipeStore } from '../../stores/recipe'
import { useDietPlanStore } from '../../stores/dietPlan'
import { useWeightStore } from '../../stores/weight'
import api from '../../utils/request'

const userStore = useUserStore()
const ingredientStore = useIngredientStore()
const recipeStore = useRecipeStore()
const dietPlanStore = useDietPlanStore()
const weightStore = useWeightStore()

const currentRegion = ref('北京')
const showLocationPicker = ref(false)
const recommendRecipes = ref([])
const activePlan = ref(null)
const todayWeight = ref(null)

const userInfo = computed(() => userStore.userInfo)
const topChanges = computed(() => ingredientStore.topChanges)

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  if (hour < 22) return '晚上好'
  return '夜深了'
})

const planProgress = computed(() => {
  if (!activePlan.value) return 0
  const startDate = new Date(activePlan.value.start_date)
  const today = new Date()
  const totalDays = activePlan.value.total_days
  const passedDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24))
  return Math.min(Math.round((passedDays / totalDays) * 100), 100)
})

const goTo = (url) => {
  uni.navigateTo({ url })
}

const goToRecipe = (id) => {
  uni.navigateTo({ url: `/pages/recipe/detail?id=${id}` })
}

const loadData = async () => {
  try {
    await ingredientStore.fetchTopChanges(currentRegion.value)
    
    const recipesRes = await api.get('/recipes/list', { limit: 5 })
    recommendRecipes.value = recipesRes
    
    if (userStore.token) {
      const statsRes = await api.get('/users/stats')
      activePlan.value = statsRes.active_plan
      
      const todayRes = await api.get('/weight/today')
      todayWeight.value = todayRes
    }
  } catch (error) {
    console.error('加载数据失败', error)
  }
}

onMounted(() => {
  loadData()
})

uni.onPullDownRefresh(() => {
  loadData().finally(() => {
    uni.stopPullDownRefresh()
  })
})
</script>

<style scoped>
.container {
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.greeting-text {
  font-size: 32rpx;
  color: #333;
}

.nickname {
  font-size: 32rpx;
  font-weight: bold;
  color: #4CAF50;
  margin-left: 10rpx;
}

.location {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #666;
}

.quick-actions {
  display: flex;
  justify-content: space-between;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.action-icon {
  font-size: 48rpx;
  margin-bottom: 10rpx;
}

.action-text {
  font-size: 24rpx;
  color: #666;
}

.section {
  margin-bottom: 30rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.section-more {
  font-size: 26rpx;
  color: #999;
}

.price-changes {
  display: flex;
  gap: 20rpx;
}

.change-card {
  flex: 1;
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.change-header {
  margin-bottom: 15rpx;
}

.change-title {
  font-size: 28rpx;
  font-weight: bold;
}

.change-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.change-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-name {
  font-size: 26rpx;
  color: #333;
}

.item-change {
  font-size: 26rpx;
  font-weight: bold;
}

.empty-tip {
  font-size: 24rpx;
  color: #999;
  text-align: center;
  padding: 20rpx 0;
}

.recipe-scroll {
  white-space: nowrap;
}

.recipe-cards {
  display: inline-flex;
  gap: 20rpx;
}

.recipe-card {
  width: 280rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.recipe-image {
  width: 280rpx;
  height: 180rpx;
  background: #f5f5f5;
}

.recipe-info {
  padding: 15rpx;
}

.recipe-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recipe-meta {
  display: flex;
  gap: 15rpx;
}

.recipe-cal, .recipe-time {
  font-size: 22rpx;
  color: #999;
}

.plan-card {
  background: linear-gradient(135deg, #4CAF50, #8BC34A);
  border-radius: 16rpx;
  padding: 25rpx;
  color: #fff;
}

.plan-progress {
  margin-bottom: 20rpx;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.progress-label {
  font-size: 26rpx;
}

.progress-value {
  font-size: 26rpx;
  font-weight: bold;
}

.progress-bar {
  height: 12rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #fff;
  border-radius: 6rpx;
  transition: width 0.3s;
}

.plan-stats {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 5rpx;
}

.stat-label {
  font-size: 22rpx;
  opacity: 0.8;
}

.weight-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
  text-align: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.weight-value {
  font-size: 72rpx;
  font-weight: bold;
  color: #4CAF50;
}

.weight-unit {
  font-size: 28rpx;
  color: #666;
  margin-left: 10rpx;
}
</style>
