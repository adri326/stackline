# Stackline

An esoteric language inspired by [Wireworld](https://mathworld.wolfram.com/WireWorld.html) and [ORCA](https://github.com/hundredrabbits/Orca).

It operates with packets of data sent across wires.
These packets are handled with a stack-based language.

## How it works

The world is divided into a grid of cells: each cell has a state (an integer) and a "char" (a Unicode codepoint).

The state of a cell defines which action it will do in the current simulation step:

- `0`, dormant, does nothing
- `1`, active, executes an associated function and usually gets as new state `2`
- `2`, resting, does nothing (also used by the packet system to clean up)
- `3`, waiting, waits on some other cell(s) to finish work

The char defines what the action will be. Here are some examples:

- `-`, `|`, `+` are wires, they transmit signals respectively horizontally, vertically and orthogonally
- `>`, `<`, `^`, `v` are diodes, they only transmit signal to one direction
- `#` sends an incomming signal down and waits on a result, which it then sends horizontally
- `:` executes a set of instructions on its right, then either transmits the signal down and holds or transmits the signal up back to a `#`
- `p` is used to debug things, printing them on lines below `p` that are preceded by a colon. You should use this with caution, as it can [break stuff](./examples/indirect.txt).
- `?` and `¿` are conditions: `?` will send the signal in the same direction as it came if the last element on its stack is truthy, otherwise the signal is diverted orthogonally. `¿` is the inverse of `?` and will only send a signal in the same direction as it came if the last element on its stack is falsy.
- `!` creates an empty signal and transmits it orthogonally

Finally, data travels on the wire and between the cells.
This data is manipulated by instructions, which use a simple [stack-based language](https://esolangs.org/wiki/Stack).
Here are some of them:

- `p`, pushes a number or a string onto the stack. For instance, `p-2.3` pushes `-2.3` and `p"Oh?"` pushes `Oh?`.
- `o`, discards the last element of the stack
- `d`, duplicates the topmost item from the stack. It can take an optional number parameter to specify the `n`-th element from the top of the stack to pop: `p3d` pushes `3` twice on the stack and `p2p3d1` pushes `3`, `2`, `3`.
- `s`, swaps the two topmost items on the stack
- `+`, `-`, `/`, `*`, `%` perform basic arithmetic operations on the two topmost elements of the stack, popping them and pushing the result
- `<`, `>`, `≤`, `≥`, `=` compare the two topmost elements of the stack. If the condition is fulfilled, it pushes back `1`, otherwise it pushes back `0`

When put together, we can write simple programs. The following programs creates a new, empty signal, then puts `0` on it and enters a loop (the rectangular pattern).
The loop adds one on the stack and sums it with the previous value, it then prints the result.

```
!-#-->+<--+--p
  :p0 |   |  :
      +#--+
       :p1
       :+
```

More complex programs can be expressed in this language. You can find some in the [examples](./examples/) folder!

<!-- TODO: proper description of everything -->

## Installing

To install and run this software, you will need [`git`](https://git-scm.com/downloads) (or any git frontend, like [Github Desktop](https://desktop.github.com/)) and [`node.js`](https://nodejs.org/en/download/).

Clone this repository, then navigate into it:

```sh
git clone https://github.com/adri326/stackline-lang
cd stackline-lang
```

Then, install the required dependencies using `npm`:

```sh
npm install
```

## Running

You can run the simulation by calling `node .` followed by the path of the source file.
The source file should be encoded in UTF-8.
For instance, the following runs the "Hello world" example:

```sh
node . examples/hello-world.txt
```

Simply hit `Ctrl-C` to stop the simulation whenever you want.
