const got = require('got');
const crypto = require('crypto');
const tunnel = require('tunnel');
const log = console.log;

let apiHandler = {
  counter: 0,
  getHost() {
    apiHandler.counter++;
    const { proxyServers } = require('./helper');
    if (apiHandler.counter === proxyServers.length) apiHandler.counter = 0;
    const [host, port] = proxyServers[apiHandler.counter].split(':');
    return { host, port };
  },
  async procreq({ url, params, label, keys }) {
    try {
      const dataQueryString =
        label === 'accountInfo'
          ? `recvWindow=20000&timestamp=${Date.now()}`
          : `symbol=${
              params['symbol']
            }&limit=1000&recvWindow=20000&timestamp=${Date.now()}`;
      const signature = crypto
        .createHmac('sha256', keys['seckey'])
        .update(dataQueryString)
        .digest('hex');
      const furl = url + '?' + dataQueryString + '&signature=' + signature;
      const request = got(furl, {
        headers: {
          'X-MBX-APIKEY': keys['apikey'],
        },
        agent: {
          https: tunnel.httpsOverHttp({
            proxy: apiHandler.getHost(),
          }),
        },
        responseType: 'json',
      });
      const p2 = new Promise((resolve, reject) => {
        setTimeout(() => {
          request.cancel();
          resolve('');
        }, 5 * 1000);
      });
      return await Promise.race([request, p2]);
    } catch (err) {
      throw err;
    }
  },
  async processWithRetry(pl) {
    try {
      const ra = [...new Array(20)].map((r) => 1);
      let apiresp;
      let retryAttempt = 0;
      const resp = await ra.reduce(async (previousPromise, nextID) => {
        try {
          const res = await previousPromise;
          if (!res?.body && !apiresp) {
            retryAttempt++;
            return apiHandler.procreq(pl);
          }
          if (res?.body) apiresp = res?.body;
          return Promise.resolve();
        } catch (err) {
          retryAttempt++;
          return apiHandler.procreq(pl);
        }
      }, Promise.resolve());
      return { ...pl, retryAttempt, apiresp };
    } catch (err) {
      log(err);
      return '';
    }
  },
};

module.exports = apiHandler;
