const express = require('express');
const router = express.Router();
const { supabase } = require('../database/supabase');

router.get('/list', async (req, res) => {
  const { category, meal_type, limit = 20, offset = 0 } = req.query;
  
  try {
    let query = supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients(
          amount, unit,
          ingredients(name, category)
        )
      `)
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (meal_type) {
      query = query.eq('meal_type', meal_type);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    const result = data.map(recipe => ({
      ...recipe,
      ingredients: recipe.recipe_ingredients?.map(ri => ({
        name: ri.ingredients?.name,
        category: ri.ingredients?.category,
        amount: ri.amount,
        unit: ri.unit
      })),
      recipe_ingredients: undefined
    }));
    
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取食谱列表失败' });
  }
});

router.get('/detail/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const { data: recipe, error } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients(
          amount, unit,
          ingredients(name, category, calories, protein, fat, carbs)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error || !recipe) {
      return res.status(404).json({ error: '食谱不存在' });
    }
    
    const result = {
      ...recipe,
      ingredients: recipe.recipe_ingredients?.map(ri => ({
        name: ri.ingredients?.name,
        category: ri.ingredients?.category,
        calories: ri.ingredients?.calories,
        protein: ri.ingredients?.protein,
        fat: ri.ingredients?.fat,
        carbs: ri.ingredients?.carbs,
        amount: ri.amount,
        unit: ri.unit
      })),
      recipe_ingredients: undefined,
      estimated_cost: '15.00'
    };
    
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取食谱详情失败' });
  }
});

router.post('/daily-menu', async (req, res) => {
  const { calories_target } = req.body;
  
  try {
    const { data: breakfastRecipes } = await supabase
      .from('recipes')
      .select('*')
      .eq('meal_type', 'breakfast');
    
    const { data: lunchRecipes } = await supabase
      .from('recipes')
      .select('*')
      .eq('meal_type', 'lunch');
    
    const { data: dinnerRecipes } = await supabase
      .from('recipes')
      .select('*')
      .eq('meal_type', 'dinner');
    
    const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    
    const breakfast = randomPick(breakfastRecipes || []);
    const lunch = randomPick(lunchRecipes || []);
    const dinner = randomPick(dinnerRecipes || []);
    
    res.json({
      breakfast,
      lunch,
      dinner,
      total_calories: (breakfast?.calories || 0) + (lunch?.calories || 0) + (dinner?.calories || 0)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '生成食谱失败' });
  }
});

router.post('/random', async (req, res) => {
  const { type = 'single', category } = req.query;
  
  try {
    if (type === 'single') {
      let query = supabase.from('recipes').select('*');
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data } = await query;
      const recipe = data[Math.floor(Math.random() * data.length)];
      res.json({ recipe });
    } else {
      const { data: breakfastRecipes } = await supabase.from('recipes').select('*').eq('meal_type', 'breakfast');
      const { data: lunchRecipes } = await supabase.from('recipes').select('*').eq('meal_type', 'lunch');
      const { data: dinnerRecipes } = await supabase.from('recipes').select('*').eq('meal_type', 'dinner');
      
      const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
      
      res.json({
        breakfast: randomPick(breakfastRecipes || []),
        lunch: randomPick(lunchRecipes || []),
        dinner: randomPick(dinnerRecipes || [])
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取随机食谱失败' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('category');
    
    if (error) throw error;
    
    const categories = [...new Set(data.map(r => r.category))];
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取分类失败' });
  }
});

module.exports = router;
