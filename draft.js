const BinanceSync = require('./index');
const binance = new BinanceSync();

require('mdoc').run({
    // configuration options (specified below)
    inputDir: 'src',
    outputDir: 'docs'
});
