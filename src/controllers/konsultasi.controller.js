const moment = require('moment-timezone')
const dbPool = require('../db/connectDB')
const { StatusCodes } = require('http-status-codes');

const daftarKonsultasi = async (req, res) => {
    const { jenisKonselor, kelaminKonselor, riwayatKonsultasi, subject, masalah, usaha, kendala } = req.body
    const { userId } = req.user
    const timeStamp = moment.tz(new Date(), "Asia/Jakarta").format('YYYY-MM-DD HH:mm:ss')
    const q =  `INSERT INTO 
    konsultasi (id_user, pref_konselor_type, pref_kelamin_konselor, permasalahan, usaha, kendala, riwayat_tempat_lain, subject_masalah, created) VALUES ( ${userId}, "${jenisKonselor}", "${kelaminKonselor}", "${masalah}", "${usaha}", "${kendala}", ${riwayatKonsultasi}, "${subject}", "${timeStamp}" )`

    await dbPool.query(q)
        .then(() => {
            return res.status(StatusCodes.CREATED).json({
                "success": true,
                "message" : "Successfully created",
                "data" : null
            })
        })
}


module.exports = {
    daftarKonsultasi
}
