import * as VALUES from "./values.mjs";
import * as CHECKS from "./checks.mjs";
import * as OPS from "./ops.mjs";
import * as ERRORS from "./errors.mjs";
import * as LANG from "./language.mjs";

import { NodeIdentifier } from "./nodes.mjs";
import { eval_application, eval_expr, eval_ast } from "./eval.mjs";

import assert from "assert";

export const STDLIB = {ENV: {}};

const get_n = (p, n) => Array.from({ length: n }, (_, i) => p.get(i));

const define_builtin = (n, f) => {
    const bf = new VALUES.BuiltinFunction(f);
    if (n !== undefined) bf.name = n;
    STDLIB.ENV[n] = [bf];
}

const define_expr = async (n, expr) => (STDLIB.ENV[n] = [await eval_expr(expr, STDLIB)]);

const define_const = (n, c) => { STDLIB.ENV[n] = [VALUES.fromJS(c)] }

function assert_valid_index(l, i) {
    CHECKS.assert_indexable(l, `Can not index non-lists`);
    CHECKS.assert_isreal_strict(i, `Can not index by ${i}`);

    const idx = i.real;
    assert(idx >= 0 && idx < l.length, `Index out of range`);
    assert(idx == Math.floor(idx), `Can only index by integers`);
}

define_builtin("get", params => {
    const [l, i] = get_n(params, 2);

    if (CHECKS.is_indexable(l)) {
        assert_valid_index(l, i);
        return l.get(i.real);
    } else if (CHECKS.ivobj(l)) {
        const key = CHECKS.inident(i) 
                    ? i.name
                    : CHECKS.ivstr(i)
                    ? i.value
                    : i.toString();

        const r = l.get(key);

        if (r === undefined || r === null) throw `could not find key "${key}" in object`;
        return r;
    }

    throw `can not get on non list or object`;

});

define_builtin("set", params => {
    const [l, i, v] = get_n(params, 3);
    
    CHECKS.assert_value(v, `Invalid value`);
    if (CHECKS.is_indexable(l)) {
        assert_valid_index(l, i);
        
    
        l.set(i.real, v);
    
        return v;
    } else if (CHECKS.ivobj(l)) {
        const key = CHECKS.inident(i) 
                    ? i.name
                    : CHECKS.ivstr(i)
                     ? i.value
                     : i.toString();

        return l.set(key, v);
    }

    throw `can not set on non list or object`;
});

define_builtin("push", params => {
    const [l, v] = get_n(params, 2);

    CHECKS.assert_indexable(l, `Can not push on non lists`);
    CHECKS.assert_value(v, `Invalid value`);

    l.push(v);

    return v;
});

define_builtin("len", params => {
    const [l] = get_n(params, 1);

    CHECKS.assert_indexable(l, `Can not get length of non list`);

    return new VALUES.Complex(l.length, 0);
});

define_builtin("pop", params => {
    const [l] = get_n(params, 1);

    CHECKS.assert_indexable(l, `Can not pop non lists`);
    assert(l.length > 0, `Can not pop empty list`)

    return l.pop();
});

define_builtin("map", async (params, env) => {
    const [f, l] = get_n(params, 2);

    CHECKS.assert_func(f, ERRORS.FIRST_ARG_FUNC);
    CHECKS.assert_indexable(l, ERRORS.SEC_ARG_LIST);

    return await l.async_map(e => eval_application(f, new VALUES.List([e]), env));
});

define_builtin("filter", async (params, env) => {
    const [f, l] = get_n(params, 2);
    
    CHECKS.assert_func(f, ERRORS.FIRST_ARG_FUNC);
    CHECKS.assert_indexable(l, ERRORS.SEC_ARG_LIST);

    return await l.async_filter(async e => OPS.bool(await eval_application(f, new VALUES.List([e]), env)));
});

define_builtin("reduce", async (params, env) => {
    const [f, l, i] = get_n(params, 3);

    CHECKS.assert_func(f, ERRORS.FIRST_ARG_FUNC);
    CHECKS.assert_indexable(l, ERRORS.SEC_ARG_LIST);

    if (i != undefined) CHECKS.assert_value(i, 'initial argument must be a value');

    return await l.async_reduce((a, b) => eval_application(f, new VALUES.List([a, b]), env), i);
});

