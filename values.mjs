import * as CHECKS from "./checks.mjs";
import * as NODES from "./nodes.mjs";

export class BuiltinFunction {
    apply;
    name;

    constructor(f) {
        this.apply = f;
        this.name = f.name;
    }

    toString() {
        return `#builtin ${this.name}`
    }
}

export class VFunction {
    params;
    body;
    closure;
    variadic;

    constructor(params, body, closure, variadic = false) {
        this.params = params;
        this.body = body;
        this.closure = closure;
        this.variadic = variadic;
    }

    toString() {
        return `#procedure [${this.params.join(', ')}]`
    }
}

export class Complex {
    re;
    im;

    constructor(re, im) {
        this.re = re;
        this.im = im;
    }

    get real() { return this.re }
    get imag() { return this.im }

    toString() {
        let s = `${this.real} + ${this.imag}i`;
        CHECKS.isimag_fuzz(this) && (s = `${this.imag}i`);
        CHECKS.isreal_fuzz(this) && (s = `${this.real}`);
        CHECKS.iszero_fuzz(this) && (s = `0`);
        
        return s;
    }
    
}

export class List {
    values;

    constructor(values) {
        this.values = values;
    }

    map(f) {
        return new List(this.values.map(f));
    }

    async async_map(f) {
        return new List(await Promise.all(this.values.map(f)));
    }

    filter(f) {
        return new List(this.values.filter(f));
    }
    
    async async_filter(f) {
        const out = [];
        for (const e of this.values) {
            if (await f(e)) out.push(e);
        }

        return new List(out);
    }

    reduce(f, i) {
        if (i == undefined) return this.values.reduce(f);
        return this.values.reduce(f, i);
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

    every(f) {
	    return this.values.every(f);
    }

    some(f) {
        return this.values.some(f);
    }

    accum(f, i) {
        let acc = i;
        let start = 0;
        if (i == undefined) {
            acc = this.values[0];
            start = 1;
        }
        
        const results = [acc];
        while (start < this.length) {
            acc = f(acc, this.get(start++));
            results.push(acc);
        }

        return new List(results);
    }

    async async_accum(f, i) {
        let acc = i;
        let start = 0;
        if (i == undefined) {
            acc = this.values[0];
            start = 1;
        }
        
        const results = [acc];
        while (start < this.length) {
            acc = await f(acc, this.get(start++));
            results.push(acc);
        }

        return new List(results);
    }

    push(v) {
        return this.values.push(v);
    }

    pop() {
        return this.values.pop();
    }

    concat(l) {
        return new List(this.values.concat(l.values))
    }

    get length() { return this.values.length; }

    get(i) {
        return this.values[i];
    }

    set(i, v) {
        this.values[i] = v;
    }
    
    toString() {
        return `[${this.values.map(e => e.toString()).join(', ')}]`;
    }

    join(s) {
        return new VString(this.values.map(e => e.toString()).join(s.value));
    }

    slice(start, end) {
        return new List(this.values.slice(start, end));
    }

    splice(start, amt) {
        return new List(this.values.splice(start, amt));
    }
}


export class VString {
    value;

    constructor(value) {
        this.value = value;
    }

    get length() { return this.value.length; }

    toString() {
        return `${this.value}`;
    }

    get(i) {
        return new VString(this.value[i]);
    }

    set(idx, ch) {
        this.value = Object.entries({...this.value}).map(([i,c]) => i == idx ? ch.toString() : c).join('')
    }

    push(v) {
        this.value += v.toString();
    }

    pop() {
        const r = new VString(this.value[this.length - 1]);
        this.value = this.value.slice(0, -1);
        return r;
    }

    concat(s) {
        return new VString(this.value.concat(s.toString()));
    }

    split(d) {
        return new List(this.value.split(d.value).map(s => new VString(s)));
    }

    slice(start, end) {
        return new VString(this.value.slice(start, end));
    }

    splice(start, amt) {
        const v = this.value.split('');
        const o = v.splice(start, amt).join('');
        this.value = v.join('');
        return new VString(o);
    }

    map(f) {
        return this.split(new VString('')).map(f);
    }

    filter(f) {
        return this.split(new VString('')).filter(f);
    }

    reduce(f, i) {
        return this.split(new VString('')).reduce(f, i);
    }

    accum(f, i) {
        return this.split(new VString('')).accum(f, i);
    }

    async async_map(f) {
        return this.split(new VString('')).async_map(f)
    }

    async async_filter(f) {
        return this.split(new VString('')).async_filter(f);
    }

    async async_reduce(f, i) {
        return this.split(new VString('')).async_reduce(f, i);
    }

    async async_accum(f, i) {
        return this.split(new VString('')).async_accum,(f, i);
    }

}

export class VObject {
    value;

    constructor(obj) {
        this.value = obj;
    }

    get(key) {
        return this.value[key];
    }

    set(key, value) {
        this.value[key] = value;
        return value;
    }

    items() {
        return new List(
            Object.entries(this.value)
                .map(([k, v]) => new List([new VString(k.toString()), v]))
        )
    }

    toString() {
        return `{${Object.entries(this.value).map(([k, v]) => `${k.toString()}: ${v.toString()}`).join(', ')}}`;
    }
}

export function cond(...ps) {
    return function(v) {
        for (const [p, f] of ps) {
            if (p(v)) return f(v)
        }
    }
}

export const duplicate = cond(
    [CHECKS.ibfun, v => new BuiltinFunction(v.apply)],
    [CHECKS.icomp, v => new Complex(v.real, v.imag)],
    [CHECKS.ivfun, v => new VFunction(duplicate(v.params), duplicate(v.body), v.closure)],
    [CHECKS.ilist, v => new List(v.values.map(duplicate))],
    [CHECKS.ivstr, v => new VString(v.value)],
    [CHECKS.ivobj, v => new VObject(Object.fromEntries(Object.entries(v.value).map(([k, v]) => [k, duplicate(v)])))],
    [CHECKS.inast, v => new NODES.NodeAst(duplicate(v.ast))],
    [CHECKS.instring, v => new NODES.NodeString(v.text, v.replacements)],
    [CHECKS.incomp, v => new NODES.NodeComplex(v.re, v.im)],
    [CHECKS.inexpr, v => new NODES.NodeExprBody(v.subasts.map(duplicate))],
    [CHECKS.inlist, v => new NODES.NodeList(v.subasts.map(duplicate))],
    [CHECKS.inop, v => new NODES.NodeOperation(v.operator, duplicate(v.left), duplicate(v.right))],
    [CHECKS.inident, v => new NODES.NodeIdentifier(v.name)]
);

export const toJS = cond(
    [CHECKS.icomp, v => v.real],
    [CHECKS.ilist, v => v.values.map(toJS)],
    [CHECKS.ivstr, v => v.value],
    [CHECKS.ivobj, v => Object.fromEntries(Object.entries(v.value).map(([k, v]) => [k, toJS(v)]))],
    [() => true, v => {throw `Could not convert ${v} to JS`}]
);

export const fromJS = cond(
    [v => typeof v === 'string', v => new VString(v)],
    [v => v instanceof Array, v => new List(v.map(fromJS))],
    [v => typeof v === 'number', v => new Complex(v, 0)],
    [v => typeof v === 'boolean', v => v ? new Complex(1, 0) : new Complex(0, 0)],
    [v => typeof v === 'object', v => new VObject(Object.fromEntries(Object.entries(v).map(([k, v]) => [k, fromJS(v)])))],
    [() => true, v => {throw `Could not convert ${v} from JS`}]
);
