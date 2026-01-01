const express = require('express');
const cors = require('cors');
const path = require('path');
const { loadFoodData, getFoodDatabase } = require('./data/foodLoader');
const foodRoutes = require('./routes/food');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/', (req, res) => {
  res.json({
    name: 'NutriGuide API',
    version: '1.0.0',
    status: 'running',
    pages: {
      privacy_policy: '/privacy-policy.html'
    },
    endpoints: {
      health: 'GET /',
      stats: 'GET /api/stats',
      food_search: 'GET /api/food/search?q=<query>',
      food_details: 'GET /api/food/details/:code',
      food_all: 'GET /api/food/all?page=1&limit=50',
      food_recommend: 'POST /api/food/recommend',
      meal_plan: 'POST /api/food/meal-plan',
      high_nutrient: 'GET /api/food/high/:nutrient',
      smart_recommend: 'POST /api/food/smart-recommend',
      bmi_calculate: 'POST /api/food/bmi/calculate'
    }
  });
});

// Stats endpoint
app.get('/api/stats', (req, res) => {
  const foods = getFoodDatabase();
  const vegCount = foods.filter(f => f.is_vegetarian).length;
  const nonVegCount = foods.length - vegCount;

  res.json({
    success: true,
    data: {
      total_foods: foods.length,
      vegetarian: vegCount,
      non_vegetarian: nonVegCount,
      database_version: 'INDB 2024.11'
    }
  });
});

// Food routes
app.use('/api/food', foodRoutes);

// BMI route (also available under /api/food)
app.use('/api', foodRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    available_endpoints: 'GET / for list of endpoints'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
const startServer = async () => {
  try {
    console.log('Loading food database...');
    await loadFoodData();
    console.log('Food database loaded successfully!');

    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════╗
║         NutriGuide API Server             ║
╠═══════════════════════════════════════════╣
║  Status:  Running                         ║
║  Port:    ${PORT}                            ║
║  URL:     http://localhost:${PORT}           ║
╚═══════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