define_builtin("accumulate", async (params, env) => {
    const [f, l, i] = get_n(params, 3);

    CHECKS.assert_func(f, ERRORS.FIRST_ARG_FUNC);
    CHECKS.assert_indexable(l, ERRORS.SEC_ARG_LIST);

    if (i != undefined) CHECKS.assert_value(i, 'initial argument must be a value');

    return await l.async_accum((a, b) => eval_application(f, new VALUES.List([a, b]), env), i);
});

define_builtin("split", params => {
    const [s, d] = get_n(params, 2);

    CHECKS.assert_vstring(s, `Can only split strings`);
    CHECKS.assert_vstring(d, `Can only split on string delimiter`);

    return s.split(d);
});

define_builtin("join", params => {
    const [l, s] = get_n(params, 2);

    CHECKS.assert_list(l, `Can only join a list`);
    CHECKS.assert_vstring(s, `Can only join with a string`);

    return l.join(s);
});

define_builtin("slice", params => {
    const [l, s, e] = get_n(params, 3);

    CHECKS.assert_indexable(l, `Can only slice a list or a string`);
    CHECKS.assert_isreal_strict(s, `Start index must be a real number`);
    e && CHECKS.assert_isreal_strict(e, `End index must be a real number`);

    return l.slice(s.real, e?.real);
});

define_builtin("splice", params => {
    const [l, s, e] = get_n(params, 3);

    CHECKS.assert_indexable(l, `Can only splice lists`);
    CHECKS.assert_isreal_strict(s, `Start index must be a real number`);
    CHECKS.assert_isreal_strict(e, `Amount to splice must be a real number`);

    return l.splice(s.real, e.real);
});

define_builtin("dup", params => {
    const [v] = get_n(params, 1);

    CHECKS.assert_value(v, `Can not duplicate non-value`);

    return VALUES.duplicate(v);
});

define_builtin("concat", params => {
    const [l1, l2] = get_n(params, 2);
    
    CHECKS.assert_indexable(l1, `can only concat lists`);
    CHECKS.assert_indexable(l2, `can only concat lists`);

    return l1.concat(l2);
});

define_builtin("range", params => {
    const [start, stop] = get_n(params, 2);
    const step = params.get(2) ?? new VALUES.Complex(1, 0);

    assert(start instanceof VALUES.Complex && start.imag == 0, `complex ranges are not yet supported..`);
    assert(stop instanceof VALUES.Complex && stop.imag == 0, `complex ranges are not yet supported..`);
    assert(step instanceof VALUES.Complex && step.imag == 0, `invalid step parameter`);

    const st = start.real;
    const sp = stop.real;
    const se = step.real;
    const values = Array.from({ length: (sp - st) / se + 1 }, (_, i) => st + (i * se));

    return new VALUES.List(values.map(n => new VALUES.Complex(n, 0)));
});

define_builtin("im", params => {
    const [c] = get_n(params, 1);

    CHECKS.assert_complex(c, `Can not get imaginary component of non complex value`);

    return new VALUES.Complex(c.imag, 0);
});

define_builtin("re", params => {
    const [c] = get_n(params, 1);

    CHECKS.assert_complex(c, `Can not get real component of non complex value`);

    return new VALUES.Complex(c.real, 0);
});

define_builtin("gensym", (_, env) => {

    let n;
    do {
        n = Array.from({length: 15}, 
            () => LANG.IDENTIFIER_START[Math.floor(Math.random() * LANG.IDENTIFIER_START.length)])
            .join('');
    } while (n in env.ENV);

    return new NodeIdentifier(n);
});

define_builtin("del", (params, env) => {
    for (let i = 0; i < params.length; i++) {
        const n = params.get(i);
        CHECKS.assert_ident(n, "can only delete identifiers");
        delete env.ENV[n.name];
    }

    return new VALUES.Complex(1, 0);
});

define_builtin("sleep", async params => {
    const [t] = get_n(params, 1);

    CHECKS.assert_isreal_strict(t, `can only sleep for a real number of milliseconds`);
    const n = t.real;

    await new Promise(r => setTimeout(r, n));
});

define_builtin("trycatch", async (params, env) => {
    const [t, e] = get_n(params.get(0), 2);

    CHECKS.assert_node(t, `first clause to trycatch needs to be passed as an AST, try calling this function as a macro`);
    CHECKS.assert_node(e, `second clause to trycatch needs to be passed as an AST, try calling this function as a macro`);

    try {
        return await eval_ast(t, env);
    } catch {
        return await eval_ast(e, env);
    }
});

