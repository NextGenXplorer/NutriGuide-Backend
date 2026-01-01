const { getFoodDatabase } = require('../data/foodLoader');

// Get foods filtered by diet preference
const filterByDiet = (foods, dietType) => {
  switch (dietType) {
    case 'veg':
    case 'vegetarian':
      return foods.filter(food => food.is_vegetarian === true);
    case 'vegan':
      return foods.filter(food => food.is_vegan === true);
    case 'non-veg':
    case 'nonveg':
      return foods; // All foods available
    default:
      return foods;
  }
};

// Sort foods by goal suitability
const sortByGoal = (foods, goal) => {
  const scoreField = goal === 'weight_gain'
    ? 'weight_gain_score'
    : goal === 'weight_loss'
      ? 'weight_loss_score'
      : 'maintenance_score';

  return [...foods].sort((a, b) => b[scoreField] - a[scoreField]);
};

// Get food recommendations based on user profile
const getRecommendations = (options = {}) => {
  const {
    goal = 'maintenance',      // weight_gain, weight_loss, maintenance
    diet = 'veg',              // veg, non-veg, vegan
    category = null,           // breakfast, lunch, dinner, snack, beverage
    limit = 20,
    exclude_codes = []         // Already eaten today
  } = options;

  let foods = getFoodDatabase();

  // Filter by diet preference
  foods = filterByDiet(foods, diet);

  // Exclude already consumed foods
  if (exclude_codes.length > 0) {
    foods = foods.filter(food => !exclude_codes.includes(food.food_code));
  }

  // Filter by meal category if specified
  if (category) {
    foods = filterByMealCategory(foods, category);
  }

  // Sort by goal suitability
  foods = sortByGoal(foods, goal);

  // Return top recommendations
  return foods.slice(0, limit).map(food => ({
    food_code: food.food_code,
    food_name: food.food_name,
    energy_kcal: food.energy_kcal,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    fiber: food.fiber,
    serving_unit: food.serving_unit,
    serving_energy_kcal: food.serving_energy_kcal,
    is_vegetarian: food.is_vegetarian,
    suitability_score: goal === 'weight_gain'
      ? food.weight_gain_score
      : goal === 'weight_loss'
        ? food.weight_loss_score
        : food.maintenance_score
  }));
};

// Categorize foods by meal type based on name
const filterByMealCategory = (foods, category) => {
  const categoryKeywords = {
    breakfast: [
      'porridge', 'daliya', 'paratha', 'poha', 'upma', 'idli', 'dosa',
      'toast', 'sandwich', 'cereal', 'cornflakes', 'oatmeal', 'egg',
      'omelette', 'pancake', 'cheela', 'uttapam'
    ],
    lunch: [
      'rice', 'chawal', 'roti', 'chapati', 'dal', 'curry', 'sabzi',
      'biryani', 'pulao', 'khichdi', 'thali', 'rajma', 'chole'
    ],
    dinner: [
      'rice', 'roti', 'chapati', 'dal', 'curry', 'sabzi', 'khichdi',
      'soup', 'salad'
    ],
    snack: [
      'samosa', 'pakora', 'bhaji', 'chaat', 'namkeen', 'biscuit',
      'cookie', 'cake', 'ladoo', 'barfi', 'halwa', 'nuts', 'chips'
    ],
    beverage: [
      'tea', 'chai', 'coffee', 'juice', 'lassi', 'milkshake', 'sharbat',
      'drink', 'smoothie', 'water', 'lemonade', 'nimbu', 'cooler'
    ]
  };

  const keywords = categoryKeywords[category.toLowerCase()] || [];
  if (keywords.length === 0) return foods;

  return foods.filter(food => {
    const nameLower = food.food_name.toLowerCase();
    return keywords.some(keyword => nameLower.includes(keyword));
  });
};

// Get meal plan for a day
const getDailyMealPlan = (options = {}) => {
  const { goal, diet, target_calories } = options;

  const breakfast = getRecommendations({
    goal, diet, category: 'breakfast', limit: 3
  });

  const lunch = getRecommendations({
    goal, diet, category: 'lunch', limit: 3
  });

  const dinner = getRecommendations({
    goal, diet, category: 'dinner', limit: 3
  });

  const snacks = getRecommendations({
    goal, diet, category: 'snack', limit: 2
  });

  const beverages = getRecommendations({
    goal, diet, category: 'beverage', limit: 2
  });

  // Calculate total nutrition for top picks
  const topPicks = [breakfast[0], lunch[0], dinner[0], snacks[0]].filter(Boolean);
  const totalCalories = topPicks.reduce((sum, food) => sum + (food?.energy_kcal || 0), 0);

  return {
    meal_plan: {
      breakfast: breakfast.slice(0, 3),
      lunch: lunch.slice(0, 3),
      dinner: dinner.slice(0, 3),
      snacks: snacks.slice(0, 2),
      beverages: beverages.slice(0, 2)
    },
    suggested_totals: {
      estimated_calories: totalCalories,
      target_calories: target_calories || null
    }
  };
};

// Get foods for specific nutritional needs
const getFoodsForNutrient = (nutrient, diet = 'veg', limit = 10) => {
  let foods = getFoodDatabase();
  foods = filterByDiet(foods, diet);

  // Sort by specified nutrient content
  const nutrientMap = {
    protein: 'protein',
    calcium: 'calcium',
    iron: 'iron',
    fiber: 'fiber',
    vitamin_c: 'vitamin_c',
    vitamin_a: 'vitamin_a'
  };

  const field = nutrientMap[nutrient];
  if (!field) return [];

  return [...foods]
    .sort((a, b) => b[field] - a[field])
    .slice(0, limit)
    .map(food => ({
      food_code: food.food_code,
      food_name: food.food_name,
      [nutrient]: food[field],
      energy_kcal: food.energy_kcal,
      is_vegetarian: food.is_vegetarian
    }));
};

module.exports = {
  getRecommendations,
  getDailyMealPlan,
  getFoodsForNutrient,
  filterByDiet,
  sortByGoal
};
