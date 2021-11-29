"use strict";

import FUNCTIONS from "./functions.js";

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
    if (grid.getPower(x + 1, y) != 2) {
        new_grid.setPower(x + 1, y);
        new_grid.moveSignal(x, y, x + 1, y);
    } else {
        new_grid.removeSignal(x, y);
    }
    return true;
});

CHARS.set("<", (x, y, grid, new_grid) => {
    if (grid.getPower(x - 1, y) != 2) {
        new_grid.setPower(x - 1, y);
        new_grid.moveSignal(x, y, x - 1, y);
    } else {
        new_grid.removeSignal(x, y);
    }
    return true;
});

CHARS.set("^", (x, y, grid, new_grid) => {
    if (grid.getPower(x, y - 1) != 2) {
        new_grid.setPower(x, y - 1);
        new_grid.moveSignal(x, y, x, y - 1);
    } else {
        new_grid.removeSignal(x, y);
    }
    return true;
});

CHARS.set("v", (x, y, grid, new_grid) => {
    if (grid.getPower(x, y + 1) != 2) {
        new_grid.setPower(x, y + 1);
        new_grid.moveSignal(x, y, x, y + 1);
    } else {
        new_grid.removeSignal(x, y);
    }
    return true;
});


CHARS.set("!", (x, y, grid, new_grid) => {
    let signal = [];
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
    let signal = grid.getSignal(x, y) ?? [];
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

    for (let n = 0; n < signal.length; n++) {
        if (grid.getChar(x, y + n + 1) != ":") break;
        new_grid.setPower(x, y + n + 1, 2);

        let str;
        if (precision && Number.isFinite(signal[n])) {
            str = signal[n].toPrecision(precision);
        } else {
            str = signal[n].toString();
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
    let signal = grid.getSignal(x, y) ?? [];
    let truthy = !!signal[signal.length - 1];

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
    let signal = grid.getSignal(x, y) ?? [];
    let truthy = !!signal[signal.length - 1];

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
