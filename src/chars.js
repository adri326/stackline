"use strict";

import FUNCTIONS from "./functions.js";
import Signal from "./signal.js";

const CHARS = new Map();
export default CHARS;

// TODO: avoid sending the signal to an insulated cell?

CHARS.set("-", (x, y, grid, new_grid) => {
    let signal = grid.getSignal(x, y);
    if (signal.originX !== null && signal.originY !== null) {
        // Origin is available: do origin analysis for wire insulation
        if (signal.originY !== y) {
            new_grid.setPower(x, y, 0);
            new_grid.removeSignal(x, y);
            return false;
        }
    }
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
    let signal = grid.getSignal(x, y);
    if (signal.originX !== null && signal.originY !== null) {
        // Origin is available: do origin analysis for wire insulation
        if (signal.originX !== x) {
            new_grid.setPower(x, y, 0);
            new_grid.removeSignal(x, y);
            return false;
        }
    }
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
    signal.setOrigin(x, y);

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
        signal.setOrigin(x, y);
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
        str = str.replace(/\n/g, "\\n");

        for (let c = 0; c < str.length; c++) {
            new_grid.setChar(x + c + 1, y + n + 1, str[c]);
        }
    }
    return CHARS.get("-")(x, y, grid, new_grid);
});

const LEFT = 1;
const RIGHT = 2;
const UP = 4;
const DOWN = 8;
const HORIZONTAL = 3;
const VERTICAL = 12;

function getSignalOrigin(signal, x, y, grid) {
    if (signal.originX === null || signal.originY === null) {
        // No origin available, falling back to cell state
        if (grid.getPower(x - 1, y) == 2) return LEFT;
        if (grid.getPower(x + 1, y) == 2) return RIGHT;
        if (grid.getPower(x, y - 1) == 2) return UP;
        if (grid.getPower(x, y + 1) == 2) return DOWN;
    } else {
        if (signal.originX === x) {
            if (signal.originY < y) return UP;
            if (signal.originY > y) return DOWN;
        } else if (signal.originY === y) {
            if (signal.originX < x) return LEFT;
            if (signal.originX > x) return RIGHT;
        }
    }
    return 0;
}

function getOrthogonal(direction) {
    if (direction & HORIZONTAL) return VERTICAL;
    else if (direction & VERTICAL) return HORIZONTAL;
}

function getOpposite(direction) {
    if (direction === LEFT) return RIGHT;
    if (direction === RIGHT) return LEFT;
    if (direction === UP) return DOWN;
    if (direction === DOWN) return UP;

    return 0;
}

function stepDirection(direction, x, y) {
    if (direction === LEFT) return [x - 1, y];
    if (direction === RIGHT) return [x + 1, y];
    if (direction === UP) return [x, y - 1];
    if (direction === DOWN) return [x, y + 1];

    return [x, y];
}

function copySignalInDirections(direction, x, y, new_grid, signal) {
    for (let bit = 0; bit < 4; bit++) {
        let dir = direction & (1 << bit);
        if (dir) {
            let target = stepDirection(dir, x, y);

            new_grid.newSignal(...target, new Signal(signal));
            new_grid.setPower(...target, 1);
        }
    }
}

function conditional(x, y, grid, new_grid, signal, sendThrough) {
    let origin = getSignalOrigin(signal, x, y, grid);
    signal.setOrigin(x, y);

    let targetDirection = sendThrough ? getOpposite(origin) : getOrthogonal(origin);

    if (!targetDirection) {
        throw new Error("Could not determine signal origin!");
    }

    copySignalInDirections(targetDirection, x, y, new_grid, signal);
}

/// "if" statement: outputs a signal in the same direction iff the top value is truthy,
/// otherwise outputs on the orthogonal sides
/// Afterwards, pops the top value
CHARS.set("?", (x, y, grid, new_grid) => {
    let signal = grid.getSignal(x, y) ?? new Signal();
    let truthy = signal.pop();

    conditional(x, y, grid, new_grid, signal, truthy);
});

/// Inverted "if" statement
CHARS.set("¿", (x, y, grid, new_grid) => {
    let signal = grid.getSignal(x, y) ?? new Signal();
    let falsy = !signal.pop();

    conditional(x, y, grid, new_grid, signal, falsy);
});

/// "if not empty" statement, similar to "?", but only lets a signal through if it has a non-empty stack
CHARS.set("‽", (x, y, grid, new_grid) => {
    let signal = grid.getSignal(x, y) ?? new Signal();
    let truthy = signal.length > 0;

    conditional(x, y, grid, new_grid, signal, truthy);
});

