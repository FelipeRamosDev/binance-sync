import UserDataEvent from '../UserDataEvent';
import OrderData from './OrderData';

/**
 * Represents an update to an order as a user data event.
 * @class OrderUpdate
 * @extends UserDataEvent
 */
export default class OrderUpdate extends UserDataEvent {
    /**
     * Creates an instance of OrderUpdate.
     * @param {Object} setup - The setup object containing order update properties.
     * @param {Object} setup.o - The order data object.
     * @throws {Error} Throws an error if there is an issue during setup.
     */
    constructor(setup) {
        // Calls the constructor of the base class (UserDataEvent) with the provided setup.
        super(setup);

        try {
            const { o } = Object(setup);

            /**
             * The order data associated with the update.
             * @member {OrderData}
             */
            this.orderData = new OrderData(o);
        } catch (err) {
            // Throws an error if there is an issue during setup.
            throw new Error.Log(err);
        }
    }
}
