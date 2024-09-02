const express = require('express');
const router = express.Router();
const tvController = require('../controllers/tvController');

router.get('/getNews',tvController.getNews);

module.exports = router;