const CustomError = require('../errors')
const dbPool = require('../db/connectDB')
const { StatusCodes } = require('http-status-codes');
const {createJWT, compareBcrypt, isTokenValid, hashString } = require('../utils')

//register pasien
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
        if( tempEmail ||  tempNIM || tempNoTelepon){
            const msg = [tempEmail, tempNIM, tempNoTelepon].filter((iter) => iter !== null).join(", ") + " Already exist"
            throw new CustomError.BadRequestError(msg)
        }
    }

    const hashedPassword = await hashString(password);
    const queryInsertUser = ` INSERT INTO users 
                        (role, email, password, no_induk, name, jenis_kelamin, tempat_lahir, tanggal_lahir, no_telepon, created_at) 
                    VALUES
                        (2, '${email}', '${hashedPassword}', '${no_induk}', '${name}', '${jenis_kelamin}', '${tempat_lahir}', '${tanggal_lahir}', '${no_telepon}', NOW());`
    
    await dbPool.query(queryInsertUser)
        .then(([rows, fields]) => {
            res.status(StatusCodes.CREATED).json({
                success: true,
                message: "Success created",
                data: null
            })
        })
    
}

const register = (role) => {
    return async (req, res) => {
        let roleID;
        switch (role) {
            case 'konselor':
                const {jenis} = req.body
                if(!jenis){
                    throw new CustomError.BadRequestError('jenis konselor required')
                }else if(jenis == 'sebaya'){
                    roleID = 4
                }else if(jenis == 'profesional'){
                    roleID = 3
                }else{
                    throw new CustomError.BadRequestError('invalid jenis konselor')
                }
                break;
            case 'pasien':
                roleID = 2
                break;
            case 'admin':
                roleID = 1
                break;
        }
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
            const tempNIM = rows[0].countNIM !== 0 ? "Nomor Induk" : null ;
            const tempNoTelepon = rows[0].countTelepon !== 0 ? "Nomor Telepon" : null ;
            if( tempEmail ||  tempNIM || tempNoTelepon){
                const msg = [tempEmail, tempNIM, tempNoTelepon].filter((iter) => iter !== null).join(", ") + " Already exist"
                throw new CustomError.BadRequestError(msg)
            }
        }

        const hashedPassword = await hashString(password);
        const queryInsertUser = ` INSERT INTO users 
                            (role, email, password, no_induk, name, jenis_kelamin, tempat_lahir, tanggal_lahir, no_telepon, created_at) 
                        VALUES
                            (${roleID}, '${email}', '${hashedPassword}', '${no_induk}', '${name}', '${jenis_kelamin}', '${tempat_lahir}', '${tanggal_lahir}', '${no_telepon}', NOW());`
        
        await dbPool.query(queryInsertUser)
            .then(([rows, fields]) => {
                res.status(StatusCodes.CREATED).json({
                    success: true,
                    message: "Success created",
                    data: null
                })
            })
    }
}

//login
const login = async (req, res) => {
    const { email, password } = req.body

    if(!email || !password){
        throw new CustomError.BadRequestError("email and password required")
    }

    const [rows,fields] = await dbPool.query(`SELECT id, role, name, email, password from users WHERE email = '${email}'`)
    const emailNotFound = rows.length<1
    if(emailNotFound){
        throw new CustomError.NotFoundError("Email not found")
    }

    const wrongPassword = !compareBcrypt(password, rows[0].password);
    if(wrongPassword){
        throw new CustomError.UnauthenticatedError("Wrong Password")
    }else{
        const user = {
            id: rows[0].id,
            role: rows[0].role,
            name: rows[0].name
        }
        const accessToken = createJWT({payload:{user}})
        res.status(200).json({
            success: true,
            message:"success",
            data: {
                accessToken : accessToken
            }
        })
    }
}


module.exports = {
    login, register
}