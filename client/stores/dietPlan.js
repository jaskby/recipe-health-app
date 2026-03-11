import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utils/request'

export const useDietPlanStore = defineStore('dietPlan', () => {
  const plans = ref([])
  const currentPlan = ref(null)
  const loading = ref(false)
  
  const createPlan = async (data) => {
    loading.value = true
    try {
      const res = await api.post('/diet-plans/create', data)
      return res
    } finally {
      loading.value = false
    }
  }
  
  const fetchPlans = async () => {
    loading.value = true
    try {
      const res = await api.get('/diet-plans/my-plans')
      plans.value = res
      return res
    } finally {
      loading.value = false
    }
  }
  
  const fetchPlanDetail = async (id) => {
    loading.value = true
    try {
      const res = await api.get(`/diet-plans/detail/${id}`)
      currentPlan.value = res
      return res
    } finally {
      loading.value = false
    }
  }
  
  const cancelPlan = async (id) => {
    return await api.put(`/diet-plans/cancel/${id}`)
  }
  
  const completePlan = async (id) => {
    return await api.put(`/diet-plans/complete/${id}`)
  }
  
  return {
    plans,
    currentPlan,
    loading,
    createPlan,
    fetchPlans,
    fetchPlanDetail,
    cancelPlan,
    completePlan
  }
})
