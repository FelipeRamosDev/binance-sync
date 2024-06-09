class AccountTrade {
    constructor(setup) {
        const {
            symbol,
            id,
            orderId,
            side,
            price,
            qty,
            realizedPnl,
            marginAsset,
            quoteQty,
            commission,
            commissionAsset,
            time,
            positionSide,
            buyer,
            maker
        } = Object(setup);

        this.symbol = symbol;
        this.id = id
        this.orderId = orderId;
        this.side = side;
        this.price = this.parseNum(price),
        this.qty = this.parseNum(qty),
        this.realizedPnl = this.parseNum(realizedPnl),
        this.marginAsset = marginAsset;
        this.quoteQty = this.parseNum(quoteQty),
        this.commission = this.parseNum(commission),
        this.commissionAsset = commissionAsset;
        this.time = time;
        this.positionSide = positionSide;
        this.buyer = buyer;
        this.maker = maker;
    }

    parseNum(value) {
        if (isNaN(value)) {
            return;
        }

        return Number(value);
    }
}

module.exports = AccountTrade;
