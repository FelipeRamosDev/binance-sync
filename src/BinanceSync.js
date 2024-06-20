require('./globals');

const AccountTrade = require('./models/AccountTrade');
const AJAX  = require('./BinanceAJAX');
const ChartStream = require('./models/ChartStream');
const AccountInfoPosition = require('./models/AccountInfoPosition');
const FuturesOrder = require('binance-sync/src/models/FuturesOrder');

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

            if (isClient()) {
                const BinanceWSClient = require('./BinanceWSClient');
                /**
                 * @member {BinanceWSClient}
                 */
                this.webSocket = new BinanceWSClient(this);
            } else {
                const BinanceWS = require('./BinanceWS');
                /**
                 * @member {BinanceWS}
                 */
                this.webSocket = new BinanceWS(this);
            }
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
     * @returns {object}
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
     * @returns {object}
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
                return Error.new(res.code, res.msg);
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
                return Error.new(res.code, res.msg);
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
                return Error.new(res.code, res.msg);
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
                return Error.new(response.code, response.msg);
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
    async futuresAccountInfo(options) {
        const { onlyOpenedPositions } = Object(options);

        try {
            const accountInfo = await this.reqHTTP.GET('/fapi/v2/account');
            if (accountInfo.code && accountInfo.msg) {
                return Error.new(accountInfo.code, accountInfo.msg);
            }
            
            let positions;
            if (onlyOpenedPositions) {
                positions = accountInfo.positions.filter(item => Number(item.positionAmt));
            } else {    
                positions = accountInfo.positions;
            }

            accountInfo.positions = positions.map(item => new AccountInfoPosition(item));
            return accountInfo;
        } catch (err) {
            throw err;
        }
    }

    /**
     * To get all user's opened positions on Binance.
     * @param {string} symbol - If a symbol is provided it will return the symbol's position if it exist, if any position is opened for the symbol it will return undefined.
     */
    async futuresOpenedPositions(symbol) {
        try {
            const accInfo = await this.futuresAccountInfo();

            if (!accInfo || accInfo.error) {
                return accInfo;
            }

            const positionsOpened = accInfo.positions.filter(pos => Number(pos.positionAmt));
            if (symbol) {
                return positionsOpened.find(pos => pos.symbol === symbol);
            }

            return positionsOpened;
        } catch (err) {
            throw logError(err);
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
                return Error.new(res.code, res.msg);
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
                return Error.new(candles.code, candles.msg);
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
            throw Error.new(err);
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
                return Error.new(newOrder.code, newOrder.msg);
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
                return Error.new(cancelled.code, cancelled.msg);
            }

            return cancelled;
        } catch (err) {
            return err;
        }
    }

    /**
     * Fetches all futures orders for a given symbol and filter. It takes a symbol and a filter as parameters. The filter is an object that can contain orderId, startTime, endTime, and limit properties.
     *
     * If the response from the API contains a code and a message, it returns a new Error with the code and message from the response.
     *
     * If an error occurs during the execution of the function, it throws a new Error.Log with the caught error.
     *
     * @param {string} symbol - The symbol for which to fetch all futures orders. (Mandatory)
     * @param {object} filter - An object that can contain orderId, startTime, endTime, and limit properties.
     * @param {number} filter.orderId - The order ID number
     * @param {date} filter.startTime - Timestamp of start time.
     * @param {date} filter.endTime - Timestamp of end time.
     * @param {number} filter.limit - Maximum number of orders to retreive.
     * @returns {FuturesOrder[]} And array of FuturesOrder
     * @throws {Error} - If an error occurs during the execution of the function.
     */
    async futuresAllOrders(symbol, filter) {
        try {
            const orders = await this.reqHTTP.GET('/fapi/v1/allOrders', { ...filter, symbol });

            if (orders.code && orders.message) {
                return Error.new(orders.code, orders.message);
            }

            return orders.map(order => new FuturesOrder(order));
        } catch (err) {
            throw Error.new(err);
        }
    }

    /**
     * Get all open orders on a symbol.
     * Weight: 1 for a single symbol; 40 when the symbol parameter is omitted
     * @param {string} symbol - The symbol to get. 
     * @returns {FuturesOrder[]} And array of FuturesOrder
     */
    async futuresCurrentAllOpenOrders(symbol) {
        try {
            const openOrders = await this.reqHTTP.GET('/fapi/v1/openOrders', { symbol });
            
            if (openOrders.code && openOrders.msg) {
                return Error.new(openOrders.code, openOrders.msg);
            }

            return openOrders.map(order => new FuturesOrder(order));
        } catch (err) {
            throw Error.new(err);
        }
    }

    /**
     * Query open order
     * Weight: 1
     * @param {string} symbol - The symbol to get.
     * @param {object} params - The optional params to use.
     * @param {string} params.orderId - The order id to get.
     * @param {string} params.origClientOrderId - The original order id to get
     * @returns {FuturesOrder[]} And array of FuturesOrder
     */
    async futuresQueryCurrentOpenOrder(symbol, params) {
        try {
            if (!symbol) {
                throw Error.new('MISSING_PARAM', 'The param "symbol" is required!');
            }

            const openOrder = await this.reqHTTP.GET('/fapi/v1/openOrder', {
                ...Object(params),
                symbol
            });

            if (openOrder.code && openOrder.message) {
                if (openOrder.message === 'Order does not exist') {
                    return;
                }

                return Error.new(openOrder.code, openOrder.message);
            }

            return new FuturesOrder(openOrder);
        } catch (err) {
            throw Error.new(err);
        }
    }

    /**
     * 
     * @param {object} params - Params for the request.
     * @param {string} params.symbol - The symbol to search trades.
     * @param {number} params.orderId - The order id on Binance. This can only be used in combination with `symbol`.
     * @param {Date} params.startTime - Timestamp for the start time to query the trades.
     * @param {Date} params.endTime - Timestamp for the end time to query the trades.
     * @param {number} params.fromId - Trade id to fetch from. Default gets most recent trades.
     * @param {number} params.limit - The limit of trades to search. Default 500; max 1000.
     */
    async futuresAccountTradeList(symbol, params) {
        if (!symbol) {
            throw Error.new('PARAM_REQUIRED', `The param "symbol" is required!`);
        }


        try {
            const trades = await this.reqHTTP.GET('/fapi/v1/userTrades', params);

            if (trades?.code) {
                return Error.new(trades?.code, trades?.msg);
            }

            return trades.map(trade => new AccountTrade(trade));
        } catch (err) {
            throw Error.new(err);
        }
    }

    /**
     * Queries a specific futures order for a given symbol and filter. The filter is an object that contains orderId and origClientOrderId properties.
     *
     * If the response from the API contains a code and a message, it returns a new Error with the code and message from the response.
     *
     * If an error occurs during the execution of the function, it throws a new Error.Log with the caught error.
     *
     * @param {string} symbol - The symbol for which to query the futures order.
     * @param {object} filter - An object that contains orderId and origClientOrderId properties.
     * @param {number} filter.orderId - A number that contains the orderId for the order.
     * @param {string} filter.origClientOrderId - A string that contains the origClientOrderId for the order.
     * @returns {object} - The futures order for the given symbol and filter.
     * @throws {Error} - If an error occurs during the execution of the function.
     */
    async futuresQueryOrder(symbol, filter) {
        const { orderId, origClientOrderId } = Object(filter);

        try {
            const order = await this.reqHTTP.GET('/fapi/v1/order', { symbol, orderId, origClientOrderId });

            if (order.code && order.message) {
                return Error.new(order.code, order.message);
            }

            return order;
        } catch (err) {
            throw new Error.Log(err);
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
                return Error.new(res.code, res.msg);
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
                throw Error.new(res.code, res.msg);
            }

            return res;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = BinanceSync;
