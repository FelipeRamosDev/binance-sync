const crypto = require('crypto');
const BinanceService  = require('./BinanceSync');
const MarginCall  = require('./models/userDataEvents/MarginCall');
const AccountUpdate  = require('./models/userDataEvents/AccountUpdate');
const OrderUpdate  = require('./models/userDataEvents/OrderUpdate');
const AccountConfigUpdate  = require('./models/userDataEvents/AccountConfigUpdate');
const UserStream  = require('./models/userDataEvents/UserStream');
const ChartStream  = require('./models/ChartStream');
const appConfigs  = require('../configs.json');

/**
 * Representing BinanceStreams, a class with to handle WebSockets streams on Binance API.
 */
class BinanceStreams {
    /**
     * Create a BinanceStreams.
     * @param {BinanceService} parentService - The parent BinanceService object.
     * @throws {Error} Will throw an error if the parentService is not provided.
     */
    constructor (parentService, configs) {
        const { wsBaseURL } = Object(configs);

        if (!parentService) {
            throw new Error({ message: `The BinanceService, the parent service form BinanceStreams is required to instantiate the class.` });
        }

        this._parentService = () => parentService;
        this.wsBaseURL = wsBaseURL || appConfigs?.URLS?.futuresBaseStream;
        this.ws;
    }

    /**
     * Get the parent service.
     * @return {BinanceService} The parent service.
     */
    get parentService() {
        return this._parentService();
    }

    /**
     * Get the user's master account API key.
     * @return {string} The API key.
     */
    get API_KEY() {
        return this.parentService.API_KEY;
    }

    /**
     * Get the user's master account secret key.
     * @return {string} The secret key.
     */
    get SECRET_KEY() {
        return this.parentService.SECRET_KEY;
    }

    /**
     * Open a WebSocket connection to recive updates of user's data.
     * @async
     * @param {Object} callbacks - Object with all callbacks to use on the connection.
     * @param {Function} callbacks.open - Callback function for "open" callback. It won't receive any argument.
     * @param {Function} callbacks.error - Callback function for "error" callback. Receives one argument with the error object.
     * @param {Function} callbacks.data - Callback function for "data" callback. Receives one argument with the data object.
     * @param {Function} callbacks.close - Callback function for "close" callback. It won't receive any argument.
     * @return {Promise<UserStream>} A WebSocket object with the connection.
     * @throws {Error} Will throw an error if the response does not contain a listen key or if the response is an instance of Error.
     */
    async userData(callbacks) {
        const { open, error, data, close } = Object(callbacks);

        try {
            const ws = await this.parentService.webSocket.subscribe({
                callbacks: {
                    open,
                    close,
                    error,
                    data: (input) => {
                        if (typeof data !== 'function') {
                            return;
                        }

                        switch (input.e) {
                            case 'MARGIN_CALL': {
                                return data(new MarginCall(input));
                            }
                            case 'ACCOUNT_UPDATE': {
                                return data(new AccountUpdate(input));
                            }
                            case 'ORDER_TRADE_UPDATE': {
                                return data(new OrderUpdate(input));
                            }
                            case 'ACCOUNT_CONFIG_UPDATE': {
                                return data(new AccountConfigUpdate(input));
                            }
                            default: {
                                return data(input);
                            }
                        }
                    }
                }
            });

            return new UserStream({ ws });
        } catch (err) {
            throw err;
        }
    }

