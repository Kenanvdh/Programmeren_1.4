const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meal.controller');
const authController = require('../controllers/authentication.controller');

// Hier werk je de routes uit.

// UC-301 Registreren als nieuwe meal
router.post('', mealController.createMeal);

//UC-302 Updaten meal

// UC-303 Opvragen van overzicht van meals
router.get('', mealController.getAllMeals);

//UC-304 Get meal by ID
router.get('/mealId', mealController.getAllMeals);

//UC 305 Verwijderen meal
router.delete('/:mealId', authController.validateToken, mealController.deleteMeal);

module.exports = router;