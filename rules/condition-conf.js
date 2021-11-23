const log = require('../log')('condition-conf')
const operations = require('./operation-conf');
const items = require('../items/items')

class ConditionBuilder {
    constructor(builder, fn) {
        this.builder = builder
        this.fn = fn;
        if (fn) {
            this.builder.setCondition(new FunctionConditionConf(fn));
        }
    }

    _then(condition) {
        this.builder.setCondition(condition);
        return new operations.OperationBuilder(this.builder, fn);
    }

    then(fn) {
        if (!this.fn) {
            throw new Error("'then' can only be called when 'if' is passed a function")
        }
        return new operations.OperationBuilder(this.builder, fn);
    }

    /**
    * Condition of an item in determining whether to process rule.
    * 
    * @memberof fluent
    * @param {String} itemName the name of the item to assess the state
    * @returns {ItemStateConditionConf} the operation config
    */
    stateOfItem(s) {
        this.condition = new conditions.ItemStateConditionConf(s)
        return this.condition;
    }
}

class ConditionConf {
    constructor(condition) {
        this.condition = condition;
    }

    then(fn) {
        return this.condition._then(fn);
    }
}
/**
 * Condition that wraps a function to determine whether if passes
 * @memberof fluent
 * @hideconstructor
 */
class FunctionConditionConf extends ConditionConf {
    /**
     * Creates a new function condition. Don't call directly.
     * 
     * @param {*} fn callback which determines whether the condition passes
     */
    constructor(fn, condition) {
        super(condition);
        this.fn = fn;
    }

    /**
     * Checks whether the rule operations should be run
     * 
     * @private
     * @param  {...any} args rule trigger arguments
     * @returns {Boolean} true only if the operations should be run
     */
    check(...args) {
        let answer = this.fn(args);
        return answer;
    }
}

class ItemStateConditionConf extends ConditionConf {
    constructor(item_name, condition) {
        super(condition)
        this.item_name = item_name;
    }

    is(value) {
        this.values = [value];
        return this;
    }

    in(...values) {
        this.values = values;
        return this;
    }

    check(...args) {
        let item = items.getItem(this.item_name);
        if (typeof item === 'undefined' || item === null) {
            throw Error(`Cannot find item: ${this.item_name}`);
        }
        return this.values.includes(item.state);
    }
}

module.exports = {
    FunctionConditionConf,
    ItemStateConditionConf,
    ConditionBuilder
}