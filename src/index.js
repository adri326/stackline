"use strict";

import chalk from "chalk";
import fs from "node:fs";
import supportsAnsi from "supports-ansi";
import Grid from "./grid.js";
import {step, activeGrid} from "./simulation.js"

let grid_a = Grid.fromString(process.argv[2] ? fs.readFileSync(process.argv[2], "utf8") : "");
let grid_b = grid_a.clone();

function print() {
    let grid = activeGrid ? grid_a : grid_b;

    for (const [y, row] of grid._chars.entries()) {
        for (const [x, char] of row.entries()) {
            let power = grid.getPower(x, y);
            if (power == 1) {
                process.stdout.write(chalk.yellow(char));
            } else if (power == 2) {
                process.stdout.write(chalk.black(char));
            } else if (power == 3) {
                process.stdout.write(chalk.red(char));
            } else {
                process.stdout.write(chalk.gray(char));
            }
        }
        process.stdout.write("\n");
    }
}

function clear() {
    if (supportsAnsi) process.stdout.write("\x1b[" + grid_a.height + "A\x1b[1G");
}

const DT = 1000/10;

let stepCount = 0;
let nextUpdate = performance.now() + DT;
let sum = 0;
function loop() {
    stepCount += 1;
    let start = performance.now();
    step(grid_a, grid_b);
    sum += performance.now() - start;
    clear();
    print();
    let now = performance.now();
    nextUpdate += DT;
    return setTimeout(loop, Math.max(nextUpdate - now, 0));
}

process.on("SIGINT", () => {
    if (supportsAnsi) process.stdout.write("\x1b[?25h");
    console.log("Average performance: " + (sum / stepCount) + " ms/t");
    process.exit(0);
});

// hide cursor
if (supportsAnsi) process.stdout.write("\x1b[?25l");
print();
loop();
