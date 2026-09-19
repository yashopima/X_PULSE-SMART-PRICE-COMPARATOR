const express = require('express');
const { 
  getProducts, 
  getProduct, 
  searchLiveProducts, 
  getProductRecommendations 
} = require('../controllers/productController');

const router = express.Router();

router.route('/').get(getProducts);
router.route('/live-search').get(searchLiveProducts);
router.route('/:id').get(getProduct);
router.route('/:id/recommendations').get(getProductRecommendations);

module.exports = router;
