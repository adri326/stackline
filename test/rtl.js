import fs from "node:fs";
import {expectOutput} from "./common.js";

let src = fs.readFileSync("examples/rtl.txt", "utf8");

export function test() {
    expectOutput(src, 20, [1, 1], "1");
    expectOutput(src, 20, [9, 1], " ");
}
