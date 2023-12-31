require('dotenv').config();
const mysql = require('mysql2');
const fs = require('fs');



const pool = mysql.createPool({
    host: process.env.DB_HOST,
    connectTimeout: 20000,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: true,
        ca: process.env.DB_CERT
    }
})

pool.on('connection', ()=> {
    console.log('mysql pool established connection');
})
pool.on('release', ()=>{
    console.log("release");
})


module.exports = pool.promise();