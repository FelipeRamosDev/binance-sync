import Binance from 'node-binance-api';
import {Axios} from 'axios';
import exchangesConfig from '../../../exchange-config.json';
import AssetData from './models/AssetData';
import futuresLeverage from '../../../futures-leverage.json';

export default class BinanceCenter {
    constructor() {
        this.configs = exchangesConfig.binance;
        this.futuresSymbols = [];
        this.rateLimit = [];
        this.exchangeFilters = [];
        this.serverTime;
        this.timezone = '';

        try {
            // Create the main Binance connection
            this.connection = new Binance();
        } catch(err) {
            throw new Error.Log('binance.connection.binance_api_init');
        }
    }

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

    getAssetsData(symbols) {
        if (Array.isArray(symbols) && symbols.length) {
            return this.futuresSymbols.filter(asset => symbols.find(item => item === asset.symbol));
        }

        return this.futuresSymbols;
    }

    getAsset(symbol) {
        const assets = this.getAssetsData([symbol]);
        return assets.length ? assets[0] : null;
    }

    getSymbolsList() {
        return this.futuresSymbols.map(asset => asset.symbol);
    }
}
