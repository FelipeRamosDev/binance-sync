const appConfigs  = require('../configs.json');

/**
 * BinanceWS class for managing WebSocket connections on Binance API.
 */
class BinanceWS {
    /**
     * Constructs a new BinanceWS instance.
     * @param {Object} parentService - The parent service object.
     * @param {Object} configs - The configuration object for BinanceWS.
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
    async getListenKey(noKeepAlive) {
        try {
            const response = await this.parentService.reqHTTP.POST('/fapi/v1/listenKey');

            if (response.code && response.msg) {
                throw new Error(`[${response.code}] ${response.msg}`);
            }

            if (!noKeepAlive) {
                await this.parentService.reqHTTP.PUT('/fapi/v1/listenKey');
            }

            return response.listenKey;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Subscribes to a WebSocket stream.
     * @async
     * @param {Object} params - The parameters for the subscription.
     * @return {Promise<WebSocket>} The WebSocket object with the connection.
     * @throws {Error} If there is an error during the request.
     */
    async subscribe(params) {
        try {
            if (window) {
                return await this.clientSubscribe(params);
            } else {
                return await this.serverSubscribe(params);
            }
        } catch (err) {
            throw new Error.Log(err);
        }
    }
    
    /**
     * Subscribes to a WebSocket stream.
     * @async
     * @param {Object} params - The parameters for the subscription.
     * @return {Promise<WebSocket>} The WebSocket object with the connection.
     * @throws {Error} If there is an error during the request.
     */
    async serverSubscribe(params) {
        const WebSocket  = require('ws');
        const { endpoint, isPublic, callbacks } = Object(params);
        const { open, error, data, close } = Object(callbacks);
        let endpointAppend;

        try {
            if (!isPublic) {
                const listenKey = await this.getListenKey();
                endpointAppend = `${this.baseURL}/${listenKey}${endpoint || ''}`;
            } else {
                endpointAppend = `${this.baseURL}/${endpoint || ''}`;
            }

            const ws = new WebSocket(endpointAppend);

            ws.on('open', () => {
                if (typeof open === 'function') {
                    open();
                }
            });

            ws.on('error', (err) => {
                if (typeof error !== 'function') {
                    return;
                }

                if (typeof err === 'string') {
                    error(JSON.parse(err));
                } else {
                    error(err);
                }
            });

            ws.on('message', (input) => {
                if (typeof data === 'function') {
                    data(JSON.parse(input));
                }
            });

            ws.on('close', () => {
                if (typeof close === 'function') {
                    close();
                }
            });

            return ws;
        } catch (err) {
            throw err;
        }
    }

    async clientSubscribe(params) {
        const { endpoint, isPublic, callbacks } = Object(params);
        const { open, error, data, close } = Object(callbacks);
        let endpointAppend;
    
        try {
            if (!isPublic) {
                const listenKey = await this.getListenKey();
                endpointAppend = `${this.baseURL}/${listenKey}${endpoint || ''}`;
            } else {
                endpointAppend = `${this.baseURL}/${endpoint || ''}`;
            }
    
            const ws = new window.WebSocket(endpointAppend); // Use the native WebSocket object
    
            ws.onopen = () => {
                if (typeof open === 'function') {
                    open();
                }
            };
    
            ws.onerror = (err) => {
                if (typeof error !== 'function') {
                    return;
                }
    
                if (typeof err === 'string') {
                    error(JSON.parse(err));
                } else {
                    error(err);
                }
            };
    
            ws.onmessage = (input) => {
                if (typeof data === 'function') {
                    data(JSON.parse(input.data)); // Use the 'data' property of the input object
                }
            };
    
            ws.onclose = () => {
                if (typeof close === 'function') {
                    close();
                }
            };
    
            return ws;
        } catch (err) {
            throw err;
        }
    }    
}

module.exports = BinanceWS;
