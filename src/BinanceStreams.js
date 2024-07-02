const BinanceService  = require('./BinanceSync');
const MarginCall  = require('./models/userDataEvents/MarginCall');
const AccountUpdate  = require('./models/userDataEvents/AccountUpdate');
const OrderUpdate  = require('./models/userDataEvents/OrderUpdate');
const AccountConfigUpdate  = require('./models/userDataEvents/AccountConfigUpdate');
const UserStream  = require('./models/userDataEvents/UserStream');
const ChartStream  = require('./models/ChartStream');
const appConfigs = require('../configs.json');

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

    getUserDataStream(id) {
        let userStream = binanceSync.userDataStream[id];
        return userStream;
    }

    setUserDataStream(value) {
        binanceSync.userDataStream[value.id] = value;
        return binanceSync.userDataStream[value.id];
    }

    /**
     * Open a WebSocket connection to recive updates of user's data.
     * @async
     * @param {Object} options - The options object
     * @param {boolean} options.keepAlive - If this won't set to true, the user stream will be closed after 60 min. To persist opened, this must be true.
     * @param {Function} options.onOpen - The callback function to execute when it's opened, it receive the UserStream as the first parameter.
     * @param {Function} options.onError - The callback function to execute when an error occur, it receive the error object as the first parameter.
     * @param {Function} options.onData - The callback function to execute when a data is received, it receive the data object as the first parameter.
     * @param {Function} options.onClose - The callback function to execute when is opened, it receive the Websocket connection as the first parameter.
     * @param {Function} options.onReconnecting - The callback function to execute when the socket connection was closed and it was reconnected automatically, it receive the UserStream as the first parameter.
     * @return {Promise<UserStream>} A WebSocket object with the connection.
     * @throws {Error} Will throw an error if the response does not contain a listen key or if the response is an instance of Error.
     */
    async userData(options) {
        const { keepAlive, onOpen, onError, onData, onClose, onReconnecting, onReconnected } = Object(options);
        const newUserStream = new UserStream({ streams: this });

        if (keepAlive) {
            newUserStream.pingTimer = this.setPingKeepAlive();
        }

        try {
            await this.parentService.webSocket.subscribe({
                onError,
                onOpen: (webSocket) => {
                    newUserStream.appendWS(webSocket);
                    this.setUserDataStream(newUserStream);

                    if (typeof onOpen === 'function') {
                        onOpen(newUserStream);
                    }
                },
                onClose: () => {
                    if (typeof onClose === 'function') {
                        onClose(newUserStream);
                    }
                },
                onData: async (input) => {
                    if (typeof onData !== 'function') {
                        return;
                    }

                    switch (input.e) {
                        case 'MARGIN_CALL': {
                            return onData(new MarginCall(input));
                        }
                        case 'ACCOUNT_UPDATE': {
                            return onData(new AccountUpdate(input));
                        }
                        case 'ORDER_TRADE_UPDATE': {
                            return onData(new OrderUpdate(input));
                        }
                        case 'ACCOUNT_CONFIG_UPDATE': {
                            return onData(new AccountConfigUpdate(input));
                        }
                        case 'listenKeyExpired': {
                            onData(input);

                            if (this.getUserDataStream(input.listenKey)) {
                                if (typeof onReconnecting === 'function') {
                                    onReconnecting();
                                }

                                const reUserStream = await this.userData(options);
                                if (typeof onReconnected === 'function') {
                                    onReconnected(reUserStream);
                                }

                                this.setUserDataStream(reUserStream);
                            }

                            return;
                        }   
                        default: {
                            return onData(input);
                        }
                    }
                }
            });

            return newUserStream;
        } catch (err) {
            throw err;
        }
    }

    /**
     * To set a interval of 45min execution of BinanceStreams.userDataKeepAlivePing method
     * @returns The setInterval return to be stored and cleared later
     */
    setPingKeepAlive() {
        try {
            return setInterval(() => {
                this.userDataKeepAlivePing();
            }, appConfigs.connections.streamPingInterval);
        } catch (err) {
            throw Error.new(err);
        }
    }

    /**
     * Send a ping to Binance in order to keep it alive
     * @async
     * @returns {Object} The ping response.
     */
    async userDataKeepAlivePing() {
        try {
            const pong = await this.parentService.webSocket.pingListenKey();
            
            if (pong.error) {
                return;
            }

            return pong;
        } catch (err) {
            throw Error.new(err);
        }
    }

    /**
     * Closes the user data.
     * @async
     * @param {UserStream} userStream - The user stream object that needs to be closed.
     * @returns {Promise<Object>} The closed user data.
     * @throws {Error} If there is an error during closing.
     */
    async closeUserData(userStream) {
        try {
            const userStreamID = userStream?.listenKey;
            const closed = await this.parentService.reqHTTP.DELETE('/fapi/v1/listenKey');
            const userStreamCache = this.getUserDataStream(userStreamID);

            if (Object.keys(closed).length) {
                if (closed.code === -1125) {
                    return closed;
                }

                throw closed;
            }

            if (userStreamCache) {
                userStreamCache.close();
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
                onOpen: open,
                onClose: close,
                onData: data,
                onError: error
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
        const { callbacks, accumulateCandles, CustomChartStream, limit } = Object(options);
        
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
                        const chart = new Chart({ symbol, interval, history, accumulateCandles, limit });
                        this.parentService.setBuffChart(chart, ws, symbol, interval);

                        resolve(this.addChartCallbacks(chart, callbacks));
                    },
                    close: () => {
                        const chart = this.parentService.getBuffChart(symbol, interval);

                        if (chart) {
                            emitEvent(chart.buildEventName('close'), chart);
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
                            emitEvent(chart.buildEventName('error'), err);
                        }
                    }
                });
            } catch (err) {
                return reject(err);
            }
        });
    }

    /**
     * Add callbacks events to the provided chart.
     * @param {ChartStream} chart The streamed chart to add callbacks.
     * @param {Object} callbacks Object with the callbacks accepted.
     * @param {Object} callbacks.open When the socket is opened.
     * @param {Object} callbacks.close When the socket is closed.
     * @param {Object} callbacks.data When the when price changes and the chart is updated.
     * @param {Object} callbacks.error When an error with the socket connection happens.
     * @returns {Object} Object with the listenID (used to close the connection later) and the chart.
     */
    addChartCallbacks(chart, callbacks) {
        let crypto;

        if (isClient()) {
            crypto = window.crypto;
        } else {
            crypto = require('crypto');
        }

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
