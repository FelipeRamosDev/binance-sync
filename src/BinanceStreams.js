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
     * @param {Object} options.callbacks The object with the options to configurate the chart.
     * @param {Date|number} options.startTime - The options for the chart.
     * @param {Date|number} options.endTime - The options for the chart.
     * @param {number} options.limit - The options for the chart.
     * @param {Function} options.callbacks.open - Triggered when the websocket is successfuly started.
     * @param {Function} options.callbacks.close - Triggered when the websocket is successfuly closed.
     * @param {Function} options.callbacks.data - Triggered every time a new change arrives.
     * @param {Function} options.callbacks.error - Triggered on errors.
     * @returns {Promise<ChartStream>} Returns a promise with the chart.
     */
    async candlestickChart(symbol, interval, options) {
        const { callbacks } = Object(options);
        const { open, error, data, close } = Object(callbacks);

        return new Promise(async (resolve, reject) => {
            try {
                const history = await this.parentService.futuresChart(symbol, interval, options);
                const chart = new ChartStream({ symbol, interval, history });

                if (history.error) {
                    return reject(history);
                }

                await this.currentCandle(symbol, interval, {
                    open: () => {
                        if (typeof open === 'function') {
                            open(chart);
                            resolve(chart);
                        }
                    },
                    close: () => {
                        if (typeof close === 'function') {
                            close();
                        }
                    },
                    data: (snapshot) => {
                        if (typeof data === 'function') {
                            chart.updateSnapshot(snapshot);
                            data(chart);
                        }
                    },
                    error: (err) => {
                        if (typeof error === 'function') {
                            error(err);
                        }
                    }
                });
            } catch (err) {
                return reject(err);
            }
        });
    }
}

module.exports = BinanceStreams;
