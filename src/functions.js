"use strict";

const FUNCTIONS = new Map();
export default FUNCTIONS;

/// **P**ushes a number or string on the stack.
/// - `p173` pushes the number 173 on the stack
/// - `p"Hello"` pushes the string "Hello" on the stack
FUNCTIONS.set("p", (signal, x, y, grid) => {
    if (grid.getChar(x + 1, y) == "\"") {
        let str = "";
        let offset = 2;
        while (grid.getChar(x + offset, y) != "\"") {
            str += grid.getChar(x + offset, y);
            offset += 1;
        }
        signal.push(str);
        return offset + 1;
    } else if (/^[0-9\-\.]$/.exec(grid.getChar(x + 1, y))) {
        let str = "";
        let offset = 1;
        if (grid.getChar(x + 1, y) == "-") {
            str = "-";
            offset = 2;
        }
        while (/^[0-9\.]$/.exec(grid.getChar(x + offset, y))) {
            str += grid.getChar(x + offset, y);
            offset += 1;
        }
        signal.push(+str);
        return offset;
    }
});

/// P**o**ps a value from the top of the stack, discarding it
FUNCTIONS.set("o", (signal) => {
    signal.pop();
});

export function withNumericalInput(x, y, grid, callback) {
    if (/^[0-9\.\-]$/.exec(grid.getChar(x + 1, y))) {
        let str = "";
        let offset = 1;
        if (grid.getChar(x + 1, y) == "-") {
            str = "-";
            offset = 2;
        }
        while (/^[0-9\.]$/.exec(grid.getChar(x + offset, y))) {
            str += grid.getChar(x + offset, y);
            offset += 1;
        }

        return offset + (callback(str) ?? 0);
    } else {
        return callback();
    }
}

/// **D**uplicates an element from the stack. Accepts an optional number to specify which element from the stack to pop:
/// - `d` duplicates the last element of the stack (`[1, 2, 3]` -> `[1, 2, 3, 3]`), it acts the same as `d0`
/// - `d2` duplicates the 3rd element from the top of the stack (`[1, 2, 3]` -> `[1, 2, 3, 1]`)
FUNCTIONS.set("d", (signal, x, y, grid) => {
    return withNumericalInput(x, y, grid, (str) => {
        if (str) {
            signal.push(signal.peek(+str));
        } else {
            signal.push(signal.peek());
        }
    });
});

/// Rotate clockwise the last N values of the stack. By default, `N=3`, but this can be overridden by specifying
/// a number after "[". This is equivalent to removing the `N-1`-th element from the top of the stack and pushing it
/// back. If `N > signal.length`, does nothing.
FUNCTIONS.set("[", (signal, x, y, grid) => {
    return withNumericalInput(x, y, grid, (str) => {
        let offset = 3;
        if (str && Number.isInteger(+str) && +str > 0) {
            offset = +str;
        }

        if (offset <= signal.length) {
            let [value] = signal.stack.splice(signal.stack.length - offset, 1);
            signal.push(value);
        }
    });
});

/// Rotate anti-clockwise the last N values of the stack. By default, `N=3`, but this can be overridden by specifying
/// a number after "]". This is equivalent to popping the stack and placing that inserting that value after the `N`-th
/// element from the top of the stack. If `N > signal.length`, does nothing.
FUNCTIONS.set("]", (signal, x, y, grid) => {
    return withNumericalInput(x, y, grid, (str) => {
        let offset = 3;
        if (str && Number.isInteger(+str) && +str > 0) {
            offset = +str;
        }

        if (offset <= signal.length) {
            signal.stack.splice(signal.stack.length - offset, 0, signal.pop());
        }
    });
});

/// "Trims" the stack, removing the top N items, with N being either specified after `T` or popped from the stack.
/// If N isn't an integer or is less than 0, does nothing.
FUNCTIONS.set("T", (signal, x, y, grid) => {
    return withNumericalInput(x, y, grid, (str) => {
        let number;
        if (str) {
            number = +str;
        } else {
            number = signal.pop();
        }

        if (Number.isInteger(number) && number >= 0) {
            signal.trim(number);
        }
    });
});

