const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meal.controller');
const authController = require('../controllers/authentication.controller');

// UC-301 Create nieuwe meal
router.post('', authController.validateToken, mealController.createMeal);

//UC-302 Updaten meal -> niet verplicht
// router.put('/:mealId', mealController.updateMeal);

// UC-303 Opvragen van overzicht van meals
router.get('', mealController.getAllMeals);

//UC-304 Get meal by ID
router.get('/:mealId', mealController.getMeal);

//UC 305 Verwijderen meal
router.delete('/:mealId', authController.validateToken, mealController.deleteMeal);

module.exports = router;