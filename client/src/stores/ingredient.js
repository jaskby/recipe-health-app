import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utils/request'

export const useIngredientStore = defineStore('ingredient', () => {
  const ingredients = ref([])
  const categories = ref([])
  const topChanges = ref({ rising: [], falling: [] })
  const loading = ref(false)
  
  const fetchIngredients = async (category, region = '北京') => {
    loading.value = true
    try {
      const res = await api.get('/ingredients/list', { category, region })
      ingredients.value = res
      return res
    } finally {
      loading.value = false
    }
  }
  
  const fetchCategories = async () => {
    const res = await api.get('/ingredients/categories')
    categories.value = res
    return res
  }
  
  const fetchTopChanges = async (region = '北京') => {
    const res = await api.get('/ingredients/top-changes', { region })
    topChanges.value = res
    return res
  }
  
  const fetchPriceTrend = async (ingredientId, days = 7) => {
    return await api.get(`/ingredients/price-trend/${ingredientId}`, { days })
  }
  
  return {
    ingredients,
    categories,
    topChanges,
    loading,
    fetchIngredients,
    fetchCategories,
    fetchTopChanges,
    fetchPriceTrend
  }
})
