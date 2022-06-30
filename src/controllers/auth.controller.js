const CustomError = require('../errors')
const dbPool = require('../db/connectDB')

//register
const registerPasien = async (req, res) => {
    const {email, name, password, jenis_kelamin, tempat_lahir, tanggal_lahir, no_induk, no_telepon} = req.body;

    if (!email || !name || !password || !jenis_kelamin || !tempat_lahir || !tanggal_lahir || !no_induk || !no_telepon) {
        throw new CustomError.BadRequestError('Please provide all required data');
    };

    const q = `
            SELECT 
                (SELECT COUNT(email) FROM users WHERE email = '${email}') AS countEmail,
                (SELECT COUNT(no_induk) FROM users WHERE no_induk = '${no_induk}') AS countNIM,
                (SELECT COUNT(no_telepon) FROM users WHERE no_telepon = '${no_telepon}') AS countTelepon
            FROM users LIMIT 1  
        `; 
    const [rows, fields] = await dbPool.query(q);
    const alreadyExists = rows.length > 0;
    if(alreadyExists){
        const tempEmail = rows[0].countEmail !== 0 ? "Email" : null ;
        const tempNIM = rows[0].countNIM !== 0 ? "NIM" : null ;
        const tempNoTelepon = rows[0].countTelepon !== 0 ? "Nomor Telepon" : null ;
        const msg = [tempEmail, tempNIM, tempNoTelepon].filter((iter) => iter !== null).join(", ") + " Already exist"
        throw new CustomError.BadRequestError(msg)
    }
    
    res.json({"aw" : "aw"})
}


module.exports = {
    registerPasien
}