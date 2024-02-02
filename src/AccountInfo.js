class AccountInfo {
    constructor(parent) {
        try {
            if (!parent) {
                throw new Error.Log('common.missing_param', 'user', 'BinanceService');
            }

            this._parent = () => parent;
        } catch (err) {
            throw new Error.Log(err);
        }
    }

    get parent() {
        return this._parent();
    }

    get binanceAPI() {
        return this.parent?.binanceAPI;
    }

    async futuresAccount() {
        try {
            const account = await this.binanceAPI.futuresAccount();

            debugger;
        } catch (err) {
            throw new Error.Log(err);
        }
    }
}

module.exports = AccountInfo;
