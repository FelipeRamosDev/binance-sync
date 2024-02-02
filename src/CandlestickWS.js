import { KlineStreamModel, CandlestickHistory, FuturesChartWS } from '../../models/binance/Kline';

let history = {};

async function CandlestickServiceWS(BotAccount, wsCallback){
    const User = await BotStore.getUser(BotAccount.user);
    const symbol = BotAccount.assets[0];
    const interval = BotAccount.interval;
    const limit = 200;
    let KlineServ;

    switch(BotAccount.marketType){
        case 'spot': {
            KlineServ = new Promise(async (resolve, reject)=>{
                try {
                    if(!history[BotAccount.id]) history[BotAccount.id] = {};
                    if(!history[BotAccount.id][symbol]) history[BotAccount.id][symbol] = {};

                    try { 
                        const rawHistory = await User.binance.spot.klines(symbol, interval, { limit });
                        history[BotAccount.id][symbol][interval] = new CandlestickHistory(symbol, interval, rawHistory.data);
                    } catch(err){
                        reject(new ErrorResponse({message: `An error occur when the history candles was loading on CandlestickServiceWS for Spot!`, stack: [err]}));
                    }
                    
                    global.websockets[BotAccount.id] = User.binance.spot.klineWS(symbol, interval, {
                        open: (open)=>{
                            console.log(open, `Candlestick websocket started for asset ${symbol} for Spot!`)
                            resolve(this);
                        },
                        close: ()=>{
                            console.log(`Candlestick websocket closed for asset ${symbol} for Spot!`);
                            BotAccount.status = 'stopped';
                        },
                        message: (json) => {
                            wsKlineCallback(BotAccount, wsCallback, JSON.parse(json));
                        },
                    });
                } catch(err) {
                    reject(err);
                }
            });

            break;
        }
        case 'futures': {
            KlineServ = new Promise(async (resolve, reject)=>{
                try {
                    await User.binance.api.futuresChart(symbol, interval, (symb, int, candles)=>{
                        wsFutureCallback(BotAccount, wsCallback, candles);
                    }, limit);

                    BotStore.pushWS({ asset: symbol, interval, market: 'futures' });
                    resolve(this);
                } catch(err){
                    reject(new Error.Log(err).append('binance.chart.socket_future_charts', symbol, interval));
                }
            });
        }
    }

    return await KlineServ;
}

function wsFutureCallback(BotAccount, wsCallback, candles){
    const symbol = BotAccount.assets[0];
    const interval = BotAccount.interval;
    const historyCandles = new FuturesChartWS(symbol, interval, candles);

    wsCallback(historyCandles.data);
}

function wsKlineCallback(BotAccount, wsCallback, data){
    const symbol = BotAccount.assets[0];
    const interval = BotAccount.interval;
    const kline = new KlineStreamModel(data);
    const candlestick = kline.toCandlestick();
    let historyCandles = history[BotAccount.id][symbol][interval];
    const lastIndex = historyCandles.data.length - 1;

    historyCandles.data[lastIndex] = candlestick;

    wsCallback(historyCandles.data);
    if(candlestick.isCandleClosed){
        historyCandles.data.push({});
        if(historyCandles.data.length > 35){
            historyCandles.data.shift();
        }
    } 
}

module.exports = CandlestickServiceWS;
