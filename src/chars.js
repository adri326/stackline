"use strict";

import FUNCTIONS from "./functions.js";
import Signal from "./signal.js";

const CHARS = new Map();
export default CHARS;

CHARS.set("-", (x, y, grid, new_grid) => {
    if (grid.hasChar(x - 1, y) && grid.getPower(x - 1, y) == 0) {
        new_grid.setPower(x - 1, y);
        new_grid.copySignal(x, y, x - 1, y);
    }
    if (grid.hasChar(x + 1, y) && grid.getPower(x + 1, y) == 0) {
        new_grid.setPower(x + 1, y);
        new_grid.moveSignal(x, y, x + 1, y);
    } else {
        new_grid.removeSignal(x, y);
    }
    return true;
});

CHARS.set("|", (x, y, grid, new_grid) => {
    if (grid.hasChar(x, y - 1) && grid.getPower(x, y - 1) == 0) {
        new_grid.setPower(x, y - 1);
        new_grid.copySignal(x, y, x, y - 1);
    }
    if (grid.hasChar(x, y + 1) && grid.getPower(x, y + 1) == 0) {
        new_grid.setPower(x, y + 1);
        new_grid.moveSignal(x, y, x, y + 1);
    } else {
        new_grid.removeSignal(x, y);
    }
    return true;
});

CHARS.set("+", (x, y, grid, new_grid) => {
    if (grid.hasChar(x - 1, y) && grid.getPower(x - 1, y) == 0) {
        new_grid.setPower(x - 1, y);
        new_grid.copySignal(x, y, x - 1, y);
    }
    if (grid.hasChar(x + 1, y) && grid.getPower(x + 1, y) == 0) {
        new_grid.setPower(x + 1, y);
        new_grid.copySignal(x, y, x + 1, y);
    }
    if (grid.hasChar(x, y - 1) && grid.getPower(x, y - 1) == 0) {
        new_grid.setPower(x, y - 1);
        new_grid.copySignal(x, y, x, y - 1);
    }
    if (grid.hasChar(x, y + 1) && grid.getPower(x, y + 1) == 0) {
        new_grid.setPower(x, y + 1);
        new_grid.copySignal(x, y, x, y + 1);
    }
    new_grid.removeSignal(x, y);
    return true;
});

// Diodes, which force a signal onto the next char

CHARS.set(">", (x, y, grid, new_grid) => {
    if (grid.getPower(x + 1, y) == 0) {
        new_grid.setPower(x + 1, y);
        new_grid.moveSignal(x, y, x + 1, y);
    } else {
        new_grid.removeSignal(x, y);
    }
    return true;
});

CHARS.set("<", (x, y, grid, new_grid) => {
    if (grid.getPower(x - 1, y) == 0) {
        new_grid.setPower(x - 1, y);
        new_grid.moveSignal(x, y, x - 1, y);
    } else {
        new_grid.removeSignal(x, y);
    }
    return true;
});

CHARS.set("^", (x, y, grid, new_grid) => {
    if (grid.getPower(x, y - 1) == 0) {
        new_grid.setPower(x, y - 1);
        new_grid.moveSignal(x, y, x, y - 1);
    } else {
        new_grid.removeSignal(x, y);
    }
    return true;
});

CHARS.set("v", (x, y, grid, new_grid) => {
    if (grid.getPower(x, y + 1) == 0) {
        new_grid.setPower(x, y + 1);
        new_grid.moveSignal(x, y, x, y + 1);
    } else {
        new_grid.removeSignal(x, y);
    }
    return true;
});

CHARS.set("V", (x, y, grid, new_grid) => {
    if (grid.getPower(x, y + 1) != 2) {
        new_grid.setPower(x, y + 1);
        new_grid.moveSignal(x, y, x, y + 1);
    } else {
        new_grid.removeSignal(x, y);
    }
    return true;
});


CHARS.set("!", (x, y, grid, new_grid) => {
    let signal = new Signal();
    new_grid.setPower(x - 1, y);
    new_grid.setPower(x + 1, y);
    new_grid.setPower(x, y - 1);
    new_grid.setPower(x, y + 1);

    new_grid.newSignal(x - 1, y, signal);
    new_grid.newSignal(x + 1, y, signal);
    new_grid.newSignal(x, y - 1, signal);
    new_grid.newSignal(x, y + 1, signal);

    new_grid.setChar(x, y, " ");
    new_grid.setActive(x, y);
    return true;
});

