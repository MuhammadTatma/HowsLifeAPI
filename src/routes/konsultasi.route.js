const express = require('express');
const router = express.Router()

//controller
const { getAllKonsultasi, getKonsultasiByID, requestKonselor } = require('../controllers/konsultasi.controller')

router.route('/').get(getAllKonsultasi)
router.route('/:id').get(getKonsultasiByID)
router.route('/:idKonsultasi/request/:idKonselor').post(requestKonselor)

module.exports = router