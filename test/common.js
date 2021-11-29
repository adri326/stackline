import assert from "node:assert";
import Grid from "../src/grid.js";
import {step, activeGrid} from "../src/simulation.js";

export function expectOutput(source, steps, location, string) {
    let grid_a = Grid.fromString(source);
    let grid_b = grid_a.clone();

    for (let n = 0; n < steps; n++) {
        step(grid_a, grid_b);
    }

    let grid = activeGrid ? grid_a : grid_b;

    for (let n = 0; n <= string.length; n++) {
        let expected = n < string.length ? string[n] : " ";
        let actual = grid.getChar(location[0] + n, location[1]) ?? " ";
        assert.equal(actual, expected);
    }
}
