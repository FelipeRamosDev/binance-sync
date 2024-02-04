const WebSocket  = require('ws');
const appConfigs  = require('../configs.json');

module.exports = class BinanceWS {
    constructor(parentService, configs) {
        try {
            const { baseURL } = Object(configs);

            this._parentService = () => parentService;
            this.baseURL = baseURL || appConfigs?.URLS?.futuresBaseStream;
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * Get the parent service.
     * @return {Object} The parent service.
     */
    get parentService() {
        if (typeof this._parentService !== 'function') {
            return;
        }

        return this._parentService();
    }
    
    /**
     * Get the listen key, required in order to open WebSockets streams.
     * @async
     * @param {boolean} noKeepAlive - If true, the listen key will not be kept alive and it will be closed after 60 minutes (1 hour).
     * @return {string} The listen key.
     * @throws {Error} Will throw an error if the response does not contain a listen key or if the response is an instance of Error.
     */
    async getListenKey(noKeepAlive) {
        try {
            const response = await this.parentService.reqHTTP.POST('/fapi/v1/listenKey');

            if (response.code && response.msg) {
                throw new Error({ message: `[${response.code}] ${response.msg}` });
            }

            if (!noKeepAlive) {
                await this.parentService.reqHTTP.PUT('/fapi/v1/listenKey');
            }

            return response.listenKey;
        } catch (err) {
            throw err;
        }
    }
    
    async subscribe(params) {
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
            throw new Error(err);
        }
    }
}
