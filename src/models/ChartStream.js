const Candlestick = require('./Candlestick');
const crypto = require('crypto');

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
        const { symbol, interval, history, ws } = Object(setup);

        try {
            /** @property {string} symbol - The symbol for the chart stream. */
            this.symbol = symbol;

            /** @property {string} interval - The interval for the chart stream. */
            this.interval = interval;

            /** @property {Candlestick[]} history - The history data for the chart stream (Only the past candles). It's ordered from the oldest to the most recent candle */
            this.history = history.filter(item => item.isCandleClosed);

            /** @property {WebSocket} ws - The WebSocket connection. */
            this.ws = ws;

            /** @property {Object} listeners - Listeners of strams opened. */
            this.listeners = {};
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

        process.emit(this.buildEventName('update'), this);
    }

    buildEventName(eventType) {
        return `chartStream:${this.symbol}:${this.interval}:${eventType}`;
    }

    kill(listenID) {
        if (listenID) {
            const listeners = this.listeners[listenID];
            const listenersLength = Object.keys(this.listeners).length;

            if (!listeners) {
                return;
            }

            if (listenersLength === 1) {
                process.emit(this.buildEventName('close'), this);
            }

            process.off(this.buildEventName('update'), listeners?.update);
            process.off(this.buildEventName('close'), listeners?.close);
            process.off(this.buildEventName('error'), listeners?.error);

            delete this.listeners[listenID];

            if (!listenersLength) {
                this.close();
            }
        } else {
            process.off(this.buildEventName('update'));
            process.off(this.buildEventName('close'));
            process.off(this.buildEventName('error'));

            this.close();
        }
    }

    on(evName, callback, customListenID) {
        const listenID = customListenID || crypto.randomUUID();

        if (typeof callback !== 'function') {
            return;
        }

        if (!this.listeners[listenID]) {
            this.listeners[listenID] = {};
        }

        this.listeners[listenID][evName] = callback;
        process.on(this.buildEventName(evName), callback);

        return listenID;
    }

    deleteGlobalChart() {
        if (global.binanceSync.charts[this.symbol]) {
            delete global.binanceSync.charts[this.symbol][this.interval];
        }
    }

    close() {
        if (this.ws.close) {
            this.ws.close();
        } else if (this.ws.pause) {
            this.ws.pause();
        }

        this.deleteGlobalChart();
    }
}

module.exports = ChartStream;
