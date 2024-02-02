import Binance from 'node-binance-api';
import SafeValue from '4hands-api/src/models/collections/SafeValue';
import AccountInfo from './AccountInfo';
import BinanceStreams from './BinanceStreams';
import AJAX from './BinanceAJAX';
import BinanceWS from './BinanceWS';

class BinanceService {
    constructor(API_KEY, SECRET_KEY) {
        try {
            this._API_KEY = () => API_KEY;
            this._SECRET_KEY = () => SECRET_KEY;

            this.reqHTTP = new AJAX(this.API_KEY, this.SECRET_KEY);
            this.webSocket = new BinanceWS(this);
            this.binanceAPI = new Binance().options({
                APIKEY: this.API_KEY,
                SECRETKEY: this.SECRET_KEY,
                useServerTime: true,
                recvWindow: 60000, // Set a higher recvWindow to increase response timeout
                verbose: true, // Add extra output when subscribing to WebSockets, etc
            });

            this.accountInfo = new AccountInfo(this);
        } catch (err) {
            throw new Error.Log(err);
        }
    }

    get API_KEY() {
        return this._API_KEY();
    }

    get SECRET_KEY() {
        return this._SECRET_KEY();
    }

    get streams() {
        return new BinanceStreams(this);
    }

    async exchangeInfo() {
        try {
            return await this.reqHTTP.GET('/fapi/v1/exchangeInfo');
        } catch (err) {
            throw new Error.Log(err);
        }
    }

    async changeLeverage(symbol, leverage) {
        try {
            if (isNaN(leverage) || leverage < 1 || leverage > 120) {
                leverage = 1;
            } else {
                leverage = Number(leverage);
            }

            return await this.reqHTTP.POST('/fapi/v1/leverage', { symbol, leverage });
        } catch (err) {
            throw new Error.Log(err);
        }
    }

    async changeMarginType(symbol, marginType) {
        try {
            if (marginType !== 'ISOLATED' && marginType !== 'CROSSED') {
                marginType = 'ISOLATED';
            }

            return await this.reqHTTP.POST('/fapi/v1/marginType', { symbol, marginType });
        } catch (err) {
            throw new Error.Log(err);
        }
    }
    
    async leverageBrackets(symbol) {
        let response;

        try {
            if (symbol) {
                response = await this.reqHTTP.GET('/fapi/v1/leverageBracket', { symbol });
            } else {
                response = await this.reqHTTP.GET('/fapi/v1/leverageBracket');
            }

            if (response.code) {
                throw new Error.Log({ name: response.code, message: response.msg });
            }

            if (Array.isArray(response)) {
                response.map(item => {
                    item.maxLeverage = item.brackets[0].initialLeverage;
                });
            }

            return response;
        } catch (err) {
            throw new Error.Log(err);
        }
    }

    async futuresAccountInfo() {
        try {
            return await this.reqHTTP.GET('/fapi/v2/account');
        } catch (err) {
            throw new Error.Log(err);
        }
    }

    async futuresAccountBalance() {
        try {
            return await this.reqHTTP.GET('/fapi/v2/balance');
        } catch (err) {
            throw new Error.Log(err);
        }
    }

    async futuresChart(symbol, interval, options) {
        const { startTime, endTime, limit } = Object(options); 
        const Candlestick = require('../../models/Candlestick');

        try {
            const candles = await this.reqHTTP.GET('/fapi/v1/klines', {
                symbol,
                interval,
                startTime,
                endTime,
                limit
            });

            if (!Array.isArray(candles)) {
                return new Error.Log({ name: candles.code, message: candles.code });
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
                isCandleClosed: true,
                formatDate: true
            }));
        } catch (err) {
            throw new Error.Log(err);
        }
    }

    async newOrder(symbol, side, type, params) {
        try {
            const newOrder = await this.reqHTTP.POST('/fapi/v1/order', {
                symbol,
                side,
                type,
                ...params
            });

            return newOrder;
        } catch (err) {
            throw new Error.Log(err);
        }
    }

    async cancelOrder(symbol, clientOrderId) {
        try {
            const cancelled = await this.reqHTTP.DELETE('/fapi/v1/order', { symbol, origClientOrderId: clientOrderId });

            if (cancelled.code && cancelled.msg) {
                return new Error.Log({ name: cancelled.code, message: cancelled.msg});
            }

            return cancelled;
        } catch (err) {
            return new Error.Log(err);
        }
    }

    async cancelMultipleOrders(symbol, orderIds) {
        try {
            return await this.reqHTTP.DELETE('/fapi/v1/batchOrders', { symbol, orderidlist: orderIds });
        } catch (err) {
            throw new Error.Log(err);
        }
    }

    async cancelAllOrdersOfAsset(symbol) {
        try {
            return this.reqHTTP.DELETE('/fapi/v1/allOpenOrders', { symbol });
        } catch (err) {
            throw new Error.Log(err);
        }
    }
}

module.exports = BinanceService;
