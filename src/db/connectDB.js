const mysql = require('mysql2');
const fs = require('fs');
const serverCa = [fs.readFileSync("DigiCertGlobalRootCA.crt.pem", "utf8")];

const pool = mysql.createPool({
    host: 'howslifeserver-mysql.mysql.database.azure.com',
    connectTimeout: 20000,
    user: 'howslifedatabaseadmin',
    password: 'N@m@iw@k',
    database: 'howslife',
    ssl: {
        rejectUnauthorized: true,
        ca: serverCa
    }
})

pool.on('connection', ()=> {
    console.log('mysql pool established connection');
})
pool.on('release', ()=>{
    console.log("release");
})


module.exports = pool.promise();