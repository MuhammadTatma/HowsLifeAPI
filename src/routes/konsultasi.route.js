const express = require('express');
const router = express.Router()

//controller
const {daftarKonsultasi, addPreferensiWaktuKonsultasi} = require('../controllers/konsultasi.controller');

const { authenticateUser, authorizeRoles } = require('../middleware/authentication');

router.route('/daftar').post(authenticateUser,authorizeRoles(2), daftarKonsultasi)
router.route('/jadwal/me').post(authenticateUser, authorizeRoles(2), addPreferensiWaktuKonsultasi)

module.exports = router