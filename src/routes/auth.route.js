const express = require('express');
const router = express.Router();

const { registerPasien } = require('../controllers/auth.controller')

router.route('/register/pasien').post(registerPasien)


module.exports = router