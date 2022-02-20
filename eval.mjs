import { pow, mul, div, add, sub, bool, lt, lte, gt, gte, eq, mod } from "./ops.mjs";
import { make_ast } from "./ast.mjs";
import { BuiltinFunction, VFunction, List, Complex } from "./values.mjs";
import { NodeOperation, NodeIdentifier, NodeList, NodeExprBody } from "./nodes.mjs";
import { LANG } from "./language.mjs";
import assert from "assert";

import {
    assert_func, assert_list, ilist, ivfun
} from "./checks.mjs";

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
    
    // // reset the environment
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
            assert(ast.left instanceof NodeIdentifier, `Invalid assignment`);
            const bindings = [...(env[ast.left.name] ?? [])];
            bindings.pop();
            const value = eval_ast(ast.right, env);
            if (ivfun(value)) {
                value.closure[ast.left.name] = [value];
            }
            bindings.push(value);
            env[ast.left.name] = bindings;

            return value;
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