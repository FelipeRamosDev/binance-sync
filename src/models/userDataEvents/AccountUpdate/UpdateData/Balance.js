/**
 * Represents balance information in an account.
 * @class Balance
 */
class Balance {
    /**
     * Creates an instance of Balance.
     * @param {Object} setup - The setup object containing balance properties.
     * @param {string} setup.a - The asset associated with the balance.
     * @param {number} setup.wb - The wallet balance.
     * @param {number} setup.cw - The cross wallet balance.
     * @param {number} setup.bc - The balance change (except PnL and commission).
     * @throws {Error} Throws an error if there is an issue during setup.
     */
    constructor(setup) {
        try {
            const {
                a,
                wb,
                cw,
                bc
            } = Object(setup);

            /**
             * The asset associated with the balance.
             * @member {string}
             */
            this.asset = a;

            /**
             * The wallet balance.
             * @member {number}
             */
            this.walletBalance = Number(wb);

            /**
             * The cross wallet balance.
             * @member {number}
             */
            this.crossWalletBalance = Number(cw);

            /**
             * The balance change (except PnL and commission).
             * @member {number}
             */
            this.balanceChange = Number(bc);
        } catch (err) {
            // Throws an error if there is an issue during setup.
            throw err;
        }
    }
}

module.exports = Balance;
