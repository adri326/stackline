"use strict";

import chalk from "chalk";
import yargs from "yargs";
import {hideBin} from "yargs/helpers";
import supportsAnsi from "supports-ansi";

import stream from "node:stream";
import fs from "node:fs";

import Grid from "./grid.js";
import {step, activeGrid} from "./simulation.js"
import IO from "./io.js";


// Colors

const colorActive = chalk.hex("#90FFFF");
const colorAsleep = chalk.hex("#707070");
const colorResting = chalk.hex("#262626");
const colorIdle = chalk.hex("#5030F3");

// Argument parsing and grid reading

const argv = yargs(hideBin(process.argv))
    .alias("i", "input")
    .alias("o", "output")
    .alias("m", "mult")
    .parse();

// Simulation-related constants

const CAN_STOP = true;
const DT = 1000/Math.max(+argv.fps || 60, 60);
const ITERATIONS_PER_FRAME = Math.max(+argv.mult || 1, 1);

// Grids
const grid_a = Grid.fromString(argv._[0] ? fs.readFileSync(argv._[0], "utf8") : "");
const grid_b = grid_a.clone();

if (argv.input === undefined) {
    grid_a.stdin = grid_b.stdin = new IO(process.stdin, () => {
        stop();
        process.exit(0);
    });
} else {
    grid_a.stdin = grid_b.stdin = new IO(fs.createReadStream(argv.input));
}

let toWrite = "";

if (argv.output === undefined) {
    let stdout = new stream.Writable();

    stdout._write = function(chunk, encoding, done) {
        toWrite += chunk.toString();
        done();
    }

    grid_a.stdout = grid_b.stdout = new IO(stdout);
} else {
    grid_a.stdout = grid_b.stdout = new IO(fs.createWriteStream(argv.output));
}

/// Prints a colored circuit in the terminal
function print() {
    function writeColored(power, str) {
        if (power == 1) {
            process.stdout.write(colorActive(str));
        } else if (power == 2) {
            process.stdout.write(colorResting(str));
        } else if (power == 3) {
            process.stdout.write(colorIdle(str));
        } else {
            process.stdout.write(colorAsleep(str));
        }
    }

    let grid = activeGrid ? grid_a : grid_b;

    for (const [y, row] of grid._chars.entries()) {
        let lastPower = 0;
        let str = "";
        for (const [x, char] of row.entries()) {
            if (char == " ") {
                str += " ";
                continue;
            }
            let power = grid.getPower(x, y);
            if (power != lastPower) {
                writeColored(lastPower, str);
                str = char;
            } else {
                str += char;
            }
            lastPower = power;
        }
        if (str !== "") {
            writeColored(lastPower, str);
        }
        process.stdout.write("\n");
    }
}

function clear() {
    if (supportsAnsi) process.stdout.write("\x1b[" + grid_a.height + "F");
}

let stepCount = 0;
let nextUpdate = performance.now() + DT;
let sum = 0;
/// Main loop
function loop() {
    stepCount += 1;
    let start = performance.now();
    for (let n = 0; n < ITERATIONS_PER_FRAME; n++) {
        if (step(grid_a, grid_b, CAN_STOP)) {
            process.stdin.pause();
            return stop();
        }
    }
    sum += performance.now() - start;
    clear();
    if (toWrite !== "") {
        if (supportsAnsi) process.stdout.write("\x1b[K");
        process.stdout.write(toWrite);
        toWrite = "";
    }
    print();
    let now = performance.now();
    nextUpdate += DT;
    return setTimeout(loop, Math.max(nextUpdate - now, 0));
}

function stop() {
    clear();
    if (toWrite !== "") {
        if (supportsAnsi) process.stdout.write("\x1b[K");
        process.stdout.write(toWrite);
        toWrite = "";
    }
    print();

    if (supportsAnsi) {
        process.stdout.write("\x1b[?25h");
    }

    console.log(
        "Average performance: "
        + (sum / stepCount / ITERATIONS_PER_FRAME * 1000)
        + " μs/t"
    );
}

process.on("uncaughtException", (err) => {
    stop();
    console.error(err);
    process.exit(1);
});

process.on("SIGINT", () => {
    stop();
    process.exit(0);
});

// hide cursor
if (supportsAnsi) {
    process.stdout.write("\x1b[?25l");
}
print();
loop();
