import { VFunction, BuiltinFunction, List, Complex, duplicate } from "./values.mjs";
import { eval_ast, eval_application, eval_expr } from "./eval.mjs";
import {
    icomp, isreal_strict,
    assert_value, assert_func, assert_list,
    assert_isreal_strict,
    assert_complex
} from "./checks.mjs";

import { fix } from "./backcompat.mjs";

import {
    pow as _pow,
    mul as _mul,
    div as _div,
    add as _add,
    sub as _sub,
    eq as _eq,
    lt as _lt,
    lte as _lte,
    gt as _gt,
    gte as _gte,
    bool as _bool,
    abs as _abs,
    fbool
} from "./ops.mjs";
import { LANG } from "./language.mjs";
import { ERRORS } from "./errors.mjs";
import assert from "assert";

const get_n = (p, n) => Array.from({ length: n }, (_, i) => p.get(i));

function assert_valid_index(l, i) {
    assert_list(l, `Can not index non-lists`);
    assert_isreal_strict(i, `Can not index by ${i}`);

    const idx = i.real;
    assert(idx >= 0 && idx < l.length, `Index out of range`);
    assert(idx == Math.floor(idx), `Can only index by integers`);
}

// anonymous functions are not used in the constructor
// because BuiltinFunction relies on the functions name
// attribute
const get = [new BuiltinFunction(function get(params) {
    const [l, i] = get_n(params, 2);

    assert_valid_index(l, i);

    return l.get(i.real);
})];

const set = [new BuiltinFunction(function set(params) {
    const [l, i, v] = get_n(params, 3);

    assert_valid_index(l, i);
    
    assert_value(v, `Invalid value`);

    l.set(i.real, v);

    return v;
})];

const push = [new BuiltinFunction(function push(params) {
    const [l, v] = get_n(params, 2);

    assert_list(l, `Can not push on non lists`);
    assert_value(v, `Invalid value`);

    l.push(v);

    return v;
})];

const len = [new BuiltinFunction(function len(params) {
    const [l] = get_n(params, 1);

    assert_list(l, `Can not get length of non list`);

    return new Complex(l.length, 0);
})];

const pop = [new BuiltinFunction(function pop(params) {
    const [l] = get_n(params, 1);

    assert_list(l, `Can not pop non lists`);
    assert(l.length > 0, `Can not pop empty list`)

    return l.pop();
})]

const map = [new BuiltinFunction(function map(params, env) {
    const [f, l] = get_n(params, 2);

    assert_func(f, ERRORS.FIRST_ARG_FUNC);
    assert_list(l, ERRORS.SEC_ARG_LIST);

    return l.map(e => eval_application(f, new List([e]), env));
})];


const filter = [new BuiltinFunction(function filter(params, env) {
    const [f, l] = get_n(params, 2);
    
    assert_func(f, ERRORS.FIRST_ARG_FUNC);
    assert_list(l, ERRORS.SEC_ARG_LIST);

    return l.filter(e => _bool(eval_application(f, new List([e]))), env)
})];


const reduce = [new BuiltinFunction(function reduce(params, env) {
    const [f, l, i] = get_n(params, 3);

    assert_func(f, ERRORS.FIRST_ARG_FUNC);
    assert_list(l, ERRORS.SEC_ARG_LIST);

    if (i != undefined) assert_value(i, 'initial argument must be a value');

    return l.reduce((a, b) => eval_application(f, new List([a, b]), env), i);
})];

const dup = [new BuiltinFunction(function dup(params) {
    const [v] = get_n(params, 1);

    assert_value(v, `Can not duplicate non-value`);

    return duplicate(v);
})];

const concat = [new BuiltinFunction(function concat(params) {
    const [l1, l2] = get_n(params, 2);
    
    assert_list(l1, `can only concat lists`);
    assert_list(l2, `can only concat lists`);

    return l1.concat(l2);
})];

const range = [new BuiltinFunction(function range(params) {
    const [start, stop] = get_n(params, 2);
    const step = params.get(2) ?? new Complex(1, 0);

    assert(start instanceof Complex && start.imag == 0, `complex ranges are not yet supported..`);
    assert(stop instanceof Complex && stop.imag == 0, `complex ranges are not yet supported..`);
    assert(step instanceof Complex && step.imag == 0, `invalid step parameter`);

    const st = start.real;
    const sp = stop.real;
    const se = step.real;
    const values = Array.from({ length: (sp - st) / se + 1 }, (_, i) => st + (i * se));

    return new List(values.map(n => new Complex(n, 0)));
})];

const im = [new BuiltinFunction(function im(params) {
    const [c] = get_n(params, 1);

    assert_complex(c, `Can not get imaginary component of non complex value`);

    return new Complex(c.imag, 0);
})]

const re = [new BuiltinFunction(function re(params) {
    const [c] = get_n(params, 1);

    assert_complex(c, `Can not get real component of non complex value`);

    return new Complex(c.real, 0);
})];


