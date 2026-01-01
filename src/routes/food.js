const express = require('express');
const router = express.Router();
const { searchFoods, getFoodByCode, getFoodDatabase } = require('../data/foodLoader');
const { getRecommendations, getDailyMealPlan, getFoodsForNutrient } = require('../utils/foodRecommender');
const { calculateHealthProfile, calculateBMI, getBMICategory } = require('../utils/bmi');

// GET /api/food/search?q=chicken&limit=20
router.get('/search', (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const results = searchFoods(q.trim(), parseInt(limit));

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/food/:code - Get food details by code
router.get('/details/:code', (req, res) => {
  try {
    const { code } = req.params;
    const food = getFoodByCode(code);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food not found'
      });
    }

    res.json({
      success: true,
      data: food
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/food/all - Get all foods (with pagination)
router.get('/all', (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const allFoods = getFoodDatabase();
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const paginatedFoods = allFoods.slice(startIndex, endIndex);

    res.json({
      success: true,
      pagination: {
        current_page: pageNum,
        total_pages: Math.ceil(allFoods.length / limitNum),
        total_items: allFoods.length,
        items_per_page: limitNum
      },
      data: paginatedFoods
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/food/recommend - Get food recommendations
router.post('/recommend', (req, res) => {
  try {
    const {
      goal = 'maintenance',  // weight_gain, weight_loss, maintenance
      diet = 'veg',          // veg, non-veg, vegan
      category = null,       // breakfast, lunch, dinner, snack, beverage
      limit = 20,
      exclude = []           // Array of food_codes already eaten
    } = req.body;

    const recommendations = getRecommendations({
      goal,
      diet,
      category,
      limit,
      exclude_codes: exclude
    });

    res.json({
      success: true,
      goal,
      diet,
      category,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/food/meal-plan - Get daily meal plan
router.post('/meal-plan', (req, res) => {
  try {
    const {
      goal = 'maintenance',
      diet = 'veg',
      target_calories = null
    } = req.body;

    const mealPlan = getDailyMealPlan({
      goal,
      diet,
      target_calories
    });

    res.json({
      success: true,
      goal,
      diet,
      ...mealPlan
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/food/high/:nutrient - Get foods high in specific nutrient
router.get('/high/:nutrient', (req, res) => {
  try {
    const { nutrient } = req.params;
    const { diet = 'veg', limit = 10 } = req.query;

    const validNutrients = ['protein', 'calcium', 'iron', 'fiber', 'vitamin_c', 'vitamin_a'];

    if (!validNutrients.includes(nutrient)) {
      return res.status(400).json({
        success: false,
        message: `Invalid nutrient. Choose from: ${validNutrients.join(', ')}`
      });
    }

    const foods = getFoodsForNutrient(nutrient, diet, parseInt(limit));

    res.json({
      success: true,
      nutrient,
      diet,
      count: foods.length,
      data: foods
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/food/smart-recommend - Smart recommendations based on full user profile
router.post('/smart-recommend', (req, res) => {
  try {
    const {
      height,       // cm
      weight,       // kg
      age,
      gender,       // male/female
      diet,         // veg/non-veg/vegan
      activity_level = 'moderate',
      custom_goal = null  // Override BMI-based goal
    } = req.body;

    // Validate required fields
    if (!height || !weight || !age || !gender || !diet) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: height, weight, age, gender, diet'
      });
    }

    // Calculate health profile
    const healthProfile = calculateHealthProfile({
      height,
      weight,
      age,
      gender,
      activity_level
    });

    // Determine goal
    const goal = custom_goal || healthProfile.bmi.suggested_goal;

    // Get meal plan based on calculated values
    const mealPlan = getDailyMealPlan({
      goal,
      diet,
      target_calories: healthProfile.daily_calories
    });

    res.json({
      success: true,
      user_profile: {
        height, weight, age, gender, diet, activity_level
      },
      health_assessment: healthProfile,
      recommended_goal: goal,
      ...mealPlan
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/bmi/calculate - BMI calculation with health profile
router.post('/bmi/calculate', (req, res) => {
  try {
    const { height, weight, age, gender, activity_level } = req.body;

    if (!height || !weight) {
      return res.status(400).json({
        success: false,
        message: 'Height (cm) and weight (kg) are required'
      });
    }

    const bmi = calculateBMI(height, weight);
    const category = getBMICategory(bmi);

    const response = {
      success: true,
      bmi: bmi,
      category: category.label,
      suggested_goal: category.goal
    };

    // If age and gender provided, include calories and macros
    if (age && gender) {
      const healthProfile = calculateHealthProfile({
        height,
        weight,
        age,
        gender,
        activity_level: activity_level || 'moderate'
      });
      response.daily_calories = healthProfile.daily_calories;
      response.macros = healthProfile.macros;
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
