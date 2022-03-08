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
const DEFINITION = '->';
const VARIADIC_DEFINE = '=>';
const BIND = ':';
const OPBIND = "<<";
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
const NOT_EQUAL = '!=';
const LESS_THAN = '<';
const LESS_THAN_EQ = '<=';
const GREATER_THAN = '>';
const GREATER_THAN_EQ = '>=';

const COMPOSITION = ".";
const UNWRAPPED_COMPOSITION = "..";
const PARTIAL = "'";
const SLOT = "_";

const NEGATIVE = '~';
const DECIMAL = '.';

const digits = "0123456789";
const NUMBER_START = digits + NEGATIVE;
const NUMBER_BODY = digits + DECIMAL + "ie+-";
const alpha = "abcdefghijklmnopqrstuvwxyz";

const IDENTIFIER_START = alpha + alpha.toUpperCase() + "_&";
const IDENTIFIER_BODY = IDENTIFIER_START + digits;

const IGNORE = /\s/g;

const TINY = 1e-10;

const COMMENT_SEPARATOR = '\n';
const LIST_SEPARATOR = ',';
const STATEMENT_SEPARATOR = ';';
const RECURSION = '&';
const COMPLEX = 'i';

const COMMENT = '--';

const USER_DEFINED_OP = {};

const PRECEDENCE = () => [
    Object.keys(USER_DEFINED_OP),
    [PARTIAL],
    [APPLICATION],
    [COMPOSITION, UNWRAPPED_COMPOSITION],
    [EXPONENTIATION],
    [MULTIPLICATION, DIVISION],
    [MODULUS, ADDITION, SUBTRACTION],
    [EQUAL, NOT_EQUAL, LESS_THAN, LESS_THAN_EQ, GREATER_THAN, GREATER_THAN_EQ],
    [CONDITIONAL],
    [WHILE, FOR],
    [DEFINITION, VARIADIC_DEFINE],
    [BIND, OPBIND],
]

const OPERATORS = () => PRECEDENCE().reduce((a, b) => a.concat(b))
const OPCHARS = () => OPERATORS().reduce((a, b) => a.concat(b));

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
    NUMBER_START, NUMBER_BODY,
    IDENTIFIER_START, IDENTIFIER_BODY,
    IGNORE,

    CONDITIONAL,
    DEFINITION, VARIADIC_DEFINE,
    BIND, OPBIND,
    APPLICATION,

    EXPONENTIATION,
    MULTIPLICATION,
    DIVISION,
    ADDITION,
    SUBTRACTION,
    MODULUS,
    
    EQUAL,
    NOT_EQUAL,
    LESS_THAN,
    LESS_THAN_EQ,
    GREATER_THAN,
    GREATER_THAN_EQ,

    COMPOSITION, UNWRAPPED_COMPOSITION,
    PARTIAL, SLOT,

    WHILE,
    FOR,

    OPERATORS, OPCHARS,
    PRECEDENCE,

    TINY,

    COMMENT_SEPARATOR,
    STATEMENT_SEPARATOR,
    LIST_SEPARATOR,

    COMPLEX,

    RECURSION,

    COMMENT,

    USER_DEFINED_OP,
    
});

export {
    LANG
}
