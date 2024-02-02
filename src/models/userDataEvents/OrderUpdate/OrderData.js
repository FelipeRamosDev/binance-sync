/**
 * Represents data associated with an order.
 * @class OrderData
 */
class OrderData {
    /**
     * Creates an instance of OrderData.
     * @param {Object} setup - The setup object containing order data properties.
     * @param {string} setup.s - The symbol associated with the order.
     * @param {string} setup.c - The client order ID.
     * @param {string} setup.S - The order side (e.g., "BUY" or "SELL").
     * @param {string} setup.o - The order type.
     * @param {string} setup.f - The time in force for the order.
     * @param {number} setup.q - The original quantity of the order.
     * @param {number} setup.p - The original price of the order.
     * @param {number} setup.ap - The average price of the order.
     * @param {number} setup.sp - The stop price (ignore with TRAILING_STOP_MARKET order).
     * @param {string} setup.x - The execution type of the order.
     * @param {string} setup.X - The status of the order.
     * @param {number} setup.i - The order ID.
     * @param {number} setup.l - The last filled quantity of the order.
     * @param {number} setup.z - The accumulated filled quantity of the order.
     * @param {number} setup.L - The last filled price of the order.
     * @param {string} setup.N - The commission asset (will not push if no commission).
     * @param {number} setup.n - The commission (will not push if no commission).
     * @param {number} setup.T - The order trade time.
     * @param {number} setup.t - The trade ID.
     * @param {number} setup.b - The bid notional.
     * @param {number} setup.a - The ask notional.
     * @param {boolean} setup.m - Is this trade the maker side?
     * @param {boolean} setup.R - Is the order reduce-only?
     * @param {string} setup.wt - The working type of the order.
     * @param {string} setup.ot - The original order type.
     * @param {string} setup.ps - The position side.
     * @param {boolean} setup.cp - If Close-All (pushed with conditional order).
     * @param {number} setup.AP - The activation price (only pushed with TRAILING_STOP_MARKET order).
     * @param {number} setup.cr - The callback rate (only pushed with TRAILING_STOP_MARKET order).
     * @param {boolean} setup.pP - If price protection is turned on.
     * @param {string} setup.si - The stop price working type.
     * @param {string} setup.ss - The stop price status.
     * @param {number} setup.rp - The realized profit of the order.
     * @param {string} setup.V - The stop price mode.
     * @param {string} setup.pm - The price match mode.
     * @param {string} setup.gtd - The time in force for Good Till Date (GTD) orders.
     * @throws {Error} Throws an error if there is an issue during setup.
     */
    constructor(setup) {
        try {
            const { s, c, S, o, f, q, p, ap, sp, x, X, i, l, z, L, N, n, T, t, b, a, m, R, wt, ot, ps, cp, AP, cr, pP, si, ss, rp, V, pm, gtd } = Object(setup);

            /**
             * The symbol associated with the order.
             * @member {string}
             */
            this.symbol = s;

            /**
             * The client order ID.
             * @member {string}
             */
            this.clientOrderId = c;

            /**
             * The order side (e.g., "BUY" or "SELL").
             * @member {string}
             */
            this.side = S;

            /**
             * The order type.
             * @member {string}
             */
            this.orderType = o;

            /**
             * The time in force for the order.
             * @member {string}
             */
            this.timeInForce = f;

            /**
             * The original quantity of the order.
             * @member {number}
             */
            this.originalQuantity = Number(q);

            /**
             * The original price of the order.
             * @member {number}
             */
            this.originalPrice = Number(p);

            /**
             * The average price of the order.
             * @member {number}
             */
            this.averagePrice = Number(ap);

            /**
             * The stop price (ignore with TRAILING_STOP_MARKET order).
             * @member {number}
             */
            this.stopPrice = Number(sp);

            /**
             * The execution type of the order.
             * @member {string}
             */
            this.executionType = x;

            /**
             * The status of the order.
             * @member {string}
             */
            this.orderStatus = X;

            /**
             * The order ID.
             * @member {number}
             */
            this.orderId = Number(i);

            /**
             * The last filled quantity of the order.
             * @member {number}
             */
            this.orderLastFilledQty = Number(l);

            /**
             * The accumulated filled quantity of the order.
             * @member {number}
             */
            this.orderFilledAccumulatedQty = Number(z);

            /**
             * The last filled price of the order.
             * @member {number}
             */
            this.lastFilledPrice = Number(L);

            /**
             * The commission asset (will not push if no commission).
             * @member {string}
             */
            this.commissionAsset = N;

            /**
             * The commission (will not push if no commission).
             * @member {number}
             */
            this.commission = Number(n);

            /**
             * The order trade time.
             * @member {number}
             */
            this.orderTradeTime = T;

            /**
             * The trade ID.
             * @member {number}
             */
            this.tradeId = Number(t);

            /**
             * The bid notional.
             * @member {number}
             */
            this.bidNotional = Number(b);

            /**
             * The ask notional.
             * @member {number}
             */
            this.askNotional = Number(a);

            /**
             * Is this trade the maker side?
             * @member {boolean}
             */
            this.isTradeMarkerSide = m;

            /**
             * Is the order reduce-only?
             * @member {boolean}
             */
            this.isReduceOnly = R;

            /**
             * The working type of the order.
             * @member {string}
             */
            this.workingType = wt;

            /**
             * The original order type.
             * @member {string}
             */
            this.originalOrderType = ot;

            /**
             * The position side.
             * @member {string}
             */
            this.positionSide = ps;

            /**
             * If Close-All (pushed with conditional order).
             * @member {boolean}
             */
            this.closeAll = cp;

            /**
             * The activation price (only pushed with TRAILING_STOP_MARKET order).
             * @member {number}
             */
            this.activationPrice = Number(AP);

            /**
             * The callback rate (only pushed with TRAILING_STOP_MARKET order).
             * @member {number}
             */
            this.callbackRate = Number(cr);

            /**
             * If price protection is turned on.
             * @member {boolean}
             */
            this.isPriceProtected = pP;

            /**
             * The stop price working type.
             * @member {string}
             */
            this.si = si;

            /**
             * The stop price status.
             * @member {string}
             */
            this.ss = ss;

            /**
             * The realized profit of the order.
             * @member {number}
             */
            this.realizedProfit = Number(rp);

            /**
             * The stop price mode.
             * @member {string}
             */
            this.stpMode = V;

            /**
             * The price match mode.
             * @member {string}
             */
            this.priceMatchMode = pm;

            /**
             * The time in force for Good Till Date (GTD) orders.
             * @member {string}
             */
            this.gtd = gtd;

        } catch (err) {
            // Throws an error if there is an issue during setup.
            throw new Error.Log(err);
        }
    }

    toOrderLocal() {
        return {
            symbol: this.symbol,
            clientOrderId: this.clientOrderId,
            timeInForce: this.timeInForce,
            origQty: this.originalQuantity,
            avgPrice: this.averagePrice,
            stopPrice: this.stopPrice,
            status: this.orderStatus,
            orderId: this.orderId,
            reduceOnly: this.isReduceOnly,
            workingType: this.workingType,
            origType: this.originalOrderType,
            price: this.originalPrice,
            positionSide: this.positionSide,
            activationPrice: this.activationPrice,
            priceProtect: this.isPriceProtected,
            priceMatch: this.priceMatchMode,
            type: this.orderType
        };
    }
}

module.exports = OrderData;
