const dbPool = require('../db/connectDB')
const { StatusCodes } = require('http-status-codes');
const arrayOfWorkingHour = require('../dummyData/workingHour')
const CustomError = require('../errors')

const addMySchedulePreferences = async (req, res) => {
    const {date, time} = req.body
    const {userId:konselorID} = req.user
    const queryDelete = `DELETE FROM konselor_preferensi where DATE(time) = "${date}" AND konselor_id = ${konselorID} ;`
    let q = `INSERT INTO konselor_preferensi (konselor_id, time) VALUES `;
    time.forEach(element => {
        q += `(${konselorID}, "${date} ${element}"),`
    });
    const finalQuery = q.slice(0,-1);
    await dbPool.query(queryDelete)
        
    await dbPool.query(finalQuery)
        .then(([rows, fields]) => {
            res.status(StatusCodes.CREATED).json({
                success: true,
                message: "Successfuly save",
                data: null
            })
        }) 
}

const getMySchedulePreferencesByDate = async (req, res) => {
    const { date } = req.params
    const { userId:konselorID, name:konselorName } = req.user

    const q = `SELECT LPAD(HOUR(time),2,0) as "hour" FROM konselor_preferensi WHERE DATE(time) = "${date}" AND konselor_id = ${konselorID}`

    await dbPool.query(q)
        .then(([rows, fields]) => {
            const temp = rows.map((iter) => {
                return iter.hour + ":00"
            }) 
            res.status(StatusCodes.OK).json({
                success: true,
                message: "Success GET preference at " + date,
                data: arrayOfWorkingHour.map( (iter) => {
                            return {
                                "time" : iter,
                                "choosed": temp.includes(iter)
                            }
                        })
            })
        })
}

const getAvailableSchedulebyDate = async (req, res) => {
    const {date} = req.params
    const {kelamin, jenis} = req.query
    let q = `SELECT DISTINCT DATE_FORMAT(time, "%H:%i") as "hour" 
                FROM konselor_preferensi kp LEFT JOIN users u on kp.konselor_id = u.id LEFT JOIN roles r on u.role = r.id
                WHERE DATE(time) = "${date}" AND is_available = true`

    console.log(kelamin + " " + jenis);
    if(kelamin){
        q += ` AND u.jenis_kelamin = "${kelamin}"`
    }

    if(jenis){
        q += ` AND r.role LIKE "%${jenis}"`
    }

    await dbPool.query(q)
        .then(([rows,fields]) => {
            res.status(StatusCodes.OK).json({
                success: true,
                message: "Success GET preference at " + date,
                data: {
                    query : kelamin && jenis ?kelamin + ", " + jenis : kelamin || jenis ? kelamin || jenis : null,
                    hour : arrayOfWorkingHour.map( (iter) => {
                            return {
                                "time" : iter,
                                "available": rows.map((iter) => iter.hour).includes(iter)
                            }
                        })
                    }
            })
        })
}

const getAllPermintaanKonsultasi = async (req,res) => {
    const {userId:konselorID} = req.user
    const q = `
    SELECT 
        k.id as "konsultasi ID",
        u.name,
        TIMESTAMPDIFF(YEAR, u.tanggal_lahir, CURDATE()) AS age,
        u.jenis_kelamin,
        DATE_FORMAT(k.created, "%W, %e %M %Y  %T WIB") as created,
        k.status as statuskonsultasi
    FROM konsultasi k LEFT JOIN users u on k.id_user = u.id
        LEFT JOIN request_konselor rk on k.id = rk.id_konsultasi
    WHERE k.status = 'waiting'  AND rk.status = "active" AND rk.id_konselor = ${konselorID}
    `
    await dbPool.query(q)
     .then(([rows,fields]) => {
        res.status(StatusCodes.OK).json({
            success: true,
            message: "Success",
            data: rows.map((iter) => {
                return {
                    ...iter,
                    link : `https://howslifeapi.herokuapp.com/konselor/me/permintaan/${iter["konsultasi ID"]}`
                }
            })
        })
     })
}

