const express = require('express');

const router = express.Router();

const {
    createOrderProduct,
     updateProductOrder,
      deleteProductOrder,
       getProductOrder,
       getAllProductOrders
  } = require('../controllers/customer_order_product');
const { requireUser, requireAdmin } = require('../middleware/auth');

  router.get('/', requireAdmin, getAllProductOrders);
  router.post('/', requireUser, createOrderProduct);

  router.get('/:id', requireAdmin, getProductOrder);
  router.put('/:id', requireAdmin, updateProductOrder);
  router.delete('/:id', requireAdmin, deleteProductOrder);


  module.exports = router;
