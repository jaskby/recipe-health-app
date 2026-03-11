import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utils/request'

export const useWeightStore = defineStore('weight', () => {
  const records = ref([])
  const stats = ref(null)
  const todayRecord = ref(null)
  const loading = ref(false)
  
  const recordWeight = async (data) => {
    return await api.post('/weight/record', data)
  }
  
  const fetchHistory = async (days = 30) => {
    loading.value = true
    try {
      const res = await api.get('/weight/history', { days })
      records.value = res.records
      stats.value = res.stats
      return res
    } finally {
      loading.value = false
    }
  }
  
  const fetchToday = async () => {
    const res = await api.get('/weight/today')
    todayRecord.value = res
    return res
  }
  
  const deleteRecord = async (id) => {
    return await api.delete(`/weight/record/${id}`)
  }
  
  return {
    records,
    stats,
    todayRecord,
    loading,
    recordWeight,
    fetchHistory,
    fetchToday,
    deleteRecord
  }
})
