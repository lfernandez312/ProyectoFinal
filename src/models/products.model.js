const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl1: { type: String }, // Cambio de 'imageUrl' a 'imageUrl1'
  imageUrl2: { type: String }, // Nueva propiedad para la segunda imagen
  availability: { type: Boolean, required: true },
  status: { type: Boolean, required: true },
  discount: { type: Boolean, required: true },
  owner: { 
    type: String, 
    required: true,
    unique: true,
    default: 'admin' // Si no se proporciona, el propietario será "admin"
  }
});

productSchema.plugin(mongoosePaginate);

const Product = mongoose.model('products', productSchema);

module.exports = Product;