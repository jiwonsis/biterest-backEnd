const currencyPairMap = require('./currencyPairMap');
const axios = require('axios');

module.exports = (() => {
  function getChartData(currencyPair, period = 86400, start = 1420070400) {
    return axios.get(`https://poloniex.com/public?command=returnChartData&currencyPair=${currencyPair}&start=${start}&end=9999999999&period=${period}`).then(
      response => response.data
    );
  }

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
    convertToTickerObject,
    getChartData
  };
})();