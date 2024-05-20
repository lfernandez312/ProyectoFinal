const transport = require('../utils/nodemailer.util');
const { email_out } = require('../config/services.config');
const { Router } = require('express');
const { generateTokenPass, verifyTokenPass } = require('../utils/jwt-utils');
const Users = require('../models/users.model');
const { customizeError } = require('../services/error.services');
const { v4: uuidv4 } = require('uuid'); // Importar la función v4 de la biblioteca uuid
const { URL } = require('../config/config');

const router = Router();

// Almacenamiento para los tokens utilizados
const usedTokens = new Set();

router.get('/forgotpassword/:token', (req, res) => {
  const token = req.params.token; // Obtener el token de los parámetros de la URL

  // Verificar si el token ha sido utilizado
  if (usedTokens.has(token)) {
      res.status(400).send('El enlace de restablecimiento de contraseña ya ha sido utilizado.');
      return;
  }

  // Verificar el token y su tiempo de expiración
  const decodedToken = verifyTokenPass(token);

  if (!decodedToken) {
      // El token no es válido o ha expirado
      res.status(400).send('El enlace de restablecimiento de contraseña es inválido o ha expirado.');
  }
});

router.post('/recoveryPass', async (req, res) => {
    const email = req.body.email;
    // Buscar al usuario en la base de datos por su correo electrónico
    const user = await Users.findOne({ email });

    if (!user) {
        const errorMessage = customizeError('USER_NOT_FOUND');
        return res.status(404).json({ status: 'error', message: errorMessage });
    }

    // Generar un token único adicional usando UUID
    const additionalToken = uuidv4(); // Usar UUID como token único adicional

    // Generar el token con marca de tiempo para el enlace de restablecimiento de contraseña
    const token = generateTokenPass(); // Mover la generación de token aquí

    // Combino el token generado con el token único adicional
    const combinedToken = `${token}-${additionalToken}`;

    // Agrego el token combinado a la lista de tokens utilizados
    usedTokens.add(combinedToken);

    // Configurar el contenido del correo electrónico
    const resetLink = `${URL}/pass/forgotpassword/${combinedToken}?email=${encodeURIComponent(email)}`;
    const mailOptions = {
        from: email_out,
        to: email,
        subject: 'Recuperación de contraseña',
        html: `
            <p>Haga clic en el siguiente enlace para restablecer su contraseña:</p>
            <a href="${resetLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
        `,
    };

    // Enviar el correo electrónico
    transport.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.status(500).send('Ocurrió un error al enviar el correo electrónico');
        } else {
            res.status(200).json({ status: 'success', message: 'Mail enviado'});
        }
    });
});

module.exports = router;