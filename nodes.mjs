import { List, Complex, VString } from "./values.mjs";
import { eval_ast } from "./eval.mjs";

class NodeExprBody {
    subasts;
    constructor(subasts) {
        this.subasts = subasts;
    }

    toString() {
        return `{ ${this.subasts.map(e => e.toString()).join('; ')} }`
    }
}

class NodeList {
    subasts;
    constructor(subasts) {
        this.subasts = subasts;
    }

    eval(env) {
        return new List(this.subasts.map(t => eval_ast(t, env)))
    }

    toString() {
        return `[ ${this.subasts.map(e => e.toString()).join(', ')} ]`
    }
}

class NodeComplex {
    re;
    im;
    
    constructor(re, im) {
        this.re = re;
        this.im = im;
    }

    eval() {
        return new Complex(this.re, this.im);
    }

    toString() {
        return `${this.re} + ${this.im}i`
    }
}

class NodeString {
    text;
    replacements;

    constructor(text, replacements) {
        this.text = text;
        this.replacements = replacements;
    }

    eval(env) {
        let string = "";

        let base = 0;
        for (const r of this.replacements) {
            const {start, end} = r;
            string += this.text.slice(base, start);
            switch (r.type) {
                case "escape":
                    string += r.value;
                    break;
                
                case "expr":
                    string += eval_ast(r.ast, env).toString();
                    break;
            }
            base = end + 1;
        }

        string += this.text.slice(base);

        return new VString(string);
    }

    toString() {
        return `"${this.text}"`;
    }
}

class NodeIdentifier {
    name;

    constructor(name) {
        this.name = name;
    }
    
    eval(env) {
        if (this.name in env && env[this.name].length > 0) {
            const bindings = env[this.name];
            return bindings[bindings.length - 1];
        } else throw `${this.name} is not defined`
    }

    toString() {
        return this.name;
    }
}

class NodeOperation {
    operator;
    left;
    right;

    constructor(operator, left, right) {
        this.operator = operator;
        this.left = left;
        this.right = right;
    }

    toString() {
        return `${this.left} ${this.operator} ${this.right}`
    }
}

export {
    NodeExprBody, NodeList, NodeComplex, NodeIdentifier, NodeOperation, NodeString
}