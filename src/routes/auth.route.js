const express = require('express');
const router = express.Router();

const { registerPasien, login } = require('../controllers/auth.controller')

router.route('/register/pasien').post(registerPasien)
router.route('/login').post(login)


module.exports = router