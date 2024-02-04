const { Axios }  = require('axios');
const _crypto  = require('crypto');
const appConfigs  = require('../configs.json');

module.exports = class BinanceAJAX extends Axios {
    constructor(API_KEY, API_SECRET, config) {
        super({
            headers: API_KEY && { 'X-MBX-APIKEY': API_KEY },
            baseURL: appConfigs?.URLS?.futuresBase,
            ...config
        });

        this._API_KEY = () => API_KEY;
        this._API_SECRET = () => API_SECRET;
    }

    get apiKey() {
        return this._API_KEY();
    }

    get apiSecret() {
        return this._API_SECRET();
    }

    async parseURL(endpoint, params) {
        const queryString = new URLSearchParams('');

        try {
            const { data } = await this.get('/fapi/v1/time');
            const { serverTime } = JSON.parse(data);

            queryString.set('recvWindow', 60000);
            queryString.set('timestamp', serverTime);
    
            Object.keys(Object(params)).map(key => queryString.set(key, params[key]));
    
            if (this.apiKey && this.apiSecret) {
                const signature = _crypto.createHmac('sha256', this.apiSecret).update(queryString.toString()).digest('hex');
                queryString.set('signature', signature);
            }
            
            return endpoint + '?' + queryString.toString();
        } catch (err) {
            throw err;
        }
    }

    async GET(endpoint, params) {
        try {
            const url = await this.parseURL(endpoint, params);
            const result = await this.get(url);

            return JSON.parse(Object(result.data));
        } catch (err) {
            throw err;
        }
    }

    async POST(endpoint, params) {
        try {
            const url = await this.parseURL(endpoint, params);
            const result = await this.post(url);

            return JSON.parse(Object(result.data));
        } catch (err) {
            throw err;
        }
    }

    async PUT(endpoint, params) {
        try {
            const url = await this.parseURL(endpoint, params);
            const result = await this.put(url);

            return JSON.parse(Object(result.data));
        } catch (err) {
            throw err;
        }
    }

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
