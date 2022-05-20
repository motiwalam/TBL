import * as OPS from "./ops.mjs";
import * as VALUES from "./values.mjs";
import * as NODES from "./nodes.mjs";
import * as LANG from "./language.mjs";
import * as CHECKS from "./checks.mjs";

import assert from "assert";
import { make_ast } from "./ast.mjs";


export async function eval_application(f, a, env, makenew = true) {
    if (f instanceof VALUES.BuiltinFunction) return await f.apply(a, env);

    assert((f.params.length == a.length)
        || (f.variadic && a.length >= f.params.length - 1), `Invalid number of arguments`);

    const eval_env = makenew ? {
        ENV: {
            ...env.ENV, ...f.closure.ENV
        },
        USER_DEFINED_OP: {
            ...env.USER_DEFINED_OP, ...f.closure.USER_DEFINED_OP
        },
        UPPER: env
    } : env;

    // update the environment
    for (let i = 0; i < f.params.length; i++) {
        const name = f.params[i];
        const val = (f.variadic && i == f.params.length - 1) ? a.slice(i) : a.get(i);

        eval_env.ENV[name] = (eval_env.ENV[name] ?? []).concat(val);
    }

    eval_env.ENV[LANG.RECURSION] = (eval_env.ENV[LANG.RECURSION] ?? []).concat(f);

    const result = await eval_ast(f.body, eval_env);

    // reset the environment
    // necessary because eval_env may be the same as env
    for (const n of f.params) {
        eval_env.ENV[n].pop();
    }

    eval_env.ENV[LANG.RECURSION].pop();

    return result;
}

