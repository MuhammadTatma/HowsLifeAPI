const moment = require('moment-timezone')
const dbPool = require('../db/connectDB')
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const daftarKonsultasi = async (req, res) => {
    const { jenisKonselor, kelaminKonselor, riwayatKonsultasi, subject, masalah, usaha, kendala } = req.body

    if(!jenisKonselor || !kelaminKonselor || !riwayatKonsultasi || !subject || !masalah || !usaha || !kendala){
        throw new CustomError.BadRequestError('Please provide all required data');
    }

    const { userId } = req.user
    const timeStamp = moment.tz(new Date(), "Asia/Jakarta").format('YYYY-MM-DD HH:mm:ss')
    const cek  = `
    SELECT 
    k.id
    FROM konsultasi k
    WHERE (k.status = "waiting" or (k.status = "scheduled" and k.scheduled_time > '${timeStamp}')) AND k.id_user = ${userId}
    `
    await dbPool.query(cek).then(([rows,fields])=>{
        const haveOnGoingRequest = rows.length > 0
        if(haveOnGoingRequest){
            throw new CustomError.BadRequestError("You Already have waiting or scheduled request")
        }
    })

    const q =  `INSERT INTO 
    konsultasi (id_user, pref_konselor_type, pref_kelamin_konselor, permasalahan, usaha, kendala, riwayat_tempat_lain, subject_masalah, created, status) VALUES ( ${userId}, "${jenisKonselor}", "${kelaminKonselor}", "${masalah}", "${usaha}", "${kendala}", ${riwayatKonsultasi}, "${subject}", "${timeStamp}", "waiting" )`

    await dbPool.query(q)
        .then(([rows]) => {
            return res.status(StatusCodes.CREATED).json({
                "success": true,
                "message" : "Successfully created",
                "data": {
                    konsultasiId: rows.insertId
                }
            })
        })
}

const addPreferensiWaktuKonsultasi = async (req, res) => {
    const { data } = req.body
    const { userId } = req.user

    if(!data){
        throw new CustomError.BadRequestError("Please provide data")
    }

    let q = `SELECT id FROM konsultasi WHERE id_user = ${userId} AND status = "waiting"`;
    const [rows,fields] = await dbPool.query(q)

    const haveWaitingRequest = rows.length > 0
    if(!haveWaitingRequest){
        throw new CustomError.BadRequestError("You don't have waiting request")
    }
    const idKonsultasi = rows[0].id
    
    q = `INSERT INTO konsultasi_preferensi (id_konsultasi, time) VALUES `

    data.forEach( (iter) => {
        if(!iter.date || !iter.time){
            throw new CustomError.BadRequestError("please provide date and time in your data")
        }
        iter.time.forEach( (time) => {
            q += `(${idKonsultasi}, "${iter.date} ${time}"),`
        })
    });

    const finalQuery = q.slice(0,-1)
    await dbPool.query(finalQuery)
        .then(([rows,fields])=>{
            res.status(StatusCodes.CREATED).json({
                success : true,
                message : "Success Created Preferences"
            })
        })
}

const getMyPreferenceTime = async (req, res) => {
    const { userId } = req.user

    const q =  `SELECT DATE_FORMAT(kp.time,"%W, %e %M %Y") as date, DATE_FORMAT(kp.time,"%H:%S") as time  FROM konsultasi_preferensi kp LEFT JOIN konsultasi k on kp.id_konsultasi = k.id WHERE k.status = "waiting" AND k.id_user = ${userId} `

    const [rows,fields] = await dbPool.query(q)
    const haveWaitingRequest = rows.length > 0
    if(!haveWaitingRequest){
        throw new CustomError.BadRequestError("You don't have waiting request")
    }

    res.status(StatusCodes.OK).json({
        success : true,
        message : "Success get preferences time",
        data : rows
    })
}

