const express = require('express');
const router = express.Router()

//controller
const {daftarKonsultasi, addPreferensiWaktuKonsultasi, getMyPreferenceTime} = require('../controllers/konsultasi.controller');

const { authenticateUser, authorizeRoles } = require('../middleware/authentication');

router.route('/daftar').post(authenticateUser,authorizeRoles(2), daftarKonsultasi)
router.route('/prefernces/me')
    .post(authenticateUser, authorizeRoles(2), addPreferensiWaktuKonsultasi)
    .get(authenticateUser, authorizeRoles(2), getMyPreferenceTime)

module.exports = router