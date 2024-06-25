/**
 * Base class for user data positions.
 * @class UserDataPositionBase
 */
class UserDataPositionBase {
    /**
     * Creates an instance of UserDataPositionBase.
     * @param {Object} setup - The setup object containing position properties.
     * @param {number} setup.positionAmt - The amount of the position.
     */
    constructor(setup) {
        const { positionAmt } = Object(setup);

        /**
         * The amount of the position.
         * @member {number}
         */
        this.positionAmt = parseNum(positionAmt);

        /**
         * Indicates whether the position is opened.
         * @member {boolean}
         */
        if (this.quantity) {
            this.isOpened = true;
        } else {
            this.isOpened = false;
        }
    }

    /**
     * Gets the absolute value of the position amount.
     * @return {number} The absolute position amount.
     */
    get quantity() {
        return Math.abs(this.positionAmt);
    }

    /**
     * Checks if the quantity matches the given position.
     * @param {Object|number} position - The position object or a number to compare.
     * @return {boolean} True if the quantity matches, otherwise false.
     */
    isQtyMatch(position) {
        if (typeof position === 'object') {
            return Boolean(position?.quantity === this.quantity);
        } else if (typeof position === 'number') {
            return Boolean(position === this.quantity);
        }
    }
}

module.exports = UserDataPositionBase;
