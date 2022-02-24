TBL comes with a standard library of functions and constants to make using the language easier.

Many of the functions available can be, and indeed are, defined in TBL itself. However, other functions are defined in javascript and simply exposed to TBL.

## Functions

### List and String manipulation

 * `get` [list/string, index] -> int
 * `set` [list/string, index, value] -> list/string
 * `push` [list/string, value] -> list/string
 * `pop` list/string -> value
 * `len` list/string -> int
 * `concat` [list/string1, list/string2] -> list/string
  
### List only functions
 * `map` [function, list] -> list
 * `filter` [function, list] -> list
 * `reduce` [function, list, value?] -> value
 * `accumulate` [function, list, value?] -> list
   * this is a reduction with intermediate results
 * `join` [list, string] -> string

### String only functions
 * `split` [string1, string2] -> list
 * `eval` string -> value

### Operators as functions

#### arithmetic
 * `pow` [value, value] -> value
 * `mul`
   * [value, value] -> value
   * [string, int] -> string
 * `div` [num, num] -> num
 * `add`
   * [value, value] -> value
   * [string, string] -> string
 * `sub` [value, value] -> value
 * `mod` [value, value] -> value

#### comparisons
 * `eq`  [value, value] -> 0/1
 * `neq` [value, value] -> 0/1
 * `lt`  [value, value] -> value
 * `gt`  [value, value] -> value
 * `lte` [value, value] -> value
 * `gte` [value, value] -> value

#### functions
 * `apply` [function, value] -> value

### Boolean Arithmetic
 * `and`  [value, value] -> 0/1
 * `or`   [value, value] -> 0/1
 * `not`  value -> 0/1
 * `bool` value -> 0/1

### Math
 * `floor` real -> real
 * `ceil`  real -> real
 * `sin`   real -> real
 * `cos`   real -> real
 * `tan`   real -> real
 * `asin`  real -> real
 * `acos`  real -> real
 * `atan`  real -> real
 * `sinh`  real -> real
 * `cosh`  real -> real
 * `tanh`  real -> real
 * `asinh` real -> real
 * `acosh` real -> real
 * `atanh` real -> real
 * `log`   real -> real
 * `log10` real -> real
 * `log2`  real -> real

### Base Conversion
 * `encode` [num, num] -> list
   * encode the first number in the base of the second number, returning a vector of digits
 * `decode` [list, num] -> num
   * decode a vector of digits from the base of the second number
 * `bin` num -> list
   * wrap `encode` with base = 2
 * `hex` num -> list
   * wrap `encode` with base = 16
 * `fbin` list -> num
   * wrap `decode` with base = 2
 * `fhex` list -> num
   * wrap `decode` with base = 16

### Numbers
 * `im` complex -> real
   * get the imaginary component
 * `re` complex -> real
   * get the real component
 * `polar` [num, num] -> complex
   * create a complex number from a magnitude and an angle
 * `rad` num -> num
   * convert degrees to radians
 * `deg` num -> num
   * convert radians to degrees
 * `abs` num -> num


### Utility functions
 * `max` [num, num] -> num
 * `min` [num, num] -> num
 * `dup` value -> value
   * duplicate an object
 * `nwise` [list, num] -> list
   * generate consecutive tuples of length n
   * e.g nwise @ [[1, 2, 3, 4], 2] -> [[1, 2], [2, 3], [3, 4]]
 * `range` [num, num, num?] -> list
 * `random` [] -> real
 * `neg` num -> num
  
#### Reductions
 * `sum` list -> num
 * `prod` list -> num
 * `all` list -> 0/1
 * `any` list -> 0/1
 * `maxl` list -> num
 * `minl` list -> num
  
## Constants
 * `PI` (or `π`) = `3.141592653589793`
 * `E` = `2.718281828459045`
 * `NEWL` = `\n`
 * `TAB` = `\t`
 * `ASCII_LOWER` = `abcdefghijklmnopqrstuvwxyz`
 * `ASCII_UPPER` = `ABCDEFGHIJKLMNOPQRSTUVWXYZ`
 * `ASCII_DIGITS` = `0123456789`