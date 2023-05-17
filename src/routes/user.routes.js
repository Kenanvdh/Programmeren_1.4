const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authController = require('../controllers/authentication.controller');

// Hier werk je de routes uit.

//UC-201 Registreren als nieuwe user
router.post('', userController.createUser);

//UC-202 
router.get('', userController.getAllUsers);

// UC-203 Haal het userprofile op van de user die ingelogd is
router.get(
    '/profile',
    authController.validateToken,
    userController.getUserProfile
);

//UC-204
router.get('/:userId', userController.getUser);

//UC-205
router.put('/:userId', userController.updateUser);

//UC-206
router.delete('/:userId', userController.deleteUser);

module.exports = router;