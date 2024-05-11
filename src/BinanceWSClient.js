const appConfigs = require('../configs.json');

/**
 * BinanceWSClient class for managing WebSocket connections on Binance API.
 */
class BinanceWSClient {
    /**
     * Constructs a new BinanceWSClient instance.
     * @param {Object} parentService - The parent service object.
     * @param {Object} configs - The configuration object for BinanceWSClient.
     * @throws {Error} If there is an error during construction.
     */
    constructor(parentService, configs) {
        try {
            const { baseURL } = Object(configs);

            this._parentService = () => parentService;
            this.baseURL = baseURL || appConfigs?.URLS?.futuresBaseStream;
        } catch (err) {
            throw err;
        }
    }

    
    /**
     * Gets the parent service.
     * @return {Object} The parent service.
     */
    get parentService() {
        if (typeof this._parentService !== 'function') {
            return;
        }

        return this._parentService();
    }
    
    /**
     * Gets the listen key, required in order to open WebSocket streams.
     * @async
     * @param {boolean} noKeepAlive - If true, the listen key will not be kept alive and it will be closed after 60 minutes (1 hour).
     * @return {Promise<string>} The listen key.
     * @throws {Error} If the response does not contain a listen key or if the response is an instance of Error.
     */
    async getListenKey() {
        try {
            const response = await this.parentService.reqHTTP.POST('/fapi/v1/listenKey');

            if (response.code && response.msg) {
                return Error.new(response.code, response.msg);
            }

            return response.listenKey;
        } catch (err) {
            throw Error.new(err);
        }
    }

    /**
     * Pings the listen key to keep it alive.
     * @async
     * @return {Promise<Object>} The response from the server. If successful, it returns an object with a success property set to true and the server's response.
     * If the listen key does not exist, it returns an Error object with the server's error code and message.
     * @throws {Error} If there is an error during the request.
     */
    async pingListenKey() {
        try {
            const ping = await this.parentService.reqHTTP.PUT('/fapi/v1/listenKey');

            if (ping.code === -1125 || ping.msg === 'This listenKey does not exist.') {
                return Error.new(ping.code, ping.msg);
            }

            return { success: true, ...ping };
        } catch (err) {
            throw Error.new(err);
        }
    }

    /**
     * Subscribes to a WebSocket stream.
     * @async
     * @param {Object} params - The parameters for the subscription.
     * @param {string} params.endpoint - Binance endpoint, the same you get on Binance API documentation.
     * @param {boolean} params.isPublic - If the subscription is a public route, if set to true, it won't send the KEYS on the request headers
     * @param {Function} params.onOpen - The callback function to execute when it's opened, it receive the Websocket connection as the first parameter.
     * @param {Function} params.onError - The callback function to execute when an error occur, it receive the error object as the first parameter.
     * @param {Function} params.onData - The callback function to execute when a data is received, it receive the data object as the first parameter.
     * @param {Function} params.onClose - The callback function to execute when is opened, it receive the Websocket connection as the first parameter.
     * @return {Promise<WebSocket>} The WebSocket object with the connection.
     * @throws {Error} If there is an error during the request.
     */
    async subscribe(params) {
        const { endpoint, isPublic, onOpen, onError, onData, onClose } = Object(params);
        let endpointAppend;
        let listenKey;

        try {
            if (!isPublic) {
                listenKey = await this.getListenKey();
                endpointAppend = `${this.baseURL}/${listenKey}${endpoint || ''}`;
            } else {
                endpointAppend = `${this.baseURL}/${endpoint || ''}`;
            }

            const ws = new window.WebSocket(endpointAppend);
            ws.listenKey = listenKey;

            ws.onopen = () => {
                if (typeof onOpen === 'function') {
                    onOpen(ws);
                }
            };

            ws.onerror = (err) => {
                if (typeof onError !== 'function') {
                    return;
                }

                if (typeof err === 'string') {
                    onError(JSON.parse(err));
                } else {
                    onError(err);
                }
            };

            ws.onmessage = (input) => {
                if (typeof onData === 'function') {
                    onData(JSON.parse(input.data));
                }
            };

            ws.onclose = () => {
                if (typeof onClose === 'function') {
                    onClose(ws);
                }
            };

            return ws;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = BinanceWSClient;
