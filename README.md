# TBL
A calculator language with lists and higher order functions written in pure javascript

TBL is a programming language. The fundamental data types are complex numbers, lists, functions, strings, and objects (a set of key-value pairs).

Functions can take anything as an argument, including other functions. 

Lists can contain anything, including functions and other lists.

Objects can only have strings as keys, but those keys can point to anything.

## Literals
The literal types are numbers (which are complex), lists, strings, and code.

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

Strings are denoted by `{` and `}`, Anything inside the curly brackets is treated as the contents of the string.
The results of expressions can be interpolated inside of strings with further curly brackets.

For example: 
 * the string "Hello world!": `{Hello world!}`
 * the string "Hello world!" but fancy: `obj: {world}; {Hello {obj}!}`

Finally, the parsed syntax tree of an expression is given by wrapping the expression in curly brackets and prefixing it with a `` ` ``

For example:
 * the number 8: `5 + 3`
 * the expression 5 + 3: `` `{5 + 3} ``


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
 * `join` [list, string] 

## String manipulation

The following functions allow for working with strings:
  * `get` [string, index]
  * `set` [string, index, value]
  * `push` [string, value]
  * `pop` [string]
  * `len` [string]
  * `concat` [string1, string2]
  * `split` [string, string]

The `eval` function exists to evaluate a string as if it were an expression.

The `+` operator concats two strings, and if one of the operands is not a string, it is coerced to one.

The `*` operator, when applied to a left operand string and a right operand integer, can be used to repeat a string.

## Objects

There is no 'builtin' syntax for objects. 

An object is created with the `object` builtin.

Keys are added with `set` and deleted with `delkey`.

The presence of keys is checked for with `haskey`.

Values are retrieved with `get`.

The list of key-value pairs is retrieved with `items`.

Furthermore, a syntax for defining objects is defined in user space.

The operator `:>` takes a key on the left and a value on the right, and creates an object with one key.

The operator `|` then takes two objects and merges them.

Thus, the Javascript object:

```js
let x = "computed_property";
{
  name: "Mustafa",
  "age": 18,
  socials: {
    twitter: "@blahblah",
    insta: "@blahblah"
  },
  [x]: "cooool"
}
```

can be defined equivalently in TBL as:

```
(
  x: {computed property};
  name :> {Mustafa} |
  {age} :> 18 |
  socials :> (
    twitter :> {@blahblah} |
    insta :> {@blahblah}
  ) |
  [x]: {cooool}
)
```
## Functions
TBL supports functions and higher order functions.

Functions are defined with the definition operator, `->`. The parameters of the function are given as a list on the left of the operator, and the body of the function is given on the right. 

There is also a variadic definition operator, `=>`. The semantics are identical to that of the normal definition, except the last parameter is a list that catches all excess arguments.

Inside of a function, you can use the special symbol `$` to denote the function currently being defined, thus enabling recursion for anonymous functions. Alternatively, assigning the function to a name that is then used inside of the function also does the same thing.

Functions are applied with the application operator, `@`. The function appears on the left of the operator, and the arguments are passed as a list on the right of the operator.

Functions can be partially applied with the `'` operator. 

This operator takes a single value, thereby transforming `f(x, y)` to `f(C, y)` where `C` is the supplied single value.
The operator can also take a literal list, where the slots to be left empty are specified with an `_`, so that `f'[_, 6]` transforms `f(x, y)` to `f(x, 6)`.

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
 * less than or equal to: `<=`
 * greater than or equal to: `>=`

## User Defined Operators

In, TBL, a binary function can be associated with an operator with the operator binding operator `<<`.

The operator is passed as a string on the left, and the function is on the right. The precedence for the operator can also be specified by instead passing a list of two elements, the first the precedence index and the second the function, on the right of the operator binding operator.

The TBL standard library provides a number of these operators:
  * and: `&&`
  * or: `||`
  * xor: `<>`
  * index: `::`
  * function power: `**`
  * accumulated function power: `*|`
  * map: `@@`
  * concat: `++`
  * floor division: `//`
  * compose: `.`
  * unwrapped compose: `..`
  * over: `^^`
  * zip: `<:>`

`<<` creates an operator that receives its left and right operands after being evaluated.

In contrast, one can create operators that receive their left and right operands as syntax trees with the `<<<` operator.

For example, consider the following:
```
{^^} << [f, g] -> f ^ g ^ g;
{^^^} <<< [f, g] -> f ^ g ^ g;
```

Now, in the expression `(5 + 3) ^^ (7 + 2)`, the `^^` operator "sees" the values 8 and 9.

In contrast, in the expression `(5 + 3) ^^^ (7 + 2)`, the `^^^` operator "sees" the expressions "5 + 3" and "7 + 2". These expressions have not been evaluated. It is up to the operator to decide when, if at all, to evaluate the expressions.

## Macros

This allows us to understand the macro application operator, `@-`.
It evaluates the expression on its left and expects it to be a function.
It then calls the function with the syntax tree it recieved on its right.
It expects the result of this call to be a new syntax tree, which it then evaluates.

Many of the built in operators are also available as macros.
For example, `?` is available as the macro `ifelse`, so that `C ? [X, Y]` is equivalent to `ifelse @- [C, X, Y]`.

Similar macros exist for the while and for loop operators.

Some of the more interesting and useful macros are the `cond`, `switch`, and `forin` macros.

For example, using the `forin` macro to create a list of squares:
```
squares: [];

forin @- [
  i, range @ [1, 10],
  push @ [squares, i*i]
];

squares
```

Examples of the `cond` macro can be found in `examples/primes.tbl`.
Examples of the `switch` macro can be found in `examples/wordle.tbl`.

## Standard Library

The functions and constants available in the standard library are described in `STDLIB.md`

## Examples
Example programs can be found in the examples/ folder

## Running
You can run TBL code client side in your browser [here](http://motiwala.ca/TBL).
The above website also contains examples to help acquaint yourself with the language.

You can also run it locally:

In the root of this repository, run `node tbl.mjs`.

This will start up a TBL repl, where you can type in TBL expressions and see what they evaluate to.

This repl comes with a builtin function `load` which you can use to load the examples.
