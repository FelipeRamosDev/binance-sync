const ValidateSchema = require('../../validation/validateSchema');

class WebsocketConnection extends ValidateSchema {
    constructor(setup = {
        asset: '',
        interval: '',
        market: '',
        limit: 0
    }){
        try {
            super({
                asset: { type: String, required: true },
                interval: { type: String, required: true },
                endpoint: { type: String },
                market: { type: String, default: 'futures' },
                limit: { type: Number, default: 99 }
            });
    
            this.asset = setup.asset;
            this.interval = setup.interval;
            this.endpoint = `${this.asset.toLowerCase()}@kline_${this.interval}`;
            this.market = setup.market;
            this.limit = setup.limit;
    
            this.placeDefault();
            if (this.validate()) throw new Error.Log(this.validationResult);
        } catch(err) {
            throw new Error.Log(err);
        }
    }
}

module.exports = WebsocketConnection;
