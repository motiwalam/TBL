# TBL
A calculator language with lists and higher order functions written in pure javascript

TBL is a programming language. The fundamental data types are complex numbers, lists, and functions.

Functions can take anything as an argument, including other functions. 

Lists can contain anything, including functions and other lists.

## Literals
The literal types are numbers (which are complex) and lists.
The literal syntax for numbers is quite simplistic. Any thing that matches the regular expression `^(([0-9])|(\.[0-9])|(~(([0-9])|(\.[0-9]))))` is passed into `parseFloat`. 

This results in some funny behaviour where `134jfdfjdkjgkdfjgdkfgj` is just `134`.

Since `-` is taken as the binary subtraction operator, negative literals are done by prefixing a number with `~`. This is *not* negation, it is part of the literal syntax only.

A literal is treated as real, unless suffixed by the letter `i`, in which case it is treated as an imaginary number.

Some example numbers:
 * `0.13`
 * `1.69`
 * `1e5`
 * `3i`
 * `5 + 4i`
 * `~40`
 * `~9 + 6i`

Lists are denoted by `[` and `]`. Values inside of the list are separated by commas.
Some example lists:
 * `[1, 2, 3]`
 * `[[1,2], 3]`
 * `[1i, 3 + 4, [[[1,2],[3,4]]]]`
 * `[a $ 3*a, 4, [7]]` <- a list that contains a function, a number, and a list


## List manipulation

The following functions allow for working with lists:
 * `get` [list, index]
 * `set` [list, index, value]
 * `push` [list, value]
 * `pop` [list]
 * `len` [list]
 * `map` [function, list]
 * `filter` [function, list]
 * `reduce` [function, list]
 * `accumulate` [function, list] (reduction with intermediate results)
 * `concat` [list1, list2]

## Functions
TBL supports functions and higher order functions.

Functions are defined with the definition operator, `$`. The parameters of the function are given as a list on the left of the operator, and the body of the function is given on the right. 

Inside of a function, you can use the special symbol `&` to denote the function currently being defined, thus enabling recursion for anonymous functions. Alternatively, assigning the function to a name that is then used inside of the function also does the same thing.

Functions are applied with the application operator, `@`. The function appears on the left of the operator, and the arguments are passed as a list on the right of the operator.

## Assignment
A name can be associated with a value through the assignment operator, `:`.

TBL also has multiple assignments. 

If the left operand to `:` is a list and the right is a value or a singleton list, then each identifier in the left operand is assigned a duplicate of the right value.

If the left operand `:` is a list and the right is a list of equal length, then each identifier in the left operand is assigned the corresponding value in the right operand.

## Conditions
Anything other than the complex number 0 + 0i is treated as true.
The conditional operator, `?`, takes an expression on its left and a list of two expressions on its right. It evaluates the first if the left expression is true, and the second if the left expression is false.

## Looping

### While loop
The while loop operator , `!`, takes an expression on its left, and an expression on its right, and executes the right hand side expression as long as the left hand side expression evaluates true.

### For loop

The for loop operator, `#`, takes a list of three expressions on its left and a body expression on the right. The first expression is the initializer, the second is the condition, the third is the update. The initializer is executed first, and then the body is executed as long as the condition is not true. The update expression is executed every time after the body is executed.

## Other operators

### Arithmetic
 * exponentiation: `^`
 * multiplication: `*`
 * division: `/`
 * addition: `+`
 * subtraction: `-`
 * modulus: `%`

### Comparisons
 * equal: `=`
 * less than: `<`
 * greater than: `>`
 * less than or equal to: `≤`
 * greater than or equal to: `≥`


## Standard Library
The standard library provides a number of functions:
 * all arithmetic operators are available as functions:
   * `mul`
   * `pow`
   * `div`
   * `add`
   * `sub`
   * `mod`
 * likewise for the comparison operators:
   * `eq`
   * `lt`
   * `lte`
   * `gt`
   * `gte`
 * boolean operations:
   * `and`
   * `or`
   * `not`
   * `bool` (the boolean identity)
 * `apply` (the application operator as a function)
 * `max`
 * `min`
 * `abs`
 * `dup` (duplicate object)
 * `im` (get imaginary component)
 * `re` (get real component)
 * math functions
   * `floor`
   * `ceil`
   * `sin`
   * `cos`
   * `tan`
   * `asin`
   * `acos`
   * `atan`
   * `sinh`
   * `cosh`
   * `tanh`
   * `asinh`
   * `acosh`
   * `atanh`
   * `log`
   * `log10`
   * `log2`
 * `random`
 * `neg` (negate a number)
 * `encode` (encode a number in base b)
   * `bin` and `hex` are functions that wrap `encode` with values for `b` of 2 and 16 respeciively
 * `decode` (decode a list of digits in base b)
   * `fbin` and `fhex` are functions that wrap `decode` with values for `b` of 2 and 16 respectively
 * `nwise` (take consecute n-tuples from a list)
 * `range` (produce a list of numbers from start to end with a step)
 * reductions:
   * `sum`: (reduce add)
   * `prod`: (reduce multiply)
   * `all`: (reduce and)
   * `any`: (reduce or)
   * `maxl`: (reduce max)
   * `minl`: (reduce min)


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
