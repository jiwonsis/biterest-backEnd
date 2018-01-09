require('dotenv').config();

const poloniex = require('../lib/poloniex');
const db = require('../db');
const ExchangeRate = require('../db/models/ExchangeRate');
const socket = require('./socket');
const { parseJSON, polyfill } = require('../lib/common');

db.connect();
socket.connect();

async function registerInitialExchangeRate () {
  const tickers = await poloniex.getTickers();

  // removes all the data form the collection (only for temporary use)
  await ExchangeRate.drop();
  console.log('dropped exchagerate collection');
  const keys = Object.keys(tickers);
  const promises = keys.map(
    key => {
      const ticker = tickers[key];
      const data = Object.assign({name: key}, ticker);
      const exchangeRate = new ExchangeRate(data);
      return exchangeRate.save();
    }
  );

  try {
    await Promise.all(promises);
  } catch (e) {
    console.error(e);
  }

  console.log('success!');
};

async function updateEntireRate() {
  const tickers = await poloniex.getTickers();
  const keys = Object.keys(tickers);

  const promise = keys.map(
    key => {
      return ExchangeRate.updateTicker(key, tickers[key]);
    }
  );

  try {
    await Promise.all(promise);
  } catch (e) {
    console.error('Oops! failed to update Entire Rate');
    return;
  }

  console.log('Update entire rate');
};

const messageHandler = {
  1002: async (data) => {
    if (!data) return;
    const converted = poloniex.convertToTickerObject(data);
    const { name } = converted;
    const rest = polyfill.objectWithoutProperties(converted, 'name');

    try {
      await ExchangeRate.updateTicker(name, rest);
      console.log('[Update]', name, new Date());
    } catch (e) {
      console.error(e);
    }
  }
};

socket.handleMessage = (message) => {
  const parsed = parseJSON(message);
  if (!parsed) {
    return null;
  }
  const [type, meta, data] = parsed;
  if (messageHandler[type]) {
    messageHandler[type](data);
  }
};

socket.handleRefresh = () => {
  updateEntireRate();
};

// registerInitialExchangeRate();
updateEntireRate();