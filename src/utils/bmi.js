// BMI Categories based on WHO and Asian standards
const BMI_CATEGORIES = {
  UNDERWEIGHT: { min: 0, max: 18.5, label: 'Underweight', goal: 'weight_gain' },
  NORMAL: { min: 18.5, max: 24.9, label: 'Normal', goal: 'maintenance' },
  OVERWEIGHT: { min: 25, max: 29.9, label: 'Overweight', goal: 'weight_loss' },
  OBESE: { min: 30, max: 100, label: 'Obese', goal: 'weight_loss' }
};

// Calculate BMI from height (cm) and weight (kg)
const calculateBMI = (heightCm, weightKg) => {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10; // Round to 1 decimal
};

// Get BMI category
const getBMICategory = (bmi) => {
  if (bmi < 18.5) return BMI_CATEGORIES.UNDERWEIGHT;
  if (bmi < 25) return BMI_CATEGORIES.NORMAL;
  if (bmi < 30) return BMI_CATEGORIES.OVERWEIGHT;
  return BMI_CATEGORIES.OBESE;
};

// Calculate daily calorie needs (Harris-Benedict equation)
const calculateDailyCalories = (heightCm, weightKg, age, gender, activityLevel = 'moderate') => {
  let bmr;

  if (gender === 'male') {
    bmr = 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age);
  }

  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,      // Little or no exercise
    light: 1.375,        // Light exercise 1-3 days/week
    moderate: 1.55,      // Moderate exercise 3-5 days/week
    active: 1.725,       // Hard exercise 6-7 days/week
    very_active: 1.9     // Very hard exercise or physical job
  };

  const multiplier = activityMultipliers[activityLevel] || 1.55;
  return Math.round(bmr * multiplier);
};

// Calculate ideal weight range (based on BMI 18.5-24.9)
const calculateIdealWeight = (heightCm) => {
  const heightM = heightCm / 100;
  return {
    min: Math.round(18.5 * heightM * heightM),
    max: Math.round(24.9 * heightM * heightM)
  };
};

// Calculate calorie adjustment for goal
const calculateGoalCalories = (maintenanceCalories, goal) => {
  switch (goal) {
    case 'weight_gain':
      return maintenanceCalories + 500; // Surplus for muscle gain
    case 'weight_loss':
      return Math.max(1200, maintenanceCalories - 500); // Deficit, min 1200
    default:
      return maintenanceCalories;
  }
};

// Calculate macro distribution based on goal
const calculateMacros = (calories, goal) => {
  let proteinPercent, carbPercent, fatPercent;

  switch (goal) {
    case 'weight_gain':
      proteinPercent = 0.25;
      carbPercent = 0.50;
      fatPercent = 0.25;
      break;
    case 'weight_loss':
      proteinPercent = 0.35;
      carbPercent = 0.35;
      fatPercent = 0.30;
      break;
    default: // maintenance
      proteinPercent = 0.25;
      carbPercent = 0.50;
      fatPercent = 0.25;
  }

  return {
    protein: Math.round((calories * proteinPercent) / 4), // 4 cal/g
    carbs: Math.round((calories * carbPercent) / 4),      // 4 cal/g
    fat: Math.round((calories * fatPercent) / 9)          // 9 cal/g
  };
};

// Full health assessment
const calculateHealthProfile = (userData) => {
  const { height, weight, age, gender, activity_level } = userData;

  const bmi = calculateBMI(height, weight);
  const category = getBMICategory(bmi);
  const dailyCalories = calculateDailyCalories(height, weight, age, gender, activity_level);
  const goalCalories = calculateGoalCalories(dailyCalories, category.goal);
  const macros = calculateMacros(goalCalories, category.goal);

  return {
    bmi: {
      value: bmi,
      category: category.label,
      suggested_goal: category.goal
    },
    daily_calories: goalCalories,
    macros: {
      protein_g: macros.protein,
      carbs_g: macros.carbs,
      fat_g: macros.fat
    }
  };
};

module.exports = {
  calculateBMI,
  getBMICategory,
  calculateDailyCalories,
  calculateIdealWeight,
  calculateGoalCalories,
  calculateMacros,
  calculateHealthProfile
};
