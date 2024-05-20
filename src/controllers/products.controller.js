const express = require('express');
const router = express.Router();
const Product = require('../models/products.model');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authService = require('../services/auth.services');
const Users = require('../models/users.model');
const { authenticate } = require('passport');

router.get('/', async (req, res) => {
  try {
    let products;

    if (req.user.role === 'admin') {
      products = await Product.find();
    } else if (req.user.role === 'premium') {
      products = await Product.find({ owner: req.user.email });
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const productsWithStatus = products.filter(product => product.status !== undefined);
    
    res.render('listproduct.handlebars', { estilo: 'login.css', products: productsWithStatus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.render('editproduct.handlebars', { product , estilo: 'login.css'});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return cb(new Error('Producto no encontrado'));
    }
    const category = product.category;
    const categoryPath = path.join(process.cwd(), 'src', 'public', 'images', category);
    // Verificar si la carpeta de la categoría existe, si no, crearla
    fs.access(categoryPath, (err) => {
      if (err) {
        fs.mkdir(categoryPath, { recursive: true }, (err) => {
          if (err) {
            return cb(err);
          }
          cb(null, categoryPath);
        });
      } else {
        cb(null, categoryPath);
      }
    });
  },
  filename: function (req, file, cb) {
    // Usar el nombre original del archivo
    cb(null, file.originalname);
  }
});

const fileFilter = function (req, file, cb) {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos JPG y PNG'));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 // 1 MB
  }
});

router.post('/:id', upload.array('images', 2), async (req, res) => {  
  const productId = req.params.id;
  try {
    const productData = req.body;
    productData.status = Boolean(req.body.status);
    productData.discount = Boolean(req.body.discount);
    productData.availability = Boolean(req.body.availability);

    // Asignar las imágenes correctamente a imageUrl1 y imageUrl2
    if (req.files.length > 0) {
      productData.imageUrl1 = req.files[0].filename;
    }

    if (req.files.length > 1) {
      productData.imageUrl2 = req.files[1].filename;
    } else {
      // Si solo se subió una imagen, asegurémonos de que imageUrl2 esté vacío
      productData.imageUrl2 = '';
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, productData, { new: true });
    res.redirect('/edit/' + productId);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/new', async (req, res) => {
  try {
    const { name, category, description, price, imageUrl, status, discount, availability } = req.body;
    
    const newProduct = new Product({
      name,
      category,
      description,
      price,
      imageUrl,
      status: Boolean(status),
      discount: Boolean(discount),
      availability: Boolean(availability)
    });

    await newProduct.save();

    res.redirect('/products?success=true');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/remove/:id', async (req, res) => {  
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.redirect('/edit?deleted=true'); 
  } catch (error) {
      console.error('Error al eliminar el producto:', error);
      res.status(500).send('Error al eliminar el producto');
  }
});

module.exports = router;