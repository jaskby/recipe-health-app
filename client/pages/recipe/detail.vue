<template>
  <view class="container">
    <view class="recipe-header">
      <image class="recipe-image" :src="recipe.image || '/static/default-food.png'" mode="aspectFill"></image>
      <view class="recipe-overlay">
        <text class="recipe-name">{{ recipe.name }}</text>
        <view class="recipe-tags">
          <text class="tag">{{ recipe.category }}</text>
          <text class="tag">{{ recipe.difficulty }}</text>
          <text class="tag">{{ recipe.cooking_time }}分钟</text>
        </view>
      </view>
    </view>

    <view class="info-cards">
      <view class="info-card">
        <text class="info-value">{{ recipe.calories }}</text>
        <text class="info-label">热量(kcal)</text>
      </view>
      <view class="info-card">
        <text class="info-value">{{ recipe.protein }}</text>
        <text class="info-label">蛋白质(g)</text>
      </view>
      <view class="info-card">
        <text class="info-value">{{ recipe.fat }}</text>
        <text class="info-label">脂肪(g)</text>
      </view>
      <view class="info-card">
        <text class="info-value">{{ recipe.carbs }}</text>
        <text class="info-label">碳水(g)</text>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">🥗 食材清单</text>
        <text class="section-extra">预估成本: ¥{{ recipe.estimated_cost || '0.00' }}</text>
      </view>
      <view class="ingredient-list">
        <view class="ingredient-item" v-for="(ing, index) in recipe.ingredients" :key="index">
          <text class="ing-name">{{ ing.name }}</text>
          <text class="ing-amount">{{ ing.amount }}{{ ing.unit }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">👨‍🍳 烹饪步骤</text>
      </view>
      <view class="steps-list">
        <view class="step-item" v-for="(step, index) in recipe.steps" :key="index">
          <view class="step-number">{{ index + 1 }}</view>
          <text class="step-content">{{ step }}</text>
        </view>
      </view>
    </view>

    <view class="section" v-if="recipe.tips">
      <view class="section-header">
        <text class="section-title">💡 小贴士</text>
      </view>
      <view class="tips-content">
        <text>{{ recipe.tips }}</text>
      </view>
    </view>

    <view class="bottom-actions">
      <view class="action-btn" :class="{ favorited: isFavorited }" @click="toggleFavorite">
        <text class="action-icon">{{ isFavorited ? '❤️' : '🤍' }}</text>
        <text class="action-text">{{ isFavorited ? '已收藏' : '收藏' }}</text>
      </view>
      <view class="action-btn" @click="shareRecipe">
        <text class="action-icon">📤</text>
        <text class="action-text">分享</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRecipeStore } from '../../stores/recipe'
import { useUserStore } from '../../stores/user'
import api from '../../utils/request'

const recipeStore = useRecipeStore()
const userStore = useUserStore()

const recipe = ref({})
const isFavorited = ref(false)
const recipeId = ref('')

const loadRecipe = async () => {
  const res = await recipeStore.fetchRecipeDetail(recipeId.value)
  recipe.value = res
}

const checkFavorite = async () => {
  if (!userStore.token) return
  const favorites = await api.get('/users/favorites')
  isFavorited.value = favorites.some(f => f.id === parseInt(recipeId.value))
}

const toggleFavorite = async () => {
  if (!userStore.token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  
  try {
    await api.post(`/users/favorites/${recipeId.value}`)
    isFavorited.value = !isFavorited.value
    uni.showToast({
      title: isFavorited.value ? '收藏成功' : '已取消收藏',
      icon: 'none'
    })
  } catch (error) {
    console.error(error)
  }
}

const shareRecipe = () => {
  uni.showActionSheet({
    itemList: ['保存图片', '分享给好友'],
    success: (res) => {
      if (res.tapIndex === 0) {
        uni.showToast({ title: '图片保存功能开发中', icon: 'none' })
      } else {
        uni.showToast({ title: '分享功能开发中', icon: 'none' })
      }
    }
  })
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  recipeId.value = currentPage.options?.id || currentPage.$page?.options?.id
  
  if (recipeId.value) {
    loadRecipe()
    checkFavorite()
  }
})
</script>

<style scoped>
.container {
  padding-bottom: 140rpx;
}

.recipe-header {
  position: relative;
  height: 400rpx;
}

.recipe-image {
  width: 100%;
  height: 100%;
}

.recipe-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 40rpx 30rpx;
}

.recipe-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
  display: block;
  margin-bottom: 15rpx;
}

.recipe-tags {
  display: flex;
  gap: 15rpx;
}

.tag {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.info-cards {
  display: flex;
  background: #fff;
  padding: 30rpx 20rpx;
  margin: -30rpx 20rpx 20rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.info-card {
  flex: 1;
  text-align: center;
}

.info-value {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #4CAF50;
  margin-bottom: 8rpx;
}

.info-label {
  font-size: 22rpx;
  color: #999;
}

.section {
  background: #fff;
  margin: 0 20rpx 20rpx;
  border-radius: 16rpx;
  padding: 25rpx;
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

.section-extra {
  font-size: 26rpx;
  color: #f44336;
}

.ingredient-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.ingredient-item {
  display: flex;
  justify-content: space-between;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.ingredient-item:last-child {
  border-bottom: none;
}

.ing-name {
  font-size: 28rpx;
  color: #333;
}

.ing-amount {
  font-size: 28rpx;
  color: #666;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.step-item {
  display: flex;
  align-items: flex-start;
}

.step-number {
  width: 48rpx;
  height: 48rpx;
  background: #4CAF50;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: bold;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.step-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  flex: 1;
}

.tips-content {
  background: #FFF8E1;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
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
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0;
  border-radius: 40rpx;
  background: #f5f5f5;
}

.action-btn.favorited {
  background: #FFEBEE;
}

.action-icon {
  font-size: 36rpx;
  margin-right: 10rpx;
}

.action-text {
  font-size: 28rpx;
  color: #333;
}
</style>