const cancelKonsultasi = async (req, res) => {
    const { userId } = req.user

    let q = `SELECT id FROM konsultasi WHERE id_user = ${userId} AND status = "waiting"`;

    const [rows,fields] = await dbPool.query(q)
    const haveWaitingRequest = rows.length > 0
    if(!haveWaitingRequest){
        throw new CustomError.BadRequestError("You don't have waiting request")
    }
    const idKonsultasi = rows[0].id
    q = `UPDATE konsultasi SET status = "canceled" WHERE id = ${idKonsultasi};`
    await dbPool.query(q)
        .then(([rows,fields])=>{
            res.status(StatusCodes.OK).json({
                success : true,
                message : "Successfully Cancel"
            })
        })
}

const getMySumarry = async (req, res) =>{
    const { userId } = req.user
    const timeStamp = moment.tz(new Date(), "Asia/Jakarta").format('YYYY-MM-DD HH:mm:ss')
    
    const  q = `
    SELECT 
        u.name,
        k.id as id_konsultasi,
        CASE WHEN k.scheduled_time < '${timeStamp}' THEN null ELSE k.status end as status,
        CASE WHEN k.scheduled_time < '${timeStamp}' THEN null ELSE k.scheduled_time end as scheduled_time
    FROM users u LEFT JOIN konsultasi k on u.id = k.id_user
    WHERE u.id = ${userId}  AND ( iSNULL(k.status) or k.status = "waiting" or k.status = "scheduled")
   ORDER BY CASE WHEN ISNULL(k.scheduled_time) THEN 0 ELSE 1 end, scheduled_time desc LIMIT 1
    `
    await dbPool.query(q)
        .then(([rows,fields]) => {
            const haveOnGoingRequest = rows[0].status !==  null || rows[0].status !== undefined
            if(haveOnGoingRequest){
                return res.status(StatusCodes.OK).json({
                    success : true,
                    message : "success",
                    data : {
                        name : rows[0].name,
                        haveOnGoingRequest: haveOnGoingRequest,
                        konsultasi : rows[0].id_konsultasi?{
                            status : rows[0].status,
                            detailed : rows[0].status == 'waiting'? null : `https://howslifeapi.herokuapp.com/api/v1/pasien/me/konsultasi/${rows[0].id_konsultasi}`
                        }:null
                    }
                })
            }
            return res.status(StatusCodes.OK).json({
                success : true,
                message : "success",
                data : {
                    name : rows[0].name,
                    haveOnGoingRequest: haveOnGoingRequest
                }
            })
        })
    
    
}

const getMySingleKonsultasi = async (req,res) => {
    const { userId } = req.user
    const {idKonsultasi} = req.params
    const timeStamp = moment.tz(new Date(), "Asia/Jakarta").format('YYYY-MM-DD HH:mm:ss')
    const q = `
    WITH konselors AS (
		SELECT 
			u.id as konselor_id,
			u.name,
			u.jenis_kelamin,
			u.no_telepon,
			r.role
		FROM users u left join roles r on u.role = r.id
		WHERE u.role in(3,4)
	)

    SELECT 
        u.name as namaPasien,
        k.status,
        kon.name as namaKonselor,
        kon.role,
        kon.jenis_kelamin,
        kon.no_telepon,
        DATE_FORMAT(k.scheduled_time, "%W, %e %M %Y %T") as jadwal
    FROM users u LEFT JOIN konsultasi k on u.id = k.id_user LEFT JOIN konselors kon on  kon.konselor_id = k.id_konselor
    WHERE u.id =  ${userId} AND k.id = ${idKonsultasi} AND ( iSNULL(k.status) or k.status = "waiting" or k.status = "scheduled")
    `

    await dbPool.query(q)
        .then(([rows,fields]) => {
            if(rows.length <= 0){
                throw new CustomError.BadRequestError("Konsultasi tidak ditemukan");
            }


            res.status(StatusCodes.OK).json({
                success : true,
                message : "success",
                data : rows[0]
            })
        })
}


module.exports = {
    daftarKonsultasi, addPreferensiWaktuKonsultasi, getMyPreferenceTime, cancelKonsultasi, getMySumarry, getMySingleKonsultasi
}
