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
        
        this.ws.on('message', (data) => {
            const toString = data.toString();
            const dataObj = JSON.parse(toString);

            if (dataObj?.id && dataObj?.result) {
                this.triggerCallback(dataObj?.id, dataObj.result);
            }
        });
    }

    setCallback(payloadID, callback) {
        if (typeof callback === 'function') {
            this.requestCallbacks.set(payloadID, callback.bind(this));
        }
    }

    triggerCallback(id, ...params) {
        const callback = this.requestCallbacks.get(id);

        if (typeof callback === 'function') {
            callback(...params);
        }

        this.requestCallbacks.delete(id);
    }

    loadPositions(callback) {
        const payloadID = crypto.randomBytes(8).toString('hex');
        const payload = JSON.stringify({
            id: payloadID,
            method: 'REQUEST',
            params: [ `${this.ws.listenKey}@position` ]
        });

        this.ws.send(payload);
        this.setCallback(payloadID, (data) => {
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

        return {
            id: payloadID,
            payload
        };
    }

    reloadPositions(callback) {
        if (this.reloadTries < 3) {
            this.reloadTries++;
            return setTimeout(() => this.loadPositions(callback), 5000);
        }

        return callback(toError({
            name: 'SOCKET_POSITIONS_LOAD',
            message: `The positions wasn't loaded by UserStream socket request!`
        }));
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
