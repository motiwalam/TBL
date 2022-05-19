import * as CHECKS from "./checks.mjs";
import * as NODES from "./nodes.mjs";
import { eval_application } from "./eval.mjs";

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

    toString(wm = new WeakMap()) {
        if (wm.has(this)) return '[...]';
        wm.set(this);

        return `[${this.values.map(e => e.toString(wm)).join(', ')}]`;
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
        this.value = Object.entries({ ...this.value }).map(([i, c]) => i == idx ? ch.toString() : c).join('')
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
        return this.split(new VString('')).async_accum, (f, i);
    }

}

const OutgoingTransform = Symbol("OutgoingTransform");
const IncomingTransform = Symbol("IncomingTransform");
const isProxy = Symbol("isProxy");

export class VObject {
    value;

    constructor(obj) {
        this.value = obj;
        this[isProxy] = false;
    }

    [OutgoingTransform](v) { return v; }
    [IncomingTransform](v) { return v; }

    get(key) {
        return this[OutgoingTransform](this.value[key]);
    }

    set(key, value) {
        this.value[key] = this[IncomingTransform](value);
        return value;
    }

    keys() {
        return new List(enumerateAllKeys(this.value).map(k => new VString(k)))
    }

    values() {
        return this.keys().map(k => this.get(k.value));
    }

    items() {
        const keys = this.keys();
        const vals = this.values();

        const out = new List([]);
        for (let i = 0; i < keys.length; i++) {
            out.push(new List([keys.get(i), vals.get(i)]));
        }

        return out;
    }

    has(key) {
        return fromJS(this.value[key] !== undefined);
    }

    del(key) {
        return fromJS(delete this.value[key]);
    }

    toString(wm = new WeakMap()) {
        if (this[isProxy]) {
            if (wm.has(this.value)) return `{...}`;
            wm.set(this.value)
        } else {
            if (wm.has(this)) return `{...}`;
            wm.set(this);
        }
        
        return `{ ${Object.keys(this.value).map(k => `"${k}": ${this.get(k)?.toString(wm)}`).join(', ')} }`    
    }

    static proxy(obj) {
        const o = new VObject(obj);
        o[OutgoingTransform] = v => fromJS(typeof v === 'function' ? v.bind(obj) : v);
        o[IncomingTransform] = toJS;
        o[isProxy] = true;

        return o;
    }
}

// https://gist.github.com/jasonayre/5d9ebd64299bf69c8637a9e03e33a3fb
export const enumerateAllKeys = (obj) => {
    const isOrig = (keys, i, prop) => prop !== 'constructor'
                                  && (i === 0 || prop !== keys[i - 1])
                                  && !out.includes(prop)

    const out = [];

    do {
        const l = Object.getOwnPropertyNames(obj).sort().filter(isOrig);
        l.forEach(k => out.push(k));

        // walk-up the prototype chain
        obj = Object.getPrototypeOf(obj)
    } while (
        // not the the Object prototype methods (hasOwnProperty, etc...)
        obj && Object.getPrototypeOf(obj)
    )

    return out;
}

export function cond(...ps) {
    return function (v) {
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

export const toJS = (v, wm = new WeakMap()) => cond(
    [CHECKS.icomp, v => v.real],
    [CHECKS.ilist, v => {
        if (wm.has(v)) return wm.get(v);

        const o = [];
        wm.set(v, o);

        v.values.forEach(e => { o.push(toJS(e, wm)) });

        return o;
    }],
    [CHECKS.ivstr, v => v.value],
    [CHECKS.ivobj, v => {
        if (v[isProxy]) return v.value;
        if (wm.has(v)) return wm.get(v);
        
        const r = {};
        wm.set(v, r);

        Object.entries(v.value).forEach(([k, v]) => { r[k] = toJS(v, wm) });
        return r;
    }],
    [CHECKS.ivfun, v => async (...args) => toJS(await eval_application(v, fromJS(args), v.closure), wm)],
    [CHECKS.ibfun, cond(
        [f => f.apply[Symbol.toStringTag] === 'AsyncFunction', f => async (...args) => toJS(await f.apply(fromJS(args), {}), wm)],
        [() => true, f => (...args) => toJS(f.apply(fromJS(args), {}), wm)],
    )],
    [() => true, v => { throw `Could not convert ${v} to JS` }]
)(v);

export const fromJS = (v, wm = new WeakMap()) => cond(
    [v => typeof v === 'string', v => new VString(v)],
    [v => v instanceof Array, v => {
        if (wm.has(v)) return wm.get(v);

        const o = new List([]);
        wm.set(v, o);

        v.forEach(e => { o.push(fromJS(e, wm)) });

        return o;
    }],
    [v => typeof v === 'number', v => new Complex(v, 0)],
    [v => typeof v === 'boolean', v => v ? new Complex(1, 0) : new Complex(0, 0)],
    [v => v === null || v === undefined, () => new Complex(0, 0)], // nullish
    [v => typeof v === 'object', v => {
        if (wm.has(v)) return wm.get(v);
        const r = VObject.proxy(v);
        wm.set(v, r);
        return r;
    }],
    [v => typeof v === 'function', f => new BuiltinFunction(async params => fromJS(await f(...toJS(params)), wm))],
    [() => true, v => { throw `Could not convert ${v} from JS` }]
)(v);
