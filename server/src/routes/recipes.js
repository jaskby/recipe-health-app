const express = require('express');
const router = express.Router();
const { getDb } = require('../database/db');

router.get('/list', (req, res) => {
  const { category, meal_type, limit = 20, offset = 0 } = req.query;
  
  const db = getDb();
  let recipes = [...db.data.recipes];
  
  if (category) {
    recipes = recipes.filter(r => r.category === category);
  }
  
  if (meal_type) {
    recipes = recipes.filter(r => r.meal_type === meal_type);
  }
  
  recipes = recipes.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
  
  const result = recipes.map(recipe => {
    const ingredients = db.data.recipeIngredients
      .filter(ri => ri.recipe_id === recipe.id)
      .map(ri => {
        const ing = db.data.ingredients.find(i => i.id === ri.ingredient_id);
        return {
          name: ing?.name,
          category: ing?.category,
          amount: ri.amount,
          unit: ri.unit
        };
      });
    
    return { ...recipe, ingredients };
  });
  
  res.json(result);
});

router.get('/detail/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  
  const recipe = db.data.recipes.find(r => r.id === parseInt(id));
  if (!recipe) {
    return res.status(404).json({ error: '食谱不存在' });
  }
  
  const ingredients = db.data.recipeIngredients
    .filter(ri => ri.recipe_id === recipe.id)
    .map(ri => {
      const ing = db.data.ingredients.find(i => i.id === ri.ingredient_id);
      return {
        name: ing?.name,
        category: ing?.category,
        amount: ri.amount,
        unit: ri.unit
      };
    });
  
  res.json({ ...recipe, ingredients, estimated_cost: '15.00' });
});

router.post('/daily-menu', (req, res) => {
  const { calories_target } = req.body;
  const db = getDb();
  
  const enrichRecipe = (recipe) => {
    if (!recipe) return null;
    const ingredients = db.data.recipeIngredients
      .filter(ri => ri.recipe_id === recipe.id)
      .map(ri => {
        const ing = db.data.ingredients.find(i => i.id === ri.ingredient_id);
        return { name: ing?.name, amount: ri.amount, unit: ri.unit };
      });
    return { ...recipe, ingredients };
  };
  
  const breakfastRecipes = db.data.recipes.filter(r => r.meal_type === 'breakfast');
  const lunchRecipes = db.data.recipes.filter(r => r.meal_type === 'lunch');
  const dinnerRecipes = db.data.recipes.filter(r => r.meal_type === 'dinner');
  
  const breakfast = enrichRecipe(breakfastRecipes[Math.floor(Math.random() * breakfastRecipes.length)]);
  const lunch = enrichRecipe(lunchRecipes[Math.floor(Math.random() * lunchRecipes.length)]);
  const dinner = enrichRecipe(dinnerRecipes[Math.floor(Math.random() * dinnerRecipes.length)]);
  
  res.json({
    breakfast,
    lunch,
    dinner,
    total_calories: (breakfast?.calories || 0) + (lunch?.calories || 0) + (dinner?.calories || 0)
  });
});

router.post('/random', (req, res) => {
  const { type = 'single' } = req.query;
  const db = getDb();
  
  const enrichRecipe = (recipe) => {
    if (!recipe) return null;
    const ingredients = db.data.recipeIngredients
      .filter(ri => ri.recipe_id === recipe.id)
      .map(ri => {
        const ing = db.data.ingredients.find(i => i.id === ri.ingredient_id);
        return { name: ing?.name, amount: ri.amount, unit: ri.unit };
      });
    return { ...recipe, ingredients };
  };
  
  if (type === 'single') {
    const recipe = db.data.recipes[Math.floor(Math.random() * db.data.recipes.length)];
    res.json({ recipe: enrichRecipe(recipe) });
  } else {
    const breakfastRecipes = db.data.recipes.filter(r => r.meal_type === 'breakfast');
    const lunchRecipes = db.data.recipes.filter(r => r.meal_type === 'lunch');
    const dinnerRecipes = db.data.recipes.filter(r => r.meal_type === 'dinner');
    
    res.json({
      breakfast: enrichRecipe(breakfastRecipes[Math.floor(Math.random() * breakfastRecipes.length)]),
      lunch: enrichRecipe(lunchRecipes[Math.floor(Math.random() * lunchRecipes.length)]),
      dinner: enrichRecipe(dinnerRecipes[Math.floor(Math.random() * dinnerRecipes.length)])
    });
  }
});

router.get('/categories', (req, res) => {
  const db = getDb();
  const categories = [...new Set(db.data.recipes.map(r => r.category))];
  res.json(categories);
});

module.exports = router;
