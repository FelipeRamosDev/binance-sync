const {Axios}  = require('axios');
const exchangesConfig  = require('../../../exchange-config.json');
const AssetData  = require('./models/AssetData');
const futuresLeverage  = require('../../../futures-leverage.json');

/**
 * BinanceCenter class for managing Binance exchange.
 */
class BinanceCenter {
    /**
     * Constructs a new BinanceCenter instance.
     */
    constructor() {
        this.configs = exchangesConfig.binance;
        this.futuresSymbols = [];
        this.rateLimit = [];
        this.exchangeFilters = [];
        this.serverTime;
        this.timezone = '';
    }

    /**
     * Initializes the BinanceCenter instance.
     * @async
     * @returns {Promise<Object>} The success status.
     * @throws {Error} If there is an error during initialization.
     */
    async init() {
        const ajax = new Axios({ baseURL: exchangesConfig.binance.marketTypes.futures.apiFuturesHost });
        const { data } = await ajax.get('/fapi/v1/exchangeInfo');
        const parsedData = JSON.parse(data);

        this.futuresSymbols = parsedData?.symbols.filter(symbol => symbol.quoteAsset === 'USDT').map(symbol => new AssetData(symbol));
        this.rateLimits = parsedData?.rateLimits;
        this.exchangeFilters = parsedData?.exchangeFilters;
        this.serverTime = parsedData?.serverTime;
        this.timezone = parsedData?.timezone;

        this.futuresSymbols.map(item => {
            const bracket = futuresLeverage.find(bracket => bracket.symbol === item.symbol);

            if (!bracket) return;
            item.maxLeverage = bracket.maxLeverage;
        })
    
        return { success: true };
    }

    /**
     * Gets the asset data for the given symbols.
     * @param {Array} symbols - The symbols to get the asset data for.
     * @returns {AssetData[]} The asset data.
     */
    getAssetsData(symbols) {
        if (Array.isArray(symbols) && symbols.length) {
            return this.futuresSymbols.filter(asset => symbols.find(item => item === asset.symbol));
        }

        return this.futuresSymbols;
    }

    /**
     * Gets the asset for the given symbol.
     * @param {string} symbol - The symbol to get the asset for.
     * @returns {AssetData} The asset.
     */
    getAsset(symbol) {
        const assets = this.getAssetsData([symbol]);
        return assets.length ? assets[0] : null;
    }

    /**
     * Gets the list of symbols.
     * @returns {string[]} The list of symbols.
     */
    getSymbolsList() {
        return this.futuresSymbols.map(asset => asset.symbol);
    }
}

module.exports = BinanceCenter;
