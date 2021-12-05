#!/bin/env node

import fs from "node:fs";
import {expectOutput} from "./common.js";

let src = fs.readFileSync("examples/delay.txt", "utf8");

export function test() {
    expectOutput(src, 17, [2, 4], "");
    expectOutput(src, 18, [2, 4], "ok");
    expectOutput(src, 27, [14, 4], "");
    expectOutput(src, 28, [14, 4], "ok");
}
