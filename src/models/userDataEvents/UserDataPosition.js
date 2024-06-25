const UserDataPositionBase = require('./UserDataPositionBase');

/**
 * Represents a user data position.
 * @class UserDataPosition
 */
class UserDataPosition extends UserDataPositionBase {
    /**
     * Creates an instance of UserDataPosition.
     * @param {Object} setup - The setup object containing user data position properties.
     * @param {number} setup.entryPrice - The entry price of the position.
     * @param {string} setup.marginType - The margin type associated with the position.
     * @param {boolean} setup.isAutoAddMargin - Indicates if auto-add margin is enabled.
     * @param {number} setup.isolatedMargin - The isolated margin value.
     * @param {number} setup.leverage - The leverage of the position.
     * @param {number} setup.liquidationPrice - The liquidation price of the position.
     * @param {number} setup.markPrice - The mark price of the position.
     * @param {number} setup.maxNotionalValue - The maximum notional value of the position.
     * @param {string} setup.symbol - The symbol associated with the position.
     * @param {number} setup.unRealizedProfit - The unrealized profit of the position.
     * @param {string} setup.positionSide - The position side (e.g., "long" or "short").
     * @param {number} setup.notional - The notional value of the position.
     * @param {number} setup.updateTime - The time when the position was last updated.
     * @throws {Error} Throws an error if there is an issue during setup.
     */
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

        /**
         * The entry price of the position.
         * @member {number}
         */
        this.entryPrice = parseNum(entryPrice);

        /**
         * The margin type associated with the position.
         * @member {string}
         */
        this.marginType = marginType;

        /**
         * Indicates if auto-add margin is enabled.
         * @member {boolean}
         */
        this.isAutoAddMargin = isAutoAddMargin;

        /**
         * The isolated margin value.
         * @member {number}
         */
        this.isolatedMargin = parseNum(isolatedMargin);

        /**
         * The leverage of the position.
         * @member {number}
         */
        this.leverage = parseNum(leverage);

        /**
         * The liquidation price of the position.
         * @member {number}
         */
        this.liquidationPrice = parseNum(liquidationPrice);

        /**
         * The mark price of the position.
         * @member {number}
         */
        this.markPrice = parseNum(markPrice);

        /**
         * The maximum notional value of the position.
         * @member {number}
         */
        this.maxNotionalValue = parseNum(maxNotionalValue);

        /**
         * The symbol associated with the position.
         * @member {string}
         */
        this.symbol = symbol;

        /**
         * The unrealized profit of the position.
         * @member {number}
         */
        this.unRealizedProfit = parseNum(unRealizedProfit);

        /**
         * The position side (e.g., "long" or "short").
         * @member {string}
         */
        this.positionSide = positionSide;

        /**
         * The notional value of the position.
         * @member {number}
         */
        this.notional = parseNum(notional);

        /**
         * The time when the position was last updated.
         * @member {number}
         */
        this.updateTime = updateTime;
    }
}

module.exports = UserDataPosition;
