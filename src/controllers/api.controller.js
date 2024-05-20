const { Router } = require('express');
const Users = require('../models/users.model');
const Product = require('../models/products.model');
const passportCall = require('../utils/passport-call.util');
const { customizeError } = require('../services/error.services');
const cartsController = require('./carts.controller');
const authService = require('../services/auth.services');
const multer = require('multer');
const UsuarioDTO = require('../DTO/user-current.dto');

const router = Router();

router.get('/users', async (req, res) => {
  // Verificar si el usuario tiene un rol válido
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'premium')) {
    const errorMessage = 'No tienes permiso para acceder a esta ruta o debes iniciar sesion';
    return res.status(403).json({ status: 'error', error: errorMessage });
  }

  try {
    // Obtener la fecha actual menos 2 días (o 30 minutos para pruebas)
    const cutoffDate = new Date();
    cutoffDate.setMinutes(cutoffDate.getMinutes() - 30); // Cambiar a -2880 para 2 días

    // Buscar usuarios inactivos
    const inactiveUsers = await Users.find({ last_connection: { $lt: cutoffDate } });

    // Obtener todos los usuarios
    const allUsers = await Users.find();

    res.render('users.handlebars', { users: allUsers, inactiveUsersExist: inactiveUsers.length > 0 , estilo:'estilos.css', js: 'users.js'});
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/users/delete/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Eliminar usuario por ID
    await Users.findByIdAndDelete(userId);

    res.sendStatus(200);
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/users/notify/:id', async (req, res) => {
  try {
      const userId = req.params.id;
      const user = await Users.findById(userId);

      // Llamada a la función sendDeleteAccountEmail con el correo electrónico del usuario como argumento
      await authService.sendDeleteAccountEmail(user.email);

      res.sendStatus(200);
  } catch (error) {
      console.error('Error al enviar la notificación:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// Ruta para cambiar el rol de usuario
router.put('/users/premium/:uid', async (req, res) => {
  try {
    const userId = req.params.uid;

    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({ status: 'error', error: 'User not found' });
    }

    // Verifica si el usuario es "user" o "premium" y cambia su rol
    if (user.role === 'user' || user.role === 'premium') {
      user.role = user.role === 'user' ? 'premium' : 'user';
    } else {
      return res.status(400).json({ status: 'error', error: 'Invalid user role' });
    }

    await user.save();

    res.json({ status: 'success', message: 'User role updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', error: 'Internal server error' });
  }
});


router.post('/cart', async (req, res) => {
  try {
      const { user, products, total } = req.body;
      const newCartInfo = { user, products, total };
      const newCart = await cartsController.createCart(newCartInfo);
      res.json({ payload: newCart });
  } catch (error) {
      const errorMessage = customizeError('ERROR_CART');
      res.status(500).json({ error: errorMessage });
  }
});

router.put('/cart/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const body = req.body;
      await cartsController.updateCart(id, body);
      res.json({ payload: 'Carrito actualizado' });
  } catch (error) {
      const errorMessage = customizeError('ERROR_CART');
      res.status(500).json({ error: errorMessage });
  }
});

router.get('/cart/:id/total', async (req, res) => {
  try {
      const { id } = req.body;
      const totalPrice = await cartsController.getCartTotalPrice(id);
      res.json({ status: 'success', totalPrice });
  } catch (error) {
      const errorMessage = customizeError('ERROR_CART');
      res.status(500).json({ error: errorMessage });
  }
});


