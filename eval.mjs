import { pow, mul, div, add, sub, bool, lt, lte, gt, gte, eq, neq, mod } from "./ops.mjs";
import { make_ast } from "./ast.mjs";
import { BuiltinFunction, VFunction, List, Complex, duplicate } from "./values.mjs";
import { NodeOperation, NodeIdentifier, NodeList, NodeExprBody } from "./nodes.mjs";
import { LANG } from "./language.mjs";
import assert from "assert";

import {
    assert_func, assert_list, ilist, ivfun, assert_value, ivalue, assert_vstring, assert_valid_opstring, ifunc, assert_isreal_strict
} from "./checks.mjs";

function eval_application(f, a, env) {
    if (f instanceof BuiltinFunction) return f.apply(a, env);

    assert((f.params.length == a.length) 
            || (f.variadic && a.length >= f.params.length - 1), `Invalid number of arguments`);
    const eval_env = {
        ENV: {
            ...env.ENV, ...f.closure.ENV
        },
        USER_DEFINED_OP: {
            ...env.USER_DEFINED_OP, ...f.closure.USER_DEFINED_OP
        }
    };

    // update the environment
    for (let i = 0; i < f.params.length; i++) {
        const name = f.params[i];
        const val = (f.variadic && i == f.params.length - 1) ? a.slice(i) : a.get(i);

        eval_env.ENV[name] = (eval_env.ENV[name] ?? []).concat(val);
    }

    eval_env.ENV[LANG.RECURSION] = [f];
    
    const result = eval_ast(f.body, eval_env);

    return result;
}

