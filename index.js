const BinanceAJAX  = require('./src/BinanceAJAX');
const BinanceStreams  = require('./src/BinanceStreams');
const BinanceWS  = require('./src/BinanceWS');
const BinanceSync  = require('./src/BinanceSync');

BinanceSync.BinanceAJAX = BinanceAJAX;
BinanceSync.BinanceStreams = BinanceStreams;
BinanceSync.BinanceWS = BinanceWS;

module.exports = BinanceSync;
