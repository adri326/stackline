"use strict";

import Signal from "./signal.js";

export const REGION_SIZE = 4;

function newTable(width, height, fill) {
    return new Array(height).fill(null).map(row => {
        return new Array(width).fill(fill);
    });
}

/** Stores a state of the simulation
    Class invariants:
    1. this._chars.length <= this.height
    2. ∀ y ∈ [0; this.height[, this._chars[y].length <= this.width
    3. this._power.length <= this.height
    4. ∀ y ∈ [0; this.height[, this._power[y].length <= this.width
    5. ∀ (x, y) ∈ this._chars, ∃ rx = x / REGION_SIZE, ry = y / REGION_SIZE,
        (rx, ry) ∈ this._active
**/
export class Grid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this._chars = newTable(this.width, this.height, " ");
        this._power = newTable(this.width, this.height, 0);
        this._signals = new Map();
        this._active = newTable(
            Math.ceil(this.width / REGION_SIZE),
            Math.ceil(this.height / REGION_SIZE),
            true
        );
    }

    /// Makes a clone of the current Grid instance
    clone() {
        let res = new Grid(this.width, this.height);
        for (let [x, y, char, power] of this.iterAll()) {
            res._chars[y][x] = char;
            res._power[y][x] = power;
        }
        for (let ry = 0; ry < this._active.length; ry++) {
            for (let rx = 0; rx < this._active[ry].length; rx++) {
                res._active[ry][rx] = this._active[ry][rx];
            }
        }
        res.signals = new Map(this._signals);

        return res;
    }

    /// Iterates over all of the grid cells; costly
    *iterAll() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                yield [x, y, this._chars[y][x], this._power[y][x]];
            }
        }
    }

    /// Resizes the tables, if needed; returns true on success, false otherwise
    resize(width, height) {
        if (width > this.width) {
            for (let y = 0; y < this.height; y++) {
                while (this._chars[y].length < width) {
                    this._chars[y].push(" ");
                }
                while (this._power[y].length < width) {
                    this._power[y].push(0);
                }
            }
            if (Math.ceil(width / REGION_SIZE) > Math.ceil(this.width / REGION_SIZE)) {
                let rw = Math.ceil(width / REGION_SIZE);
                for (let ry = 0; ry < this._active.length; ry++) {
                    while (this._active[ry].length < rw) {
                        this._active[ry].push(true);
                    }
                }
            }
        }
        if (height > this.height) {
            while (this._chars.length < height) {
                this._chars.push(new Array(width).fill(" "));
            }
            while (this._power.length < height) {
                this._power.push(new Array(width).fill(0));
            }
            if (Math.ceil(height / REGION_SIZE) > Math.ceil(this.height / REGION_SIZE)) {
                let rh = Math.ceil(height / REGION_SIZE);
                let rw = Math.ceil(width / REGION_SIZE);
                while (this._active.length < rh) {
                    this._active.push(new Array(rw).fill(true));
                }
            }
        }
        this.width = width;
        this.height = height;

        return true;
    }

    /// Copies the altered data into `target`, trimming the signals if needed
    copyData(target) {
        target.resize(this.width, this.height);

        this.forEach((x, y, char, power) => {
            target._chars[y][x] = char;
            target._power[y][x] = power;
        });

        target._signals = new Map(this._signals);
        for (let key of target._signals.keys()) {
            let [x, y] = key.split(",").map(v => +v);
            if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
                target._signals.delete(key);
            } else if (target._power[y][x] == 0) {
                target._signals.delete(key);
            }
        }
    }

    /// Returns true if [x, y] are valid coordinates within the grid
    validateCoords(x, y) {
        return Number.isInteger(y) && y < this.height && y >= 0
            && Number.isInteger(x) && x < this.width && x >= 0;
    }

    /// Returns true if [x, y] are valid *potential* coordinates for the grid.
    /// If it is, then the grid is resized so that it has the cell [x, y].
    validateCoordsAndResize(x, y) {
        if (
            !Number.isInteger(y) || y < 0
            || !Number.isInteger(x) || x < 0
        ) {
            return false;
        }

        return this.resize(Math.max(x + 1, this.width), Math.max(y + 1, this.height));
    }

    /// Returns true if [x, y] points to a non-empty cell
    hasChar(x, y) {
        if (this.validateCoords(x, y)) {
            return this._chars[y][x] !== " ";
        } else {
            return false;
        }
    }

    /// Returns the char at [x, y], or null
    getChar(x, y) {
        if (!this.validateCoords(x, y)) return null;
        return this._chars[y][x];
    }

    /// Sets the character of [x, y] to `char`; returns true on success, false otherwise
    setChar(x, y, char) {
        if (!this.validateCoordsAndResize(x, y)) return false;

        this.setActive(x, y);
        this._chars[y][x] = char;
        return true;
    }

    /// Flags the cell [x, y] as "active": it will be copied by `copyData`.
    /// Returns true on success, false otherwise
    setActive(x, y) {
        if (!this.validateCoordsAndResize(x, y)) return false;

        this._active[~~(y / REGION_SIZE)][~~(x / REGION_SIZE)] = true;
        return true;
    }

    /// Sets all of the active regions to inactive
    deactivate() {
        for (let y = 0; y < this._active.length; y++) {
            for (let x = 0; x < this._active[y].length; x++) {
                this._active[y][x] = false;
            }
        }
    }

    /// Returns the power at [x, y], or null
    getPower(x, y) {
        if (!this.validateCoords(x, y)) return null;

        return this._power[y][x];
    }

    /// Sets the power of the cell at [x, y]; return true on success, false otherwise
    setPower(x, y, value = 1) {
        if (!this.validateCoordsAndResize(x, y)) return false;

        if (!this.setActive(x, y)) return false;

        this._power[y][x] = value;
        return true;
    }

    /// Returns the signal at [x, y], if available
    getSignal(x, y) {
        if (!this.validateCoords(x, y)) return null;

        let key = `${x},${y}`;
        return this._signals.get(key);
    }

    /// Copies the signal from [sx, sy] into [dx, dy]
    copySignal(sx, sy, dx, dy) {
        if (!this.validateCoords(sx, sy) || !this.validateCoords(dx, dy)) return null;

        let signal = this.getSignal(sx, sy);
        if (!signal) {
            throw new Error(
                `No signal at ${sx}:${sy} ('${
                    this._chars[sy][sx]
                }'#${
                    this._power[sy][sx]
                })`
            );
        }

        this._signals.set(`${dx},${dy}`, new Signal(signal));
    }

    /// Moves the signal from [sx, sy] to [dx, dy]
    moveSignal(sx, sy, dx, dy) {
        if (!this.validateCoords(sx, sy) || !this.validateCoords(dx, dy)) return null;

        let key = `${sx},${sy}`;

        let signal = this._signals.get(key);
        if (!signal) {
            throw new Error(
                `No signal at ${sx}:${sy} ('${
                    this._chars[sy][sx]
                }'#${
                    this._power[sy][sx]
                })`
            );
        }

        this._signals.set(`${dx},${dy}`, signal);
        this._signals.delete(key);
    }

    /// Removes the signal at [x, y]; returns true on success
    removeSignal(x, y) {
        if (!this.validateCoords(x, y)) return false;

        let key = `${x},${y}`;
        return this._signals.delete(key);
    }

    /// Spawns a new signal at [x, y]; returns true on success
    newSignal(x, y, signal) {
        if (!this.validateCoords(x, y)) return false;

        let key = `${x},${y}`;
        this._signals.set(key, signal);
        return true;
    }

    /// Iterates over the active cells only
    forEach(callback) {
        for (let ry = 0; ry < this._active.length; ry++) {
            for (let rx = 0; rx < this._active[ry].length; rx++) {
                let rx2 = rx * REGION_SIZE;
                let ry2 = ry * REGION_SIZE;
                if (!this._active[ry][rx]) {
                    continue;
                }
                for (let y = 0; y < REGION_SIZE && ry2 + y < this.height; y++) {
                    for (let x = 0; x < REGION_SIZE && rx2 + x < this.width; x++) {
                        callback(
                            rx2 + x,
                            ry2 + y,
                            this._chars[ry2 + y][rx2 + x],
                            this._power[ry2 + y][rx2 + x]
                        );
                    }
                }
            }
        }
    }

    /// Parses a string into a grid
    static fromString(str) {
        str = str.split("\n");
        let max_width = str.reduce((acc, act) => Math.max(acc, act.length), 0);
        let res = new Grid(max_width, str.length);

        for (let y = 0; y < str.length; y++) {
            for (let x = 0; x < str[y].length; x++) {
                res._chars[y][x] = str[y][x];
            }
        }

        return res;
    }
}

export default Grid;
