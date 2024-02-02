class BinanceConfig {
    constructor(setup = {
        APIKEY: '',
        APISECRET: ''
    }){
        this.APIKEY = setup.APIKEY;
        this.APISECRET = setup.APISECRET;
    }
}

module.exports = BinanceConfig;