function eval_ast(ast, env) {
    if (ast instanceof NodeExprBody) {
        let value = new Complex(0, 0);
        for (const e of ast.subasts) {
            value = eval_ast(e, env);
        }
        return value;
    }
    else if (ast instanceof NodeOperation) {
        // variable binding
        if (ast.operator == LANG.BIND) {
            const target = ast.left;
            const value = ast.right;
            
            let targets, values, rv;
            if (target instanceof NodeIdentifier ) {
                rv = eval_ast(value, env);
                targets = [target.name];
                values = [rv];
            } else if (target instanceof NodeList) {
                
                assert(target.subasts.every(e => e instanceof NodeIdentifier),
                      "Invalid assignment: target list can only contain identifiers");
                
                rv = eval_ast(value, env);
                if (rv instanceof List) {
                    assert(rv.length == target.subasts.length || rv.length == 1, `Expected ${target.subasts.length}; receieved ${rv.length}`);

                    if (rv.length == 1) {
                        values = Array.from({length: target.subasts.length}, () => duplicate(rv.get(0)));
                    } else {
                        values = rv.values;
                    }
                } else {
                    values = Array.from({length: target.subasts.length}, () => duplicate(rv));
                }

                targets = target.subasts.map(e => e.name);
            } else throw `Invalid assignment to ${ast.left}`;

            for (let i = 0; i < targets.length; i++) {
                const name = targets[i];
                const bindings = [...(env.ENV[name] ?? [])];
                bindings.pop();
                const v = values[i];
                if (ivfun(v)){
                    v.closure.ENV[name] = [v];
                }
                bindings.push(v);
                env.ENV[name] = bindings;

            }

            return rv;
        }

        if ([LANG.OPBIND, LANG.ASTOPBIND].includes(ast.operator)) {
            const op = eval_ast(ast.left, env);
            const right = eval_ast(ast.right, env);

            let i = 0, func;
            if (right instanceof List) {
                assert(right.length == 2, `operator binding can only accept a list of length 2`);
                const idx = right.get(0);
                func = right.get(1);

                assert(idx instanceof Complex, `precedence index must be a number`);
                assert_isreal_strict(idx, `precedence index must be a real number`);
                assert(idx.real > 0, `precedence index can not be negative`);

                i = idx.real;
            } else {
                func = right;
            }

            assert_vstring(op, "operator in operator defintion must be a string");
            assert_func(func, `right operand to ${LANG.OPBIND} must be a function`);

            assert(func instanceof BuiltinFunction || func.params.length == 2 || (func.variadic && [1, 2].includes(func.params.length) ), `function must take exactly two arguments`);

            assert_valid_opstring(op.value, "invalid operator string");

            env.USER_DEFINED_OP = env.USER_DEFINED_OP ?? {};
            env.USER_DEFINED_OP[op.value] = [i, func, ast.operator == LANG.OPBIND];

            return func;
        }

        if (ast.operator in (env.USER_DEFINED_OP ?? {})) {
            const t = env.USER_DEFINED_OP[ast.operator][2] ? eval_ast : x => x;
            
            const a = t(ast.left, env);
            const b = t(ast.right, env);

            const func = env.USER_DEFINED_OP[ast.operator][1];

            return eval_application(func, new List([a, b]), env);
        }

        // function definition
        if ([LANG.DEFINITION, LANG.VARIADIC_DEFINE].includes(ast.operator)) {
            assert(ast.left instanceof NodeList || ast.left instanceof NodeIdentifier, `Invalid function head.`);
            if (ast.left instanceof NodeList) {
                assert(ast.left.subasts.every(e => e instanceof NodeIdentifier),
                        `All params need to be identifiers`);
            }
            
            const params = ast.left instanceof NodeList ? ast.left.subasts.map(e => e.name) : [ast.left.name];
            const body = ast.right;
            const closure = {ENV: {}};
            for (const [name, binding] of Object.entries(env.ENV)) {
                closure.ENV[name] = [...binding];
            }
            return new VFunction(params, body, closure, ast.operator == LANG.VARIADIC_DEFINE);
        }

        // function application
        if (ast.operator == LANG.APPLICATION) {
            const f = eval_ast(ast.left, env);
            assert_func(f, `Left argument to ${LANG.APPLICATION} must be a function`);
            
            let a = eval_ast(ast.right, env);
            if (!ilist(a)) a = new List([a]);

            return eval_application(f, a, env);
                
        }

        // conditional
        if (ast.operator == LANG.CONDITIONAL) {
            const c = eval_ast(ast.left, env);
            
            const bs = ast.right;
            assert(bs instanceof NodeList, `Branches of a conditional must be a list.`);
            assert(bs.subasts.length == 2, `Must have only 2 branches in a conditional.`);
            const [tb, fb] = bs.subasts;

            if (bool(c)) {
                return eval_ast(tb, env);
            } else {
                return eval_ast(fb, env);
            }
        }

        // while
        if (ast.operator == LANG.WHILE) {
            let value = null;
            while (bool(eval_ast(ast.left, env))) {
                value = eval_ast(ast.right, env);
            }

            if (value == null) return new Complex(0, 0);
            return value;
        }

        if (ast.operator == LANG.FOR) {
            let value = null;
            const initializer = ast.left;
            const body = ast.right;

            assert(initializer instanceof NodeList, `Initializer must be a list`);
            assert(initializer.subasts.length == 3, `Initializer must contain three statements`);

            const [init, cond, update] = initializer.subasts;

            value = eval_ast(init, env);
            while (bool(eval_ast(cond, env))) {
                value = eval_ast(body, env);
                eval_ast(update, env);
            }

            if (value == null) return new Complex(0, 0);
            return value;
        }

        if (ast.operator == LANG.PARTIAL) {
            const f = eval_ast(ast.left, env);

            assert_func(f, `left argument to ${LANG.PARTIAL} must be a function`);

            const vals = ast.right instanceof NodeList ? ast.right : new NodeList([ast.right]);

            const transform = params => {
                const out = [];
                let idx = 0;

                for (const s of vals.subasts) {
                    if (s instanceof NodeIdentifier && s.name == LANG.SLOT) {
                        const v = params.get(idx++);
                        assert_value(v, `Invalid argument: ${v}`);
                        out.push(v);
                    } else out.push(eval_ast(s, env));
                }

                return new List(out).concat(params.slice(idx));
            }

            const b = new BuiltinFunction(params => eval_application(f, transform(params), env));
            b.name = `${f}'${vals}`;

            return b;
        }

        // operations that do not directly affect environment
        const f = {
            [LANG.EXPONENTIATION]: pow,
            [LANG.MULTIPLICATION]: mul,
            [LANG.DIVISION]: div,
            [LANG.ADDITION]: add,
            [LANG.SUBTRACTION]: sub,
            [LANG.EQUAL]: eq,
            [LANG.NOT_EQUAL]: neq,
            [LANG.LESS_THAN]: lt,
            [LANG.LESS_THAN_EQ]: lte,
            [LANG.GREATER_THAN]: gt,
            [LANG.GREATER_THAN_EQ]: gte,
            [LANG.MODULUS]: mod,
        }[ast.operator];

        if (f) return f(eval_ast(ast.left, env), eval_ast(ast.right, env))

        throw `Unrecognized operator ${ast.operator}`
    } else {
        return ast.eval(env);
    }
}

function eval_expr(expr, env) {
    return eval_ast(make_ast(expr, env.USER_DEFINED_OP ?? {}), env || {ENV: {}});
}

export {
    eval_ast,
    eval_application,
    eval_expr
}