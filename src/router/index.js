const templatesController = require ('../controllers/product.controller');
const authController = require('../controllers/auth.controller')
const viewsTemplateController = require('../controllers/viewsTemplateController')
const usersController = require('../controllers/users.controller')
const productController = require('../controllers/product.controller');
const passController = require('../controllers/recovery.controller');
const productsController = require('../controllers/products.controller')
const newproductsController = require('../controllers/newproducts.controller')
const apiController = require('../controllers/api.controller')

const router = app => {
    app.use('/tienda', templatesController)
    app.use('/',viewsTemplateController)
    app.use('/auth', authController)
    app.use('/pass', passController)
    app.use('/users', usersController)
    app.use('/products', productController)
    app.use('/edit', productsController)
    app.use('/new', newproductsController)
    app.use('/api', apiController)


}

module.exports = router;