import { VFunction, BuiltinFunction, List, Complex, duplicate, VString } from "./values.mjs";
import { eval_ast, eval_application, eval_expr } from "./eval.mjs";
import {
    assert_value, assert_func, assert_list,
    assert_isreal_strict,
    assert_complex,
    ivstr, assert_lors, assert_vstring,
    ivalue,
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
} from "./ops.mjs";
import { ERRORS } from "./errors.mjs";
import assert from "assert";

const get_n = (p, n) => Array.from({ length: n }, (_, i) => p.get(i));

const define_builtin = (f, n) => {
    const bf = new BuiltinFunction(f);
    if (n !== undefined) bf.name = n;
    return [bf];
}

const define_expr = expr => [eval_expr(fix(expr))];

const define_const = c => {
    if (typeof c === 'string') return [new VString(c)];
    if (typeof c === 'number') return [new Complex(c, 0)];
    if (c instanceof Array) return [new List(c)];
    if (ivalue(c)) return [c];
    throw `could not coerce ${c} to a value`;
}

function assert_valid_index(l, i) {
    assert_lors(l, `Can not index non-lists`);
    assert_isreal_strict(i, `Can not index by ${i}`);

    const idx = i.real;
    assert(idx >= 0 && idx < l.length, `Index out of range`);
    assert(idx == Math.floor(idx), `Can only index by integers`);
}

const get = define_builtin(params => {
    const [l, i] = get_n(params, 2);

    assert_valid_index(l, i);

    return l.get(i.real);
}, "get");

const set = define_builtin(params => {
    const [l, i, v] = get_n(params, 3);

    assert_valid_index(l, i);
    
    assert_value(v, `Invalid value`);

    l.set(i.real, v);

    return v;
}, "set");

const push = define_builtin(params => {
    const [l, v] = get_n(params, 2);

    assert_lors(l, `Can not push on non lists`);
    assert_value(v, `Invalid value`);

    l.push(v);

    return v;
}, "push");

const len = define_builtin(params => {
    const [l] = get_n(params, 1);

    assert_lors(l, `Can not get length of non list`);

    return new Complex(l.length, 0);
}, "len");

const pop = define_builtin(params => {
    const [l] = get_n(params, 1);

    assert_lors(l, `Can not pop non lists`);
    assert(l.length > 0, `Can not pop empty list`)

    return l.pop();
}, "push");

const map = define_builtin((params, env) => {
    const [f, l] = get_n(params, 2);

    assert_func(f, ERRORS.FIRST_ARG_FUNC);
    assert_list(l, ERRORS.SEC_ARG_LIST);

    return l.map(e => eval_application(f, new List([e]), env));
}, "map");

const filter = define_builtin((params, env) => {
    const [f, l] = get_n(params, 2);
    
    assert_func(f, ERRORS.FIRST_ARG_FUNC);
    assert_list(l, ERRORS.SEC_ARG_LIST);

    return l.filter(e => _bool(eval_application(f, new List([e]))), env)
}, "filter");

const reduce = define_builtin((params, env) => {
    const [f, l, i] = get_n(params, 3);

    assert_func(f, ERRORS.FIRST_ARG_FUNC);
    assert_list(l, ERRORS.SEC_ARG_LIST);

    if (i != undefined) assert_value(i, 'initial argument must be a value');

    return l.reduce((a, b) => eval_application(f, new List([a, b]), env), i);
}, "reduce");

const accumulate = define_builtin((params, env) => {
    const [f, l, i] = get_n(params, 3);

    assert_func(f, ERRORS.FIRST_ARG_FUNC);
    assert_list(l, ERRORS.SEC_ARG_LIST);

    if (i != undefined) assert_value(i, 'initial argument must be a value');

    return l.accum((a, b) => eval_application(f, new List([a, b]), env), i);
}, "accumulate");

const split = define_builtin(params => {
    const [s, d] = get_n(params, 2);

    assert_vstring(s, `Can only split strings`);
    assert_vstring(d, `Can only split on string delimiter`);

    return s.split(d);
}, "split");

const join = define_builtin(params => {
    const [l, s] = get_n(params, 2);

    assert_list(l, `Can only join a list`);
    assert_vstring(s, `Can only join with a string`);

    return l.join(s);
}, "join");

const dup = define_builtin(params => {
    const [v] = get_n(params, 1);

    assert_value(v, `Can not duplicate non-value`);

    return duplicate(v);
}, "dup");

