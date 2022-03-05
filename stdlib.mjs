import { BuiltinFunction, List, Complex, duplicate, VString } from "./values.mjs";
import { eval_application, eval_expr } from "./eval.mjs";
import {
    assert_value, assert_func, assert_list,
    assert_isreal_strict,
    assert_complex,
    ivstr, assert_lors, assert_vstring,
    ivalue,
    ilist, icomp, ifunc
} from "./checks.mjs";

import { fix } from "./backcompat.mjs";

import {
    bool, fbool,
    abs,
} from "./ops.mjs";

import { ERRORS } from "./errors.mjs";
import assert from "assert";
import { assert_integral } from "./checks.mjs";

const STDLIB = {};

const get_n = (p, n) => Array.from({ length: n }, (_, i) => p.get(i));

const define_builtin = (n, f) => {
    const bf = new BuiltinFunction(f);
    if (n !== undefined) bf.name = n;
    STDLIB[n] = [bf];
}

const define_expr = (n, expr) => (STDLIB[n] = [eval_expr(fix(expr), STDLIB)]);

const define_const = (n, c) => {
    if (typeof c === 'string') STDLIB[n] = [new VString(c)];
    else if (typeof c === 'number') STDLIB[n] = [new Complex(c, 0)];
    else if (c instanceof Array) STDLIB[n] = [new List(c)];
    else if (ivalue(c)) STDLIB[n] = [c];
    else throw `could not coerce ${c} to a value`;
}

function assert_valid_index(l, i) {
    assert_lors(l, `Can not index non-lists`);
    assert_isreal_strict(i, `Can not index by ${i}`);

    const idx = i.real;
    assert(idx >= 0 && idx < l.length, `Index out of range`);
    assert(idx == Math.floor(idx), `Can only index by integers`);
}

define_builtin("get", params => {
    const [l, i] = get_n(params, 2);

    assert_valid_index(l, i);

    return l.get(i.real);
});

define_builtin("set", params => {
    const [l, i, v] = get_n(params, 3);

    assert_valid_index(l, i);
    
    assert_value(v, `Invalid value`);

    l.set(i.real, v);

    return v;
});

define_builtin("push", params => {
    const [l, v] = get_n(params, 2);

    assert_lors(l, `Can not push on non lists`);
    assert_value(v, `Invalid value`);

    l.push(v);

    return v;
});

define_builtin("len", params => {
    const [l] = get_n(params, 1);

    assert_lors(l, `Can not get length of non list`);

    return new Complex(l.length, 0);
});

define_builtin("pop", params => {
    const [l] = get_n(params, 1);

    assert_lors(l, `Can not pop non lists`);
    assert(l.length > 0, `Can not pop empty list`)

    return l.pop();
});

define_builtin("map", (params, env) => {
    const [f, l] = get_n(params, 2);

    assert_func(f, ERRORS.FIRST_ARG_FUNC);
    assert_list(l, ERRORS.SEC_ARG_LIST);

    return l.map(e => eval_application(f, new List([e]), env));
});

define_builtin("filter", (params, env) => {
    const [f, l] = get_n(params, 2);
    
    assert_func(f, ERRORS.FIRST_ARG_FUNC);
    assert_list(l, ERRORS.SEC_ARG_LIST);

    return l.filter(e => bool(eval_application(f, new List([e]))), env)
});

define_builtin("reduce", (params, env) => {
    const [f, l, i] = get_n(params, 3);

    assert_func(f, ERRORS.FIRST_ARG_FUNC);
    assert_list(l, ERRORS.SEC_ARG_LIST);

    if (i != undefined) assert_value(i, 'initial argument must be a value');

    return l.reduce((a, b) => eval_application(f, new List([a, b]), env), i);
});

define_builtin("accumulate", (params, env) => {
    const [f, l, i] = get_n(params, 3);

    assert_func(f, ERRORS.FIRST_ARG_FUNC);
    assert_list(l, ERRORS.SEC_ARG_LIST);

    if (i != undefined) assert_value(i, 'initial argument must be a value');

    return l.accum((a, b) => eval_application(f, new List([a, b]), env), i);
});

define_builtin("split", params => {
    const [s, d] = get_n(params, 2);

    assert_vstring(s, `Can only split strings`);
    assert_vstring(d, `Can only split on string delimiter`);

    return s.split(d);
});

define_builtin("join", params => {
    const [l, s] = get_n(params, 2);

    assert_list(l, `Can only join a list`);
    assert_vstring(s, `Can only join with a string`);

    return l.join(s);
});

define_builtin("slice", params => {
    const [l, s, e] = get_n(params, 3);

    assert_lors(l, `Can only slice a list or a string`);
    assert_isreal_strict(s, `Start index must be a real number`);
    e && assert_isreal_strict(e, `End index must be a real number`);

    return l.slice(s.real, e?.real);
});

define_builtin("dup", params => {
    const [v] = get_n(params, 1);

    assert_value(v, `Can not duplicate non-value`);

    return duplicate(v);
});

define_builtin("concat", params => {
    const [l1, l2] = get_n(params, 2);
    
    assert_lors(l1, `can only concat lists`);
    assert_lors(l2, `can only concat lists`);

    return l1.concat(l2);
});

define_builtin("range", params => {
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
});

