require('./globals');

const AJAX  = require('./BinanceAJAX');
const BinanceWS  = require('./BinanceWS');
const ChartStream = require('./models/ChartStream');

/**
 * @class
 * BinanceSync class for synchronizing with Binance API.
 */
class BinanceSync {
    static BinanceStreams = require('./BinanceStreams');
    /**
     * Constructs a new BinanceSync instance.
     * @param {string} API_KEY - The API key for Binance.
     * @param {string} SECRET_KEY - The secret key for Binance.
     * @throws {Error} If there is an error during construction.
     */
    constructor(API_KEY, SECRET_KEY) {
        try {
            this._API_KEY = () => API_KEY;
            this._SECRET_KEY = () => SECRET_KEY;

            /**
             * @member {AJAX}
             */
            this.reqHTTP = new AJAX(this.API_KEY, this.SECRET_KEY);

            /**
             * @member {BinanceWS}
             */
            this.webSocket = new BinanceWS(this);
        } catch (err) {
            throw err;
        }
    }

    /**
     * Gets the API key.
     * @return {string} The API key.
     */
    get API_KEY() {
        return this._API_KEY();
    }

    /**
     * Gets the secret key.
     * @return {string} The secret key.
     */
    get SECRET_KEY() {
        return this._SECRET_KEY();
    }

    /**
     * Gets the streams.
     * @return {BinanceSync.BinanceStreams} The BinanceStreams object.
     */
    get streams() {
        return new BinanceSync.BinanceStreams(this);
    }

    /**
     * To get a chart from the charts cache, if the chart wasn't initialized yet, this will return undefined.
     * @param {string} symbol The chart symbol. (BTCUSDT)
     * @param {string} interval The chart interval. (15m)
     * @returns 
     */
    getBuffChart(symbol, interval) {
        const charts = global.binanceSync?.charts;
        const assetCharts = charts && charts[symbol];
        const chart = assetCharts && assetCharts[interval];

        return chart;
    }

    /**
     * To set a chart on charts cache.
     * @param {ChartStream} newChart 
     * @param {WebSocket} ws The websocket object
     * @param {string} symbol The chart symbol. (BTCUSDT)
     * @param {string} interval The chart interval. (15m)
     * @returns 
     */
    setBuffChart(newChart, ws, symbol, interval) {
        const { charts } = Object(global.binanceSync);

        if (!charts[symbol]) {
            charts[symbol] = {};
        }

        if (!this.getBuffChart(symbol, interval)) {
            newChart.ws = ws;
            charts[symbol][interval] = newChart;
        }

        return this.getBuffChart(symbol, interval);
    }

