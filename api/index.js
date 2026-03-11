const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('缺少 Supabase 配置');
}

const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 认证中间件
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

// ============ 认证路由 ============
app.post('/api/auth/register', async (req, res) => {
  const { phone, password, nickname } = req.body;
  if (!phone || !password) return res.status(400).json({ error: '手机号和密码不能为空' });

  try {
    const { data: existingUser } = await supabase.from('users').select('id').eq('phone', phone).single();
    if (existingUser) return res.status(400).json({ error: '该手机号已注册' });

    const hashedPassword = bcrypt.hashSync(password, 10);
    const { data: user, error } = await supabase
      .from('users')
      .insert({ phone, password: hashedPassword, nickname: nickname || `用户${phone.slice(-4)}` })
      .select().single();

    if (error) throw error;

    await supabase.from('user_preferences').insert({ user_id: user.id });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: '注册成功', token, user: { id: user.id, phone: user.phone, nickname: user.nickname } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '注册失败' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ error: '手机号和密码不能为空' });

  try {
    const { data: user, error } = await supabase.from('users').select('*').eq('phone', phone).single();
    if (error || !user) return res.status(400).json({ error: '用户不存在' });
    if (!bcrypt.compareSync(password, user.password)) return res.status(400).json({ error: '密码错误' });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: '登录成功', token,
      user: { id: user.id, phone: user.phone, nickname: user.nickname, avatar: user.avatar, gender: user.gender, age: user.age, height: user.height, weight: user.weight, target_weight: user.target_weight, activity_level: user.activity_level }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '登录失败' });
  }
});

// ============ 食材路由 ============
app.get('/api/ingredients/list', async (req, res) => {
  const { category, region = '北京' } = req.query;
  try {
    let query = supabase.from('ingredients').select('*');
    if (category) query = query.eq('category', category);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取食材列表失败' });
  }
});

