const { Constant, Variable, BinaryOp, UnaryOp, Parser, Types, TreeToArray } = require(`./util/new/Zim`);
const { parse } = Parser;

function main() {
    /*
    const expression = new BinaryOp(
        new Variable('x'),
        new BinaryOp(
            new Constant(2),
            new BinaryOp(
                new Variable('x'),
                new Constant(3),
                "-"
            ),
            '+'
        ),
    '*');
    */

/*     const arr_exp = [
        "(2 + x) + 5",
        "(2 - x) + 5",
        "2 + (x + 3)",
        "2 + (x - 3)",
        "(x + 2) + 5",
        "(x - 2) + 5",
        "5 + (2 + x)",
        "5 + (2 - x)",
        "5 + (x + 2)",
        "5 + (x - 2)",
        "3 - (x + 2)",
        "3 - (x - 3)",
        "(x + 2) - 5",
        "(x - 2) - 5",
        "5 - (2 + x)",
        "5 - (2 - x)",
        "5 - (x + 2)",
        "5 - (x - 2)",
        "3 * (x * 2)",
        "(3 / x) * 2",
        "(x * 3) * 2",
        "(x / 3) * 2",
        "3 * (2 * x)",
        "3 * (2 / x)",
        "3 * (x * 2)",
        "3 * (x / 2)",
        "(3 * x) / 5",
        "(3 / x) / 5",
        "(x * 3) / 5",
        "(x / 3) / 5",
        "5 / (3 * x)",
        "5 / (3 / x)",
        "5 / (x * 3)",
        "5 / (x / 3)",
        "0 + x",
        "x + 0",
        "x + x",
        "0 - x",
        "x - 0",
        "x - x",
        "0 * x",
        "x * 0",
        "1 * x",
        "x * 1",
        "-1 * x",
        "x * -1",
        "x * x",
        "0 / x",
        //"x / 0",
        "x / 1",
        "x / -1",
        "x / x",
        "x ^ 0",
        "x ^ 1",
        "0 ^ x",
        "1 ^ x",
        "x mod 1",
        "0 mod x",
        //"x mod 0",
        "x mod x",
        "((5 - (x - 2)) + 3) * 10",
    ]; */
    const arr_exp = [
        "-1 * x",
        "x * -1",
        "x / -1",
        "(6 * x + 9) / 3",
        "(x + 5) + 3 + (3 * x + 5)"
    ]

    for (let str of arr_exp) {
        let exp = parse(str);
        //console.log(exp)
        console.log(`${str} => ${exp.simplify()}`)
    }

    //const expression = parse("2 + (x - 3)");
    //let expre = expression.simplify();

    //console.log(expre)
    //console.log(TreeToArray(expre));

    //console.log(expre.toString());
}

main();