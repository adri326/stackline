"use strict";

import chalk from "chalk";
import fs from "node:fs";
import supportsAnsi from "supports-ansi";
import Grid from "./grid.js";
import {step, activeGrid} from "./simulation.js"

let grid_a = Grid.fromString(process.argv[2] ? fs.readFileSync(process.argv[2], "utf8") : "");
let grid_b = grid_a.clone();

const DT = 1000/60;
const ITERATIONS_PER_FRAME = 1000; // Increase this if you want to run the "brainfuck" example

const colorActive = chalk.hex("#90FFFF");
const colorAsleep = chalk.hex("#707070");
const colorResting = chalk.hex("#262626");
const colorIdle = chalk.hex("#5030F3")

function print() {
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
                if (lastPower == 1) {
                    process.stdout.write(colorActive(str));
                } else if (lastPower == 2) {
                    process.stdout.write(colorResting(str));
                } else if (lastPower == 3) {
                    process.stdout.write(colorIdle(str));
                } else {
                    process.stdout.write(colorAsleep(str));
                }
                str = char;
            } else {
                str += char;
            }
            lastPower = power;
        }
        if (str !== "") {
            if (lastPower == 1) {
                process.stdout.write(colorActive(str));
            } else if (lastPower == 2) {
                process.stdout.write(colorResting(str));
            } else if (lastPower == 3) {
                process.stdout.write(colorIdle(str));
            } else {
                process.stdout.write(colorAsleep(str));
            }
        }
        process.stdout.write("\n");
    }
}

function clear() {
    if (supportsAnsi) process.stdout.write("\x1b[" + grid_a.height + "A\x1b[1G");
}

let stepCount = 0;
let nextUpdate = performance.now() + DT;
let sum = 0;
function loop() {
    stepCount += 1;
    let start = performance.now();
    for (let n = 0; n < ITERATIONS_PER_FRAME; n++) {
        step(grid_a, grid_b);
    }
    sum += performance.now() - start;
    clear();
    print();
    let now = performance.now();
    nextUpdate += DT;
    return setTimeout(loop, Math.max(nextUpdate - now, 0));
}

process.on("SIGINT", () => {
    if (supportsAnsi) process.stdout.write("\x1b[?25h");
    // console.log(grid_a._signals);
    console.log(
        "Average performance: "
        + (sum / stepCount / ITERATIONS_PER_FRAME * 1000)
        + " μs/t"
    );
    process.exit(0);
});

// hide cursor
if (supportsAnsi) process.stdout.write("\x1b[?25l");
print();
loop();
