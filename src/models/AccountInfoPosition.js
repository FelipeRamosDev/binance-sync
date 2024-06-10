const UserDataPositionBase = require('./userDataEvents/UserDataPositionBase');

class AccountInfoPosition extends UserDataPositionBase {
    constructor(setup) {
        super(setup);
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
            positionInitialMargin,
            unrealizedProifit
        } = Object(setup);

        this.type = 'AccountInfoPosition';
        this.isolated = isolated;
        this.positionSide = positionSide;
        this.symbol = symbol;
        this.updateTime = updateTime;
        this.askNotional = parseNum(askNotional);
        this.breakEvenPrice = parseNum(breakEvenPrice);
        this.entryPrice = parseNum(entryPrice);
        this.initialMargin = parseNum(initialMargin);
        this.isolatedWallet = parseNum(isolatedWallet);
        this.leverage = parseNum(leverage);
        this.maintMargin = parseNum(maintMargin);
        this.notional = parseNum(notional);
        this.openOrderInitialMargin = parseNum(openOrderInitialMargin);
        this.positionInitialMargin = parseNum(positionInitialMargin);
        this.unrealizedProifit = parseNum(unrealizedProifit);
    }
}

module.exports = AccountInfoPosition;
