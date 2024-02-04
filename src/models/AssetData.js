module.exports = class AssetData {
    constructor({
        filters
    }) {
        Object.entries(arguments[0] || {}).map(([key, item]) => this[key] = item);

        if (Array.isArray(filters)){
            this.filters = {};
            filters.map(filter => this.filters[filter.filterType] = filter);
        }
    }

    fixQuantity(value) {
        if (isNaN(value)) throw new Error('common.asset_data_normalize_number_is_NaN', value);
        const formattedNumber = new Intl.NumberFormat('en-US', {
            maximumFractionDigits: this.getQuantityDecimalPlaces(),
            useGrouping: false
        }).format(value);

        return Number(formattedNumber);
    }

    fixPrice(value) {
        if (isNaN(value)) return;
        const formattedNumber = new Intl.NumberFormat('en-US', {
            maximumFractionDigits: this.getPriceDecimalPlaces(),
            useGrouping: false
        }).format(value);

        return Number(formattedNumber);
    }

    getFilter(filterName, propName) {
        const filter = this.filters[filterName];
        const filterProp = filter && filter[propName];

        if (filterProp) {
            return {
                toNumber: () => {
                    if (isNaN(filterProp)) return null;
                    return Number(filterProp);
                },
                toString: () => String(filterProp || ''),
                value: filterProp
            };
        } else {
            return filter;
        }
    }

    getMinPrice() {
        return this.getFilter('PRICE_FILTER', 'minPrice').toNumber();
    }

    getPriceDecimalPlaces() {
        const stringMinPrice = this.getMinPrice().toString();
        const minPriceSplited = stringMinPrice.split('.');
        return minPriceSplited[1].length;
    }

    getQuantityDecimalPlaces() {
        return this.quantityPrecision;
    }
}
