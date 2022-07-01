const express = require('express');
const router = express.Router();

//controller
const { addMySchedulePreferences,
    getMySchedulePreferencesByDate,
    getAvailableSchedulebyDate } = require('../controllers/konselor.controller');
//authenticate user
const { authenticateUser, authorizeRoles } = require('../middleware/authentication')

router.route('/jadwal/me').post(authenticateUser, authorizeRoles(3,4), addMySchedulePreferences)
router.route('/jadwal/me/:date').get(authenticateUser, authorizeRoles(3,4), getMySchedulePreferencesByDate)
router.route('/jadwal/:date').get(authenticateUser, getAvailableSchedulebyDate)


module.exports = router