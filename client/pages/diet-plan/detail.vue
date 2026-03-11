<template>
  <view class="container">
    <view class="plan-header">
      <view class="progress-ring">
        <view class="progress-value">{{ progress }}%</view>
        <text class="progress-label">完成进度</text>
      </view>
      <view class="plan-stats">
        <view class="stat-item">
          <text class="stat-value">{{ plan.start_weight }}kg</text>
          <text class="stat-label">起始体重</text>
        </view>
        <view class="stat-arrow">→</view>
        <view class="stat-item">
          <text class="stat-value">{{ plan.target_weight }}kg</text>
          <text class="stat-label">目标体重</text>
        </view>
      </view>
    </view>

    <view class="info-cards">
      <view class="info-card">
        <text class="info-value">{{ plan.total_days }}</text>
        <text class="info-label">计划天数</text>
      </view>
      <view class="info-card">
        <text class="info-value">{{ passedDays }}</text>
        <text class="info-label">已进行</text>
      </view>
      <view class="info-card">
        <text class="info-value">¥{{ plan.total_cost }}</text>
        <text class="info-label">预估花费</text>
      </view>
    </view>

    <view class="date-tabs">
      <scroll-view scroll-x class="date-scroll">
        <view class="date-list">
          <view 
            class="date-item" 
            v-for="(day, index) in displayDays" 
            :key="index"
            :class="{ active: selectedDay === day.day, today: isToday(day.day) }"
            @click="selectDay(day.day)"
          >
            <text class="date-num">第{{ day.day }}天</text>
            <text class="date-text">{{ day.dateStr }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="meals-section" v-if="selectedDayMeals">
      <view class="meals-summary">
        <text class="summary-item">热量: {{ selectedDayMeals.total_calories }}kcal</text>
        <text class="summary-item">花费: ¥{{ selectedDayMeals.total_cost.toFixed(2) }}</text>
      </view>

      <view class="meal-card" v-for="meal in selectedDayMeals.meals" :key="meal.id">
        <view class="meal-header">
          <text class="meal-type">{{ getMealTypeText(meal.meal_type) }}</text>
          <text class="meal-cal">{{ meal.calories }}kcal</text>
        </view>
        <view class="meal-content" @click="goToRecipe(meal.recipe_id)">
          <text class="meal-name">{{ meal.recipe_name }}</text>
          <text class="meal-cost">¥{{ meal.meal_cost?.toFixed(2) }}</text>
        </view>
      </view>
    </view>

    <view class="bottom-actions">
      <view class="action-btn cancel" @click="cancelPlan">取消计划</view>
      <view class="action-btn complete" @click="completePlan">完成计划</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDietPlanStore } from '../../stores/dietPlan'
import dayjs from 'dayjs'

const dietPlanStore = useDietPlanStore()

const plan = ref({})
const dailyMeals = ref([])
const selectedDay = ref(1)

const progress = computed(() => {
  if (!plan.value.start_date) return 0
  const startDate = dayjs(plan.value.start_date)
  const today = dayjs()
  const passed = today.diff(startDate, 'day') + 1
  return Math.min(Math.round((passed / plan.value.total_days) * 100), 100)
})

const passedDays = computed(() => {
  if (!plan.value.start_date) return 0
  const startDate = dayjs(plan.value.start_date)
  const today = dayjs()
  return Math.min(today.diff(startDate, 'day') + 1, plan.value.total_days)
})

const displayDays = computed(() => {
  const days = []
  const startDate = dayjs(plan.value.start_date)
  for (let i = 1; i <= plan.value.total_days; i++) {
    days.push({
      day: i,
      dateStr: startDate.add(i - 1, 'day').format('MM/DD')
    })
  }
  return days
})

const selectedDayMeals = computed(() => {
  return dailyMeals.value.find(d => d.day === selectedDay.value)
})

