const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../database/supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

router.post('/register', async (req, res) => {
  const { phone, password, nickname } = req.body;
  
  if (!phone || !password) {
    return res.status(400).json({ error: '手机号和密码不能为空' });
  }

  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: '该手机号已注册' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        phone,
        password: hashedPassword,
        nickname: nickname || `用户${phone.slice(-4)}`
      })
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('user_preferences')
      .insert({ user_id: user.id });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      message: '注册成功',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '注册失败' });
  }
});

router.post('/login', async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ error: '手机号和密码不能为空' });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error || !user) {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '登录失败' });
  }
});

module.exports = router;
