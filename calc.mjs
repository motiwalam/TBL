import { eval_expr } from "./eval.mjs";
import { STDLIB } from "./stdlib.mjs";

export class Calculator {
    constructor() {
        this.env = Object.assign({}, STDLIB);
    }

    eval(expr) {
        return eval_expr(expr, this.env);
    }
}