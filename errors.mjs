import { LANG } from "./language.mjs";
const INVALID_ARGUMENTS = (a, o, b) => `Invalid arguments ${a} ${o} ${b}`;

const INVALID_ARG_POW = (a, b) => INVALID_ARGUMENTS(a, LANG.EXPONENTIATION, b);
const INVALID_ARG_MUL = (a, b) => INVALID_ARGUMENTS(a, LANG.MULTIPLICATION, b);
const INVALID_ARG_DIV = (a, b) => INVALID_ARGUMENTS(a, LANG.DIVISION, b);
const INVALID_ARG_ADD = (a, b) => INVALID_ARGUMENTS(a, LANG.ADDITION, b);
const INVALID_ARG_SUB = (a, b) => INVALID_ARGUMENTS(a, LANG.SUBTRACTION, b);
const INVALID_ARG_MOD = (a, b) => INVALID_ARGUMENTS(a, LANG.MODULUS, b);

const INVALID_ARG_EQ  = (a, b) => INVALID_ARGUMENTS(a, LANG.EQUAL, b);
const INVALID_ARG_LT  = (a, b) => INVALID_ARGUMENTS(a, LANG.LESS_THAN, b);
const INVALID_ARG_LTE = (a, b) => INVALID_ARGUMENTS(a, LANG.LESS_THAN_EQ, b);
const INVALID_ARG_GT  = (a, b) => INVALID_ARGUMENTS(a, LANG.GREATER_THAN, b);
const INVALID_ARG_GTE = (a, b) => INVALID_ARGUMENTS(a, LANG.GREATER_THAN_EQ, b);

const ERRORS = Object.freeze({
    UNEQUAL_LENGTH: `Lists are of unequal length`,
    FIRST_ARG_FUNC: `First argument must be a function`,
    SEC_ARG_LIST: `Second argument must be a list`,
    CC_RAISE: (a, b) =>  `Can not raise complex ${a} to complex ${b}`,
    INVALID_ARG_POW,
    INVALID_ARG_MUL,
    INVALID_ARG_DIV,
    INVALID_ARG_ADD,
    INVALID_ARG_SUB,
    INVALID_ARG_MOD,
    INVALID_ARG_EQ,
    INVALID_ARG_LT,
    INVALID_ARG_LTE,
    INVALID_ARG_GTE,
    INVALID_ARG_GT,
});

export {
    ERRORS
}