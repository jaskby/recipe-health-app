const express = require('express');
const router = express.Router();
const { supabase } = require('../database/supabase');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '未登录' });
  try {
    req.userId = jwt.verify(token, JWT_SECRET).userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'token无效' });
  }
};

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, phone, nickname, avatar, gender, age, height, weight, target_weight, activity_level, created_at')
      .eq('id', req.userId)
      .single();
    
    if (error || !user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', req.userId)
      .single();
    
    res.json({ ...user, preferences: preferences || {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

router.put('/profile', authMiddleware, async (req, res) => {
  const { nickname, gender, age, height, weight, target_weight, activity_level } = req.body;
  
  try {
    await supabase
      .from('users')
      .update({
        nickname,
        gender,
        age,
        height,
        weight,
        target_weight,
        activity_level,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.userId);
    
    res.json({ message: '更新成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '更新失败' });
  }
});

router.put('/preferences', authMiddleware, async (req, res) => {
  const { taste_preference, taboo_ingredients, allergy_ingredients, diet_habit, cooking_preference } = req.body;
  
  try {
    await supabase
      .from('user_preferences')
      .upsert({
        user_id: req.userId,
        taste_preference,
        taboo_ingredients,
        allergy_ingredients,
        diet_habit,
        cooking_preference
      }, { onConflict: 'user_id' });
    
    res.json({ message: '偏好设置成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '设置失败' });
  }
});

router.post('/favorites/:recipeId', authMiddleware, async (req, res) => {
  const recipeId = parseInt(req.params.recipeId);
  
  try {
    const { data: existing } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', req.userId)
      .eq('recipe_id', recipeId)
      .single();
    
    if (existing) {
      await supabase
        .from('user_favorites')
        .delete()
        .eq('id', existing.id);
      
      res.json({ message: '已取消收藏', favorited: false });
    } else {
      await supabase
        .from('user_favorites')
        .insert({ user_id: req.userId, recipe_id: recipeId });
      
      res.json({ message: '收藏成功', favorited: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '操作失败' });
  }
});

router.get('/favorites', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        created_at,
        recipes(*)
      `)
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const favorites = data.map(f => ({
      ...f.recipes,
      favorited_at: f.created_at
    }));
    
    res.json(favorites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取收藏失败' });
  }
});

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const { count: weightRecordDays } = await supabase
      .from('weight_records')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', req.userId);
    
    const { count: completedPlans } = await supabase
      .from('diet_plans')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', req.userId)
      .eq('status', 'completed');
    
    const { count: favoriteRecipes } = await supabase
      .from('user_favorites')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', req.userId);
    
    const { data: activePlan } = await supabase
      .from('diet_plans')
      .select('*')
      .eq('user_id', req.userId)
      .eq('status', 'active')
      .single();
    
    res.json({
      weight_record_days: weightRecordDays || 0,
      completed_plans: completedPlans || 0,
      favorite_recipes: favoriteRecipes || 0,
      active_plan: activePlan || null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取统计失败' });
  }
});

module.exports = router;
