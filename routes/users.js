const express = require('express');
const router = express.Router(); // this const router is limited to this module only
const usersController = require('../controllers/users_controller');

router.get('/profile' , usersController.profile);


module.exports = router;