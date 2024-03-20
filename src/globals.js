if (!global.binanceSync) {
    global.binanceSync = {
        charts: {},
        userDataStream: {}
    };

    Error.new = (name, message, code) => {
        return {
            name,
            message,
            code,
            error: true
        }
    }
}
