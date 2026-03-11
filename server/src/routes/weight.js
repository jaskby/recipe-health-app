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

router.post('/record', authMiddleware, (req, res) => {
  const { weight, note } = req.body;
  if (!weight) return res.status(400).json({ error: '请填写体重' });
  
  const db = getDb();
  const date = dayjs().format('YYYY-MM-DD');
  
  const newId = db.data.weightRecords.length > 0 
    ? Math.max(...db.data.weightRecords.map(r => r.id)) + 1 : 1;
  
  db.data.weightRecords.push({
    id: newId,
    user_id: req.userId,
    weight,
    record_date: date,
    note,
    created_at: new Date().toISOString()
  });
  
  db.write();
  res.json({ message: '体重记录成功' });
});

router.get('/history', authMiddleware, (req, res) => {
  const { days = 30 } = req.query;
  const db = getDb();
  
  const startDate = dayjs().subtract(days, 'day').format('YYYY-MM-DD');
  const records = db.data.weightRecords
    .filter(r => r.user_id === req.userId && r.record_date >= startDate)
    .sort((a, b) => a.record_date.localeCompare(b.record_date));
  
  res.json({ records, stats: { count: records.length } });
});

router.get('/today', authMiddleware, (req, res) => {
  const db = getDb();
  const today = dayjs().format('YYYY-MM-DD');
  const record = db.data.weightRecords.find(
    r => r.user_id === req.userId && r.record_date === today
  );
  res.json(record || null);
});

module.exports = router;
