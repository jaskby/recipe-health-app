import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utils/request'

export const useRecipeStore = defineStore('recipe', () => {
  const recipes = ref([])
  const currentRecipe = ref(null)
  const dailyMenu = ref(null)
  const categories = ref([])
  const loading = ref(false)
  
  const fetchRecipes = async (params) => {
    loading.value = true
    try {
      const res = await api.get('/recipes/list', params)
      recipes.value = res
      return res
    } finally {
      loading.value = false
    }
  }
  
  const fetchRecipeDetail = async (id) => {
    loading.value = true
    try {
      const res = await api.get(`/recipes/detail/${id}`)
      currentRecipe.value = res
      return res
    } finally {
      loading.value = false
    }
  }
  
  const generateDailyMenu = async (params) => {
    loading.value = true
    try {
      const res = await api.post('/recipes/daily-menu', params)
      dailyMenu.value = res
      return res
    } finally {
      loading.value = false
    }
  }
  
  const getRandomRecipe = async (type = 'single', category) => {
    loading.value = true
    try {
      const res = await api.post('/recipes/random?type=' + type, { category })
      return res
    } finally {
      loading.value = false
    }
  }
  
  const fetchCategories = async () => {
    const res = await api.get('/recipes/categories')
    categories.value = res
    return res
  }
  
  return {
    recipes,
    currentRecipe,
    dailyMenu,
    categories,
    loading,
    fetchRecipes,
    fetchRecipeDetail,
    generateDailyMenu,
    getRandomRecipe,
    fetchCategories
  }
})
