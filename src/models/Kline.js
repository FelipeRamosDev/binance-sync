import Candlestick from './Candlestick';

class KlineStreamModel {
    constructor({
        e, // Event type
        E, // Event time
        s, // Symbol
        k,
    }) {
        this.eventType = e;
        this.eventTime = new Date(E).toLocaleString();
        this.symbol = s;
        this.data = new KlineDataStreamModel(k);
    }

    toCandlestick(){
        const {
            symbol,
            interval,
            openTime,
            closeTime,
            open,
            close,
            high,
            low,
            quoteAssetVolume,
            isCandleClosed
        } = this.data;

        return new Candlestick({
            symbol,
            interval,
            openTime,
            closeTime,
            open,
            close,
            high,
            low,
            volume: quoteAssetVolume,
            isCandleClosed
        });
    }
}

class KlineDataStreamModel {
    constructor({
        t, // Kline start time
        T, // Kline close time
        s, // Symbol
        i, // Interval
        f, // First trade ID
        L, // Last trade ID
        o, // Open price
        c, // Close price
        h, // High price
        l, // Low price
        v, // Base asset volume
        n, // Number of trades
        x, // Is this kline closed?
        q, // Quote asset volume
        V, // Taker buy base asset volume
        Q, // Taker buy quote asset volume
        B, // Ignore
    }) {
        if (t) this.openTime = t;
        if (T) this.closeTime = T;
        if (s) this.symbol = s;
        if (i) this.interval = i;
        if (o) this.open = Number(o);
        if (c) this.close = Number(c);
        if (h) this.high = Number(h);
        if (l) this.low = Number(l);
        if (v) this.baseAssetVolume = Number(v);
        if (n) this.numberOfTrades = Number(n);
        if (x) this.isCandleClosed = x;
        if (q) this.quoteAssetVolume = Number(q);
    }
}

class CandlestickHistory {
    constructor(symbol, interval, history){
        let result = [];

        history.map(ticker=>{
            const kline = new KlineDataStreamModel({
                s: symbol,
                i: interval,
                t: ticker[0],
                o: ticker[1],
                h: ticker[2],
                l: ticker[3],
                c: ticker[4],
            });
            result.push(new Candlestick(kline));
        })

        this.data = result;
        this.rawHistory = history;
    }
}

class FuturesChartWS {
    constructor(symbol, interval, history, slotsInUse){
        try {
            super({
                symbol: { type: String, required: true },
                interval: { type: String, required: true },
                data: { type: Array, required: true },
                rawHistory: { type: Object, required: true },
                slotsInUse: { type: Object, default: {} }
            });
            
            this.updateData(symbol, interval, history);
            this.symbol = symbol;
            this.interval = interval;
            this.slotsInUse = slotsInUse || {};
        } catch(err) {
            throw new Error.Log(err).append('candles.chart.validation.required_param');
        }
    }

    updateData(symbol, interval, history) {
        let result = [];

        for (let key in history) {
            const candle = history[key];

            result.push(new Candlestick({
                symbol,
                interval,
                openTime: candle.time,
                closeTime: candle.closeTime,
                open: candle.open,
                close: candle.close,
                high: candle.high,
                low: candle.low,
                volume: candle.volume,
                isCandleClosed: (Date.now() >= Number(candle.closeTime)) ? true : false
            }));
        };

        delete this.data;
        delete this.rawHistory;

        this.data = result.sort((a, b) => b.openTime - a.openTime);
        this.rawHistory = history;
    }
}

module.exports = {
    KlineStreamModel,
    KlineDataStreamModel,
    CandlestickHistory,
    FuturesChartWS
}
