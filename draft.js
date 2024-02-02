const BinanceSync = require('./index');
const binance = new BinanceSync();
binance.futuresChart('BTCUSDT', '15m', { limit: 500 }).then(res => {
    debugger
})
