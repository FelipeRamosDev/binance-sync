const UserDataPositionBase = require('./UserDataPositionBase');

class UserDataPosition extends UserDataPositionBase {
    constructor(setup) {
        super(setup);
        const {
            entryPrice,
            marginType,
            isAutoAddMargin,
            isolatedMargin,
            leverage,
            liquidationPrice,
            markPrice,
            maxNotionalValue,
            symbol,
            unRealizedProfit,
            positionSide,
            notional,
            updateTime,
        } = Object(setup);

        this.type = 'UserDataPosition';
        this.entryPrice = parseNum(entryPrice);
        this.marginType = marginType;
        this.isAutoAddMargin = isAutoAddMargin;
        this.isolatedMargin = parseNum(isolatedMargin);
        this.leverage = parseNum(leverage);
        this.liquidationPrice = parseNum(liquidationPrice);
        this.markPrice = parseNum(markPrice);
        this.maxNotionalValue = parseNum(maxNotionalValue);
        this.symbol = symbol;
        this.unRealizedProfit = parseNum(unRealizedProfit);
        this.positionSide = positionSide;
        this.notional = parseNum(notional);
        this.updateTime = updateTime;
    }
}

module.exports = UserDataPosition;
