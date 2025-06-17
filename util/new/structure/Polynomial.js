const Variable = require("../types/Leafs/Variable");
const Symbol = require("./Symbol")

class Polynomial extends Symbol {
    /**
     * Structure for Polynomial Equations.
     * such as "x^2 + 1"
     * @param {Symbol} expression
     * @param {Variable} variable 
     */
    constructor(expression, variable) {
        super();
        this.expression = expression.simplify();
        this.variable = variable;
    }

    toString() {
        return this.expression.toString();
    }

    eval(variable, value) {
        return this.expression.eval(variable, value);
    }
}

module.exports = Polynomial;