router.get('/cart/info',async (req, res) => {
  try {
      const cartInfo = await cartsController.getCartInfo(req);

      // Verifica si cartInfo es null o undefined
      if (!cartInfo || cartInfo.products === null) {
          // El carrito está vacío o no se encontró
          return res.status(404).render('cart.handlebars', { mensaje: 'El carrito está vacío', estilo: 'estilos.css' });
      }

      // Calcular el precio total por producto redondeando a 2 decimales
      cartInfo.products.forEach(product => {
          product.totalPrice = (product.quantity * product.price).toFixed(2);
      });

      // Calcular el totalPrice del carrito redondeando a 2 decimales
      cartInfo.totalPrice = cartInfo.products.reduce((acc, product) => acc + parseFloat(product.totalPrice), 0).toFixed(2);

      // Calcular el totalPrice redondeando a 2 decimales
      const totalPrice = cartInfo.products.reduce((acc, product) => acc + parseFloat(product.price), 0).toFixed(2);

      res.render('cart.handlebars', { cartInfo, totalPrice, estilo: 'estilos.css' });
  } catch (error) {
      const errorMessage = customizeError('ERROR_CART');
      res.status(500).json({ status: 'error', error: errorMessage });
  }
});

router.get('/cart/carrito', async (req, res) => {
  try {
      const carts = await cartsController.getAllCarts();
      res.json({ payload: carts });
  } catch (error) {
      res.status(500).json({ status: 'error', error: errorMessage });
  }
});

router.get('/cart/carrito/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const populatedCart = await cartsController.getCartByIdPopulated(id);
      res.json({ payload: populatedCart });
  } catch (error) {
      const errorMessage = customizeError('ERROR_CART');
      res.status(500).json({ error: errorMessage });
  }
});


router.post('/cart/agregar', async (req, res) => {
  try {
      const productId = req.body.productId;
      const quantity = req.body.quantity; // Si no se proporciona la cantidad, se establece en 1 por defecto
      const user = req.user.email; // Obtengo el usuario actual

      // Lógica para agregar el producto al carrito en controlador
      await cartsController.addToCart(user, productId, quantity);

      res.json({ status: 'success', message: 'Producto agregado al carrito con éxito' });
  } catch (error) {
      if (req.user.role === 'admin') {
          // Si el usuario tiene un rol permitido, devolver el error original
          const errorMessage = customizeError('UNAUTHORIZED_ACCESS');
          return res.status(500).json({ error: errorMessage });
      } else {
          // Si el usuario no tiene el rol adecuado, devolver un mensaje de error estándar
          const errorMessage = customizeError('INVALID_CART');
          return res.status(401).json({ error: errorMessage });
      }
  }
});

// router.get('/session/current', passportCall('jwt'), (req, res) => {
//   try {
//       res.json({ status: 'success', payload: req.headers })
//   } catch (error) {
//       const errorMessage = customizeError('INTERNAL_SERVER_ERROR');
//       res.status(500).json({ error: errorMessage });
//   }
// });

// router.get('/session', (req, res) => {
//   try {
//       res.json({ status: 'success', payload: req.session })
//   } catch (error) {
//       const errorMessage = customizeError('INTERNAL_SERVER_ERROR');
//       res.status(500).json({ error: errorMessage });
//   }
// });
router.get('/products', async (req, res) => {
  try {
    const categories = await Product.distinct('category'); // Obtener todas las categorías disponibles desde la base de datos
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = '';

    // Verificar el tipo de archivo y asignar la carpeta de destino
    if (file.fieldname === 'profileImage') {
      uploadPath = 'uploads/profiles/';
    } else if (file.fieldname === 'productImage') {
      uploadPath = 'uploads/products/';
    } else {
      uploadPath = 'uploads/documents/';
    }

    cb(null, uploadPath); // Directorio donde se guardarán los archivos
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Nombre único para el archivo
  }
});

// Multer middleware
const upload = multer({ storage: storage });

// POST endpoint para subir documentos
router.post('/users/:uid/documents', upload.array('documents'), async (req, res) => {
  const userId = req.params.uid;
  const uploadedDocuments = req.files;
  
  try {
    // Buscar al usuario por ID
    const user = await Users.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Agregar los documentos subidos al array de documentos del usuario
    uploadedDocuments.forEach(doc => {
      user.documents.push({
        name: doc.originalname,
        reference: doc.path // Guardar la ruta del archivo
      });
    });

    // Guardar los cambios en el usuario
    await user.save();

    return res.status(200).json({ message: 'Documentos subidos exitosamente', user: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;