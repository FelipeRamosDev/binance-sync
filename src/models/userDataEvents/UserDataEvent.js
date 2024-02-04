/**
 * Represents a user data event.
 * @class UserDataEvent
 */
module.exports = class UserDataEvent {
    /**
     * Creates an instance of UserDataEvent.
     * @param {Object} setup - The setup object containing event properties.
     * @param {string} setup.e - The event type.
     * @param {number} setup.E - The event time.
     * @param {number} [setup.T] - The transaction time (optional).
     * @throws {Error} Throws an error if there is an issue during setup.
     */
    constructor(setup) {
        try {
            const {
                e,
                E,
                T
            } = Object(setup);

            /**
             * The type of the user data event.
             * @member {string}
             */
            this.eventType = e;

            /**
             * The time when the user data event occurred.
             * @member {number}
             */
            this.eventTime = E;

            /**
             * The transaction time of the user data event (optional).
             * @member {number|undefined}
             */
            if (T) this.transactionTime = T;
        } catch (err) {
            // Throws an error if there is an issue during setup.
            throw new Error(err);
        }
    }
}
