/**
 * UserStream class for managing user streams.
 */
class UserStream {
    /**
     * Constructs a new UserStream instance.
     * @param {Object} setup - The setup object for the UserStream.
     * @param {WebSocket} setup.ws - The WebSocket instance.
     * @param {Object} setup.listeners - The listeners for the WebSocket events. Each listener will have as key the slot UID.
     * @throws {Error} If there is an error during setup.
     */
    constructor(setup) {
        try {
            const { ws, listeners, pingTimer } = Object(setup);

            this.ws = ws;
            this.listeners = {...listeners};
            this.pingTimer = pingTimer;
        } catch (err) {
            throw err;
        }
    }

    close() {
        this.ws.close();
        return this.ws.terminate();
    }
}

module.exports = UserStream;
