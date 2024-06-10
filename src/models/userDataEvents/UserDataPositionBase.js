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
        return Boolean(position?.quantity === this.quantity);
    }
}

module.exports = UserDataPositionBase;
