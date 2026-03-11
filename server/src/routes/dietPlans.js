const express = require('express');
const router = express.Router();
const { getDb } = require('../database/db');
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

router.post('/create', authMiddleware, (req, res) => {
  const { start_weight, target_weight, start_date } = req.body;
  
  if (!start_weight || !target_weight) {
    return res.status(400).json({ error: '请填写当前体重和目标体重' });
  }
  
  if (target_weight >= start_weight) {
    return res.status(400).json({ error: '目标体重应小于当前体重' });
  }
  
  const db = getDb();
  const weightToLose = start_weight - target_weight;
  const totalDays = Math.ceil(weightToLose / 0.5) * 7;
  const startDate = dayjs(start_date || new Date());
  
  const planId = db.data.dietPlans.length > 0 
    ? Math.max(...db.data.dietPlans.map(p => p.id)) + 1 : 1;
  
  const newPlan = {
    id: planId,
    user_id: req.userId,
    start_weight,
    target_weight,
    start_date: startDate.format('YYYY-MM-DD'),
    end_date: startDate.add(totalDays, 'day').format('YYYY-MM-DD'),
    total_days: totalDays,
    total_cost: Number((totalDays * 25).toFixed(2)),
    status: 'active',
    created_at: new Date().toISOString()
  };
  
  db.data.dietPlans.push(newPlan);
  db.write();
  
  res.json({ message: '减肥计划创建成功', plan: newPlan });
});

router.get('/my-plans', authMiddleware, (req, res) => {
  const db = getDb();
  const plans = db.data.dietPlans
    .filter(p => p.user_id === req.userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(plans);
});

router.get('/detail/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  
  const plan = db.data.dietPlans.find(p => p.id === parseInt(id));
  if (!plan) return res.status(404).json({ error: '计划不存在' });
  
  res.json({ ...plan, daily_meals: [] });
});

module.exports = router;
