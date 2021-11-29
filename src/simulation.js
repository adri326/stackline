"use strict";

import CHARS from "./chars.js";

const PASSIVES = new Set();
PASSIVES.add("!");

function power_char(char, x, y, grid, newGrid) {
    if (CHARS.has(char)) {
        return CHARS.get(char)(x, y, grid, newGrid) ?? true;
    } else {
        return true;
    }
}

export let activeGrid = false;
/// Progresses the simulation by one step
export function step(grid_a, grid_b) {
    let grid = activeGrid ? grid_a : grid_b;
    let newGrid = activeGrid ? grid_b : grid_a;
    activeGrid = !activeGrid;

    // Pass 0: set everything to inactive
    newGrid.deactivate();

    // Pass 1: General updates
    grid.forEach((x, y, char, power) => {
        if (power == 0 && PASSIVES.has(char)) {
            power = 1;
            newGrid.setPower(x, y, 1);
        }

        if (power == 1) {
            newGrid.setActive(x, y);
            if (power_char(char, x, y, grid, newGrid)) {
                newGrid.setPower(x, y, 2);
            }
        }
    });

    // Pass 2: Unpower post-signal cells
    grid.forEach((x, y, char, power) => {
        if (power == 2 && newGrid.getPower(x, y) == 2) {
            newGrid.setPower(x, y, 0);
            newGrid.removeSignal(x, y);
        }
    });

    // Pass 3: Copy newGrid into grid
    newGrid.copyData(grid);
}

export default step;
