<template>
  <view class="recipe-card" @click="$emit('click')">
    <image class="card-image" :src="recipe.image || '/static/default-food.png'" mode="aspectFill"></image>
    <view class="card-content">
      <text class="card-name">{{ recipe.name }}</text>
      <view class="card-meta">
        <view class="meta-item">
          <text class="meta-icon">🔥</text>
          <text>{{ recipe.calories }}kcal</text>
        </view>
        <view class="meta-item">
          <text class="meta-icon">⏱️</text>
          <text>{{ recipe.cooking_time }}分钟</text>
        </view>
        <view class="meta-item">
          <text class="meta-icon">📊</text>
          <text>{{ recipe.difficulty }}</text>
        </view>
      </view>
      <view class="card-tags" v-if="recipe.ingredients && recipe.ingredients.length">
        <text class="tag" v-for="(ing, index) in recipe.ingredients.slice(0, 3)" :key="index">
          {{ ing.name }}
        </text>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  recipe: {
    type: Object,
    default: () => ({})
  }
})

defineEmits(['click'])
</script>

<style scoped>
.recipe-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.card-image {
  width: 100%;
  height: 200rpx;
  background: #f5f5f5;
}

.card-content {
  padding: 20rpx;
}

.card-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 15rpx;
}

.card-meta {
  display: flex;
  gap: 20rpx;
  margin-bottom: 15rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #666;
}

.meta-icon {
  margin-right: 5rpx;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.tag {
  font-size: 22rpx;
  color: #4CAF50;
  background: #E8F5E9;
  padding: 6rpx 15rpx;
  border-radius: 15rpx;
}
</style>
