const Symbol = require(`./Symbol`);
const { NARY_TYPES } = require(`../types/Types`);

const { ADD, MULTIPLY } = NARY_TYPES;

class NaryOp extends Symbol {
    /**
     * 
     * @param {NARY_TYPES} type 
     * @param {Array<Symbol>} arr 
     */
    constructor(type, arr) {
        super();
        this.type = type;
        this.arr = arr;
    }

    eval(variable, value) {
        switch (this.type) {
            case ADD: {

            }
            case MULTIPLY: {

            }
            default: throw new Error("Unknown Operator")
        }
    }
}

module.exports = NaryOp;