/**
 * UserStream class for managing user streams.
 */
class UserStream {
    /**
     * Constructs a new UserStream instance.
     * @param {Object} setup - The setup object for the UserStream.
     * @param {WebSocket} setup.ws - The WebSocket instance.
     * @param {Object} setup.listeners - The listeners for the WebSocket events. Each listener will have as key the slot UID.
     * @param {Object} setup.pingTimer - The setInterval timer to send the user stream keep alive ping.
     * @throws {Error} If there is an error during setup.
     */
    constructor(setup) {
        try {
            const { id, ws, listeners, pingTimer, streams } = Object(setup);

            this._streams = () => streams;
            this._id = id;
            this.ws = ws;
            this.listeners = listeners;
            this.pingTimer = pingTimer;
        } catch (err) {
            throw err;
        }
    }

    get streams() {
        return this._streams();
    }

    get listenKey() {
        return this.ws?.listenKey;
    }

    get id() {
        return this._id || this.listenKey;
    }

    appendWS(WS) {
        this.ws = WS;
    }

    close() {
        if (!this.ws) {
            return;
        }

        if (this.pingTimer) {
            clearInterval(this.pingTimer);
        }

        this.deleteStream();
        this.ws.close();
        return this.ws.terminate();
    }

    deleteStream() {
        delete binanceSync.userDataStream[this.id];
    }
}

module.exports = UserStream;
