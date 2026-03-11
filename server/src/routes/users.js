const express = require('express');
const router = express.Router();
const { getDb } = require('../database/db');
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

router.get('/profile', authMiddleware, (req, res) => {
  const db = getDb();
  const user = db.data.users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  
  res.json({
    id: user.id,
    phone: user.phone,
    nickname: user.nickname,
    avatar: user.avatar,
    gender: user.gender,
    age: user.age,
    height: user.height,
    weight: user.weight,
    target_weight: user.target_weight,
    activity_level: user.activity_level
  });
});

router.put('/profile', authMiddleware, (req, res) => {
  const { nickname, gender, age, height, weight, target_weight, activity_level } = req.body;
  const db = getDb();
  
  const user = db.data.users.find(u => u.id === req.userId);
  if (user) {
    Object.assign(user, { nickname, gender, age, height, weight, target_weight, activity_level });
    db.write();
  }
  res.json({ message: '更新成功' });
});

router.get('/stats', authMiddleware, (req, res) => {
  const db = getDb();
  res.json({
    weight_record_days: db.data.weightRecords.filter(r => r.user_id === req.userId).length,
    completed_plans: db.data.dietPlans.filter(p => p.user_id === req.userId && p.status === 'completed').length,
    favorite_recipes: 0,
    active_plan: db.data.dietPlans.find(p => p.user_id === req.userId && p.status === 'active') || null
  });
});

module.exports = router;
