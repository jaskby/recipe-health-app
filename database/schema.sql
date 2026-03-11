-- 食谱健康APP 数据库表结构
-- 在Supabase SQL Editor中执行此脚本

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  phone TEXT UNIQUE,
  nickname TEXT,
  avatar TEXT,
  gender TEXT,
  age INTEGER,
  height REAL,
  weight REAL,
  target_weight REAL,
  activity_level TEXT DEFAULT 'moderate',
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户偏好表
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  taste_preference TEXT,
  taboo_ingredients TEXT[],
  allergy_ingredients TEXT[],
  diet_habit TEXT DEFAULT 'normal',
  cooking_preference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 食材表
CREATE TABLE IF NOT EXISTS ingredients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  image TEXT,
  unit TEXT DEFAULT '斤',
  calories REAL,
  protein REAL,
  fat REAL,
  carbs REAL,
  fiber REAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 食材价格表
CREATE TABLE IF NOT EXISTS ingredient_prices (
  id SERIAL PRIMARY KEY,
  ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
  price REAL NOT NULL,
  source TEXT,
  region TEXT DEFAULT '北京',
  date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ingredient_id, date, region)
);

-- 食谱表
CREATE TABLE IF NOT EXISTS recipes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  meal_type TEXT,
  image TEXT,
  calories REAL,
  protein REAL,
  fat REAL,
  carbs REAL,
  cooking_time INTEGER,
  difficulty TEXT DEFAULT '简单',
  steps TEXT[],
  tips TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 食谱食材关联表
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id INTEGER REFERENCES ingredients(id),
  amount REAL,
  unit TEXT
);

-- 减肥计划表
CREATE TABLE IF NOT EXISTS diet_plans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  start_weight REAL,
  target_weight REAL,
  start_date TEXT,
  end_date TEXT,
  total_days INTEGER,
  total_cost REAL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 减肥计划餐食表
CREATE TABLE IF NOT EXISTS diet_plan_meals (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER REFERENCES diet_plans(id) ON DELETE CASCADE,
  day_number INTEGER,
  meal_type TEXT,
  recipe_id INTEGER REFERENCES recipes(id),
  meal_cost REAL
);

-- 体重记录表
CREATE TABLE IF NOT EXISTS weight_records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  weight REAL NOT NULL,
  record_date TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, record_date)
);