define_builtin("object", () => new VALUES.VObject({}));
define_builtin("keys", params => {
    const [o] = get_n(params, 1);
    CHECKS.assert_vobject(o, `can not get keys of non object`);
    return o.keys();
});
define_builtin("values", params => {
    const [o] = get_n(params, 1);
    CHECKS.assert_vobject(o, `can not get values of non object`);
    return o.values();
});
define_builtin("items", params => {
    const [o] = get_n(params, 1);

    CHECKS.assert_vobject(o, `can not get entries of non object`);
    
    return o.items();
});
define_builtin("haskey", params => {
    const [o, k] = get_n(params, 2);

    CHECKS.assert_vobject(o, `can not check for key in non object`);

    const key = CHECKS.inident(k)
                ? k.name
                : CHECKS.ivstr(k)
                ? k.value
                : k.toString();

    return o.has(key);

})
define_builtin("delkey", params => {
    const [o, k] = get_n(params, 2);

    CHECKS.assert_vobject(o, `can not delete key in non object`);

    const key = CHECKS.inident(k)
                ? k.name
                : CHECKS.ivstr(k)
                 ? k.value
                 : k.toString();
    
    return o.del(key);
});

const getter = (n, verifier = x => x, transformer = x => x) => define_builtin(`get${n}`, params => {
    const [c] = get_n(params, 1);
    verifier(c);
    return transformer(c[n]);
});

const setter = (n, cverifier = x => x, vverifier = x => x, transformer = x => x) => define_builtin(`set${n}`, params => {
    const [c, v] = get_n(params, 2);
    cverifier(c);
    vverifier(v);

    c[n] = transformer(v);
    return c;
});

const opverifier = (o, n) => c => CHECKS.assert_op(c, `can not ${o} ${n} of non-operator`);
const opgetter = (n, ...rest) => getter(n, opverifier('get', n), ...rest);
opgetter("left");
opgetter("right");
opgetter("op", v => new VALUES.VString(v));

const opsetter = (n, ...rest) => setter(n, opverifier('set', n), ...rest);
opsetter("left", x => CHECKS.assert_node(x, `can not set left of operator to non-node`));
opsetter("right", x => CHECKS.assert_node(x, `can not set right of operator to non-node`));
opsetter("op", x => CHECKS.assert_vstring(x, `new op must be a string`), x => x.value);

const identverifier = (o, n) => c => CHECKS.assert_ident(c, `can not ${o} ${n} of non-identifier`);
getter("name", x => identverifier('get', 'name'), v => new VALUES.VString(v));
setter("name", identverifier('set', 'name'), x => CHECKS.assert_vstring(x, `new name must be a string`), v => v.value);

const funcverifier = (o, n) => c => (CHECKS.assert_func(c, `can not ${o} ${n} of non-function`), CHECKS.assert_vfunc(c, `can not ${o} ${n} of builtins`));
const funcgetter = (n, ...rest) => getter(n, funcverifier('get', n), ...rest);
funcgetter("body");
funcgetter("params", v => new VALUES.List(v.map(e => new VALUES.VString(e))));

const funcsetter = (n, ...rest) => setter(n, funcverifier('set', n), ...rest);
funcsetter("body", x => CHECKS.assert_node(x, `can not set body of function to non node`));

const nstringverifier = (o, n) => c => CHECKS.assert_nstring(c, `can not ${o} ${n} of non-nodestring`);
const nstringgetter = (n, ...rest) => getter(n, nstringverifier('get', n), ...rest);
nstringgetter("text", v => new VALUES.VString(v));

const nstringsetter = (n, ...rest) => setter(n, nstringverifier('set', n), ...rest);
nstringsetter('text', v => CHECKS.assert_vstring(v, `can not set text to nonstring`), v => v.value);

getter(
    "subasts",
    x => assert(CHECKS.inlist(x) || CHECKS.inexpr(x), `can not get subasts of non-list or non-expression body`),
    l => new VALUES.List(l),
);

getter("ast", x => assert(CHECKS.inast(x), `can not get ast of non-ast`));

