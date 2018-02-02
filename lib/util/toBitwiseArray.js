/*
    lib/util/index.js
    Utilities
*/

module.exports = function toBitwiseArray (intmask) {
    let bwarr = [];
    for (let x = 31; x >= 0; x--) {
        if ((intmask >> x) & 1 !== 0) {
            bwarr.push(Math.pow(2, x));
        }
    }
    return bwarr.reverse();
};
