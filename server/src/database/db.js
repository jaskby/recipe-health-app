const { LowSync } = require('lowdb');
const { JSONFileSync } = require('lowdb/node');
const path = require('path');
const fs = require('fs');

const dbPath = path.join('/tmp', 'recipe_health.json');

let db = null;

function getDb() {
  if (!db) {
    const defaultData = {
      users: [],
      userPreferences: [],
      ingredients: [],
      ingredientPrices: [],
      recipes: [],
      recipeIngredients: [],
      dietPlans: [],
      dietPlanMeals: [],
      weightRecords: [],
      userFavorites: []
    };

    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify(defaultData));
    }

    const adapter = new JSONFileSync(dbPath);
    db = new LowSync(adapter, defaultData);
    db.read();
    
    initSampleData(db);
  }
  return db;
}

function initSampleData(db) {
  if (db.data.ingredients.length === 0) {
    const ingredients = [
      { id: 1, name: '西红柿', category: '蔬菜', unit: '斤', calories: 15, protein: 0.9, fat: 0.2, carbs: 3.3, fiber: 1.2 },
      { id: 2, name: '鸡蛋', category: '蛋奶', unit: '斤', calories: 144, protein: 13.3, fat: 8.8, carbs: 2.8, fiber: 0 },
      { id: 3, name: '鸡胸肉', category: '肉类', unit: '斤', calories: 133, protein: 19.4, fat: 5.0, carbs: 2.5, fiber: 0 },
      { id: 4, name: '牛肉', category: '肉类', unit: '斤', calories: 125, protein: 20.0, fat: 4.2, carbs: 0, fiber: 0 },
      { id: 5, name: '三文鱼', category: '海鲜', unit: '斤', calories: 139, protein: 20.0, fat: 6.3, carbs: 0, fiber: 0 },
      { id: 6, name: '大虾', category: '海鲜', unit: '斤', calories: 87, protein: 18.6, fat: 0.8, carbs: 2.8, fiber: 0 },
      { id: 7, name: '西兰花', category: '蔬菜', unit: '斤', calories: 36, protein: 4.1, fat: 0.6, carbs: 4.3, fiber: 2.6 },
      { id: 8, name: '菠菜', category: '蔬菜', unit: '斤', calories: 23, protein: 2.6, fat: 0.3, carbs: 3.6, fiber: 1.7 },
      { id: 9, name: '土豆', category: '蔬菜', unit: '斤', calories: 81, protein: 2.0, fat: 0.2, carbs: 17.8, fiber: 1.2 },
      { id: 10, name: '胡萝卜', category: '蔬菜', unit: '斤', calories: 37, protein: 1.0, fat: 0.2, carbs: 8.1, fiber: 1.3 },
      { id: 11, name: '豆腐', category: '豆制品', unit: '斤', calories: 81, protein: 8.1, fat: 3.7, carbs: 3.8, fiber: 0.4 },
      { id: 12, name: '米饭', category: '主食', unit: '斤', calories: 116, protein: 2.6, fat: 0.3, carbs: 25.6, fiber: 0.3 },
      { id: 13, name: '面条', category: '主食', unit: '斤', calories: 137, protein: 4.5, fat: 0.5, carbs: 28.0, fiber: 0.8 },
      { id: 14, name: '黄瓜', category: '蔬菜', unit: '斤', calories: 15, protein: 0.8, fat: 0.2, carbs: 2.4, fiber: 0.5 },
      { id: 15, name: '茄子', category: '蔬菜', unit: '斤', calories: 21, protein: 1.1, fat: 0.2, carbs: 4.0, fiber: 1.3 },
      { id: 16, name: '青椒', category: '蔬菜', unit: '斤', calories: 22, protein: 1.0, fat: 0.2, carbs: 4.2, fiber: 1.4 },
      { id: 17, name: '排骨', category: '肉类', unit: '斤', calories: 278, protein: 18.0, fat: 23.1, carbs: 0, fiber: 0 },
      { id: 18, name: '五花肉', category: '肉类', unit: '斤', calories: 349, protein: 9.3, fat: 35.3, carbs: 0, fiber: 0 },
      { id: 19, name: '鲈鱼', category: '海鲜', unit: '斤', calories: 105, protein: 18.6, fat: 3.1, carbs: 0, fiber: 0 },
      { id: 20, name: '白菜', category: '蔬菜', unit: '斤', calories: 13, protein: 1.0, fat: 0.1, carbs: 2.1, fiber: 0.6 }
    ];

    db.data.ingredients = ingredients;

    const today = new Date().toISOString().split('T')[0];
    const prices = [
      { id: 1, ingredient_id: 1, price: 4.5, source: '永辉超市', region: '北京', date: today },
      { id: 2, ingredient_id: 2, price: 6.8, source: '永辉超市', region: '北京', date: today },
      { id: 3, ingredient_id: 3, price: 15.8, source: '永辉超市', region: '北京', date: today },
      { id: 4, ingredient_id: 4, price: 38.0, source: '永辉超市', region: '北京', date: today },
      { id: 5, ingredient_id: 5, price: 68.0, source: '永辉超市', region: '北京', date: today },
      { id: 6, ingredient_id: 6, price: 35.0, source: '永辉超市', region: '北京', date: today },
      { id: 7, ingredient_id: 7, price: 5.8, source: '永辉超市', region: '北京', date: today },
      { id: 8, ingredient_id: 8, price: 3.5, source: '永辉超市', region: '北京', date: today },
      { id: 9, ingredient_id: 9, price: 2.8, source: '永辉超市', region: '北京', date: today },
      { id: 10, ingredient_id: 10, price: 2.5, source: '永辉超市', region: '北京', date: today }
    ];

    db.data.ingredientPrices = prices;
  }

  if (db.data.recipes.length === 0) {
    const recipes = [
      {
        id: 1,
        name: '番茄炒蛋',
        category: '家常菜',
        meal_type: 'lunch',
        calories: 180,
        protein: 12,
        fat: 10,
        carbs: 8,
        cooking_time: 15,
        difficulty: '简单',
        steps: ['西红柿洗净切块，鸡蛋打散加少许盐', '锅中放油，油热后倒入蛋液，炒至凝固盛出', '锅中再加少许油，放入西红柿翻炒出汁', '加入炒好的鸡蛋，翻炒均匀，加盐调味即可'],
        tips: '西红柿要选熟透的，炒出来汁水更多'
      },
      {
        id: 2,
        name: '清蒸鲈鱼',
        category: '海鲜',
        meal_type: 'dinner',
        calories: 150,
        protein: 25,
        fat: 4,
        carbs: 2,
        cooking_time: 25,
        difficulty: '中等',
        steps: ['鲈鱼处理干净，在鱼身两侧划几刀', '鱼身抹少许盐和料酒，腌制10分钟', '葱切丝，姜切片铺在鱼身上', '水开后放入鱼，大火蒸8-10分钟', '出锅后淋上蒸鱼豉油，浇上热油即可'],
        tips: '蒸鱼时间不宜过长，肉质会更嫩'
      },
      {
        id: 3,
        name: '西兰花炒鸡胸肉',
        category: '健康餐',
        meal_type: 'lunch',
        calories: 200,
        protein: 28,
        fat: 6,
        carbs: 10,
        cooking_time: 20,
        difficulty: '简单',
        steps: ['鸡胸肉切丁，加料酒、生抽、淀粉腌制15分钟', '西兰花切小朵，焯水后捞出', '锅中放油，放入鸡胸肉翻炒至变色', '加入西兰花翻炒，加盐、生抽调味即可'],
        tips: '鸡胸肉腌制时加淀粉会更嫩滑'
      },
      {
        id: 4,
        name: '番茄鸡蛋面',
        category: '面食',
        meal_type: 'breakfast',
        calories: 320,
        protein: 14,
        fat: 8,
        carbs: 48,
        cooking_time: 15,
        difficulty: '简单',
        steps: ['西红柿切块，鸡蛋打散', '锅中放油，炒熟鸡蛋盛出', '锅中再放油，放入西红柿炒出汁', '加入适量水煮开，放入面条', '面条煮熟后加入炒蛋，加盐调味即可'],
        tips: '面条不要煮太久，保持筋道'
      },
      {
        id: 5,
        name: '蔬菜沙拉',
        category: '健康餐',
        meal_type: 'dinner',
        calories: 80,
        protein: 3,
        fat: 4,
        carbs: 8,
        cooking_time: 10,
        difficulty: '简单',
        steps: ['西兰花焯水后捞出', '黄瓜切片，胡萝卜切丝', '所有蔬菜放入碗中', '加入橄榄油、柠檬汁、盐、黑胡椒拌匀即可'],
        tips: '沙拉酱可以用酸奶代替更健康'
      }
    ];

    db.data.recipes = recipes;

    const recipeIngredients = [
      { id: 1, recipe_id: 1, ingredient_id: 1, amount: 2, unit: '个' },
      { id: 2, recipe_id: 1, ingredient_id: 2, amount: 3, unit: '个' },
      { id: 3, recipe_id: 2, ingredient_id: 19, amount: 1, unit: '条' },
      { id: 4, recipe_id: 3, ingredient_id: 3, amount: 200, unit: '克' },
      { id: 5, recipe_id: 3, ingredient_id: 7, amount: 150, unit: '克' },
      { id: 6, recipe_id: 4, ingredient_id: 1, amount: 2, unit: '个' },
      { id: 7, recipe_id: 4, ingredient_id: 2, amount: 2, unit: '个' },
      { id: 8, recipe_id: 4, ingredient_id: 13, amount: 100, unit: '克' },
      { id: 9, recipe_id: 5, ingredient_id: 7, amount: 100, unit: '克' },
      { id: 10, recipe_id: 5, ingredient_id: 14, amount: 1, unit: '根' }
    ];

    db.data.recipeIngredients = recipeIngredients;
  }

  db.write();
}

module.exports = { getDb };
