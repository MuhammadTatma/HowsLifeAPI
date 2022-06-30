const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'sql6.freesqldatabase.com',
    connectTimeout: 20000,
    user: 'sql6502112',
    password: 'cjI2lTHkhZ',
    database: 'sql6502112',
})

pool.on('connection', ()=> {
    console.log('mysql pool established connection');
})
pool.on('release', ()=>{
    console.log("release");
})


module.exports = pool.promise();