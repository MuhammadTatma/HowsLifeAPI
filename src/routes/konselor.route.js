const express = require('express');
const router = express.Router();

//controller
const { addMySchedulePreferences,
    getMySchedulePreferencesByDate,
    getAvailableSchedulebyDate, 
    getAllPermintaanKonsultasi,
    getDetailedPermintaan, konfirmasiPermintaan,
    getAllMyPasien
} = require('../controllers/konselor.controller');
//authenticate user
const { authenticateUser, authorizeRoles } = require('../middleware/authentication')

router.route('/me/jadwal').post(authenticateUser, authorizeRoles(3,4), addMySchedulePreferences)
router.route('/me/jadwal/:date').get(authenticateUser, authorizeRoles(3,4), getMySchedulePreferencesByDate)
router.route('/me/permintaan').get(authenticateUser, getAllPermintaanKonsultasi)
router.route('/me/permintaan/:idkonsultasi').get(authenticateUser, getDetailedPermintaan).post(authenticateUser, konfirmasiPermintaan)
router.route('/me/mypasien').get(authenticateUser,getAllMyPasien)


router.route('/jadwal/:date').get(authenticateUser, getAvailableSchedulebyDate)


module.exports = router