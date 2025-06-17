const BinaryOp = require('./BinaryOp');
const { EQUATION_TYPES } = require('../types/Types');

class Equation extends BinaryOp {
    /**
     * Equation structure for representing equations.
     * Such as equals, not equals, greater than, less than, etc.
     * @param {Symbol} left
     * @param {Symbol} right
     * @param {EQUATION_TYPES} type
     */
    constructor(left, right, type = '=') {
        super(left, right, type);
    }

    solveFor(variable) {

    }

    eval(variable, value) {
        // TODO
    }

    simplify() {
        // TODO
    }

    toString() {
        return `${this.left.toString()} ${this.type} ${this.right.toString()}`
    }
}

module.exports = Equation;