/// "Keeps" the top N items of the stack, with N being either specified after `K` or popped from the stack.
/// If N isn't an integer or is less than 0, does nothing.
FUNCTIONS.set("K", (signal, x, y, grid) => {
    return withNumericalInput(x, y, grid, (str) => {
        let number;
        if (str) {
            number = +str;
        } else {
            number = signal.pop();
        }

        if (Number.isInteger(number) && number >= 0) {
            signal.keep(number);
        }
    });
});

/// Pushes a **r**andom value on the stack. Accepts an optional number to specify the upper bound of the
/// uniform distribution.
FUNCTIONS.set("R", (signal, x, y, grid) => {
    return withNumericalInput(x, y, grid, (str) => {
        if (str) {
            signal.push(Math.random() * +str);
        } else {
            signal.push(Math.random());
        }
    });
});

/// **F**loors the topmost element of the stack. Accepts an optional number to specify the precision:
/// - `f` rounds to the nearest integer (`[1.4]` -> `[1.0]`, `[2.83]` -> `[2.0]`)
/// - `f1` rounds to the nearest tenth (`[1.4]` -> `[1.4]`, `[2.83]` -> `[2.8]`)
FUNCTIONS.set("f", (signal, x, y, grid) => {
    return withNumericalInput(x, y, grid, (str) => {
        if (str) {
            let precision = Math.pow(10, -Math.floor(+str));
            signal.push(Math.floor(+signal.pop() / precision) * precision);
        } else {
            signal.push(Math.floor(+signal.pop()));
        }
    });
});

/// **C**eils the topmost element of the stack. Accepts an optional number to specify the precision:
/// - `c` rounds to the nearest integer (`[1.4]` -> `[2.0]`, `[2.83]` -> `[3.0]`)
/// - `c1` rounds to the nearest tenth (`[1.4]` -> `[1.4]`, `[2.83]` -> `[2.9]`)
FUNCTIONS.set("c", (signal, x, y, grid) => {
    return withNumericalInput(x, y, grid, (str) => {
        if (str) {
            let precision = Math.pow(10, -Math.floor(+str));
            signal.push(Math.ceil(+signal.pop() / precision) * precision);
        } else {
            signal.push(Math.ceil(+signal.pop()));
        }
    });
});

/// **R**ounds the topmost element of the stack. Accepts an optional number to specify the precision:
/// - `r` rounds to the nearest integer (`[1.4]` -> `[1.0]`, `[2.83]` -> `[3.0]`)
/// - `r1` rounds to the nearest tenth (`[1.4]` -> `[1.4]`, `[2.83]` -> `[2.8]`)
FUNCTIONS.set("r", (signal, x, y, grid) => {
    return withNumericalInput(x, y, grid, (str) => {
        if (str) {
            let precision = Math.pow(10, -Math.floor(+str));
            signal.push(Math.round(+signal.pop() / precision) * precision);
        } else {
            signal.push(Math.round(+signal.pop()));
        }
    });
});

/// Sums the last two values from the stack:
/// `[1, 2, 3]` -> `[1, 5]`; `[0, 2, -1]` -> `[0, 1]`
FUNCTIONS.set("+", (signal) => {
    let right = signal.pop();
    let left = signal.pop();
    signal.push(left + right);
});

/// Calculates the difference between the last two values from the stack:
/// `[1, 2, 3]` -> `[1, -1]`; `[1, 3, 2]` -> `[1, 1]`
FUNCTIONS.set("-", (signal) => {
    let right = signal.pop();
    let left = signal.pop();
    signal.push(left - right);
});

