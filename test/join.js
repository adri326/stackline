import fs from "node:fs";
import {expectOutput} from "./common.js";

let src = fs.readFileSync("examples/join.txt", "utf8");

export function test() {
    expectOutput(src, 25, [16, 1], "3");
    expectOutput(src, 25, [16, 2], "1");

    expectOutput(src, 25, [17, 6], "");
    expectOutput(src, 25, [17, 7], "");
    expectOutput(src, 25, [17, 8], "");
    expectOutput(src, 25, [17, 9], "");

    expectOutput(src, 40, [16, 1], "4");
    expectOutput(src, 40, [16, 2], "2");

    expectOutput(src, 40, [14, 3], "3");
    expectOutput(src, 40, [14, 4], "1");

    expectOutput(src, 40, [17, 6], "3");
    expectOutput(src, 40, [17, 7], "4");
    expectOutput(src, 40, [17, 8], "1");
    expectOutput(src, 40, [17, 9], "2");
}
