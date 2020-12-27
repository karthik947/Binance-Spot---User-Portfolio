const socketio = require('socket.io');
const log = console.log;
const got = require('got');
const { duration, monthNumtoText } = require('./helper');

let socketServer = {
  io: '',
  run(server) {
    socketServer.io = socketio(server);

    socketServer.io.on('connection', (socket) => {
      log('Socket connection successful!');

      socket.on('disconnect', () => {
        log('Socket disconnection successful!');
      });

      socket.on('INPUTDATA', async ({ apikey, seckey }) => {
        if (apikey.length !== 64 || seckey.length !== 64) return;
        let reqA = [];
        const price = require('./price');
        const apiHandler = require('./apiHandler');
        try {
          // exchange info
          const spotsymbols = [
            ...price.einfo
              .filter((s) => s.isSpotTradingAllowed)
              .map((s) => s.symbol),
          ];
          //account
          reqA = [
            ...reqA,
            {
              url: 'https://api.binance.com/api/v3/account',
              params: {},
              label: 'accountInfo',
              keys: { apikey, seckey },
            },
          ];
          //orders all symbols
          reqA = [
            ...reqA,
            ...spotsymbols
              // .filter((s) => ['BTCUSDT', 'XRPUSDT'].includes(s)) //remove this filter after testing
              .map((s) => {
                return {
                  url: 'https://api.binance.com/api/v3/allOrders',
                  params: { symbol: s },
                  label: 'orders',
                  keys: { apikey, seckey },
                };
              }),
          ];
          //process All requests
          // const d1 = process.hrtime();
          const response = await Promise.all(
            reqA.map((r) => apiHandler.processWithRetry(r))
          );
          // log(process.hrtime(d1));
          const orders = response
            .filter((r) => r.label === 'orders' && r.retryAttempt < 20)
            .reduce((a, d) => [...a, ...d.apiresp], [])
            .sort((a, b) => a.time - b.time);
          const balances = response.filter(
            (r) => r.label === 'accountInfo' && r.retryAttempt < 20
          )[0]?.apiresp?.balances;
          if (!balances) return;
          //ANALYZE DATA
          //DATA1
          const data1 = (() => {
            const usdtvalue = balances
              .filter(
                (a) =>
                  parseFloat(a.free) &&
                  (price.data[`${a.asset}USDT`] ||
                    price.data[`${a.asset}BTC`] ||
                    price.data[`${a.asset}BNB`] ||
                    a.asset === 'USDT')
              )
              .reduce((a, d) => {
                const { asset, free: balance } = d;
                return (
                  a +
                  (asset === 'USDT'
                    ? balance * 1
                    : price.data[`${asset}USDT`]
                    ? balance * 1 * price.data[`${asset}USDT`]
                    : price.data[`${asset}BTC`]
                    ? balance *
                      1 *
                      price.data[`${asset}BTC`] *
                      require('./price').data[`BTCUSDT`]
                    : price.data[`${asset}BNB`]
                    ? balance *
                      1 *
                      price.data[`${asset}BNB`] *
                      require('./price').data[`BNBUSDT`]
                    : 0)
                );
              }, 0);
            const btcvalue = usdtvalue / price.data[`BTCUSDT`];
            return {
              usdtvalue: usdtvalue.toFixed(2),
              btcvalue: btcvalue.toFixed(8),
            };
          })();
          //DATA2
          const data2 = (() => {
            const totaltrades = orders.length;
            const startTime = orders[0]?.time;
            const endTime = orders[orders.length - 1]?.time;
            const days = duration(Math.floor((endTime - startTime) / 1000));
            return { totaltrades, days };
          })();
          //DATA3
          const data3 = (() => {
            const firstTime = orders[0]?.time;
            const [firstDateF] = (
              new Date(firstTime).toLocaleString() + ''
            ).split(',');
            const [month, day, year] = firstDateF.split('/');
            const firstDate = `${day} ${monthNumtoText(month)}. ${year}`;
            const daysago = duration(
              Math.floor((Date.now() - firstTime) / 1000)
            );
            return { firstDate, daysago };
          })();
          //DATA4
          const data4 = (() => {
            const lastTime = orders.slice(-1)[0]?.time;
            const [lastDateF] = (
              new Date(lastTime).toLocaleString() + ''
            ).split(',');
            const [month, day, year] = lastDateF.split('/');
            const lastDate = `${day} ${monthNumtoText(month)}. ${year}`;
            const daysago = duration(
              Math.floor((Date.now() - lastTime) / 1000)
            );
            return { lastDate, daysago };
          })();
          //DATA5
          const data5 = (() => {
            const tc = orders.length;
            const dur =
              (orders.slice(-1)[0]?.time - orders[0]?.time) /
              (24 * 60 * 60 * 1000);
            return (tc / dur).toFixed(2);
          })();
          //DATA6
          const data6 = price.data['BTCUSDT'];
          //DATA7
          const data7 = (() => {
            return balances
              .filter(
                (a) =>
                  parseFloat(a.free) &&
                  (price.data[`${a.asset}USDT`] ||
                    price.data[`${a.asset}BTC`] ||
                    price.data[`${a.asset}BNB`] ||
                    a.asset === 'USDT')
              )
              .reduce((a, d) => {
                const { asset, free: balance } = d;
                const usdtvalue =
                  asset === 'USDT'
                    ? balance * 1
                    : price.data[`${asset}USDT`]
                    ? balance * 1 * price.data[`${asset}USDT`]
                    : price.data[`${asset}BTC`]
                    ? balance *
                      1 *
                      price.data[`${asset}BTC`] *
                      require('./price').data[`BTCUSDT`]
                    : price.data[`${asset}BNB`]
                    ? balance *
                      1 *
                      price.data[`${asset}BNB`] *
                      require('./price').data[`BNBUSDT`]
                    : 0;
                const percent =
                  ((usdtvalue * 100) / data1.usdtvalue).toFixed(2) * 1;
                return [...a, { asset, balance, usdtvalue, percent }];
              }, [])
              .filter((a) => a.percent > 1);
          })();

          //DATA 8
          const data8 = (() => {
            return orders.reduce((a, d) => {
              const ts = d.time;
              const [tsd] = (new Date(ts).toLocaleString() + '').split(',');
              const [month, day, year] = tsd.split('/');
              const key = `${monthNumtoText(month)}-${year}`;
              const seq = `${year}-${month < 10 ? `0${month}` : month}`;
              if (!a[key]) a[key] = { seq, count: 0 };
              a[key].count++;
              return a;
            }, {});
          })();
          //DATA 9
          const data9 = (() => {
            return orders.reduce((a, d) => {
              if (!a[d.symbol]) a[d.symbol] = 0;
              a[d.symbol]++;
              return a;
            }, {});
          })();
          //DATA10
          const data10 = orders;
          // const data10 = (() => {
          //   return orders.reduce((a, d) => {
          //     if (!a[d.type]) a[d.type] = 0;
          //     a[d.type]++;
          //     return a;
          //   }, {});
          // })();
          socket.emit('RESULTS', [
            data1,
            data2,
            data3,
            data4,
            data5,
            data6,
            data7,
            data8,
            data9,
            data10,
          ]);
        } catch (err) {
          log(err);
        }
      });
    });
  },
};

module.exports = socketServer;
