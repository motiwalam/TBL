import * as VALUES from "./values.mjs";
import * as CHECKS from "./checks.mjs";
import * as ERRORS from "./errors.mjs";
import assert from "assert";


export const neg_complex = z => new VALUES.Complex(-z.real, -z.imag);
export const con_complex = z => new VALUES.Complex(z.real, -z.imag);
export const abs_complex = z => Math.sqrt(z.real * z.real + z.imag * z.imag);
export const rad_complex = z => Math.atan2(z.imag, z.real);

export const add_complex = (a, b) => new VALUES.Complex(a.real + b.real, a.imag + b.imag);
export const sub_complex = (a, b) => add_complex(a, neg_complex(b));

export const mul_complex = (a, b) => new VALUES.Complex(a.real * b.real - a.imag * b.imag, a.real * b.imag + a.imag * b.real);
export const div_complex = (a, b) => {
    const z = mul_complex(a, con_complex(b));
    const d = b.real * b.real - b.imag * b.imag;

    return new VALUES.Complex(z.real / d, z.imag / d);
}


export const bool = v => (CHECKS.assert_value(v, `can not coerce non value to boolean`), !(CHECKS.icomp(v) && v.real == 0 && v.imag == 0))
export const fbool = b => b ? new VALUES.Complex(1, 0) : new VALUES.Complex(0, 0);

export const eq_complex = (a, b) => fbool(a.real == b.real && a.imag == b.imag);
export const neq_complex = (a, b) => fbool(a.real != b.real || a.imag != b.imag);

export const lt_complex = (a, b) => {
    if ([a, b].every(CHECKS.isreal_strict)) return fbool(a.real < b.real);
    if ([a, b].every(CHECKS.isimag_strict)) return fbool(a.imag < b.imag);
    return fbool(abs_complex(a) < abs_complex(b));
};
export const lte_complex = (a, b) => fbool([lt_complex(a, b), eq_complex(a, b)].some(bool));

export const gt_complex = (a, b) => fbool(!bool(lte_complex(a, b)));
export const gte_complex = (a, b) => fbool(!bool(lt_complex(a, b)));

export const pow_complex = (a, b) => {
    if (CHECKS.iszero_strict(b)) return new VALUES.Complex(1, 0);
    if (CHECKS.iszero_strict(a)) {
        if (b.imag != 0 || b.real < 0) throw `can not raise 0 to the power of negative or complex power`;
        return new VALUES.Complex(0, 0);
    }

    const vabs = abs_complex(a);
    let len    = Math.pow(vabs, b.real);
    const at   = rad_complex(a);
    let phase  = at * b.real;
    if (!CHECKS.isreal_strict(b)) {
        len /= Math.exp(at * b.imag);
        phase += b.imag * Math.log(vabs);
    }

    return new VALUES.Complex(len * Math.cos(phase), len * Math.sin(phase));
    
}

export const add_vstring = (a, b) => new VALUES.VString(a.value + b.value);
export const add_strings = (a, b) => new VALUES.VString(a + b);

export function zip(...ls) {
    assert(new Set(ls.map(l => l.length)).size == 1, `Can not zip lists of unequal lengths`);
    const values = Array.from({length: ls[0]?.length}, (_, i) => ls.map(l => l.get(i)));
    return new VALUES.List(values);
}

export function pow(a, b) {
    let r = null;
    if (CHECKS.icc(a, b)) {
        if (CHECKS.isreal_strict(a) && CHECKS.isreal_strict(b) && !(a.real <= 0 && Math.abs(b.real) < 1) && !(a.real == 0 && b.real < 0))
            r = new VALUES.Complex(Math.pow(a.real, b.real), 0);
        else
            r = pow_complex(a, b);
    }
    CHECKS.icl(a, b) && (r = b.map(e => pow(a, e)));
    CHECKS.ilc(a, b) && (r = a.map(e => pow(e, b)));
    CHECKS.ill(a, b) && (r = (zip(a, b).map(([e1, e2]) => pow(e1, e2))));

    if (r !== null) return r;

    throw ERRORS.INVALID_ARG_POW(a, b);
    
}

export function mul(a, b) {
    let r = null;
    CHECKS.icc(a, b) && (r = mul_complex(a, b));
    CHECKS.icl(a, b) && (r = b.map(e => mul(a, e)));
    CHECKS.ilc(a, b) && (r = a.map(e => mul(e, b)));
    CHECKS.ill(a, b) && (r = (zip(a, b).map(([e1, e2]) => mul(e1, e2))));

    if (CHECKS.isc(a, b)) {
        CHECKS.assert_isreal_strict(b, "can not multiply string by complex number");
        CHECKS.assert_integral(b.real, "can not multiply string by non-integer");

        r = new VALUES.VString(Array(Math.max(b.real, 0)).fill(a.toString()).join(""));
    }
    if (r !== null) return r;

    throw ERRORS.INVALID_ARG_MUL(a, b);
}

export function div(a, b) {
    let r = null;
    CHECKS.icc(a, b) && (r = div_complex(a, b));
    CHECKS.icl(a, b) && (r = b.map(e => div(a, e)));
    CHECKS.ilc(a, b) && (r = a.map(e => div(e, b)));
    CHECKS.ill(a, b) && (r = (zip(a, b).map(([e1, e2]) => div(e1, e2))));

    
    if (r !== null) return r;
    
    throw ERRORS.INVALID_ARG_DIV(a, b);
}

