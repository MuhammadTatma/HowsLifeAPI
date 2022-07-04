const express = require('express');
const router = express.Router();

//controller
const { getAllArticle } = require('../controllers/article.controller')

//authenticate user
const { authenticateUser } = require('../middleware/authentication')

//route
router.route('/').get(getAllArticle)


module.exports = router