CHARS.set("#", (x, y, grid, new_grid) => {
    if (
        grid.getPower(x, y + 1) == 2
        || grid.getPower(x + 1, y) == 3
        || grid.getPower(x - 1, y) == 3
    ) {
        if (grid.getPower(x - 1, y) == 0) {
            new_grid.setPower(x - 1, y);
            new_grid.copySignal(x, y, x - 1, y);
        } else if (grid.getPower(x - 1, y) == 3) {
            new_grid.setPower(x - 1, y, 2);
        }

        if (grid.getPower(x + 1, y) == 0) {
            new_grid.setPower(x + 1, y);
            new_grid.moveSignal(x, y, x + 1, y);
        } else if (grid.getPower(x + 1, y) == 3) {
            new_grid.setPower(x + 1, y, 2);
            new_grid.removeSignal(x, y);
        }

        return true;
    } else if (grid.getPower(x, y + 1) == 0) {
        new_grid.setPower(x, y + 1);
        new_grid.copySignal(x, y, x, y + 1);

        if (grid.getPower(x - 1, y) == 2) {
            new_grid.setPower(x - 1, y, 3);
        }
        if (grid.getPower(x + 1, y) == 2) {
            new_grid.setPower(x + 1, y, 3);
        }

        new_grid.setPower(x, y, 3); // Wait
        return false;
    }
});

CHARS.set(":", (x, y, grid, new_grid) => {
    let offset = 1;
    let char;
    let signal = grid.getSignal(x, y);

    // Walk right
    while ((char = grid.getChar(x + offset, y)) != " " && char != null) {
        if (FUNCTIONS.has(char)) {
            offset += FUNCTIONS.get(char)(signal, x + offset, y, grid, new_grid) ?? 1;
        } else {
            break;
        }
    }

    // Walk down
    if (grid.getChar(x, y + 1) == ":") {
        new_grid.setPower(x, y + 1);
        new_grid.setPower(x, y, 3);
        new_grid.moveSignal(x, y, x, y + 1);
    } else {
        // Walk up
        let offset = 1;
        new_grid.setPower(x, y, 2);
        while (grid.getChar(x, y - offset) == ":") {
            new_grid.setPower(x, y - offset, 2);
            offset += 1;
        }
        new_grid.removeSignal(x, y - offset);
        new_grid.removeSignal(x, y);
        new_grid.newSignal(x, y - offset, signal);
        new_grid.setPower(x, y - offset, 1); // Wake up caller
    }

    return false;
});

// Debug print, use with caution!
CHARS.set("p", (x, y, grid, new_grid) => {
    let signal = grid.getSignal(x, y) ?? new Signal();
    let precision = null;

    if (/[0-9]/.exec(grid.getChar(x + 1, y))) {
        let offset = 1;
        let str = "";
        while (/[0-9]/.exec(grid.getChar(x + offset, y))) {
            str += grid.getChar(x + offset, y);
            offset += 1;
        }
        precision = Math.max(Math.min(+str, 100), 1);
    }

    for (let n = 0; n < signal.length + 1; n++) {
        if (grid.getChar(x, y + n + 1) != ":") break;
        new_grid.setPower(x, y + n + 1, 2);

        let str;
        if (precision && Number.isFinite(signal.peek(n))) {
            str = (signal.peek(n) ?? "").toPrecision(precision) + " ";
        } else if (signal.peek(n) !== undefined) {
            str = (signal.peek(n) ?? "").toString() + " ";
        } else {
            str = " ";
        }

        for (let c = 0; c < str.length; c++) {
            new_grid.setChar(x + c + 1, y + n + 1, str[c]);
        }
    }
    return CHARS.get("-")(x, y, grid, new_grid);
});

/// "if" statement: outputs a signal in the same direction iff the top value is truthy,
/// otherwise outputs on the orthogonal sides
CHARS.set("?", (x, y, grid, new_grid) => {
    let signal = grid.getSignal(x, y) ?? new Signal();
    let truthy = !!signal.peek();

    if (grid.getPower(x - 1, y) == 2 || grid.getPower(x + 1, y) == 2) {
        if (truthy) {
            CHARS.get("-")(x, y, grid, new_grid);
        } else {
            CHARS.get("|")(x, y, grid, new_grid);
        }
    } else {
        if (truthy) {
            CHARS.get("|")(x, y, grid, new_grid);
        } else {
            CHARS.get("-")(x, y, grid, new_grid);
        }
    }
});

