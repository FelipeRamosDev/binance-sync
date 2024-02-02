module.exports = class UserStream {
    constructor(setup) {
        try {
            const { ws, listeners } = Object(setup);

            this.ws = ws;
            this.listeners = {...listeners};
        } catch (err) {
            throw new Error.Log(err);
        }
    }
}
