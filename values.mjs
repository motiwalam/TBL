import { 
    icomp, ivfun, ibfun, ilist, ivstr,
    isreal_fuzz, isimag_fuzz, iszero_fuzz,
    inast, incomp, inexpr, inident, instring, inlist, inop
} from "./checks.mjs";

import {
    NodeAst,
    NodeComplex,
    NodeExprBody,
    NodeIdentifier,
    NodeString,
    NodeList,
    NodeOperation,
} from "./nodes.mjs";

class BuiltinFunction {
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

class VFunction {
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

class Complex {
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
        isimag_fuzz(this) && (s = `${this.imag}i`);
        isreal_fuzz(this) && (s = `${this.real}`);
        iszero_fuzz(this) && (s = `0`);
        
        return s;
    }
    
}

class List {
    values;

    constructor(values) {
        this.values = values;
    }

    map(f) {
        return new List(this.values.map(f));
    }

    filter(f) {
        return new List(this.values.filter(f));
    }

    reduce(f, i) {
        if (i == undefined) return this.values.reduce(f);
        return this.values.reduce(f, i);
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


class VString {
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
        const values = this.split(new VString(''));
        if (i == undefined) return values.reduce(f);
        return values.reduce(f, i);
    }

    accum(f, i) {
        const values = this.split(new VString(''));
        let acc = i;
        let start = 0;
        if (i == undefined) {
            acc = values.get(0);
            start = 1;
        }
        
        const results = [acc];
        while (start < this.length) {
            acc = f(acc, this.get(start++));
            results.push(acc);
        }

        return new List(results);
    }

}

function duplicate(v) {
    if (ibfun(v)) return new BuiltinFunction(f.apply);

    if (icomp(v)) return new Complex(v.real, v.imag);

    if (ivfun(v)) return new VFunction(v.params, v.body, v.closure);

    if (ilist(v)) return new List(v.values.map(duplicate))

    if (ivstr(v)) return new VString(v.value);

    if (inast(v)) return new NodeAst(duplicate(v.ast));

    if (instring(v)) return new NodeString(v.text, v.replacements);

    if (incomp(v)) return new NodeComplex(v.re, v.im);

    if (inexpr(v)) return new NodeExprBody(v.subasts.map(duplicate));

    if (inlist(v)) return new NodeList(v.subasts.map(duplicate));

    if (inop(v)) return new NodeOperation(v.operator, duplicate(v.left), duplicate(v.right));

    if (inident(v)) return new NodeIdentifier(v.name);
}

export {
    BuiltinFunction, VFunction, Complex, List, VString, duplicate
}
