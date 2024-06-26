/**
 * A class representing a Candlestick for financial data.
 */
class Candlestick {
    /**
     * Constructs a new Candlestick object.
     * @param {Object} setup - The configuration object for the candlestick.
     * @param {string} setup.symbol - The symbol of the financial instrument.
     * @param {string} setup.interval - The time interval for the candlestick.
     * @param {number} setup.openTime - The opening time of the candlestick.
     * @param {number} setup.closeTime - The closing time of the candlestick.
     * @param {number} setup.open - The opening price of the candlestick.
     * @param {number} setup.close - The closing price of the candlestick.
     * @param {number} setup.low - The lowest price during the candlestick interval.
     * @param {number} setup.high - The highest price during the candlestick interval.
     * @param {number} setup.volume - The volume of the financial instrument traded during the candlestick interval.
     * @param {boolean} setup.isCandleClosed - Whether the candlestick is closed or not.
     * @param {boolean} setup.formatDate - Whether to format the date or not.
     */
    constructor(setup){
        const {
            symbol,
            interval,
            openTime,
            closeTime,
            open,
            close,
            low,
            high,
            volume,
            isCandleClosed,
            formatDate,
        } = Object(setup);

        try {
            this.symbol = symbol;
            this.interval = interval;
            this.openTime = formatDate ? new Date(openTime) : openTime;
            this.time = this.openTime;
            this.closeTime = formatDate ? new Date(closeTime) : closeTime;
            this.currentTime = formatDate ? new Date() : Date.now();
            this.open = Number(open);
            this.close = Number(close);
            this.low = Number(low);
            this.high = Number(high);
            this.volume = Number(volume);
            this.isCandleClosed = isCandleClosed;
        } catch(err) {
            throw err;
        }
    }

    /**
     * To convert itself with dates parsed.
     * @returns {Candlestick} The self candlestick with dates parsed.
     */
    parseDates() {
        const result = Object(this);
        
        result.openTime = new Date(this.openTime).toLocaleString();
        result.closeTime = new Date(this.closeTime).toLocaleString();
        result.currentTime = new Date(this.currentTime).toLocaleString();

        return result;
    }
}

module.exports = Candlestick;
