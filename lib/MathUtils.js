//== MathUtils ==
export default class MathUtils {

    static rnd (lo, hi) {
        return parseInt(Math.floor(Math.random() * (hi - lo + 1)) + lo, 10);
    }

    static distance (x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    }
}
