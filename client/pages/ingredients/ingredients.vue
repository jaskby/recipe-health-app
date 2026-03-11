<template>
  <view class="container">
    <view class="filter-bar">
      <scroll-view scroll-x class="category-scroll">
        <view class="categories">
          <view 
            class="category-item" 
            :class="{ active: currentCategory === '' }"
            @click="selectCategory('')"
          >
            全部
          </view>
          <view 
            class="category-item" 
            v-for="cat in categories" 
            :key="cat"
            :class="{ active: currentCategory === cat }"
            @click="selectCategory(cat)"
          >
            {{ cat }}
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="ingredient-list">
      <view class="ingredient-item" v-for="item in ingredients" :key="item.id" @click="showDetail(item)">
        <view class="ingredient-info">
          <text class="ingredient-name">{{ item.name }}</text>
          <text class="ingredient-category">{{ item.category }}</text>
        </view>
        <view class="price-info">
          <view class="current-price">
            <text class="price-value">¥{{ item.current_price }}</text>
            <text class="price-unit">/{{ item.unit }}</text>
          </view>
          <view class="price-change" :class="getChangeClass(item.change_percent)">
            <text>{{ formatChange(item.change_percent) }}</text>
          </view>
        </view>
      </view>
      
      <view class="empty-state" v-if="ingredients.length === 0 && !loading">
        <text>暂无食材数据</text>
      </view>
      
      <view class="loading" v-if="loading">
        <text>加载中...</text>
      </view>
    </view>

    <uni-popup ref="popup" type="bottom">
      <view class="detail-popup" v-if="selectedIngredient">
        <view class="popup-header">
          <text class="popup-title">{{ selectedIngredient.name }}</text>
          <text class="popup-close" @click="closePopup">×</text>
        </view>
        
        <view class="detail-content">
          <view class="detail-row">
            <text class="detail-label">分类</text>
            <text class="detail-value">{{ selectedIngredient.category }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">当前价格</text>
            <text class="detail-value price">¥{{ selectedIngredient.current_price }}/{{ selectedIngredient.unit }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">昨日价格</text>
            <text class="detail-value">¥{{ selectedIngredient.yesterday_price || '-' }}/{{ selectedIngredient.unit }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">涨跌幅</text>
            <text class="detail-value" :class="getChangeClass(selectedIngredient.change_percent)">
              {{ formatChange(selectedIngredient.change_percent) }}
            </text>
          </view>
          <view class="detail-row">
            <text class="detail-label">数据来源</text>
            <text class="detail-value">{{ selectedIngredient.source || '系统' }}</text>
          </view>
          
          <view class="divider"></view>
          
          <view class="nutrition-info">
            <text class="nutrition-title">营养成分 (每100g)</text>
            <view class="nutrition-grid">
              <view class="nutrition-item">
                <text class="nutrition-value">{{ selectedIngredient.calories || '-' }}</text>
                <text class="nutrition-label">热量(kcal)</text>
              </view>
              <view class="nutrition-item">
                <text class="nutrition-value">{{ selectedIngredient.protein || '-' }}</text>
                <text class="nutrition-label">蛋白质(g)</text>
              </view>
              <view class="nutrition-item">
                <text class="nutrition-value">{{ selectedIngredient.fat || '-' }}</text>
                <text class="nutrition-label">脂肪(g)</text>
              </view>
              <view class="nutrition-item">
                <text class="nutrition-value">{{ selectedIngredient.carbs || '-' }}</text>
                <text class="nutrition-label">碳水(g)</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useIngredientStore } from '../../stores/ingredient'

const ingredientStore = useIngredientStore()

const categories = ref([])
const currentCategory = ref('')
const ingredients = ref([])
const loading = ref(false)
const selectedIngredient = ref(null)
const popup = ref(null)

const selectCategory = async (cat) => {
  currentCategory.value = cat
  await loadIngredients()
}

const loadCategories = async () => {
  const res = await ingredientStore.fetchCategories()
  categories.value = res
}

const loadIngredients = async () => {
  loading.value = true
  try {
    const res = await ingredientStore.fetchIngredients(currentCategory.value)
    ingredients.value = res
  } finally {
    loading.value = false
  }
}

const showDetail = (item) => {
  selectedIngredient.value = item
  popup.value.open()
}

const closePopup = () => {
  popup.value.close()
}

const getChangeClass = (percent) => {
  if (percent > 0) return 'text-danger'
  if (percent < 0) return 'text-success'
  return ''
}

const formatChange = (percent) => {
  if (!percent && percent !== 0) return '-'
  if (percent > 0) return `+${percent}%`
  return `${percent}%`
}

onMounted(() => {
  loadCategories()
  loadIngredients()
})

uni.onPullDownRefresh(() => {
  Promise.all([loadCategories(), loadIngredients()]).finally(() => {
    uni.stopPullDownRefresh()
  })
})
</script>

<style scoped>
.container {
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.filter-bar {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.category-scroll {
  white-space: nowrap;
}

.categories {
  display: inline-flex;
  gap: 15rpx;
}

.category-item {
  display: inline-block;
  padding: 12rpx 30rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #666;
  background: #f5f5f5;
}

.category-item.active {
  background: #4CAF50;
  color: #fff;
}

.ingredient-list {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.ingredient-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.ingredient-item:last-child {
  border-bottom: none;
}

.ingredient-info {
  display: flex;
  flex-direction: column;
}

.ingredient-name {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.ingredient-category {
  font-size: 24rpx;
  color: #999;
}

.price-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.current-price {
  display: flex;
  align-items: baseline;
  margin-bottom: 8rpx;
}

.price-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #f44336;
}

.price-unit {
  font-size: 22rpx;
  color: #999;
  margin-left: 5rpx;
}

.price-change {
  font-size: 24rpx;
}

.text-danger {
  color: #f44336;
}

.text-success {
  color: #4CAF50;
}

.empty-state {
  text-align: center;
  padding: 80rpx 0;
  color: #999;
}

.loading {
  text-align: center;
  padding: 40rpx;
  color: #999;
}

.detail-popup {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 30rpx;
  max-height: 80vh;
  overflow-y: auto;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.popup-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.popup-close {
  font-size: 48rpx;
  color: #999;
  line-height: 1;
}

.detail-content {
  padding: 0 10rpx;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.detail-label {
  font-size: 28rpx;
  color: #666;
}

.detail-value {
  font-size: 28rpx;
  color: #333;
}

.detail-value.price {
  color: #f44336;
  font-weight: bold;
}

.divider {
  height: 20rpx;
}

.nutrition-info {
  margin-top: 20rpx;
}

.nutrition-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.nutrition-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}

.nutrition-item {
  text-align: center;
  background: #f5f5f5;
  padding: 20rpx 10rpx;
  border-radius: 12rpx;
}

.nutrition-value {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #4CAF50;
  margin-bottom: 8rpx;
}

.nutrition-label {
  font-size: 22rpx;
  color: #666;
}
</style>
