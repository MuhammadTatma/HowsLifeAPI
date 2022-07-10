
const dbPool = require('../db/connectDB')
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');


const getDashboardInfo = async (req,res) => {
    const q = `
    WITH konsultasi_stats as (	
        SELECT
            SUM(IF(k.status = 'waiting', 1, 0)) AS "waiting",
            SUM(IF(k.status = 'scheduled', 1, 0)) AS "scheduled",
            SUM(IF(k.status = 'canceled', 1, 0)) AS "canceled",
            SUM(IF(k.status = 'finished', 1, 0)) AS "finished",
            SUM(if(k.subject_masalah = 'keluarga', 1, 0)) AS "subjectKeluarga",
            SUM(if(k.subject_masalah = 'percintaan', 1, 0)) AS "subjectPercintaan",
            SUM(if(k.subject_masalah = 'pendidikan', 1, 0)) AS "subjectPendidikan",
            SUM(if(k.subject_masalah = 'pribadi', 1, 0)) AS "subjectPribadi",
            SUM(if(k.subject_masalah NOT in("keluarga", "percintaan", "pendidikan", "pribadi") , 1, 0)) AS "otherSubject",
            COUNT(*) as totalKonsultasi
        FROM konsultasi k 
    ), user_stats as (
        SELECT
            SUM(IF(u.role = 2, 1, 0)) as pasien,
            SUM(IF(u.role = 3 or u.role = 4 , 1, 0)) as konselor
        FROM users u
    )    
    SELECT
    *
    FROM konsultasi_stats join user_stats
    `
    const [rows] = await dbPool.query(q)

    const {waiting, scheduled,canceled, finished, subjectKeluarga, subjectPercintaan, subjectPendidikan, subjectPribadi, otherSubject, totalKonsultasi, pasien, konselor} = rows[0] 

    const data =  {
        konsultasi: {
            total : totalKonsultasi,
            waiting : waiting,
            scheduled : scheduled,
            canceled: canceled,
            finished: finished
        },
        user : {
            pasien : pasien,
            konselor : konselor
        },
        subjectMasalah : {
            keluarga : subjectKeluarga,
            percintaan : subjectPercintaan,
            pendidikan: subjectPendidikan,
            pribadi : subjectPribadi,
            lainnya : otherSubject
        }
    }

    res.status(StatusCodes.OK).json({
        success: true,
        message: "success get dashboard info",
        data : data
    })
}

const getPasienStatistik = async (req,res) => {
    const data = {
        total : 300,
        kelamin:{
            laki: 120,
            perempuan: 180
        },
        fakultas : {
            fmipa : 20,
            fti : 30,
            fh : 25,
            fk : 36,
            fbe : 44,
            ftsp : 43,
            fpsb : 30,
            fiai: 23
        },
        umur : {
            19 : 50,
            20 : 20,
            21 : 30,
            22 : 100,
            23 : 60,
            24 : 40
        }        
    }

    res.status(StatusCodes.OK).json({
        success: true,
        message: "success get pasien statistics",
        data : data
    })
}

const getKonsultasiStatistik = async (req,res) =>{
    const data = {
        summary : {
            total : 200,
            waiting : 300,
            scheduled : 140,
            canceled : 43,
        },
        request : {
            sebaya : 150,
            profesional : 50
        },
        perasaanSetelahKonsul : {
            lebihBaik : 120,
            biasa : 50,
            buruk: 30
        }
    }

    res.status(StatusCodes.OK).json({
        success: true,
        message: "success get pasien statistics",
        data : data
    })
}

const getDaftarPasien = async (req, res) => {
    const {limit} =  req.query

    let q = `
    SELECT
        u.name,
        TIMESTAMPDIFF(YEAR, u.tanggal_lahir, CURDATE()) AS age,
        u.jenis_kelamin
    FROM users u
    WHERE u.role = 2
    `

    if(limit){
        q += ` limit ${limit} `
    }

    await dbPool.query(q)
        .then(([rows]) => {
            res.status(StatusCodes.OK).json({
                success: true,
                message: "success get pasien statistics",
                data : rows
            })
        })
}

const getDaftarKonselor = async (req, res) => {
    const {limit} = req.query

    let q = `
    SELECT
    u.name,
    r.role,
    u.jenis_kelamin
    FROM users u left join roles r on u.role = r.id
    WHERE u.role = 3 or u.role = 4
    `
    if(limit){
        q += ` limit ${limit} `
    }

    await dbPool.query(q)
        .then(([rows]) => {
            res.status(StatusCodes.OK).json({
                success: true,
                message: "success get pasien statistics",
                data : rows
            })
        })
}

module.exports = {
    getDashboardInfo, getPasienStatistik, getKonsultasiStatistik, getDaftarPasien, getDaftarKonselor
}