/// "if empty" statement, inverted variant of "‽"
CHARS.set("⸘", (x, y, grid, new_grid) => {
    let signal = grid.getSignal(x, y) ?? new Signal();
    let falsy = signal.length === 0;

    conditional(x, y, grid, new_grid, signal, falsy);
});

/// "if exists" statement:
CHARS.set("∃", (x, y, grid, new_grid) => {
    let signal = grid.getSignal(x, y) ?? new Signal();
    let address = signal.pop();
    let truthy = signal.variables.has(address);

    conditional(x, y, grid, new_grid, signal, truthy);
});

/// Inverted "if exists" statement:
CHARS.set("E", (x, y, grid, new_grid) => {
    let signal = grid.getSignal(x, y) ?? new Signal();
    let address = signal.pop();
    let falsy = !signal.variables.has(address);

    conditional(x, y, grid, new_grid, signal, falsy);
});

/// "Tunnel"
CHARS.set(".", (x, y, grid, new_grid) => {
    let signal = grid.getSignal(x, y);
    if (!signal) {
        throw new Error(`No signal at ${x}:${y}: "${grid.getChar(x, y)}"`);
    }

    let origin = getSignalOrigin(signal, x, y, grid);

    if (!origin) {
        throw new Error(`Couldn't determine origin of signal at ${x}:${y}!`);
    }

    if (Math.abs(signal.originX - x) <= 1 && Math.abs(signal.originY - y) <= 1) {
        // Transmit signal
        let x2 = x;
        let y2 = y;
        if (origin === LEFT) {
            while (x2 < grid.width) {
                x2 += 1;
                let char = grid.getChar(x2, y);
                if (char === "=") return;
                if (char === ".") break;
            }
            if (x2 >= grid.width) return true;
        } else if (origin === RIGHT) {
            while (x2 >= 0) {
                x2 -= 1;
                let char = grid.getChar(x2, y);
                if (char === "=") return;
                if (char === ".") break;
            }
            if (x2 < 0) return true;
        } else if (origin === UP) {
            while (y2 < grid.height) {
                y2 += 1;
                let char = grid.getChar(x, y2);
                if (char === "=") return;
                if (char === ".") break;
            }
            if (y2 >= grid.height) return true;
        } else {
            while (y2 >= 0) {
                y2 -= 1;
                let char = grid.getChar(x, y2);
                if (char === "=") return;
                if (char === ".") break;
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
        signalBelow.setOrigin(x, y);
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
        signal.setOrigin(x, y);

        new_grid.setPower(x, y - 1, 2);
        new_grid.setPower(x, y + 1, 2);

        // Transmit signal
        if (grid.hasChar(x - 1, y) && grid.getPower(x - 1, y) == 0) {
            new_grid.setPower(x - 1, y);
            new_grid.newSignal(x - 1, y, signal);
        }
        if (grid.hasChar(x + 1, y) && grid.getPower(x + 1, y) == 0) {
            new_grid.setPower(x + 1, y);
            new_grid.newSignal(x + 1, y, signal);
        }
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
        signal.setOrigin(x, y);
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
        signal.setOrigin(x, y);
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

// TODO: list of passives to be excluded from inactive regions

/// Read a single char from stdin or the input file
CHARS.set("r", (x, y, grid, new_grid) => {
    if (grid.getPower(x, y) === 1 || grid.getPower(x, y) === 3) {
        if (grid.stdin.hasChar()) {
            if (grid.getPower(x - 1, y) === 3) new_grid.setPower(x - 1, y, 2);
            if (grid.getPower(x + 1, y) === 3) new_grid.setPower(x + 1, y, 2);
            if (grid.getPower(x, y - 1) === 3) new_grid.setPower(x, y - 1, 2);
            if (grid.getPower(x, y + 1) === 3) new_grid.setPower(x, y + 1, 2);

            let signal = grid.getSignal(x, y);
            if (signal) {
                signal.push(grid.stdin.getChar());
            }

            return CHARS.get("+")(x, y, grid, new_grid);
        } else if (grid.stdin.isClosed()) {
            if (grid.getPower(x - 1, y) === 3) new_grid.setPower(x - 1, y, 2);
            if (grid.getPower(x + 1, y) === 3) new_grid.setPower(x + 1, y, 2);
            if (grid.getPower(x, y - 1) === 3) new_grid.setPower(x, y - 1, 2);
            if (grid.getPower(x, y + 1) === 3) new_grid.setPower(x, y + 1, 2);

            return CHARS.get("+")(x, y, grid, new_grid);
        } else if (grid.getPower(x, y) === 1) {
            // Put ourself on hold
            if (grid.getPower(x - 1, y) === 2) new_grid.setPower(x - 1, y, 3);
            if (grid.getPower(x + 1, y) === 2) new_grid.setPower(x + 1, y, 3);
            if (grid.getPower(x, y - 1) === 2) new_grid.setPower(x, y - 1, 3);
            if (grid.getPower(x, y + 1) === 2) new_grid.setPower(x, y + 1, 3);

            new_grid.setPower(x, y, 1);
            return false;
        }
    }
});

/// Read an entire line from stdin or the input file
CHARS.set("R", (x, y, grid, new_grid) => {
    if (grid.getPower(x, y) === 1 || grid.getPower(x, y) === 3) {
        if (grid.stdin.hasLine()) {
            if (grid.getPower(x - 1, y) === 3) new_grid.setPower(x - 1, y, 2);
            if (grid.getPower(x + 1, y) === 3) new_grid.setPower(x + 1, y, 2);
            if (grid.getPower(x, y - 1) === 3) new_grid.setPower(x, y - 1, 2);
            if (grid.getPower(x, y + 1) === 3) new_grid.setPower(x, y + 1, 2);

            let signal = grid.getSignal(x, y);
            if (signal) {
                signal.push(grid.stdin.getLine());
            }

            return CHARS.get("+")(x, y, grid, new_grid);
        } else if (grid.stdin.isClosed()) {
            if (grid.getPower(x - 1, y) === 3) new_grid.setPower(x - 1, y, 2);
            if (grid.getPower(x + 1, y) === 3) new_grid.setPower(x + 1, y, 2);
            if (grid.getPower(x, y - 1) === 3) new_grid.setPower(x, y - 1, 2);
            if (grid.getPower(x, y + 1) === 3) new_grid.setPower(x, y + 1, 2);

            return CHARS.get("+")(x, y, grid, new_grid);
        } else if (grid.getPower(x, y) === 1) {
            // Put ourself on hold
            if (grid.getPower(x - 1, y) === 2) new_grid.setPower(x - 1, y, 3);
            if (grid.getPower(x + 1, y) === 2) new_grid.setPower(x + 1, y, 3);
            if (grid.getPower(x, y - 1) === 2) new_grid.setPower(x, y - 1, 3);
            if (grid.getPower(x, y + 1) === 2) new_grid.setPower(x, y + 1, 3);

            new_grid.setPower(x, y, 1);
            return false;
        }
    }
});

CHARS.set("w", (x, y, grid, new_grid) => {
    let signal = grid.getSignal(x, y);

    if (signal) {
        grid.stdout.write(String(signal.pop()));
    }

    CHARS.get("+")(x, y, grid, new_grid);
});

CHARS.set("W", (x, y, grid, new_grid) => {
    let signal = grid.getSignal(x, y);

    if (signal) {
        grid.stdout.write(String(signal.pop()) + "\n");
    }

    CHARS.get("+")(x, y, grid, new_grid);
});

CHARS.set("d", (x, y, grid, new_grid) => {
    let signal = grid.getSignal(x, y);

    let wait = signal.pop();
    if (wait > 0) {
        if (grid.getPower(x - 1, y) === 2) new_grid.setPower(x - 1, y, 3);
        if (grid.getPower(x + 1, y) === 2) new_grid.setPower(x + 1, y, 3);
        if (grid.getPower(x, y - 1) === 2) new_grid.setPower(x, y - 1, 3);
        if (grid.getPower(x, y + 1) === 2) new_grid.setPower(x, y + 1, 3);
        signal.push(wait - 1);

        new_grid.setPower(x, y, 1);
        return false;
    } else {
        if (grid.getPower(x - 1, y) === 3) new_grid.setPower(x - 1, y, 2);
        if (grid.getPower(x + 1, y) === 3) new_grid.setPower(x + 1, y, 2);
        if (grid.getPower(x, y - 1) === 3) new_grid.setPower(x, y - 1, 2);
        if (grid.getPower(x, y + 1) === 3) new_grid.setPower(x, y + 1, 2);

        if (typeof wait !== "number" && wait !== undefined) {
            signal.push(wait);
        }

        CHARS.get("+")(x, y, grid, new_grid);
    }
});
