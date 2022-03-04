const EXPR_OPEN = '(';
const EXPR_CLOSE = ')';

const LIST_OPEN = '[';
const LIST_CLOSE = ']';

const STRING_OPEN = '{';
const STRING_CLOSE = '}';

const INTERP_OPEN = '{';
const INTERP_CLOSE = '}';

const ESCAPE = '\\';
const WHITESPACE_ESCAPES = {
    n: '\n',
    t: '\t',
    b: '\b',
    r: '\r',
    f: '\f',
}

const OPEN_GROUPS = [EXPR_OPEN, LIST_OPEN, STRING_OPEN];
const CLOSE_GROUPS = [EXPR_CLOSE, LIST_CLOSE, STRING_CLOSE];

const CONDITIONAL = '?';
const DEFINITION = '$';
const BIND = ':';
const APPLICATION = '@';

const WHILE = '!';
const FOR = '#';

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

const COMPOSITION = "'";
const PARTIAL = "\\";

const NEGATIVE = '~';
const DECIMAL = '.';

const digit = '[0-9]';
const decimal = `\\${DECIMAL}${digit}`
const dd = `(${digit})|(${decimal})`;

const NUMBER_START = new RegExp(
    `^(${dd}|(${NEGATIVE}(${dd})))`
);
const IGNORE = /\s/g;

const TINY = 1e-10;

const COMMENT_SEPARATOR = '\n';
const LIST_SEPARATOR = ',';
const STATEMENT_SEPARATOR = ';';
const RECURSION = '&';
const COMPLEX = 'i';

const COMMENT = '--';

const PRECEDENCE = [
    [PARTIAL],
    [COMPOSITION],
    [APPLICATION],
    [EXPONENTIATION],
    [MULTIPLICATION, DIVISION],
    [MODULUS, ADDITION, SUBTRACTION],
    [EQUAL, LESS_THAN, LESS_THAN_EQ, GREATER_THAN, GREATER_THAN_EQ],
    [CONDITIONAL],
    [WHILE, FOR],
    [DEFINITION],
    [BIND],
]

const OPERATORS = PRECEDENCE.reduce((a, b) => a.concat(b))

const LANG = Object.freeze({
    EXPR_OPEN,
    EXPR_CLOSE,
    
    LIST_OPEN,
    LIST_CLOSE,

    STRING_OPEN,
    STRING_CLOSE,

    INTERP_OPEN,
    INTERP_CLOSE,

    ESCAPE,
    WHITESPACE_ESCAPES,

    OPEN_GROUPS,
    CLOSE_GROUPS,

    NEGATIVE,
    DECIMAL,
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

    COMPOSITION,
    PARTIAL,

    WHILE,
    FOR,

    OPERATORS,
    PRECEDENCE,

    TINY,

    COMMENT_SEPARATOR,
    STATEMENT_SEPARATOR,
    LIST_SEPARATOR,

    COMPLEX,

    RECURSION,

    COMMENT,
});

export {
    LANG
}
