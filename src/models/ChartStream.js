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
        const { symbol, interval, history, ws, currentStream, accumulateCandles } = Object(setup);

        try {
            /** @property {string} symbol - The symbol for the chart stream. */
            this.symbol = symbol;

            /** @property {string} interval - The interval for the chart stream. */
            this.interval = interval;

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
        } catch (err) {
            throw err;
        }
    }

    /**
     * Get an array of candles, including both historical and the current stream, sorted by open time.
     * @returns {Candlestick[]} - An array of candles.
     */
    get candles() {
        if (this.currentStream.isCandleClosed) {
            return this.history.sort((a, b) => b.openTime - a.openTime);
        }

        const blended = [...this.history, this.currentStream];
        return blended.sort((a, b) => b.openTime - a.openTime);
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
        let result;

        this.candles.map(item => {
            if (!item.isCandleClosed) {
                return;
            }

            if (!result) {
                result = item;
                return;
            }

            if (item.time > result.time) {
                result = item;
            }
        });

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

        if (!this.accumulateCandles && this.candles.length > this.initialLength) {
            this.history.shift();
        }

        if (candle.time === this.lastClosedCandle.time) {
            this.history.pop();
        }

        if (candle?.isCandleClosed) {
            this.history.push(candle);
        }

        this.currentStream = candle;
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

            listeners?.update && process.off(this.buildEventName('update'), listeners?.update);
            listeners?.close && process.off(this.buildEventName('close'), listeners?.close);
            listeners?.error && process.off(this.buildEventName('error'), listeners?.error);

            delete this.listeners[listenID];

            if (!listenersLength) {
                this.close();
            }
        } else {
            Object.keys(this.listeners).map(listener => {
                listener?.update && process.off(this.buildEventName('update'), listener?.update);
                listener?.close && process.off(this.buildEventName('close'), listener?.close);
                listener?.error && process.off(this.buildEventName('error'), listener?.error);

                delete this.listeners[listenID];
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

        this.listeners[listenID][evName] = callback;
        appendEvent(this.buildEventName(evName), ({ detail }) => callback(detail));

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