export async function eval_ast(ast, env) {
    if (ast instanceof NODES.NodeExprBody) {
        let value = new VALUES.Complex(0, 0);
        for (const e of ast.subasts) {
            value = await eval_ast(e, env);
        }
        return value;
    }
    else if (ast instanceof NODES.NodeOperation) {
        // variable binding
        if (ast.operator == LANG.BIND) {
            const target = ast.left;
            const value = ast.right;

            let targets, values, rv;
            if (target instanceof NODES.NodeIdentifier) {
                rv = await eval_ast(value, env);
                targets = [target.name];
                values = [rv];
            } else if (target instanceof NODES.NodeList) {

                assert(target.subasts.every(e => e instanceof NODES.NodeIdentifier),
                    "Invalid assignment: target list can only contain identifiers");

                rv = await eval_ast(value, env);
                if (rv instanceof VALUES.List) {
                    assert(rv.length == target.subasts.length || rv.length == 1, `Expected ${target.subasts.length}; receieved ${rv.length}`);

                    if (rv.length == 1) {
                        values = Array.from({ length: target.subasts.length }, () => VALUES.duplicate(rv.get(0)));
                    } else {
                        values = rv.values;
                    }
                } else {
                    values = Array.from({ length: target.subasts.length }, () => VALUES.duplicate(rv));
                }

                targets = target.subasts.map(e => e.name);
            } else throw `Invalid assignment to ${ast.left}`;

            for (let i = 0; i < targets.length; i++) {
                const name = targets[i];
                const bindings = [...(env.ENV[name] ?? [])];
                bindings.pop();
                const v = values[i];
                if (CHECKS.ivfun(v)) {
                    v.closure.ENV[name] = [v];
                }
                bindings.push(v);
                env.ENV[name] = bindings;

            }

            return rv;
        }

        if ([LANG.OPBIND, LANG.ASTOPBIND].includes(ast.operator)) {
            const op = await eval_ast(ast.left, env);
            const right = await eval_ast(ast.right, env);

            let i = 0, assoc = LANG.ASSOCIATE_LEFT, unsafe = false, func;
            if (right instanceof VALUES.List) {
                assert([2, 3, 5].includes(right.length), `operator binding can only accept a list of length 2 or 3`);
                const idx = right.get(0);
                if (right.length > 2) {
                    const a = right.get(1);
                    CHECKS.assert_vstring(a, `associativity must be a string`);
                    assoc = a.value;
                }
                func = right.get(right.length > 2 ? 2 : 1);

                unsafe = right.length === 5;
                assert(idx instanceof VALUES.Complex, `precedence index must be a number`);
                CHECKS.assert_isreal_strict(idx, `precedence index must be a real number`);
                assert(idx.real >= 0, `precedence index can not be negative`);

                i = idx.real;
            } else {
                func = right;
            }

            CHECKS.assert_vstring(op, "operator in operator defintion must be a string");
            CHECKS.assert_func(func, `right operand to ${LANG.OPBIND} must be a function`);

            assert(func instanceof VALUES.BuiltinFunction || func.params.length == 2 || (func.variadic && [1, 2].includes(func.params.length)), `function must take exactly two arguments`);

            CHECKS.assert_valid_opstring(op.value, "invalid operator string");

            env.USER_DEFINED_OP = env.USER_DEFINED_OP ?? {};

            if (i === Math.floor(i)) {
                const cassoc = LANG.PRECEDENCE(env.USER_DEFINED_OP)[i][1]
                !unsafe && assert(assoc === cassoc,
                    `Currently, operators of precedence ${i} associate ${cassoc}, not ${assoc}. This binding would force all operators of precedence ${i} to associate ${assoc}. If you are sure about this, try binding again with a list of five elements`);
            }

            env.USER_DEFINED_OP[op.value] = {
                precedence: i,
                func,
                evalargs: ast.operator == LANG.OPBIND,
                associativity: assoc
            }

            return func;
        }

        if (ast.operator in (env.USER_DEFINED_OP ?? {})) {
            const t = env.USER_DEFINED_OP[ast.operator].evalargs ? eval_ast : x => x;

            const a = await t(ast.left, env);
            const b = await t(ast.right, env);

            const { func } = env.USER_DEFINED_OP[ast.operator];

            return await eval_application(func, new VALUES.List([a, b]), env);
        }

        // function definition
        if ([LANG.DEFINITION, LANG.VARIADIC_DEFINE].includes(ast.operator)) {
            assert(ast.left instanceof NODES.NodeList || ast.left instanceof NODES.NodeIdentifier, `Invalid function head.`);
            if (ast.left instanceof NODES.NodeList) {
                assert(ast.left.subasts.every(e => e instanceof NODES.NodeIdentifier),
                    `All params need to be identifiers`);
            }

            const params = ast.left instanceof NODES.NodeList ? ast.left.subasts.map(e => e.name) : [ast.left.name];
            const body = ast.right;
            const closure = { ENV: {} };
            for (const [name, binding] of Object.entries(env.ENV)) {
                closure.ENV[name] = [...binding];
            }
            return new VALUES.VFunction(params, body, closure, ast.operator == LANG.VARIADIC_DEFINE);
        }

        // function application
        if (ast.operator == LANG.APPLICATION || LANG.IS_SCOPED_APPLICATION(ast.operator)) {
            const f = await eval_ast(ast.left, env);
            CHECKS.assert_func(f, `Left argument to ${ast.operator} must be a function`);


            let a = await eval_ast(ast.right, env);
            if (!CHECKS.ilist(a)) a = new VALUES.List([a]);

            const n = ast.operator.slice(1).length - 1;
            for (let i = 0; i < n; i++) env = env.UPPER || env;
            const makenew = n < 0;

            return await eval_application(f, a, env, makenew);

        }

        // conditional
        if (ast.operator == LANG.CONDITIONAL) {
            const c = await eval_ast(ast.left, env);

            const bs = ast.right;
            assert(bs instanceof NODES.NodeList, `Branches of a conditional must be a list.`);
            assert(bs.subasts.length == 2, `Must have only 2 branches in a conditional.`);
            const [tb, fb] = bs.subasts;

            if (OPS.bool(c)) {
                return await eval_ast(tb, env);
            } else {
                return await eval_ast(fb, env);
            }
        }

        // while
        if (ast.operator == LANG.WHILE) {
            let value = null;
            while (OPS.bool(await eval_ast(ast.left, env))) {
                value = await eval_ast(ast.right, env);
            }

            if (value == null) return new VALUES.Complex(0, 0);
            return value;
        }

        if (ast.operator == LANG.FOR) {
            let value = null;
            const initializer = ast.left;
            const body = ast.right;

            assert(initializer instanceof NODES.NodeList, `Initializer must be a list`);
            assert(initializer.subasts.length == 3, `Initializer must contain three statements`);

            const [init, cond, update] = initializer.subasts;

            value = await eval_ast(init, env);
            while (OPS.bool(await eval_ast(cond, env))) {
                value = await eval_ast(body, env);
                await eval_ast(update, env);
            }

            if (value == null) return new VALUES.Complex(0, 0);
            return value;
        }

        if (ast.operator == LANG.PARTIAL) {
            const f = await eval_ast(ast.left, env);

            CHECKS.assert_func(f, `left argument to ${LANG.PARTIAL} must be a function`);

            const vals = ast.right instanceof NODES.NodeList ? ast.right : new NODES.NodeList([ast.right]);

            const closure = { ...env, ENV: {} };
            for (const [name, binding] of Object.entries(env.ENV)) {
                closure.ENV[name] = [...binding];
            }

            const transform = async params => {
                const out = [];
                let idx = 0;

                for (const s of vals.subasts) {
                    if (s instanceof NODES.NodeIdentifier && s.name == LANG.SLOT) {
                        const v = params.get(idx++);
                        CHECKS.assert_value(v, `Invalid argument: ${v}`);
                        out.push(v);
                    } else out.push(await eval_ast(s, {
                        ENV: {...env.ENV, ...closure.ENV},
                        USER_DEFINED_OP: {...env.USER_DEFINED_OP},
                        UPPER: env
                    }));
                }

                return new VALUES.List(out).concat(params.slice(idx));
            }

            const b = new VALUES.BuiltinFunction(async (params, env) => await eval_application(f, await transform(params, env), {
                ENV: {
                    ...env.ENV, ...closure.ENV
                },
                USER_DEFINED_OP: {
                    ...env.USER_DEFINED_OP
                },
                UPPER: env
            }));
            b.name = `${f}'${vals}`;

            return b;
        }

        // operations that do not directly affect environment
        const f = {
            [LANG.EXPONENTIATION]: OPS.pow,
            [LANG.MULTIPLICATION]: OPS.mul,
            [LANG.DIVISION]: OPS.div,
            [LANG.ADDITION]: OPS.add,
            [LANG.SUBTRACTION]: OPS.sub,
            [LANG.EQUAL]: OPS.eq,
            [LANG.NOT_EQUAL]: OPS.neq,
            [LANG.LESS_THAN]: OPS.lt,
            [LANG.LESS_THAN_EQ]: OPS.lte,
            [LANG.GREATER_THAN]: OPS.gt,
            [LANG.GREATER_THAN_EQ]: OPS.gte,
            [LANG.MODULUS]: OPS.mod,
        }[ast.operator];

        if (f) return f(await eval_ast(ast.left, env), await eval_ast(ast.right, env))

        throw `Unrecognized operator ${ast.operator}`
    } else {
        return await ast.eval(env);
    }
}

export async function eval_expr(expr, env) {
    return await eval_ast(make_ast(expr, env.USER_DEFINED_OP ?? {}), env || { ENV: {} });
}
