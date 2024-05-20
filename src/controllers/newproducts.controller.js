const express = require('express');
const router = express.Router();
const Product = require('../models/products.model');

router.get('/', async (req, res) => {
  try {
    const categories = await Product.distinct('category'); // Obtener todas las categorías disponibles desde la base de datos
    res.render('newproduct.handlebars', { title: 'Crear Nuevo Producto', categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ruta para manejar la creación de un nuevo producto
router.post('/create', async (req, res) => {
  try {

    const userEmail = req.user.email;
    const { name, category, description, price, image, availability, status, discount } = req.body;

    // Crea un nuevo documento de producto utilizando el modelo de Mongoose
    const newProduct = new Product({
      name,
      category,
      description,
      price,
      imageUrl: image,
      availability,
      status,
      discount,
      owner: userEmail
    });
    // Guarda el nuevo producto en la base de datos
    await newProduct.save();

    // Redirige al usuario a la página de lista de productos
    res.redirect('/edit');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//eliminar producto
router.post('/remove/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    // Busca y elimina el producto por su ID
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      // Si el producto no se encuentra, devuelve un mensaje de error
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Si el producto se elimina con éxito, devuelve un mensaje de éxito
    res.redirect('/edit');
    // No necesitas redireccionar aquí porque ya has enviado una respuesta JSON
  } catch (error) {
    // Si hay un error, devuelve un mensaje de error
    res.status(500).json({ message: 'Error al eliminar el producto' });
  }
});






module.exports = router;
