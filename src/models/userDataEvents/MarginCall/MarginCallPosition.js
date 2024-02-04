/**
 * Represents a position involved in a margin call event.
 * @class MarginCallPosition
 */
class MarginCallPosition {
    /**
     * Creates an instance of MarginCallPosition.
     * @param {Object} setup - The setup object containing margin call position properties.
     * @param {string} setup.s - The symbol associated with the position.
     * @param {string} setup.ps - The position side (e.g., "long" or "short").
     * @param {number} setup.pa - The position amount.
     * @param {string} setup.mt - The margin type associated with the position.
     * @param {number} setup.iw - The isolated wallet value (if isolated position).
     * @param {number} setup.mp - The mark price of the position.
     * @param {number} setup.up - The unrealized profit and loss (PNL) of the position.
     * @param {number} setup.mm - The maintenance margin required.
     * @throws {Error} Throws an error if there is an issue during setup.
     */
    constructor(setup) {
        try {
            const { s, ps, pa, mt, iw, mp, up, mm } = Object(setup);

            /**
             * The symbol associated with the position.
             * @member {string}
             */
            this.symbol = s;

            /**
             * The position side (e.g., "long" or "short").
             * @member {string}
             */
            this.positionSide = ps;

            /**
             * The position amount.
             * @member {number}
             */
            this.positionAmount = Number(pa);

            /**
             * The margin type associated with the position.
             * @member {string}
             */
            this.marginType = mt;

            /**
             * The isolated wallet value (if isolated position).
             * @member {number}
             */
            this.isolatedWallet = Number(iw);

            /**
             * The mark price of the position.
             * @member {number}
             */
            this.markPrice = Number(mp);

            /**
             * The unrealized profit and loss (PNL) of the position.
             * @member {number}
             */
            this.unrealizedPNL = Number(up);

            /**
             * The maintenance margin required.
             * @member {number}
             */
            this.marginRequired = Number(mm);
        } catch (err) {
            // Throws an error if there is an issue during setup.
            throw err;
        }
    }
}

module.exports = MarginCallPosition;
