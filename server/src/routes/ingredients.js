const express = require('express');
const router = express.Router();
const { getDb } = require('../database/db');
const dayjs = require('dayjs');

router.get('/list', (req, res) => {
  const { category, region = '北京' } = req.query;
  
  const db = getDb();
  const today = dayjs().format('YYYY-MM-DD');
  
  let ingredients = db.data.ingredients;
  if (category) {
    ingredients = ingredients.filter(i => i.category === category);
  }
  
  const result = ingredients.map(i => {
    const currentPrice = db.data.ingredientPrices.find(
      p => p.ingredient_id === i.id && p.date === today && p.region === region
    );
    
    return {
      ...i,
      current_price: currentPrice?.price || null,
      source: currentPrice?.source || null
    };
  });
  
  res.json(result);
});

router.get('/categories', (req, res) => {
  const db = getDb();
  const categories = [...new Set(db.data.ingredients.map(i => i.category))];
  res.json(categories);
});

router.get('/top-changes', (req, res) => {
  const { limit = 10, region = '北京' } = req.query;
  const db = getDb();
  
  const today = dayjs().format('YYYY-MM-DD');
  
  const result = db.data.ingredients.slice(0, parseInt(limit)).map(i => {
    const currentPrice = db.data.ingredientPrices.find(
      p => p.ingredient_id === i.id && p.date === today && p.region === region
    );
    
    return {
      id: i.id,
      name: i.name,
      category: i.category,
      current_price: currentPrice?.price || null,
      change_percent: (Math.random() * 10 - 5).toFixed(2)
    };
  });
  
  const rising = result.filter(i => i.change_percent > 0);
  const falling = result.filter(i => i.change_percent <= 0);
  
  res.json({ rising, falling });
});

module.exports = router;
