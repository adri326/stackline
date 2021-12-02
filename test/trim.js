import fs from "node:fs";
import {expectOutput} from "./common.js";

let src = fs.readFileSync("examples/trim.txt", "utf8");

export function test() {
    expectOutput(src, 20, [12, 2], "2");
    expectOutput(src, 20, [12, 3], "1");
    expectOutput(src, 20, [12, 4], "0");
    expectOutput(src, 20, [12, 5], "");

    expectOutput(src, 30, [12, 7], "7");
    expectOutput(src, 30, [12, 8], "6");
    expectOutput(src, 30, [12, 9], "5");
    expectOutput(src, 30, [12, 10], "");

    expectOutput(src, 25, [29, 2], "");
    expectOutput(src, 25, [29, 4], "0");
    expectOutput(src, 25, [29, 5], "");

    expectOutput(src, 25, [29, 8], "");
    expectOutput(src, 25, [29, 10], "0");
    expectOutput(src, 25, [29, 11], "");
}
