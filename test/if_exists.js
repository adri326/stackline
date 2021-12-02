import fs from "node:fs";
import {expectOutput} from "./common.js";

let src = fs.readFileSync("examples/if_exists.txt", "utf8");

export function test() {
    expectOutput(src, 30, [18, 1], "");
    expectOutput(src, 30, [17, 3], "1");
    expectOutput(src, 30, [17, 5], "");
    expectOutput(src, 30, [18, 7], "2");
}
