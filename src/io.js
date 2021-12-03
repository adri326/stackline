"use strict";

// TODO: cross-platform thing? or move the nodejs-specific things in another file
import stream from "node:stream";

const DEFAULT_ONEXIT = () => {process.exit(0)};

class IO {
    constructor(ioStream, onexit = DEFAULT_ONEXIT) {
        this.buffer = "";
        this.closed = false;
        this.write = (str) => {};

        if (ioStream instanceof stream.Readable) {
            ioStream.on("data", (data) => {
                let str;
                if (data instanceof Buffer) {
                    str = data.toString("utf8");
                } else {
                    str = data.toString();
                }

                for (let n = 0; n < str.length; n++) {
                    if (ioStream.isTTY && ioStream.isRaw) {
                        if (str[n] === "\u0003") { // ctrl-c
                            onexit();
                        } else if (str[n] === "\u001a") { // ctrl-z
                            process.kill(process.pid, "SIGSTOP");
                        } else if (str[n] === "\u007f" || str[n] === "\u0008") { // backspace
                            if (n > 0) {
                                str = str.slice(0, n - 1) + str.slice(n + 1);
                                n -= 2;
                            } else {
                                this.buffer = this.buffer.slice(0, -1);
                                str = str.slice(1);
                                n -= 1;
                            }
                            continue;
                        } else if (str[n] === "\r") {
                            str = str.slice(0, n) + "\n" + str.slice(n + 1);
                        } else if (str[n] === "\u0004") { // ctrl-d
                            this.closed = true;
                            ioStream.setRawMode(false);
                            ioStream.pause();
                            str = str.slice(0, -1);
                            break;
                        }
                    }
                }

                this.buffer += str.replace(/\r/g, "\n");
            });

            ioStream.on("close", (data) => {
                this.closed = true;
            });

            ioStream.on("end", (data) => {
                this.closed = true;
            });

            if (ioStream.isTTY && ioStream.setRawMode) {
                ioStream.setRawMode(true);
                ioStream.resume();
            }
        } else if (ioStream instanceof stream.Writable) {
            this.write = (str) => {
                ioStream.write(str);
            }
        }
    }

    hasChar() {
        return this.buffer.length > 0;
    }

    getChar() {
        let char = this.buffer[0].replace(/\r/, "\n");
        this.buffer = this.buffer.slice(1);
        return char;
    }

    isClosed() {
        return this.closed;
    }

    hasLine() {
        return this.buffer.includes("\n");
    }

    getLine() {
        let index = this.buffer.indexOf("\n");
        let line = this.buffer.slice(0, index);
        this.buffer = this.buffer.slice(index + 1);
        return line;
    }
}

export default IO;