const isToday = (day) => {
  if (!plan.value.start_date) return false
  const startDate = dayjs(plan.value.start_date)
  const dayDate = startDate.add(day - 1, 'day')
  return dayDate.isSame(dayjs(), 'day')
}

const selectDay = (day) => {
  selectedDay.value = day
}

const getMealTypeText = (type) => {
  const types = { breakfast: '🌅 早餐', lunch: '☀️ 午餐', dinner: '🌙 晚餐' }
  return types[type] || type
}

const goToRecipe = (id) => {
  if (id) {
    uni.navigateTo({ url: `/pages/recipe/detail?id=${id}` })
  }
}

const loadPlan = async () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const planId = currentPage.options?.id || currentPage.$page?.options?.id
  
  if (planId) {
    const res = await dietPlanStore.fetchPlanDetail(planId)
    plan.value = res
    dailyMeals.value = res.daily_meals || []
    
    selectedDay.value = Math.min(passedDays.value, plan.value.total_days)
  }
}

const cancelPlan = async () => {
  uni.showModal({
    title: '确认取消',
    content: '确定要取消这个减肥计划吗？',
    success: async (res) => {
      if (res.confirm) {
        await dietPlanStore.cancelPlan(plan.value.id)
        uni.showToast({ title: '已取消', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    }
  })
}

const completePlan = async () => {
  uni.showModal({
    title: '确认完成',
    content: '恭喜达成目标！确定要完成这个减肥计划吗？',
    success: async (res) => {
      if (res.confirm) {
        await dietPlanStore.completePlan(plan.value.id)
        uni.showToast({ title: '恭喜完成！', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    }
  })
}

onMounted(() => {
  loadPlan()
})
</script>

<style scoped>
.container {
  padding: 20rpx;
  padding-bottom: 140rpx;
  min-height: 100vh;
  background: #f5f5f5;
}

.plan-header {
  background: linear-gradient(135deg, #4CAF50, #8BC34A);
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.progress-ring {
  width: 140rpx;
  height: 140rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
}

.progress-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.progress-label {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.8);
}

.plan-stats {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}

.stat-arrow {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.6);
}

.info-cards {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
  margin-bottom: 20rpx;
}

.info-card {
  flex: 1;
  text-align: center;
}

.info-value {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #4CAF50;
  margin-bottom: 8rpx;
}

.info-label {
  font-size: 24rpx;
  color: #999;
}

.date-tabs {
  background: #fff;
  border-radius: 16rpx;
  padding: 15rpx;
  margin-bottom: 20rpx;
}

.date-scroll {
  white-space: nowrap;
}

.date-list {
  display: inline-flex;
  gap: 10rpx;
}

.date-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 15rpx 20rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
  min-width: 100rpx;
}

.date-item.active {
  background: #4CAF50;
}

.date-item.today {
  border: 2rpx solid #4CAF50;
}

.date-item.active.today {
  border: none;
}

.date-num {
  font-size: 24rpx;
  color: #333;
}

.date-item.active .date-num {
  color: #fff;
}

.date-text {
  font-size: 22rpx;
  color: #999;
  margin-top: 5rpx;
}

.date-item.active .date-text {
  color: rgba(255, 255, 255, 0.8);
}

.meals-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
}

.meals-summary {
  display: flex;
  gap: 30rpx;
  margin-bottom: 20rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.summary-item {
  font-size: 26rpx;
  color: #666;
}

.meal-card {
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 15rpx;
}

.meal-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.meal-type {
  font-size: 26rpx;
  color: #333;
}

.meal-cal {
  font-size: 24rpx;
  color: #4CAF50;
}

.meal-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meal-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
}

.meal-cost {
  font-size: 26rpx;
  color: #f44336;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 30rpx;
  display: flex;
  gap: 20rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.action-btn {
  flex: 1;
  text-align: center;
  padding: 25rpx 0;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.action-btn.cancel {
  background: #f5f5f5;
  color: #666;
}

.action-btn.complete {
  background: #4CAF50;
  color: #fff;
}
</style>
