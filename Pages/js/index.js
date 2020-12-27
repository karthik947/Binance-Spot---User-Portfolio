const log = console.log;
const chartProperties = {
  // width: 500,
  // height: 180,
  timeScale: {
    timeVisible: true,
    secondsVisible: false,
  },
};

let dtable = '';
const getTS = (ms) => {
  return `<span style="display:none;">${ms}</span>${(
    new Date(ms).toLocaleString() + ''
  ).replace(',', ' ')}`;
};

const colors = [
  'MediumVioletRed',
  'DeepPink',
  'PaleVioletRed',
  'HotPink',
  'LightPink',
  'Pink',
  'DarkRed',
  'Red',
  'Firebrick',
  'Crimson',
  'IndianRed',
  'LightCoral',
  'Salmon',
  'DarkSalmon',
  'LightSalmon',
  'OrangeRed',
  'Tomato',
  'DarkOrange',
  'Coral',
  'Orange',
  'DarkKhaki',
  'Gold',
  'Khaki',
  'PeachPuff',
  'Yellow',
  'PaleGoldenrod',
  'Moccasin',
  'PapayaWhip',
  'LightGoldenrodYellow',
  'LemonChiffon',
  'LightYellow',
  'Maroon',
  'Brown',
  'SaddleBrown',
  'Sienna',
  'Chocolate',
  'DarkGoldenrod',
  'Peru',
  'RosyBrown',
  'Goldenrod',
  'SandyBrown',
  'Tan',
  'Burlywood',
  'Wheat',
  'NavajoWhite',
  'Bisque',
  'BlanchedAlmond',
  'Cornsilk',
  'DarkGreen',
  'Green',
  'DarkOliveGreen',
  'ForestGreen',
  'SeaGreen',
  'Olive',
  'OliveDrab',
  'MediumSeaGreen',
  'LimeGreen',
  'Lime',
  'SpringGreen',
  'MediumSpringGreen',
  'DarkSeaGreen',
  'MediumAquamarine',
  'YellowGreen',
  'LawnGreen',
  'Chartreuse',
  'LightGreen',
  'GreenYellow',
  'PaleGreen',
  'Teal',
  'DarkCyan',
  'LightSeaGreen',
  'CadetBlue',
  'DarkTurquoise',
  'MediumTurquoise',
  'Turquoise',
  'Aqua',
  'Cyan',
  'Aquamarine',
  'PaleTurquoise',
  'LightCyan',
  'Navy',
  'DarkBlue',
  'MediumBlue',
  'Blue',
  'MidnightBlue',
  'RoyalBlue',
  'SteelBlue',
  'DodgerBlue',
  'DeepSkyBlue',
  'CornflowerBlue',
  'SkyBlue',
  'LightSkyBlue',
  'LightSteelBlue',
  'LightBlue',
  'PowderBlue',
];
const socket = io.connect('/');

socket.on('connect', () => {
  log('Socket connection successful!');
});

const generate = () => {
  const apikey = document.getElementById('apikey').value;
  const seckey = document.getElementById('seckey').value;
  if (apikey.length != 64 || seckey.length != 64)
    return alert('Enter valid API Keys!');
  document.getElementById('generate').disabled = true;
  socket.emit('INPUTDATA', { apikey, seckey });
};

socket.on('RESULTS', (pl) => {
  document.getElementById('generate').disabled = false;
  log(pl);
  const [
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
  ] = pl;
  //data1
  document.getElementsByClassName(
    'card1'
  )[0].innerHTML = `<p class="text-title">Total value of all coins</p>
  <p><span class="text-primary">${data1.usdtvalue} USDT </span><span class="text-secondary">(${data1.btcvalue} BTC)</span></p>`;
  //data2
  document.getElementsByClassName(
    'card2'
  )[0].innerHTML = `<p class="text-title">Total Trades</p>
  <p><span class="text-primary">${data2.totaltrades} </span><span class="text-secondary">(${data2.days})</span></p>`;
  //data3
  document.getElementsByClassName(
    'card3'
  )[0].innerHTML = `<p class="text-title">First Trade</p>
  <p><span class="text-primary">${data3.firstDate} </span><span class="text-secondary">(${data3.daysago})</span></p>`;
  //data4
  document.getElementsByClassName(
    'card4'
  )[0].innerHTML = `<p class="text-title">Last Trade</p>
  <p><span class="text-primary">${data4.lastDate} </span><span class="text-secondary">(${data4.daysago})</span></p>`;
  //data5
  document.getElementsByClassName(
    'card5'
  )[0].innerHTML = `<p class="text-title">Order Frequency</p>
  <p><span class="text-primary">${data5} </span><span class="text-secondary"> per day</span></p>`;
  //data6
  document.getElementsByClassName(
    'card6'
  )[0].innerHTML = `<p class="text-title">Bitcoin Price (USDT)</p>
  <p><span class="text-primary">${data6} USDT </span></p>`;
  //data7
  (() => {
    const chart1 = new Chart(document.getElementById('bdoa').getContext('2d'), {
      type: 'doughnut',
      data: {
        datasets: [
          {
            data: data7.map((d) => d.percent),
            backgroundColor: data7.map(
              (d) => colors[Math.floor(Math.random() * colors.length)]
            ),
          },
        ],
        labels: data7.map((d) => d.asset),
      },
    });
  })();
  //data8
  (() => {
    const keyA = Object.keys(data8).sort((a, b) => data8[a].seq - data8[b].seq);

    const chart2 = new Chart(
      document.getElementById('orderstimeline').getContext('2d'),
      {
        type: 'line',
        data: {
          datasets: [
            {
              label: 'Orders Timeline',
              data: keyA.map((key) => data8[key].count),
              borderColor: 'rgba(0, 204, 255,0.3)',
              fill: 'origin',
              backgroundColor: 'rgba(0, 204, 255,0.3)',
            },
          ],
          labels: keyA,
        },
      }
    );
  })();
  //data9
  (() => {
    const chart2 = new Chart(
      document.getElementById('ordersdistbtn').getContext('2d'),
      {
        type: 'bar',
        data: {
          datasets: [
            {
              label: 'Orders Distribution',
              data: Object.keys(data9).map((key) => data9[key]),
              borderColor: 'purple',
              backgroundColor: 'purple',
            },
          ],
          labels: Object.keys(data9),
        },
      }
    );
  })();
  //data10
  (() => {
    const records = data10.map((rec) => {
      return [
        'time',
        'orderId',
        'clientOrderId',
        'symbol',
        'side',
        'status',
        'origQty',
        'price',
        'stopPrice',
      ].map((key) => {
        switch (key) {
          case 'time': {
            return getTS(rec[key]);
          }
          default: {
            return rec[key];
          }
        }
      });
    });
    dtable.clear().rows.add(records).draw();
  })();
});

$(document).ready(function () {
  dtable = $('#ordersTable').DataTable({
    pageLength: 20,
    order: [[0, 'desc']],
  });
});
