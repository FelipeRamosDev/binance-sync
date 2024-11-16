class SymbolTickStatistics {
   constructor(setup) {
      const {
         symbol,
         priceChange,
         priceChangePercent,
         weightedAvgPrice,
         lastPrice,
         lastQty,
         openPrice,
         highPrice,
         lowPrice,
         volume,
         quoteVolume,
         openTime,
         closeTime,
         firstId,
         lastId,
         count
      } = Object(setup);

      this.symbol = symbol; // "VETUSDT";
      this.priceChange = Number(priceChange); // "0.000265";
      this.priceChangePercent = Number(priceChangePercent); // "1.203";
      this.weightedAvgPrice = Number(weightedAvgPrice); // "0.022024";
      this.lastPrice = Number(lastPrice); // "0.022294";
      this.lastQty = Number(lastQty); // "638";
      this.openPrice = Number(openPrice); // "0.022029";
      this.highPrice = Number(highPrice); // "0.022566";
      this.lowPrice = Number(lowPrice); // "0.021483";
      this.volume = Number(volume); // "676325661";
      this.quoteVolume = Number(quoteVolume); // "14895260.949505";
      this.openTime = openTime; // 1731025860000;
      this.closeTime = closeTime; // 1731112284251;
      this.firstId = firstId; // 385059446;
      this.lastId = lastId; // 385192205;
      this.count = count; // 132760;
   }
}

module.exports = SymbolTickStatistics;
