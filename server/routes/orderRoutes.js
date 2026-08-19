const express = require('express');
const { checkout, getOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getOrders);

router.route('/checkout')
  .post(checkout);

module.exports = router;
