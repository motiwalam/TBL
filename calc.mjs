import { eval_expr } from "./eval.mjs";
import { BuiltinFunction } from "./values.mjs";
import { STDLIB } from "./stdlib.mjs";

export class Calculator {
    constructor() {
        this.env = {
            ENV: {...STDLIB.ENV},
            USER_DEFINED_OP: {...STDLIB.USER_DEFINED_OP},
        }
    }

    eval(expr) {
        return eval_expr(expr, this.env);
    }

    defineBuiltin(name, func) {
        this.env.ENV[name] = [new BuiltinFunction(func)];
    }
}