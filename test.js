let main = () => {
    const con = { h: 1, g: 2 };
    test(con)
    console.log(con);
}

function test(con) {
    con.h += 5;
    return con;
}

main()