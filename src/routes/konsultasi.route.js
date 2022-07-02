const express = require('express');
const router = express.Router()

//controller
const {daftarKonsultasi, addPreferensiWaktuKonsultasi, getMyPreferenceTime, cancelKonsultasi} = require('../controllers/konsultasi.controller');

const { authenticateUser, authorizeRoles } = require('../middleware/authentication');

router.route('/daftar').post(authenticateUser,authorizeRoles(2), daftarKonsultasi)
router.route('/prefernces/me')
    .post(authenticateUser, authorizeRoles(2), addPreferensiWaktuKonsultasi)
    .get(authenticateUser, authorizeRoles(2), getMyPreferenceTime)
router.route('/cancel/me').post(authenticateUser, authorizeRoles(2), cancelKonsultasi)

module.exports = router