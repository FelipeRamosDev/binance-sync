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
     * @param {WebSocket} setup.ws - The websocket connection.
     * @param {boolean} setup.accumulateCandles - If set to true, it will accumulate candles on the chart along the time.
     */
    constructor(setup) {
        const { symbol, interval, limit, history = [], ws, currentStream, accumulateCandles } = Object(setup);

        /** @property {string} symbol - The symbol for the chart stream. */
        this.symbol = symbol;

        /** @property {string} interval - The interval for the chart stream. */
        this.interval = interval;

        /** @property {string} limit - The limit defined for the chart. */
        this.limit = limit;

        /** @property {Candlestick[]} history - The history data for the chart stream (Only the past candles). It's ordered from the oldest to the most recent candle. */
        this.history = history.filter(item => item.isCandleClosed);

        /** @property {number} initialLength - The initial history length */
        this.initialLength = this.history.length;

        /** @property {boolean} accumulateCandles - The history length wil be fixed on the initial length */
        this.accumulateCandles = Boolean(accumulateCandles);

        /** @property {WebSocket} ws - The WebSocket connection. */
        this.ws = ws;

        /** @property {Object} listeners - Listeners of streams opened. */
        this.listeners = {};

        /** @property {Object} currentStream - The current candlestick streaming. */
        this.currentStream = currentStream || {};

        /** @property {Map} _candles - The map that stores the candles. */
        this._candles = new Map();

        history.map(candle => this.setCandle(candle));
    }

    /**
     * Get an array of candles, including both historical and the current stream, sorted by open time.
     * @returns {Candlestick[]} - An array of candles.
     */
    get candles() {
        return this.toArray(false, true);
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
        const allClosed = this.toArray({ isCandleClosed: true }, true);

        if (allClosed.length) {
            return allClosed[0];
        }
    }

    setCandle(candle) {
        if (candle instanceof Candlestick) {
            this._candles.set(candle.openTime, candle);
        }
    }

    deleteCandle(key) {
        this._candles.delete(key);
    }

    toArray(filter, toRecentFirst) {
        const result = [];

        this._candles.forEach(candle => {
            if (!filter || !Object.keys(filter).length) {
                return result.push(candle);
            }

            if (Object.keys(filter).every(key => candle[key] === filter[key])) {
                result.push(candle);
            }
        });

        if (toRecentFirst) {
            return result.sort((prev, curr) => curr.openTime - prev.openTime);
        }

        return result;
    }

    toObject() {
        return {
            ...this,
            candles: this.candles,
            currentPrice: this.currentPrice,
            lastClosedCandle: this.lastClosedCandle
        }
    }

    getOldestCandle() {
        const history = this.toArray({ isCandleClosed: true });

        if (history.length) {
            const oldest = history[0];
            return oldest;
        }
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

        this.setCandle(candle);
        this.currentStream = candle;

        if (this._candles.size > this.limit) {
            const oldest = this.getOldestCandle();
            if (oldest) {
                this.deleteCandle(oldest.openTime);
            }
        }

        emitEvent(this.buildEventName('update'), this.toObject());
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
                emitEvent(this.buildEventName('close'), this);
            }

            listeners?.update && process.removeListener(this.buildEventName('update'), listeners?.update);
            listeners?.close && process.removeListener(this.buildEventName('close'), listeners?.close);
            listeners?.error && process.removeListener(this.buildEventName('error'), listeners?.error);

            delete this.listeners[listenID];

            if (!Object.keys(this.listeners).length) {
                this.close();
            }
        } else {
            Object.keys(this.listeners).map(key => {
                const listener = this.listeners[key];
                listener?.update && process.removeListener(this.buildEventName('update'), listener?.update);
                listener?.close && process.removeListener(this.buildEventName('close'), listener?.close);
                listener?.error && process.removeListener(this.buildEventName('error'), listener?.error);

                delete this.listeners[key];
            });

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

        this.listeners[listenID][evName] = ({ detail }) => callback(detail);
        appendEvent(this.buildEventName(evName), this.listeners[listenID][evName]);

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
