const jwt = require('jsonwebtoken');

const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
  return token;
};

const isTokenValid = (token) => jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

module.exports = {
  createJWT,
  isTokenValid
};