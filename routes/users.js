const express = require('express');
const router = express.Router(); // this const router is limited to this module only
const usersController = require('../controllers/users_controller');

router.get('/profile' , usersController.profile);

router.get('/sign-up' , usersController.signUp);

router.get('/sign-in' , usersController.signIn);

router.post('/create' , usersController.create);

router.post('/create-session' , usersController.createSession);


module.exports = router;