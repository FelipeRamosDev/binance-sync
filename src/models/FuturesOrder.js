class FuturesOrder {
   constructor(setup) {
      const {
         avgPrice,
         clientOrderId,
         cumQuote,
         executedQty,
         orderId,
         origQty,
         origType,
         price,
         reduceOnly,
         side,
         positionSide,
         status,
         stopPrice,
         closePosition,
         symbol,
         time,
         timeInForce,
         type,
         activatePrice,
         priceRate,
         updateTime,
         workingType,
         priceProtect,
         priceMatch,
         selfTradePreventionMode,
         goodTillDate,
      } = Object(setup);

      this.avgPrice = avgPrice;
      this.clientOrderId = clientOrderId;
      this.cumQuote = cumQuote;
      this.executedQty = executedQty;
      this.orderId = orderId;
      this.origQty = origQty;
      this.origType = origType
      this.price = price;
      this.reduceOnly = reduceOnly;
      this.side = side;
      this.positionSide = positionSide;
      this.status = status;
      this.stopPrice = stopPrice;                             // please ignore when order type is TRAILING_STOP_MARKET
      this.closePosition = closePosition;                     // if Close-All
      this.symbol = symbol;
      this.time = time;                                       // order time
      this.timeInForce = timeInForce;
      this.type = type;
      this.activatePrice = activatePrice;                     // activation price, only return with TRAILING_STOP_MARKET order
      this.priceRate = priceRate;                             // callback rate,  only return with TRAILING_STOP_MARKET order
      this.updateTime = updateTime;                           // update time
      this.workingType = workingType
      this.priceProtect = priceProtect;                       // if conditional order trigger is protected  
      this.priceMatch = priceMatch;                           // price match mode
      this.selfTradePreventionMode = selfTradePreventionMode; // self trading preventation mode
      this.goodTillDate = goodTillDate;                       // order pre-set auot cancel time for TIF GTD order
   }
}

module.exports = FuturesOrder;
