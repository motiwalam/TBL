import { List, Complex, VFunction, BuiltinFunction } from "./values.mjs";
import { LANG } from "./language.mjs";
import { ERRORS } from "./errors.mjs";
import assert from "assert";

const ilist = o => o instanceof List;
const icomp = o => o instanceof Complex;
const ivfun = o => o instanceof VFunction;
const ibfun = o => o instanceof BuiltinFunction;

const icc = (a, b) => icomp(a) && icomp(b);
const icl = (a, b) => icomp(a) && ilist(b);
const ilc = (a, b) => ilist(a) && icomp(b);
const ill = (a, b) => ilist(a) && ilist(b);

const assert_list = (o, m) => assert(ilist(o), m);
const assert_complex = (o, m) => assert(icomp(o), m);
const assert_vfunc = (o, m) => assert(ivfun(o), m);
const assert_builtin = (o, m) => assert(ibfun(o), m);

const assert_func = (o, m) => assert(ivfun(o) || ibfun(o), m);
const assert_value = (o, m) => assert([ilist, icomp, ivfun, ibfun].some(f => f(o)), m);

const assert_cc = (a, b, m) => assert(icc(a, b), m);
const assert_cl = (a, b, m) => assert(icl(a, b), m);
const assert_lc = (a, b, m) => assert(ilc(a, b), m);
const assert_ll = (a, b, m) => assert(ill(a, b), m);

const isreal_strict = c => c.imag == 0;
const isimag_strict = c => c.real == 0;
const isreal_fuzz = c => Math.abs(c.imag) < LANG.TINY;
const isimag_fuzz = c => Math.abs(c.real) < LANG.TINY;

const iszero_strict = c => isreal_strict(c) && isimag_strict(c);
const iszero_fuzz = c => isreal_fuzz(c) && isimag_fuzz(c);

const assert_isreal_strict = (c, m) => assert(icomp(c) && isreal_strict(c), m);
const assert_isimag_strict = (c, m) => assert(icomp(c) && isimag_strict(c), m);
const assert_isreal_fuzz = (c, m) => assert(icomp(c) && isreal_fuzz(c), m);
const assert_isimag_fuzz = (c, m) => assert(icomp(c) && isimag_fuzz(c), m);

const assert_le = (a, b) => (assert_list(a), assert_list(b), assert(a.length == b.length, ERRORS.UNEQUAL_LENGTH));

export {
    ilist,
    icomp,
    ivfun,
    ibfun,
    icc,
    icl,
    ilc,
    ill,
    assert_list,
    assert_complex,
    assert_vfunc,
    assert_builtin,
    assert_func,
    assert_value,
    assert_cc,
    assert_cl,
    assert_lc,
    assert_ll,
    isreal_strict,
    isimag_strict,
    isreal_fuzz,
    isimag_fuzz,
    assert_le,
    assert_isreal_strict,
    assert_isimag_strict,
    assert_isreal_fuzz,
    assert_isimag_fuzz,
    iszero_strict,
    iszero_fuzz,
}