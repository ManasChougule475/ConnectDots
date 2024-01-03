// routes/index.js

const express = require('express');
const router = express.Router();

const instagramController = require('../controllers/instagram_controller');

router.get('/instagram/reels', instagramController.reels);

module.exports = router;
