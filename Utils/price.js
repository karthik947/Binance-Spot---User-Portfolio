const got = require('got');
const log = console.log;
const schedule = require('node-schedule');

let price = {
  data: {},
  einfo: [],
  async getData() {
    try {
      const data1 = got('https://api.binance.com/api/v3/ticker/price');
      const einfo1 = got('https://api.binance.com/api/v3/exchangeInfo');
      const [data2, einfo2] = await Promise.all([data1, einfo1]);
      const data3 = JSON.parse(data2.body);
      price.data = data3.reduce((a, d) => {
        const { symbol, price } = d;
        return { ...a, [symbol]: parseFloat(price) };
      }, {});

      const einfo3 = JSON.parse(einfo2.body);
      price.einfo = [...einfo3.symbols];
    } catch (err) {
      log(err);
    }
  },
  scheduleJob() {
    price.getData();
    schedule.scheduleJob('*/15 * * * *', price.getData);
  },
};

module.exports = price;
