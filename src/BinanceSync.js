const BinanceStreams  = require('./BinanceStreams');
const AJAX  = require('./BinanceAJAX');
const BinanceWS  = require('./BinanceWS');

module.exports = class BinanceSync {
    constructor(API_KEY, SECRET_KEY) {
        try {
            this._API_KEY = () => API_KEY;
            this._SECRET_KEY = () => SECRET_KEY;

            this.reqHTTP = new AJAX(this.API_KEY, this.SECRET_KEY);
            this.webSocket = new BinanceWS(this);
        } catch (err) {
            throw new Error(err);
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
            const res = await this.reqHTTP.GET('/fapi/v1/exchangeInfo');
            if (res.code && res.msg) {
                throw new Error({ message: `[${res.code}] ${res.msg}` });
            }

            return res;
        } catch (err) {
            throw err;
        }
    }

    async changeLeverage(symbol, leverage) {
        try {
            if (isNaN(leverage) || leverage < 1 || leverage > 120) {
                leverage = 1;
            } else {
                leverage = Number(leverage);
            }

            const res = await this.reqHTTP.POST('/fapi/v1/leverage', { symbol, leverage });
            if (res.code && res.msg) {
                throw new Error({ message: `[${res.code}] ${res.msg}` });
            }

            return res;
        } catch (err) {
            throw err;
        }
    }

    async changeMarginType(symbol, marginType) {
        try {
            if (marginType !== 'ISOLATED' && marginType !== 'CROSSED') {
                marginType = 'ISOLATED';
            }

            const res = await this.reqHTTP.POST('/fapi/v1/marginType', { symbol, marginType });
            if (res.code && res.msg) {
                throw new Error({ message: `[${res.code}] ${res.msg}` });
            }

            return res;
        } catch (err) {
            throw err;
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

            if (response.code && response.msg) {
                throw new Error({ message: `[${response.code}] ${response.msg}` });
            }

            if (Array.isArray(response)) {
                response.map(item => {
                    item.maxLeverage = item.brackets[0].initialLeverage;
                });
            }

            return response;
        } catch (err) {
            throw err;
        }
    }

    async futuresAccountInfo() {
        try {
            const res = await this.reqHTTP.GET('/fapi/v2/account');
            if (res.code && res.msg) {
                throw new Error({ message: `[${res.code}] ${res.msg}` });
            }

            return res;
        } catch (err) {
            throw err;
        }
    }

    async futuresAccountBalance() {
        try {
            const res = await this.reqHTTP.GET('/fapi/v2/balance');
            if (res.code && res.msg) {
                throw new Error({ message: `[${res.code}] ${res.msg}` });
            }

            return res;
        } catch (err) {
            throw err;
        }
    }

    async futuresChart(symbol, interval, options) {
        const { startTime, endTime, limit } = Object(options); 
        const Candlestick = require('./models/Candlestick');

        try {
            const candles = await this.reqHTTP.GET('/fapi/v1/klines', {
                symbol,
                interval,
                startTime,
                endTime,
                limit
            });

            if (!Array.isArray(candles)) {
                return new Error({ message: `[${candles.code}] ${candles.msg}` });
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
            throw err;
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

            if (newOrder.code && newOrder.msg) {
                return new Error({ message: `[${newOrder.code}] ${newOrder.msg}` });
            }

            return newOrder;
        } catch (err) {
            throw err;
        }
    }

    async cancelOrder(symbol, clientOrderId) {
        try {
            const cancelled = await this.reqHTTP.DELETE('/fapi/v1/order', { symbol, origClientOrderId: clientOrderId });

            if (cancelled.code && cancelled.msg) {
                return new Error({ message: `[${cancelled.code}] ${cancelled.msg}` });
            }

            return cancelled;
        } catch (err) {
            return err;
        }
    }

    async cancelMultipleOrders(symbol, orderIds) {
        try {
            const res = await this.reqHTTP.DELETE('/fapi/v1/batchOrders', { symbol, orderidlist: orderIds });
            if (res.code && res.msg) {
                throw new Error({ message: `[${res.code}] ${res.msg}` });
            }

            return res;
        } catch (err) {
            throw err;
        }
    }

    async cancelAllOrdersOfAsset(symbol) {
        try {
            const res = this.reqHTTP.DELETE('/fapi/v1/allOpenOrders', { symbol });
            if (res.code && res.msg) {
                throw new Error({ message: `[${res.code}] ${res.msg}` });
            }

            return res;
        } catch (err) {
            throw err;
        }
    }
}