    /**
     * Closes the user data.
     * @async
     * @returns {Promise<Object>} The closed user data.
     * @throws {Error} If there is an error during closing.
     */
    async closeUserData() {
        try {
            const closed = await this.parentService.reqHTTP.DELETE('/fapi/v1/listenKey');

            if (Object.keys(closed).length) {
                throw closed;
            }

            return closed;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Opens a WebSocket connection to receive kline/candlestick data.
     * @async
     * @param {string} symbol - The symbol for the data.
     * @param {string} interval - The interval for the data.
     * @param {Object} callbacks - The callbacks for the WebSocket events.
     * @param {Function} callbacks.open - Triggered when the websocket is successfuly started.
     * @param {Function} callbacks.close - Triggered when the websocket is successfuly closed.
     * @param {Function} callbacks.data - Triggered every time a new change arrives.
     * @param {Function} callbacks.error - Triggered on errors.
     * @returns {Promise<WebSocket>} The WebSocket object with the connection.
     * @throws {Error} If there is an error during the request.
     */
    async currentCandle(symbol, interval, callbacks) {
        const { open, error, data, close } = Object(callbacks);

        try {
            const ws = await this.parentService.webSocket.subscribe({
                endpoint: `${symbol.toLowerCase()}@kline_${interval}`,
                isPublic: true,
                callbacks: {
                    open,
                    close,
                    data,
                    error
                }
            });

            return ws;
        } catch (err) {
            throw err;
        }
    }

    /**
     * To get a complete chart stream for an asseet.
     * @async
     * @param {string} symbol The symbol to get the chart. Example: 'BTCUSDT'
     * @param {string} interval The time interval for the chart. Example '15m'
     * @param {Object} options The object with the options to configurate the chart.
     * @param {Date|number} options.startTime - The options for the chart.
     * @param {Date|number} options.endTime - The options for the chart.
     * @param {number} options.limit - The options for the chart.
     * @param {Object} options.callbacks - The object with the options to configurate the chart.
     * @param {Class} options.CustomChartStream - A custom Class extending the ChartStream to use on chart creation.
     * @param {Function} options.callbacks.open - Triggered when the websocket is successfuly started.
     * @param {Function} options.callbacks.close - Triggered when the websocket is successfuly closed.
     * @param {Function} options.callbacks.data - Triggered every time a new change arrives.
     * @param {Function} options.callbacks.error - Triggered on errors.
     * @returns {Promise<Object>} Returns a promise with the listenID (string) and the chart (ChartStream).
     */
    async candlestickChart(symbol, interval, options) {
        const { callbacks, CustomChartStream } = Object(options);
        
        return new Promise(async (resolve, reject) => {
            try {
                const buffChart = this.parentService.getBuffChart(symbol, interval);
                if (buffChart) {
                    return resolve(this.addChartCallbacks(buffChart, callbacks));
                }

                const Chart = CustomChartStream || ChartStream;
                const history = await this.parentService.futuresChart(symbol, interval, options);

                if (history.error) {
                    if (typeof callbacks?.error === 'function') {
                        return callbacks.error(history);
                    }

                    return reject(history);
                }

                const ws = await this.currentCandle(symbol, interval, {
                    open: () => {
                        const chart = new Chart({ symbol, interval, history });
                        this.parentService.setBuffChart(chart, ws, symbol, interval);

                        resolve(this.addChartCallbacks(chart, callbacks));
                    },
                    close: () => {
                        const chart = this.parentService.getBuffChart(symbol, interval);

                        if (chart) {
                            process.emit(chart.buildEventName('close'), chart);
                        }
                    },
                    data: (snapshot) => {
                        const chart = this.parentService.getBuffChart(symbol, interval);

                        if (chart) {
                            chart.updateSnapshot(snapshot);
                        }
                    },
                    error: (err) => {
                        const chart = this.parentService.getBuffChart(symbol, interval);

                        if (chart) {
                            process.emit(chart.buildEventName('error'), err);
                        }
                    }
                });
            } catch (err) {
                return reject(err);
            }
        });
    }

    addChartCallbacks(chart, callbacks) {
        const listenID = crypto.randomUUID();
        const { open, close, data, error } = Object(callbacks);

        if (typeof open === 'function') {
            open(chart);
        }

        if (typeof close === 'function') {
            chart.on('close', close, listenID);
        }
        
        if (typeof data === 'function') {
            chart.on('update', data, listenID);
        }
        
        if (typeof error === 'function') {
            chart.on('error', error, listenID);
        }

        return { listenID, chart };
    }
}

module.exports = BinanceStreams;
