const EXPR_OPEN = '(';
const EXPR_CLOSE = ')';

const LIST_OPEN = '[';
const LIST_CLOSE = ']';

const OPEN_GROUPS = [EXPR_OPEN, LIST_OPEN];
const CLOSE_GROUPS = [EXPR_CLOSE, LIST_CLOSE];

const CONDITIONAL = '?';
const DEFINITION = '$';
const BIND = ':';
const APPLICATION = '@';

const WHILE = '!';

const EXPONENTIATION = '^';
const MULTIPLICATION = '*';
const DIVISION = '/';
const ADDITION = '+';
const SUBTRACTION = '-';
const MODULUS = '%';

const EQUAL = '=';
const LESS_THAN = '<';
const LESS_THAN_EQ = '≤';
const GREATER_THAN = '>';
const GREATER_THAN_EQ = '≥';


const NUMBER_START = /[0-9\.]/;
const IGNORE = /\s/g;

const TINY = 1e-10;

const SEPARATOR = ';';
const RECURSION = '&';

const COMMENT = '--';

const PRECEDENCE = [
    [APPLICATION],
    [EXPONENTIATION],
    [MULTIPLICATION, DIVISION],
    [MODULUS, ADDITION, SUBTRACTION],
    [EQUAL, LESS_THAN, LESS_THAN_EQ, GREATER_THAN, GREATER_THAN_EQ],
    [CONDITIONAL, WHILE],
    [DEFINITION],
    [BIND],
]

const OPERATORS = PRECEDENCE.reduce((a, b) => a.concat(b))

const LANG = Object.freeze({
    EXPR_OPEN,
    EXPR_CLOSE,
    
    LIST_OPEN,
    LIST_CLOSE,

    OPEN_GROUPS,
    CLOSE_GROUPS,

    NUMBER_START,
    IGNORE,

    CONDITIONAL,
    DEFINITION,
    BIND,
    APPLICATION,

    EXPONENTIATION,
    MULTIPLICATION,
    DIVISION,
    ADDITION,
    SUBTRACTION,
    MODULUS,
    
    EQUAL,
    LESS_THAN,
    LESS_THAN_EQ,
    GREATER_THAN,
    GREATER_THAN_EQ,

    WHILE, 

    OPERATORS,
    PRECEDENCE,

    TINY,

    SEPARATOR,

    RECURSION,

    COMMENT,
});

export {
    LANG
}
