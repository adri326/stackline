#!/bin/env node

import * as fork from "./fork.js";
import * as rtl from "./rtl.js";
import * as join from "./join.js";

fork.test();
rtl.test();
join.test();
