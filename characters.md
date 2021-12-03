# Stackline: character reference sheet

This document is split into two halves:
- the ["characters"](#characters), which influence the cellular automaton
- the ["instructions"](#instructions), which act on the data stored in signals

Some characters are *Passive*: they will trigger on their own without being triggered by another cell.

## Characters

### Wires and diodes

| Character | Name | Description |
| :-------: | :--- | :---------- |
| `-` | Horizontal wire  | Transmits signals to the left and/or to the right cells, only if the target cell has a state of `0`. |
| `\|` | Vertical wire   | Transmits signals to the top and/or to the bottom cells, only if the target cell has a state of `0`. |
| `+` | Orthogonal wire  | Combination of the horizontal and vertical wires: transmits signal to any orthogonal direction if the target cell has a state of `0`. |
| `<` | Left diode | Transmits the signal to the left cell if it has a state of `0`. |
| `>` | Right diode | Transmits the signal to the right cell if it has a state of `0`. |
| `^` | Up diode | Transmits the signal to the top cell if it has a state of `0`. |
| `v` | Down diode | Transmits the signal to the bottom cell if it has a state of `0`. |
| `V` (uppercase) | Forcing down diode | Transmits the signal to the bottom cell, *if it has a state other than `2` (resting)*. |

**Examples:**

```
-------------------

A simple, horizontal wire. Signals can be transmitted in
either direction.
```

```
----+   +----
    |   |
    |   |
    +---+

A wire snaking around an imaginary obstacle. How strange.
```

```
>-->---v
   |   |
   |   |
   ^   v

You can use diodes to make sure that the signal does not
climb back the wrong wire. You can also use them in tight
turns to not leak signal on unwanted cells.
```

```
!---v---+----
    |   |
    |   |
    >---^

When arranging diodes in a closed loop, you can create clocks,
incrementors, etc. Do note that a signal entering the "+" will
be duplicated on either side of it. This holds for every cell
that can duplicate signals.
```

### Specials

| Character | Name | Description |
| :-------: | :--- | :---------- |
| `!` | Bang | Produces an empty signal and transmits it to any cell orthogonally adjacent to it, then destroys itself. *Passive* |
| `#` | Hold | Sends the signal down and waits, by settings itself to state `3` (idle), and any horizontally adjacent cell that has state `2` (resting) to state `3`. Once it is reactivated (if the bottom cell has a state of `2` or one of the horizontally adjacent cells has state `3`), unlocks adjacent cells and sends the result signal horizontally. |
| `:` | Execute | Executes the [instructions](#instructions) to its right with the current signal, then sends down the altered signal and becomes state `3` (idle) if the character below it is a `:`. Otherwise, sends the signal up until it finds a non-`:` character, setting every `:` (including itself) to state `2` (resting). *Also used by `p`* |
| `p` | Debug print | Prints the first few elements of the stack into the simulation. Does not check whether or not it will write over important pieces of circuitry, so use at your own risk! Only prints to the right of `:` that are placed right below it. Can be followed by a number that specifies the precision of the numerical values. |
| `.` | Tunnel | Sends the signal to the next `.` in the same direction as it came. Upon receival, acts like a `+`. |
| `H` | Halt | Stops the simulation, can be disabled in the simulation settings. |

`#` and `:` are meant to be used together in almost every scenario.
The way `#` works requires it to be woken from its idle state (`3`), which the common cables and diodes won't do.
This explains why `:` is also complex.

**Examples:**

```
!--#-----------p
   :p0         :

Prints "0" here ^
```

```
!--#-----v
   :     |  ":" can be followed by no instructions,
   :     |  but make sure that there is a space at the
   :     >v    end of its instruction list.
   :p1p2+ >-p
            :
```

```
  >---v      An empty "#"/":" pair can be used to introduce
!-+   >----  delays. The "#" introduces two ticks of delay
  >#-#^      and each ":" adds one tick.
   : :
```

```
!-#---v--+-------p
  :p0 |  |       :
      >#-^
       :p1+

A simple counter, starting at 1. Has a period of 12, but can be made more compact:

!#---v+-----p
 :p0 #^     :
     :p1+      This counter has a period of only 6.
```

```
!---v      Use "." to jump over other pieces of circuitry.
    .      Be careful to not leak your signal to other wires.

!------v
       |
    .  >--
    >----
```

```
!>+-#-------?H
 ^< :Rp0.01<

Overcoming the halting problem :)
```

### Conditions

These conditional cells are meant to be used together with the [comparison instructions](#comparisons).
A [truthy value](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) is a value that aren't falsy.
Empty strings, `±0` and `null` are all falsy.
An empty stack is considered to have a falsy top value.

| Character | Name | Description |
| :-------: | :--- | :---------- |
| `?` | "if" cell | Outputs a signal in the same direction as it came iff the top value is *truthy*. Otherwise, outputs that signal to the two orthogonal sides. Afterwards, pops the stack. |
| `¿` | Inverted "if" cell | Outputs a signal in the same direction as it came iff the top value is *falsy*. Otherwise, outputs that signal to the two orthogonal sides. Afterwards, pops the stack. |
| `‽` (interrobang, `U+203D`) | "if not empty" cell | Outputs a signal in the same direction as it came iff the stack of that signal *isn't empty*. Otherwise, outputs that signal to the two orthogonal sides. |
| `⸘` (inverted interrobang, `U+2E18`) | "if empty" cell | Outputs a signal in the same direction as it came iff the stack of that signal *is empty*. Otherwise, outputs that signal to the two orthogonal sides. |
| `∃` (`U+2203`) | "if exists" cell | Pops the top value from the signal, then outputs the signal in the same direction as it came iff *there is* a variable with as address the popped value. Otherwise, outputs that signal to the two orthogonal sides. |
| `E` | Inverted "if exists" cell | Pops the top value from the signal, then outputs the signal in the same direction as it came iff *there isn't* a variable with as address the popped value. Otherwise, outputs that signal to the two orthogonal sides. |

**Examples:**

Some knowledge of the [instructions](#instructions) is required to understand these examples.
Here are the most important instructions used here:
- `<`, `>`, `≤`, `≥` perform comparisons and return `1` on success and `0` on failure
- `R` pushes a random value between `0` and `1`
- `p` pushes a value on the stack and `o` pops a value from the stack
- `d` duplicates the last value of the stack

```
!--+#--->--?--p
   |:p0 |  |  :
   |    |  |
   >#---^  >--p
    :p1       :

In this example, the "?" will only let through the signal with a value of 1.
The signal with a value of 0 will be diverted down. Upon completion, it should
produce the following:

 --+#--->--?--p
   |:p0 |  |  :1
   |    |  |
   >#---^  >--p
    :p1       :0
```

```
!--+#----->-+-#--->--#--?--p
   |:p1   | | :p1 |  :< |  :
   |      | |     |     |
   >#----#^ >-#---^     >--p
    :p-1 :    :p-1         :
    :    :
    :    :

Here, several signals are created, but only one makes it to the top branch.

Artificial delays had to be added for demonstration purposes.
```

```
!--v#---<
   |:oo ¿#--p
   |    |:o :
   >#---^
    :Rdp0.5<

Produces a random value and checks that it is less than 0.5; if not, loops
back and produces a new random number. The "o" instruction is required here
to get rid of the value used by the "¿".
```

```
>--C#---⸘---p
    :←0     :

Because the "←" instruction does not push anything on the stack if there
is no variable stored at the indicated location, we can make conditionals
based on the existence of variables.
```

```
>--#---∃#--->--p
   :p0 |:←0 |  :
       >#---^
        :p0

We can use the ∃/E cells to simplify reads from variables which may not exist yet.
This example does the same thing as the previous example, but it will print a
default value of 0 if the variable didn't exist.
```

### Signal manipulators

| Character | Name | Description |
| :-------: | :--- | :---------- |
| `"` | Buffer | When first powered, spawns a `o` below it and stores the signal in it. Later, it transmits the signal stored in the `o` and stores the received signal instead. |
| `o` | Storage | Stores a signal; when powered, turns into state `3` (idle) and triggers the cells orthogonally adjacent to it. *Can be reset with `k`* |
| `f` | Fuse | Only lets a signal through once: it then turns into state `3`. *Can be reset with `k`* |
| `c` | Clear | Clears a signal, transmitting a brand new signal instead. |
| `C` (uppercase) | Clear stack | Clears the stack from a signal, transmitting a new signal with an empty stack but preserving the heap. |
| `D` (uppercase) | Clear heap | Clears the heap from a signal, transmitting a new signal with an empty heap but preserving the stack. |
| `k` | Kill | When receiving a signal, sets every cell in the same direction as the signal to state `2` (resting), until it either reaches the end of the network or a wall (`=`). |

**Examples:**

```
!#--->-"----p
 :p0 |      :
     |
     |
!#---^
 :p1

The first signal to go through the " cell will be [0]; it will then be stored.
Next, the signal with [1] will go through the " cell: it will be stored, while
the previous [0] signal will be sent along the wire. This means that at the
end, the network looks like the following:

 #--->-"----p
 :p0 | o    :0
     |
     | ^ [1] is stored in here
 #---^
 :p1
```

```
>---+-C-#---⸘#---v
    |   :←0 |:p0 |
    |       >----v
    |            |
    >-----------o»---

Here the signal if forked with "+": the bottom branch is stored in a "o",
while the top branch gets its stack cleared. We then read from the heap: if
the variable at 0 was present, then the signal is directed down. Otherwise,
the value "0" is pushed on the stack. When "»" is triggered, it will concatenate
both stacks.
```

```
 ==
!>+-----+
 ^<     |
        |
 kk     |
 ++-----<

This example showcases a simple 4-tick clock, that is wired to a kill switch.
As soon as the kill switch is triggered, the clock will be turned off.
```

### Join operations

| Character | Name | Description |
| :-------: | :--- | :---------- |
| `x` | Merger | Waits until both the top and bottom cells have a state of `3` (idle): if that happens, then the stack of both signals are merged and the heap from the bottom signal is written over the heap from the top signal. The signal is then transmitted horizontally. |
| `»` (`U+00BB`) | Extract right | If the left cell has a state of `3` (idle), then appends the current signal to it and sends it right. |
| `«` (`U+00AB`) | Extract left | If the right cell has a state of `3` (idle), then appends it to the current signal and sends it left. |

**Note on the way data is merged:**
These join operators have to merge data at some point. There are two bits of data to combine: the stack and the heap.

**"Merging"** (as done by `x`) will read from the stack of both signals in a round-robin fashion.
For instance, given the following circuit:

```
A → >-o
      x-- → R
B → >-o
```

We get the following results (remember that stack manipulations are done from right to left):

| A (stack) | B (stack) | **R (stack)** |
| :-------: | :-------: | :------------ |
| `[]` | `[]` | `[]` |
| `[1]` | `[2]` | `[2, 1]` |
| `[3, 1]` | `[4, 2]` | `[4, 3, 2, 1]` |
| `[]` | `[1, -1]` | `[1, -1]` |
| `[0]` | `[1, -1]` | `[1, -1, 0]` (A is read first) |
| `[1, -1]` | `[0]` | `[1, 0, -1]` (B is only read after A) |
| `[5, 4, 3, 2, 1]` | `[0]` | `[5, 4, 3, 2, 0, 1]` |

In this example, the heap of B is written over the heap of A:

```
A = {0 => 134, 1 => -67}
B = {1 => 36,  2 => 0}
R = {0 => 134, 1 => 36, 2 => 0}
```

**"Appending"** takes all of the values from one stack and puts it at the top of another stack.

```
        ↓ B            A ↓

        v                v
        |                |
A → >--o»--- → R  R ← ---«o--< ← B
```

The table for these two circuits is the same and is simpler to understand:

| A (stack) | B (stack) | **R (stack)** |
| :-------: | :-------: | :------------ |
| `[]` | `[]` | `[]` |
| `[1]` | `[2]` | `[1, 2]` |
| `[1, -1]` | `[0, 4]` | `[1, -1, 0, 4]` |
| `[0]` | `[1, -1]` | `[0, 1, -1]` |

The heap is manipulated in the same way as with `x`, with `B` being written over `A` in both cases.
The difference between the two circuits is that:

- `»` stores `A` and waits for `B`
- `«` stores `B` and waits for `A`

**Examples:**

```
--+-v  >--p
  f |  |  :
  co»v |  :
   ^-+-^  :
          :
          :

This circuit implements memory, where each incoming signal is appended
to the stored value and the stored value is then updated.
```

```
>-C-#--‽o
    :←0 x---p
>-C-#--‽o   :
    :←1     :

Waits for two signals and makes sure that the variables from 0 and 1 are
read. Here the circuit will print the value of variable 0 on top and
of variable 1 on the bottom line.
```

### Input/output

Input is done asynchronously: a signal waiting on an input will be blocked on its corresponding cell until its condition is fulfilled.
The remainder of the circuit will run in the meantime.

The input file is by default `stdin`, but this can be overridden with the `-i` or `--input` parameter.
Similarly, the output file is by default `stdout`, but this can be overridden with the `-o` or `--output` parameter.

| Character | Name | Description |
| :-------: | :--- | :---------- |
| `r` | Read character | Reads a single character from the input and pushes it. If it must wait, then sets adjacent cells with state `2` to state `3` (idle) and keeps itself at state `1`. Acts like `+` upon completion. |
| `R` | Read line | Reads a single line from the input and pushes it. If it must wait, then sets adjacent cells with state `2` to state `3` (idle) and keeps itself at state `1`. Acts like `+` upon completion. Does not include the newline. |
| `w` | Write (no newline) | Pops the top value from the stack and writes it to the output, without a newline. Acts like `+` upon completion. |
| `W` | Write (with newline) | Pops the top value from the stack and writes it to the output, appending a newline to it. Acts like `+` upon completion. |

**Examples:**

To pass an input file to the Node.JS version, give it the `-i` parameter, like so:

```sh
node . examples/cat.txt -i examples/long.txt
```

To pass an output file, give it the `-o` parameter. You can pass both `-i` and `-o`:

```sh
node . examples/cat.txt -i examples/long.txt -o my_long.txt
```

Following is an example that reads a number and doubles it:

```
!R-#-----p
   :~p2* :

Please input your number and press enter. Alternatively, use "-i" to specify
a file with a number on its first line.
```

```
!
>R+-‽#---w
| ‽v :p0%
^#<>-#---WH
 :o  :p""

Reads a file or stdin and only prints the first character of each line.
This doesn't work in the terminal, so you will need to use the "-o" flag
to print to a file. Use "ctrl+d" in stdin mode whenever you want to stop
the input.

The top branch is executed when a line was read and isolates the first character,
before printing it without a newline. The bottom branch is executed when no
line could be read (stdin was closed with "ctrl-d" or EOF): prints a newline
and ends the program.
```

## Instructions

Instructions are interpreted by the `:` [character](#specials), you can put multiple instructions on the same line:

```
!                          !
#-----                     #-----
:p0    is equivalent to    :p0p1
:p1
```

### Stack manipulation

| Character | Name | Description |
| :-------: | :--- | :---------- |
| `p` | Push | Pushes a number or a string to the stack. The value to be pushed is specified right after that `p`: if it is a string, it should be enclosed with quoting marks (`"`). |
| `o` | Pop | Pops a value from the stack, discarding it. If the stack is empty, does nothing. |
| `d` | Duplicate | Duplicates the top value from the stack. If it is followed by an integer, duplicates the `n`-th value from the top of the stack. |
| `s` | Swap | Swaps the two top values from the stack: `[..., a, b]` -> `[..., b, a]` |
| `l` | Stack length | Pushes on the stack the length of the stack. |
| `[` | Rotate clockwise | Takes the top three values from the stack and applies a clockwise rotation (`[..., a, b, c]` -> `[..., b, c, a]`). If it is followed by an integer, rotates the last `n` values from the stack. |
| `]` | Rotate counter-clockwise | Takes the top three values from the stack and applies a counter-clockwise rotation (`[..., a, b, c]` -> `[..., c, a, b]`). If it is followed by an integer, rotates the last `n` values from the stack. |
| `K` | Keep | Keeps the top `n` values from the stack, discarding any other value. If a number is specified after `K`, it will be used as `n`; otherwise, `n` will be popped from the stack. |
| `T` | Trim | Trims off the top `n` values from the stack, discarding them. This is the inverse operation of `K`. If a number is specified after `T`, it will be used as `n`; otherwise, `n` will be popped from the stack. |

**Examples:**

```
!#--------+---p
 :p0      |   :
 :p1      |   :
          >#--p
           :s :
              :

Prints 1,0 on top (values are read from the top of the stack) and 0,1 on the bottom
```

```
!#---v#---<
 :p0 |:o  ¿-------
     >#---^
      :dlp10≥

Fills the stack with 10 zeroes.
```

```
!#---------+-#---p  Removes "4":
 :p1p2p3p4 | :o  :
           |     :
           |     :
           |
           +-#---p  Removes "3":
           | :so :
           |     :
           |     :
           |
           +-#---p  Removes "2":
           | :[o :
           |     :
           |     :
           |
           >#----p  Removes "1":
            :[4o :
                 :
                 :

Using swap, rotate and pop, we can selectively remove elements in the stack that aren't on top.
```

```
         >#-----#-----o
!#---v >-|:T0K1 :dd*+ x-#--v
 :p1 | | >#-----#-----o :+ o
 :p2 >-+  :T1K1 :dd*+      x-#---p
 :p3   | >#-----#-----o    o :+  :
 :p4   >-|:T2K1 :dd*+ x-#--^
         >#-----#-----o :+
          :T3K1 :dd*+

You can use T and K to easily distribute a piece of work among a set of concurrent circuits.
Here, the sum from 1 to 4 of x^2+x is computed, and it looks like a fish :)
```

### Arithmetics

| Character | Name | Description |
| :-------: | :--- | :---------- |
| `+` | Add | Pops two values and adds them together, pushing the result. For strings, this concatenates them. |
| `-` | Subtract | Pops two numbers, then substracts them and pushes the result. |
| `*` | Multiply | Pops two values, then multiplies them and pushes the result. If the left operand is a string and the right operand a number, then the string is repeated `right` times. |
| `/` | Divide | Pops two values, then divides them and pushes the result. If the left value is a string and the right value is a number, then slices the string by that number (if positive, keeps the `n` first characters and if negative, keeps the `-n` last characters). |
| `%` | Modulo | Pops two values, then computes the modulo between them and pushes the result. If the left operand is a string and the right operand a number, then pushes back the `right`-th character from `left` instead. |
| `√` | Square root | Pops a value and pushes back the square root of that value. For strings, pushes the string back. |
| `a` | Absolute | Pops a value and pushes back its absolute value. For strings, pushes the length of the string. |
| `f` | Floor | Pops a number and floors it. If a number is specified after `f`, then floors to `n` decimals. |
| `c` | Ceil | Pops a number and ceils it. If a number is specified after `c`, then ceils to `n` decimals. |
| `r` | Round | Pops a number and rounds it. If a number is specified after `r`, then rounds to `n` decimals. |
| `~` | String convert | Pops a value: if it a string, tries to convert it to a number and pushes it (pushes `0` if the string isn't a valid number). If it is a number, converts it to a string and pushes it. If it is followed by a number, uses it as precision. |
| `R` | Random | Pushes a random number between 0 and 1. If a number is specified after `R`, then pushes a random number between 0 and that value. |

**Examples:**

```
               >-#-----p
!              | :p2*  :
#---v-+---v  >-+-#-----p
:p1 >#^   |  | | :p3*  :
     :p1+ |  | >-#-----p
          >--+   :p4*  :
             | >-#-----p
             | | :p5*  :
             >-+-#-----p
               | :p6*  :
               >-#-----p
                 :p7*  :

A small multiplication table (that only goes up to 7).
```

```
!#-----p
 :R10f :

Generates a random integer between 0 and 9.
```

```
v-+--#-------?#--p4
| |  :R2p1-   :o :
>-^! :R2p1-      :
     :d1d*d1d*+p1<

Generates uniform random points on a disk of radius 1, using rejection sampling.
```

```
  >----------------o
v-+                x-+-#------p
| |<#--!-#-------->o<# :d1a%% :
>#^ :p0  :p"Hello"   :o
 :p1+

Prints the letters of "Hello" one by one.
```

```
!
#------#-------p
:p0.1  :~3     :
:p0.2
:+

Add a number after "~" to control the precision of the conversion to a string.
```

### Comparisons

Boolean values are encoded as integers: a non-zero value will be considered truthy by the conditional characters, but all of the comparison operators will either return 0 or 1.

| Character | Name | Description |
| :-------: | :--- | :---------- |
| `<` | Less than | Pops two values, pushes 1 if `left < right`, pushes 0 otherwise. |
| `>` | Greater than | Pops two values, pushes 1 if `left > right`, pushes 0 otherwise. |
| `≤` | Less than | Pops two values, pushes 1 if `left <= right`, pushes 0 otherwise. |
| `≥` | Less than | Pops two values, pushes 1 if `left >= right`, pushes 0 otherwise. |
| `=` | Equal | Pops two values, pushes 1 if `left === right`, pushes 0 otherwise. |
| `≠` | Not equal | Pops two values, pushes 1 if `left !== right`, pushes 0 otherwise. |

**Examples:**

```
!#------------+#--p
 :p"Baba"     |:= :
 :p"Keke"     +#--p
              |:≠ :
              +#--p
              |:< :
              +#--p
              |:> :
              +#--p
              |:≤ :
              +#--p
              |:≥ :

Expected output is 0,1,1,0,1,0
```

```
!#------#--?->-p
 :p"23" :≠ | | :
 :p23      >#^
            :p"Assertion error"

A string cannot be equal to a number.
```

### Variable read/write

Each signal is equipped with both a stack (an array with operations on the topmost values) and a heap (a number -> value Map).
The notation `{key1 => value1, key2 => value2, ...}` will be used to represent the heap of a signal.

| Character | Name | Description |
| :-------: | :--- | :---------- |
| `←` (left arrow, `U+2190`) | Variable read | If a number is specified after `←`, then reads the variable pointed to at that address. Otherwise, pops a number and reads the variable pointed to at that address. If the variable does not exist, does nothing. |
| `→` (right arrow, `U2192`) | Variable write | If a number is specified after `→`, then pops a value and writes it to the address pointed to by that number. Otherwise, pops the address and the value to write to the variable and performs the write. |

**Variable read:**

Consider the following circuit:

```
A → >----#-----p
         :←N   :
                ^ R
```

`←` will read from the heap of signal `A`. Its behavior will vary based on `N` and (if `N` is empty), the top value of `A`'s stack:

| A (stack) | A (heap) | N | R (stack) |
| --------: | :------- |---|---|
| `[]` | `{0 => "A"}` | `0` | `[0]` |
| `[0]` | `{0 => "A"}` | empty | `[0]` |
| `[0]` | `{0 => "A", 1 => -17}` | `1` | `[0, -17]` |
| `[1]` | `{0 => "A", 1 => -17}` | empty | `[-17]` |
| `[0]` | `{0 => "A", 1 => -17}` | `3` | `[0]` |
| `[3]` | `{0 => "A", 1 => -17}` | empty | `[]` |

**Variable write:**

Now, consider the following circuit:

```
A → >----#----- → R
         :→N
```

`→` will write to the heap of signal `A` and its behavior will, like the previous circuit, depend on `N` and the top value of `A`'s stack:

| A (stack) | A (heap) | N | R (stack) | R (heap) |
| --------: | :------- |---| --------: | :------- |
| `[3]` | `{}` | `0` | `[]` | `{0 => 3}` |
| `[3, 0]` | `{}` | empty | `[]` | `{0 => 3}` |
| `[3]` | `{0 => -1}` | `0` | `[]` | `{0 => 3}` |
| `[3, 0]` | `{0 => -1}` | empty | `[]` | `{0 => 3}` |
| `[127, 3]` | `{0 => -1}` | `1` | `[127]` | `{0 => -1, 1 => 3}` |
| `[127, 3, 1]` | `{0 => -1}` | empty | `[127]` | `{0 => -1, 1 => 3}` |

**Examples:**

Because `←` will do nothing if the variable pointed to doesn't exist, we can use `‽` to filter signals according to the result:

```
!#-----v-+---#-‽-p
 :p1→1 >#^   :←  :
 :p3→2  :p1+
 :p2→5
 :p0

This circuit prints "1", "3" and "2" (after a short delay),
before looping indefinitely.
```

More complex data structures can be encoded onto the heap.
The following circuit does the same as `*(list + n)` in C:

```
!#-------+#--->--#-----‽-p
 :p1→0   |:p0 |  :←0+    :
 :p13→1  |    |  :←
 :p27→2  +#---^
 :p-9→3  |:p1 |
         |    |
         >#---^
          :p2

This circuit prints "13", "27" and "-9" in succession. Our list is stored statically,
beginning at address 1 and ending at address 3. The first half, `←0+`, gets the
base address of the list and adds it with the value on top of the stack. Finally,
`←` reads the variable at the computed address.
```
