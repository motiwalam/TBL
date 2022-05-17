import { eval_expr } from "./eval.mjs";
import { BuiltinFunction } from "./values.mjs";
import { STDLIB } from "./stdlib.mjs";

export class Calculator {
    constructor(load_stdlib = true) {
        if (load_stdlib) {
            this.reset_stdlib();
        } else {
            this.env = {ENV: {}, USER_DEFINED_OP: {}};
        }
    }

    async eval(expr) {
        return await eval_expr(expr, this.env);
    }

    reset_stdlib() {
        this.env = {ENV: {...STDLIB.ENV}, USER_DEFINED_OP: {...STDLIB.USER_DEFINED_OP}};
    }

    defineBuiltin(name, func) {
        const b = new BuiltinFunction(func);
        b.name = name;
        this.env.ENV[name] = [b];
    }
}