/// Inverted "if" statement
CHARS.set("¿", (x, y, grid, new_grid) => {
    let signal = grid.getSignal(x, y) ?? new Signal();
    let truthy = !!signal.peek();

    if (grid.getPower(x - 1, y) == 2 || grid.getPower(x + 1, y) == 2) {
        if (truthy) {
            CHARS.get("|")(x, y, grid, new_grid);
        } else {
            CHARS.get("-")(x, y, grid, new_grid);
        }
    } else {
        if (truthy) {
            CHARS.get("-")(x, y, grid, new_grid);
        } else {
            CHARS.get("|")(x, y, grid, new_grid);
        }
    }
});

/// "if empty" statement, similar to "?", but only lets a signal through if it has a non-empty stack
CHARS.set("‽", (x, y, grid, new_grid) => {
    let signal = grid.getSignal(x, y) ?? new Signal();
    let truthy = signal.length > 0;

    if (grid.getPower(x - 1, y) == 2 || grid.getPower(x + 1, y) == 2) {
        if (truthy) {
            CHARS.get("-")(x, y, grid, new_grid);
        } else {
            CHARS.get("|")(x, y, grid, new_grid);
        }
    } else {
        if (truthy) {
            CHARS.get("|")(x, y, grid, new_grid);
        } else {
            CHARS.get("-")(x, y, grid, new_grid);
        }
    }
});

/// "if not empty" statement, inverted variant of "‽"
CHARS.set("⸘", (x, y, grid, new_grid) => {
    let signal = grid.getSignal(x, y) ?? new Signal();
    let truthy = signal.length > 0;

    if (grid.getPower(x - 1, y) == 2 || grid.getPower(x + 1, y) == 2) {
        if (truthy) {
            CHARS.get("|")(x, y, grid, new_grid);
        } else {
            CHARS.get("-")(x, y, grid, new_grid);
        }
    } else {
        if (truthy) {
            CHARS.get("-")(x, y, grid, new_grid);
        } else {
            CHARS.get("|")(x, y, grid, new_grid);
        }
    }
});

/// "if exists" statement:
CHARS.set("∃", (x, y, grid, new_grid) => {
    let signal = grid.getSignal(x, y) ?? new Signal();
    let address = signal.pop();
    let truthy = signal.variables.has(address);

    if (grid.getPower(x - 1, y) == 2 || grid.getPower(x + 1, y) == 2) {
        if (truthy) {
            CHARS.get("-")(x, y, grid, new_grid);
        } else {
            CHARS.get("|")(x, y, grid, new_grid);
        }
    } else {
        if (truthy) {
            CHARS.get("|")(x, y, grid, new_grid);
        } else {
            CHARS.get("-")(x, y, grid, new_grid);
        }
    }
});

/// Inverted "if exists" statement:
CHARS.set("E", (x, y, grid, new_grid) => {
    let signal = grid.getSignal(x, y) ?? new Signal();
    let address = signal.pop();
    let truthy = signal.variables.has(address);

    if (grid.getPower(x - 1, y) == 2 || grid.getPower(x + 1, y) == 2) {
        if (truthy) {
            CHARS.get("|")(x, y, grid, new_grid);
        } else {
            CHARS.get("-")(x, y, grid, new_grid);
        }
    } else {
        if (truthy) {
            CHARS.get("-")(x, y, grid, new_grid);
        } else {
            CHARS.get("|")(x, y, grid, new_grid);
        }
    }
});

