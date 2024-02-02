export default class BinanceConfig {
    constructor(setup) {
        const { APIKEY, APISECRET } = Object(setup);

        this.APIKEY = APIKEY;
        this.APISECRET = APISECRET;
    }
}
