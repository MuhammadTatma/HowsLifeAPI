const express = require('express');
const router = express.Router();

const { login, register } = require('../controllers/auth.controller')

router.route('/register/pasien').post(register('pasien'))
router.route('/register/konselor').post(register('konselor'))
router.route('/register/admin').post(register('admin'))
router.route('/login').post(login)


module.exports = router