const UserDataEvent  = require('../UserDataEvent');
const MarginCallPosition  = require('./MarginCallPosition');

/**
 * Represents a margin call event, including information about cross wallet balance and positions involved.
 * @class MarginCall
 * @extends UserDataEvent
 */
module.exports = class MarginCall extends UserDataEvent {
    /**
     * Creates an instance of MarginCall.
     * @param {Object} setup - The setup object containing margin call event properties.
     * @param {number} setup.cw - The cross wallet balance. Only pushed with crossed position margin call.
     * @param {Array<MarginCallPosition>} setup.p - An array of margin call position objects.
     * @throws {Error} Throws an error if there is an issue during setup.
     */
    constructor(setup) {
        // Calls the constructor of the base class (UserDataEvent) with the provided setup.
        super(setup);

        try {
            const { cw, p } = Object(setup);

            /**
             * The cross wallet balance. Only pushed with crossed position margin call.
             * @member {number}
             */
            this.crossWalletBalance = Number(cw);

            /**
             * An array of margin call position objects.
             * @member {Array<MarginCallPosition>}
             */
            this.positions = Array.isArray(p) ? p.map(item => new MarginCallPosition(item)) : [];
        } catch (err) {
            // Throws an error if there is an issue during setup.
            throw new Error.Log(err);
        }
    }
}
