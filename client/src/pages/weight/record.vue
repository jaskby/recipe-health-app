<template>
  <view class="container">
    <view class="record-card">
      <view class="record-header">
        <text class="record-title">今日体重</text>
        <text class="record-date">{{ todayDate }}</text>
      </view>

      <view class="weight-input-section">
        <input 
          class="weight-input" 
          type="digit" 
          v-model="weight" 
          placeholder="0.0"
          :maxlength="5"
        />
        <text class="weight-unit">kg</text>
      </view>

      <view class="quick-input">
        <view class="quick-btn" v-for="delta in [-0.5, -0.2, 0, 0.2, 0.5]" :key="delta" @click="quickInput(delta)">
          <text>{{ delta > 0 ? '+' : '' }}{{ delta }}</text>
        </view>
      </view>

      <view class="note-section">
        <text class="note-label">备注</text>
        <textarea class="note-input" v-model="note" placeholder="选填，记录今日状态..." maxlength="100"></textarea>
      </view>

      <view class="submit-btn" @click="submitWeight">
        <text>记录体重</text>
      </view>
    </view>

    <view class="history-section">
      <view class="section-header">
        <text class="section-title">最近记录</text>
        <text class="section-more" @click="goToHistory">查看全部 ></text>
      </view>

      <view class="history-list">
        <view class="history-item" v-for="record in recentRecords" :key="record.id">
          <view class="history-date">
            <text class="date-day">{{ formatDay(record.record_date) }}</text>
            <text class="date-full">{{ record.record_date }}</text>
          </view>
          <view class="history-weight">
            <text class="weight-value">{{ record.weight }}</text>
            <text class="weight-unit">kg</text>
          </view>
        </view>
      </view>
    </view>

    <view class="stats-card" v-if="stats">
      <view class="stats-title">数据统计</view>
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-value">{{ stats.count }}</text>
          <text class="stat-label">记录天数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.max }}</text>
          <text class="stat-label">最高(kg)</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.min }}</text>
          <text class="stat-label">最低(kg)</text>
        </view>
        <view class="stat-item">
          <text class="stat-value" :class="parseFloat(stats.change) > 0 ? 'text-danger' : 'text-success'">
            {{ stats.change > 0 ? '+' : '' }}{{ stats.change }}
          </text>
          <text class="stat-label">变化(kg)</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWeightStore } from '../../stores/weight'
import { useUserStore } from '../../stores/user'
import dayjs from 'dayjs'

const weightStore = useWeightStore()
const userStore = useUserStore()

const weight = ref('')
const note = ref('')
const recentRecords = ref([])
const stats = ref(null)

const todayDate = computed(() => dayjs().format('YYYY年MM月DD日'))

const formatDay = (date) => {
  const d = dayjs(date)
  const today = dayjs()
  if (d.isSame(today, 'day')) return '今天'
  if (d.isSame(today.subtract(1, 'day'), 'day')) return '昨天'
  return d.format('MM/DD')
}

const quickInput = (delta) => {
  const current = parseFloat(weight.value) || userStore.userInfo?.weight || 60
  weight.value = (current + delta).toFixed(1)
}

const submitWeight = async () => {
  if (!weight.value) {
    uni.showToast({ title: '请输入体重', icon: 'none' })
    return
  }

  if (!userStore.token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  try {
    await weightStore.recordWeight({
      weight: parseFloat(weight.value),
      note: note.value
    })
    
    uni.showToast({ title: '记录成功', icon: 'success' })
    weight.value = ''
    note.value = ''
    loadData()
  } catch (error) {
    console.error(error)
  }
}

const goToHistory = () => {
  uni.navigateTo({ url: '/pages/weight/history' })
}

const loadData = async () => {
  if (!userStore.token) return
  
  try {
    const res = await weightStore.fetchHistory(7)
    recentRecords.value = res.records.slice(0, 5)
    stats.value = res.stats
    
    const todayRes = await weightStore.fetchToday()
    if (todayRes) {
      weight.value = todayRes.weight.toString()
      note.value = todayRes.note || ''
    }
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.container {
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.record-card {
  background: linear-gradient(135deg, #4CAF50, #8BC34A);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.record-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.record-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}

.record-date {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.weight-input-section {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 30rpx;
}

.weight-input {
  width: 300rpx;
  font-size: 80rpx;
  font-weight: bold;
  color: #fff;
  text-align: right;
  background: transparent;
}

.weight-unit {
  font-size: 36rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-left: 15rpx;
}

.quick-input {
  display: flex;
  justify-content: center;
  gap: 15rpx;
  margin-bottom: 30rpx;
}

.quick-btn {
  background: rgba(255, 255, 255, 0.2);
  padding: 15rpx 25rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #fff;
}

.note-section {
  margin-bottom: 25rpx;
}

.note-label {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 10rpx;
  display: block;
}

.note-input {
  width: 100%;
  height: 100rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12rpx;
  padding: 15rpx;
  font-size: 26rpx;
  color: #fff;
  box-sizing: border-box;
}

.submit-btn {
  background: #fff;
  text-align: center;
  padding: 25rpx 0;
  border-radius: 40rpx;
  font-size: 30rpx;
  font-weight: bold;
  color: #4CAF50;
}

.history-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
  margin-bottom: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.section-more {
  font-size: 26rpx;
  color: #999;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.history-item:last-child {
  border-bottom: none;
}

.history-date {
  display: flex;
  flex-direction: column;
}

.date-day {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.date-full {
  font-size: 22rpx;
  color: #999;
}

.history-weight {
  display: flex;
  align-items: baseline;
}

.weight-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #4CAF50;
}

.weight-unit {
  font-size: 22rpx;
  color: #999;
  margin-left: 5rpx;
}

.stats-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
}

.stats-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 22rpx;
  color: #999;
}

.text-danger {
  color: #f44336 !important;
}

.text-success {
  color: #4CAF50 !important;
}
</style>
