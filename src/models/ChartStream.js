const Candlestick = require('./Candlestick');
const crypto = require('crypto');

/**
 * Model to build a chart stream by joining the current candlestick stream and the past candlestick chart.
 * @class
 */
class ChartStream {
    /**
     * Create a ChartStream.
     * @constructor
     * @param {Object} setup - The configuration object for the chart stream.
     * @param {string} setup.symbol - The symbol for the chart stream.
     * @param {string} setup.interval - The interval for the chart stream.
     * @param {Array} setup.history - The history data for the chart stream.
     * @param {Object} setup.snapshot - The raw snapshot coming from Binance API.
     */
    constructor(setup) {
        const { symbol, interval, history, ws } = Object(setup);

        try {
            /** @property {string} symbol - The symbol for the chart stream. */
            this.symbol = symbol;

            /** @property {string} interval - The interval for the chart stream. */
            this.interval = interval;

            /** @property {Candlestick[]} history - The history data for the chart stream (Only the past candles). It's ordered from the oldest to the most recent candle. */
            this.history = history.filter(item => item.isCandleClosed);

            /** @property {WebSocket} ws - The WebSocket connection. */
            this.ws = ws;

            /** @property {Object} listeners - Listeners of streams opened. */
            this.listeners = {};
        } catch (err) {
            throw err;
        }
    }

    /**
     * Get an array of candles, including both historical and the current stream, sorted by open time.
     * @returns {Candlestick[]} - An array of candles.
     */
    get candles() {
        return [...this.history, this.currentStream].sort((a, b) => b.openTime - a.openTime);
    }

    /**
     * Get the current closing price of the chart.
     * @returns {number} - The current closing price.
     */
    get currentPrice() {
        return this.currentStream?.close;
    }

    /**
     * Get the last closed candle from the historical data.
     * @returns {Candlestick} - The last closed candle.
     */
    get lastClosedCandle() {
        return this.history[this.history.length - 1];
    }

    /**
     * Update the snapshot and process the data.
     * @param {Object} snapshot - The raw snapshot data from Binance API.
     */
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
            volume: v,         // Volume
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

    /**
     * Build the event name based on the symbol, interval, and event type.
     * @param {string} eventType - The type of event.
     * @returns {string} - The constructed event name.
     */
    buildEventName(eventType) {
        return `chartStream:${this.symbol}:${this.interval}:${eventType}`;
    }

    /**
     * Kill the chart stream based on the provided listen ID or close all listeners.
     * @param {string} [listenID] - The ID of the listener to be removed.
     */
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

    /**
     * Attach an event listener to the chart stream.
     * @param {string} evName - The name of the event to listen for.
     * @param {Function} callback - The callback function to be executed when the event occurs.
     * @param {string} [customListenID] - A custom ID for the listener.
     * @returns {string} - The assigned listen ID.
     */
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

    /**
     * Delete the global chart from the BinanceSync global object.
     */
    deleteGlobalChart() {
        if (global.binanceSync.charts[this.symbol]) {
            delete global.binanceSync.charts[this.symbol][this.interval];
        }
    }

    /**
     * Close the chart stream by closing the WebSocket connection and deleting the global chart.
     */
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