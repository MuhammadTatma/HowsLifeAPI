const express = require('express');
const router = express.Router();

//controller
const {getDashboardInfo, getPasienStatistik, getKonsultasiStatistik, getDaftarPasien, getDaftarKonselor } = require('../controllers/admin.controller')

router.route('/dashboard').get(getDashboardInfo)
router.route('/statistik/pasien').get(getPasienStatistik)
router.route('/statistik/konsultasi').get(getKonsultasiStatistik)
router.route('/pasien').get(getDaftarPasien)
router.route('/konselor').get(getDaftarKonselor)

module.exports = router