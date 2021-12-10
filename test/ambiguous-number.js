import fs from "node:fs";
import {expectOutput} from "./common.js";

let src = fs.readFileSync("examples/ambiguous-number.txt", "utf8");

export function test() {
    expectOutput(src, 20, [14, 1], "2");
    expectOutput(src, 20, [14, 2], "0");
    expectOutput(src, 20, [14, 3], "");
    expectOutput(src, 20, [16, 6], "0");
}
