
const dbPool = require('../db/connectDB')
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');


const getDashboardInfo = async (req,res) => {

    const data =  {
        permintaan: {
            total : 50,
            waiting : 10,
            scheduled : 10,
            canceled: 10,
            finished: 20
        },
        user : {
            pasien : 200,
            konselor : 300
        },
        subjectMasalah : {
            keluarga : 300,
            percintaan : 400,
            pendidikan: 200,
            pribadi : 350,
            lainnya : 500
        },
        pasien: [
            {
                name: "gabriel",
                kelamin: "laki-laki",
                age : 20,
            },{
                name: "fulan",
                kelamin: "laki-laki",
                age: 21,
            },{
                name: "fulanah",
                kelamin: "perempuan",
                age: 22,
            },{
                name: "shetea",
                kelamin: "perempuan",
                age: 20,

            }
        ],
        konselor: [
            {
                name: "konselor satu",
                kelamin : "laki-laki",
            },{
                name: "konselor dua",
                kelamin: "laki-laki",
            },{
                name: "konselor tiga",
                kelamin: "perempuan",
            },{
                name: "konselor empat",
                kelamin: "laki-laki",

            }
        ]
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
    const q = `
    SELECT
        u.name,
        TIMESTAMPDIFF(YEAR, u.tanggal_lahir, CURDATE()) AS age,
        u.jenis_kelamin
    FROM users u
    WHERE u.role = 2
    `

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
    const q = `
    SELECT
    u.name,
    r.role,
    u.jenis_kelamin
    FROM users u left join roles r on u.role = r.id
    WHERE u.role = 3 or u.role = 4
    `

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