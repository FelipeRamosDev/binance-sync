const { isClient } = require('./helpers');

// Helpers
if (isClient()) {
    window.isClient = isClient;
} else {
    global.isClient = isClient;
}

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
