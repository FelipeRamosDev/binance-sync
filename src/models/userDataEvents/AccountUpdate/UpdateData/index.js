import Balance from './Balance';
import AccountPosition from './AccountPosition';

/**
 * Represents an update data event, including information about balances and account positions.
 * @class UpdateData
 */
export default class UpdateData {
    /**
     * Creates an instance of UpdateData.
     * @param {Object} setup - The setup object containing update data properties.
     * @param {string} setup.m - The event reason type.
     * @param {Array<Balance>} setup.B - An array of balance objects.
     * @param {Array<AccountPosition>} setup.P - An array of account position objects.
     * @throws {Error} Throws an error if there is an issue during setup.
     */
    constructor(setup) {
        try {
            const { 
               m,
               B,
               P
            } = Object(setup);

            /**
             * The event reason type.
             * @member {string}
             */
            this.eventReasonType = m;

            /**
             * An array of balance objects.
             * @member {Array<Balance>}
             */
            this.balances = Array.isArray(B) ? B.map(item => new Balance(item)) : [];

            /**
             * An array of account position objects.
             * @member {Array<AccountPosition>}
             */
            this.positions = Array.isArray(P) ? P.map(item => new AccountPosition(item)) : [];
        } catch (err) {
            // Throws an error if there is an issue during setup.
            throw new Error.Log(err);
        }
    }
}
