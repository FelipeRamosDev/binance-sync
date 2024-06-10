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

    get binanceService() {
        return this.streams.parentService;
    }

    get listenKey() {
        return this.ws?.listenKey;
    }

    get id() {
        return this._id || this.listenKey;
    }

    appendWS(WS) {
        this.ws = WS;
        this.addSocketRequestListener();
    }

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
