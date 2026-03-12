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

let supabase = null;
let isMockMode = false;

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_url_here' || supabaseKey === 'your_supabase_anon_key_here') {
  console.log('缺少 Supabase 配置，使用模拟数据模式');
  isMockMode = true;
} else {
  try {
    console.log('正在连接到 Supabase...');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Key:', supabaseKey.substring(0, 20) + '...');
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase 连接成功！');
  } catch (error) {
    console.error('Supabase 连接失败:', error.message);
    console.log('切换到模拟数据模式');
    isMockMode = true;
  }
}

// 模拟数据
const mockData = {
  users: [
    { id: '1', phone: '13800138000', password: bcrypt.hashSync('123456', 10), nickname: '测试用户' }
  ],
  ingredients: [
    { id: '1', name: '西红柿', category: '蔬菜', price: 3.5, unit: '元/斤', region: '北京' },
    { id: '2', name: '鸡蛋', category: '蛋类', price: 6.0, unit: '元/斤', region: '北京' },
    { id: '3', name: '猪肉', category: '肉类', price: 25.0, unit: '元/斤', region: '北京' }
  ],
  recipes: [
    { id: '1', name: '西红柿鸡蛋面', category: '面食', meal_type: 'lunch', calories: 400, ingredients: '西红柿,鸡蛋,面条', steps: '1. 煮面 2. 炒西红柿鸡蛋 3. 浇在面上' },
    { id: '2', name: '清蒸鱼', category: '海鲜', meal_type: 'dinner', calories: 300, ingredients: '鱼,姜,葱', steps: '1. 处理鱼 2. 清蒸 3. 浇油' },
    { id: '3', name: '牛奶燕麦', category: '早餐', meal_type: 'breakfast', calories: 250, ingredients: '牛奶,燕麦', steps: '1. 煮燕麦 2. 加牛奶' }
  ],
  dietPlans: [],
  weightRecords: [],
  userFavorites: []
};

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
    if (isMockMode) {
      const existingUser = mockData.users.find(u => u.phone === phone);
      if (existingUser) return res.status(400).json({ error: '该手机号已注册' });

      const hashedPassword = bcrypt.hashSync(password, 10);
      const newUser = {
        id: (mockData.users.length + 1).toString(),
        phone,
        password: hashedPassword,
        nickname: nickname || `用户${phone.slice(-4)}`
      };
      mockData.users.push(newUser);

      const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ message: '注册成功', token, user: { id: newUser.id, phone: newUser.phone, nickname: newUser.nickname } });
    } else {
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
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '注册失败' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ error: '手机号和密码不能为空' });

  try {
    if (isMockMode) {
      const user = mockData.users.find(u => u.phone === phone);
      if (!user) return res.status(400).json({ error: '用户不存在' });
      if (!bcrypt.compareSync(password, user.password)) return res.status(400).json({ error: '密码错误' });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      res.json({
        message: '登录成功', token,
        user: { id: user.id, phone: user.phone, nickname: user.nickname, avatar: user.avatar, gender: user.gender, age: user.age, height: user.height, weight: user.weight, target_weight: user.target_weight, activity_level: user.activity_level }
      });
    } else {
      const { data: user, error } = await supabase.from('users').select('*').eq('phone', phone).single();
      if (error || !user) return res.status(400).json({ error: '用户不存在' });
      if (!bcrypt.compareSync(password, user.password)) return res.status(400).json({ error: '密码错误' });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      res.json({
        message: '登录成功', token,
        user: { id: user.id, phone: user.phone, nickname: user.nickname, avatar: user.avatar, gender: user.gender, age: user.age, height: user.height, weight: user.weight, target_weight: user.target_weight, activity_level: user.activity_level }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '登录失败' });
  }
});

