const express = require('express');
const router = express.Router();

//controller
const { addSchedulePreferences, getSchedulePreferencesByDate } = require('../controllers/konselor.controller');
//authenticate user
const { authenticateUser, authorizeRoles } = require('../middleware/authentication')

router.route('/jadwal/me').post(authenticateUser, authorizeRoles(3,4), addSchedulePreferences)
router.route('/jadwal/me/:date').get(authenticateUser, authorizeRoles(3,4), getSchedulePreferencesByDate)


module.exports = router