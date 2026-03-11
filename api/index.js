const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { getDb } = require('../server/src/database/db');

const authRoutes = require('../server/src/routes/auth');
const ingredientRoutes = require('../server/src/routes/ingredients');
const recipeRoutes = require('../server/src/routes/recipes');
const dietPlanRoutes = require('../server/src/routes/dietPlans');
const weightRoutes = require('../server/src/routes/weight');
const userRoutes = require('../server/src/routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/diet-plans', dietPlanRoutes);
app.use('/api/weight', weightRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '服务运行正常' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

module.exports = app;
