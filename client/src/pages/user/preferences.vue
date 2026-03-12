<template>
  <view class="container">
    <view class="section">
      <view class="section-header">
        <text class="section-title">口味偏好</text>
      </view>
      <view class="options-grid">
        <view 
          class="option-item" 
          v-for="taste in tasteOptions" 
          :key="taste"
          :class="{ active: preferences.taste_preference === taste }"
          @click="preferences.taste_preference = taste"
        >
          {{ taste }}
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">饮食习惯</text>
      </view>
      <view class="options-grid">
        <view 
          class="option-item" 
          v-for="habit in habitOptions" 
          :key="habit.value"
          :class="{ active: preferences.diet_habit === habit.value }"
          @click="preferences.diet_habit = habit.value"
        >
          {{ habit.label }}
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">烹饪方式偏好</text>
      </view>
      <view class="options-grid">
        <view 
          class="option-item" 
          v-for="method in cookingOptions" 
          :key="method"
          :class="{ active: preferences.cooking_preference === method }"
          @click="preferences.cooking_preference = method"
        >
          {{ method }}
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">忌口食材</text>
        <text class="section-tip">点击移除</text>
      </view>
      <view class="tags-container">
        <view class="tag-item" v-for="(item, index) in preferences.taboo_ingredients" :key="index" @click="removeTaboo(index)">
          {{ item }} ×
        </view>
        <view class="add-tag" @click="showAddTaboo = true">+ 添加</view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">过敏食材</text>
        <text class="section-tip">点击移除</text>
      </view>
      <view class="tags-container">
        <view class="tag-item" v-for="(item, index) in preferences.allergy_ingredients" :key="index" @click="removeAllergy(index)">
          {{ item }} ×
        </view>
        <view class="add-tag" @click="showAddAllergy = true">+ 添加</view>
      </view>
    </view>

    <view class="save-btn" @click="savePreferences">
      保存设置
    </view>

    <uni-popup ref="addTabooPopup" type="center">
      <view class="add-popup">
        <view class="popup-title">添加忌口食材</view>
        <input class="popup-input" v-model="newTaboo" placeholder="请输入食材名称" />
        <view class="popup-actions">
          <view class="popup-btn cancel" @click="closeAddTaboo">取消</view>
          <view class="popup-btn confirm" @click="addTaboo">确定</view>
        </view>
      </view>
    </uni-popup>

    <uni-popup ref="addAllergyPopup" type="center">
      <view class="add-popup">
        <view class="popup-title">添加过敏食材</view>
        <input class="popup-input" v-model="newAllergy" placeholder="请输入食材名称" />
        <view class="popup-actions">
          <view class="popup-btn cancel" @click="closeAddAllergy">取消</view>
          <view class="popup-btn confirm" @click="addAllergy">确定</view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import api from '../../utils/request'

const userStore = useUserStore()

const tasteOptions = ['清淡', '适中', '重口味', '麻辣', '酸甜', '咸鲜']
const habitOptions = [
  { value: 'normal', label: '正常饮食' },
  { value: 'vegetarian', label: '素食' },
  { value: 'halal', label: '清真' },
  { value: 'lowcarb', label: '低碳水' }
]
const cookingOptions = ['炒', '蒸', '煮', '烤', '凉拌', '不限']

const preferences = reactive({
  taste_preference: '适中',
  diet_habit: 'normal',
  cooking_preference: '不限',
  taboo_ingredients: [],
  allergy_ingredients: []
})

const showAddTaboo = ref(false)
const showAddAllergy = ref(false)
const newTaboo = ref('')
const newAllergy = ref('')
const addTabooPopup = ref(null)
const addAllergyPopup = ref(null)

const loadPreferences = async () => {
  try {
    const res = await api.get('/users/profile')
    if (res.preferences) {
      preferences.taste_preference = res.preferences.taste_preference || '适中'
      preferences.diet_habit = res.preferences.diet_habit || 'normal'
      preferences.cooking_preference = res.preferences.cooking_preference || '不限'
      preferences.taboo_ingredients = res.preferences.taboo_ingredients || []
      preferences.allergy_ingredients = res.preferences.allergy_ingredients || []
    }
  } catch (error) {
    console.error(error)
  }
}

const removeTaboo = (index) => {
  preferences.taboo_ingredients.splice(index, 1)
}

const removeAllergy = (index) => {
  preferences.allergy_ingredients.splice(index, 1)
}

const addTaboo = () => {
  if (newTaboo.value && !preferences.taboo_ingredients.includes(newTaboo.value)) {
    preferences.taboo_ingredients.push(newTaboo.value)
  }
  newTaboo.value = ''
  addTabooPopup.value.close()
}

const addAllergy = () => {
  if (newAllergy.value && !preferences.allergy_ingredients.includes(newAllergy.value)) {
    preferences.allergy_ingredients.push(newAllergy.value)
  }
  newAllergy.value = ''
  addAllergyPopup.value.close()
}

const closeAddTaboo = () => {
  newTaboo.value = ''
  addTabooPopup.value.close()
}

const closeAddAllergy = () => {
  newAllergy.value = ''
  addAllergyPopup.value.close()
}

const savePreferences = async () => {
  try {
    await api.put('/users/preferences', preferences)
    uni.showToast({ title: '保存成功', icon: 'success' })
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  loadPreferences()
})

watch(showAddTaboo, (val) => {
  if (val) addTabooPopup.value.open()
})

watch(showAddAllergy, (val) => {
  if (val) addAllergyPopup.value.open()
})
</script>

<script>
import { watch } from 'vue'
export default {
  options: { styleIsolation: 'shared' }
}
</script>

<style scoped>
.container {
  padding: 20rpx;
  padding-bottom: 120rpx;
  min-height: 100vh;
  background: #f5f5f5;
}

.section {
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
  margin-bottom: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.section-tip {
  font-size: 24rpx;
  color: #999;
}

.options-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.option-item {
  padding: 15rpx 30rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #666;
  background: #f5f5f5;
}

.option-item.active {
  background: #4CAF50;
  color: #fff;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.tag-item {
  padding: 12rpx 25rpx;
  border-radius: 25rpx;
  font-size: 26rpx;
  color: #f44336;
  background: #FFEBEE;
}

.add-tag {
  padding: 12rpx 25rpx;
  border-radius: 25rpx;
  font-size: 26rpx;
  color: #4CAF50;
  background: #E8F5E9;
}

.save-btn {
  background: #4CAF50;
  color: #fff;
  text-align: center;
  padding: 30rpx 0;
  border-radius: 40rpx;
  font-size: 32rpx;
  position: fixed;
  bottom: 30rpx;
  left: 20rpx;
  right: 20rpx;
}

.add-popup {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  width: 600rpx;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 25rpx;
}

.popup-input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #ddd;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  margin-bottom: 25rpx;
}

.popup-actions {
  display: flex;
  gap: 20rpx;
}

.popup-btn {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.popup-btn.cancel {
  background: #f5f5f5;
  color: #666;
}

.popup-btn.confirm {
  background: #4CAF50;
  color: #fff;
}
</style>
