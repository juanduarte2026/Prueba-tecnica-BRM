const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth')

const ProductPolicy = require('../policies/ProductPolicy')
const PurchasePolicy = require('../policies/PurchasePolicy');

const AuthController = require('../controllers/AuthController')
const ProductController = require('../controllers/ProductController')
const PurchaseController = require('../controllers/PurchaseController');



// Ruta de prueba
router.get('/', (req, res) => res.json({ hello: "World23453" }));

// Rutas de autenticación (sin /api porque ya está en el prefijo)
router.post('/login', AuthController.logIn)
router.post('/signup', AuthController.signUp)


// Rutas PÚBLICAS de productos (todos pueden ver)
router.get('/products', auth, ProductController.index);
router.get('/products/:id', auth, ProductController.find, ProductController.show);

// Rutas de productos del usuario autenticado
router.get('/user/products', auth, ProductController.userProducts);
router.get('/user/products/:id', auth, ProductController.find, ProductPolicy.userProductAccess, ProductController.userProductShow);
router.post('/user/products', auth, ProductPolicy.create, ProductController.create);
router.patch('/user/products/:id', auth, ProductController.find, ProductPolicy.update, ProductController.update);
router.delete('/user/products/:id', auth, ProductController.find, ProductPolicy.delete, ProductController.delete);

router.post('/purchases', auth, PurchasePolicy.create, PurchaseController.create);
router.get('/purchases/my-purchases', auth, PurchaseController.userPurchases);
router.get('/purchases/invoice/:id', auth, PurchaseController.getInvoice);

// Ruta solo para administradores
router.get('/admin/purchases', auth, PurchasePolicy.getAll, PurchaseController.getAllPurchases);

module.exports = router