#!/bin/env node

import fs from "node:fs";
import {expectOutput} from "./common.js";

let src = fs.readFileSync("examples/fork.txt", "utf8");

export function test() {
    expectOutput(src, 20, [12, 1], "18");
    expectOutput(src, 20, [12, 3], "5");
}
