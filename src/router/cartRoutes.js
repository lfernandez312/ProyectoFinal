const express = require('express');
const router = express.Router();
const cartsController = require('../controllers/carts.controller');
const isUser = require('../middlewares/user.middlewares');
const ticketController = require('../controllers/purchase.controller');
const { customizeError } = require('../services/error.services');
const privateAccess = require('../middlewares/auth.private.middlewares');

//ya se encuentra el /cart cargado en app.js

router.get('/info', privateAccess ,async (req, res) => {
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

router.get('/carrito', async (req, res) => {
    try {
        const carts = await cartsController.getAllCarts();
        res.json({ payload: carts });
    } catch (error) {
        res.status(500).json({ status: 'error', error: errorMessage });
    }
});

router.get('/carrito/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const populatedCart = await cartsController.getCartByIdPopulated(id);
        res.json({ payload: populatedCart });
    } catch (error) {
        const errorMessage = customizeError('ERROR_CART');
        res.status(500).json({ error: errorMessage });
    }
});


router.post('/agregar', isUser, async (req, res) => {
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


router.delete('/remove/:productId', async (req, res) => {
    try {
      const productId = req.params.productId; // Cambio de req.body a req.params
      const userEmail = req.user.email; // Obtengo el usuario actual
      const result = await cartsController.removeProductFromCart(userEmail, productId);
  
      res.json(result);
    } catch (error) {
        const errorMessage = customizeError('INVALID_REMOVE_CART');
        res.status(500).json({ error: errorMessage });
    }
});

router.get('/info/compra', async (req, res) => {
    try {
      const cartInfo = await cartsController.getCartInfo(req);
        
      res.json({ cartInfo });
    } catch (error) {
        const errorMessage = customizeError('INVALID_CART');
        res.status(500).json({ error: errorMessage });
    }
});

router.post('/:cid/purchase', async (req, res) => {
    try {
      await ticketController.purchaseCart(req, res);
    } catch (error) {
        const errorMessage = customizeError('INVALID_PURCHASE');
        res.status(500).json({ error: errorMessage });
    }
});

module.exports = router;