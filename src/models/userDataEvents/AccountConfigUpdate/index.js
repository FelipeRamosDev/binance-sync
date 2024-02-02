import UserDataEvent from '../UserDataEvent';
import AccountConfig from './AccountConfig';

/**
 * Represents an update to the account configuration as a user data event.
 * @class AccountConfigUpdate
 * @extends UserDataEvent
 */
export default class AccountConfigUpdate extends UserDataEvent {
    /**
     * Creates an instance of AccountConfigUpdate.
     * @param {Object} setup - The setup object containing account configuration update properties.
     * @param {AccountConfig} setup.ac - The account configuration object.
     * @throws {Error} Throws an error if there is an issue during setup.
     */
    constructor(setup) {
        // Calls the constructor of the base class (UserDataEvent) with the provided setup.
        super(setup);

        try {
            const { ac } = Object(setup);

            /**
             * The updated account configuration.
             * @member {AccountConfig}
             */
            this.accountConfig = new AccountConfig(ac);
        } catch (err) {
            // Throws an error if there is an issue during setup.
            throw new Error.Log(err);
        }
    }
}
