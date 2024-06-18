/**
 * @class
 * Represents an account trade.
 */
class AccountTrade {
    /**
     * Constructs a new AccountTrade instance.
     * @param {Object} setup - The setup object containing trade details.
     * @param {string} setup.symbol - The symbol of the trade (e.g., BTCUSDT).
     * @param {number} setup.id - The ID of the trade.
     * @param {number} setup.orderId - The order ID associated with the trade.
     * @param {string} setup.side - The side of the trade (e.g., BUY, SELL).
     * @param {number} setup.price - The price at which the trade was executed.
     * @param {number} setup.qty - The quantity of the trade.
     * @param {number} setup.realizedPnl - The realized profit and loss of the trade.
     * @param {string} setup.marginAsset - The margin asset of the trade.
     * @param {number} setup.quoteQty - The quote quantity of the trade.
     * @param {number} setup.commission - The commission for the trade.
     * @param {string} setup.commissionAsset - The commission asset for the trade.
     * @param {number} setup.time - The time the trade was executed.
     * @param {string} setup.positionSide - The position side of the trade (e.g., LONG, SHORT).
     * @param {boolean} setup.buyer - Indicates if the trade was a buyer trade.
     * @param {boolean} setup.maker - Indicates if the trade was a maker trade.
     */
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

        /**
         * @type {string}
         * @description The symbol of the trade (e.g., BTCUSDT).
         */
        this.symbol = symbol;
        
        /**
         * @type {number}
         * @description The ID of the trade.
         */
        this.id = id;
        
        /**
         * @type {number}
         * @description The order ID associated with the trade.
         */
        this.orderId = orderId;
        
        /**
         * @type {string}
         * @description The side of the trade (e.g., BUY, SELL).
         */
        this.side = side;
        
        /**
         * @type {number}
         * @description The price at which the trade was executed.
         */
        this.price = this.parseNum(price);
        
        /**
         * @type {number}
         * @description The quantity of the trade.
         */
        this.qty = this.parseNum(qty);
        
        /**
         * @type {number}
         * @description The realized profit and loss of the trade.
         */
        this.realizedPnl = this.parseNum(realizedPnl);
        
        /**
         * @type {string}
         * @description The margin asset of the trade.
         */
        this.marginAsset = marginAsset;
        
        /**
         * @type {number}
         * @description The quote quantity of the trade.
         */
        this.quoteQty = this.parseNum(quoteQty);
        
        /**
         * @type {number}
         * @description The commission for the trade.
         */
        this.commission = this.parseNum(commission);
        
        /**
         * @type {string}
         * @description The commission asset for the trade.
         */
        this.commissionAsset = commissionAsset;
        
        /**
         * @type {number}
         * @description The time the trade was executed.
         */
        this.time = time;
        
        /**
         * @type {string}
         * @description The position side of the trade (e.g., LONG, SHORT).
         */
        this.positionSide = positionSide;
        
        /**
         * @type {boolean}
         * @description Indicates if the trade was a buyer trade.
         */
        this.buyer = buyer;
        
        /**
         * @type {boolean}
         * @description Indicates if the trade was a maker trade.
         */
        this.maker = maker;
    }

    /**
     * Parses a value to a number.
     * @param {*} value - The value to be parsed.
     * @returns {number} - The parsed number, or undefined if the value is not a number.
     */
    parseNum(value) {
        if (isNaN(value)) {
            return;
        }

        return Number(value);
    }
}

module.exports = AccountTrade;
