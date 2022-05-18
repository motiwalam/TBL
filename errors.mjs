import * as LANG from "./language.mjs";

export const INVALID_ARGUMENTS = (a, o, b) => `Invalid arguments ${a} ${o} ${b}`;

export const INVALID_ARG_POW = (a, b) => INVALID_ARGUMENTS(a, LANG.EXPONENTIATION, b);
export const INVALID_ARG_MUL = (a, b) => INVALID_ARGUMENTS(a, LANG.MULTIPLICATION, b);
export const INVALID_ARG_DIV = (a, b) => INVALID_ARGUMENTS(a, LANG.DIVISION, b);
export const INVALID_ARG_ADD = (a, b) => INVALID_ARGUMENTS(a, LANG.ADDITION, b);
export const INVALID_ARG_SUB = (a, b) => INVALID_ARGUMENTS(a, LANG.SUBTRACTION, b);
export const INVALID_ARG_MOD = (a, b) => INVALID_ARGUMENTS(a, LANG.MODULUS, b);

export const INVALID_ARG_EQ  = (a, b) => INVALID_ARGUMENTS(a, LANG.EQUAL, b);
export const INVALID_ARG_LT  = (a, b) => INVALID_ARGUMENTS(a, LANG.LESS_THAN, b);
export const INVALID_ARG_LTE = (a, b) => INVALID_ARGUMENTS(a, LANG.LESS_THAN_EQ, b);
export const INVALID_ARG_GT  = (a, b) => INVALID_ARGUMENTS(a, LANG.GREATER_THAN, b);
export const INVALID_ARG_GTE = (a, b) => INVALID_ARGUMENTS(a, LANG.GREATER_THAN_EQ, b);

export const UNEQUAL_LENGTH = `Lists are of unequal length`;
export const FIRST_ARG_FUNC = `First argument must be a function`;
export const SEC_ARG_LIST = `Second argument must be a list`;
export const CC_RAISE = (a, b) =>  `Can not raise complex ${a} to complex ${b}`;
