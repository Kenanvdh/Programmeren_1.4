const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meal.controller');
const authController = require('../controllers/authentication.controller');

// Hier werk je de routes uit.

// UC-301 Registreren als nieuwe meal
router.get('', mealController.getAllMeals);

// UC-302 Opvragen van overzicht van meals
router.post('', mealController.createMeal);

//UC-303 Deleten meal
router.delete('/:mealId', authController.validateToken, mealController.deleteMeal);

module.exports = router;