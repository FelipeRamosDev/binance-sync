const Candlestick = require('./Candlestick');

/**
 * Model to build a chart stream by joing the current candlestick stream and the past candlestick chart.
 * @class
*/
class ChartStream {
    /**
     * Create a ChartStream.
     * @constructor
     * @param {Object} setup - The configuration object for chart stream.
     * @param {string} setup.symbol - The symbol for the chart stream.
     * @param {string} setup.interval - The interval for the chart stream.
     * @param {Array} setup.history - The history data for the chart stream.
     * @param {Object} setup.snapshot - The raw snapshot coming from Binance API
     */
    constructor(setup) {
        const { symbol, interval, history } = Object(setup);

        try {
            /** @property {string} symbol - The symbol for the chart stream. */
            this.symbol = symbol;

            /** @property {string} interval - The interval for the chart stream. */
            this.interval = interval;

            /** @property {Candlestick[]} history - The history data for the chart stream (Only the past candles). It's ordered from the oldest to the most recent candle */
            this.history = history.filter(item => item.isCandleClosed);
        } catch (err) {
            throw err;
        }
    }

    get candles() {
        return [...this.history, this.currentStream].sort((a, b) => b.openTime - a.openTime);
    }

    get currentPrice() {
        return this.currentStream?.close;
    }

    get lastClosedCandle() {
        return this.history[this.history.length - 1];
    }

    updateSnapshot(snapshot) {
        if (!snapshot?.k) {
            return;
        }

        const { t, T, i, o, c, h, l, v, n, x, q } = Object(snapshot?.k);
        const candle = new Candlestick({
            symbol: this.symbol,
            openTime: t,       // Kline start time
            closeTime: T,      // Kline close time
            interval: i,       // Interval
            open: o,           // Open price
            close: c,          // Close price
            high: h,           // High price
            low: l,            // Low price
            volume: v,         // volume
            numberOfTrades: n, // Number of trades
            isCandleClosed: x, // Is this kline closed?
            quoteVolume: q     // Quote asset volume
        });

        if (candle.openTime === this.lastClosedCandle.openTime) {
            this.history.pop();
        }
        
        if (candle?.isCandleClosed) {
            this.history.shift();
            this.history.push(candle);
        } else {
            this.currentStream = candle;
        }

    }
}

module.exports = ChartStream;
