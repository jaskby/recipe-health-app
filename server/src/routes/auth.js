const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

router.post('/register', (req, res) => {
  const { phone, password, nickname } = req.body;
  
  if (!phone || !password) {
    return res.status(400).json({ error: '手机号和密码不能为空' });
  }

  const db = getDb();
  const existingUser = db.data.users.find(u => u.phone === phone);
  if (existingUser) {
    return res.status(400).json({ error: '该手机号已注册' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newId = db.data.users.length > 0 ? Math.max(...db.data.users.map(u => u.id)) + 1 : 1;
  
  const newUser = {
    id: newId,
    phone,
    password: hashedPassword,
    nickname: nickname || `用户${phone.slice(-4)}`,
    created_at: new Date().toISOString()
  };
  
  db.data.users.push(newUser);
  db.write();

  const token = jwt.sign({ userId: newId }, JWT_SECRET, { expiresIn: '7d' });
  
  res.json({
    message: '注册成功',
    token,
    user: {
      id: newId,
      phone,
      nickname: newUser.nickname
    }
  });
});

router.post('/login', (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ error: '手机号和密码不能为空' });
  }

  const db = getDb();
  const user = db.data.users.find(u => u.phone === phone);
  if (!user) {
    return res.status(400).json({ error: '用户不存在' });
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ error: '密码错误' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  
  res.json({
    message: '登录成功',
    token,
    user: {
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
    }
  });
});

module.exports = router;
