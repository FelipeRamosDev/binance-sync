function isClient() {
    if (typeof window !== 'undefined') {
        return true;
    }

    return false;
}

module.exports = {
    isClient
};
