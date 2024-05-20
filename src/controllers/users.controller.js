const { Router } = require('express');
const passport = require('passport');
const usersService = require('../services/users.services');
const NewUserDto = require('../DTO/new-users.dto');
const { customizeError } = require('../services/error.services');
const Ticket = require('../models/ticket.model');
const router = Router();

router.post('/', passport.authenticate('register', { failureRedirect: '/users/fail-register' }), async (req, res) => {
  try {
    
    const newUserInfo = new NewUserDto(req.body);
    const newUser = await usersService.create(newUserInfo)

    if (!newUser) {
      return res.status(400).json({ status: 'error', message: 'Error al crear el usuario. Inténtelo de nuevo más tarde.' });
    }

    res.status(201).json({ status: 'success', message: 'Usuario creado correctamente' });

  } catch (error) {
    res.status(500).json({status: 'error', error: error.message});
  }
});

router.get('/fail-register', (req, res) => {
    const errorMessage = customizeError('USER_NOT_CREATE');
    res.status(500).json({status: 'error', error: errorMessage });
});

router.post('/finishcart', async (req, res) => {
  const usuario = req.user.email;

  try {
    // Buscar todas las compras del usuario en la base de datos
    const compras = await Ticket.find({ purchaser: usuario });

    // Renderizar la plantilla Handlebars con las compras encontradas
    res.render('purchase.handlebars', { usuario: usuario, compras: compras, estilo: 'estilos.css'});
  } catch (error) {
    console.error('Error al buscar las compras:', error);
    res.status(500).send('Error al buscar las compras');
  }
});

module.exports = router;