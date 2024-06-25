const crypto = require('crypto');

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
            this.requestCallbacks = new Map();

            this.reloadTries = 0;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Gets the streams object which is a function returning the streams.
     * @returns {Function} A function that when called, returns the streams object.
     */
    get streams() {
        return this._streams();
    }

    /**
     * Gets the parent service of the streams which is assumed to be Binance service.
     * @returns {Object} The parent service of the streams.
     */
    get binanceService() {
        return this.streams.parentService;
    }

    /**
     * Gets the listen key from the WebSocket instance if available.
     * @returns {string|undefined} The listen key or undefined if not available.
     */
    get listenKey() {
        return this.ws?.listenKey;
    }

    /**
     * Gets the identifier of the UserStream instance, falling back to listen key if no id is set.
     * @returns {string} The identifier of the UserStream instance.
     */
    get id() {
        return this._id || this.listenKey;
    }

    /**
     * Updates the WebSocket instance and adds a socket request listener.
     * @param {WebSocket} WS - The new WebSocket instance to be used.
     */
    appendWS(WS) {
        this.ws = WS;
        this.addSocketRequestListener();
    }

    /**
     * Adds a listener for 'message' events on the WebSocket instance that triggers callbacks based on message ids.
     */
    addSocketRequestListener() {
        this.ws.on('message', (data) => {
            if (!this.requestCallbacks?.size) {
                return;
            }

            const toString = data.toString();
            const dataObj = JSON.parse(toString);

            if (dataObj?.id && dataObj?.result) {
                this.triggerCallback(dataObj?.id, dataObj.result);
            }
        });
    }

    /**
     * Sets a callback function for a given payload ID, binding it to this UserStream instance.
     * @param {string} payloadID - The ID associated with a particular payload.
     * @param {Function} callback - The callback function to execute when triggered.
     */
    setCallback(payloadID, callback) {
        if (typeof callback === 'function') {
            this.requestCallbacks.set(payloadID, callback.bind(this));
        }
    }

    /**
     * Triggers a stored callback function using its ID and any provided parameters, then deletes it from storage.
     * @param {string} id - The ID of the callback to trigger.
     * @param {...any} params - Parameters to pass to the callback function upon execution.
     */
    triggerCallback(id, ...params) {
        const callback = this.requestCallbacks.get(id);

        if (typeof callback === 'function') {
            callback(...params);
        }

        this.requestCallbacks.delete(id);
    }

    /**
     * Sends a socket request with a unique payload ID and sets up a corresponding callback function.
     * @param {Function} callback - The callback function to execute when a response is received.
     * @returns {Object} An object containing the payload ID and payload string sent over WebSocket.
     */
    socketRequest(callback) {
        const payloadID = crypto.randomBytes(8).toString('hex');
        const payload = JSON.stringify({
            id: payloadID,
            method: 'REQUEST',
            params: [ `${this.ws.listenKey}@position` ]
        });

        this.ws.send(payload);
        this.setCallback(payloadID, callback);

        return {
            payloadID,
            payload
        };
    }

    /**
     * Loads positions from Binance service and handles any errors encountered during the process.
     * @returns {Promise<Array|Error>} A promise that resolves with an array of positions or rejects with an error object.
     */
    async loadPositions() {
        try {
            const accountInfo = await this.binanceService.futuresAccountInfo();

            if (!accountInfo || accountInfo.error) {
                throw logError(accountInfo);
            }

            if (Array.isArray(accountInfo.positions)) {
                return accountInfo.positions;
            }

            return [];
        } catch (err) {
            throw logError(err);
        }
    }

    /**
     * Requests positions over WebSocket and sets up handling for received data or reloading if necessary.
     * @param {Function} callback - The callback function to execute with the positions data or upon reload attempt.
     * @returns {Object} An object containing details about the socket request made for positions data.
     */
    requestPositions(callback) {
        const response = this.socketRequest((data) => {
            if (!Array.isArray(data) || !data.length) {
                return this.reloadPositions(callback);
            }

            let abort = false;
            data.map(item => {
                if (abort) return;
                const positions = item?.res?.positions;

                if (!Array.isArray(positions) || !positions.length) {
                    abort = true;
                    return this.reloadPositions(callback);
                }

                callback(positions);
            });
        });

        return response;
    }

    /**
     * Attempts to reload positions data up to 3 times with a delay between each try, then executes a callback function with error details if all attempts fail.
     * @param {Function} callback - The callback function to execute with positions data or error details after reload attempts.
     */
    reloadPositions(callback) {
        if (this.reloadTries < 3) {
            this.reloadTries++;
            return setTimeout(() => this.loadPositions(callback), 5000);
        }

        return callback(toError({
            name: 'SOCKET_POSITIONS_LOAD',
            message: `The UserStream tried to get the positions on Binance side for 3 attemps, but something went wrong!`
        }));
    }

    /**
     * Closes the WebSocket connection and clears the ping timer if set. Also deletes the current stream from binanceSync.
     * @returns {void|WebSocket} The result of terminating the WebSocket connection.
     */
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

    /**
     * Deletes the current user stream from the binanceSync userDataStream object using this instance's id.
     */
    deleteStream() {
        delete binanceSync.userDataStream[this.id];
    }
}

module.exports = UserStream;
