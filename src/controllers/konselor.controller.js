const CustomError = require('../errors')
const dbPool = require('../db/connectDB')
const { StatusCodes } = require('http-status-codes');
const arrayOfWorkingHour = require('../dummyData/workingHour')

const addSchedulePreferences = async (req, res) => {
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

const getSchedulePreferencesByDate = async (req, res) => {
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

module.exports = {
    addSchedulePreferences, getSchedulePreferencesByDate
}