app.get('/api/ingredients/categories', async (req, res) => {
  try {
    const { data, error } = await supabase.from('ingredients').select('category');
    if (error) throw error;
    res.json([...new Set(data.map(i => i.category))]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取分类失败' });
  }
});

app.get('/api/ingredients/top-changes', async (req, res) => {
  const { limit = 10 } = req.query;
  try {
    const { data, error } = await supabase.from('ingredients').select('*').limit(parseInt(limit));
    if (error) throw error;
    const result = data.map(i => ({ ...i, change_percent: (Math.random() * 10 - 5).toFixed(2) }));
    res.json({ rising: result.filter(i => i.change_percent > 0), falling: result.filter(i => i.change_percent <= 0) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取价格变化榜失败' });
  }
});

// ============ 食谱路由 ============
app.get('/api/recipes/list', async (req, res) => {
  const { category, meal_type, limit = 20, offset = 0 } = req.query;
  try {
    let query = supabase.from('recipes').select('*').range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    if (category) query = query.eq('category', category);
    if (meal_type) query = query.eq('meal_type', meal_type);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取食谱列表失败' });
  }
});

app.get('/api/recipes/detail/:id', async (req, res) => {
  try {
    const { data: recipe, error } = await supabase.from('recipes').select('*').eq('id', req.params.id).single();
    if (error || !recipe) return res.status(404).json({ error: '食谱不存在' });
    res.json({ ...recipe, estimated_cost: '15.00' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取食谱详情失败' });
  }
});

app.post('/api/recipes/daily-menu', async (req, res) => {
  try {
    const { data: breakfast } = await supabase.from('recipes').select('*').eq('meal_type', 'breakfast');
    const { data: lunch } = await supabase.from('recipes').select('*').eq('meal_type', 'lunch');
    const { data: dinner } = await supabase.from('recipes').select('*').eq('meal_type', 'dinner');
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const b = pick(breakfast || []);
    const l = pick(lunch || []);
    const d = pick(dinner || []);
    res.json({ breakfast: b, lunch: l, dinner: d, total_calories: (b?.calories || 0) + (l?.calories || 0) + (d?.calories || 0) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '生成食谱失败' });
  }
});

app.post('/api/recipes/random', async (req, res) => {
  const { type = 'single' } = req.query;
  try {
    if (type === 'single') {
      const { data } = await supabase.from('recipes').select('*');
      res.json({ recipe: data[Math.floor(Math.random() * data.length)] });
    } else {
      const { data: breakfast } = await supabase.from('recipes').select('*').eq('meal_type', 'breakfast');
      const { data: lunch } = await supabase.from('recipes').select('*').eq('meal_type', 'lunch');
      const { data: dinner } = await supabase.from('recipes').select('*').eq('meal_type', 'dinner');
      const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
      res.json({ breakfast: pick(breakfast || []), lunch: pick(lunch || []), dinner: pick(dinner || []) });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取随机食谱失败' });
  }
});

app.get('/api/recipes/categories', async (req, res) => {
  try {
    const { data, error } = await supabase.from('recipes').select('category');
    if (error) throw error;
    res.json([...new Set(data.map(r => r.category))]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取分类失败' });
  }
});

// ============ 减肥计划路由 ============
app.post('/api/diet-plans/create', authMiddleware, async (req, res) => {
  const { start_weight, target_weight, start_date } = req.body;
  if (!start_weight || !target_weight) return res.status(400).json({ error: '请填写当前体重和目标体重' });
  if (target_weight >= start_weight) return res.status(400).json({ error: '目标体重应小于当前体重' });

  try {
    const weightToLose = start_weight - target_weight;
    const totalDays = Math.ceil(weightToLose / 0.5) * 7;
    const startDate = dayjs(start_date || new Date());

    const { data: plan, error } = await supabase
      .from('diet_plans')
      .insert({ user_id: req.userId, start_weight, target_weight, start_date: startDate.format('YYYY-MM-DD'), end_date: startDate.add(totalDays, 'day').format('YYYY-MM-DD'), total_days: totalDays, total_cost: Number((totalDays * 25).toFixed(2)), status: 'active' })
      .select().single();

    if (error) throw error;
    res.json({ message: '减肥计划创建成功', plan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '创建减肥计划失败' });
  }
});

app.get('/api/diet-plans/my-plans', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('diet_plans').select('*').eq('user_id', req.userId).order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取减肥计划失败' });
  }
});

app.get('/api/diet-plans/detail/:id', async (req, res) => {
  try {
    const { data: plan, error } = await supabase.from('diet_plans').select('*').eq('id', req.params.id).single();
    if (error || !plan) return res.status(404).json({ error: '计划不存在' });
    res.json({ ...plan, daily_meals: [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取计划详情失败' });
  }
});

// ============ 体重记录路由 ============
app.post('/api/weight/record', authMiddleware, async (req, res) => {
  const { weight, note } = req.body;
  if (!weight) return res.status(400).json({ error: '请填写体重' });

  try {
    const date = dayjs().format('YYYY-MM-DD');
    const { error } = await supabase.from('weight_records').upsert({ user_id: req.userId, weight, record_date: date, note }, { onConflict: 'user_id,record_date' });
    if (error) throw error;
    await supabase.from('users').update({ weight, updated_at: new Date().toISOString() }).eq('id', req.userId);
    res.json({ message: '体重记录成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '记录失败' });
  }
});

app.get('/api/weight/history', authMiddleware, async (req, res) => {
  const { days = 30 } = req.query;
  try {
    const startDate = dayjs().subtract(days, 'day').format('YYYY-MM-DD');
    const { data: records, error } = await supabase.from('weight_records').select('*').eq('user_id', req.userId).gte('record_date', startDate).order('record_date', { ascending: true });
    if (error) throw error;
    const stats = { count: records.length, max: records.length > 0 ? Math.max(...records.map(r => r.weight)) : null, min: records.length > 0 ? Math.min(...records.map(r => r.weight)) : null };
    res.json({ records, stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取记录失败' });
  }
});

app.get('/api/weight/today', authMiddleware, async (req, res) => {
  try {
    const today = dayjs().format('YYYY-MM-DD');
    const { data } = await supabase.from('weight_records').select('*').eq('user_id', req.userId).eq('record_date', today).single();
    res.json(data || null);
  } catch (error) {
    res.json(null);
  }
});

// ============ 用户路由 ============
app.get('/api/users/profile', authMiddleware, async (req, res) => {
  try {
    const { data: user, error } = await supabase.from('users').select('id, phone, nickname, avatar, gender, age, height, weight, target_weight, activity_level, created_at').eq('id', req.userId).single();
    if (error || !user) return res.status(404).json({ error: '用户不存在' });
    const { data: preferences } = await supabase.from('user_preferences').select('*').eq('user_id', req.userId).single();
    res.json({ ...user, preferences: preferences || {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

app.put('/api/users/profile', authMiddleware, async (req, res) => {
  const { nickname, gender, age, height, weight, target_weight, activity_level } = req.body;
  try {
    await supabase.from('users').update({ nickname, gender, age, height, weight, target_weight, activity_level, updated_at: new Date().toISOString() }).eq('id', req.userId);
    res.json({ message: '更新成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '更新失败' });
  }
});

app.get('/api/users/stats', authMiddleware, async (req, res) => {
  try {
    const { count: weightRecordDays } = await supabase.from('weight_records').select('id', { count: 'exact', head: true }).eq('user_id', req.userId);
    const { count: completedPlans } = await supabase.from('diet_plans').select('id', { count: 'exact', head: true }).eq('user_id', req.userId).eq('status', 'completed');
    const { count: favoriteRecipes } = await supabase.from('user_favorites').select('id', { count: 'exact', head: true }).eq('user_id', req.userId);
    const { data: activePlan } = await supabase.from('diet_plans').select('*').eq('user_id', req.userId).eq('status', 'active').single();
    res.json({ weight_record_days: weightRecordDays || 0, completed_plans: completedPlans || 0, favorite_recipes: favoriteRecipes || 0, active_plan: activePlan || null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取统计失败' });
  }
});

// ============ 健康检查 ============
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '服务运行正常' });
});

app.get('/', (req, res) => {
  res.json({
    message: '食谱健康APP API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      ingredients: '/api/ingredients',
      recipes: '/api/recipes',
      dietPlans: '/api/diet-plans',
      weight: '/api/weight',
      users: '/api/users'
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

module.exports = app;
