/**
 * Represents a position in an account.
 * @class AccountPosition
 */
export default class AccountPosition {
    /**
     * Creates an instance of AccountPosition.
     * @param {Object} setup - The setup object containing account position properties.
     * @param {string} setup.s - The symbol associated with the position.
     * @param {number} setup.pa - The position amount.
     * @param {number} setup.ep - The entry price of the position.
     * @param {number} setup.bep - The break-even price of the position.
     * @param {number} setup.cr - The (pre-fee) accumulated realized value.
     * @param {number} setup.up - The unrealized profit and loss (PNL) of the position.
     * @param {string} setup.mt - The margin type associated with the position.
     * @param {number} setup.iw - The isolated wallet value associated with the position.
     * @param {string} setup.ps - The position side (e.g., "long" or "short").
     * @throws {Error} Throws an error if there is an issue during setup.
     */
    constructor(setup) {
        try {
            const {
                s,
                pa,
                ep,
                bep,
                cr,
                up,
                mt,
                iw,
                ps
            } = Object(setup);

            /**
             * The symbol associated with the position.
             * @member {string}
             */
            this.symbol = s;

            /**
             * The position amount.
             * @member {number}
             */
            this.positionAmount = Number(pa);

            /**
             * The entry price of the position.
             * @member {number}
             */
            this.entryPrice = Number(ep);

            /**
             * The break-even price of the position.
             * @member {number}
             */
            this.breakEvenPrice = Number(bep);

            /**
             * The (pre-fee) accumulated realized value.
             * @member {number}
             */
            this.preFee = Number(cr);

            /**
             * The unrealized profit and loss (PNL) of the position.
             * @member {number}
             */
            this.unrealizedPNL = Number(up);

            /**
             * The margin type associated with the position.
             * @member {string}
             */
            this.marginType = mt;

            /**
             * The isolated wallet value associated with the position.
             * @member {number}
             */
            this.isolatedWallet = Number(iw);

            /**
             * The position side (e.g., "long" or "short").
             * @member {string}
             */
            this.positionSide = ps;
        } catch (err) {
            // Throws an error if there is an issue during setup.
            throw new Error.Log(err);
        }
    }
}
