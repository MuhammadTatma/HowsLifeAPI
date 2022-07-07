const express = require('express');
const router = express.Router()

//controller
const {daftarKonsultasi, addPreferensiWaktuKonsultasi, getMyPreferenceTime, cancelKonsultasi, getMySumarry} = require('../controllers/pasien.controller');

const { authenticateUser, authorizeRoles } = require('../middleware/authentication');

router.route('/me').get(authenticateUser, getMySumarry)
router.route('/me/daftar').post(authenticateUser,authorizeRoles(2), daftarKonsultasi)
router.route('/me/preferences')
    .post(authenticateUser, authorizeRoles(2), addPreferensiWaktuKonsultasi)
    .get(authenticateUser, authorizeRoles(2), getMyPreferenceTime)
router.route('/me/cancel').post(authenticateUser, authorizeRoles(2), cancelKonsultasi)

module.exports = router