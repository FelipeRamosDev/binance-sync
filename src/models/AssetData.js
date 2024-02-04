/**
 * AssetData class for managing asset data.
 */
class AssetData {
    /**
     * Constructs a new AssetData instance.
     * @param {Object} setup - The setup props.
     * @param {Object} setup.filters - The filters for the AssetData.
     */
    constructor(setup) {
        const { filters } = Object(setup);
        Object.entries(arguments[0] || {}).map(([key, item]) => this[key] = item);

        if (Array.isArray(filters)){
            this.filters = {};
            filters.map(filter => this.filters[filter.filterType] = filter);
        }
    }

    /**
     * Fixes the quantity value.
     * @param {number} value - The value to be fixed.
     * @returns {number} The fixed value.
     * @throws {Error} If the value is not a number.
     */
    fixQuantity(value) {
        if (isNaN(value)) throw new Error('common.asset_data_normalize_number_is_NaN', value);
        const formattedNumber = new Intl.NumberFormat('en-US', {
            maximumFractionDigits: this.getQuantityDecimalPlaces(),
            useGrouping: false
        }).format(value);

        return Number(formattedNumber);
    }

    /**
     * Fixes the price value.
     * @param {number} value - The value to be fixed.
     * @returns {number} The fixed value.
     */
    fixPrice(value) {
        if (isNaN(value)) return;
        const formattedNumber = new Intl.NumberFormat('en-US', {
            maximumFractionDigits: this.getPriceDecimalPlaces(),
            useGrouping: false
        }).format(value);

        return Number(formattedNumber);
    }

    /**
     * Gets the filter.
     * @param {string} filterName - The name of the filter.
     * @param {string} propName - The name of the property.
     * @returns {Object} The filter.
     */
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

    /**
     * Gets the minimum price.
     * @returns {number} The minimum price.
     */
    getMinPrice() {
        return this.getFilter('PRICE_FILTER', 'minPrice').toNumber();
    }

    /**
     * Gets the decimal places of the price.
     * @returns {number} The decimal places of the price.
     */
    getPriceDecimalPlaces() {
        const stringMinPrice = this.getMinPrice().toString();
        const minPriceSplited = stringMinPrice.split('.');
        return minPriceSplited[1].length;
    }

    /**
     * Gets the decimal places of the quantity.
     * @returns {number} The decimal places of the quantity.
     */
    getQuantityDecimalPlaces() {
        return this.quantityPrecision;
    }
}

module.exports = AssetData;
