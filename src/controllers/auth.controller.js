const { Router } = require('express');
const passport = require('passport');
const Users = require('../models/users.model');
const authService = require('../services/auth.services');
const { generateToken, verifyTokenPass } = require('../utils/jwt-utils');
const NewAuthDto = require('../DTO/auth-users.dto');
const bcrypt = require('bcryptjs');
const ForgetPassUserDto = require('../DTO/forgetpass-users.dto');
const { createHash, isValidPassword, decryptHash } = require('../utils/utils');

const router = Router();

router.post('/', passport.authenticate('login', { failureRedirect: '/auth/fail-login' }), async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone, role } = req.user;

    // Generar token utilizando la función de jwt-utils.js
    const token = generateToken({
      _id: req.user.id,
      email: req.user.email,
    });

    // Establecer la cookie y responder con la información del usuario y el token
    res
      .cookie('authToken', token, {
        maxAge: 60000,
        httpOnly: true,
      })

      const authUserInfo = new NewAuthDto(req.user);
      const newAuth = await authService.createAuth(authUserInfo)
    res.status(200).json({ first_name, last_name, email, role, phone, redirect: '/', payload:newAuth});
  } catch (error) {
    const errorMessage = customizeError('INTERNAL_SERVER_ERROR');
    throw new Error(errorMessage);
  }
});

router.get('/fail-login', (req, res) => {
  res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
});

router.post('/forgotpassword/:token', async (req, res) => {
  try {
    const { email, password, currentPassword } = req.body;

    // Verificar que la contraseña actual coincida con la contraseña almacenada en la base de datos
    const user = await Users.findOne({ email });

    const isSameAsLastPassword = await bcrypt.compare(currentPassword, user.password);

    if (isSameAsLastPassword) {
      return res.status(400).json({ status: 'error', error: 'La nueva contraseña no puede ser igual a la contraseña anterior.' });
    }

    // Hashear la nueva contraseña antes de almacenarla en la base de datos
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Continuar con la actualización de la contraseña en la base de datos
    await Users.updateOne({ email }, { password: hashedPassword });

    const authUserInfo = new ForgetPassUserDto(req.body);
    const newAuth = await authService.forgetPass(authUserInfo)

    res.status(200).json({ status: 'success', message: 'Contraseña actualizada', payload: newAuth });
  } catch (error) {
    console.error('Error al actualizar la contraseña:', error);
    res.status(500).json({ status: 'error', error: 'Error interno del servidor al actualizar la contraseña.' });
  }
});

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
  // Generar token después de la autenticación exitosa
  const token = generateToken({
    _id: req.user._id,
    email: req.user.email,
  });

  // Establecer la cookie y redirigir al cliente a la página principal
  res
    .cookie('authToken', token, {
      maxAge: 60000,
      httpOnly: true,
    })
  res.redirect('/');
});


module.exports = router;