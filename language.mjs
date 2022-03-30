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
const ASTOPBIND = "<<<";
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

const IDENTIFIER_START = alpha + alpha.toUpperCase() + "_$";
const IDENTIFIER_BODY = IDENTIFIER_START + digits;

const IGNORE = /\s/g;

const TINY = 1e-10;

const COMMENT_SEPARATOR = '\n';
const LIST_SEPARATOR = ',';
const STATEMENT_SEPARATOR = ';';
const RECURSION = '$';
const COMPLEX = 'i';

const COMMENT = '--';

const QUOTE = '`';

const ASSOCIATE_LEFT = 'left';
const ASSOCIATE_RIGHT = 'right';

const PRECEDENCE = UDO => {
    const result = [
        [[PARTIAL], ASSOCIATE_LEFT],
        [[APPLICATION], ASSOCIATE_LEFT],
        [[EXPONENTIATION], ASSOCIATE_LEFT],
        [[MULTIPLICATION, DIVISION], ASSOCIATE_LEFT],
        [[MODULUS, ADDITION, SUBTRACTION], ASSOCIATE_LEFT],
        [[EQUAL, NOT_EQUAL, LESS_THAN, LESS_THAN_EQ, GREATER_THAN, GREATER_THAN_EQ], ASSOCIATE_LEFT],
        [[CONDITIONAL], ASSOCIATE_LEFT],
        [[WHILE, FOR], ASSOCIATE_LEFT],
        [[DEFINITION, VARIADIC_DEFINE], ASSOCIATE_RIGHT],
        [[BIND, OPBIND, ASTOPBIND], ASSOCIATE_LEFT],
    ];

    for (const [op, {precedence, associativity}] of Object.entries(UDO)) {
        if (precedence === Math.floor(precedence)) {
            const e = result[precedence] ?? [[], ''];
            e[0].push(op);
            e[1] = associativity
        } else {
            result.splice(Math.floor(precedence), 0, [[op], associativity]);
        }
    }

    return result;
}

const OPERATORS = UDO => PRECEDENCE(UDO).map(e => e[0]).reduce((a, b) => a.concat(b))
const OPCHARS = UDO => OPERATORS(UDO).reduce((a, b) => a.concat(b));

// the associativity function dictates how operators are found and grouped in a list of tokens
const ASSOC_FUNC = assoc => ({
    [ASSOCIATE_LEFT]: (arr, func) => arr.findIndex(func),
    [ASSOCIATE_RIGHT]: (arr, func) => {
        let n = arr.length;
        while (n --> 0) {
            if (func(arr[n], n, arr)) return n
        }
        return -1;
    },
}[assoc] ?? ASSOC_FUNC(ASSOCIATE_LEFT))

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
    BIND, OPBIND, ASTOPBIND,
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

    QUOTE,

    ASSOCIATE_LEFT,
    ASSOCIATE_RIGHT,

    ASSOC_FUNC,
});

export {
    LANG
}
