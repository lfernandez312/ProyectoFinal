const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');

const generateToken = user => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: 60 })
}

function generateTokenPass(email) {
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' }); // Expira en 1 HORA
  return token;
}

function verifyTokenPass(token) {
  try {
      const decodedToken = jwt.verify(token, JWT_SECRET);
      const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
      if (decodedToken.exp <= currentTime) {
          // El token ha expirado
          return { expired: true, message: 'El enlace ha expirado' };
      }
      // El token es válido
      return decodedToken;
  } catch (error) {
      throw error;
  }
}

const authToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader)
    return res.status(401).json({ status: 'error', error: 'Unauthorized' })

  const token = authHeader.split(' ')[1]

  jwt.verify(token, JWT_SECRET, (error, credentials) => {
    console.log(error)
    if (error)
      return res.status(401).json({ status: 'error', error: 'Unauthorized' })

    req.user = credentials.user

    next()
  })
}

module.exports = {
  generateToken,
  authToken,
  generateTokenPass,
  verifyTokenPass
}