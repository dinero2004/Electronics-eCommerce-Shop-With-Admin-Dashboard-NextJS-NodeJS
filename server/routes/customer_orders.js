const express = require('express');

const router = express.Router();

const {
    getCustomerOrder,
    createCustomerOrder,
    updateCustomerOrder,
    deleteCustomerOrder,
    getAllOrders 
  } = require('../controllers/customer_orders');
const { requireUser, requireAdmin } = require('../middleware/auth');

  router.get('/', requireAdmin, getAllOrders);
  router.post('/', requireUser, createCustomerOrder);

  router.get('/:id', requireAdmin, getCustomerOrder);
  router.put('/:id', requireAdmin, updateCustomerOrder);
  router.delete('/:id', requireAdmin, deleteCustomerOrder);


  module.exports = router;
