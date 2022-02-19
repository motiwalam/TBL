# TBL
A calculator language with lists and higher order functions written in pure javascript

TBL is a programming language. The fundamental data types are complex numbers, lists, and functions.

Functions can take anything as an argument, including other functions. 

Lists can contain anything, including functions and other lists.

## Literals
The literal types are numbers (which are complex) and lists.
Some example numbers:
 * 0.13
 * 1.69
 * 1e5
 * 3i
 * 5 + 4i

Lists are denoted by `[` and `]`. Values inside of the list are separated by commas.
Some example lists:
 * [1, 2, 3]
 * [[1,2], 3]
 * [1i, 3 + 4, [[[1,2],[3,4]]]]
 * [a $ 3\*a, 4, [7]] <- a list that contains a function, a number, and a list


## List manipulation

The following functions allow for working with lists:
 * get [list, index]
 * set [list, index, value]
 * push [list, value]
 * pop [list]
 * len [list]
 * map [function, list]
 * filter [function, list]
 * reduce [function, list]
 * concat [list1, list2]

## Functions
TBL supports functions and higher order functions.

Functions are defined with the definition operator, `$`. The parameters of the function are given as a list on the left of the operator, and the body of the function is given on the right. 

Inside of a function, you can use the special symbol `&` to denote the function currently being defined, thus enabling recursion for anonymous functions. Alternatively, assigning the function to a name that is then used inside of the function also does the same thing.

Functions are applied with the application operator, `@`. The function appears on the left of the operator, and the arguments are passed as a list on the right of the operator.

## Assignment
A name can be associated with a value through the assignment operator, `:`.

## Conditions
Anything other than the complex number 0 + 0i is treated as true.
The conditional operator, `?`, takes an expression on its left and a list of two expressions on its right. It evaluates the first if the left expression is true, and the second if the left expression is false.

## The loop operator
The loop operator , `!`, takes an expression on its left, and an expression on its right, and executes the right hand side expression as long as the left hand side expression evaluates true.

## Other operators

### Arithmetic
 * exponentiation: ^
 * multiplication: *
 * division: /
 * addition: +
 * subtraction: -
 * modulus: %

### Comparisons
 * equal: =
 * less than: <
 * greater than: >
 * less than or equal to: ≤
 * greater than or equal to: ≥


## Standard Library
The standard library provides a number of functions:
 * all arithmetic operators are available as functions:
   * pow
   * mul
   * div
   * add
   * sub
   * mod
 * likewise for the comparison operators:
   * eq
   * lt
   * lte
   * gt
   * gte
 * boolean operations:
   * and
   * or
   * not
   * bool (the boolean identity)
 * max
 * min
 * abs
 * dup (duplicate object)
 * im (get imaginary component)
 * re (get real component)
 * math functions
   * floor
   * ceil
   * sin
   * cos
   * tan
   * asin
   * acos
   * atan
   * sinh
   * cosh
   * tanh
   * asinh
   * acosh
   * atanh
   * log
   * log10
   * log2
 * random
 * neg (negate a number)
 * encode (encode a number in base b)
 * decode (decode a list of digits in base b)
 * accumulate (apply a function n times and save intermediate results)
 * nwise (take consecute n-tuples from a list)
 * range (produce a list of numbers from start to end with a step)
 * reductions:
   * sum: (reduce add)
   * prod: (reduce multiply)
   * all: (reduce and)
   * any: (reduce or)
   * maxl: (reduce max)
   * minl: (reduce min)


## Examples
Example programs can be found in the examples/ folder

## Running
Inside of a Node shell in the root of this repository, run:
```js
const { Calculator } = await import('./calc.mjs');
const c = new Calculator();
c.eval('1 + 1');
// use c.eval() to evaluate new expressions
```
