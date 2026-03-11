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

router.post('/record', authMiddleware, async (req, res) => {
  const { weight, note } = req.body;
  
  if (!weight) {
    return res.status(400).json({ error: '请填写体重' });
  }
  
  try {
    const date = dayjs().format('YYYY-MM-DD');
    
    const { error } = await supabase
      .from('weight_records')
      .upsert({
        user_id: req.userId,
        weight,
        record_date: date,
        note
      }, { onConflict: 'user_id,record_date' });
    
    if (error) throw error;
    
    await supabase
      .from('users')
      .update({ weight, updated_at: new Date().toISOString() })
      .eq('id', req.userId);
    
    res.json({ message: '体重记录成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '记录失败' });
  }
});

router.get('/history', authMiddleware, async (req, res) => {
  const { days = 30 } = req.query;
  
  try {
    const startDate = dayjs().subtract(days, 'day').format('YYYY-MM-DD');
    
    const { data: records, error } = await supabase
      .from('weight_records')
      .select('*')
      .eq('user_id', req.userId)
      .gte('record_date', startDate)
      .order('record_date', { ascending: true });
    
    if (error) throw error;
    
    const stats = {
      count: records.length,
      max: records.length > 0 ? Math.max(...records.map(r => r.weight)) : null,
      min: records.length > 0 ? Math.min(...records.map(r => r.weight)) : null,
      avg: records.length > 0 
        ? Number((records.reduce((sum, r) => sum + r.weight, 0) / records.length).toFixed(1)) 
        : null,
      first: records.length > 0 ? records[0].weight : null,
      last: records.length > 0 ? records[records.length - 1].weight : null,
      change: records.length > 1 
        ? Number((records[0].weight - records[records.length - 1].weight).toFixed(1)) 
        : 0
    };
    
    res.json({ records, stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取记录失败' });
  }
});

router.get('/today', authMiddleware, async (req, res) => {
  try {
    const today = dayjs().format('YYYY-MM-DD');
    
    const { data, error } = await supabase
      .from('weight_records')
      .select('*')
      .eq('user_id', req.userId)
      .eq('record_date', today)
      .single();
    
    res.json(data || null);
  } catch (error) {
    res.json(null);
  }
});

module.exports = router;
