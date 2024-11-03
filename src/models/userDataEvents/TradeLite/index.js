const UserDataEvent = require('../UserDataEvent');

/**
 * Represents an update to an order as a user data event.
 * @class TradeLite
 * @extends UserDataEvent
 */
class TradeLite extends UserDataEvent {
   /**
    * Creates an instance of TradeLite.
    * @param {Object} setup - The setup object containing order update properties.
    * @throws {Error} Throws an error if there is an issue during setup.
    */
   constructor(setup) {
      super(setup);
      const { e, E, T, s, q, p, m, c, S, L, l, t, i } = Object(setup);

      this.eventType = e;                 // "TRADE_LITE",             // Event Type
      this.eventTime = E;                 // 1721895408092,            // Event Time
      this.transactionTime = T;           // 1721895408214,            // Transaction Time       
      this.symbol = s;                    // "BTCUSDT",                // Symbol
      this.originalQuantity = q;          // "0.001",                  // Original Quantity
      this.originalPrice = p;             // "0",                      // Original Price
      this.isTradeMarkSide = m;           // false,                    // Is this trade the maker side?
      this.clientOrderId = c;             // "z8hcUoOsqEdKMeKPSABslD", // Client Order Id
      this.side = S;                      // "BUY",                    // Side
      this.lastFIlledPrice = L;           // "64089.20",               // Last Filled Price
      this.orderLastFilledQuantity = l;   // "0.040",                  // Order Last Filled Quantity
      this.tradeId = t;                   // 109100866,                // Trade Id
      this.orderId = i;                   // 8886774,                  // Order Id
   }
}

module.exports = TradeLite;
