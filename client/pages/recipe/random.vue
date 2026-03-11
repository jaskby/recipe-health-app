<template>
  <view class="container">
    <view class="mode-tabs">
      <view class="tab-item" :class="{ active: mode === 'single' }" @click="changeMode('single')">
        单顿推荐
      </view>
      <view class="tab-item" :class="{ active: mode === 'daily' }" @click="changeMode('daily')">
        一日三餐
      </view>
    </view>

    <view class="filter-section" v-if="mode === 'single'">
      <text class="filter-label">菜系筛选</text>
      <view class="filter-options">
        <view 
          class="filter-item" 
          :class="{ active: !category }"
          @click="category = ''"
        >
          不限
        </view>
        <view 
          class="filter-item" 
          v-for="cat in categories" 
          :key="cat"
          :class="{ active: category === cat }"
          @click="category = cat"
        >
          {{ cat }}
        </view>
      </view>
    </view>

    <view class="random-btn" @click="getRandom">
      <text class="btn-icon">🎲</text>
      <text class="btn-text">换一个</text>
    </view>

    <view class="loading" v-if="loading">
      <text>正在随机选择...</text>
    </view>

    <view class="result-container" v-if="result && !loading">
      <template v-if="mode === 'single'">
        <recipe-card :recipe="result.recipe" @click="goToDetail(result.recipe?.id)" />
      </template>
      
      <template v-else>
        <view class="meal-card" v-if="result.breakfast">
          <view class="meal-label">🌅 早餐</view>
          <recipe-card :recipe="result.breakfast" @click="goToDetail(result.breakfast.id)" />
        </view>
        <view class="meal-card" v-if="result.lunch">
          <view class="meal-label">☀️ 午餐</view>
          <recipe-card :recipe="result.lunch" @click="goToDetail(result.lunch.id)" />
        </view>
        <view class="meal-card" v-if="result.dinner">
          <view class="meal-label">🌙 晚餐</view>
          <recipe-card :recipe="result.dinner" @click="goToDetail(result.dinner.id)" />
        </view>
      </template>
    </view>

    <view class="empty-state" v-if="!result && !loading">
      <text>点击按钮开始随机推荐</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRecipeStore } from '../../stores/recipe'

const recipeStore = useRecipeStore()

const mode = ref('single')
const category = ref('')
const categories = ref([])
const result = ref(null)
const loading = ref(false)

const changeMode = (newMode) => {
  mode.value = newMode
  result.value = null
}

const loadCategories = async () => {
  const res = await recipeStore.fetchCategories()
  categories.value = res
}

const getRandom = async () => {
  loading.value = true
  try {
    const res = await recipeStore.getRandomRecipe(mode.value, category.value)
    result.value = res
  } finally {
    loading.value = false
  }
}

const goToDetail = (id) => {
  if (id) {
    uni.navigateTo({ url: `/pages/recipe/detail?id=${id}` })
  }
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.container {
  padding: 20rpx;
  min-height: 100vh;
  background: #f5f5f5;
}

.mode-tabs {
  display: flex;
  background: #fff;
  border-radius: 40rpx;
  padding: 8rpx;
  margin-bottom: 20rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  border-radius: 32rpx;
  font-size: 28rpx;
  color: #666;
  transition: all 0.3s;
}

.tab-item.active {
  background: #4CAF50;
  color: #fff;
}

.filter-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
  margin-bottom: 20rpx;
}

.filter-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 15rpx;
  display: block;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.filter-item {
  padding: 12rpx 25rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #666;
  background: #f5f5f5;
}

.filter-item.active {
  background: #4CAF50;
  color: #fff;
}

.random-btn {
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  border-radius: 50rpx;
  padding: 30rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 20rpx rgba(255, 107, 107, 0.3);
}

.btn-icon {
  font-size: 40rpx;
  margin-right: 15rpx;
}

.btn-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}

.loading {
  text-align: center;
  padding: 80rpx 0;
  color: #999;
}

.result-container {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.meal-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
}

.meal-label {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 15rpx;
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
}
</style>
