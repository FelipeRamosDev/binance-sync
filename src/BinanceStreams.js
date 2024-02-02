import BinanceService from './BinanceSync';
import MarginCall from './models/userDataEvents/MarginCall';
import AccountUpdate from './models/userDataEvents/AccountUpdate';
import OrderUpdate from './models/userDataEvents/OrderUpdate';
import AccountConfigUpdate from './models/userDataEvents/AccountConfigUpdate';
import UserStream from './models/userDataEvents/UserStream';
import { urls } from '../configs.json';

/**
 * Representing BinanceStreams, a class with to handle WebSockets streams on Binance API.
 */
export default class BinanceStreams {
    /**
     * Create a BinanceStreams.
     * @param {BinanceService} parentService - The parent BinanceService object.
     * @throws {Error} Will throw an error if the parentService is not provided.
     */
    constructor (parentService, configs) {
        const { wsBaseURL } = Object(configs);

        if (!parentService) {
            throw new Error.Log({
                name: 'BINANCE_MAIN_SERVICE_REQUIRED',
                message: `The BinanceService, the parent service form BinanceStreams is required to instantiate the class.`
            })
        }

        this._parentService = () => parentService;
        this.wsBaseURL = wsBaseURL || urls.futuresBaseStream;
    }

    /**
     * Get the parent service.
     * @return {Object} The parent service.
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
     * @return {WebSocket} A WebSocket object with the connection.
     * @throws {Error} Will throw an error if the response does not contain a listen key or if the response is an instance of Error.Log.
     */
    async userData(callbacks) {
        const { open, error, data, close } = Object(callbacks);

        try {
            const ws = await this.parentService.webSocket.connect({
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
            throw new Error.Log(err);
        }
    }

    async closeUserData() {
        try {
            const closed = await this.parentService.reqHTTP.DELETE('/fapi/v1/listenKey');

            if (Object.keys(closed).length) {
                throw closed;
            }

            return closed;
        } catch (err) {
            throw new Error.Log(err);
        }
    }

    async klineCandlestick(symbol, interval, callbacks) {
        const { open, error, data, close } = Object(callbacks);

        try {
            const ws = await this.parentService.webSocket.connect({
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
            throw new Error.Log(err);
        }
    }
}
