const { Constant, Variable, BinaryOp, UnaryOp, Parser, Types, TreeToArray } = require(`./util/new/Zim`);
const { parse } = Parser;

function main() {
    const arr_exp = [
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
        "(6 * x + 9) / 3",
        "(x + 5) + 3 + (3 * x + 5)",
        "((1 / 2) * x) + ((1 / 3) * x)",
        "8 * x + 5 * y ^ 2 - 4 * y ^ 2 + 6 * x"
    ];

    for (let str of arr_exp) {
        let exp = parse(str);
        //console.log(exp)
        let simple = exp.simplify();
        //console.log(simple)
        console.log(`${str} => ${simple}`)
    }
}

main();