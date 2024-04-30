const fs = require('fs');
const AJAX = require('./BinanceAJAX');
const AssetData = require('./models/AssetData');
const futuresLeverage = require('../futures-leverage.json');

const BINANCE_SYNC_CONFIGS_PROJECT_PATH = '../../../binance-sync.config.json';
const BINANCE_SYNC_CONFIGS_NATIVE_PATH = '../configs.json';
let exchangesConfig;

if (fs.existsSync(BINANCE_SYNC_CONFIGS_PROJECT_PATH)) {
    exchangesConfig = require(BINANCE_SYNC_CONFIGS_PROJECT_PATH);
} else {
    exchangesConfig = require(BINANCE_SYNC_CONFIGS_NATIVE_PATH);
}

/**
 * BinanceCenter class for managing Binance exchange.
 */
class BinanceCenter {
    /**
     * Constructs a new BinanceCenter instance. If you provide the param `setup.futuresSymbols`, it will not initialize when the method `this.init` wass triggered.
     * 
     * @constructor
     * @param {object} setup - The setup configs for the constructor
     * @param {object} setup.configs - The Binance configs placed on binance-sync.config.js
     * @param {AssetData[]} setup.futuresSymbols - The future's assets data.
     * @param {string} setup.timezone - The server Binance timezone.
     * @param {Date} setup.serverTime - The server Binance time. (Millis)
     */
    constructor(setup) {
        const {
            configs = exchangesConfig,
            futuresSymbols = [],
            timezone = '',
            serverTime
        } = Object(setup);

        this.configs = configs;
        this.futuresSymbols = futuresSymbols;
        this.timezone = timezone || '';
        this.serverTime = serverTime;

        if (this.futuresSymbols.length) {
            this.futuresSymbols.map(symbol => new AssetData(symbol));
            this.isReady = true;
        }
    }

    /**
     * Initializes the BinanceCenter instance.
     * @async
     * @returns {Promise<Object>} The success status.
     * @throws {Error} If there is an error during initialization.
     */
    async init() {
        if (this.isReady) {
            return this;
        }

        const ajax = new AJAX(null, null, { baseURL: this.configs.URLS.futuresBase });
        const parsedData = await ajax.GET('/fapi/v1/exchangeInfo');

        this.futuresSymbols = parsedData?.symbols.filter(symbol => symbol.quoteAsset === 'USDT').map(symbol => new AssetData(symbol));
        this.serverTime = parsedData?.serverTime;
        this.timezone = parsedData?.timezone;

        this.futuresSymbols.map(item => {
            const bracket = futuresLeverage.find(bracket => bracket.symbol === item.symbol);

            if (!bracket) return;
            item.maxLeverage = bracket.maxLeverage;
            item.minNotional = Number(item.filters.MIN_NOTIONAL.notional)
        });
    
        this.isReady = true;
        return this;
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
        return assets.length ? new AssetData(assets[0]) : null;
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
