<template>
  <view class="container">
    <view class="empty-state" v-if="favorites.length === 0 && !loading">
      <text class="empty-icon">❤️</text>
      <text class="empty-text">暂无收藏的食谱</text>
      <view class="empty-btn" @click="goToRecommend">去发现美食</view>
    </view>

    <view class="favorites-list" v-else>
      <view class="recipe-card" v-for="recipe in favorites" :key="recipe.id" @click="goToDetail(recipe.id)">
        <image class="recipe-image" :src="recipe.image || '/static/default-food.png'" mode="aspectFill"></image>
        <view class="recipe-info">
          <text class="recipe-name">{{ recipe.name }}</text>
          <view class="recipe-meta">
            <text class="meta-item">{{ recipe.category }}</text>
            <text class="meta-item">{{ recipe.calories }}kcal</text>
          </view>
          <view class="recipe-actions">
            <text class="favorited-time">{{ formatDate(recipe.favorited_at) }} 收藏</text>
            <text class="unfavorite-btn" @click.stop="unfavorite(recipe.id)">取消收藏</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { useUserStore } from '../../stores/user'
import api from '../../utils/request'
import dayjs from 'dayjs'

const userStore = useUserStore()

const favorites = ref([])
const loading = ref(false)

const loadFavorites = async () => {
  if (!userStore.token) return
  
  loading.value = true
  try {
    const res = await api.get('/users/favorites')
    favorites.value = res
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  return dayjs(date).format('MM-DD')
}

const goToDetail = (id) => {
  uni.navigateTo({ url: `/pages/recipe/detail?id=${id}` })
}

const goToRecommend = () => {
  uni.switchTab({ url: '/pages/recipe/recommend' })
}

const unfavorite = async (recipeId) => {
  try {
    await api.post(`/users/favorites/${recipeId}`)
    favorites.value = favorites.value.filter(f => f.id !== recipeId)
    uni.showToast({ title: '已取消收藏', icon: 'none' })
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  loadFavorites()
})

onPullDownRefresh(() => {
  loadFavorites().finally(() => {
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

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.recipe-card {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.recipe-image {
  width: 200rpx;
  height: 160rpx;
  background: #f5f5f5;
}

.recipe-info {
  flex: 1;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
}

.recipe-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.recipe-meta {
  display: flex;
  gap: 20rpx;
  margin-bottom: auto;
}

.meta-item {
  font-size: 24rpx;
  color: #999;
}

.recipe-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.favorited-time {
  font-size: 22rpx;
  color: #999;
}

.unfavorite-btn {
  font-size: 24rpx;
  color: #f44336;
}
</style>
