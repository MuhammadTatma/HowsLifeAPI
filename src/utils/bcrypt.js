const bcrypt = require('bcrypt');

const hashString = async (string) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(string, salt);
    return hashedPassword;
}

const compareBcrypt = async (string1, string2) => {
    return await bcrypt.compare(string1, string2)
}

module.exports = {hashString, compareBcrypt};