const BinanceAJAX  = require('./src/BinanceAJAX');
const BinanceStreams  = require('./src/BinanceStreams');
const BinanceWS  = require('./src/BinanceWS');
const BinanceSync  = require('./src/BinanceSync');

/**
 * BinanceAJAX is a class for managing AJAX requests to Binance.
 * @type {BinanceAJAX}
 */
BinanceSync.BinanceAJAX = BinanceAJAX;

/**
 * BinanceStreams is a class for managing WebSocket streams on Binance API.
 * @type {BinanceStreams}
 */
BinanceSync.BinanceStreams = BinanceStreams;

/**
 * BinanceWS is a class for managing WebSocket connections on Binance API.
 * @type {BinanceWS}
 */
BinanceSync.BinanceWS = BinanceWS;

/**
 * BinanceSync is a class for synchronizing with Binance API.
 * @type {BinanceSync}
 */
module.exports = BinanceSync;
