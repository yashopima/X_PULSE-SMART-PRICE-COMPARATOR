const express = require('express');
const { getCart, addToCart, removeFromCart, optimizeCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All cart routes require auth

router.route('/')
  .get(getCart)
  .post(addToCart);

router.route('/optimize').get(optimizeCart);
router.route('/:itemId').delete(removeFromCart);

module.exports = router;