/// "Tunnel"
CHARS.set(".", (x, y, grid, new_grid) => {
    let left = grid.getPower(x - 1, y);
    let right = grid.getPower(x + 1, y);
    let top = grid.getPower(x, y - 1);
    let bottom = grid.getPower(x, y + 1);
    if (left == 2 || right == 2 || top == 2 || bottom == 2) {
        // Transmit signal
        let x2 = x;
        let y2 = y;
        if (left == 2) {
            while (x2 < grid.width) {
                x2 += 1;
                if (grid.getChar(x2, y) == ".") break;
            }
            if (x2 >= grid.width) return true;
        } else if (right == 2) {
            while (x2 >= 0) {
                x2 -= 1;
                if (grid.getChar(x2, y) == ".") break;
            }
            if (x2 < 0) return true;
        } else if (top == 2) {
            while (y2 < grid.height) {
                y2 += 1;
                if (grid.getChar(x, y2) == ".") break;
            }
            if (y2 >= grid.height) return true;
        } else {
            while (y2 >= 0) {
                y2 -= 1;
                if (grid.getChar(x, y2) == ".") break;
            }
            if (y2 < 0) return true;
        }

        new_grid.setPower(x2, y2);
        new_grid.moveSignal(x, y, x2, y2);
    } else {
        // Receive signal
        if (grid.hasChar(x - 1, y)) {
            new_grid.setPower(x - 1, y);
            new_grid.copySignal(x, y, x - 1, y);
        }
        if (grid.hasChar(x + 1, y)) {
            new_grid.setPower(x + 1, y);
            new_grid.copySignal(x, y, x + 1, y);
        }
        if (grid.hasChar(x, y - 1)) {
            new_grid.setPower(x, y - 1);
            new_grid.copySignal(x, y, x, y - 1);
        }
        if (grid.hasChar(x, y + 1)) {
            new_grid.setPower(x, y + 1);
            new_grid.copySignal(x, y, x, y + 1);
        }
        new_grid.removeSignal(x, y);
    }
});

CHARS.set("\"", (x, y, grid, new_grid) => {
    let signalBelow = grid.getSignal(x, y + 1);
    new_grid.moveSignal(x, y, x, y + 1);
    if (signalBelow) {
        new_grid.newSignal(x, y, signalBelow);
        return CHARS.get("-")(x, y, grid, new_grid);
    } else {
        new_grid.setChar(x, y + 1, "o");
        new_grid.setPower(x, y + 1, 3);
    }
});

CHARS.set("o", (x, y, grid, new_grid) => {
    new_grid.setPower(x, y, 3);

    if (grid.hasChar(x - 1, y) && grid.getPower(x - 1, y) == 0) {
        new_grid.setPower(x - 1, y);
        new_grid.copySignal(x, y, x - 1, y);
    }
    if (grid.hasChar(x + 1, y) && grid.getPower(x + 1, y) == 0) {
        new_grid.setPower(x + 1, y);
        new_grid.copySignal(x, y, x + 1, y);
    }
    if (grid.hasChar(x, y - 1) && grid.getPower(x, y - 1) == 0) {
        new_grid.setPower(x, y - 1);
        new_grid.copySignal(x, y, x, y - 1);
    }
    if (grid.hasChar(x, y + 1) && grid.getPower(x, y + 1) == 0) {
        new_grid.setPower(x, y + 1);
        new_grid.copySignal(x, y, x, y + 1);
    }

    return false;
});

CHARS.set("x", (x, y, grid, new_grid) => {
    let signalAbove = grid.getSignal(x, y - 1);
    let signalBelow = grid.getSignal(x, y + 1);

    if (signalAbove && signalBelow) {
        new_grid.removeSignal(x, y - 1);

        // Construct signal
        let signal = new Signal();

        let n = 0;
        for (; n < signalAbove.length && n < signalBelow.length; n++) {
            signal.push(signalAbove.peek(n));
            signal.push(signalBelow.peek(n));
        }
        for (; n < signalAbove.length; n++) signal.push(signalAbove.peek(n));
        for (; n < signalBelow.length; n++) signal.push(signalBelow.peek(n));
        signal.variables = signalBelow.variables;
        signal.reverse();

        new_grid.newSignal(x, y, signal);
        new_grid.setPower(x, y - 1, 2);
        new_grid.setPower(x, y + 1, 2);
        return CHARS.get("-")(x, y, grid, new_grid);
    } else {
        if (signalAbove && grid.getPower(x, y - 1) == 2) new_grid.setPower(x, y - 1, 3);
        if (signalBelow && grid.getPower(x, y + 1) == 2) new_grid.setPower(x, y + 1, 3);

        new_grid.setPower(x, y, 0);
        return false;
    }
});

