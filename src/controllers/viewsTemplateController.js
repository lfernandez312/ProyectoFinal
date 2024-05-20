const { Router } = require('express')
const privateAccess = require('../middlewares/auth.private.middlewares')
const publicAccess = require('../middlewares/auth.public.middlewares')
const productController = require('./template.controller'); // Asegúrate de tener tu controlador de productos
const router = Router()

router.get('/login',(req, res) => {
  res.render('login.handlebars', {estilo: 'login.css', js: 'login.js'})
})

router.get('/signup', publicAccess, (req, res) => {
  res.render('signup.handlebars', {estilo: 'login.css', js: 'signup.js' })
})

router.get('/profile', privateAccess, async (req, res) => {
  const { first_name,last_name,email,role, token } = req.user
  const isAdmin = role === 'admin' || role === 'premium';
  const categoryCounts = await productController.getCategoriesAndCount();
  res.render('profile.handlebars', { first_name, last_name, email, role, token, estilo: 'login.css', isAdmin, js: 'profile.js',categoryCounts})
})

router.get('/pass/recoveryPass', (req, res) => {
  res.render('recovery-password.handlebars', {estilo: 'login.css', js: 'recovery-password.js'})
})

router.get('/pass/forgotpassword/:token', (req, res) => {
  res.render('forgot-password.handlebars', {estilo: 'login.css', js: 'forgot-password.js'})
})


module.exports = router