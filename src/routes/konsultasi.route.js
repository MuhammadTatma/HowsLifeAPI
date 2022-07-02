const express = require('express');
const router = express.Router()

//controller
const { getAllKonsultasi, getKonsultasiByID } = require('../controllers/konsultasi.controller')

router.route('/').get(getAllKonsultasi)
router.route('/:id').get(getKonsultasiByID)

module.exports = router