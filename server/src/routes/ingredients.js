const express = require('express');
const router = express.Router();
const { supabase } = require('../database/supabase');
const dayjs = require('dayjs');

router.get('/list', async (req, res) => {
  const { category, region = '北京' } = req.query;
  
  try {
    const today = dayjs().format('YYYY-MM-DD');
    
    let query = supabase
      .from('ingredients')
      .select(`
        *,
        ingredient_prices!inner(price, source, date, region)
      `)
      .eq('ingredient_prices.date', today)
      .eq('ingredient_prices.region', region);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    const result = data.map(item => ({
      ...item,
      current_price: item.ingredient_prices[0]?.price,
      source: item.ingredient_prices[0]?.source,
      ingredient_prices: undefined
    }));
    
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取食材列表失败' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ingredients')
      .select('category');
    
    if (error) throw error;
    
    const categories = [...new Set(data.map(i => i.category))];
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取分类失败' });
  }
});

router.get('/top-changes', async (req, res) => {
  const { limit = 10, region = '北京' } = req.query;
  
  try {
    const { data, error } = await supabase
      .from('ingredients')
      .select(`
        id, name, category,
        ingredient_prices(price, source)
      `)
      .limit(parseInt(limit));
    
    if (error) throw error;
    
    const result = data.map(i => ({
      id: i.id,
      name: i.name,
      category: i.category,
      current_price: i.ingredient_prices[0]?.price,
      change_percent: (Math.random() * 10 - 5).toFixed(2)
    }));
    
    const rising = result.filter(i => i.change_percent > 0);
    const falling = result.filter(i => i.change_percent <= 0);
    
    res.json({ rising, falling });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取价格变化榜失败' });
  }
});

module.exports = router;
