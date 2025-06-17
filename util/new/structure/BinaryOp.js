const Symbol = require('./Symbol');
const Constant = require('../types/leafs/Constant');
const UnaryOp = require('./UnaryOp');
const NaryOp = require(`./NaryOp`);
const Variable = require(`../types/Leafs/Variable`)
const { BINARY_TYPES, UNARY_TYPES } = require('../types/Types');

const { ADD, SUBTRACT, MULTIPLY, DIVIDE, POWER, MODULUS } = BINARY_TYPES;
const { NEGATE, ABSOLUTE, LOGARITHM, EXPONENTIAL } = UNARY_TYPES;

class BinaryOp extends Symbol {
    /**
     * Structure for binary operations.
     * such as addition, subtraction, multiplication, division, etc.
     * @param {Symbol} left 
     * @param {Symbol} right 
     * @param {BINARY_TYPES} type 
     */
    constructor(left, right, type) {
        super();
        this.type = type;
        this.left = left;
        this.right = right;
    }

    eval(variable, value) {
        switch (this.type) {
            case ADD:
                return this.left.eval(variable, value) + this.right.eval(variable, value);
            case SUBTRACT:
                return this.left.eval(variable, value) - this.right.eval(variable, value);
            case MULTIPLY:
                return this.left.eval(variable, value) * this.right.eval(variable, value);
            case DIVIDE:
                const rightEval = this.right.eval(variable, value);
                if (rightEval === 0) {
                    throw new Error('Division by zero');
                }
                return this.left.eval(variable, value) / rightEval;
            case POWER:
                return Math.pow(this.left.eval(variable, value), this.right.eval(variable, value));
            case MODULUS:
                return this.left.eval(variable, value) % this.right.eval(variable, value);
            default:
                throw new Error(`Unknown binary operation type: ${this.type}`);
        }
    }

    simplify() {
        let oldNode = this;
        let newNode;
        let unchanged = true;
        do {
            newNode = this.#fold_constants(oldNode);
            if (newNode.checkName("Constant")) return newNode;
            newNode = oldNode._peakFlatten();
            if (newNode.checkName("Constant")) return newNode;
            if (newNode.left != oldNode.left || newNode.right != oldNode.right) oldNode = newNode;
            newNode = this.#identityFold(oldNode);
            if (newNode.left != oldNode.left || newNode.right != oldNode.right) oldNode = newNode;
            newNode = this.#flatten(oldNode);
            if (newNode.checkName("NaryOp")) return newNode;
            if (newNode.left != oldNode.left || newNode.right != oldNode.right) oldNode = newNode;
            if (newNode.left == oldNode.left && newNode.right == oldNode.right) unchanged = false;
        } while (unchanged)

        return newNode;
    }

    toString() {
        return `(${this.left.toString()} ${this.type == MODULUS ? "mod" : this.type} ${this.right.toString()})`;
    }