/// Calculates the product of the last two values of the stack:
/// `[1, 2, 3]` -> `[1, 6]`; `[1, 3, -5]` -> `[1, -15]`
///
/// If the left operand is a string and the right operand is a number,
/// then the `left` is repeated `right` times and pushed back onto the stack.
/// If `right` isn't an integer, then `left` is simply pushed back onto the stack.
FUNCTIONS.set("*", (signal) => {
    let right = signal.pop();
    let left = signal.pop();
    if (typeof left === "string" && typeof right === "number") {
        if (Number.isInteger(right)) {
            signal.push(left.repeat(right));
        } else {
            signal.push(left);
        }
    } else {
        signal.push(left * right);
    }
});

/// Calculates the division between the last two values of the stack:
/// `[1, 3, 2]` -> `[1, 1.5]`; `[2, 5]` -> `[0.4]
///
/// If the division results in an infinite value or NaN, pushes `0` instead.
///
/// If the left value is a string and the right value is a integer, then, depending on the sign of the number:
/// - for positive values, only keeps the first `right` characters
/// - for negative values, only keeps the last `right` characters
/// The feature set of `String::slice` can be emulated with two `/` operations and, if needed, `l` and `-`.
FUNCTIONS.set("/", (signal) => {
    let right = signal.pop();
    let left = signal.pop();
    if (typeof left === "string" && Number.isInteger(right)) {
        if (right < 0) {
            signal.push(left.slice(right));
        } else {
            signal.push(left.slice(0, right));
        }
    } else if (typeof left === "string" && typeof right === "string") {
        signal.push(left.indexOf(right));
    } else if (typeof left === "number" && typeof right === "number") {
        let res = left / right;
        if (isNaN(res) || !Number.isFinite(res)) {
            signal.push(0);
        } else {
            signal.push(res);
        }
    }
});

/// Calculates the remainder between the last two values of the stack:
/// `[7, 3]` -> `[1]`
///
/// If the left operand is a string and the right operand is a number,
/// then the `right`-th character from `left` is pushed back on the stack instead.
/// If it doesn't exist, `""` is pushed on the stack.
FUNCTIONS.set("%", (signal) => {
    let right = signal.pop();
    let left = signal.pop();
    if (typeof left === "string" && typeof right === "number") {
        signal.push(left[right] ?? "");
    } else {
        signal.push(left % right);
    }
});

/// Computes the square root of the last value of the stack.
/// Noop for strings.
/// `[9]` -> `[3]`
FUNCTIONS.set("√", (signal) => {
    let value = signal.pop();
    if (typeof value === "string") {
        signal.push(value);
    } else {
        signal.push(Math.sqrt(value));
    }
});

/// Computes the absolute value of the last value on the stack.
/// For strings, returns the length of the string (in unicode codepoints).
FUNCTIONS.set("a", (signal) => {
    // NOTE: not using "|" for readability and because "|" is usually wrongly placed
    // at the end of an expression, making it possible to write a warning message if
    // one ever appears there.

    let value = signal.pop();
    if (typeof value === "string") {
        signal.push(value.length);
    } else {
        signal.push(Math.abs(value));
    }
});

/// Converts back and forth between string and number
FUNCTIONS.set("~", (signal, x, y, grid) => {
    return withNumericalInput(x, y, grid, (str) => {
        let value = signal.pop();
        if (typeof value === "string") {
            let number = +value;
            if (isNaN(number) || !Number.isFinite(number)) {
                number = 0;
            }
            signal.push(number);
        } else {
            if (str && Number.isInteger(+str)) {
                let precision = Math.min(Math.max(+str, 0), 100);
                signal.push(value.toPrecision(precision));
            } else {
                signal.push(String(value));
            }
        }
    });
});

/// Swaps the last two elements from the stack:
/// `[1, 2, 3]` -> `[1, 3, 2]`
FUNCTIONS.set("s", (signal) => {
    let right = signal.pop();
    let left = signal.pop();
    signal.push(right);
    signal.push(left);
});