const ncompverifier = (o, n) => c => CHECKS.assert_ncomp(c, `can not ${o} ${n} of non-complex-node`);
const ncompgetter = n => getter(n, ncompverifier('get', n), v => new VALUES.Complex(v, 0));
ncompgetter('re');
ncompgetter('im');

const ncompsetter = n => setter(
    n, ncompverifier('set', n),
    v => (
        assert(CHECKS.icomp(v) || CHECKS.incomp(v), `can not set ${n} to non-complex number`),
        assert(v.im === 0, `can not set ${n} to complex number`)
    ),
    v => v.re
);
ncompsetter('re');
ncompsetter('im');

define_builtin("eval", async (params, env) => {
    const [c] = get_n(params, 1);

    CHECKS.assert_value(c, "can not evaluate non value");
    if (CHECKS.ivstr(c)) return await eval_expr(c.toString(), env);
    else return c;
});

define_builtin("eval_ast", async (params, env) => {
    const [c] = get_n(params, 1);

    CHECKS.assert_node(c, `argument not an ast`);
    
    return await eval_ast(c, env);
});

const predfun = (n, f) => define_builtin(n, params => {
    const [c] = get_n(params, 1);
    return OPS.fbool(f(c));
});

predfun("islist", CHECKS.ilist);
predfun("isnum", CHECKS.icomp);
predfun("isfun", CHECKS.ifunc);
predfun("isstr", CHECKS.ivstr);
predfun("isobj", CHECKS.ivobj);
predfun("isnodeast", CHECKS.inast);
predfun("isnodestr", CHECKS.instring);
predfun("isnodelist", CHECKS.inlist);
predfun("isnodenum", CHECKS.incomp);
predfun("isnodeexpr", CHECKS.inexpr);
predfun("isnodeident", CHECKS.inident);
predfun("isnodeop", CHECKS.inop);