const mathfun = f => {
    const bfun = new BuiltinFunction(function _(params) {
        const [c] = get_n(params, 1);
        assert_isreal_strict(c, `Can only take the ${f.name} of real numbers`);
        return new Complex(f(c.real), 0);
    });
    bfun.name = f.name;
    return [bfun];
}

const floor = mathfun(Math.floor);
const ceil  = mathfun(Math.ceil);

const sin = mathfun(Math.sin);
const cos = mathfun(Math.cos);
const tan = mathfun(Math.tan);
const asin = mathfun(Math.asin);
const acos = mathfun(Math.acos);
const atan = mathfun(Math.atan);
const sinh = mathfun(Math.sinh);
const cosh = mathfun(Math.cosh);
const tanh = mathfun(Math.tanh);
const asinh = mathfun(Math.asinh);
const acosh = mathfun(Math.acosh);
const atanh = mathfun(Math.atanh);
const log = mathfun(Math.log);
const log10 = mathfun(Math.log10);
const log2 = mathfun(Math.log2);
const random = [new BuiltinFunction(function random(){return new Complex(Math.random(), 0)})];
const abs = [new BuiltinFunction(function abs(params){return _abs(...get_n(params, 1));})]

const neg = [eval_expr(fix(`x $ (x * (0-1))`))];

const max = [eval_expr(fix(`[a, b] $ (a > b) ? [a, b])`))];
const maxl = [eval_expr(fix(`l $ (reduce @ [max, l])`))];
const min = [eval_expr(fix('[a, b] $ (a < b) ? [a, b])'))];
const minl = [eval_expr(fix(`l $ (reduce @ [min, l])`))];
const repeat = [eval_expr(fix(`
[v, n] $ (
    map @ [
        x $ v,
        range @ [1, n]
    ]
)
`))];

const pow = [eval_expr(fix(`[a, b] $ a ^ b`))];
const mul = [eval_expr(fix(`[a, b] $ a * b`))];
const div = [eval_expr(fix(`[a, b] $ a / b`))];
const add = [eval_expr(fix(`[a, b] $ a + b`))];
const sub = [eval_expr(fix(`[a, b] $ a - b`))];
const eq = [eval_expr(fix(`[a, b] $ a = b`))];
const lt = [eval_expr(fix(`[a, b] $ a < b`))];
const gt = [eval_expr(fix(`[a, b] $ a > b`))];
const lte = [eval_expr(fix(`[a, b] $ a ≤ b`))];
const gte = [eval_expr(fix(`[a, b] $ a ≥ b`))];

const sum = [eval_expr(fix(`l $ reduce @ [add, l]`))];
const prod = [eval_expr(fix(`l $ reduce @ [mul, l]`))];
const fact = [eval_expr(fix(`n $ prod @ [range @ [1, n]]`))]
const and = [eval_expr(fix(`[a, b] $ a ? [b ? [1, 0], 0]`))];
const or  = [eval_expr(fix(`[a, b] $ a ? [1, b ? [1, 0]]`))];
const all = [eval_expr(fix(`l $ reduce @ [and, l]`))];
const any = [eval_expr(fix(`l $ reduce @ [or, l]`))];
const bool = [eval_expr(fix(`a $ a ? [1, 0]`))];
const not = [eval_expr(fix(`a $ a ? [0, 1]`))];

const accumulate = [eval_expr(fix(`
[f, n] $ (
    i $ (
        r: [i];
        o: map @ [
            e $ (
                push @ [
                    r,
                    f @ [pop @ [r]]
                ]
            ),
            repeat @ [f, n]
        ];
        concat @ [[i], o];
    )
);
`))];

const encode = [eval_expr(fix(`
[n, b] $
    n = 0 ? [
        [],
        concat @ [& @ [floor @ (n/b), b], [n % b]]
    ]
;
`))];

const decode = [eval_expr(fix(`
[v, b] $
    0 = len @ [v] ? [
        0,
        pop @ [v] + b*& @ [v, b]
    ]
;
`))];

const PI = [new Complex(Math.PI, 0)];
const E = [new Complex(Math.E, 0)];

const STDLIB = Object.freeze({
    get, set,
    push, pop, len,
    map,
    filter,
    reduce, accumulate,
    concat,
    range,
    dup,
    im, re,
    neg,
    pow,
    mul, prod, fact,
    div,
    add, sum,
    sub,
    eq,
    lt,
    gt,
    lte,
    gte,
    bool, not, and, or, all, any,
    abs,
    floor, ceil,
    sin,
    cos,
    tan,
    asin,
    acos,
    atan,
    sinh,
    cosh,
    tanh,
    asinh,
    acosh,
    atanh,
    log,
    log10,
    log2,
    random,
    max, min, maxl, minl,
    repeat,
    encode, decode,
    PI,
    'π': PI,
    E

});

export {
    STDLIB
}