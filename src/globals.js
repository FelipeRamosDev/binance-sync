if (!global.binanceSync) {
    global.binanceSync = {
        charts: {}
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