/// Compares the last two elements from the stack. Pushes `1` if `a < b`, `0` otherwise:
/// `[2.0, 3.0]` -> `[1]`; `[3.0, 2.0]` -> `[0]`; `[4.0, 4.0]` -> `[0]`
FUNCTIONS.set("<", (signal) => {
    let right = signal.pop();
    let left = signal.pop();
    signal.push(left < right ? 1 : 0);
});

/// Compares the last two elements from the stack. Pushes `1` if `a > b`, `0` otherwise:
/// `[2.0, 3.0]` -> `[0]`; `[3.0, 2.0]` -> `[1]`; `[4.0, 4.0]` -> `[0]`
FUNCTIONS.set(">", (signal) => {
    let right = signal.pop();
    let left = signal.pop();
    signal.push(left > right ? 1 : 0);
});

/// Compares the last two elements from the stack. Pushes `1` if `a <= b`, `0` otherwise:
/// `[2.0, 3.0]` -> `[1]`; `[3.0, 2.0]` -> `[0]`; `[4.0, 4.0]` -> `[1]`
FUNCTIONS.set("≤", (signal) => {
    let right = signal.pop();
    let left = signal.pop();
    signal.push(left <= right ? 1 : 0);
});

/// Compares the last two elements from the stack. Pushes `1` if `a >= b`, `0` otherwise:
/// `[2.0, 3.0]` -> `[0]`; `[3.0, 2.0]` -> `[1]`; `[4.0, 4.0]` -> `[1]`
FUNCTIONS.set("≥", (signal) => {
    let right = signal.pop();
    let left = signal.pop();
    signal.push(left >= right ? 1 : 0);
});

/// Compares the last two elements from the stack. Pushes `1` if `a === b`, `0` otherwise:
/// `[2.0, 3.0]` -> `[0]`; `[3.0, 2.0]` -> `[0]`; `[4.0, 4.0]` -> `[1]`
FUNCTIONS.set("=", (signal) => {
    let right = signal.pop();
    let left = signal.pop();
    signal.push(left === right ? 1 : 0);
});

/// Compares the last two elements from the stack. Pushes `1` if `a !== b`, `0` otherwise:
/// `[2.0, 3.0]` -> `[1]`; `[3.0, 2.0]` -> `[1]`; `[4.0, 4.0]` -> `[0]`
FUNCTIONS.set("≠", (signal) => {
    let right = signal.pop();
    let left = signal.pop();
    signal.push(left !== right ? 1 : 0);
});

/// Pops a value and writes to the heap; if it is given a numerical argument, then the corresponding variable will be written to.
/// Otherwise, a value is popped from the stack and the variable corresponding to it will be written to.
/// For example, `→` alone would do the following: `[4, 0]` -> `[] {0 => 4}`.
/// `→1` would do the following: `[4, 0]` -> `[4] {1 => 0}`
// TODO: handle string parameters
FUNCTIONS.set("→", (signal, x, y, grid) => {
    return withNumericalInput(x, y, grid, (str) => {
        let addr;
        if (str) {
            addr = +str;
        } else {
            addr = signal.pop();
        }
        signal.set(addr, signal.pop());
    });
});

/// Reads from the heap and pushes the read value on the stack; if it is given a numberical argument, then the corresponding variable will be read.
/// Otherwise, a value is popped from the stack and used as variable address.
/// If the variable does not exist, does nothing.
/// For example, `←` alone would do the following: `[0] {0 => 4}` -> `[4] {0 => 4}`.
/// `←1` would do the following: `[] {1 => 0}` -> `[0]`.
// TODO: handle string parameters
FUNCTIONS.set("←", (signal, x, y, grid) => {
    return withNumericalInput(x, y, grid, (str) => {
        let addr;
        if (str) {
            addr = +str;
        } else {
            addr = signal.pop();
        }
        let value = signal.get(addr);
        if (value !== undefined) {
            signal.push(value);
        }
    });
});

/// Pushes to the stack the current length of the stack
FUNCTIONS.set("l", (signal) => {
    signal.push(signal.length);
});
