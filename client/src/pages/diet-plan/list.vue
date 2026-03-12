<template>
  <view class="container">
    <view class="empty-state" v-if="plans.length === 0 && !loading">
      <text class="empty-icon">📋</text>
      <text class="empty-text">暂无减肥计划</text>
      <view class="empty-btn" @click="goToCreate">创建计划</view>
    </view>

    <view class="plan-list" v-else>
      <view class="plan-item" v-for="plan in plans" :key="plan.id" @click="goToDetail(plan.id)">
        <view class="plan-status" :class="plan.status">
          {{ getStatusText(plan.status) }}
        </view>
        <view class="plan-info">
          <view class="plan-main">
            <text class="plan-weight">{{ plan.start_weight }}kg → {{ plan.target_weight }}kg</text>
            <text class="plan-days">{{ plan.total_days }}天</text>
          </view>
          <view class="plan-meta">
            <text class="meta-item">{{ plan.start_date }}</text>
            <text class="meta-item">¥{{ plan.total_cost }}</text>
          </view>
        </view>
        <view class="plan-arrow">></view>
      </view>
    </view>

    <view class="fab" @click="goToCreate">
      <text>+</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDietPlanStore } from '../../stores/dietPlan'

const dietPlanStore = useDietPlanStore()

const plans = ref([])
const loading = ref(false)

const loadPlans = async () => {
  loading.value = true
  try {
    const res = await dietPlanStore.fetchPlans()
    plans.value = res
  } finally {
    loading.value = false
  }
}

const getStatusText = (status) => {
  const texts = {
    active: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return texts[status] || status
}

const goToCreate = () => {
  uni.navigateTo({ url: '/pages/diet-plan/create' })
}

const goToDetail = (id) => {
  uni.navigateTo({ url: `/pages/diet-plan/detail?id=${id}` })
}

onMounted(() => {
  loadPlans()
})

uni.onPullDownRefresh(() => {
  loadPlans().finally(() => {
    uni.stopPullDownRefresh()
  })
})
</script>

<style scoped>
.container {
  padding: 20rpx;
  min-height: 100vh;
  background: #f5f5f5;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 150rpx 0;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 30rpx;
}

.empty-btn {
  background: #4CAF50;
  color: #fff;
  padding: 20rpx 60rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.plan-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.plan-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
  display: flex;
  align-items: center;
}

.plan-status {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  margin-right: 20rpx;
}

.plan-status.active {
  background: #E8F5E9;
  color: #4CAF50;
}

.plan-status.completed {
  background: #E3F2FD;
  color: #2196F3;
}

.plan-status.cancelled {
  background: #FFEBEE;
  color: #f44336;
}

.plan-info {
  flex: 1;
}

.plan-main {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.plan-weight {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.plan-days {
  font-size: 26rpx;
  color: #666;
}

.plan-meta {
  display: flex;
  gap: 20rpx;
}

.meta-item {
  font-size: 24rpx;
  color: #999;
}

.plan-arrow {
  font-size: 28rpx;
  color: #ccc;
  margin-left: 15rpx;
}

.fab {
  position: fixed;
  right: 40rpx;
  bottom: 140rpx;
  width: 100rpx;
  height: 100rpx;
  background: #4CAF50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(76, 175, 80, 0.4);
}

.fab text {
  font-size: 48rpx;
  color: #fff;
}
</style>
