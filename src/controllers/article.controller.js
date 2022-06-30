const articles = require('../dummyData/article')
const { StatusCodes } = require('http-status-codes');

const getAllArticle = (req, res) => {
    res.status(StatusCodes.OK).json({
        success: true,
        message : "GET All Article",
        data: articles
    })
}

module.exports = {
    getAllArticle
}