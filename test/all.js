#!/bin/env node

import * as fork from "./fork.js";
import * as rtl from "./rtl.js";
import * as join from "./join.js";
import * as if_exists from "./if_exists.js";
import * as trim from "./trim.js";
import * as delay from "./delay.js";
import * as ambiguous_number from "./ambiguous-number.js";

fork.test();
rtl.test();
join.test();
if_exists.test();
trim.test();
delay.test();
ambiguous_number.test();
