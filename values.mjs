import { 
    icomp, ivfun, ibfun, ilist,
    isreal_fuzz, isimag_fuzz, iszero_fuzz,
} from "./checks.mjs";

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

    constructor(params, body, closure) {
        this.params = params;
        this.body = body;
        this.closure = closure;
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

    push(v) {
        return this.values.push(v);
    }

    pop() {
        return this.values.pop();
    }

    concat(l) {
        return new List(this.values.concat(l.values))
    }

    get length() { return this.values.length }

    get(i) {
        return this.values[i];
    }

    set(i, v) {
        this.values[i] = v;
    }
    
    toString() {
        return `[${this.values.map(e => e.toString()).join(', ')}]`;
    }
}

function duplicate(v) {
    if (ibfun(v)) {
        return new BuiltinFunction(f.apply);
    }

    if (icomp(v)) {
        return new Complex(v.real, v.imag);
    }

    if (ivfun(v)) {
        // not really a proper clone
        return new VFunction(v.params, v.body, v.closure);
    }

    if (ilist(v)) {
        return new List(v.values.map(duplicate))
    }
}

export {
    BuiltinFunction, VFunction, Complex, List, duplicate
}