const currencyPairMap = require('./currencyPairMap');
const axios = require('axios');

module.exports = (() => {
  function getCurrencyPairName(id) {
    return currencyPairMap[id.toString()];
  }

  function getTickers() {
    return axios.get('https://poloniex.com/public?command=returnTicker').then(
      response => response.data
    );
  }

  function convertToTickerObject(data) {
    const keys = [
      'id',
      'last',
      'lowestAsk',
      'highestBid',
      'percentChange',
      'baseVolume',
      'quoteVolume',
      'isFrozen',
      'high24hr',
      'low24hr'
    ];
    const object = {};
    data.forEach((value, idx) => {
      // set the name value
      if (idx === 0) {
        object.name = getCurrencyPairName(value);
        return;
      }
      const key = keys[idx];
      object[key] = value;
    });

    return object;
  }
  return {
    getCurrencyPairName,
    getTickers,
    convertToTickerObject
  };
})();