const UserDataPositionBase = require('./userDataEvents/UserDataPositionBase');

/**
 * @class
 * Represents an account information position.
 * Extends the UserDataPositionBase class.
 */
class AccountInfoPosition extends UserDataPositionBase {
    /**
     * Constructs a new AccountInfoPosition instance.
     * @param {Object} setup - The setup object containing position details.
     * @param {boolean} setup.isolated - Indicates if the position is isolated.
     * @param {string} setup.positionSide - The side of the position (e.g., LONG, SHORT).
     * @param {string} setup.symbol - The symbol of the position (e.g., BTCUSDT).
     * @param {number} setup.updateTime - The time the position was last updated.
     * @param {number} setup.askNotional - The ask notional value.
     * @param {number} setup.breakEvenPrice - The break-even price.
     * @param {number} setup.entryPrice - The entry price of the position.
     * @param {number} setup.initialMargin - The initial margin of the position.
     * @param {number} setup.isolatedWallet - The isolated wallet balance.
     * @param {number} setup.leverage - The leverage applied to the position.
     * @param {number} setup.maintMargin - The maintenance margin required for the position.
     * @param {number} setup.notional - The notional value of the position.
     * @param {number} setup.openOrderInitialMargin - The initial margin for open orders.
     * @param {number} setup.positionInitialMargin - The initial margin for the position.
     * @param {number} setup.unrealizedProifit - The unrealized profit of the position.
     */
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

        /**
         * @type {string}
         * @description The type of the position.
         */
        this.type = 'AccountInfoPosition';
        
        /**
         * @type {boolean}
         * @description Indicates if the position is isolated.
         */
        this.isolated = isolated;
        
        /**
         * @type {string}
         * @description The side of the position (e.g., LONG, SHORT).
         */
        this.positionSide = positionSide;
        
        /**
         * @type {string}
         * @description The symbol of the position (e.g., BTCUSDT).
         */
        this.symbol = symbol;
        
        /**
         * @type {number}
         * @description The time the position was last updated.
         */
        this.updateTime = updateTime;
        
        /**
         * @type {number}
         * @description The ask notional value.
         */
        this.askNotional = parseNum(askNotional);
        
        /**
         * @type {number}
         * @description The break-even price.
         */
        this.breakEvenPrice = parseNum(breakEvenPrice);
        
        /**
         * @type {number}
         * @description The entry price of the position.
         */
        this.entryPrice = parseNum(entryPrice);
        
        /**
         * @type {number}
         * @description The initial margin of the position.
         */
        this.initialMargin = parseNum(initialMargin);
        
        /**
         * @type {number}
         * @description The isolated wallet balance.
         */
        this.isolatedWallet = parseNum(isolatedWallet);
        
        /**
         * @type {number}
         * @description The leverage applied to the position.
         */
        this.leverage = parseNum(leverage);
        
        /**
         * @type {number}
         * @description The maintenance margin required for the position.
         */
        this.maintMargin = parseNum(maintMargin);
        
        /**
         * @type {number}
         * @description The notional value of the position.
         */
        this.notional = parseNum(notional);
        
        /**
         * @type {number}
         * @description The initial margin for open orders.
         */
        this.openOrderInitialMargin = parseNum(openOrderInitialMargin);
        
        /**
         * @type {number}
         * @description The initial margin for the position.
         */
        this.positionInitialMargin = parseNum(positionInitialMargin);
        
        /**
         * @type {number}
         * @description The unrealized profit of the position.
         */
        this.unrealizedProifit = parseNum(unrealizedProifit);
    }
}

module.exports = AccountInfoPosition;
