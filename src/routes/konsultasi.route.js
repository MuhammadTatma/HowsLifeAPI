const express = require('express');
const router = express.Router()

//controller
const {daftarKonsultasi} = require('../controllers/konsultasi.controller');

const { authenticateUser, authorizeRoles } = require('../middleware/authentication')

router.route('/daftar').post(authenticateUser,authorizeRoles(2), daftarKonsultasi)

module.exports = router