define_builtin("im", params => {
    const [c] = get_n(params, 1);

    assert_complex(c, `Can not get imaginary component of non complex value`);

    return new Complex(c.imag, 0);
});

define_builtin("re", params => {
    const [c] = get_n(params, 1);

    assert_complex(c, `Can not get real component of non complex value`);

    return new Complex(c.real, 0);
});

define_builtin("eval", (params, env) => {
    const [c] = get_n(params, 1);

    assert_value(c, "can not evaluate non value");
    if (ivstr(c)) return eval_expr(c.toString(), env);
    else return c;
});

const predfun = (n, f) => define_builtin(n, params => {
    const [c] = get_n(params, 1);
    return fbool(f(c));
});

predfun("islist", ilist);
predfun("isnum", icomp);
predfun("isfun", ifunc);
predfun("isstr", ivstr);

const mathfun = f => define_builtin(f.name, params => {
    const [c] = get_n(params, 1);
    assert_isreal_strict(c, `Can only take the ${f.name} of real numbers`);
    return new Complex(f(c.real), 0);
});


mathfun(Math.floor);
mathfun(Math.ceil);
mathfun(Math.sin);
mathfun(Math.cos);
mathfun(Math.tan);
mathfun(Math.asin);
mathfun(Math.acos);
mathfun(Math.atan);
mathfun(Math.sinh);
mathfun(Math.cosh);
mathfun(Math.tanh);
mathfun(Math.asinh);
mathfun(Math.acosh);
mathfun(Math.atanh);
mathfun(Math.log);
mathfun(Math.log10);
mathfun(Math.log2);

define_builtin("random", () => new Complex(Math.random(), 0));
define_builtin("abs", params => abs(...get_n(params, 1)));

define_expr("max", `[a, b] $ (a > b) ? [a, b])`);
define_expr("maxl", `reduce\\max`);
define_expr("min", '[a, b] $ (a < b) ? [a, b])');
define_expr("minl", `reduce\\min`);
define_expr("repeat", `
[v, n] $ (
    map @ [
        x $ v,
        range @ [1, n]
    ]
)
`);

define_expr("and", `[a, b] $ a ? [b ? [1, 0], 0]`);
define_expr("or", `[a, b] $ a ? [1, b ? [1, 0]]`);
define_expr("all", `reduce\\[and, _, 1]`);
define_expr("any", `reduce\\[or, _, 0]`);
define_expr("bool", `a $ a ? [1, 0]`);
define_expr("not", `a $ a ? [0, 1]`);

define_expr("apply", `[a, b] $ a @ b`);
define_expr("pow", `[a, b] $ a ^ b`);
define_expr("mul", `[a, b] $ a * b`);
define_expr("div", `[a, b] $ a / b`);
define_expr("add", `[a, b] $ a + b`);
define_expr("sub", `[a, b] $ a - b`);
define_expr("mod", `[a, b] $ a % b`);
define_expr("eq", `[a, b] $ a = b`);
define_expr("neq", `not ' eq`);
define_expr("lt", `[a, b] $ a < b`);
define_expr("gt", `[a, b] $ a > b`);
define_expr("lte", `[a, b] $ a ≤ b`);
define_expr("gte", `[a, b] $ a ≥ b`);

define_expr("sum", `reduce\\[add, _, 0]`);
define_expr("prod", `reduce\\[mul, _, 1]`);
define_expr("fact", `n $ n > 1 ? [prod @ [range @ [2, n]], 1]`);


define_expr("nwise", `
[l, n] $
    map @ [
        i $ map @ [
            j $ get @ [l, i + j],
            range @ [0, n-1]
        ],
        range @ [0, len @ [l] - n]
    ]
`);

define_expr("encode", `
[n, b] $
    n = 0 ? [
        [],
        concat @ [& @ [floor @ (n/b), b], [n % b]]
    ]
;
`);

define_expr("decode", `
[v, b] $
    0 = len @ [v] ? [
        0,
        pop @ [v] + b*& @ [v, b]
    ]
;
`);

define_expr("bin", `encode\\[_, 2]`);
define_expr("fbin", `decode\\[_, 2]`);

define_expr("hex", `encode\\[_, 16]`);
define_expr("fhex", `decode\\[_, 16]`);

define_expr("polar", `[r, t] $ r * (cos @ t + 1i * sin @ t)`);
define_expr("arg", `z $ atan @ [im @ z / re @ z]`);
define_expr("rad", `mul\\(PI/180)`);
define_expr("deg", `mul\\(80/PI)`);

define_expr("includes", `
[l, e] $
any @ [map @ [
  i $ (r: e = i; islist @ [r] ? [0, r]),
  l
]];`);

define_expr("reverse", `l $ map @ [get\\[l], range @ [len @ [l] - 1, 0, ~1]]`)

define_expr("every", `[l, f] $ all @ [map @ [f, l]]`);
define_expr("some", `[l, f] $ any @ [map @ [f, l]]`);

define_expr("neg", `mul\\~1`);
define_expr("id", "x $ x");

define_const("PI", Math.PI);
define_const("π", Math.PI);
define_const("E", Math.E);

define_const("ASCII_LOWER", 'abcdefghijklmnopqrstuvwxyz');
define_const("ASCII_UPPER", 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
define_const("ASCII_DIGITS", '0123456789');
define_const("ponky", "bear");

export {
    STDLIB
}