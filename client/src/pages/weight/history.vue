<template>
  <view class="container">
    <view class="chart-section">
      <view class="chart-header">
        <text class="chart-title">体重变化曲线</text>
        <view class="chart-tabs">
          <view 
            class="tab-item" 
            :class="{ active: days === 7 }"
            @click="changeDays(7)"
          >7天</view>
          <view 
            class="tab-item" 
            :class="{ active: days === 30 }"
            @click="changeDays(30)"
          >30天</view>
          <view 
            class="tab-item" 
            :class="{ active: days === 90 }"
            @click="changeDays(90)"
          >90天</view>
        </view>
      </view>
      
      <view class="chart-container">
        <canvas canvas-id="weightChart" class="weight-chart" @touchstart="onChartTouch"></canvas>
      </view>
    </view>

    <view class="stats-summary" v-if="stats">
      <view class="summary-item">
        <text class="summary-label">起始体重</text>
        <text class="summary-value">{{ stats.first }}kg</text>
      </view>
      <view class="summary-item">
        <text class="summary-label">当前体重</text>
        <text class="summary-value">{{ stats.last }}kg</text>
      </view>
      <view class="summary-item">
        <text class="summary-label">体重变化</text>
        <text class="summary-value" :class="parseFloat(stats.change) > 0 ? 'text-danger' : 'text-success'">
          {{ stats.change > 0 ? '+' : '' }}{{ stats.change }}kg
        </text>
      </view>
    </view>

    <view class="records-section">
      <view class="section-header">
        <text class="section-title">历史记录</text>
      </view>
      
      <view class="records-list">
        <view class="record-item" v-for="record in records" :key="record.id">
          <view class="record-left">
            <text class="record-date">{{ record.record_date }}</text>
            <text class="record-note" v-if="record.note">{{ record.note }}</text>
          </view>
          <view class="record-right">
            <text class="record-weight">{{ record.weight }}kg</text>
          </view>
        </view>
      </view>
      
      <view class="empty-state" v-if="records.length === 0">
        <text>暂无记录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useWeightStore } from '../../stores/weight'

const weightStore = useWeightStore()

const records = ref([])
const stats = ref(null)
const days = ref(30)

const changeDays = async (newDays) => {
  days.value = newDays
  await loadData()
}

const loadData = async () => {
  try {
    const res = await weightStore.fetchHistory(days.value)
    records.value = res.records
    stats.value = res.stats
    
    await nextTick()
    drawChart()
  } catch (error) {
    console.error(error)
  }
}

const drawChart = () => {
  if (records.value.length === 0) return
  
  const ctx = uni.createCanvasContext('weightChart')
  const data = records.value.map(r => r.weight)
  const dates = records.value.map(r => r.record_date.slice(5))
  
  const maxWeight = Math.max(...data) + 1
  const minWeight = Math.min(...data) - 1
  const range = maxWeight - minWeight
  
  const chartWidth = 320
  const chartHeight = 200
  const padding = 30
  
  ctx.setStrokeStyle('#4CAF50')
  ctx.setLineWidth(2)
  
  data.forEach((weight, index) => {
    const x = padding + (index / (data.length - 1)) * (chartWidth - padding * 2)
    const y = chartHeight - padding - ((weight - minWeight) / range) * (chartHeight - padding * 2)
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.stroke()
  
  ctx.setFillStyle('#4CAF50')
  data.forEach((weight, index) => {
    const x = padding + (index / (data.length - 1)) * (chartWidth - padding * 2)
    const y = chartHeight - padding - ((weight - minWeight) / range) * (chartHeight - padding * 2)
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, 2 * Math.PI)
    ctx.fill()
  })
  
  ctx.draw()
}

const onChartTouch = (e) => {
  console.log('Chart touched', e)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.container {
  padding: 20rpx;
  min-height: 100vh;
  background: #f5f5f5;
}

.chart-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
  margin-bottom: 20rpx;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.chart-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.chart-tabs {
  display: flex;
  background: #f5f5f5;
  border-radius: 20rpx;
  padding: 5rpx;
}

.tab-item {
  padding: 10rpx 20rpx;
  border-radius: 15rpx;
  font-size: 24rpx;
  color: #666;
}

.tab-item.active {
  background: #4CAF50;
  color: #fff;
}

.chart-container {
  width: 100%;
  height: 300rpx;
}

.weight-chart {
  width: 100%;
  height: 100%;
}

.stats-summary {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
  margin-bottom: 20rpx;
}

.summary-item {
  flex: 1;
  text-align: center;
}

.summary-label {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.summary-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.text-danger {
  color: #f44336 !important;
}

.text-success {
  color: #4CAF50 !important;
}

.records-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.record-item:last-child {
  border-bottom: none;
}

.record-left {
  display: flex;
  flex-direction: column;
}

.record-date {
  font-size: 28rpx;
  color: #333;
}

.record-note {
  font-size: 24rpx;
  color: #999;
  margin-top: 5rpx;
}

.record-weight {
  font-size: 30rpx;
  font-weight: bold;
  color: #4CAF50;
}

.empty-state {
  text-align: center;
  padding: 50rpx 0;
  color: #999;
}
</style>