const getDetailedPermintaan = async (req,res) => {
    const {idkonsultasi} = req.params
    let q =`
    WITH preference_time as (
        SELECT
            kp.id_konsultasi ,
            GROUP_CONCAT(DATE_FORMAT(kp.time, "%Y-%m-%d %H:%i:%s") SEPARATOR '$') as preferenceTime
        FROM 
            konsultasi_preferensi kp
        WHERE 
            kp.id_konsultasi = ${idkonsultasi}
        GROUP BY kp.id_konsultasi
        )
    SELECT 
        u.name,
        TIMESTAMPDIFF(YEAR, u.tanggal_lahir, CURDATE()) AS age,
        DATE_FORMAT(k.created, "%W, %e %M %Y  %T WIB") as created,
        pt.preferenceTime,
        k.status,
        k.pref_konselor_type,
        k.pref_kelamin_konselor,
        k.subject_masalah,
        k.permasalahan,
        k.usaha,
        k.kendala
    FROM 
        konsultasi k LEFT JOIN users u ON k.id_user = u.id 
        left JOIN preference_time pt on k.id = pt.id_konsultasi
    WHERE 
        k.id = ${idkonsultasi}
    `
    let [rows,fields] = await dbPool.query(q)

    const notFound = rows.length < 1
    if(notFound){
        throw new CustomError.NotFoundError("ID Not Found")
    }
    res.status(StatusCodes.OK).json({
        success: true,
        message: "Success",
        data: {
            ...rows[0],
            preferenceTime: rows[0].preferenceTime.split('$').map((iter) => {
                return iter
            }),
            linkKonfirmasi : `https://howslifeapi.herokuapp.com/konselor/me/permintaan/${idkonsultasi}`
        }
    })
}

const konfirmasiPermintaan = async (req, res) => {
    const {userId:konselorID} = req.user
    const {idkonsultasi} = req.params
    const {time} = req.body
    
    let q = `
    SELECT 
        k.id_konselor,
        k.scheduled_time
    FROM konsultasi k 
    WHERE k.id_konselor = ${konselorID} AND k.scheduled_time = "${time}"
    `
    const [rows,fields] = await dbPool.query(q)
    
    const scheduleConflict = rows.length > 0

    if(scheduleConflict){
        throw new CustomError.BadRequestError("Anda memiliki jadwal pada waktu tersebut")
    }

    q = `
    UPDATE konsultasi SET id_konselor = ${konselorID}, scheduled_time = "${time}", status = "scheduled" WHERE id = ${idkonsultasi};
    `
    await dbPool.query(q)
        .then(([rows,fields]) => {
            console.log("success update konsultasi");
        })
    
    q = `
    UPDATE request_konselor SET status = 'confirmed' WHERE id_konselor = ${konselorID} and id_konsultasi = ${idkonsultasi} and status = 'active';
    `

    await dbPool.query(q)
        .then(()=>{
            console.log("success update request konselor");
        })

    res.status(StatusCodes.OK).json({
        success: true,
        message: "Success",
        data: null
    })
    

}

const getAllMyPasien = async (req, res) => {
    const {userId:konselorID} = req.user
    const q = `
    SELECT 
        k.id_user,
        u.name,
        TIMESTAMPDIFF(YEAR, u.tanggal_lahir, CURDATE()) AS age,
        u.jenis_kelamin
    FROM konsultasi k LEFT JOIN users u on k.id_user = u.id
    WHERE  k.id_konselor = 16
    GROUP BY k.id_user
    `

    await dbPool.query(q).then(([rows,fields]) => {
        res.status(StatusCodes.OK).json({
            success: true,
            message: "Success",
            data: rows.map((iter) => {
                return {
                    id_pasien : iter.id_user,
                    name: iter.name,
                    age: iter.age,
                    kelamin: iter.jenis_kelamin
                }
            })
        })
    })
}
module.exports = {
    addMySchedulePreferences, getMySchedulePreferencesByDate, getAvailableSchedulebyDate,
    getAllPermintaanKonsultasi, getDetailedPermintaan, konfirmasiPermintaan, getAllMyPasien
}