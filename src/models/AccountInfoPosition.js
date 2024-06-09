class AccountInfoPosition {
    constructor(setup) {
        const {
            isolated,
            positionSide,
            symbol,
            updateTime,
            askNotional,
            breakEvenPrice,
            entryPrice,
            initialMargin,
            isolatedWallet,
            leverage,
            maintMargin,
            notional,
            openOrderInitialMargin,
            positionAmt,
            positionInitialMargin,
            unrealizedProifit
        } = Object(setup);

        this.isolated = isolated;
        this.positionSide = positionSide;
        this.symbol = symbol;
        this.updateTime = updateTime;
        this.askNotional = Number(askNotional);
        this.breakEvenPrice = Number(breakEvenPrice);
        this.entryPrice = Number(entryPrice);
        this.initialMargin = Number(initialMargin);
        this.isolatedWallet = Number(isolatedWallet);
        this.leverage = Number(leverage);
        this.maintMargin = Number(maintMargin);
        this.notional = Number(notional);
        this.openOrderInitialMargin = Number(openOrderInitialMargin);
        this.positionAmt = Number(positionAmt);
        this.quantity = Math.abs(this.positionAmt);
        this.positionInitialMargin = Number(positionInitialMargin);
        this.unrealizedProifit = Number(unrealizedProifit);
    }
}

module.exports = AccountInfoPosition;
