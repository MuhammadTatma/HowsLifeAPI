const dbPool = require('../db/connectDB')
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors')

const getAllKonsultasi = async (req, res) => {
    let q = `
    SELECT 
        k.id as "konsultasi ID",
        u.name,
        DATE_FORMAT(u.tanggal_lahir,"%e %M %Y") as "tanggal lahir",
        TIMESTAMPDIFF(YEAR, u.tanggal_lahir, CURDATE()) AS age,
        u.jenis_kelamin,
        DATE_FORMAT(k.created, "%W, %e %M %Y  %T WIB") as created,
        k.status
    FROM konsultasi k LEFT JOIN users u on k.id_user = u.id`

    const [rows,fields] = await dbPool.query(q)
    
    res.status(StatusCodes.OK).json({
        success: true,
        message: "Success get all konsultasi",
        data: rows.map((iter) => {
            const konsltasi = {...iter, link : `localhost:3000/api/v1/konsultasi/${iter["konsultasi ID"]}`}
            return konsltasi
        })
    })
}

const getKonsultasiByID = async (req , res) => {
    const idKonsultasi = req.params.id
    let q =`
    SELECT 
        u.name,
        TIMESTAMPDIFF(YEAR, u.tanggal_lahir, CURDATE()) AS age,
        DATE_FORMAT(k.created, "%W, %e %M %Y  %T WIB") as created,
        k.status,
        k.pref_konselor_type,
        k.pref_kelamin_konselor,
        k.subject_masalah,
        k.permasalahan,
        k.usaha,
        k.kendala
    FROM 
        konsultasi k LEFT JOIN users u ON k.id_user = u.id
    WHERE 
        k.id = ${idKonsultasi}
    `
    let [rows,fields] = await dbPool.query(q)

    const notFound = rows.length < 1
    if(notFound){
        throw new CustomError.NotFoundError("ID Not Found")
    }
    const result = {
        ...rows[0]
    }

    q = `
    SELECT
        DATE_FORMAT(kp.time, "%W, %e %M %Y %H:%i WIB") as preferenceTime
    FROM 
        konsultasi_preferensi kp
    WHERE 
        kp.id_konsultasi = ${idKonsultasi}
    `

    await dbPool.query(q)
        .then(([rows,fields]) => {
            result.preferenceTime = rows.map((iter) => iter.preferenceTime)
        })
    
    res.status(StatusCodes.OK).json({
        success: true,
        message: `Success get konsultasi with id ${idKonsultasi}`,
        data: result
    })
}

module.exports = {
    getAllKonsultasi, getKonsultasiByID
}