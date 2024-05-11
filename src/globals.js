const { isClient, appendEvent, emitEvent } = require('./helpers');

// Helpers
if (isClient()) {
    window.isClient = isClient;
    window.appendEvent = appendEvent;
    window.emitEvent = emitEvent;
} else {
    global.isClient = isClient;
    global.appendEvent = appendEvent;
    global.emitEvent = emitEvent;
}

if (!global.binanceSync) {
    global.binanceSync = {
        charts: {},
        userDataStream: {},
        clientEvents: {}
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
