const dbPool = require('../db/connectDB')
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors')

const getAllKonsultasi = async (req, res) => {
    let q = `
    SELECT 
        k.id as "konsultasiId",
        u.name,
        DATE_FORMAT(u.tanggal_lahir,"%e %M %Y") as "tanggal lahir",
        TIMESTAMPDIFF(YEAR, u.tanggal_lahir, CURDATE()) AS age,
        u.jenis_kelamin,
        DATE_FORMAT(k.created, "%W, %e %M %Y  %T WIB") as created,
        k.status
    FROM konsultasi k LEFT JOIN users u on k.id_user = u.id
    ORDER BY CASE WHEN status LIKE '%waiting' THEN 0 ELSE 1 END
    `

    const [rows,fields] = await dbPool.query(q)
    
    res.status(StatusCodes.OK).json({
        success: true,
        message: "Success get all konsultasi",
        data: rows.map((iter) => {
            const konsltasi = {...iter, link : `https://howslifeapi.herokuapp.com/api/v1/konsultasi/${iter["konsultasiId"]}`}
            return konsltasi
        })
    })
}

// GROUP_CONCAT(DATE_FORMAT(kp.time, "%W, %e %M %Y %H:%i WIB") SEPARATOR '$') as preferenceTime,
const getKonsultasiByID = async (req , res) => {
    const idKonsultasi = req.params.id
    let q =`
    WITH preference_time as (
        SELECT
            kp.id_konsultasi ,
            GROUP_CONCAT(DATE_FORMAT(kp.time, "%W, %e-%M-%Y %H:%i:%s") SEPARATOR '$') as preferenceTime
        FROM 
            konsultasi_preferensi kp
        WHERE 
            kp.id_konsultasi = ${idKonsultasi}
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
        k.id = ${idKonsultasi}
    `
    let [rows,fields] = await dbPool.query(q)

    const notFound = rows.length < 1
    if(notFound){
        throw new CustomError.NotFoundError("ID Not Found")
    }

    const dontHavePreference = rows[0].preferenceTime
    if(!dontHavePreference){
        throw new CustomError.BadRequestError("Permintaan Konsultasi belum memiliki preferensi waktu")
    }

    const result = {
        ...rows[0],
        preferenceTime : rows[0].preferenceTime?rows[0].preferenceTime.split('$'):[]
    }

    //get posible konselor
    q = `
    WITH 
        first_datediff AS (
            SELECT 
                _kp.konselor_id,
                kp.id as preference_id,
                DATE_FORMAT(kp.time, "%W, %e %M %Y  %T WIB") as first_pref,
                _kp.first_datediff
            FROM ( 	SELECT
                        kp.konselor_id, 
                        min(TIMEDIFF(kp.time,'${rows[0].preferenceTime.split('$')[0]}')) as first_datediff
                    FROM konselor_preferensi kp
                    WHERE TIMEDIFF(kp.time,'${rows[0].preferenceTime.split('$')[0]}') >= 0 AND kp.is_available = TRUE
                    GROUP BY konselor_id
                ) _kp
            join konselor_preferensi kp on (kp.konselor_id = _kp.konselor_id and _kp.first_datediff = TIMEDIFF(kp.time,'${rows[0].preferenceTime.split('$')[0]}'))
        ),
        second_datediff AS (
            SELECT 
                _kp.konselor_id,
                kp.id as preference_id,
                DATE_FORMAT(kp.time, "%W, %e %M %Y  %T WIB") as second_pref,
                _kp.second_datediff
            FROM ( 	SELECT
                        kp.konselor_id, 
                        min(TIMEDIFF(kp.time,'${rows[0].preferenceTime.split('$')[1]}')) as second_datediff
                    FROM konselor_preferensi kp
                    WHERE TIMEDIFF(kp.time,'${rows[0].preferenceTime.split('$')[1]}') >= 0 AND kp.is_available = TRUE
                    GROUP BY konselor_id
                ) _kp
            join konselor_preferensi kp on (kp.konselor_id = _kp.konselor_id and _kp.second_datediff = TIMEDIFF(kp.time,'${rows[0].preferenceTime.split('$')[1]}'))
        ),
        third_datediff AS (
            SELECT 
                _kp.konselor_id,
                kp.id as preference_id,
                DATE_FORMAT(kp.time, "%W, %e %M %Y  %T WIB") as third_pref,
                _kp.third_datediff
            FROM ( 	SELECT
                        kp.konselor_id, 
                        min(TIMEDIFF(kp.time,'${rows[0].preferenceTime.split('$')[2]}')) as third_datediff
                    FROM konselor_preferensi kp
                    WHERE TIMEDIFF(kp.time,'${rows[0].preferenceTime.split('$')[2]}') >= 0 AND kp.is_available = TRUE
                    GROUP BY konselor_id
                ) _kp
            join konselor_preferensi kp on (kp.konselor_id = _kp.konselor_id and _kp.third_datediff = TIMEDIFF(kp.time,'${rows[0].preferenceTime.split('$')[2]}'))
        ),
        konselor AS (
            SELECT 
                u.id as konselor_id,
                u.name,
                u.jenis_kelamin,
                r.role
            FROM users u left join roles r on u.role = r.id
            WHERE u.role in(3,4)
        )
        
    SELECT 
        *
    FROM konselor LEFT JOIN first_datediff USING(konselor_id) 
        LEFT JOIN second_datediff USING(konselor_id)
        LEFT JOIN third_datediff USING(konselor_id)
    ORDER BY CASE WHEN first_datediff = "00:00:00" or second_datediff = "00:00:00" or third_datediff = "00:00:00" THEN 0 else 1 end ,CASE WHEN role LIKE '%${rows[0].pref_konselor_type}' THEN 0 ELSE 1 END  

    `
    await dbPool.query(q)
        .then(([rows,fields])=> {
            // console.log(rows);
            result.konselor = rows.map((iter) => {
                const dateDiff = { [iter.first_datediff] : iter.first_pref, [iter.second_datediff] : iter.second_pref, [iter.third_datediff] : iter.third_pref}
                const timeMatch = (iter.first_datediff === "00:00:00" || iter.second_datediff === "00:00:00" || iter.third_datediff === "00:00:00") 
                const roleMatch = iter.role.split(" ")[1].toLowerCase() === result.pref_konselor_type.toLowerCase()
                const kelaminMatch = iter.jenis_kelamin.toLowerCase() === result.pref_kelamin_konselor.toLowerCase()
                return {
                    konselorID : iter.konselor_id,
                    name : iter.name,
                    ringkasan : [
                        {
                            role : iter.role,
                            isMatch : roleMatch
                        },
                        {
                            jenis_kelamin : iter.jenis_kelamin,
                            isMatch : kelaminMatch
                        },{
                            haveTimeMatch : timeMatch,
                            time: dateDiff["00:00:00"]
                        }
                    ],
                    link : `https://howslifeapi.herokuapp.com/api/v1/konsultasi/${idKonsultasi}/request/${iter.konselor_id}`
                }
            })
        })
    
    res.status(StatusCodes.OK).json({
        success: true,
        message: `Success get konsultasi with id ${idKonsultasi}`,
        data: result
    })
}

const requestKonselor = async (req,res) => {
    const {idKonsultasi, idKonselor} = req.params
    if(!idKonselor || !idKonsultasi){
        throw new CustomError.BadRequestError("id konselor and id konsultasi is required")
    }
    const q = `INSERT INTO request_konselor (id_konsultasi, id_konselor, status) VALUES (${idKonsultasi}, ${idKonselor}, "active")`

    await dbPool.query(q)
        .then(([rows,fields]) => {
            res.status(StatusCodes.CREATED).json({
                success: true,
                message: `success make request to konselor with id ${idKonselor}`
            })
        })
}


module.exports = {
    getAllKonsultasi, getKonsultasiByID, requestKonselor
}