    /**
     * Gets the exchange information.
     * @async
     * @return {Promise<Object>} The exchange information.
     * @throws {Error} If there is an error during the request.
     */
    async exchangeInfo() {
        try {
            const res = await this.reqHTTP.GET('/fapi/v1/exchangeInfo');
            if (res.code && res.msg) {
                throw new Error(`[${res.code}] ${res.msg}`);
            }

            return res;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Changes the leverage.
     * @async
     * @param {string} symbol - The symbol for the leverage.
     * @param {number} leverage - The leverage to be set.
     * @return {Promise<Object>} Binance response from the request.
     * @throws {Error} If there is an error during the request.
     */
    async changeLeverage(symbol, leverage) {
        try {
            if (isNaN(leverage) || leverage < 1 || leverage > 120) {
                leverage = 1;
            } else {
                leverage = Number(leverage);
            }

            const res = await this.reqHTTP.POST('/fapi/v1/leverage', { symbol, leverage });
            if (res.code && res.msg) {
                throw new Error(`[${res.code}] ${res.msg}`);
            }

            return res;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Changes the margin type.
     * @async
     * @param {string} symbol - The symbol for the margin type.
     * @param {string} marginType - The margin type to be set.
     * @return {Promise<Object>} The response from the request.
     * @throws {Error} If there is an error during the request.
     */
    async changeMarginType(symbol, marginType) {
        try {
            if (marginType !== 'ISOLATED' && marginType !== 'CROSSED') {
                marginType = 'ISOLATED';
            }

            const res = await this.reqHTTP.POST('/fapi/v1/marginType', { symbol, marginType });
            if (res.code && res.msg) {
                throw new Error(`[${res.code}] ${res.msg}`);
            }

            return res;
        } catch (err) {
            throw err;
        }
    }
    
    /**
     * Gets the leverage brackets.
     * @async
     * @param {string} symbol - The symbol for the leverage brackets.
     * @return {Promise<Object>} The leverage brackets.
     * @throws {Error} If there is an error during the request.
     */
    async leverageBrackets(symbol) {
        let response;

        try {
            if (symbol) {
                response = await this.reqHTTP.GET('/fapi/v1/leverageBracket', { symbol });
            } else {
                response = await this.reqHTTP.GET('/fapi/v1/leverageBracket');
            }

            if (response.code && response.msg) {
                throw new Error(`[${response.code}] ${response.msg}`);
            }

            if (Array.isArray(response)) {
                response.map(item => {
                    item.maxLeverage = item.brackets[0].initialLeverage;
                });
            }

            return response;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Gets the futures account information.
     * @async
     * @return {Promise<Object>} The futures account information.
     * @throws {Error} If there is an error during the request.
     */
    async futuresAccountInfo() {
        try {
            const res = await this.reqHTTP.GET('/fapi/v2/account');
            if (res.code && res.msg) {
                throw new Error(`[${res.code}] ${res.msg}`);
            }

            return res;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Gets the futures account balance.
     * @async
     * @return {Promise<Object>} The futures account balance.
     * @throws {Error} If there is an error during the request.
     */
    async futuresAccountBalance() {
        try {
            const res = await this.reqHTTP.GET('/fapi/v2/balance');
            if (res.code && res.msg) {
                throw new Error(`[${res.code}] ${res.msg}`);
            }

            return res;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Gets the futures chart.
     * @async
     * @param {string} symbol - The symbol for the chart.
     * @param {string} interval - The interval for the chart.
     * @param {Object} options - The options for the chart.
     * @param {Date|number} options.startTime - The options for the chart.
     * @param {Date|number} options.endTime - The options for the chart.
     * @param {number} options.limit - The options for the chart.
     * @return {Promise<Candlestick[]>} The futures chart.
     * @throws {Error} If there is an error during the request.
     */
    async futuresChart(symbol, interval, options) {
        const { startTime, endTime, limit = 500 } = Object(options); 
        const Candlestick = require('./models/Candlestick');

        try {
            const candles = await this.reqHTTP.GET('/fapi/v1/klines', {
                symbol,
                interval,
                startTime,
                endTime,
                limit
            });

            if (!Array.isArray(candles)) {
                return { error: true, code: candles.code, message: candles.msg };
            }

            return candles.map(candle => new Candlestick({
                symbol,
                interval,
                openTime: candle[0],
                open: candle[1],
                high: candle[2],
                low: candle[3],
                close: candle[4],
                volume: candle[5],
                closeTime: candle[6],
                isCandleClosed: true
            }));
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * Creates a new order.
     * @async
     * @param {string} symbol - The symbol for the order.
     * @param {string} side - The side of the order.
     * @param {string} type - The type of the order.
     * @param {Object} params - The parameters for the order.
     * @return {Promise<Object>} The new order.
     * @throws {Error} If there is an error during the request.
     */
    async newOrder(symbol, side, type, params) {
        try {
            const newOrder = await this.reqHTTP.POST('/fapi/v1/order', {
                symbol,
                side,
                type,
                ...params
            });

            if (newOrder.code && newOrder.msg) {
                return { error: true, code: newOrder.code, message: newOrder.msg };
            }

            return newOrder;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Cancels an order.
     * @async
     * @param {string} symbol - The symbol for the order.
     * @param {string} clientOrderId - The client order ID for the order.
     * @return {Promise<Object>} The cancelled order.
     * @throws {Error} If there is an error during the request.
     */
    async cancelOrder(symbol, clientOrderId) {
        try {
            const cancelled = await this.reqHTTP.DELETE('/fapi/v1/order', { symbol, origClientOrderId: clientOrderId });

            if (cancelled.code && cancelled.msg) {
                return new Error(`[${cancelled.code}] ${cancelled.msg}`);
            }

            return cancelled;
        } catch (err) {
            return err;
        }
    }

    /**
     * Cancels multiple orders.
     * @async
     * @param {string} symbol - The symbol for the orders.
     * @param {Array} orderIds - The order IDs for the orders.
     * @return {Promise<Object>} The response from the request.
     * @throws {Error} If there is an error during the request.
     */
    async cancelMultipleOrders(symbol, orderIds) {
        try {
            const res = await this.reqHTTP.DELETE('/fapi/v1/batchOrders', { symbol, orderidlist: orderIds });
            if (res.code && res.msg) {
                throw new Error(`[${res.code}] ${res.msg}`);
            }

            return res;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Cancels all orders of an asset.
     * @async
     * @param {string} symbol - The symbol for the asset.
     * @return {Promise<Object>} The response from the request.
     * @throws {Error} If there is an error during the request.
     */
    async cancelAllOrdersOfAsset(symbol) {
        try {
            const res = this.reqHTTP.DELETE('/fapi/v1/allOpenOrders', { symbol });
            if (res.code && res.msg) {
                throw new Error(`[${res.code}] ${res.msg}`);
            }

            return res;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = BinanceSync;
