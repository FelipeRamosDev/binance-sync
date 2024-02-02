const UpdateData = require('./UpdateData');
const UserDataEvent = require('../UserDataEvent');

/**
 * Represents an account update event, including detailed information about the update.
 * @class AccountUpdateEvent
 * @extends UserDataEvent
 */
module.exports = class AccountUpdateEvent extends UserDataEvent {
    /**
     * Creates an instance of AccountUpdateEvent.
     * @param {Object} setup - The setup object containing account update event properties.
     * @param {UpdateData} setup.a - The detailed update data associated with the account.
     */
    constructor(setup) {
        // Calls the constructor of the base class (UserDataEvent) with the provided setup.
        super(setup);

        const {
            a
        } = Object(setup);

        /**
         * Detailed update data associated with the account.
         * @member {UpdateData}
         */
        this.updateData = new UpdateData(a);
    }
}
