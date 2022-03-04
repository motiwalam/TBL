import { pow, mul, div, add, sub, bool, lt, lte, gt, gte, eq, mod } from "./ops.mjs";
import { make_ast } from "./ast.mjs";
import { BuiltinFunction, VFunction, List, Complex, duplicate } from "./values.mjs";
import { NodeOperation, NodeIdentifier, NodeList, NodeExprBody } from "./nodes.mjs";
import { LANG } from "./language.mjs";
import assert from "assert";

import {
    assert_func, assert_list, ilist, ivfun, assert_value,
} from "./checks.mjs";
import { ifunc } from "./checks.mjs";

function eval_application(f, a, env) {
    if (f instanceof BuiltinFunction) return f.apply(a, env);

    assert(f.params.length == a.length, `Invalid number of arguments`);
    
    const eval_env = {...env, ...f.closure};

    // update the environment
    for (let i = 0; i < f.params.length; i++) {
        const name = f.params[i];
        const val = a.get(i);

        eval_env[name] = (eval_env[name] ?? []).concat(val);
    }

    eval_env[LANG.RECURSION] = [f];
    
    const result = eval_ast(f.body, eval_env);
    
    // // reset the environments
    // for (const name of f.params) {
    //     env[name].pop();
    //     if (env[name].length == 0) delete env[name]
    // }

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
                
                assert(target.subasts.every(e => e.subasts.length == 1 && e.subasts[0] instanceof NodeIdentifier),
                      "Invalid assignment: list can only contain identifiers");

                if (value instanceof NodeList) {
                    assert(value.subasts.length == 1 || value.subasts.length == target.subasts.length, 
                        `Expected ${target.subasts.length} values; received ${value.subasts.length}`);

                    if (value.subasts.length == 1) {
                        const v = eval_ast(value, env).get(0);
                        rv = v;
                        values = Array.from({length: target.subasts.length}, () => duplicate(v));
                    } else {
                        rv = eval_ast(value, env);
                        values = rv.values;
                    }
                }

                else {
                    const v = eval_ast(value, env);
                    rv = v;
                    values = Array.from({length: target.subasts.length}, () => duplicate(v));
                }

                targets = target
                .subasts.map(e => e.subasts[0].name);
            } else throw `Invalid assignment to ${ast.left}`;

            for (let i = 0; i < targets.length; i++) {
                const name = targets[i];
                const bindings = [...(env[name] ?? [])];
                bindings.pop();
                const v = values[i];
                if (ivfun(v)){
                    v.closure[name] = [v];
                }
                bindings.push(v);
                env[name] = bindings;

            }

            return rv;
        }

        // function definition
        if (ast.operator == LANG.DEFINITION) {
            assert(ast.left instanceof NodeList || ast.left instanceof NodeIdentifier, `Invalid function head.`);
            if (ast.left instanceof NodeList) {
                assert(ast.left.subasts.every(e => e.subasts.length == 1 && e.subasts[0] instanceof NodeIdentifier),
                        `All params need to be identifiers`);
            }
            
            const params = ast.left instanceof NodeList ? ast.left.subasts.map(e => e.subasts[0].name) : [ast.left.name];
            const body = ast.right;
            const closure = {};
            for (const [name, binding] of Object.entries(env)) {
                closure[name] = [...binding];
            }
            return new VFunction(params, body, closure);
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

        if (ast.operator == LANG.COMPOSITION) {
            const f = eval_ast(ast.left, env);
            const g = eval_ast(ast.right, env);

            assert_func(f, `Left argument to ${LANG.COMPOSITION} must be a function`);
            assert_func(g, `Right argument to ${LANG.COMPOSITION} must be a function`);
            
            const b = new BuiltinFunction(params => eval_application(f, eval_application(g, params, env), env));
            b.name = `${f} compose ${g}`;

            return b;
        }

        if (ast.operator == LANG.PARTIAL) {
            const f = eval_ast(ast.left, env);

            assert_func(f, `left argument to ${LANG.PARTIAL} must be a function`)l

            const vals = ast.right instanceof NodeList ? ast.right : new NodeList([ast.right]);

            const transform = params => {
                const out = [];
                let idx = 0;

                for (const s of vals.subasts) {
                    if (s instanceof NodeExprBody && s.subasts.length == 1 && s.subasts[0] instanceof NodeIdentifier && s.subasts[0].name == LANG.SLOT) {
                        const v = params.get(idx++);
                        assert_value(v, `Invalid argument: ${v}`);
                        out.push(v);
                    } else out.push(eval_ast(s, env));
                }

                return new List(out).concat(params.slice(idx));
            }

            const b = new BuiltinFunction(params => eval_application(f, transform(params), env));
            b.name = `${f}\\${vals}`;

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
            [LANG.LESS_THAN]: lt,
            [LANG.LESS_THAN_EQ]: lte,
            [LANG.GREATER_THAN]: gt,
            [LANG.GREATER_THAN_EQ]: gte,
            [LANG.MODULUS]: mod,
        }[ast.operator];

        return f(eval_ast(ast.left, env), eval_ast(ast.right, env))

    } else {
        return ast.eval(env);
    }
}

function eval_expr(expr, env) {
    return eval_ast(make_ast(expr), env || {});
}

export {
    eval_ast,
    eval_application,
    eval_expr
}