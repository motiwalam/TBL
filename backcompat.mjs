import { LANG } from "./language.mjs";
// a function that takes expressions in the language as it stands on 18/02/22
// and returns the expression in the most current syntax

export const fix = input => input
                            .replace('(', LANG.EXPR_OPEN)
                            .replace(')', LANG.EXPR_CLOSE)
                            .replace('[', LANG.LIST_OPEN)
                            .replace(']', LANG.LIST_CLOSE)
                            .replace('?', LANG.CONDITIONAL)
                            .replace('$', LANG.DEFINITION)
                            .replace(':', LANG.BIND)
                            .replace('@', LANG.APPLICATION)
                            .replace('!', LANG.WHILE)
                            .replace('^', LANG.EXPONENTIATION)
                            .replace('*', LANG.MULTIPLICATION)
                            .replace('/', LANG.DIVISION)
                            .replace('+', LANG.ADDITION)
                            .replace('-', LANG.SUBTRACTION)
                            .replace('%', LANG.MODULUS)
                            .replace('=', LANG.EQUAL)
                            .replace('<', LANG.LESS_THAN)
                            .replace('≤', LANG.LESS_THAN_EQ)
                            .replace('>', LANG.GREATER_THAN)
                            .replace('≥', LANG.GREATER_THAN_EQ)
                            .replace(';', LANG.SEPARATOR)
                            .replace('--', LANG.COMMENT)
                            .replace('&', LANG.RECURSION)