const mathfun = (f, n) => define_builtin(n ?? f.name, params => {
    const [c] = get_n(params, 1);
    CHECKS.assert_isreal_strict(c, `Can only take the ${n ?? f.name} of real numbers`);
    return new VALUES.Complex(f(c.real), 0);
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
mathfun(Math.log, "ln");
mathfun(Math.log10);
mathfun(Math.log2);

const strfun = (f, n, ...asserts) => define_builtin(n ?? f.name, params => {
    const [s, ...r] = params.values;

    CHECKS.assert_vstring(s, `can not take ${n ?? f.name} of non-string`);
    asserts.forEach(([a, m], i) => a(r[i], m));

    return VALUES.fromJS(f.bind(VALUES.toJS(s))(...r.map(VALUES.toJS)));
});

const assert_string = [CHECKS.assert_vstring, `argument must be a string`];
const assert_num = [CHECKS.assert_isreal_strict, `argument must be a real number`];

const strfunp = (n, fn, ...rest) => strfun(String.prototype[fn ?? n], n, ...rest);

strfunp("lower", "toLowerCase");
strfunp("upper", "toUpperCase");
strfunp("replace", null, assert_string, assert_string);
strfunp("replaceAll", null, assert_string, assert_string);
strfunp("substr", null, assert_num, assert_num);
strfunp("trimEnd");
strfunp("trimStart");
strfunp("trim");
strfunp("padEnd", null, assert_num, assert_string);
strfunp("padStart", null, assert_num, assert_string);
strfunp("startsWith", null, assert_string);
strfunp("endsWith", null, assert_string);

define_builtin("random", () => new VALUES.Complex(Math.random(), 0));
define_builtin("abs", params => OPS.abs(...get_n(params, 1)));

define_builtin("ptable", (params, env) => {
    const pt = LANG.PRECEDENCE(env.USER_DEFINED_OP);
    return new VALUES.List(
        pt.map(([op, a]) => new VALUES.List([
            new VALUES.List(op.map(e => new VALUES.VString(e))),
            new VALUES.VString(a)
        ]))
    )
});

define_builtin("defined", (_, env) => new VALUES.List(Object.keys(env.ENV).map(n => new VALUES.VString(n))));

await define_expr("env", `[] -> [defined @ [], ptable @ []]`)

await define_expr("find", `[l, f] -> (
    i: ~1;
    [j: 0, j < len @ [l], j: j + 1] # (
        i = ~1 ? [
            f @ [get @ [l, j]] ? [
                i: j,
            ],
        ]
    );
    i;
)`);

await define_expr("includes", `
[l, e] -> (
    flag: 0;
    [j: 0, j < len @ [l], j: j + 1] # (
        flag = 0 ? [
            r: e = get @ [l, j];
            (islist @ [r] ? [0, r]) ? [
                flag: 1,
            ],
        ]
    );
    flag;
)`);

await define_expr("get", `{::} << [0.5, get]`);
await define_expr("op_priority", `o -> find @ [ptable @ [], i -> includes @ [i::0, o]]`);

await define_expr("ast_apply", `{@:} <<< [op_priority @ {@}, [f, g] -> (eval_ast @ [f]) @ [g]]`);
await define_expr("macro_apply", `{@-} <<< [op_priority @ {@}, [f, g] -> eval_ast @!! [(eval_ast @ [f]) @ [g]]]`);

await define_expr("compose", "{.} << [op_priority @ {@} + 0.5, [f, g] -> (i => f @ [g @ i])]");
await define_expr("ucompose", "{..} << [op_priority @ {.}, [f, g] -> (i => f @ (g @ i))]");
await define_expr("over", `{.|} << [op_priority @ {.}, [f, g] -> (i => f .. map @ [f -> f @ i, g])]`);

await define_expr("max", `[a, b] -> (a > b) ? [a, b]`);
await define_expr("maxl", `reduce'max`);
await define_expr("min", '[a, b] -> (a < b) ? [a, b]');
await define_expr("minl", `reduce'min`);
await define_expr("repeat", `
[v, n] -> (
    map @ [
        x -> v,
        range @ [1, n]
    ]
)
`);

await define_expr("and_shortcircuit", `{&&} <<< [op_priority @ {=} + 0.5, [a, b] -> eval_ast @!! a ? [eval_ast @!! b ? [1, 0], 0]]`);
await define_expr("and", `[a, b] -> a && b`);
await define_expr("or_shortcircuit", `{||} <<< [op_priority @ {&&}, [a, b] -> eval_ast @!! a ? [1, eval_ast @!! b ? [1, 0]]]`);
await define_expr("or", `[a, b] -> a || b`);
await define_expr("xor", `{<>} << [op_priority @ {&&}, [a, b] -> (a && not @ [b]) || (b && not @ [a])]`);
await define_expr("all", `reduce'[and, _, 1]`);
await define_expr("any", `reduce'[or, _, 0]`);
await define_expr("bool", `a -> a ? [1, 0]`);
await define_expr("not", `a -> a ? [0, 1]`);

await define_expr("apply", `[a, b] -> a @ [b]`);
await define_expr("pow", `[a, b] -> a ^ b`);
await define_expr("mul", `[a, b] -> a * b`);
await define_expr("div", `[a, b] -> a / b`);
await define_expr("add", `[a, b] -> a + b`);
await define_expr("sub", `[a, b] -> a - b`);
await define_expr("mod", `[a, b] -> a % b`);
await define_expr("eq", `[a, b] -> a = b`);
await define_expr("neq", `[a, b] -> a != b`);
await define_expr("lt", `[a, b] -> a < b`);
await define_expr("gt", `[a, b] -> a > b`);
await define_expr("lte", `[a, b] -> a <= b`);
await define_expr("gte", `[a, b] -> a >= b`);

await define_expr("sum", `reduce'[add, _, 0]`);
await define_expr("prod", `reduce'[mul, _, 1]`);
await define_expr("fact", `n -> n > 1 ? [prod @ [range @ [2, n]], 1]`);


await define_expr("nwise", `
[l, n] ->
    map @ [
        i -> map @ [
            j -> get @ [l, i + j],
            range @ [0, n-1]
        ],
        range @ [0, len @ [l] - n]
    ]
`);

await define_expr("encode", `
[n, b] ->
    n = 0 ? [
        [],
        concat @ [$ @ [floor @ (n/b), b], [n % b]]
    ]
;
`);

await define_expr("decode", `
[v, b] ->
    0 = len @ [v] ? [
        0,
        pop @ [v] + b * $ @ [v, b]
    ]
;
`);

await define_expr("bin", `encode'[_, 2]`);
await define_expr("fbin", `decode'[_, 2]`);

await define_expr("hex", `encode'[_, 16]`);
await define_expr("fhex", `decode'[_, 16]`);

await define_expr("polar", `[r, t] -> r * (cos @ t + 1i * sin @ t)`);
await define_expr("arg", `z -> atan @ [im @ z / re @ z]`);
await define_expr("rad", `mul'(PI/180)`);
await define_expr("deg", `mul'(180/PI)`);

await define_expr("reverse", `l -> map @ [get'[l], range @ [len @ [l] - 1, 0, ~1]]`)

await define_expr("every", `[l, f] -> (
    r: 1;
    forin @- [v, l, r: r && f @ v];
    r
)`);
await define_expr("some", `[l, f] -> (
    r: 0;
    forin @- [v, l, r: r || f @ v];
    r
)`);

await define_expr("neg", `mul'~1`);
await define_expr("id", "x -> x");
await define_expr("uid", "x => x");

await define_expr("unwrap", `f -> f .. id`);
await define_expr("commute", `f -> f .. reverse . uid`);
await define_expr("fpower", `{**} << [op_priority @ {.} + 0.5, [f, n] -> reduce'[commute @ apply, repeat @ [f, n]]]`)
await define_expr("afpower", `{*|} << [op_priority @ {**}, [f, n] -> accumulate'[commute @ apply, repeat @ [f, n]]]`)

await define_expr("wrapped_apply", `{@.} << [op_priority @ {@}, [f, g] -> f @ [g]]`);
await define_expr("map", `{@@} << [op_priority @ {@}, map]`);
await define_expr("filter", `{@|} << [op_priority @ {@}, filter]`);
await define_expr("reduce", `{@>} << [op_priority @ {@}, reduce]`);
await define_expr("concat", `{++} << [op_priority @ {+}, concat]`);
await define_expr("floordiv", `{//} << [op_priority @ {/}, floor . div]`);

await define_expr("zip", `{<:>} << [op_priority @ {+}, args => map @ [i -> get'[_, i] @@ args, range @ [0, minl @ [len @@ args] - 1]]]`);
await define_expr("encode", `{<%>} << [op_priority @ {+}, encode]`);
await define_expr("encode", `{<*>} << [op_priority @ {+}, decode]`);

await define_expr("uniq", `l -> (
    r: [];
    map @ [
        e -> not . includes @ [r, e] ? [push @ [r, e],],
        l
    ];
    r
)`);

await define_expr("indexOf", `[l, e] -> find @ [l, eq'e]`);

await define_expr("nodeop", `[l, o, r] -> (
    a: \`{x ? y};

    setleft @ [a, l];
    setright @ [a, r];
    setop @ [a, o];
    a;
)`);

await define_expr("nodelist", `l => (
    o: \`{[]};
    map @ [push'o, l];
    o;
)`);

await define_expr("nodeexpr", `l => (
    o: \`{0;0};
    pop @ o; pop @ o;
    map @ [push'o, l];
    o
)`);

await define_expr("nodenum", `n => (
    o: \`{0};
    setre @ [o, re @ n];
    setim @ [o, im @ n];
)`);

await define_expr("nodeident", `n -> (
    o: \`{x};
    setname @ [o, n];
)`);

await define_expr("nodestring", `n -> (
    o: \`{{}};
    settext @ [o, n];
)`);

await define_expr("cond", `
l -> (
    len @ l = 0 ? [
      \`{0},
      nodeop @ [
        l::0::0,
        {?},
        nodelist @ [
          l::0::1,
          cond @ [slice @ [l, 1]]
        ]
      ]
    ]
  );
`);

await define_expr("switch", `
l -> (
    cond . map @ [
      i -> [nodeop @ [l::0, {=}, i::0], i::1],
      slice @ [l, 1]
    ]
  );  
`);

await define_expr("ifelse", `ast -> nodeop @ [ast::0, {?}, slice @ [ast, 1]];`)
await define_expr("if", `ast -> ifelse @ [nodelist @ [ast::0, ast::1, \`{0}]];`)

await define_expr("for", `ast -> nodeop @ [slice @ [ast, 0, 3], {#}, ast::3]`);
await define_expr("forin", `
ast -> (
    i: gensym @ [];
    c: gensym @ [];
    v: ast::0;
    
    nodeexpr @ [
      nodeop @ [c, {:}, ast::1],
      for . nodelist @ [
          nodeop @ [i, {:}, \`{0}],
          nodeop @ [i, {<}, nodeop @ [\`{len}, {@}, nodelist @ c]],
          nodeop @ [i, {:}, nodeop @ [i, {+}, \`{1}]],
          nodeexpr @ [
            nodeop @ [v, {:}, nodeop @ [c, {::}, i]],
            ast::2
          ]
        ]
    ]
  );
`)

await define_expr("while", `ast -> nodeop @ [ast::0, {!}, ast::1]`);
await define_expr("dowhile", `
ast -> nodeexpr @ [
    ast::0,
    while . nodelist @ [ast::1, ast::0]
  ]
`);

await define_expr("ast_to_tbl", `
AST ->
    cond @- [
      [isnodeident @ AST, getname @ AST],
      [isnodeop @ AST, (
        l: ast_to_tbl . getleft @ AST;
        r: ast_to_tbl . getright @ AST;
        
        sl: isnodeop . getleft @ AST ? [{({l})}, l];
        sr: isnodeop . getright @ AST ? [{({r})}, r];
        
        {{sl} {getop @ AST} {sr}}
      )],
      [isnodelist @ AST, {[{join'[_, {,}] . map'ast_to_tbl . getsubasts @ AST}]}],
      [isnodeexpr @ AST, {({join'[_, {;}] . map'ast_to_tbl . getsubasts @ AST})}],
        [isnodeast @ AST, {\`\\{{ast_to_tbl . getast @ AST}\\}}],
        [isnodenum @ AST, (
        n: eval_ast @ AST;
        cond @- [
          [eq'0 . im @ n, {{re @ n}}],
          [eq'0 . re @ n, {{im @ n}i}],
          [1, {{re @ n}+{im @ n}i}]
        ]
      )],
      [isnodestr @ AST, {\\{{text @ AST}\\}}]
    ]
`);

await define_expr("qsort", `
a -> (
    _qsort: [a, l, h] -> (
      l < h ? [
        (
            pi: part @ [a, l, h];
            $ @ [a, l, pi - 1];
            $ @ [a, pi + 1, h];  
        ),
      ];
  
    );
  
    part: [a, l, h] -> (
      swap: [a, i, j] -> (
        t: get @ [a, i];
        set @ [a, i, get @ [a, j]];
        set @ [a, j, t];
      );
      pivot: get @ [a, h];
      i: l - 1;
      [j: l, j < h, j: j + 1] # (
        get @ [a, j] < pivot ? [
          (
            i: i + 1;
            swap @ [a, i, j];
          ),
        ]
      );
      swap @ [a, i + 1, h];
      i + 1;
    );
    
    _qsort @ [a, 0, len @ [a] - 1];
    a;
  );  
`);

await define_expr("binary_search_f", `
[A, T, C] -> (
    ([L, H] -> (
        m: ceil @ ((L + H) / 2);
        cond @- [
            [L = H, C @ [A::L, T] = 0 ? [L, ~1]],
            [C @ [A::m, T] > 0, $ @ [L, m - 1]],
            [1, $ @ [m, H]]
        ]
    )) @ [0, len @. A - 1]
);
`)

await define_expr("binary_search", `binary_search_f'[_, _, [a, b] -> cond @- [[a = b, 0], [a < b, ~1], [a > b, 1]]]`);

await define_expr("randint", `[a, b] -> add'a . floor . mul'(b - a) . random @ []`);

await define_expr("choose_random", `c -> get'c . floor . mul'(len @. c) . random @ []`);
await define_expr("at", `[l,i] -> i < 0 ? [l::(len @. l + i), l::i]`);

await define_expr("_object_set", `{:>} <<< [op_priority @ {:} + 1.5, [f, g] -> (
    o: object @ [];
    k: cond @- [
        [isnodeident @. f, getname @ f],
        [isnodelist @. f && 1 = len @. f, eval_ast @!! f::0],
        [1, {{eval_ast @!! f}}]
    ];

    set @ [o, k, eval_ast @!! g];
    o;
)]`);

await define_expr("merge_objects", `{|} << [op_priority @ {:>} + 1.5, [f, g] -> (
    set'f .. id @@ (items @ [g]);
    f;
)]`);

define_const("PI", Math.PI);
define_const("π", Math.PI);
define_const("E", Math.E);

define_const("ASCII_LOWER", 'abcdefghijklmnopqrstuvwxyz');
define_const("ASCII_UPPER", 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
define_const("ASCII_DIGITS", '0123456789');
define_const("ponky", "bear");