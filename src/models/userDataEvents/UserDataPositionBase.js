class UserDataPositionBase {
    constructor(setup) {
        const { positionAmt } = Object(setup);

        this.positionAmt = parseNum(positionAmt);
        if (this.quantity) {
            this.isOpened = true;
        } else {
            this.isOpened = false;
        }
    }

    get quantity() {
        return Math.abs(this.positionAmt);
    }

    isQtyMatch(position) {
        if (typeof position === 'object') {
            return Boolean(position?.quantity === this.quantity);
        } else if (typeof position === 'number') {
            return Boolean(position === this.quantity);
        }
    }
}

module.exports = UserDataPositionBase;