CHARS.set("»", (x, y, grid, new_grid) => {
    if (
        grid.getPower(x, y - 1) == 2
        || grid.getPower(x, y + 1) == 2
    ) {
        let signal = grid.getSignal(x, y) ?? new Signal();
        let signalLeft = grid.getSignal(x - 1, y) ?? new Signal();

        signal = signal.concat(signalLeft);
        new_grid.removeSignal(x - 1, y);
        new_grid.removeSignal(x, y);
        if (new_grid.getPower(x - 1, y) == 3) new_grid.setPower(x - 1, y, 2);

        if (grid.getPower(x + 1, y) != 2) {
            new_grid.setPower(x + 1, y, 1);
            new_grid.newSignal(x + 1, y, signal);
        }
    } else {
        new_grid.setPower(x, y, 0);
        return false;
    }
});

CHARS.set("«", (x, y, grid, new_grid) => {
    if (
        grid.getPower(x, y - 1) == 2
        || grid.getPower(x, y + 1) == 2
    ) {
        let signal = grid.getSignal(x, y) ?? new Signal();
        let signalRight = grid.getSignal(x + 1, y) ?? new Signal();

        signal = signalRight.concat(signal);
        new_grid.removeSignal(x, y);
        if (new_grid.getPower(x + 1, y) == 3) new_grid.setPower(x + 1, y, 2);

        if (grid.getPower(x - 1, y) != 2) {
            new_grid.setPower(x - 1, y, 1);
            new_grid.newSignal(x - 1, y, signal);
        }
    } else {
        new_grid.setPower(x, y, 0);
        return false;
    }
});

/// Only lets through the first signal
CHARS.set("f", (x, y, grid, new_grid) => {
    new_grid.setPower(x, y, 3);

    CHARS.get("+")(x, y, grid, new_grid);

    return false;
});

/// Kills any signal in the direction opposing the incomming signal: does so by setting all cells to resting until it reaches a wall (`=`).
/// Can be used to reset or turn off a circuit.
CHARS.set("k", (x, y, grid, new_grid) => {
    if (grid.hasChar(x - 1, y) && grid.getPower(x - 1, y) == 2) {
        for (let n = 1; x + n < grid.width; n++) {
            if (grid.hasChar(x + n, y)) {
                if (grid.getChar(x + n, y) == "=") break;
                new_grid.setPower(x + n, y, 2);
            }
        }
    }

    if (grid.hasChar(x + 1, y) && grid.getPower(x + 1, y) == 2) {
        for (let n = 1; x - n >= 0; n++) {
            if (grid.hasChar(x - n, y)) {
                if (grid.getChar(x - n, y) == "=") break;
                new_grid.setPower(x - n, y, 2);
            }
        }
    }

    if (grid.hasChar(x, y - 1) && grid.getPower(x, y - 1) == 2) {
        for (let n = 1; y + n < grid.height; n++) {
            if (grid.hasChar(x, y + n)) {
                if (grid.getChar(x, y + n) == "=") break;
                new_grid.setPower(x, y + n, 2);
            }
        }
    }

    if (grid.hasChar(x, y + 1) && grid.getPower(x, y + 1) == 2) {
        for (let n = 1; y - n >= 0; n++) {
            if (grid.hasChar(x, y - n)) {
                if (grid.getChar(x, y - n) == "=") break;
                new_grid.setPower(x, y - n, 2);
            }
        }
    }
});

/// Completely clears the signal
CHARS.set("c", (x, y, grid, new_grid) => {
    new_grid.newSignal(x, y, new Signal());

    CHARS.get("+")(x, y, grid, new_grid);
});

/// Clears the stack of the signal but leaves the heap untouched
CHARS.set("C", (x, y, grid, new_grid) => {
    let signal = grid.getSignal(x, y);

    if (signal) {
        signal.stack = [];
        new_grid.newSignal(x, y, signal);
    }

    CHARS.get("+")(x, y, grid, new_grid);
});

/// Clears the heap of the signal but leaves the stack untouched
CHARS.set("D", (x, y, grid, new_grid) => {
    let signal = grid.getSignal(x, y);

    if (signal) {
        signal.heap = new Map();
        new_grid.newSignal(x, y, signal);
    }

    CHARS.get("+")(x, y, grid, new_grid);
});

/// Stops the simulation if the canStop parameter was set
CHARS.set("H", (x, y, grid, new_grid) => {
    new_grid.stop();
});
