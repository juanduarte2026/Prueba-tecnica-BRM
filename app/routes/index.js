const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

const auth = require('../middlewares/auth');
const ProductPolicy = require('../policies/ProductPolicy');
const PurchasePolicy = require('../policies/PurchasePolicy');
const AuthController = require('../controllers/AuthController');
const ProductController = require('../controllers/ProductController');
const PurchaseController = require('../controllers/PurchaseController');


const routeLogger = (req, res, next) => {
  logger.info(`Ruta accedida: ${req.method} ${req.originalUrl}`);
  next();
};


const handleRouteErrors = (controller) => {
  return async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      logger.error(`Error en ruta ${req.method} ${req.path}: ${error.message}`);
      next(error);
    }
  };
};

// Rutas de autenticación
router.post('/login', routeLogger, handleRouteErrors(AuthController.logIn));
router.post('/signup', routeLogger, handleRouteErrors(AuthController.signUp));

// Rutas generales para ver productos
router.get('/products', auth, routeLogger, handleRouteErrors(ProductController.index));
router.get('/products/:id', auth, routeLogger, ProductController.find, handleRouteErrors(ProductController.show));

// Rutas CRUD de productos por administradores
router.get('/user/products', auth, routeLogger, handleRouteErrors(ProductController.userProducts));
router.get('/user/products/:id', auth, routeLogger, ProductController.find, ProductPolicy.userProductAccess, handleRouteErrors(ProductController.userProductShow));
router.post('/user/products', auth, routeLogger, ProductPolicy.create, handleRouteErrors(ProductController.create));
router.patch('/user/products/:id', auth, routeLogger, ProductController.find, ProductPolicy.update, handleRouteErrors(ProductController.update));
router.delete('/user/products/:id', auth, routeLogger, ProductController.find, ProductPolicy.delete, handleRouteErrors(ProductController.delete));

// Rutas de compras y factura de clientes
router.post('/purchases', auth, routeLogger, PurchasePolicy.create, handleRouteErrors(PurchaseController.create));
router.get('/purchases/my-purchases', auth, routeLogger, handleRouteErrors(PurchaseController.userPurchases));
router.get('/purchases/invoice/:id', auth, routeLogger, handleRouteErrors(PurchaseController.getInvoice));

// Ruta de factura de administradores
router.get('/admin/purchases', auth, routeLogger, PurchasePolicy.getAll, handleRouteErrors(PurchaseController.getAllPurchases));


module.exports = router;