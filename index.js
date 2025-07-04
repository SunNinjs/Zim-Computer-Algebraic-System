const { Constant, Variable, BinaryOp, UnaryOp, Parser, Types, TreeToArray } = require(`./util/new/Zim`);
const { parse } = Parser;

function main() {
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
            "(6 * x + 9) / 3",
            "(x + 5) + 3 + (3 * x + 5)",
            "((1 / 2) * x) + ((1 / 3) * x)",
            "8 * x + 5 * y - 6 * y + 6 * x",
            "(5 / x) + (10 / y)"
        ]; */

    const arr_exp = [
        "2 * (3 - x) - 6 = -5 * x",
        "7 + (9 * x) = (7 * x) + 3",
        "-2 * (4 + 3 * x) = -2 * (4 + x)",
        "-7 + 4 * x = 7 * x + 6",
        "5 * (1 + x) = -9 * x + 6",
        "3 + x = 2 * (2 * x - 1)",
        "-2 - 4 * x = 7 * x - 8",
        "-6 * (1 - x) = 9 - 2 * x",
        "-2 * x - 3 = -2 * (2 * x + 1)",
        "6 * x + 7 = 2 * x + 5",
        "2 * (3 * x - 2) + 9 = -5 * x",
        "3 * (1 + x) = -5 * (x + 1)",
        "3 * (1 - 3 * x) = -7 + x",
        "1 + 2 * x = 4 * x + 9",
        "2 * x + 6 = 3 * x + 1",
        "5 * x - 2 = -9 * x + 8",
        "6 * x - 5 = -9 * x - 9",
        "-1 + 3 * x = -7 - 6 * x",
        "2 + x = 7 + 6 * x",
        "-6 * x + 1 = -2 + 7 * x",
    ]

    for (let str of arr_exp) {
        let exp = parse(str);
        //console.log(exp)
        //console.log(simple)
        console.log(`${exp} => x = ${exp?.solveFor("x")}`) // .simplify()
    }
}

main();