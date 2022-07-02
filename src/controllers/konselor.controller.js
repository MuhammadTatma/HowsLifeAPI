const dbPool = require('../db/connectDB')
const { StatusCodes } = require('http-status-codes');
const arrayOfWorkingHour = require('../dummyData/workingHour')

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

module.exports = {
    addMySchedulePreferences, getMySchedulePreferencesByDate, getAvailableSchedulebyDate
}