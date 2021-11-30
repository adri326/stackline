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
| `p` | Debug print | Prints the first few elements of the stack into the simulation. Does not check whether or not it will write over important pieces of circuitry, so use at your own risk! Only prints to the right of `:` that are placed right below it. |
| `.` | Tunnel | Sends the signal to the next `.` in the same direction as it came. Upon receival, acts like a `+`. |

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

### Conditions

These conditional cells are meant to be used together with the [condition instructions](#conditions-2).
A [truthy value](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) is a value that aren't falsy.
Empty strings, `±0` and `null` are all falsy.
An empty stack is considered to have a falsy top value.

| Character | Name | Description |
| :-------: | :--- | :---------- |
| `?` | "if" cell | Outputs a signal in the same direction as it came iff the top value is *truthy*. Otherwise, outputs that signal to the two orthogonal sides. |
| `¿` | Inverted "if" cell | Outputs a signal in the same direction as it came iff the top value is *falsy*. Otherwise, outputs that signal to the two orthogonal sides. |
| `‽` (interrobang, `U+203D`) | "if empty" cell | Outputs a signal in the same direction as it came iff the stack of that signal *is empty*. Otherwise, outputs that signal to the two orthogonal sides. |
| `⸘` (inverted interrobang, `U+2E18`) | Inverted "if empty" cell | Outputs a signal in the same direction as it came iff the stack of that signal *isn't empty*. Otherwise, outputs that signal to the two orthogonal sides. |

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