const concat = define_builtin(params => {
    const [l1, l2] = get_n(params, 2);
    
    assert_lors(l1, `can only concat lists`);
    assert_lors(l2, `can only concat lists`);

    return l1.concat(l2);
}, "concat");

const range = define_builtin(params => {
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
}, "range");

const im = define_builtin(params => {
    const [c] = get_n(params, 1);

    assert_complex(c, `Can not get imaginary component of non complex value`);

    return new Complex(c.imag, 0);
}, "im");

const re = define_builtin(params => {
    const [c] = get_n(params, 1);

    assert_complex(c, `Can not get real component of non complex value`);

    return new Complex(c.real, 0);
}, "re");

const _eval = define_builtin((params, env) => {
    const [c] = get_n(params, 1);

    assert_value(c, "can not evaluate non value");
    if (ivstr(c)) return eval_expr(c.toString(), env);
    else return c;
}, "eval");

const mathfun = f => define_builtin(params => {
    const [c] = get_n(params, 1);
    assert_isreal_strict(c, `Can only take the ${f.name} of real numbers`);
    return new Complex(f(c.real), 0);
}, f.name);


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

const random = define_builtin(() => new Complex(Math.random(), 0));
const abs = define_builtin(() => _abs(...get_n(params, 1)));

const neg = define_expr(`x $ x * ~1`);

const max = define_expr(`[a, b] $ (a > b) ? [a, b])`);
const maxl = define_expr(`l $ (reduce @ [max, l])`);
const min = define_expr('[a, b] $ (a < b) ? [a, b])');
const minl = define_expr(`l $ (reduce @ [min, l])`);
const repeat = define_expr(`
[v, n] $ (
    map @ [
        x $ v,
        range @ [1, n]
    ]
)
`);

const apply = define_expr(`[a, b] $ a @ b`);
const pow = define_expr(`[a, b] $ a ^ b`);
const mul = define_expr(`[a, b] $ a * b`);
const div = define_expr(`[a, b] $ a / b`);
const add = define_expr(`[a, b] $ a + b`);
const sub = define_expr(`[a, b] $ a - b`);
const mod = define_expr(`[a, b] $ a % b`);
const eq = define_expr(`[a, b] $ a = b`);
const lt = define_expr(`[a, b] $ a < b`);
const gt = define_expr(`[a, b] $ a > b`);
const lte = define_expr(`[a, b] $ a ≤ b`);
const gte = define_expr(`[a, b] $ a ≥ b`);

const sum = define_expr(`l $ reduce @ [add, l, 0]`);
const prod = define_expr(`l $ reduce @ [mul, l, 1]`);
const fact = define_expr(`n $ n > 1 ? [prod @ [range @ [2, n]], 1]`);
const and = define_expr(`[a, b] $ a ? [b ? [1, 0], 0]`);
const or  = define_expr(`[a, b] $ a ? [1, b ? [1, 0]]`);
const all = define_expr(`l $ reduce @ [and, l, 1]`);
const any = define_expr(`l $ reduce @ [or, l, 0]`);
const bool = define_expr(`a $ a ? [1, 0]`);
const not = define_expr(`a $ a ? [0, 1]`);


const nwise = define_expr(`
[l, n] $
    map @ [
        i $ map @ [
            j $ get @ [l, i + j],
            range @ [0, n-1]
        ],
        range @ [0, len @ [l] - n]
    ]
`);

const encode = define_expr(`
[n, b] $
    n = 0 ? [
        [],
        concat @ [& @ [floor @ (n/b), b], [n % b]]
    ]
;
`);

const decode = define_expr(`
[v, b] $
    0 = len @ [v] ? [
        0,
        pop @ [v] + b*& @ [v, b]
    ]
;
`);

const bin = define_expr(`n $ encode @ [n, 2]`);
const fbin = define_expr(`n $ decode @ [n, 2]`);

const hex = define_expr(`n $ encode @ [n, 16]`);
const fhex = define_expr(`n $ decode @ [n, 16]`);

const PI = define_const(Math.PI);
const E = define_const(Math.E);

const STDLIB = Object.freeze({
    get, set,
    push, pop, len,
    map,
    filter,
    reduce, accumulate,
    concat,
    range,
    join, split,
    dup,
    im, re,
    neg,
    apply,
    pow,
    mul, prod, fact,
    div,
    add, sum,
    sub,
    mod,
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
    nwise,
    PI,
    'π': PI,
    E,
    bin, fbin,
    hex, fhex,
    eval: _eval,

});

export {
    STDLIB
}