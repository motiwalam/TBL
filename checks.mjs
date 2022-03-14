import { List, Complex, VFunction, BuiltinFunction, VString } from "./values.mjs";
import { NodeExprBody, NodeList, NodeComplex, NodeString, NodeIdentifier, NodeOperation, NodeAst } from "./nodes.mjs";
import { LANG } from "./language.mjs";
import { ERRORS } from "./errors.mjs";
import assert from "assert";

const and = (...fs) => o => fs.every(f => f(o));
const or = (...fs) => o => fs.some(f => f(o));

const ilist = o => o instanceof List;
const icomp = o => o instanceof Complex;
const ivfun = o => o instanceof VFunction;
const ibfun = o => o instanceof BuiltinFunction;
const ivstr = o => o instanceof VString;

const ilors = or(ivstr, ilist);
const ifunc = or(ivfun, ibfun);

const icc = (a, b) => icomp(a) && icomp(b);
const icl = (a, b) => icomp(a) && ilist(b);
const ilc = (a, b) => ilist(a) && icomp(b);
const ill = (a, b) => ilist(a) && ilist(b);
const iss = (a, b) => ivstr(a) && ivstr(b);
const ils = (a, b) => ilist(a) && ivstr(b);
const isl = (a, b) => ivstr(a) && ilist(b);
const isc = (a, b) => ivstr(a) && icomp(b);

const assert_list = (o, m) => assert(ilist(o), m);
const assert_complex = (o, m) => assert(icomp(o), m);
const assert_vfunc = (o, m) => assert(ivfun(o), m);
const assert_builtin = (o, m) => assert(ibfun(o), m);
const assert_vstring = (o, m) => assert(ivstr(o), m);

const assert_lors = (o, m) => assert(ilors(o), m);
const assert_func = (o, m) => assert(ifunc(o), m);

const assert_cc = (a, b, m) => assert(icc(a, b), m);
const assert_cl = (a, b, m) => assert(icl(a, b), m);
const assert_lc = (a, b, m) => assert(ilc(a, b), m);
const assert_ll = (a, b, m) => assert(ill(a, b), m);
const assert_ls = (a, b, m) => assert(ils(a, b), m);
const assert_sl = (a, b, m) => assert(isl(a, b), m);

const isreal_strict = c => c.imag == 0;
const isimag_strict = c => c.real == 0;
const isreal_fuzz = c => Math.abs(c.imag) < LANG.TINY;
const isimag_fuzz = c => Math.abs(c.real) < LANG.TINY;

const iszero_strict = and(isreal_strict, isimag_strict);
const iszero_fuzz = and(isreal_fuzz, isimag_fuzz);

const ivalid_opstring = c => 
    !Array.from(c).every(
        e => [
            LANG.OPEN_GROUPS.reduce((a, b) => a.concat(b)).includes(e),
            LANG.CLOSE_GROUPS.reduce((a, b) => a.concat(b)).includes(e),
            LANG.NUMBER_START.includes(e),
            LANG.IDENTIFIER_BODY.includes(e),
            [LANG.COMMENT_SEPARATOR, LANG.STATEMENT_SEPARATOR, LANG.LIST_SEPARATOR].includes(e),
        ].some(b => b)
    )
;

const inexpr = c => c instanceof NodeExprBody;
const inlist = c => c instanceof NodeList;
const incomp = c => c instanceof NodeComplex;
const instring = c => c instanceof NodeString;
const inident = c => c instanceof NodeIdentifier;
const inast = c => c instanceof NodeAst;
const inop = c => c instanceof NodeOperation;
const inoper = o => inop(o) && o.operator == o;
const inopers = Object.fromEntries(LANG.OPERATORS({}).map(o => [o, inoper(o)]));

const inode = or(inexpr, inlist, incomp, instring, inident, inast, inop);

const assert_isreal_strict = (c, m) => assert(icomp(c) && isreal_strict(c), m);
const assert_isimag_strict = (c, m) => assert(icomp(c) && isimag_strict(c), m);
const assert_isreal_fuzz = (c, m) => assert(icomp(c) && isreal_fuzz(c), m);
const assert_isimag_fuzz = (c, m) => assert(icomp(c) && isimag_fuzz(c), m);
const assert_integral = (n, m) => assert(n == Math.floor(n), m);

const assert_le = (a, b) => (assert_list(a), assert_list(b), assert(a.length == b.length, ERRORS.UNEQUAL_LENGTH));

const assert_valid_opstring = (o, m) => assert(ivalid_opstring(o), m);

const assert_op = (a, m) => assert(inop(a), m);
const assert_node = (a, m) => assert(inode(a), m);

const is_indexable = o => or(ilist, ivstr, inlist, inexpr, instring);
const assert_indexable = (a, m) => assert(is_indexable(a), m);

const ivalue = or(ilist, icomp, ivfun, ibfun, ivstr, inode);
const assert_value = (o, m) => assert(ivalue(o), m);

export {
    ilist,
    icomp,
    ivfun,
    ibfun,
    ivstr,
    icc,
    icl,
    ilc,
    ill,
    iss,
    ils,
    isl,
    isc,
    ilors,
    ifunc,
    ivalue,
    assert_list,
    assert_complex,
    assert_vfunc,
    assert_builtin,
    assert_vstring,
    assert_func,
    assert_value,
    assert_lors,
    assert_cc,
    assert_cl,
    assert_lc,
    assert_ll,
    assert_ls,
    assert_sl,
    isreal_strict,
    isimag_strict,
    isreal_fuzz,
    isimag_fuzz,
    assert_le,
    assert_isreal_strict,
    assert_isimag_strict,
    assert_isreal_fuzz,
    assert_isimag_fuzz,
    assert_integral,
    iszero_strict,
    iszero_fuzz,
    ivalid_opstring,
    assert_valid_opstring,
    inexpr,
    inlist,
    incomp,
    instring,
    inident,
    inop,
    inast,
    inoper, inopers,
    inode,
    assert_op,
    assert_node,
    is_indexable,
    assert_indexable,
}