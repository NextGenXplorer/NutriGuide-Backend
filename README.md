# NutriGuide Backend API

![Vercel](https://img.shields.io/badge/Vercel-Deployed-brightgreen?logo=vercel)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue)
![Foods](https://img.shields.io/badge/Foods-1014-orange)
![API](https://img.shields.io/badge/API-Live-success)

**Live API:** [https://nutri-guide-backend.vercel.app](https://nutri-guide-backend.vercel.app)

A Node.js/Express API for the NutriGuide Flutter app - Indian nutrition database with BMI calculation and personalized food recommendations.

## Features

- **1014 Indian Foods** - Complete nutritional data from INDB 2024.11
- **BMI Calculator** - With daily calorie & macro recommendations
- **Smart Recommendations** - Based on weight goals (gain/loss/maintain)
- **Diet Filtering** - Vegetarian, Non-Vegetarian, Vegan options
- **Meal Planning** - Breakfast, lunch, dinner, snacks suggestions
- **Nutrient Search** - Find foods high in protein, iron, calcium, etc.

## Quick Start

```bash
# Install dependencies
npm install

# Start server
npm start

# Server runs on http://localhost:3000
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/api/stats` | GET | Database statistics |
| `/api/food/search?q=paneer` | GET | Search foods |
| `/api/food/details/:code` | GET | Food details |
| `/api/food/all` | GET | All foods (paginated) |
| `/api/food/recommend` | POST | Food recommendations |
| `/api/food/meal-plan` | POST | Daily meal plan |
| `/api/food/high/:nutrient` | GET | Foods high in nutrient |
| `/api/food/smart-recommend` | POST | Smart recommendations |
| `/api/bmi/calculate` | POST | BMI calculation |

## Main Endpoint for Flutter

**POST `/api/food/smart-recommend`**

Send user profile, get personalized meal plan:

```json
{
  "height": 170,
  "weight": 75,
  "age": 25,
  "gender": "male",
  "diet": "veg",
  "activity_level": "moderate"
}
```

Response includes:
- BMI value & category
- Suggested goal (weight_gain/loss/maintenance)
- Daily calories & macros (protein, carbs, fat)
- Personalized meal plan

## BMI Calculation

**POST `/api/bmi/calculate`**

```json
{
  "height": 170,
  "weight": 70,
  "age": 25,
  "gender": "male"
}
```

Response:
```json
{
  "success": true,
  "bmi": 24.2,
  "category": "Normal",
  "suggested_goal": "maintenance",
  "daily_calories": 2635,
  "macros": {
    "protein_g": 165,
    "carbs_g": 329,
    "fat_g": 73
  }
}
```

## BMI Categories

| BMI | Category | Goal |
|-----|----------|------|
| < 18.5 | Underweight | weight_gain |
| 18.5 - 24.9 | Normal | maintenance |
| 25 - 29.9 | Overweight | weight_loss |
| ≥ 30 | Obese | weight_loss |

## Database Info

- **Source**: Indian Nutrient Database (INDB) 2024.11
- **Total Foods**: 1014
- **Vegetarian**: 873
- **Non-Vegetarian**: 141
- **Nutrients**: 40+ per food item

## Tech Stack

- Node.js
- Express.js
- CSV Parser
- CORS enabled

## Deployment

### Vercel

```bash
npm i -g vercel
vercel --prod
```

Or connect this repo to Vercel dashboard.

## Documentation

See [API.md](./API.md) for complete API documentation with examples.

## License

ISC
