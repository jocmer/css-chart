function randArray(start, end, n) {
    var arr = [];

    for(var i = 0; i < n; i++) {
        arr.push(randNumberBetween(start, end));
    }

    return arr;

}

function randNumberBetween(start, end) {
    return Math.floor(Math.random() * ((end - start) + 1)) - end;
}