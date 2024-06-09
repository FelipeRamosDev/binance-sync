const { Axios }  = require('axios');
const _crypto  = require('crypto');
const appConfigs  = require('../configs.json');

/**
 * BinanceAJAX class for managing AJAX requests to Binance.
 * @extends Axios
 */
class BinanceAJAX extends Axios {
    /**
     * Constructs a new BinanceAJAX instance.
     * @param {string} API_KEY - The API key for Binance.
     * @param {string} API_SECRET - The API secret for Binance.
     * @param {Object} config - The configuration object for Axios.
     */
    constructor(API_KEY, API_SECRET, config) {
        super({
            headers: API_KEY && { 'X-MBX-APIKEY': API_KEY },
            baseURL: appConfigs?.URLS?.futuresBase,
            ...config
        });

        this._API_KEY = () => API_KEY;
        this._API_SECRET = () => API_SECRET;
    }

    /**
     * Gets the API key.
     * @returns {string} The API key.
     */
    get apiKey() {
        return this._API_KEY();
    }

    /**
     * Gets the API secret.
     * @returns {string} The API secret.
     */
    get apiSecret() {
        return this._API_SECRET();
    }

    generateSignature(queryString) {
        if (this.apiKey && this.apiSecret) {
            const signature = _crypto.createHmac('sha256', this.apiSecret);

            if (queryString?.toString) {
                signature.update(queryString.toString());
            }

            return signature.digest('hex');
        }
    }

    async getServerTime() {
        try {
            const { data } = await this.get('/fapi/v1/time');
            const { serverTime } = JSON.parse(data);

            return serverTime;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Parses the URL for the request.
     * @param {string} endpoint - The endpoint for the request.
     * @param {Object} params - The parameters for the request.
     * @returns {Promise<string>} The parsed URL.
     * @throws {Error} If there is an error during parsing.
     */
    async parseURL(endpoint, params) {
        const queryString = new URLSearchParams('');

        try {
            const serverTime = await this.getServerTime();

            queryString.set('recvWindow', 60000);
            queryString.set('timestamp', serverTime);
    
            Object.keys(Object(params)).map(key => queryString.set(key, params[key]));
    
            if (this.apiKey && this.apiSecret) {
                queryString.set('signature', this.generateSignature(queryString));
            }
            
            if (endpoint) {
                return endpoint + '?' + queryString.toString();
            } else {
                return queryString.toString();
            }
        } catch (err) {
            throw err;
        }
    }

    /**
     * Sends a GET request.
     * @async
     * @param {string} endpoint - The endpoint for the request.
     * @param {Object} params - The parameters for the request.
     * @returns {Promise<Object>} The response data.
     * @throws {Error} If there is an error during the request.
     */
    async GET(endpoint, params) {
        try {
            const url = await this.parseURL(endpoint, params);
            const result = await this.get(url);

            return JSON.parse(Object(result.data));
        } catch (err) {
            throw err;
        }
    }

    /**
     * Sends a POST request.
     * @async
     * @param {string} endpoint - The endpoint for the request.
     * @param {Object} params - The parameters for the request.
     * @returns {Promise<Object>} The response data.
     * @throws {Error} If there is an error during the request.
     */
    async POST(endpoint, params) {
        try {
            const url = await this.parseURL(endpoint, params);
            const result = await this.post(url);

            return JSON.parse(Object(result.data));
        } catch (err) {
            throw err;
        }
    }

    /**
     * Sends a PUT request.
     * @async
     * @param {string} endpoint - The endpoint for the request.
     * @param {Object} params - The parameters for the request.
     * @returns {Promise<Object>} The response data.
     * @throws {Error} If there is an error during the request.
     */
    async PUT(endpoint, params) {
        try {
            const url = await this.parseURL(endpoint, params);
            const result = await this.put(url);

            return JSON.parse(Object(result.data));
        } catch (err) {
            throw err;
        }
    }

    /**
     * Sends a DELETE request.
     * @async
     * @param {string} endpoint - The endpoint for the request.
     * @param {Object} params - The parameters for the request.
     * @returns {Promise<Object>} The response data.
     * @throws {Error} If there is an error during the request.
     */
    async DELETE(endpoint, params) {
        try {
            const url = await this.parseURL(endpoint, params);
            const result = await this.delete(url);

            return JSON.parse(Object(result.data));
        } catch (err) {
            throw err;
        }
    }
}

module.exports = BinanceAJAX;