    #constValue(node) {
        if (node.checkName("Constant")) return node.value;
        if (node.checkName("UnaryOp")) {
            const v = this.#constValue(node.operand);
            if (v === null) return null;

            switch (node.type) {
                case NEGATE: return -v;
                case ABSOLUTE: return Math.abs(v);
            }
        }
        return null;
    }

    #fold_constants(node) {
        if (node.right.checkName("BinaryOp")) {
            node.right = this.#fold_constants(node.right)
        }

        if (node.left.checkName("BinaryOp")) {
            node.left = this.#fold_constants(node.left)
        }

        const lv = this.#constValue(node.left);
        const rv = this.#constValue(node.right);

        if (lv !== null && rv !== null) {
            switch (node.type) {
                case ADD: return new Constant(lv + rv);
                case SUBTRACT: return new Constant(lv - rv);
                case MULTIPLY: return new Constant(lv * rv);
                case DIVIDE:
                    if (rv === 0) return node;
                    return new Constant(lv / rv);
                case MODULUS:
                    if (rv === 0) return node;
                    return new Constant(lv % rv);
                case POWER: return new Constant(Math.pow(lv, rv));
                default: return node;
            }
        }
        return node;
    }

    /**
     * @returns {Symbol}
     */
    _peakFlatten() {
        const bin = (l, r, t) => new BinaryOp(l, r, t);
        const uni = (op, t) => new UnaryOp(op, t);
        const neg = (op) => uni(op, NEGATE)

        let lv = this.#constValue(this.left);
        let rv = this.#constValue(this.right);
        if (lv == null && rv == null) {
            let nr = this.right;
            let nl = this.left;
            if (this.right.checkName("BinaryOp")) {
                nr = this.right._peakFlatten();
            }

            if (this.left.checkName("BinaryOp")) {
                nl = this.left._peakFlatten();
            }
            return new BinaryOp(nl, nr, this.type)
        } // If Both values are not constant, cannot flatten

        lv = lv == null ? this.#flatCheck(this.left) : new Constant(lv);
        rv = rv == null ? this.#flatCheck(this.right) : new Constant(rv);

        if (lv !== null && rv !== null) {
            switch (this.type) {
                case ADD: {
                    // 2 + (x + 3) => (x + 5) || 2 + (x - 3) => (x - 1)
                    if (lv.type == ADD || lv.type == SUBTRACT) {
                        // (2 + x) + 5 => (2 + 5) + x => 7 + x || (2 - x) + 5 => (2 + 5) - x => 7 - x
                        if (lv.left.checkName("Constant")) {
                            let nv = lv.left.value + rv.value;
                            if (nv == 0) return (lv.type == SUBTRACT ? neg(lv.right) : lv.right);
                            return bin(new Constant(nv), lv.right, lv.type);
                        }
                        // (x + 2) + 5 => x + (2 + 5) => x + 7 || (x - 2) + 5 => x + (5 - 2) => x + 3
                        if (lv.right.checkName("Constant")) {
                            let nv = lv.type == SUBTRACT ? rv.value - lv.right.value : lv.right.value + rv.value;
                            if (nv == 0) return lv.left;
                            if (nv > 0) return bin(lv.left, new Constant(nv), ADD);
                            if (nv < 0) return bin(lv.left, new Constant(-nv), SUBTRACT);
                        }
                    }

                    if (rv.type == ADD || rv.type == SUBTRACT) {
                        // 5 + (2 + x) => (5 + 2) + x => 7 + x || 5 + (2 - x) => (5 + 2) - x => 7 - x
                        if (rv.left.checkName("Constant")) {
                            let nv = rv.left.value + lv.value;
                            if (nv == 0) return (rv.type == SUBTRACT ? neg(rv.right) : rv.right);
                            return bin(new Constant(nv), rv.right, rv.type)

                        }
                        // 5 + (x + 2) => (5 + 2) + x => 7 + x || 5 + (x - 2) => (5 - 2) + x => 3 + x
                        if (rv.right.checkName("Constant")) {
                            let nv = rv.type == SUBTRACT ? lv.value - rv.right.value : rv.right.value + lv.value;
                            if (nv == 0) return rv.left;
                            if (nv > 0) return bin(rv.left, new Constant(nv), ADD);
                            if (nv < 0) return bin(rv.left, new Constant(-nv), SUBTRACT);
                        }
                    }
                    return this;
                }
                case SUBTRACT: {
                    // 3 - (x + 2) => (-x + 1) || 3 - (x - 3) => (-x + 6)
                    if (lv?.type == ADD || lv?.type == SUBTRACT) {
                        // (2 + x) - 5 => x + (2 - 5) => x - 3 || (2 - x) - 5 => (2 - 5) - x => -x - 3
                        if (lv.left.checkName("Constant")) {
                            let nv = lv.left.value - rv.value;
                            let nr = lv.type == SUBTRACT ? neg(lv.right) : lv.right;
                            if (nv == 0) return nr;
                            if (nv > 0) return bin(new Constant(nv), nr, ADD);
                            if (nv < 0) return bin(nr, new Constant(-nv), SUBTRACT);
                        }
                        // (x + 2) - 5 => x + (2 - 5) => x - 3 || (x - 2) - 5 => x + (-2 - 5) => x - 7
                        if (lv.right.checkName("Constant")) {
                            let nv = lv.type == SUBTRACT ? -lv.right.value - rv.value : lv.right.value - rv.value;
                            if (nv == 0) return lv.left;
                            if (nv > 0) return bin(lv.left, new Constant(nv), ADD);
                            if (nv < 0) return bin(lv.left, new Constant(-nv), SUBTRACT);
                        }
                    }

                    if (rv?.type == ADD || rv?.type == SUBTRACT) {
                        // 5 - (2 + x) => (5 - 2) - x => 3 - x || 5 - (2 - x) => (5 - 2) + x => 3 + x
                        if (rv.left.checkName("Constant")) {
                            let nv = lv.value - rv.left.value;
                            if (nv == 0) return rv.type == SUBTRACT ? rv.right : neg(rv.right);
                            return bin(new Constant(nv), rv.right, rv.type == SUBTRACT ? ADD : SUBTRACT);
                        }
                        // 5 - (x + 2) => (5 - 2) - x => 3 - x || 5 - (x - 2) => (5 + 2) - x => 7 - x
                        if (rv.right.checkName("Constant")) {
                            let nv = rv.type == SUBTRACT ? rv.right.value + lv.value : lv.value - rv.right.value;
                            if (nv == 0) return neg(rv.left);
                            return bin(new Constant(nv), rv.left, SUBTRACT);
                        }
                    }
                    return this;
                }
                case MULTIPLY: {
                    // 3 * (x * 2) => 6 * x || 3 * (x / 3) => x
                    if (lv?.type == MULTIPLY || lv?.type == DIVIDE) {
                        // (3 * x) * 2 => (3 * 2) * x => 6 * x || (3 / x) * 2 => (3 * 2) / x => 6 / x
                        if (lv.left.checkName("Constant")) {
                            let nv = lv.left.value * rv.value;
                            if (nv == 0) return new Constant(0);
                            if (lv.type == MULTIPLY) {
                                if (nv == 1) return lv.right;
                                return bin(new Constant(nv), lv.right, MULTIPLY);
                            } else {
                                return bin(new Constant(nv), lv.right, DIVIDE);
                            }
                        }
                        // (x * 3) * 2 => (3 * 2) * x => 6 * x || (x / 3) * 2 => (2 / 3) * x
                        if (lv.right.checkName("Constant")) {
                            let nv;
                            if (lv.type == MULTIPLY) {
                                nv = lv.right.value * rv.value;
                            } else {
                                if (lv.right.value == 0) throw new Error("Division by Zero");
                                nv = rv.value / lv.right.value;
                            }
                            if (nv == 0) return new Constant(0);
                            if (nv == 1) return lv.left;
                            return bin(new Constant(nv), lv.left, MULTIPLY);
                        }
                    }

                    if (rv?.type == MULTIPLY || rv?.type == DIVIDE) {
                        // 3 * (2 * x) => (3 * 2) * x => 6 * x || 3 * (2 / x) => (3 * 2) / x => 6 / x
                        if (rv.left.checkName("Constant")) {
                            let nv = rv.left.value * lv.value;
                            if (nv == 0) return new Constant(0);
                            if (rv.type == MULTIPLY) {
                                if (nv == 1) return rv.right;
                                return bin(new Constant(nv), rv.right, MULTIPLY);
                            } else {
                                return bin(new Constant(nv), rv.right, DIVIDE);
                            }
                        }
                        // 3 * (x * 2) => (3 * 2) * x => 6 * x || 3 * (x / 2) => (3 / 2) * x
                        if (rv.right.checkName("Constant")) {
                            let nv;
                            if (rv.type == MULTIPLY) {
                                nv = rv.right.value * lv.value;
                            } else {
                                if (rv.right.value == 0) throw new Error("Division by Zero");
                                nv = lv.value / rv.right.value;
                            }
                            if (nv == 0) return new Constant(0);
                            if (nv == 1) return rv.left;
                            return bin(new Constant(nv), rv.left, MULTIPLY);
                        }
                    }

                    return this;
                }
                case DIVIDE: {
                    // 6 / (x * 3) => (2 / x) || 3 / (x / 3) => (9 / x)
                    if (lv?.type == DIVIDE || lv?.type == MULTIPLY) {
                        // (3 * x) / 5 => (3 / 5) * x || (3 / x) / 5 => (3 / 5) / x
                        if (lv.left.checkName("Constant")) {
                            if (rv.value == 0) throw new Error("Division by Zero");
                            let nv = lv.left.value / rv.value;
                            if (nv == 0) return new Constant(0);
                            if (lv.type == MULTIPLY) {
                                if (nv == 1) return lv.right;
                                return bin(new Constant(nv), lv.right, MULTIPLY);
                            } else {
                                return bin(new Constant(nv), lv.right, DIVIDE);
                            }
                        }
                        // (x * 3) / 5 => (3 / 5) * x || (x / 3) / 5 => x / (3 * 5)
                        if (lv.right.checkName("Constant")) {
                            let nv;
                            if (lv.type == MULTIPLY) {
                                if (rv.value == 0) throw new Error("Division by Zero");
                                nv = lv.right.value / rv.value;
                                if (nv == 0) return new Constant(0);
                                if (nv == 1) return lv.left;
                                return bin(new Constant(nv), lv.left, MULTIPLY);
                            } else {
                                nv = lv.right.value * rv.value;
                                if (nv == 0) throw new Error("Division by Zero");
                                if (nv == 1) return lv.left;
                                return bin(lv.left, new Constant(nv), DIVIDE);
                            }
                        }
                    }

                    if (rv?.type == DIVIDE || rv?.type == MULTIPLY) {
                        // 5 / (3 * x) => (5 / 3) / x || 5 / (3 / x) => (5 / 3) * x
                        if (rv.left.checkName("Constant")) {
                            if (rv.left.value == 0) throw new Error("Division by Zero");
                            let nv = lv.value / rv.left.value;
                            if (nv == 0) return new Constant(0);
                            if (rv.type == MULTIPLY) {
                                return bin(new Constant(nv), rv.right, DIVIDE);
                            } else {
                                if (nv == 1) return rv.right;
                                return bin(new Constant(nv), rv.right, MULTIPLY);
                            }
                        }
                        // 5 / (x * 3) => (5 / 3) / x || 5 / (x / 3) => (5 * 3) / x
                        if (rv.right.checkName("Constant")) {
                            let nv;
                            if (rv.type == MULTIPLY) {
                                if (rv.right.value == 0) throw new Error("Division by Zero");
                                nv = lv.value / rv.right.value;
                                if (nv == 0) return new Constant(0);
                                return bin(new Constant(nv), rv.left, DIVIDE);
                            } else {
                                nv = lv.value * rv.right.value;
                                if (nv == 0) return new Constant(0);
                                return bin(new Constant(nv), rv.left, DIVIDE);
                            }
                        }
                    }

                    return this;
                }
                default: return this
            }
        }

        return this
    }

    #flatCheck(node) {
        if (Symbol.typeOf(node) == "BinaryOp") {
            if (node.type == MODULUS || node.type == POWER) return null;
            return node;
        }

        return null;
    }

    /**
     * 
     * @param {BinaryOp} node 
     * @returns 
     */
    #identityFold(node) {
        const isZero = (node) => node.checkName("Constant") && node?.value == 0;
        const isOne = (node) => node.checkName("Constant") && node?.value == 1;
        const isNOne = (node) => (node.checkName("Constant") && node?.value == -1) || (node.checkName("UnaryOp") && node?.type == NEGATE && node?.operand == 1);
        const isVar = (node) => node.checkName("Variable")
        const ConstorVar = (node) => {
            if (this.#constValue(node) != null) return new Constant(this.#constValue(node));
            if (isVar(node)) return node;
            return null;
        }

        let rnode = node.right;
        let lnode = node.left;

        if (ConstorVar(node.right) == null && ConstorVar(node.left) == null) {
            let nr = rnode;
            let nl = lnode;
            if (rnode.checkName("BinaryOp")) {
                nr = this.#identityFold(rnode);
            }

            if (lnode.checkName("BinaryOp")) {
                nl = this.#identityFold(lnode);
            }
            return new BinaryOp(nr, nl, node.type);
        }

        switch (node.type) {
            case ADD: {
                // 0 + x => x || x + 0 => x
                if (isZero(lnode)) return rnode;
                if (isZero(rnode)) return lnode;
                // x + x => 2 * x
                if (isVar(rnode) && isVar(lnode) && rnode?.value == lnode?.value) return new BinaryOp(new Constant(2), rnode, MULTIPLY);
                return node;
            }
            case SUBTRACT: {
                // 0 - x => -x
                if (isZero(lnode)) return new UnaryOp(rnode, NEGATE);
                // x - 0 => x
                if (isZero(rnode)) return lnode;
                // x - x => 0
                if (isVar(rnode) && isVar(lnode) && rnode?.value == lnode?.value) return new Constant(0);
                return node;
            }
            case MULTIPLY: {
                // 0 * x => 0 || x * 0 => 0
                if (isZero(rnode) || isZero(lnode)) return new Constant(0);
                // 1 * x => x || x * 1 => x
                if (isOne(rnode)) return lnode;
                if (isOne(lnode)) return rnode;
                // -1 * x => -x || x * -1 => -x
                if (isNOne(rnode)) return new UnaryOp(lnode, NEGATE);
                if (isNOne(lnode)) return new UnaryOp(rnode, NEGATE);
                // x * x => x ^ 2
                if (isVar(rnode) && isVar(lnode) && rnode?.value == lnode?.value) return new BinaryOp(rnode, new Constant(2), POWER);
                return node;
            }
            case DIVIDE: {
                // 0 / x => 0
                if (isZero(lnode)) return new Constant(0);
                // x / 0 => error
                if (isZero(rnode)) throw new Error("Division by Zero")
                // x / 1 => x
                if (isOne(rnode)) return lnode;
                // x / -1 => -x
                if (isNOne(rnode)) return new UnaryOp(lnode, NEGATE);
                // x / x => 1
                if (isVar(rnode) && isVar(lnode) && rnode?.value == lnode?.value) return new Constant(1);
                return node;
            }
            case POWER: {
                // x ^ 0 => 1
                if (isZero(rnode)) return new Constant(1);
                // x ^ 1 => x
                if (isOne(rnode)) return lnode;
                // 0 ^ x => 0
                if (isZero(lnode)) return new Constant(0);
                // 1 ^ x => 1
                if (isOne(lnode)) return new Constant(1);
                return node;
            }
            case MODULUS: {
                // x mod 1 => 0
                if (isOne(rnode)) return new Constant(0);
                // 0 mod x => 0
                if (isZero(lnode)) return new Constant(0);
                // x mod 0 => error
                if (isZero(rnode)) throw new Error("Mod by zero is undefined");
                // x mod x => 0
                if (isVar(rnode) && isVar(lnode) && rnode?.value == lnode?.value) return new Constant(0);
                return node;
            }
            default: return node;
        }
    }

    #flatten(node) {
        const isVar = (node) => node.checkName("Variable")
        const ConstorVar = (node) => {
            if (this.#constValue(node) != null) return new Constant(this.#constValue(node));
            if (isVar(node)) return node;
            return null;
        }

        if (node.type != ADD && node.type != MULTIPLY) return node; // Return if node is not add or multiply
        let add_arr = [];
        this.#gather(node, add_arr, ADD);
        let addOp = new NaryOp(ADD, add_arr);
        //console.log(addOp)
        this.#combineTerms(addOp);
        return addOp;

        //let mul_arr = [];
        //this.#gather(node, mul_arr, MULTIPLY)
        //let mulOp = new NaryOp(MULTIPLY, mul_arr);
    }

    /**
     * @param {NaryOp} addOp 
     * @param {NaryOp} mulOp 
     */
    #combineTerms(addOp) {
        let constSum = 0;
        let coeffs = new Map();
        let left = []
        const mapInp = (key, constant) => {
            if (coeffs.has(key)) {
                coeffs.set(key, coeffs.get(key) + constant)
            } else coeffs.set(key, constant)
        }

        for (let val of addOp.arr) {
            // Any Constamt terms getting added up including |3| and -3
            if (val.checkName("Constant")) {
                constSum += val.value;
            } else if (val.checkName("UnaryOp") && val?.operand.checkName("Constant") && val?.type == NEGATE) {
                constSum += -val.operand.value;
            } else if (val.checkName("UnaryOp") && val?.operand.checkName("Constant") && val?.type == ABSOLUTE) {
                constSum += Math.abs(val.operand.value);

                // Checking Variable Terms [x]
            } else if (val.checkName("Variable")) {
                mapInp(val.value, 1);

                // Checking Multiplication of term [3x || x * 3 || 3x^2]
            } else if (val.checkName("BinaryOp") && val?.type == MULTIPLY) {
                let rv = this.#constValue(val.right);
                let lv = this.#constValue(val.left);

                if (lv == null && rv == null) {
                    left.push(val);
                    continue;
                }

                if (lv != null || rv != null) {
                    let cons = rv == null ? val.left : val.right;
                    let exp = rv == null ? val.right : val.left;

                    // 3x || x * 3
                    if (exp.checkName("Variable")) {
                        mapInp(exp.value, cons)

                        // 3x^2 || x^2 * 3
                    } else if (exp.checkName("BinaryOp") && exp?.type == POWER) {
                        if (exp.left.checkName("Variable")) {
                            let key_string = `${exp.left.value} - ${exp.right.toString()}`
                            let map_val = {
                                count: coeffs.get(key_string) == undefined ? cons : coeffs.get(key_string).count + cons,
                                obj: exp
                            }
                            coeffs.set(key_string, map_val)
                        }
                    } else left.push(val);

                } else left.push(val);
            } else left.push(val);

        }
        // End of Loop

        let new_arr = [];
        for (let [key, value] of coeffs) {
            if (value instanceof Object && value?.count != undefined) {
                let { count, obj } = value;
                if (count == 0) continue;
                let term = count == 1 ? obj : (new BinaryOp(new Constant(count), obj, MULTIPLY));
                new_arr.push(term);
            } else {
                if (value == 0) continue;
                let term = value == 1 ? (new Variable(key)) : (new BinaryOp(new Constant(value), new Variable(key), MULTIPLY));
                new_arr.push(term);
            }
        }
        if (constSum != 0) new_arr.push(new Constant(constSum));
        new_arr.concat(left);

        addOp.arr = new_arr;
        return addOp;
    }

    #gather(node, parts, type) {
        // (2 + (2 + (2 + (2 + x))))
        if (node.checkName("BinaryOp") && node?.type == type) {
            this.#gather(node.left, parts, type);
            this.#gather(node.right, parts, type);
        } else {
            parts.push(node);
        }
    }

}

module.exports = BinaryOp;