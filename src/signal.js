
/// Represents a signal, which is a stack/heap pair
export class Signal {
    constructor(stackOrSignal = [], variables = null) {
        if (stackOrSignal instanceof Signal) {
            // Clone stackOrSignal
            this.originX = stackOrSignal.originX;
            this.originY = stackOrSignal.originY;
            this.stack = [...stackOrSignal.stack];
            this.variables = new Map(stackOrSignal.variables);
        } else if (Array.isArray(stackOrSignal)) {
            if (variables instanceof Map || Array.isArray(variables)) {
                this.variables = new Map(variables);
            } else if (variables === null || variables === undefined) {
                this.variables = new Map();
            } else {
                throw new Error("Parameter error: expected 'variables' to be iterable or null, got " + variables);
            }

            this.originX = null;
            this.originY = null;

            this.stack = stackOrSignal;
        }
    }

    setOrigin(x, y) {
        this.originX = x;
        this.originY = y;
    }

    push(value) {
        return this.stack.push(value);
    }

    pop() {
        return this.stack.pop();
    }

    peek(offset = 0) {
        return offset < this.stack.length ? this.stack[this.stack.length - offset - 1] : null;
    }

    set(name, value) {
        this.variables.set(name, value);
    }

    get(name) {
        return this.variables.get(name);
    }

    has(name) {
        return this.variables.has(name);
    }

    get length() {
        return this.stack.length;
    }

    concat(...signals) {
        this.stack = this.stack.concat(...signals.map(signal => signal.stack));

        for (let signal of signals) {
            for (let [key, value] of signal.variables) {
                this.variables.set(key, value);
            }
        }

        return this;
    }

    reverse() {
        this.stack.reverse();

        return this;
    }

    trim(amount) {
        if (amount >= this.stack.length) {
            this.stack = [];
        }
        this.stack = this.stack.slice(0, this.stack.length - amount);
    }

    keep(amount) {
        if (amount > this.stack.length) {
            amount = this.stack.length;
        }
        this.stack = this.stack.slice(this.stack.length - amount, this.stack.length);
    }
}

export default Signal;
