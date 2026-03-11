import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utils/request'

export const useUserStore = defineStore('user', () => {
  const token = ref(uni.getStorageSync('token') || '')
  const userInfo = ref(uni.getStorageSync('userInfo') || null)
  
  const login = async (phone, password) => {
    const res = await api.post('/auth/login', { phone, password })
    token.value = res.token
    userInfo.value = res.user
    uni.setStorageSync('token', res.token)
    uni.setStorageSync('userInfo', res.user)
    return res
  }
  
  const register = async (phone, password, nickname) => {
    const res = await api.post('/auth/register', { phone, password, nickname })
    token.value = res.token
    userInfo.value = res.user
    uni.setStorageSync('token', res.token)
    uni.setStorageSync('userInfo', res.user)
    return res
  }
  
  const wechatLogin = async (openid, nickname, avatar) => {
    const res = await api.post('/auth/wechat-login', { openid, nickname, avatar })
    token.value = res.token
    userInfo.value = res.user
    uni.setStorageSync('token', res.token)
    uni.setStorageSync('userInfo', res.user)
    return res
  }
  
  const logout = () => {
    token.value = ''
    userInfo.value = null
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
  }
  
  const updateProfile = async (data) => {
    await api.put('/users/profile', data)
    userInfo.value = { ...userInfo.value, ...data }
    uni.setStorageSync('userInfo', userInfo.value)
  }
  
  const getProfile = async () => {
    const res = await api.get('/users/profile')
    userInfo.value = res
    uni.setStorageSync('userInfo', res)
    return res
  }
  
  return {
    token,
    userInfo,
    login,
    register,
    wechatLogin,
    logout,
    updateProfile,
    getProfile
  }
})
