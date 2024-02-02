export default class WebsocketConnection {
    constructor(setup){
        const { asset, interval, market, limit } = Object(setup);

        try {
            this.asset = asset;
            this.interval = interval;
            this.endpoint = `${this.asset.toLowerCase()}@kline_${this.interval}`;
            this.market = market;
            this.limit = limit;
        } catch(err) {
            throw new Error.Log(err);
        }
    }
}
