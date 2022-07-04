
const dbPool = require('../db/connectDB')
const { StatusCodes, METHOD_FAILURE } = require('http-status-codes');
const CustomError = require('../errors')

const requestKonselor = async (req,res) => {
    const {idKonsultasi, idKonselor} = req.params
    const q = `INSERT INTO request_konselor (id_konsultasi, id_konselor, status) VALUES (${idKonsultasi}, ${idKonselor}, "active")`

    await dbPool.query(q)
        .then(([rows,fields]) => {
            res.status(StatusCodes.CREATED).json({
                success: true,
                message: `Success make request`,
                data: result
            })
        })

}

module.exports = {
    requestKonselor
}