// ============ 食材路由 ============
app.get('/api/ingredients/list', async (req, res) => {
  const { category, region = '北京' } = req.query;
  try {
    if (isMockMode) {
      let data = mockData.ingredients;
      if (category) data = data.filter(i => i.category === category);
      res.json(data);
    } else {
      let query = supabase.from('ingredients').select('*');
      if (category) query = query.eq('category', category);
      const { data, error } = await query;
      if (error) throw error;
      res.json(data);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取食材列表失败' });
  }
});

app.get('/api/ingredients/categories', async (req, res) => {
  try {
    if (isMockMode) {
      const categories = [...new Set(mockData.ingredients.map(i => i.category))];
      res.json(categories);
    } else {
      const { data, error } = await supabase.from('ingredients').select('category');
      if (error) throw error;
      res.json([...new Set(data.map(i => i.category))]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取分类失败' });
  }
});

app.get('/api/ingredients/top-changes', async (req, res) => {
  const { limit = 10 } = req.query;
  try {
    if (isMockMode) {
      const data = mockData.ingredients.slice(0, parseInt(limit));
      const result = data.map(i => ({ ...i, change_percent: (Math.random() * 10 - 5).toFixed(2) }));
      res.json({ rising: result.filter(i => i.change_percent > 0), falling: result.filter(i => i.change_percent <= 0) });
    } else {
      const { data, error } = await supabase.from('ingredients').select('*').limit(parseInt(limit));
      if (error) throw error;
      const result = data.map(i => ({ ...i, change_percent: (Math.random() * 10 - 5).toFixed(2) }));
      res.json({ rising: result.filter(i => i.change_percent > 0), falling: result.filter(i => i.change_percent <= 0) });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取价格变化榜失败' });
  }
});

// ============ 食谱路由 ============
app.get('/api/recipes/list', async (req, res) => {
  const { category, meal_type, limit = 20, offset = 0 } = req.query;
  try {
    if (isMockMode) {
      let data = mockData.recipes;
      if (category) data = data.filter(r => r.category === category);
      if (meal_type) data = data.filter(r => r.meal_type === meal_type);
      data = data.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
      res.json(data);
    } else {
      let query = supabase.from('recipes').select('*').range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
      if (category) query = query.eq('category', category);
      if (meal_type) query = query.eq('meal_type', meal_type);
      const { data, error } = await query;
      if (error) throw error;
      res.json(data);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取食谱列表失败' });
  }
});

app.get('/api/recipes/detail/:id', async (req, res) => {
  try {
    if (isMockMode) {
      const recipe = mockData.recipes.find(r => r.id === req.params.id);
      if (!recipe) return res.status(404).json({ error: '食谱不存在' });
      res.json({ ...recipe, estimated_cost: '15.00' });
    } else {
      const { data: recipe, error } = await supabase.from('recipes').select('*').eq('id', req.params.id).single();
      if (error || !recipe) return res.status(404).json({ error: '食谱不存在' });
      res.json({ ...recipe, estimated_cost: '15.00' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取食谱详情失败' });
  }
});

app.post('/api/recipes/daily-menu', async (req, res) => {
  try {
    if (isMockMode) {
      const breakfast = mockData.recipes.filter(r => r.meal_type === 'breakfast');
      const lunch = mockData.recipes.filter(r => r.meal_type === 'lunch');
      const dinner = mockData.recipes.filter(r => r.meal_type === 'dinner');
      const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
      const b = pick(breakfast);
      const l = pick(lunch);
      const d = pick(dinner);
      res.json({ breakfast: b, lunch: l, dinner: d, total_calories: (b?.calories || 0) + (l?.calories || 0) + (d?.calories || 0) });
    } else {
      const { data: breakfast } = await supabase.from('recipes').select('*').eq('meal_type', 'breakfast');
      const { data: lunch } = await supabase.from('recipes').select('*').eq('meal_type', 'lunch');
      const { data: dinner } = await supabase.from('recipes').select('*').eq('meal_type', 'dinner');
      const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
      const b = pick(breakfast || []);
      const l = pick(lunch || []);
      const d = pick(dinner || []);
      res.json({ breakfast: b, lunch: l, dinner: d, total_calories: (b?.calories || 0) + (l?.calories || 0) + (d?.calories || 0) });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '生成食谱失败' });
  }
});

app.post('/api/recipes/random', async (req, res) => {
  const { type = 'single' } = req.query;
  try {
    if (isMockMode) {
      if (type === 'single') {
        const recipe = mockData.recipes[Math.floor(Math.random() * mockData.recipes.length)];
        res.json({ recipe });
      } else {
        const breakfast = mockData.recipes.filter(r => r.meal_type === 'breakfast');
        const lunch = mockData.recipes.filter(r => r.meal_type === 'lunch');
        const dinner = mockData.recipes.filter(r => r.meal_type === 'dinner');
        const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
        res.json({ breakfast: pick(breakfast), lunch: pick(lunch), dinner: pick(dinner) });
      }
    } else {
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
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取随机食谱失败' });
  }
});

app.get('/api/recipes/categories', async (req, res) => {
  try {
    if (isMockMode) {
      const categories = [...new Set(mockData.recipes.map(r => r.category))];
      res.json(categories);
    } else {
      const { data, error } = await supabase.from('recipes').select('category');
      if (error) throw error;
      res.json([...new Set(data.map(r => r.category))]);
    }
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

    if (isMockMode) {
      const newPlan = {
        id: (mockData.dietPlans.length + 1).toString(),
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
      mockData.dietPlans.push(newPlan);
      res.json({ message: '减肥计划创建成功', plan: newPlan });
    } else {
      const { data: plan, error } = await supabase
        .from('diet_plans')
        .insert({ user_id: req.userId, start_weight, target_weight, start_date: startDate.format('YYYY-MM-DD'), end_date: startDate.add(totalDays, 'day').format('YYYY-MM-DD'), total_days: totalDays, total_cost: Number((totalDays * 25).toFixed(2)), status: 'active' })
        .select().single();

      if (error) throw error;
      res.json({ message: '减肥计划创建成功', plan });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '创建减肥计划失败' });
  }
});

app.get('/api/diet-plans/my-plans', authMiddleware, async (req, res) => {
  try {
    if (isMockMode) {
      const plans = mockData.dietPlans.filter(p => p.user_id === req.userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      res.json(plans);
    } else {
      const { data, error } = await supabase.from('diet_plans').select('*').eq('user_id', req.userId).order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取减肥计划失败' });
  }
});

app.get('/api/diet-plans/detail/:id', async (req, res) => {
  try {
    if (isMockMode) {
      const plan = mockData.dietPlans.find(p => p.id === req.params.id);
      if (!plan) return res.status(404).json({ error: '计划不存在' });
      res.json({ ...plan, daily_meals: [] });
    } else {
      const { data: plan, error } = await supabase.from('diet_plans').select('*').eq('id', req.params.id).single();
      if (error || !plan) return res.status(404).json({ error: '计划不存在' });
      res.json({ ...plan, daily_meals: [] });
    }
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

    if (isMockMode) {
      const existingRecord = mockData.weightRecords.find(r => r.user_id === req.userId && r.record_date === date);
      if (existingRecord) {
        existingRecord.weight = weight;
        existingRecord.note = note;
      } else {
        mockData.weightRecords.push({
          id: (mockData.weightRecords.length + 1).toString(),
          user_id: req.userId,
          weight,
          record_date: date,
          note,
          created_at: new Date().toISOString()
        });
      }
      res.json({ message: '体重记录成功' });
    } else {
      const { error } = await supabase.from('weight_records').upsert({ user_id: req.userId, weight, record_date: date, note }, { onConflict: 'user_id,record_date' });
      if (error) throw error;
      await supabase.from('users').update({ weight, updated_at: new Date().toISOString() }).eq('id', req.userId);
      res.json({ message: '体重记录成功' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '记录失败' });
  }
});

app.get('/api/weight/history', authMiddleware, async (req, res) => {
  const { days = 30 } = req.query;
  try {
    const startDate = dayjs().subtract(days, 'day').format('YYYY-MM-DD');

    if (isMockMode) {
      const records = mockData.weightRecords.filter(r => r.user_id === req.userId && r.record_date >= startDate).sort((a, b) => new Date(a.record_date) - new Date(b.record_date));
      const stats = { count: records.length, max: records.length > 0 ? Math.max(...records.map(r => r.weight)) : null, min: records.length > 0 ? Math.min(...records.map(r => r.weight)) : null };
      res.json({ records, stats });
    } else {
      const { data: records, error } = await supabase.from('weight_records').select('*').eq('user_id', req.userId).gte('record_date', startDate).order('record_date', { ascending: true });
      if (error) throw error;
      const stats = { count: records.length, max: records.length > 0 ? Math.max(...records.map(r => r.weight)) : null, min: records.length > 0 ? Math.min(...records.map(r => r.weight)) : null };
      res.json({ records, stats });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取记录失败' });
  }
});

app.get('/api/weight/today', authMiddleware, async (req, res) => {
  try {
    const today = dayjs().format('YYYY-MM-DD');

    if (isMockMode) {
      const record = mockData.weightRecords.find(r => r.user_id === req.userId && r.record_date === today);
      res.json(record || null);
    } else {
      const { data } = await supabase.from('weight_records').select('*').eq('user_id', req.userId).eq('record_date', today).single();
      res.json(data || null);
    }
  } catch (error) {
    res.json(null);
  }
});

// ============ 用户路由 ============
app.get('/api/users/profile', authMiddleware, async (req, res) => {
  try {
    if (isMockMode) {
      const user = mockData.users.find(u => u.id === req.userId);
      if (!user) return res.status(404).json({ error: '用户不存在' });
      res.json({ ...user, preferences: {} });
    } else {
      const { data: user, error } = await supabase.from('users').select('id, phone, nickname, avatar, gender, age, height, weight, target_weight, activity_level, created_at').eq('id', req.userId).single();
      if (error || !user) return res.status(404).json({ error: '用户不存在' });
      const { data: preferences } = await supabase.from('user_preferences').select('*').eq('user_id', req.userId).single();
      res.json({ ...user, preferences: preferences || {} });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

app.put('/api/users/profile', authMiddleware, async (req, res) => {
  const { nickname, gender, age, height, weight, target_weight, activity_level } = req.body;
  try {
    if (isMockMode) {
      const user = mockData.users.find(u => u.id === req.userId);
      if (user) {
        Object.assign(user, { nickname, gender, age, height, weight, target_weight, activity_level, updated_at: new Date().toISOString() });
      }
      res.json({ message: '更新成功' });
    } else {
      await supabase.from('users').update({ nickname, gender, age, height, weight, target_weight, activity_level, updated_at: new Date().toISOString() }).eq('id', req.userId);
      res.json({ message: '更新成功' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '更新失败' });
  }
});

app.get('/api/users/stats', authMiddleware, async (req, res) => {
  try {
    if (isMockMode) {
      const weightRecordDays = mockData.weightRecords.filter(r => r.user_id === req.userId).length;
      const completedPlans = mockData.dietPlans.filter(p => p.user_id === req.userId && p.status === 'completed').length;
      const favoriteRecipes = mockData.userFavorites.filter(f => f.user_id === req.userId).length;
      const activePlan = mockData.dietPlans.find(p => p.user_id === req.userId && p.status === 'active');
      res.json({ weight_record_days: weightRecordDays, completed_plans: completedPlans, favorite_recipes: favoriteRecipes, active_plan: activePlan || null });
    } else {
      const { count: weightRecordDays } = await supabase.from('weight_records').select('id', { count: 'exact', head: true }).eq('user_id', req.userId);
      const { count: completedPlans } = await supabase.from('diet_plans').select('id', { count: 'exact', head: true }).eq('user_id', req.userId).eq('status', 'completed');
      const { count: favoriteRecipes } = await supabase.from('user_favorites').select('id', { count: 'exact', head: true }).eq('user_id', req.userId);
      const { data: activePlan } = await supabase.from('diet_plans').select('*').eq('user_id', req.userId).eq('status', 'active').single();
      res.json({ weight_record_days: weightRecordDays || 0, completed_plans: completedPlans || 0, favorite_recipes: favoriteRecipes || 0, active_plan: activePlan || null });
    }
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
