import { List, Complex, VString, duplicate } from "./values.mjs";
import { eval_ast } from "./eval.mjs";

export class NodeExprBody {
    subasts;
    constructor(subasts) {
        this.subasts = subasts;
    }

    toString() {
        return `{ ${this.subasts.map(e => e.toString()).join('; ')} }`
    }

    get length() { return this.subasts.length }
    get(i) { return this.subasts[i] }
    set(i, v) { this.subasts[i] = v; return v}
    map(f) { return new NodeExprBody(this.subasts.map(f)); }
    filter(f) { return new NodeExprBody(this.subasts.filter(f)); }
    slice(s, e) { return new NodeExprBody(this.subasts.slice(s, e)) }
    pop() { return this.subasts.pop() }
    push(v) { this.subasts.push(v); return v; }
    
    reduce(f, i) {
        if (i == undefined) return this.subasts.reduce(f);
        return this.subasts.reduce(f, i);
    }

    accum(f, i) {
        let acc = i;
        let start = 0;
        if (i == undefined) {
            acc = this.subasts[0];
            start = 1;
        }
        
        const results = [acc];
        while (start < this.length) {
            acc = f(acc, this.get(start++));
            results.push(acc);
        }

        return new NodeExprBody(results);
    }

    splice(s, a) {
        return new NodeExprBody(this.subasts.splice(s, a));
    }

    concat(e2) {
        return new NodeExprBody(this.subasts.concat(e2.subasts))
    }

    async async_map(f) {
        return new NodeExprBody(await Promise.all(this.subasts.map(f)));
    }

    async async_filter(f) {
        const out = [];
        for (const e of this.subasts) {
            if (await f(e)) out.push(e);
        }

        return new NodeExprBody(out);
    }

    async async_reduce(f, i) {
        let acc = i;
        let start = 0;
        if (i == undefined) {
            acc = this.get(0);
            start = 1;
        }

        while (start < this.length) {
            acc = await f(acc, this.get(start++));
        }

        return acc;
    }

    async async_accum(f, i) {
        let acc = i;
        let start = 0;
        if (i == undefined) {
            acc = this.subasts[0];
            start = 1;
        }
        
        const results = [acc];
        while (start < this.length) {
            acc = await f(acc, this.get(start++));
            results.push(acc);
        }

        return new NodeExprBody(results);
    }

}

export class NodeList {
    subasts;
    constructor(subasts) {
        this.subasts = subasts;
    }

    async eval(env) {
        return new List(await Promise.all(this.subasts.map(t => eval_ast(t, env))))
    }

    toString() {
        return `[ ${this.subasts.map(e => e.toString()).join(', ')} ]`
    }
    
    get length() { return this.subasts.length }
    get(i) { return this.subasts[i] }
    set(i, v) { this.subasts[i] = v; return v}
    map(f) { return new NodeList(this.subasts.map(f)) }
    filter(f) { return new NodeList(this.subasts.filter(f)) }
    slice(s, e) { return new NodeList(this.subasts.slice(s, e)) }
    pop() { return this.subasts.pop() }
    push(v) { this.subasts.push(v); return v }

    reduce(f, i) {
        if (i == undefined) return this.subasts.reduce(f);
        return this.subasts.reduce(f, i);
    }

    accum(f, i) {
        let acc = i;
        let start = 0;
        if (i == undefined) {
            acc = this.subasts[0];
            start = 1;
        }
        
        const results = [acc];
        while (start < this.length) {
            acc = f(acc, this.get(start++));
            results.push(acc);
        }

        return new NodeList(results);
    }

    splice(s, a) {
        return new NodeList(this.subasts.splice(s, a))
    }

    concat(e2) {
        return new NodeList(this.subasts.concat(e2.subasts))
    }

    async async_map(f) {
        return new NodeList(await Promise.all(this.subasts.map(f)));
    }

    async async_filter(f) {
        const out = [];
        for (const e of this.subasts) {
            if (await f(e)) out.push(e);
        }

        return new NodeList(out);
    }

    async async_reduce(f, i) {
        let acc = i;
        let start = 0;
        if (i == undefined) {
            acc = this.get(0);
            start = 1;
        }

        while (start < this.length) {
            acc = await f(acc, this.get(start++));
        }

        return acc;
    }

    async async_accum(f, i) {
        let acc = i;
        let start = 0;
        if (i == undefined) {
            acc = this.subasts[0];
            start = 1;
        }
        
        const results = [acc];
        while (start < this.length) {
            acc = await f(acc, this.get(start++));
            results.push(acc);
        }

        return new NodeList(results);
    }
}

export class NodeComplex {
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
        return `${this.re}+${this.im}i`
    }
}

export class NodeString {
    text;
    replacements;

    constructor(text, replacements) {
        this.text = text;
        this.replacements = replacements;
    }

    async eval(env) {
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
                    string += (await eval_ast(r.ast, env)).toString();
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

export class NodeIdentifier {
    name;

    constructor(name) {
        this.name = name;
    }
    
    eval(env) {
        if (this.name in env.ENV && env.ENV[this.name].length > 0) {
            const bindings = env.ENV[this.name];
            return bindings[bindings.length - 1];
        } else throw `${this.name} is not defined`
    }

    toString() {
        return `:${this.name}`;
    }
}

export class NodeOperation {
    operator;
    left;
    right;

    get op() { return this.operator }
    set op(v) { this.operator = v }
    constructor(operator, left, right) {
        this.operator = operator;
        this.left = left;
        this.right = right;
    }

    toString() {
        return `(${this.left}) ${this.operator} (${this.right})`
    }
}

export class NodeAst {
    ast;

    constructor(ast) {
        this.ast = ast;
    }

    eval(env) {
        return duplicate(this.ast);
    }

    toString() {
        return `AST: ${this.ast}`;
    }
}
