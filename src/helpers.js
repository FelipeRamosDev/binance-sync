function isClient() {
    if (typeof window !== 'undefined') {
        return true;
    }

    return false;
}

function appendEvent(eventName, callback) {
    if (isClient()) {
        window.addEventListener(eventName, callback);
    } else {
        process.on(eventName, callback);
    }
}

function emitEvent(eventName, data) {
    if (isClient()) {
        const event = new CustomEvent(eventName, { detail: { ...data } });
        window.dispatchEvent(event);
    } else {
        process.emit(eventName, data);
    }
}

module.exports = {
    isClient,
    appendEvent,
    emitEvent
};
