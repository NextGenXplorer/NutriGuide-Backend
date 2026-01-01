const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

let foodDatabase = [];
let isLoaded = false;

const loadFoodData = () => {
  return new Promise((resolve, reject) => {
    if (isLoaded) {
      resolve(foodDatabase);
      return;
    }

    const csvPath = path.join(__dirname, '../../Anuvaad_INDB_2024.11.csv');

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        // Parse numeric values
        const food = {
          food_code: row.food_code,
          food_name: row.food_name,
          source: row.primarysource,

          // Per 100g values
          energy_kcal: parseFloat(row.energy_kcal) || 0,
          energy_kj: parseFloat(row.energy_kj) || 0,
          carbs: parseFloat(row.carb_g) || 0,
          protein: parseFloat(row.protein_g) || 0,
          fat: parseFloat(row.fat_g) || 0,
          fiber: parseFloat(row.fibre_g) || 0,
          sugar: parseFloat(row.freesugar_g) || 0,

          // Fats breakdown (mg)
          sfa: parseFloat(row.sfa_mg) || 0,
          mufa: parseFloat(row.mufa_mg) || 0,
          pufa: parseFloat(row.pufa_mg) || 0,
          cholesterol: parseFloat(row.cholesterol_mg) || 0,

          // Minerals (mg/ug)
          calcium: parseFloat(row.calcium_mg) || 0,
          phosphorus: parseFloat(row.phosphorus_mg) || 0,
          magnesium: parseFloat(row.magnesium_mg) || 0,
          sodium: parseFloat(row.sodium_mg) || 0,
          potassium: parseFloat(row.potassium_mg) || 0,
          iron: parseFloat(row.iron_mg) || 0,
          zinc: parseFloat(row.zinc_mg) || 0,

          // Vitamins
          vitamin_a: parseFloat(row.vita_ug) || 0,
          vitamin_c: parseFloat(row.vitc_mg) || 0,
          vitamin_d: (parseFloat(row.vitd2_ug) || 0) + (parseFloat(row.vitd3_ug) || 0),
          vitamin_e: parseFloat(row.vite_mg) || 0,
          vitamin_b1: parseFloat(row.vitb1_mg) || 0,
          vitamin_b2: parseFloat(row.vitb2_mg) || 0,
          vitamin_b3: parseFloat(row.vitb3_mg) || 0,
          vitamin_b6: parseFloat(row.vitb6_mg) || 0,
          folate: parseFloat(row.folate_ug) || 0,

          // Serving info
          serving_unit: row.servings_unit || 'serving',
          serving_energy_kcal: parseFloat(row.unit_serving_energy_kcal) || 0,
          serving_carbs: parseFloat(row.unit_serving_carb_g) || 0,
          serving_protein: parseFloat(row.unit_serving_protein_g) || 0,
          serving_fat: parseFloat(row.unit_serving_fat_g) || 0,

          // Diet classification (will be determined)
          is_vegetarian: null,
          is_vegan: null,

          // Goal suitability scores (calculated)
          weight_gain_score: 0,
          weight_loss_score: 0,
          maintenance_score: 0
        };

        // Classify diet type based on food name
        food.is_vegetarian = classifyVegetarian(food.food_name);
        food.is_vegan = classifyVegan(food.food_name);

        // Calculate goal suitability scores
        calculateGoalScores(food);

        foodDatabase.push(food);
      })
      .on('end', () => {
        isLoaded = true;
        console.log(`Loaded ${foodDatabase.length} food items`);
        resolve(foodDatabase);
      })
      .on('error', reject);
  });
};

// Classify if food is vegetarian
const classifyVegetarian = (name) => {
  const nameLower = name.toLowerCase();
  const nonVegKeywords = [
    'chicken', 'mutton', 'lamb', 'beef', 'pork', 'fish', 'prawn', 'shrimp',
    'crab', 'lobster', 'meat', 'keema', 'kebab', 'tikka', 'tandoori',
    'salami', 'bacon', 'ham', 'sausage', 'egg', 'ande', 'omelette',
    'murgh', 'gosht', 'machli', 'jhinga'
  ];

  return !nonVegKeywords.some(keyword => nameLower.includes(keyword));
};

// Classify if food is vegan
const classifyVegan = (name) => {
  const nameLower = name.toLowerCase();
  const nonVeganKeywords = [
    'milk', 'doodh', 'curd', 'dahi', 'yogurt', 'cheese', 'paneer',
    'butter', 'makhan', 'ghee', 'cream', 'malai', 'lassi', 'kheer',
    'ice cream', 'milkshake', 'egg', 'ande', 'honey', 'shahad',
    'chicken', 'mutton', 'fish', 'meat', 'prawn'
  ];

  return !nonVeganKeywords.some(keyword => nameLower.includes(keyword));
};

// Calculate goal suitability scores
const calculateGoalScores = (food) => {
  const { energy_kcal, protein, carbs, fat, fiber, sugar } = food;

  // Weight Gain Score: High calories, high protein, moderate carbs
  food.weight_gain_score = Math.min(100,
    (energy_kcal / 5) + (protein * 3) + (carbs * 0.5) + (fat * 0.3)
  );

  // Weight Loss Score: Low calories, high protein, high fiber, low sugar
  food.weight_loss_score = Math.min(100,
    (100 - energy_kcal / 5) + (protein * 2) + (fiber * 5) - (sugar * 2) - (fat * 0.5)
  );
  if (food.weight_loss_score < 0) food.weight_loss_score = 0;

  // Maintenance Score: Balanced nutrition
  food.maintenance_score = Math.min(100,
    50 + (protein * 1.5) + (fiber * 2) - Math.abs(carbs - 30) * 0.2 - (sugar * 1)
  );
  if (food.maintenance_score < 0) food.maintenance_score = 0;
};

const getFoodDatabase = () => foodDatabase;

const searchFoods = (query, limit = 20) => {
  const queryLower = query.toLowerCase();
  return foodDatabase
    .filter(food => food.food_name.toLowerCase().includes(queryLower))
    .slice(0, limit);
};

const getFoodByCode = (code) => {
  return foodDatabase.find(food => food.food_code === code);
};

module.exports = {
  loadFoodData,
  getFoodDatabase,
  searchFoods,
  getFoodByCode
};