-- 用户收藏表
CREATE TABLE IF NOT EXISTS user_favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_ingredient_prices_date ON ingredient_prices(date);
CREATE INDEX IF NOT EXISTS idx_weight_records_user ON weight_records(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_plans_user ON diet_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_meal_type ON recipes(meal_type);

-- 插入示例食材数据
INSERT INTO ingredients (name, category, calories, protein, fat, carbs, fiber) VALUES
('西红柿', '蔬菜', 15, 0.9, 0.2, 3.3, 1.2),
('鸡蛋', '蛋奶', 144, 13.3, 8.8, 2.8, 0),
('鸡胸肉', '肉类', 133, 19.4, 5.0, 2.5, 0),
('牛肉', '肉类', 125, 20.0, 4.2, 0, 0),
('三文鱼', '海鲜', 139, 20.0, 6.3, 0, 0),
('大虾', '海鲜', 87, 18.6, 0.8, 2.8, 0),
('西兰花', '蔬菜', 36, 4.1, 0.6, 4.3, 2.6),
('菠菜', '蔬菜', 23, 2.6, 0.3, 3.6, 1.7),
('土豆', '蔬菜', 81, 2.0, 0.2, 17.8, 1.2),
('胡萝卜', '蔬菜', 37, 1.0, 0.2, 8.1, 1.3),
('豆腐', '豆制品', 81, 8.1, 3.7, 3.8, 0.4),
('米饭', '主食', 116, 2.6, 0.3, 25.6, 0.3),
('面条', '主食', 137, 4.5, 0.5, 28.0, 0.8),
('黄瓜', '蔬菜', 15, 0.8, 0.2, 2.4, 0.5),
('茄子', '蔬菜', 21, 1.1, 0.2, 4.0, 1.3),
('青椒', '蔬菜', 22, 1.0, 0.2, 4.2, 1.4),
('排骨', '肉类', 278, 18.0, 23.1, 0, 0),
('五花肉', '肉类', 349, 9.3, 35.3, 0, 0),
('鲈鱼', '海鲜', 105, 18.6, 3.1, 0, 0),
('白菜', '蔬菜', 13, 1.0, 0.1, 2.1, 0.6);

-- 插入示例食谱数据
INSERT INTO recipes (name, category, meal_type, calories, protein, fat, carbs, cooking_time, difficulty, steps, tips) VALUES
('番茄炒蛋', '家常菜', 'lunch', 180, 12, 10, 8, 15, '简单', 
  ARRAY['西红柿洗净切块，鸡蛋打散加少许盐', '锅中放油，油热后倒入蛋液，炒至凝固盛出', '锅中再加少许油，放入西红柿翻炒出汁', '加入炒好的鸡蛋，翻炒均匀，加盐调味即可'],
  '西红柿要选熟透的，炒出来汁水更多'),
('清蒸鲈鱼', '海鲜', 'dinner', 150, 25, 4, 2, 25, '中等',
  ARRAY['鲈鱼处理干净，在鱼身两侧划几刀', '鱼身抹少许盐和料酒，腌制10分钟', '葱切丝，姜切片铺在鱼身上', '水开后放入鱼，大火蒸8-10分钟', '出锅后淋上蒸鱼豉油，浇上热油即可'],
  '蒸鱼时间不宜过长，肉质会更嫩'),
('西兰花炒鸡胸肉', '健康餐', 'lunch', 200, 28, 6, 10, 20, '简单',
  ARRAY['鸡胸肉切丁，加料酒、生抽、淀粉腌制15分钟', '西兰花切小朵，焯水后捞出', '锅中放油，放入鸡胸肉翻炒至变色', '加入西兰花翻炒，加盐、生抽调味即可'],
  '鸡胸肉腌制时加淀粉会更嫩滑'),
('红烧排骨', '家常菜', 'lunch', 380, 22, 28, 8, 60, '中等',
  ARRAY['排骨冷水下锅焯水，撇去浮沫捞出', '锅中放油，加入冰糖炒出糖色', '放入排骨翻炒上色', '加入葱姜蒜、八角、桂皮、生抽、老抽', '加入没过排骨的水，大火烧开后转小火炖40分钟', '大火收汁即可'],
  '炒糖色时火候要小，避免炒糊'),
('凉拌黄瓜', '凉菜', 'dinner', 45, 1, 3, 4, 10, '简单',
  ARRAY['黄瓜洗净拍碎，切成小段', '蒜切末，干辣椒切段', '黄瓜放入碗中，加入蒜末、盐、糖、醋、生抽', '锅中烧热油，放入干辣椒炸香', '将热油浇在黄瓜上拌匀即可'],
  '黄瓜拍碎比切更容易入味'),
('番茄鸡蛋面', '面食', 'breakfast', 320, 14, 8, 48, 15, '简单',
  ARRAY['西红柿切块，鸡蛋打散', '锅中放油，炒熟鸡蛋盛出', '锅中再放油，放入西红柿炒出汁', '加入适量水煮开，放入面条', '面条煮熟后加入炒蛋，加盐调味即可'],
  '面条不要煮太久，保持筋道'),
('香煎三文鱼', '海鲜', 'dinner', 280, 32, 16, 2, 15, '简单',
  ARRAY['三文鱼用厨房纸吸干水分', '两面撒上盐和黑胡椒腌制10分钟', '平底锅放少许油，中火加热', '三文鱼皮朝下放入锅中，煎3-4分钟', '翻面再煎2-3分钟即可'],
  '三文鱼不要煎太久，保持内部嫩滑'),
('麻婆豆腐', '川菜', 'lunch', 180, 15, 12, 6, 20, '中等',
  ARRAY['豆腐切块，用盐水浸泡10分钟', '锅中放油，放入肉末炒散', '加入豆瓣酱炒出红油', '加入适量水，放入豆腐煮5分钟', '用水淀粉勾芡，撒上花椒粉和葱花即可'],
  '豆腐提前用盐水泡可以去除豆腥味'),
('蔬菜沙拉', '健康餐', 'dinner', 80, 3, 4, 8, 10, '简单',
  ARRAY['西兰花焯水后捞出', '黄瓜切片，胡萝卜切丝', '所有蔬菜放入碗中', '加入橄榄油、柠檬汁、盐、黑胡椒拌匀即可'],
  '沙拉酱可以用酸奶代替更健康'),
('白灼大虾', '海鲜', 'dinner', 120, 22, 2, 3, 10, '简单',
  ARRAY['大虾剪去须脚，挑去虾线', '锅中放水，加入姜片、葱段、料酒', '水开后放入大虾', '煮至虾变红弯曲，捞出即可', '蘸料：生抽+醋+姜末'],
  '虾不要煮太久，肉质会变老'),
('青椒肉丝', '家常菜', 'lunch', 220, 18, 14, 6, 20, '简单',
  ARRAY['猪肉切丝，加料酒、生抽、淀粉腌制', '青椒切丝', '锅中放油，放入肉丝滑散盛出', '锅中留油，放入青椒翻炒', '加入肉丝，加盐、生抽调味即可'],
  '肉丝腌制时加少许油可以防止粘连'),
('菠菜蛋花汤', '汤类', 'dinner', 60, 6, 3, 4, 10, '简单',
  ARRAY['菠菜洗净切段，鸡蛋打散', '锅中放水煮开，放入菠菜', '菠菜煮软后，慢慢倒入蛋液', '加盐、香油调味即可'],
  '菠菜提前焯水可以去除草酸'),
('土豆炖牛肉', '家常菜', 'lunch', 320, 25, 15, 22, 90, '中等',
  ARRAY['牛肉切块，冷水下锅焯水', '土豆去皮切块', '锅中放油，放入牛肉翻炒', '加入葱姜、八角、桂皮、生抽、老抽', '加入适量水，大火烧开转小火炖60分钟', '加入土豆继续炖20分钟即可'],
  '牛肉炖煮时间要足够，才会软烂'),
('蒸蛋羹', '家常菜', 'breakfast', 100, 10, 6, 2, 15, '简单',
  ARRAY['鸡蛋打散，加入1.5倍温水', '加盐搅拌均匀，过滤掉泡沫', '盖上保鲜膜，扎几个小孔', '水开后放入，中火蒸10分钟', '淋上生抽、香油，撒葱花即可'],
  '蛋液要过滤，蒸出来的蛋羹更嫩滑'),
('红烧茄子', '家常菜', 'lunch', 150, 3, 10, 14, 25, '中等',
  ARRAY['茄子切条，撒盐腌制10分钟挤出水分', '调酱汁：生抽、老抽、糖、醋、淀粉、水', '锅中放油，放入茄子煎至软糯盛出', '锅中留油，放入蒜末爆香', '倒入茄子，加入酱汁翻炒均匀即可'],
  '茄子提前腌制可以减少吸油');

-- 插入示例价格数据
INSERT INTO ingredient_prices (ingredient_id, price, source, region, date)
SELECT id, 
  CASE 
    WHEN id = 1 THEN 4.5
    WHEN id = 2 THEN 6.8
    WHEN id = 3 THEN 15.8
    WHEN id = 4 THEN 38.0
    WHEN id = 5 THEN 68.0
    WHEN id = 6 THEN 35.0
    WHEN id = 7 THEN 5.8
    WHEN id = 8 THEN 3.5
    WHEN id = 9 THEN 2.8
    WHEN id = 10 THEN 2.5
    WHEN id = 11 THEN 3.0
    WHEN id = 12 THEN 2.5
    WHEN id = 13 THEN 4.0
    WHEN id = 14 THEN 3.0
    WHEN id = 15 THEN 2.8
    WHEN id = 16 THEN 3.5
    WHEN id = 17 THEN 28.0
    WHEN id = 18 THEN 22.0
    WHEN id = 19 THEN 25.0
    WHEN id = 20 THEN 1.5
  END,
  '永辉超市', '北京', CURRENT_DATE
FROM ingredients;

-- 插入食谱食材关联
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit) VALUES
(1, 1, 2, '个'),
(1, 2, 3, '个'),
(2, 19, 1, '条'),
(3, 3, 200, '克'),
(3, 7, 150, '克'),
(4, 17, 500, '克'),
(5, 14, 2, '根'),
(6, 1, 2, '个'),
(6, 2, 2, '个'),
(6, 13, 100, '克'),
(7, 5, 200, '克'),
(8, 11, 300, '克'),
(9, 7, 100, '克'),
(9, 14, 1, '根'),
(9, 10, 50, '克'),
(10, 6, 300, '克'),
(11, 16, 2, '个'),
(12, 8, 200, '克'),
(12, 2, 2, '个'),
(13, 4, 300, '克'),
(13, 9, 2, '个'),
(14, 2, 2, '个'),
(15, 15, 2, '个');
