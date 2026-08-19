const axios = require('axios');

const fetchLiveProductsFromRapidAPI = async (query) => {

  if (!process.env.RAPIDAPI_KEY) {
    throw new Error('RAPIDAPI_KEY is missing from .env');
  }

  if (!process.env.RAPIDAPI_HOST) {
    throw new Error('RAPIDAPI_HOST is missing from .env');
  }

  try {

    const response = await axios.get(
      `https://${process.env.RAPIDAPI_HOST}/search`,
      {
        params: {
          query: query,
          page: 1,
          country: 'US',
          sort_by: 'RELEVANCE',
          product_condition: 'ALL',
          is_prime: false,
          deals_and_discounts: 'NONE'
        },

        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': process.env.RAPIDAPI_HOST
        },

        timeout: 30000
      }
    );

    console.log('========== RAPID API SUCCESS ==========');
    console.log('Status:', response.status);

    console.log(
      'Response:',
      JSON.stringify(response.data, null, 2)
    );

    const products =
      response.data?.data?.products ||
      [];

    console.log('Products received:', products.length);

    console.log('=======================================');

    return products.map(item => ({

      name:
        item.product_title ||
        'Unknown Product',

      brand:
        item.brand ||
        'Unknown',

      category:
        'Electronics',

      imageUrl:
        item.product_photo ||
        '',

      price:
        parseFloat(
          String(
            item.product_price || '0'
          ).replace(/[^0-9.]/g, '')
        ) || 0,

      originalPrice:
        parseFloat(
          String(
            item.product_original_price ||
            item.product_price ||
            '0'
          ).replace(/[^0-9.]/g, '')
        ) || 0,

      platform:
        'Amazon',

      url:
        item.product_url ||
        ''

    }));

  } catch (error) {

    console.log('========== RAPID API FAILED ==========');

    console.log(
      'Message:',
      error.message
    );

    console.log(
      'Status:',
      error.response?.status
    );

    console.log(
      'Response:',
      JSON.stringify(
        error.response?.data,
        null,
        2
      )
    );

    console.log('======================================');

    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message
    );
  }
};

module.exports = {
  fetchLiveProductsFromRapidAPI
};