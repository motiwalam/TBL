import { eval_expr } from "./eval.mjs";
import { BuiltinFunction, fromJS } from "./values.mjs";

export class Calculator {
    constructor(env = { ENV: {}, USER_DEFINED_OP: {} }) {
        this.env = env;
    }

    async eval(expr) {
        return await eval_expr(expr, this.env);
    }

    static async with_stdlib() {
        const { STDLIB } = await import("./stdlib.mjs");
        const env = {
            ENV: { ...STDLIB.ENV },
            USER_DEFINED_OP: { ...STDLIB.USER_DEFINED_OP }
        };
        return new Calculator(env);
    }

    merge(calc) {
        this.env = {
            ENV: {
                ...this.env.ENV,
                ...calc.env.ENV,
            },

            USER_DEFINED_OP: {
                ...this.env.USER_DEFINED_OP,
                ...calc.env.USER_DEFINED_OP
            }
        };
    }

    define(name, value) {
        this.env.ENV[name] = [value];
    }

    defineFromJS(name, value) { this.define(name, fromJS(value)) }

    defineBuiltin(name, func) {
        const b = new BuiltinFunction(func);
        b.name = name;
        this.env.ENV[name] = [b];
    }
}
