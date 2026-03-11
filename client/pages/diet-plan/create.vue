<template>
  <view class="container">
    <view class="form-card">
      <view class="form-header">
        <text class="form-title">创建减肥计划</text>
        <text class="form-subtitle">科学减重，健康生活</text>
      </view>

      <view class="form-body">
        <view class="form-item">
          <text class="form-label">当前体重 (kg)</text>
          <input class="form-input" type="digit" v-model="form.start_weight" placeholder="请输入当前体重" />
        </view>

        <view class="form-item">
          <text class="form-label">目标体重 (kg)</text>
          <input class="form-input" type="digit" v-model="form.target_weight" placeholder="请输入目标体重" />
        </view>

        <view class="form-item">
          <text class="form-label">开始日期</text>
          <picker mode="date" :value="form.start_date" @change="onDateChange">
            <view class="form-picker">
              <text>{{ form.start_date || '请选择日期' }}</text>
              <text class="picker-arrow">></text>
            </view>
          </picker>
        </view>
      </view>

      <view class="preview-section" v-if="previewData">
        <view class="preview-header">
          <text class="preview-title">计划预览</text>
        </view>
        <view class="preview-content">
          <view class="preview-item">
            <text class="preview-label">减重目标</text>
            <text class="preview-value">{{ previewData.weight_to_lose }}kg</text>
          </view>
          <view class="preview-item">
            <text class="preview-label">预计周期</text>
            <text class="preview-value">{{ previewData.total_days }}天</text>
          </view>
          <view class="preview-item">
            <text class="preview-label">结束日期</text>
            <text class="preview-value">{{ previewData.end_date }}</text>
          </view>
          <view class="preview-item">
            <text class="preview-label">每日热量</text>
            <text class="preview-value">{{ previewData.daily_calories }}kcal</text>
          </view>
          <view class="preview-item highlight">
            <text class="preview-label">预估花费</text>
            <text class="preview-value">¥{{ previewData.total_cost }}</text>
          </view>
        </view>
      </view>

      <view class="form-actions">
        <view class="btn-preview" @click="calculatePreview">预览计划</view>
        <view class="btn-submit" @click="createPlan" :class="{ disabled: !previewData }">
          确认创建
        </view>
      </view>
    </view>

    <view class="tips-section">
      <text class="tips-title">💡 健康减重提示</text>
      <view class="tips-list">
        <text class="tips-item">• 每周减重0.5-1kg为健康速度</text>
        <text class="tips-item">• 每日热量缺口建议500kcal</text>
        <text class="tips-item">• 配合适当运动效果更佳</text>
        <text class="tips-item">• 保持规律作息和充足睡眠</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useDietPlanStore } from '../../stores/dietPlan'
import { useUserStore } from '../../stores/user'
import dayjs from 'dayjs'

const dietPlanStore = useDietPlanStore()
const userStore = useUserStore()

const form = reactive({
  start_weight: '',
  target_weight: '',
  start_date: dayjs().format('YYYY-MM-DD')
})

const previewData = ref(null)
const loading = ref(false)

const onDateChange = (e) => {
  form.start_date = e.detail.value
}

const calculatePreview = () => {
  if (!form.start_weight || !form.target_weight) {
    uni.showToast({ title: '请填写体重信息', icon: 'none' })
    return
  }

  if (parseFloat(form.target_weight) >= parseFloat(form.start_weight)) {
    uni.showToast({ title: '目标体重应小于当前体重', icon: 'none' })
    return
  }

  const weightToLose = parseFloat(form.start_weight) - parseFloat(form.target_weight)
  const weeksNeeded = Math.ceil(weightToLose / 0.5)
  const totalDays = weeksNeeded * 7
  const endDate = dayjs(form.start_date).add(totalDays, 'day').format('YYYY-MM-DD')
  
  const userInfo = userStore.userInfo
  let dailyCalories = 1800
  
  if (userInfo?.height && userInfo?.weight) {
    const bmr = userInfo.gender === 'male'
      ? 88.362 + (13.397 * parseFloat(form.start_weight)) + (4.799 * userInfo.height) - (5.677 * (userInfo.age || 25))
      : 447.593 + (9.247 * parseFloat(form.start_weight)) + (3.098 * userInfo.height) - (4.330 * (userInfo.age || 25))
    
    const activityFactors = { sedentary: 1.2, light: 1.375, moderate: 1.55, heavy: 1.725 }
    const factor = activityFactors[userInfo.activity_level] || 1.55
    dailyCalories = Math.max(Math.round(bmr * factor) - 500, 1200)
  }

  const avgDailyCost = 25
  const totalCost = (avgDailyCost * totalDays).toFixed(2)

  previewData.value = {
    weight_to_lose: weightToLose.toFixed(1),
    total_days: totalDays,
    end_date: endDate,
    daily_calories: dailyCalories,
    total_cost: totalCost
  }
}

const createPlan = async () => {
  if (!previewData.value) return
  
  if (!userStore.token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/login/login' })
    }, 1000)
    return
  }

  loading.value = true
  try {
    const res = await dietPlanStore.createPlan({
      start_weight: parseFloat(form.start_weight),
      target_weight: parseFloat(form.target_weight),
      start_date: form.start_date
    })
    
    uni.showToast({ title: '创建成功', icon: 'success' })
    setTimeout(() => {
      uni.redirectTo({ url: `/pages/diet-plan/detail?id=${res.plan.id}` })
    }, 1500)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.container {
  padding: 20rpx;
  min-height: 100vh;
  background: #f5f5f5;
}

.form-card {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.form-header {
  background: linear-gradient(135deg, #4CAF50, #8BC34A);
  padding: 40rpx 30rpx;
}

.form-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  display: block;
  margin-bottom: 10rpx;
}

.form-subtitle {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.form-body {
  padding: 30rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 15rpx;
  display: block;
}

.form-input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #ddd;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.form-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80rpx;
  border: 1rpx solid #ddd;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.picker-arrow {
  color: #999;
}

.preview-section {
  background: #f9f9f9;
  padding: 25rpx 30rpx;
}

.preview-header {
  margin-bottom: 20rpx;
}

.preview-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-item.highlight {
  background: #E8F5E9;
  padding: 15rpx 20rpx;
  border-radius: 12rpx;
  margin-top: 10rpx;
}

.preview-label {
  font-size: 28rpx;
  color: #666;
}

.preview-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.preview-item.highlight .preview-value {
  color: #4CAF50;
  font-size: 32rpx;
}

.form-actions {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 30rpx 30rpx;
}

.btn-preview, .btn-submit {
  flex: 1;
  text-align: center;
  padding: 25rpx 0;
  border-radius: 40rpx;
  font-size: 30rpx;
}

.btn-preview {
  background: #f5f5f5;
  color: #666;
}

.btn-submit {
  background: #4CAF50;
  color: #fff;
}

.btn-submit.disabled {
  background: #ccc;
}

.tips-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
}

.tips-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 15rpx;
  display: block;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.tips-item {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}
</style>
