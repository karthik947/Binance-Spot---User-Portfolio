module.exports = {
  duration(seconds) {
    seconds = Number(seconds);
    const y = Math.floor(seconds / (365 * 3600 * 24));
    const d = Math.floor((seconds % (365 * 3600 * 24)) / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const yDisplay = y > 0 ? y + 'Y ' : '';
    const dDisplay = d > 0 ? d + 'D ' : '';
    const hDisplay = h > 0 ? h + 'h ' : '';
    const mDisplay = m > 0 ? m + 'm ' : '';
    const sDisplay = s > 0 ? s + 's' : '';
    return yDisplay + dDisplay + hDisplay + mDisplay + sDisplay;
  },
  monthNumtoText(n) {
    return [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ][n - 1];
  },
  proxyServers: [
    '185.114.137.14:8282',
    '103.138.174.150:3128',
    '159.89.193.91:3128',
    '60.246.7.4:8080',
    '103.138.174.150:3128',
    '159.89.193.91:3128',
    '51.75.147.44:3128',
    '51.75.147.43:3128',
    '50.30.47.151:3128',
    '157.7.198.176:1080',
  ],
};