export function add(a, b) {
    let r = null;
    CHECKS.icc(a, b) && (r = add_complex(a, b));
    CHECKS.icl(a, b) && (r = b.map(e => add(a, e)));
    CHECKS.ilc(a, b) && (r = a.map(e => add(e, b)));
    CHECKS.ill(a, b) && (r = (zip(a, b).map(([e1, e2]) => add(e1, e2))));
    
    CHECKS.ivstr(a) && (r = add_strings(a.toString(), b.toString()));
    CHECKS.ivstr(b) && (r = add_strings(a.toString(), b.toString()));
    CHECKS.iss(a, b) && (r = add_vstring(a, b));

    if (r !== null) return r;
    throw ERRORS.INVALID_ARG_ADD(a, b);
}

export function sub(a, b) {
    let r = null;
    CHECKS.icc(a, b) && (r = sub_complex(a, b));
    CHECKS.icl(a, b) && (r = b.map(e => sub(a, e)));
    CHECKS.ilc(a, b) && (r = a.map(e => sub(e, b)));
    CHECKS.ill(a, b) && (r = (zip(a, b).map(([e1, e2]) => sub(e1, e2))));

    if (r !== null) return r;

    throw ERRORS.INVALID_ARG_SUB(a, b);
}

export function mod(a, b) {
    let r = null;
    CHECKS.icc(a, b) && CHECKS.isreal_fuzz(a) && CHECKS.isreal_fuzz(b) && (r = new VALUES.Complex(a.real % b.real, 0));
    CHECKS.icl(a, b) && (r = b.map(e => mod(a, e)));
    CHECKS.ilc(a, b) && (r = a.map(e => mod(e, b)));
    CHECKS.ill(a, b) && (r = zip(a, b).map(([e1, e2]) => mod(e1, e2)));
    if (r !== null) return r;
    
    throw ERRORS.INVALID_ARG_MOD(a, b);
}

export function eq(a, b) {
    let r = null;
    CHECKS.icc(a, b) && (r = eq_complex(a, b));
    CHECKS.icl(a, b) && (r = b.map(e => eq(a, e)));
    CHECKS.ilc(a, b) && (r = a.map(e => eq(e, b)));
    CHECKS.ill(a, b) && (r = a.length == b.length ? fbool(zip(a, b).every(([e1, e2]) => bool(eq(e1, e2)))) : fbool(false));
    CHECKS.iss(a, b) && (r = fbool(a.value == b.value));
    CHECKS.isl(a, b) && (r = b.map(e => eq(a, e)));
    CHECKS.ils(a, b) && (r = a.map(e => eq(e, b)));


    if (r !== null) return r;
    else return fbool(false);
}

export function neq(a, b) {
    let r = null;
    CHECKS.icc(a, b) && (r = neq_complex(a, b));
    CHECKS.icl(a, b) && (r = b.map(e => neq(a, e)));
    CHECKS.ilc(a, b) && (r = a.map(e => neq(e, b)));
    CHECKS.ill(a, b) && (r = a.length == b.length ? fbool(zip(a, b).some(([e1, e2]) => bool(neq(e1, e2)))) : fbool(true));
    CHECKS.iss(a, b) && (r = fbool(a.value != b.value));
    CHECKS.isl(a, b) && (r = b.map(e => neq(a, e)));
    CHECKS.ils(a, b) && (r = a.map(e => neq(e, b)));


    if (r !== null) return r;
    else return fbool(true);
}

export function lt(a, b) {
    let r = null;
    CHECKS.icc(a, b) && (r = lt_complex(a, b));
    CHECKS.icl(a, b) && (r = b.map(e => lt(a, e)));
    CHECKS.ilc(a, b) && (r = a.map(e => lt(e, b)));
    CHECKS.ill(a, b) && (r = zip(a, b).map(([e1, e2]) => lt(e1, e2)));
    
    CHECKS.iss(a, b) && (r = fbool(a.value < b.value));
    if (r !== null) return r;

    throw ERRORS.INVALID_ARG_LT(a, b);
}

export function gt(a, b) {
    let r = null;
    CHECKS.icc(a, b) && (r = gt_complex(a, b));
    CHECKS.icl(a, b) && (r = b.map(e => gt(a, e)));
    CHECKS.ilc(a, b) && (r = a.map(e => gt(e, b)));
    CHECKS.ill(a, b) && (r = zip(a, b).map(([e1, e2]) => gt(e1, e2)));

    CHECKS.iss(a, b) && (r = fbool(a.value > b.value));
    
    if (r !== null) return r;
    
    throw ERRORS.INVALID_ARG_GT(a, b);
}

export function lte(a, b) {
    let r = null;
    CHECKS.icc(a, b) && (r = lte_complex(a, b));
    CHECKS.icl(a, b) && (r = b.map(e => lte(a, e)));
    CHECKS.ilc(a, b) && (r = a.map(e => lte(e, b)));
    CHECKS.ill(a, b) && (r = zip(a, b).map(([e1, e2]) => lte(e1, e2)));
    
    CHECKS.iss(a, b) && (r = fbool(a.value <= b.value));
    if (r !== null) return r;
    
    throw ERRORS.INVALID_ARG_LTE(a, b);
}

export function gte(a, b) {
    let r = null;
    CHECKS.icc(a, b) && (r = gte_complex(a, b));
    CHECKS.icl(a, b) && (r = b.map(e => gte(a, e)));
    CHECKS.ilc(a, b) && (r = a.map(e => gte(e, b)));
    CHECKS.ill(a, b) && (r = zip(a, b).map(([e1, e2]) => gte(e1, e2)));
    
    CHECKS.iss(a, b) && (r = fbool(a.value >= b.value));
    if (r !== null) return r;

    throw ERRORS.INVALID_ARG_GTE(a, b);
}


export function abs(c) {
    CHECKS.assert_complex(c, `Can not take absolute value of non complex value`);
    return new VALUES.Complex(abs_complex(c), 0);
}
