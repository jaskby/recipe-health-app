const express = require('express');
const router = express.Router();
const { supabase } = require('../database/supabase');
const dayjs = require('dayjs');
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

router.post('/create', authMiddleware, async (req, res) => {
  const { start_weight, target_weight, start_date } = req.body;
  
  if (!start_weight || !target_weight) {
    return res.status(400).json({ error: '请填写当前体重和目标体重' });
  }
  
  if (target_weight >= start_weight) {
    return res.status(400).json({ error: '目标体重应小于当前体重' });
  }
  
  try {
    const weightToLose = start_weight - target_weight;
    const totalDays = Math.ceil(weightToLose / 0.5) * 7;
    const startDate = dayjs(start_date || new Date());
    const endDate = startDate.add(totalDays, 'day');
    
    const { data: plan, error } = await supabase
      .from('diet_plans')
      .insert({
        user_id: req.userId,
        start_weight,
        target_weight,
        start_date: startDate.format('YYYY-MM-DD'),
        end_date: endDate.format('YYYY-MM-DD'),
        total_days: totalDays,
        total_cost: Number((totalDays * 25).toFixed(2)),
        status: 'active'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ message: '减肥计划创建成功', plan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '创建减肥计划失败' });
  }
});

router.get('/my-plans', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('diet_plans')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取减肥计划失败' });
  }
});

router.get('/detail/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const { data: plan, error } = await supabase
      .from('diet_plans')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !plan) {
      return res.status(404).json({ error: '计划不存在' });
    }
    
    res.json({ ...plan, daily_meals: [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取计划详情失败' });
  }
});

router.put('/cancel/:id', authMiddleware, async (req, res) => {
  try {
    await supabase
      .from('diet_plans')
      .update({ status: 'cancelled' })
      .eq('id', req.params.id)
      .eq('user_id', req.userId);
    
    res.json({ message: '计划已取消' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '取消计划失败' });
  }
});

router.put('/complete/:id', authMiddleware, async (req, res) => {
  try {
    await supabase
      .from('diet_plans')
      .update({ status: 'completed' })
      .eq('id', req.params.id)
      .eq('user_id', req.userId);
    
    res.json({ message: '恭喜完成减肥计划！' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '操作失败' });
  }
});

module.exports = router;
