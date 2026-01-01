# NutriGuide API Documentation

![API](https://img.shields.io/badge/API-Live-success)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![Foods](https://img.shields.io/badge/Foods-1014-orange)

Complete API reference for NutriGuide Backend - Indian Nutrition Database with BMI & Food Recommendations.

---

## Base URL

**Production (Vercel):**
```
https://nutri-guide-backend.vercel.app
```

**Local Development:**
```
http://localhost:3000
```

---

## Quick Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check & endpoints list |
| `/api/stats` | GET | Database statistics |
| `/api/food/search` | GET | Search foods by name |
| `/api/food/details/:code` | GET | Get food details by code |
| `/api/food/all` | GET | Get all foods (paginated) |
| `/api/food/recommend` | POST | Get food recommendations |
| `/api/food/meal-plan` | POST | Get daily meal plan |
| `/api/food/high/:nutrient` | GET | Foods high in nutrient |
| `/api/food/smart-recommend` | POST | Smart recommendations with BMI |
| `/api/bmi/calculate` | POST | Calculate BMI & daily needs |

---

## Endpoints

### 1. Health Check

Check if API is running and get available endpoints.

**Request:**
```
GET /
```

**Response:**
```json
{
  "name": "NutriGuide API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "health": "GET /",
    "stats": "GET /api/stats",
    "food_search": "GET /api/food/search?q=<query>",
    "food_details": "GET /api/food/details/:code",
    "food_all": "GET /api/food/all?page=1&limit=50",
    "food_recommend": "POST /api/food/recommend",
    "meal_plan": "POST /api/food/meal-plan",
    "high_nutrient": "GET /api/food/high/:nutrient",
    "smart_recommend": "POST /api/food/smart-recommend",
    "bmi_calculate": "POST /api/bmi/calculate"
  }
}
```

---

### 2. Database Statistics

Get statistics about the food database.

**Request:**
```
GET /api/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_foods": 1014,
    "vegetarian": 873,
    "non_vegetarian": 141,
    "database_version": "INDB 2024.11"
  }
}
```

---

### 3. Search Foods

Search foods by name.

**Request:**
```
GET /api/food/search?q={query}&limit={limit}
```

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | Yes | - | Search query (min 2 chars) |
| `limit` | number | No | 20 | Max results to return |

**Example:**
```
GET /api/food/search?q=paneer&limit=5
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "food_code": "BFP001",
      "food_name": "Paneer butter masala",
      "energy_kcal": 245.5,
      "protein": 12.3,
      "carbs": 8.5,
      "fat": 18.2,
      "fiber": 1.2,
      "serving_unit": "bowl",
      "is_vegetarian": true
    }
  ]
}
```

---

### 4. Get Food Details

Get complete nutritional information for a specific food.

**Request:**
```
GET /api/food/details/{food_code}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `food_code` | string | Yes | Unique food code (e.g., ASC001) |

**Example:**
```
GET /api/food/details/ASC001
```

**Response:**
```json
{
  "success": true,
  "data": {
    "food_code": "ASC001",
    "food_name": "Hot tea (Garam Chai)",
    "source": "asc_manual",
    "energy_kcal": 16.14,
    "energy_kj": 68.16,
    "carbs": 2.58,
    "protein": 0.39,
    "fat": 0.53,
    "fiber": 0,
    "sugar": 2.58,
    "sfa": 321.5,
    "mufa": 144.18,
    "pufa": 16.39,
    "cholesterol": 0,
    "calcium": 14.2,
    "phosphorus": 11.5,
    "magnesium": 1.04,
    "sodium": 3.12,
    "potassium": 13.95,
    "iron": 0.02,
    "zinc": 0.04,
    "vitamin_a": 0,
    "vitamin_c": 0.24,
    "vitamin_d": 0,
    "vitamin_e": 0.03,
    "vitamin_b1": 0,
    "vitamin_b2": 0.01,
    "vitamin_b3": 0.01,
    "vitamin_b6": 0,
    "folate": 0.86,
    "serving_unit": "tea cup",
    "serving_energy_kcal": 33.98,
    "serving_carbs": 5.43,
    "serving_protein": 0.82,
    "serving_fat": 1.12,
    "is_vegetarian": true,
    "is_vegan": true
  }
}
```

---

### 5. Get All Foods (Paginated)

Get all foods with pagination.

**Request:**
```
GET /api/food/all?page={page}&limit={limit}
```

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 50 | Items per page |

**Example:**
```
GET /api/food/all?page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "pagination": {
    "current_page": 1,
    "total_pages": 102,
    "total_items": 1014,
    "items_per_page": 10
  },
  "data": [
    {
      "food_code": "ASC001",
      "food_name": "Hot tea (Garam Chai)",
      "energy_kcal": 16.14,
      "protein": 0.39,
      "carbs": 2.58,
      "fat": 0.53,
      "is_vegetarian": true
    }
  ]
}
```

---

### 6. Get Food Recommendations

Get food recommendations based on goal and diet preference.

**Request:**
```
POST /api/food/recommend
Content-Type: application/json
```

**Body:**
```json
{
  "goal": "weight_loss",
  "diet": "veg",
  "category": "breakfast",
  "limit": 10,
  "exclude": ["ASC001", "ASC002"]
}
```

| Field | Type | Required | Default | Options |
|-------|------|----------|---------|---------|
| `goal` | string | No | maintenance | `weight_gain`, `weight_loss`, `maintenance` |
| `diet` | string | No | veg | `veg`, `non-veg`, `vegan` |
| `category` | string | No | null | `breakfast`, `lunch`, `dinner`, `snack`, `beverage` |
| `limit` | number | No | 20 | Max results |
| `exclude` | array | No | [] | Food codes to exclude |

**Response:**
```json
{
  "success": true,
  "goal": "weight_loss",
  "diet": "veg",
  "category": "breakfast",
  "count": 10,
  "data": [
    {
      "food_code": "ASC047",
      "food_name": "Cracked wheat porridge (Meetha daliya)",
      "energy_kcal": 81.57,
      "protein": 2.64,
      "carbs": 8.87,
      "fat": 4.08,
      "fiber": 0.62,
      "serving_unit": "bowl",
      "serving_energy_kcal": 328.71,
      "is_vegetarian": true,
      "suitability_score": 78.5
    }
  ]
}
```

---

### 7. Get Daily Meal Plan

Get a complete daily meal plan based on goal and diet.

**Request:**
```
POST /api/food/meal-plan
Content-Type: application/json
```

**Body:**
```json
{
  "goal": "weight_gain",
  "diet": "veg",
  "target_calories": 2500
}
```

| Field | Type | Required | Default | Options |
|-------|------|----------|---------|---------|
| `goal` | string | No | maintenance | `weight_gain`, `weight_loss`, `maintenance` |
| `diet` | string | No | veg | `veg`, `non-veg`, `vegan` |
| `target_calories` | number | No | null | Target daily calories |

**Response:**
```json
{
  "success": true,
  "goal": "weight_gain",
  "diet": "veg",
  "meal_plan": {
    "breakfast": [
      {
        "food_code": "ASC048",
        "food_name": "Semolina porridge (Suji/Rava daliya)",
        "energy_kcal": 100.89,
        "protein": 3.75
      }
    ],
    "lunch": [
      {
        "food_code": "ASC124",
        "food_name": "Lemon rice (Pulihora)",
        "energy_kcal": 176.3,
        "protein": 4.26
      }
    ],
    "dinner": [
      {
        "food_code": "BFP050",
        "food_name": "Dal tadka",
        "energy_kcal": 120.5,
        "protein": 6.8
      }
    ],
    "snacks": [
      {
        "food_code": "ASC100",
        "food_name": "Roasted chana",
        "energy_kcal": 164,
        "protein": 8.9
      }
    ],
    "beverages": [
      {
        "food_code": "ASC016",
        "food_name": "Banana milkshake",
        "energy_kcal": 65.31,
        "protein": 1.84
      }
    ]
  },
  "suggested_totals": {
    "estimated_calories": 562,
    "target_calories": 2500
  }
}
```

---

### 8. Foods High in Nutrient

Get foods rich in a specific nutrient.

**Request:**
```
GET /api/food/high/{nutrient}?diet={diet}&limit={limit}
```

| Parameter | Type | Required | Default | Options |
|-----------|------|----------|---------|---------|
| `nutrient` | string | Yes | - | `protein`, `calcium`, `iron`, `fiber`, `vitamin_c`, `vitamin_a` |
| `diet` | string | No | veg | `veg`, `non-veg`, `vegan` |
| `limit` | number | No | 10 | Max results |

**Example:**
```
GET /api/food/high/protein?diet=veg&limit=5
```

**Response:**
```json
{
  "success": true,
  "nutrient": "protein",
  "diet": "veg",
  "count": 5,
  "data": [
    {
      "food_code": "BFP120",
      "food_name": "Soya chunks curry",
      "protein": 52.4,
      "energy_kcal": 345.2,
      "is_vegetarian": true
    }
  ]
}
```

---

### 9. Smart Recommendations (Main Endpoint for Flutter)

**This is the primary endpoint for your Flutter app.** Send user profile, get personalized recommendations.

**Request:**
```
POST /api/food/smart-recommend
Content-Type: application/json
```

**Body:**
```json
{
  "height": 170,
  "weight": 75,
  "age": 25,
  "gender": "male",
  "diet": "veg",
  "activity_level": "moderate",
  "custom_goal": null
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `height` | number | Yes | Height in cm |
| `weight` | number | Yes | Weight in kg |
| `age` | number | Yes | Age in years |
| `gender` | string | Yes | `male` or `female` |
| `diet` | string | Yes | `veg`, `non-veg`, or `vegan` |
| `activity_level` | string | No | `sedentary`, `light`, `moderate`, `active`, `very_active` |
| `custom_goal` | string | No | Override BMI goal: `weight_gain`, `weight_loss`, `maintenance` |

**Response:**
```json
{
  "success": true,
  "user_profile": {
    "height": 170,
    "weight": 75,
    "age": 25,
    "gender": "male",
    "diet": "veg",
    "activity_level": "moderate"
  },
  "health_assessment": {
    "bmi": {
      "value": 26.0,
      "category": "Overweight",
      "suggested_goal": "weight_loss"
    },
    "daily_calories": 2150,
    "macros": {
      "protein_g": 188,
      "carbs_g": 188,
      "fat_g": 72
    }
  },
  "recommended_goal": "weight_loss",
  "meal_plan": {
    "breakfast": [...],
    "lunch": [...],
    "dinner": [...],
    "snacks": [...],
    "beverages": [...]
  },
  "suggested_totals": {
    "estimated_calories": 450,
    "target_calories": 2150
  }
}
```

---

### 10. Calculate BMI

Calculate BMI and get daily nutritional requirements.

**Request:**
```
POST /api/bmi/calculate
Content-Type: application/json
```

**Body (Simple - BMI only):**
```json
{
  "height": 170,
  "weight": 70
}
```

**Body (Full - with calories & macros):**
```json
{
  "height": 170,
  "weight": 70,
  "age": 25,
  "gender": "male",
  "activity_level": "moderate"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `height` | number | Yes | Height in cm |
| `weight` | number | Yes | Weight in kg |
| `age` | number | No | Age in years (for full profile) |
| `gender` | string | No | `male` or `female` (for full profile) |
| `activity_level` | string | No | Activity level (default: moderate) |

**Activity Levels:**
| Level | Description | Multiplier |
|-------|-------------|------------|
| `sedentary` | Little or no exercise | 1.2 |
| `light` | Light exercise 1-3 days/week | 1.375 |
| `moderate` | Moderate exercise 3-5 days/week | 1.55 |
| `active` | Hard exercise 6-7 days/week | 1.725 |
| `very_active` | Very hard exercise or physical job | 1.9 |

**Response (Simple):**
```json
{
  "success": true,
  "bmi": 24.2,
  "category": "Normal",
  "suggested_goal": "maintenance"
}
```

**Response (Full):**
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

---

## BMI Categories

| BMI Range | Category | Suggested Goal |
|-----------|----------|----------------|
| < 18.5 | Underweight | weight_gain |
| 18.5 - 24.9 | Normal | maintenance |
| 25 - 29.9 | Overweight | weight_loss |
| >= 30 | Obese | weight_loss |

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

**Common HTTP Status Codes:**
| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (invalid parameters) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Flutter Integration Example

### Dart/Flutter Code:

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class NutriGuideAPI {
  static const String baseUrl = 'https://nutri-guide-backend.vercel.app';

  // Calculate BMI and get recommendations
  static Future<Map<String, dynamic>> getSmartRecommendations({
    required double height,
    required double weight,
    required int age,
    required String gender,
    required String diet,
    String activityLevel = 'moderate',
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/food/smart-recommend'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'height': height,
        'weight': weight,
        'age': age,
        'gender': gender,
        'diet': diet,
        'activity_level': activityLevel,
      }),
    );

    return jsonDecode(response.body);
  }

  // Search foods
  static Future<List<dynamic>> searchFoods(String query) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/food/search?q=$query'),
    );

    final data = jsonDecode(response.body);
    return data['data'];
  }

  // Get food details
  static Future<Map<String, dynamic>> getFoodDetails(String code) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/food/details/$code'),
    );

    final data = jsonDecode(response.body);
    return data['data'];
  }

  // Calculate BMI only
  static Future<Map<String, dynamic>> calculateBMI({
    required double height,
    required double weight,
    int? age,
    String? gender,
  }) async {
    final body = {
      'height': height,
      'weight': weight,
    };

    if (age != null) body['age'] = age;
    if (gender != null) body['gender'] = gender;

    final response = await http.post(
      Uri.parse('$baseUrl/api/bmi/calculate'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );

    return jsonDecode(response.body);
  }
}
```

### Usage in Flutter:

```dart
// Get personalized meal plan
final result = await NutriGuideAPI.getSmartRecommendations(
  height: 170,
  weight: 75,
  age: 25,
  gender: 'male',
  diet: 'veg',
);

print('BMI: ${result['health_assessment']['bmi']['value']}');
print('Category: ${result['health_assessment']['bmi']['category']}');
print('Daily Calories: ${result['health_assessment']['daily_calories']}');
print('Breakfast: ${result['meal_plan']['breakfast']}');
```

---

## Running the Server

```bash
# Install dependencies
npm install

# Start server
npm start

# Server runs on http://localhost:3000
```

---

## Database Info

- **Source**: Indian Nutrient Database (INDB) 2024.11
- **Total Foods**: 1014 items
- **Vegetarian**: 873 items
- **Non-Vegetarian**: 141 items
- **Nutrients**: 40+ nutrients per food item

---

## Try It Live

Test the API directly with curl:

```bash
# Health Check
curl https://nutri-guide-backend.vercel.app/

# Get Stats
curl https://nutri-guide-backend.vercel.app/api/stats

# Search Foods
curl "https://nutri-guide-backend.vercel.app/api/food/search?q=biryani"

# Calculate BMI
curl -X POST https://nutri-guide-backend.vercel.app/api/bmi/calculate \
  -H "Content-Type: application/json" \
  -d '{"height": 170, "weight": 70, "age": 25, "gender": "male"}'

# Smart Recommendations
curl -X POST https://nutri-guide-backend.vercel.app/api/food/smart-recommend \
  -H "Content-Type: application/json" \
  -d '{"height": 170, "weight": 75, "age": 25, "gender": "male", "diet": "veg"}'

# High Protein Foods
curl "https://nutri-guide-backend.vercel.app/api/food/high/protein?diet=veg&limit=5"
```

---

## Notes

1. All nutritional values are per 100g unless specified
2. `serving_*` fields contain per-serving values
3. `is_vegetarian` and `is_vegan` are auto-classified based on food name
4. Goal scores (0-100) indicate food suitability for weight goals
5. CORS is enabled for all origins
