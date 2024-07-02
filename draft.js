const BinanceSync = require('./index');
const binance = new BinanceSync();

binance.streams.candlestickChart('LRCUSDT', '1m', {
   limit: 10
});
function callback() {
   if (!binanceSync.charts.LRCUSDT) {
      setTimeout(callback, 3000);
      return;
   }

   const chart = binanceSync.charts.LRCUSDT["1m"];
   const candles = chart.candles;
   const times = chart.candles.map(item => new Date(item.openTime));
   setTimeout(callback, 3000);
}
setTimeout(callback, 3000);
