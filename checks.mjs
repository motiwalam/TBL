import { List, Complex, VFunction, BuiltinFunction, VString, VObject } from "./values.mjs";
import { NodeExprBody, NodeList, NodeComplex, NodeString, NodeIdentifier, NodeOperation, NodeAst } from "./nodes.mjs";
import { LANG } from "./language.mjs";
import { ERRORS } from "./errors.mjs";
import assert from "assert";

export const and = (...fs) => o => fs.every(f => f(o));
export const or = (...fs) => o => fs.some(f => f(o));

export const ilist = o => o instanceof List;
export const icomp = o => o instanceof Complex;
export const ivfun = o => o instanceof VFunction;
export const ibfun = o => o instanceof BuiltinFunction;
export const ivstr = o => o instanceof VString;
export const ivobj = o => o instanceof VObject;

export const idata = or(ilist, icomp, ivfun, ibfun, ivstr, ivobj);
export const assert_data = (o, m) => assert(idata(o), m);

export const ilors = or(ivstr, ilist);
export const ifunc = or(ivfun, ibfun);

export const icc = (a, b) => icomp(a) && icomp(b);
export const icl = (a, b) => icomp(a) && ilist(b);
export const ilc = (a, b) => ilist(a) && icomp(b);
export const ill = (a, b) => ilist(a) && ilist(b);
export const iss = (a, b) => ivstr(a) && ivstr(b);
export const ils = (a, b) => ilist(a) && ivstr(b);
export const isl = (a, b) => ivstr(a) && ilist(b);
export const isc = (a, b) => ivstr(a) && icomp(b);

export const assert_list = (o, m) => assert(ilist(o), m);
export const assert_complex = (o, m) => assert(icomp(o), m);
export const assert_vfunc = (o, m) => assert(ivfun(o), m);
export const assert_builtin = (o, m) => assert(ibfun(o), m);
export const assert_vstring = (o, m) => assert(ivstr(o), m);
export const assert_vobject = (o, m) => assert(ivobj(o), m);

export const assert_lors = (o, m) => assert(ilors(o), m);
export const assert_func = (o, m) => assert(ifunc(o), m);

export const assert_cc = (a, b, m) => assert(icc(a, b), m);
export const assert_cl = (a, b, m) => assert(icl(a, b), m);
export const assert_lc = (a, b, m) => assert(ilc(a, b), m);
export const assert_ll = (a, b, m) => assert(ill(a, b), m);
export const assert_ls = (a, b, m) => assert(ils(a, b), m);
export const assert_sl = (a, b, m) => assert(isl(a, b), m);

export const isreal_strict = c => c.imag == 0;
export const isimag_strict = c => c.real == 0;
export const isreal_fuzz = c => Math.abs(c.imag) < LANG.TINY;
export const isimag_fuzz = c => Math.abs(c.real) < LANG.TINY;

export const iszero_strict = and(isreal_strict, isimag_strict);
export const iszero_fuzz = and(isreal_fuzz, isimag_fuzz);

export const ivalid_opstring = c => 
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

export const inexpr = c => c instanceof NodeExprBody;
export const inlist = c => c instanceof NodeList;
export const incomp = c => c instanceof NodeComplex;
export const instring = c => c instanceof NodeString;
export const inident = c => c instanceof NodeIdentifier;
export const inast = c => c instanceof NodeAst;
export const inop = c => c instanceof NodeOperation;
export const inoper = o => inop(o) && o.operator == o;
export const inopers = Object.fromEntries(LANG.OPERATORS({}).map(o => [o, inoper(o)]));

export const inode = or(inexpr, inlist, incomp, instring, inident, inast, inop);

export const assert_isreal_strict = (c, m) => assert(icomp(c) && isreal_strict(c), m);
export const assert_isimag_strict = (c, m) => assert(icomp(c) && isimag_strict(c), m);
export const assert_isreal_fuzz = (c, m) => assert(icomp(c) && isreal_fuzz(c), m);
export const assert_isimag_fuzz = (c, m) => assert(icomp(c) && isimag_fuzz(c), m);
export const assert_integral = (n, m) => assert(n == Math.floor(n), m);

export const assert_le = (a, b) => (assert_list(a), assert_list(b), assert(a.length == b.length, ERRORS.UNEQUAL_LENGTH));

export const assert_valid_opstring = (o, m) => assert(ivalid_opstring(o), m);

export const assert_op = (a, m) => assert(inop(a), m);
export const assert_node = (a, m) => assert(inode(a), m);
export const assert_ident = (a, m) => assert(inident(a), m);

export const is_indexable = or(ilist, ivstr, inlist, inexpr, instring);
export const assert_indexable = (a, m) => assert(is_indexable(a), m);

export const ivalue = or(idata, inode);
export const assert_value = (o, m) => assert(ivalue(o), m);

export const assert_nstring = (o, m) => assert(instring(o), m);
export const assert_ncomp = (o, m) => assert(incomp(o), m);