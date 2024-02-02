/**
 * Represents a configuration for an account.
 * @class AccountConfig
 */
module.exports = class AccountConfig {
    /**
     * Creates an instance of AccountConfig.
     * @param {Object} setup - The setup object containing account configuration properties.
     * @param {string} setup.s - The symbol associated with the account.
     * @param {string} setup.l - The leverage for the account.
     * @throws {Error} Throws an error if there is an issue during setup.
     */
    constructor(setup) {
        try {
            const { s, l } = Object(setup);

            /**
             * The symbol associated with the account.
             * @member {string}
             */
            this.symbol = s;

            /**
             * The leverage for the account.
             * @member {number}
             */
            this.leverage = Number(l);
        } catch (err) {
            // Throws an error if there is an issue during setup.
            throw new Error.Log(err);
        }
    }
}
