export const EXPR_OPEN = '(';
export const EXPR_CLOSE = ')';

export const LIST_OPEN = '[';
export const LIST_CLOSE = ']';

export const STRING_OPEN = '{';
export const STRING_CLOSE = '}';

export const INTERP_OPEN = '{';
export const INTERP_CLOSE = '}';

export const ESCAPE = '\\';
export const WHITESPACE_ESCAPES = {
    n: '\n',
    t: '\t',
    b: '\b',
    r: '\r',
    f: '\f',
}

export const OPEN_GROUPS = [EXPR_OPEN, LIST_OPEN, STRING_OPEN];
export const CLOSE_GROUPS = [EXPR_CLOSE, LIST_CLOSE, STRING_CLOSE];

export const CONDITIONAL = '?';
export const DEFINITION = '->';
export const VARIADIC_DEFINE = '=>';
export const BIND = ':';
export const OPBIND = "<<";
export const ASTOPBIND = "<<<";
export const APPLICATION = '@';
export const SCOPED_APPLICATION = '@!';
export const IS_SCOPED_APPLICATION = e => typeof e === 'string' 
                                   && e.startsWith(SCOPED_APPLICATION)
                                   && [...e.slice(SCOPED_APPLICATION.length)]
                                      .every(e => e === SCOPED_APPLICATION[1])


export const WHILE = '!!';
export const FOR = '#';

export const EXPONENTIATION = '^';
export const MULTIPLICATION = '*';
export const DIVISION = '/';
export const ADDITION = '+';
export const SUBTRACTION = '-';
export const MODULUS = '%';

export const EQUAL = '=';
export const NOT_EQUAL = '!=';
export const LESS_THAN = '<';
export const LESS_THAN_EQ = '<=';
export const GREATER_THAN = '>';
export const GREATER_THAN_EQ = '>=';

export const COMPOSITION = ".";
export const UNWRAPPED_COMPOSITION = "..";
export const PARTIAL = "'";
export const SLOT = "_";

export const NEGATIVE = '~';
export const DECIMAL = '.';

export const digits = "0123456789";
export const NUMBER_START = digits + NEGATIVE;
export const NUMBER_BODY = digits + DECIMAL + "ie+-";
export const alpha = "abcdefghijklmnopqrstuvwxyz";

export const IDENTIFIER_START = alpha + alpha.toUpperCase() + "_$";
export const IDENTIFIER_BODY = IDENTIFIER_START + digits;

export const IGNORE = /\s/g;

export const TINY = 1e-10;

export const COMMENT_SEPARATOR = '\n';
export const LIST_SEPARATOR = ',';
export const STATEMENT_SEPARATOR = ';';
export const RECURSION = '$';
export const COMPLEX = 'i';

export const COMMENT = '--';

export const QUOTE = '`';

export const ASSOCIATE_LEFT = 'left';
export const ASSOCIATE_RIGHT = 'right';

export const PRECEDENCE = UDO => {
    const result = [
        [[PARTIAL], ASSOCIATE_LEFT],
        [[APPLICATION, SCOPED_APPLICATION], ASSOCIATE_LEFT],
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

export const OPERATORS = UDO => PRECEDENCE(UDO).map(e => e[0]).reduce((a, b) => a.concat(b))
export const OPCHARS = UDO => OPERATORS(UDO).reduce((a, b) => a.concat(b));

// the associativity function dictates how operators are found and grouped in a list of tokens
export const ASSOC_FUNC = assoc => ({
    [ASSOCIATE_LEFT]: (arr, func) => arr.findIndex(func),
    [ASSOCIATE_RIGHT]: (arr, func) => {
        let n = arr.length;
        while (n --> 0) {
            if (func(arr[n], n, arr)) return n
        }
        return -1;
    },
}[assoc] ?? ASSOC_FUNC(ASSOCIATE_LEFT))