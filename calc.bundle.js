var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);

// nodes.mjs
class NodeExprBody {
  subasts;
  constructor(subasts) {
    this.subasts = subasts;
  }
  toString(wm = new WeakMap) {
    if (wm.has(this))
      return `{; ... ;}`;
    wm.set(this);
    return `{; ${this.subasts.map((e) => e.toString(wm)).join("; ")} ;}`;
  }
  get length() {
    return this.subasts.length;
  }
  get(i) {
    return this.subasts[i];
  }
  set(i, v) {
    this.subasts[i] = v;
    return v;
  }
  map(f) {
    return new NodeExprBody(this.subasts.map(f));
  }
  filter(f) {
    return new NodeExprBody(this.subasts.filter(f));
  }
  slice(s, e) {
    return new NodeExprBody(this.subasts.slice(s, e));
  }
  pop() {
    return this.subasts.pop();
  }
  push(v) {
    this.subasts.push(v);
    return v;
  }
  reduce(f, i) {
    if (i == undefined)
      return this.subasts.reduce(f);
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
    return new NodeExprBody(this.subasts.concat(e2.subasts));
  }
  async async_map(f) {
    return new NodeExprBody(await Promise.all(this.subasts.map(f)));
  }
  async async_filter(f) {
    const out = [];
    for (const e of this.subasts) {
      if (await f(e))
        out.push(e);
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

class NodeList {
  subasts;
  constructor(subasts) {
    this.subasts = subasts;
  }
  async eval(env) {
    return new List(await Promise.all(this.subasts.map((t) => eval_ast(t, env))));
  }
  toString(wm = new WeakMap) {
    if (wm.has(this))
      return `[\` ... \`]`;
    wm.set(this);
    return `[\` ${this.subasts.map((e) => e.toString(wm)).join(", ")} \`]`;
  }
  get length() {
    return this.subasts.length;
  }
  get(i) {
    return this.subasts[i];
  }
  set(i, v) {
    this.subasts[i] = v;
    return v;
  }
  map(f) {
    return new NodeList(this.subasts.map(f));
  }
  filter(f) {
    return new NodeList(this.subasts.filter(f));
  }
  slice(s, e) {
    return new NodeList(this.subasts.slice(s, e));
  }
  pop() {
    return this.subasts.pop();
  }
  push(v) {
    this.subasts.push(v);
    return v;
  }
  reduce(f, i) {
    if (i == undefined)
      return this.subasts.reduce(f);
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
    return new NodeList(this.subasts.splice(s, a));
  }
  concat(e2) {
    return new NodeList(this.subasts.concat(e2.subasts));
  }
  async async_map(f) {
    return new NodeList(await Promise.all(this.subasts.map(f)));
  }
  async async_filter(f) {
    const out = [];
    for (const e of this.subasts) {
      if (await f(e))
        out.push(e);
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
    return `${this.re}+${this.im}i`;
  }
}

class NodeString {
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
      const { start, end } = r;
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

class NodeIdentifier {
  name;
  constructor(name) {
    this.name = name;
  }
  eval(env) {
    if (this.name in env.ENV && env.ENV[this.name].length > 0) {
      const bindings = env.ENV[this.name];
      return bindings[bindings.length - 1];
    } else
      throw `${this.name} is not defined`;
  }
  toString() {
    return `:${this.name}`;
  }
}

class NodeOperation {
  operator;
  left;
  right;
  get op() {
    return this.operator;
  }
  set op(v) {
    this.operator = v;
  }
  constructor(operator, left, right) {
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
  toString() {
    return `(${this.left}) ${this.operator} (${this.right})`;
  }
}

class NodeAst {
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
var init_nodes = __esm(() => {
  init_values();
  init_eval();
});

// language.mjs
var EXPR_OPEN = "(", EXPR_CLOSE = ")", LIST_OPEN = "[", LIST_CLOSE = "]", STRING_OPEN = "{", STRING_CLOSE = "}", INTERP_OPEN = "{", INTERP_CLOSE = "}", ESCAPE = "\\", WHITESPACE_ESCAPES, OPEN_GROUPS, CLOSE_GROUPS, CONDITIONAL = "?", DEFINITION = "->", VARIADIC_DEFINE = "=>", BIND = ":", OPBIND = "<<", ASTOPBIND = "<<<", APPLICATION = "@", SCOPED_APPLICATION = "@!", IS_SCOPED_APPLICATION = (e) => typeof e === "string" && e.startsWith(SCOPED_APPLICATION) && [...e.slice(SCOPED_APPLICATION.length)].every((e2) => e2 === SCOPED_APPLICATION[1]), WHILE = "!!", FOR = "#", EXPONENTIATION = "^", MULTIPLICATION = "*", DIVISION = "/", ADDITION = "+", SUBTRACTION = "-", MODULUS = "%", EQUAL = "=", NOT_EQUAL = "!=", LESS_THAN = "<", LESS_THAN_EQ = "<=", GREATER_THAN = ">", GREATER_THAN_EQ = ">=", PARTIAL = "'", SLOT = "_", NEGATIVE = "~", DECIMAL = ".", digits = "0123456789", NUMBER_START, NUMBER_BODY, alpha = "abcdefghijklmnopqrstuvwxyz", IDENTIFIER_START, IDENTIFIER_BODY, TINY = 0.0000000001, COMMENT_SEPARATOR = `
`, LIST_SEPARATOR = ",", STATEMENT_SEPARATOR = ";", RECURSION = "$", COMPLEX = "i", COMMENT = "--", QUOTE = "`", ASSOCIATE_LEFT = "left", ASSOCIATE_RIGHT = "right", PRECEDENCE = (UDO) => {
  const result = [
    [[PARTIAL], ASSOCIATE_LEFT],
    [[APPLICATION, SCOPED_APPLICATION], ASSOCIATE_LEFT],
    [[EXPONENTIATION], ASSOCIATE_LEFT],
    [[MULTIPLICATION, DIVISION], ASSOCIATE_LEFT],
    [[MODULUS, ADDITION, SUBTRACTION], ASSOCIATE_LEFT],
    [[EQUAL, NOT_EQUAL, LESS_THAN, LESS_THAN_EQ, GREATER_THAN, GREATER_THAN_EQ], ASSOCIATE_LEFT],
    [[CONDITIONAL], ASSOCIATE_LEFT],
    [[WHILE, FOR], ASSOCIATE_LEFT],
    [[DEFINITION, VARIADIC_DEFINE], ASSOCIATE_RIGHT],
    [[BIND, OPBIND, ASTOPBIND], ASSOCIATE_LEFT]
  ];
  for (const [op, { precedence, associativity }] of Object.entries(UDO)) {
    if (precedence === Math.floor(precedence)) {
      const e = result[precedence] ?? [[], ""];
      e[0].push(op);
      e[1] = associativity;
    } else {
      result.splice(Math.floor(precedence), 0, [[op], associativity]);
    }
  }
  return result;
}, OPERATORS = (UDO) => PRECEDENCE(UDO).map((e) => e[0]).reduce((a, b) => a.concat(b)), OPCHARS = (UDO) => OPERATORS(UDO).reduce((a, b) => a.concat(b)), ASSOC_FUNC = (assoc) => ({
  [ASSOCIATE_LEFT]: (arr, func) => arr.findIndex(func),
  [ASSOCIATE_RIGHT]: (arr, func) => {
    let n = arr.length;
    while (n-- > 0) {
      if (func(arr[n], n, arr))
        return n;
    }
    return -1;
  }
})[assoc] ?? ASSOC_FUNC(ASSOCIATE_LEFT);
var init_language = __esm(() => {
  WHITESPACE_ESCAPES = {
    n: `
`,
    t: "\t",
    b: "\b",
    r: "\r",
    f: "\f"
  };
  OPEN_GROUPS = [EXPR_OPEN, LIST_OPEN, STRING_OPEN];
  CLOSE_GROUPS = [EXPR_CLOSE, LIST_CLOSE, STRING_CLOSE];
  NUMBER_START = digits + NEGATIVE;
  NUMBER_BODY = digits + DECIMAL + "ie+-";
  IDENTIFIER_START = alpha + alpha.toUpperCase() + "_$";
  IDENTIFIER_BODY = IDENTIFIER_START + digits;
});

// errors.mjs
var INVALID_ARGUMENTS = (a, o, b) => `Invalid arguments ${a} ${o} ${b}`, INVALID_ARG_POW = (a, b) => INVALID_ARGUMENTS(a, EXPONENTIATION, b), INVALID_ARG_MUL = (a, b) => INVALID_ARGUMENTS(a, MULTIPLICATION, b), INVALID_ARG_DIV = (a, b) => INVALID_ARGUMENTS(a, DIVISION, b), INVALID_ARG_ADD = (a, b) => INVALID_ARGUMENTS(a, ADDITION, b), INVALID_ARG_SUB = (a, b) => INVALID_ARGUMENTS(a, SUBTRACTION, b), INVALID_ARG_MOD = (a, b) => INVALID_ARGUMENTS(a, MODULUS, b), INVALID_ARG_LT = (a, b) => INVALID_ARGUMENTS(a, LESS_THAN, b), INVALID_ARG_LTE = (a, b) => INVALID_ARGUMENTS(a, LESS_THAN_EQ, b), INVALID_ARG_GT = (a, b) => INVALID_ARGUMENTS(a, GREATER_THAN, b), INVALID_ARG_GTE = (a, b) => INVALID_ARGUMENTS(a, GREATER_THAN_EQ, b), FIRST_ARG_FUNC = `First argument must be a function`, SEC_ARG_LIST = `Second argument must be a list`;
var init_errors = __esm(() => {
  init_language();
});

// assert-polyfill:assert
function assert(cond, msg) {
  if (!cond)
    throw new Error(msg ?? "Assertion failed");
}

// checks.mjs
var and = (...fs) => (o) => fs.every((f) => f(o)), or = (...fs) => (o) => fs.some((f) => f(o)), ilist = (o) => o instanceof List, icomp = (o) => o instanceof Complex, ivfun = (o) => o instanceof VFunction, ibfun = (o) => o instanceof BuiltinFunction, ivstr = (o) => o instanceof VString, ivobj = (o) => o instanceof VObject, idata, ilors, ifunc, icc = (a, b) => icomp(a) && icomp(b), icl = (a, b) => icomp(a) && ilist(b), ilc = (a, b) => ilist(a) && icomp(b), ill = (a, b) => ilist(a) && ilist(b), iss = (a, b) => ivstr(a) && ivstr(b), ils = (a, b) => ilist(a) && ivstr(b), isl = (a, b) => ivstr(a) && ilist(b), isc = (a, b) => ivstr(a) && icomp(b), assert_list = (o, m) => assert(ilist(o), m), assert_complex = (o, m) => assert(icomp(o), m), assert_vfunc = (o, m) => assert(ivfun(o), m), assert_vstring = (o, m) => assert(ivstr(o), m), assert_vobject = (o, m) => assert(ivobj(o), m), assert_func = (o, m) => assert(ifunc(o), m), isreal_strict = (c) => c.imag == 0, isimag_strict = (c) => c.real == 0, isreal_fuzz = (c) => Math.abs(c.imag) < TINY, isimag_fuzz = (c) => Math.abs(c.real) < TINY, iszero_strict, iszero_fuzz, ivalid_opstring = (c) => !Array.from(c).every((e) => [
  OPEN_GROUPS.reduce((a, b) => a.concat(b)).includes(e),
  CLOSE_GROUPS.reduce((a, b) => a.concat(b)).includes(e),
  NUMBER_START.includes(e),
  IDENTIFIER_BODY.includes(e),
  [COMMENT_SEPARATOR, STATEMENT_SEPARATOR, LIST_SEPARATOR].includes(e)
].some((b) => b)), inexpr = (c) => c instanceof NodeExprBody, inlist = (c) => c instanceof NodeList, incomp = (c) => c instanceof NodeComplex, instring = (c) => c instanceof NodeString, inident = (c) => c instanceof NodeIdentifier, inast = (c) => c instanceof NodeAst, inop = (c) => c instanceof NodeOperation, inoper = (o) => inop(o) && o.operator == o, inopers, inode, assert_isreal_strict = (c, m) => assert(icomp(c) && isreal_strict(c), m), assert_integral = (n, m) => assert(n == Math.floor(n), m), assert_valid_opstring = (o, m) => assert(ivalid_opstring(o), m), assert_op = (a, m) => assert(inop(a), m), assert_node = (a, m) => assert(inode(a), m), assert_ident = (a, m) => assert(inident(a), m), is_indexable, assert_indexable = (a, m) => assert(is_indexable(a), m), ivalue, assert_value = (o, m) => assert(ivalue(o), m), assert_nstring = (o, m) => assert(instring(o), m), assert_ncomp = (o, m) => assert(incomp(o), m);
var init_checks = __esm(() => {
  init_values();
  init_nodes();
  init_language();
  init_errors();
  idata = or(ilist, icomp, ivfun, ibfun, ivstr, ivobj);
  ilors = or(ivstr, ilist);
  ifunc = or(ivfun, ibfun);
  iszero_strict = and(isreal_strict, isimag_strict);
  iszero_fuzz = and(isreal_fuzz, isimag_fuzz);
  inopers = Object.fromEntries(OPERATORS({}).map((o) => [o, inoper(o)]));
  inode = or(inexpr, inlist, incomp, instring, inident, inast, inop);
  is_indexable = or(ilist, ivstr, inlist, inexpr, instring);
  ivalue = or(idata, inode);
});

// values.mjs
class BuiltinFunction {
  apply;
  name;
  constructor(f) {
    this.apply = f;
    this.name = f.name;
  }
  toString() {
    return `#builtin ${this.name}`;
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
    return `#procedure [${this.params.join(", ")}]`;
  }
}

class Complex {
  re;
  im;
  constructor(re, im) {
    this.re = re;
    this.im = im;
  }
  get real() {
    return this.re;
  }
  get imag() {
    return this.im;
  }
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
  async async_map(f) {
    return new List(await Promise.all(this.values.map(f)));
  }
  filter(f) {
    return new List(this.values.filter(f));
  }
  async async_filter(f) {
    const out = [];
    for (const e of this.values) {
      if (await f(e))
        out.push(e);
    }
    return new List(out);
  }
  reduce(f, i) {
    if (i == undefined)
      return this.values.reduce(f);
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
    return new List(this.values.concat(l.values));
  }
  get length() {
    return this.values.length;
  }
  get(i) {
    return this.values[i];
  }
  set(i, v) {
    this.values[i] = v;
  }
  toString(wm = new WeakMap) {
    if (wm.has(this))
      return "[...]";
    wm.set(this);
    return `[${this.values.map((e) => e.toString(wm)).join(", ")}]`;
  }
  join(s) {
    return new VString(this.values.map((e) => e.toString()).join(s.value));
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
  get length() {
    return this.value.length;
  }
  toString() {
    return `${this.value}`;
  }
  get(i) {
    return new VString(this.value[i]);
  }
  set(idx, ch) {
    this.value = Object.entries({ ...this.value }).map(([i, c]) => i == idx ? ch.toString() : c).join("");
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
    return new List(this.value.split(d.value).map((s) => new VString(s)));
  }
  slice(start, end) {
    return new VString(this.value.slice(start, end));
  }
  splice(start, amt) {
    const v = this.value.split("");
    const o = v.splice(start, amt).join("");
    this.value = v.join("");
    return new VString(o);
  }
  map(f) {
    return this.split(new VString("")).map(f);
  }
  filter(f) {
    return this.split(new VString("")).filter(f);
  }
  reduce(f, i) {
    return this.split(new VString("")).reduce(f, i);
  }
  accum(f, i) {
    return this.split(new VString("")).accum(f, i);
  }
  async async_map(f) {
    return this.split(new VString("")).async_map(f);
  }
  async async_filter(f) {
    return this.split(new VString("")).async_filter(f);
  }
  async async_reduce(f, i) {
    return this.split(new VString("")).async_reduce(f, i);
  }
  async async_accum(f, i) {
    return this.split(new VString("")).async_accum, f, i;
  }
}
function cond(...ps) {
  return function(v) {
    for (const [p, f] of ps) {
      if (p(v))
        return f(v);
    }
  };
}
var OutgoingTransform, IncomingTransform, isProxy, VObject, enumerateAllKeys = (obj) => {
  const isOrig = (keys, i, prop) => prop !== "constructor" && (i === 0 || prop !== keys[i - 1]) && !out.includes(prop);
  const out = [];
  do {
    const l = Object.getOwnPropertyNames(obj).sort().filter(isOrig);
    l.forEach((k) => out.push(k));
    obj = Object.getPrototypeOf(obj);
  } while (obj && Object.getPrototypeOf(obj));
  return out;
}, duplicate, toJS = (v, wm = new WeakMap) => cond([icomp, (v2) => v2.real], [ilist, (v2) => {
  if (wm.has(v2))
    return wm.get(v2);
  const o = [];
  wm.set(v2, o);
  v2.values.forEach((e) => {
    o.push(toJS(e, wm));
  });
  return o;
}], [ivstr, (v2) => v2.value], [ivobj, (v2) => {
  if (v2[isProxy])
    return v2.value;
  if (wm.has(v2))
    return wm.get(v2);
  const r = {};
  wm.set(v2, r);
  Object.entries(v2.value).forEach(([k, v3]) => {
    r[k] = toJS(v3, wm);
  });
  return r;
}], [ivfun, (v2) => async (...args) => toJS(await eval_application(v2, fromJS(args), v2.closure), wm)], [ibfun, cond([(f) => f.apply[Symbol.toStringTag] === "AsyncFunction", (f) => async (...args) => toJS(await f.apply(fromJS(args), {}), wm)], [() => true, (f) => (...args) => toJS(f.apply(fromJS(args), {}), wm)])], [() => true, (v2) => v2])(v), fromJS = (v, wm = new WeakMap) => cond([(v2) => typeof v2 === "string", (v2) => new VString(v2)], [(v2) => v2 instanceof Array, (v2) => {
  if (wm.has(v2))
    return wm.get(v2);
  const o = new List([]);
  wm.set(v2, o);
  v2.forEach((e) => {
    o.push(fromJS(e, wm));
  });
  return o;
}], [(v2) => typeof v2 === "number", (v2) => new Complex(v2, 0)], [(v2) => typeof v2 === "boolean", (v2) => v2 ? new Complex(1, 0) : new Complex(0, 0)], [(v2) => v2 === null || v2 === undefined, () => new Complex(0, 0)], [(v2) => typeof v2 === "object", (v2) => {
  if (wm.has(v2))
    return wm.get(v2);
  const r = VObject.proxy(v2);
  wm.set(v2, r);
  return r;
}], [(v2) => typeof v2 === "function", (f) => new BuiltinFunction(async (params) => fromJS(await f(...toJS(params)), wm))], [() => true, (v2) => {
  throw `Could not convert ${v2} from JS`;
}])(v);
var init_values = __esm(() => {
  init_checks();
  init_nodes();
  init_eval();
  OutgoingTransform = Symbol("OutgoingTransform");
  IncomingTransform = Symbol("IncomingTransform");
  isProxy = Symbol("isProxy");
  VObject = class VObject {
    value;
    constructor(obj) {
      this.value = obj;
      this[isProxy] = false;
    }
    [OutgoingTransform](v) {
      return v;
    }
    [IncomingTransform](v) {
      return v;
    }
    get(key) {
      return this[OutgoingTransform](this.value[key]);
    }
    set(key, value) {
      this.value[key] = this[IncomingTransform](value);
      return value;
    }
    keys() {
      return new List(enumerateAllKeys(this.value).map((k) => new VString(k)));
    }
    values() {
      return this.keys().map((k) => this.get(k.value));
    }
    items() {
      const keys = this.keys();
      const vals = this.values();
      const out = new List([]);
      for (let i = 0;i < keys.length; i++) {
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
    toString(wm = new WeakMap) {
      if (this[isProxy]) {
        if (wm.has(this.value))
          return `{...}`;
        wm.set(this.value);
      } else {
        if (wm.has(this))
          return `{...}`;
        wm.set(this);
      }
      return `{ ${Object.keys(this.value).map((k) => `"${k}": ${this.get(k)?.toString(wm)}`).join(", ")} }`;
    }
    static proxy(obj) {
      const o = new VObject(obj);
      o[OutgoingTransform] = (v) => fromJS(typeof v === "function" ? v.bind(obj) : v);
      o[IncomingTransform] = toJS;
      o[isProxy] = true;
      return o;
    }
  };
  duplicate = cond([ibfun, (v) => new BuiltinFunction(v.apply)], [icomp, (v) => new Complex(v.real, v.imag)], [ivfun, (v) => new VFunction(duplicate(v.params), duplicate(v.body), v.closure)], [ilist, (v) => new List(v.values.map(duplicate))], [ivstr, (v) => new VString(v.value)], [ivobj, (v) => new VObject(Object.fromEntries(Object.entries(v.value).map(([k, v2]) => [k, duplicate(v2)])))], [inast, (v) => new NodeAst(duplicate(v.ast))], [instring, (v) => new NodeString(v.text, v.replacements)], [incomp, (v) => new NodeComplex(v.re, v.im)], [inexpr, (v) => new NodeExprBody(v.subasts.map(duplicate))], [inlist, (v) => new NodeList(v.subasts.map(duplicate))], [inop, (v) => new NodeOperation(v.operator, duplicate(v.left), duplicate(v.right))], [inident, (v) => new NodeIdentifier(v.name)]);
});

// ops.mjs
function zip(...ls) {
  assert(new Set(ls.map((l) => l.length)).size == 1, `Can not zip lists of unequal lengths`);
  const values = Array.from({ length: ls[0]?.length }, (_, i) => ls.map((l) => l.get(i)));
  return new List(values);
}
function pow(a, b) {
  let r = null;
  if (icc(a, b)) {
    if (isreal_strict(a) && isreal_strict(b) && !(a.real <= 0 && Math.abs(b.real) < 1) && !(a.real == 0 && b.real < 0))
      r = new Complex(Math.pow(a.real, b.real), 0);
    else
      r = pow_complex(a, b);
  }
  icl(a, b) && (r = b.map((e) => pow(a, e)));
  ilc(a, b) && (r = a.map((e) => pow(e, b)));
  ill(a, b) && (r = zip(a, b).map(([e1, e2]) => pow(e1, e2)));
  if (r !== null)
    return r;
  throw INVALID_ARG_POW(a, b);
}
function mul(a, b) {
  let r = null;
  icc(a, b) && (r = mul_complex(a, b));
  icl(a, b) && (r = b.map((e) => mul(a, e)));
  ilc(a, b) && (r = a.map((e) => mul(e, b)));
  ill(a, b) && (r = zip(a, b).map(([e1, e2]) => mul(e1, e2)));
  if (isc(a, b)) {
    assert_isreal_strict(b, "can not multiply string by complex number");
    assert_integral(b.real, "can not multiply string by non-integer");
    r = new VString(Array(Math.max(b.real, 0)).fill(a.toString()).join(""));
  }
  if (r !== null)
    return r;
  throw INVALID_ARG_MUL(a, b);
}
function div(a, b) {
  let r = null;
  icc(a, b) && (r = div_complex(a, b));
  icl(a, b) && (r = b.map((e) => div(a, e)));
  ilc(a, b) && (r = a.map((e) => div(e, b)));
  ill(a, b) && (r = zip(a, b).map(([e1, e2]) => div(e1, e2)));
  if (r !== null)
    return r;
  throw INVALID_ARG_DIV(a, b);
}
function add(a, b) {
  let r = null;
  icc(a, b) && (r = add_complex(a, b));
  icl(a, b) && (r = b.map((e) => add(a, e)));
  ilc(a, b) && (r = a.map((e) => add(e, b)));
  ill(a, b) && (r = zip(a, b).map(([e1, e2]) => add(e1, e2)));
  ivstr(a) && (r = add_strings(a.toString(), b.toString()));
  ivstr(b) && (r = add_strings(a.toString(), b.toString()));
  iss(a, b) && (r = add_vstring(a, b));
  if (r !== null)
    return r;
  throw INVALID_ARG_ADD(a, b);
}
function sub(a, b) {
  let r = null;
  icc(a, b) && (r = sub_complex(a, b));
  icl(a, b) && (r = b.map((e) => sub(a, e)));
  ilc(a, b) && (r = a.map((e) => sub(e, b)));
  ill(a, b) && (r = zip(a, b).map(([e1, e2]) => sub(e1, e2)));
  if (r !== null)
    return r;
  throw INVALID_ARG_SUB(a, b);
}
function mod(a, b) {
  let r = null;
  icc(a, b) && isreal_fuzz(a) && isreal_fuzz(b) && (r = new Complex(a.real % b.real, 0));
  icl(a, b) && (r = b.map((e) => mod(a, e)));
  ilc(a, b) && (r = a.map((e) => mod(e, b)));
  ill(a, b) && (r = zip(a, b).map(([e1, e2]) => mod(e1, e2)));
  if (r !== null)
    return r;
  throw INVALID_ARG_MOD(a, b);
}
function eq(a, b) {
  let r = null;
  icc(a, b) && (r = eq_complex(a, b));
  icl(a, b) && (r = b.map((e) => eq(a, e)));
  ilc(a, b) && (r = a.map((e) => eq(e, b)));
  ill(a, b) && (r = a.length == b.length ? fbool(zip(a, b).every(([e1, e2]) => bool(eq(e1, e2)))) : fbool(false));
  iss(a, b) && (r = fbool(a.value == b.value));
  isl(a, b) && (r = b.map((e) => eq(a, e)));
  ils(a, b) && (r = a.map((e) => eq(e, b)));
  if (r !== null)
    return r;
  else
    return fbool(false);
}
function neq(a, b) {
  let r = null;
  icc(a, b) && (r = neq_complex(a, b));
  icl(a, b) && (r = b.map((e) => neq(a, e)));
  ilc(a, b) && (r = a.map((e) => neq(e, b)));
  ill(a, b) && (r = a.length == b.length ? fbool(zip(a, b).some(([e1, e2]) => bool(neq(e1, e2)))) : fbool(true));
  iss(a, b) && (r = fbool(a.value != b.value));
  isl(a, b) && (r = b.map((e) => neq(a, e)));
  ils(a, b) && (r = a.map((e) => neq(e, b)));
  if (r !== null)
    return r;
  else
    return fbool(true);
}
function lt(a, b) {
  let r = null;
  icc(a, b) && (r = lt_complex(a, b));
  icl(a, b) && (r = b.map((e) => lt(a, e)));
  ilc(a, b) && (r = a.map((e) => lt(e, b)));
  ill(a, b) && (r = zip(a, b).map(([e1, e2]) => lt(e1, e2)));
  iss(a, b) && (r = fbool(a.value < b.value));
  if (r !== null)
    return r;
  throw INVALID_ARG_LT(a, b);
}
function gt(a, b) {
  let r = null;
  icc(a, b) && (r = gt_complex(a, b));
  icl(a, b) && (r = b.map((e) => gt(a, e)));
  ilc(a, b) && (r = a.map((e) => gt(e, b)));
  ill(a, b) && (r = zip(a, b).map(([e1, e2]) => gt(e1, e2)));
  iss(a, b) && (r = fbool(a.value > b.value));
  if (r !== null)
    return r;
  throw INVALID_ARG_GT(a, b);
}
function lte(a, b) {
  let r = null;
  icc(a, b) && (r = lte_complex(a, b));
  icl(a, b) && (r = b.map((e) => lte(a, e)));
  ilc(a, b) && (r = a.map((e) => lte(e, b)));
  ill(a, b) && (r = zip(a, b).map(([e1, e2]) => lte(e1, e2)));
  iss(a, b) && (r = fbool(a.value <= b.value));
  if (r !== null)
    return r;
  throw INVALID_ARG_LTE(a, b);
}
function gte(a, b) {
  let r = null;
  icc(a, b) && (r = gte_complex(a, b));
  icl(a, b) && (r = b.map((e) => gte(a, e)));
  ilc(a, b) && (r = a.map((e) => gte(e, b)));
  ill(a, b) && (r = zip(a, b).map(([e1, e2]) => gte(e1, e2)));
  iss(a, b) && (r = fbool(a.value >= b.value));
  if (r !== null)
    return r;
  throw INVALID_ARG_GTE(a, b);
}
function abs(c) {
  assert_complex(c, `Can not take absolute value of non complex value`);
  return new Complex(abs_complex(c), 0);
}
var neg_complex = (z) => new Complex(-z.real, -z.imag), con_complex = (z) => new Complex(z.real, -z.imag), abs_complex = (z) => Math.sqrt(z.real * z.real + z.imag * z.imag), rad_complex = (z) => Math.atan2(z.imag, z.real), add_complex = (a, b) => new Complex(a.real + b.real, a.imag + b.imag), sub_complex = (a, b) => add_complex(a, neg_complex(b)), mul_complex = (a, b) => new Complex(a.real * b.real - a.imag * b.imag, a.real * b.imag + a.imag * b.real), div_complex = (a, b) => {
  const z = mul_complex(a, con_complex(b));
  const d = b.real * b.real - b.imag * b.imag;
  return new Complex(z.real / d, z.imag / d);
}, bool = (v) => (assert_value(v, `can not coerce non value to boolean`), !(icomp(v) && v.real == 0 && v.imag == 0)), fbool = (b) => b ? new Complex(1, 0) : new Complex(0, 0), eq_complex = (a, b) => fbool(a.real == b.real && a.imag == b.imag), neq_complex = (a, b) => fbool(a.real != b.real || a.imag != b.imag), lt_complex = (a, b) => {
  if ([a, b].every(isreal_strict))
    return fbool(a.real < b.real);
  if ([a, b].every(isimag_strict))
    return fbool(a.imag < b.imag);
  return fbool(abs_complex(a) < abs_complex(b));
}, lte_complex = (a, b) => fbool([lt_complex(a, b), eq_complex(a, b)].some(bool)), gt_complex = (a, b) => fbool(!bool(lte_complex(a, b))), gte_complex = (a, b) => fbool(!bool(lt_complex(a, b))), pow_complex = (a, b) => {
  if (iszero_strict(b))
    return new Complex(1, 0);
  if (iszero_strict(a)) {
    if (b.imag != 0 || b.real < 0)
      throw `can not raise 0 to the power of negative or complex power`;
    return new Complex(0, 0);
  }
  const vabs = abs_complex(a);
  let len = Math.pow(vabs, b.real);
  const at = rad_complex(a);
  let phase = at * b.real;
  if (!isreal_strict(b)) {
    len /= Math.exp(at * b.imag);
    phase += b.imag * Math.log(vabs);
  }
  return new Complex(len * Math.cos(phase), len * Math.sin(phase));
}, add_vstring = (a, b) => new VString(a.value + b.value), add_strings = (a, b) => new VString(a + b);
var init_ops = __esm(() => {
  init_values();
  init_checks();
  init_errors();
});

// ast.mjs
function splitIndices(text, indices, includeidx = false) {
  let pairs = [[0, indices[0]], ...indices.map((v, i) => [v + 1, indices[i + 1]])];
  if (includeidx)
    pairs = pairs.concat(indices.map((i) => [i, i + 1])).sort(([a], [b]) => a - b);
  const out = pairs.map(([i1, i2]) => text.slice(i1, i2));
  return out;
}
function splitOnMultipleUncontainedDelims(text, ogs, cgs, delims, includedelim = false) {
  const indices = [];
  let depths = 0;
  for (const [i, c] of Object.entries(text)) {
    ogs.includes(c) && depths++;
    cgs.includes(c) && depths--;
    delims.includes(c) && depths == 0 && indices.push(parseInt(i));
  }
  return splitIndices(text, indices, includedelim);
}
function state_machine_parse(text, udo) {
  const out = [];
  let sstart = 0;
  let results = [];
  let start = 0;
  const ctxt = {};
  let state = "start";
  for (let i = 0;i < text.length; i++) {
    const c = text[i];
    switch (state) {
      case "start":
        if (c == STRING_OPEN || c === QUOTE && text[i + 1] === STRING_OPEN) {
          start = i;
          ctxt.sdepth = 1;
          state = "string";
          if (c === QUOTE)
            i++;
        } else if (c == LIST_OPEN) {
          start = i;
          ctxt.ldepth = 1;
          state = "list";
        } else if (c == EXPR_OPEN) {
          start = i;
          ctxt.edepth = 1;
          state = "expression";
        } else if (c + text[i + 1] == COMMENT) {
          state = "comment";
        } else if (OPCHARS(udo).includes(c)) {
          start = i;
          state = "operator";
        } else if (NUMBER_START.includes(c)) {
          start = i;
          state = "number";
          delete ctxt.pnum;
        } else if (IDENTIFIER_START.includes(c)) {
          start = i;
          state = "identifier";
        } else if (CLOSE_GROUPS.includes(c)) {
          throw `Unmatched ${c}`;
        } else if (c == STATEMENT_SEPARATOR) {
          results.length > 0 && out.push(results);
          results = [];
          sstart = i + 1;
        }
        break;
      case "operator":
        if (!OPCHARS(udo).includes(c)) {
          state = "start";
          results.push(text.slice(start, i));
          i--;
        }
        break;
      case "number":
        if (!NUMBER_BODY.includes(c) || ctxt.pnum != "e" && [ADDITION, SUBTRACTION].includes(c)) {
          state = "start";
          results.push(text.slice(start, i));
          i--;
        } else {
          ctxt.pnum = c;
        }
        break;
      case "identifier":
        if (!IDENTIFIER_BODY.includes(c)) {
          state = "start";
          results.push(text.slice(start, i));
          i--;
        }
        break;
      case "expression":
        if (c == EXPR_OPEN) {
          ctxt.edepth++;
        }
        if (c == EXPR_CLOSE) {
          ctxt.edepth--;
          if (ctxt.edepth == 0) {
            state = "start";
            results.push(text.slice(start, i + 1));
          }
        }
        break;
      case "list":
        if (c == LIST_OPEN) {
          ctxt.ldepth++;
        }
        if (c == LIST_CLOSE) {
          ctxt.ldepth--;
          if (ctxt.ldepth == 0) {
            state = "start";
            results.push(text.slice(start, i + 1));
          }
        }
        break;
      case "string":
        if (ctxt.escape) {
          ctxt.escape = false;
          continue;
        }
        if (c == ESCAPE) {
          ctxt.escape = true;
        }
        if (c == STRING_OPEN) {
          ctxt.sdepth++;
        }
        if (c == STRING_CLOSE) {
          ctxt.sdepth--;
          if (ctxt.sdepth == 0) {
            state = "start";
            results.push(text.slice(start, i + 1));
          }
        }
        break;
      case "comment":
        if (c == COMMENT_SEPARATOR) {
          state = "start";
        }
        break;
    }
  }
  assert(!["list", "expression", "string"].includes(state), "incomplete group");
  !["start", "comment"].includes(state) && results.push(text.slice(start));
  results.length > 0 && out.push(results);
  return out;
}
function parseNumber(t) {
  let n;
  if (t.startsWith(NEGATIVE)) {
    n = -parseFloat(t.slice(1));
  } else {
    n = parseFloat(t);
  }
  if (t.endsWith(COMPLEX)) {
    return new NodeComplex(0, n);
  } else {
    return new NodeComplex(n, 0);
  }
}
function parseText(text, udo) {
  const results = [];
  let startidx = null;
  let depth = 0;
  let esflag = false;
  for (let i = 0;i < text.length; i++) {
    let c = text[i];
    if (esflag) {
      let v;
      if (c in WHITESPACE_ESCAPES) {
        v = WHITESPACE_ESCAPES[c];
      } else {
        v = c;
      }
      results.push({
        type: "escape",
        start: i - 1,
        end: i,
        value: v
      });
      esflag = false;
      continue;
    }
    if (c == ESCAPE && depth == 0) {
      esflag = true;
      continue;
    }
    if (c == INTERP_OPEN) {
      ++depth;
      if (startidx == null)
        startidx = i;
    }
    if (c == INTERP_CLOSE && depth > 0) {
      --depth;
      if (depth == 0 && startidx != null) {
        results.push({
          type: "expr",
          start: startidx,
          end: i,
          ast: make_ast(text.slice(startidx + 1, i), udo)
        });
        startidx = null;
      }
    }
  }
  return results;
}
function make_ast(input, udo) {
  const body = state_machine_parse(input, udo);
  const asts = [];
  for (const exprs of body) {
    let values = [];
    for (const ex of exprs) {
      const e = ex.trim();
      if (e === "")
        continue;
      let li;
      if (e.startsWith(EXPR_OPEN)) {
        li = e.lastIndexOf(EXPR_CLOSE);
        if (li < 0)
          throw `Unmatched ${EXPR_OPEN}`;
        values.push(make_ast(e.slice(1, li), udo));
      } else if (e.startsWith(LIST_OPEN)) {
        li = e.lastIndexOf(LIST_CLOSE);
        if (li < 0)
          throw `Unmatched ${LIST_OPEN}`;
        if (e.slice(1, li).length == 0) {
          values.push(new NodeList([]));
        } else {
          const subexprs = splitOnMultipleUncontainedDelims(e.slice(1, li), OPEN_GROUPS, CLOSE_GROUPS, [LIST_SEPARATOR]);
          values.push(new NodeList(subexprs.map((t) => make_ast(t, udo))));
        }
      } else if (e.startsWith(STRING_OPEN)) {
        if (e[e.length - 1] != STRING_CLOSE)
          throw `Unmatched ${STRING_OPEN}`;
        const text = e.slice(1, -1);
        const replacements = parseText(text, udo);
        values.push(new NodeString(text, replacements));
      } else if (e.startsWith(QUOTE + STRING_OPEN)) {
        values.push(new NodeAst(make_ast(e.slice(2, -1), udo)));
      } else if (NUMBER_START.includes(e[0])) {
        values.push(parseNumber(e));
      } else if (OPERATORS(udo).includes(e) || IS_SCOPED_APPLICATION(e)) {
        values.push(e);
      } else {
        values.push(new NodeIdentifier(e));
      }
    }
    for (const [opgroup, assoc] of PRECEDENCE(udo)) {
      let vf = (o) => values.includes(o);
      let ef = (e) => opgroup.includes(e);
      if (opgroup.includes(SCOPED_APPLICATION)) {
        vf = (o) => values.includes(o) || values.some(IS_SCOPED_APPLICATION);
        ef = (e) => IS_SCOPED_APPLICATION(e) || opgroup.includes(e);
      }
      while (opgroup.some(vf)) {
        const idx = ASSOC_FUNC(assoc)(values, ef);
        const [l, o, r] = values.splice(idx - 1, 3);
        const opr = new NodeOperation(o, l, r);
        values = values.slice(0, idx - 1).concat(opr).concat(values.slice(idx - 1));
      }
    }
    if (values.length == 0)
      continue;
    assert(values.length == 1, "AST is malformed");
    asts.push(values[0]);
  }
  return asts.length == 1 ? asts[0] : new NodeExprBody(asts);
}
var init_ast = __esm(() => {
  init_nodes();
  init_language();
});

// eval.mjs
async function eval_application(f, a, env, makenew = true) {
  if (f instanceof BuiltinFunction)
    return await f.apply(a, env);
  assert(f.params.length == a.length || f.variadic && a.length >= f.params.length - 1, `Invalid number of arguments`);
  const eval_env = makenew ? {
    ENV: {
      ...env.ENV,
      ...f.closure.ENV
    },
    USER_DEFINED_OP: {
      ...env.USER_DEFINED_OP,
      ...f.closure.USER_DEFINED_OP
    },
    UPPER: env
  } : env;
  for (let i = 0;i < f.params.length; i++) {
    const name = f.params[i];
    const val = f.variadic && i == f.params.length - 1 ? a.slice(i) : a.get(i);
    eval_env.ENV[name] = (eval_env.ENV[name] ?? []).concat(val);
  }
  eval_env.ENV[RECURSION] = (eval_env.ENV[RECURSION] ?? []).concat(f);
  const result = await eval_ast(f.body, eval_env);
  for (const n of f.params) {
    eval_env.ENV[n].pop();
  }
  eval_env.ENV[RECURSION].pop();
  return result;
}
async function eval_ast(ast, env) {
  if (ast instanceof NodeExprBody) {
    let value = new Complex(0, 0);
    for (const e of ast.subasts) {
      value = await eval_ast(e, env);
    }
    return value;
  } else if (ast instanceof NodeOperation) {
    if (ast.operator == BIND) {
      const target = ast.left;
      const value = ast.right;
      let targets, values, rv;
      if (target instanceof NodeIdentifier) {
        rv = await eval_ast(value, env);
        targets = [target.name];
        values = [rv];
      } else if (target instanceof NodeList) {
        assert(target.subasts.every((e) => e instanceof NodeIdentifier), "Invalid assignment: target list can only contain identifiers");
        rv = await eval_ast(value, env);
        if (rv instanceof List) {
          assert(rv.length == target.subasts.length || rv.length == 1, `Expected ${target.subasts.length}; receieved ${rv.length}`);
          if (rv.length == 1) {
            values = Array.from({ length: target.subasts.length }, () => duplicate(rv.get(0)));
          } else {
            values = rv.values;
          }
        } else {
          values = Array.from({ length: target.subasts.length }, () => duplicate(rv));
        }
        targets = target.subasts.map((e) => e.name);
      } else
        throw `Invalid assignment to ${ast.left}`;
      for (let i = 0;i < targets.length; i++) {
        const name = targets[i];
        const bindings = [...env.ENV[name] ?? []];
        bindings.pop();
        const v = values[i];
        if (ivfun(v)) {
          v.closure.ENV[name] = [v];
        }
        bindings.push(v);
        env.ENV[name] = bindings;
      }
      return rv;
    }
    if ([OPBIND, ASTOPBIND].includes(ast.operator)) {
      const op = await eval_ast(ast.left, env);
      const right = await eval_ast(ast.right, env);
      let i = 0, assoc = ASSOCIATE_LEFT, unsafe = false, func;
      if (right instanceof List) {
        assert([2, 3, 5].includes(right.length), `operator binding can only accept a list of length 2 or 3`);
        const idx = right.get(0);
        if (right.length > 2) {
          const a = right.get(1);
          assert_vstring(a, `associativity must be a string`);
          assoc = a.value;
        }
        func = right.get(right.length > 2 ? 2 : 1);
        unsafe = right.length === 5;
        assert(idx instanceof Complex, `precedence index must be a number`);
        assert_isreal_strict(idx, `precedence index must be a real number`);
        assert(idx.real >= 0, `precedence index can not be negative`);
        i = idx.real;
      } else {
        func = right;
      }
      assert_vstring(op, "operator in operator defintion must be a string");
      assert_func(func, `right operand to ${OPBIND} must be a function`);
      assert(func instanceof BuiltinFunction || func.params.length == 2 || func.variadic && [1, 2].includes(func.params.length), `function must take exactly two arguments`);
      assert_valid_opstring(op.value, "invalid operator string");
      env.USER_DEFINED_OP = env.USER_DEFINED_OP ?? {};
      if (i === Math.floor(i)) {
        const cassoc = PRECEDENCE(env.USER_DEFINED_OP)[i][1];
        !unsafe && assert(assoc === cassoc, `Currently, operators of precedence ${i} associate ${cassoc}, not ${assoc}. This binding would force all operators of precedence ${i} to associate ${assoc}. If you are sure about this, try binding again with a list of five elements`);
      }
      env.USER_DEFINED_OP[op.value] = {
        precedence: i,
        func,
        evalargs: ast.operator == OPBIND,
        associativity: assoc
      };
      return func;
    }
    if (ast.operator in (env.USER_DEFINED_OP ?? {})) {
      const t = env.USER_DEFINED_OP[ast.operator].evalargs ? eval_ast : (x) => x;
      const a = await t(ast.left, env);
      const b = await t(ast.right, env);
      const { func } = env.USER_DEFINED_OP[ast.operator];
      return await eval_application(func, new List([a, b]), env);
    }
    if ([DEFINITION, VARIADIC_DEFINE].includes(ast.operator)) {
      assert(ast.left instanceof NodeList || ast.left instanceof NodeIdentifier, `Invalid function head.`);
      if (ast.left instanceof NodeList) {
        assert(ast.left.subasts.every((e) => e instanceof NodeIdentifier), `All params need to be identifiers`);
      }
      const params = ast.left instanceof NodeList ? ast.left.subasts.map((e) => e.name) : [ast.left.name];
      const body = ast.right;
      const closure = { ...env, ENV: {} };
      for (const [name, binding] of Object.entries(env.ENV)) {
        closure.ENV[name] = [...binding];
      }
      return new VFunction(params, body, closure, ast.operator == VARIADIC_DEFINE);
    }
    if (ast.operator == APPLICATION || IS_SCOPED_APPLICATION(ast.operator)) {
      const f2 = await eval_ast(ast.left, env);
      assert_func(f2, `Left argument to ${ast.operator} must be a function`);
      let a = await eval_ast(ast.right, env);
      if (!ilist(a))
        a = new List([a]);
      const n = ast.operator.slice(1).length - 1;
      for (let i = 0;i < n; i++)
        env = env.UPPER || env;
      const makenew = n < 0;
      return await eval_application(f2, a, env, makenew);
    }
    if (ast.operator == CONDITIONAL) {
      const c = await eval_ast(ast.left, env);
      const bs = ast.right;
      assert(bs instanceof NodeList, `Branches of a conditional must be a list.`);
      assert(bs.subasts.length == 2, `Must have only 2 branches in a conditional.`);
      const [tb, fb] = bs.subasts;
      if (bool(c)) {
        return await eval_ast(tb, env);
      } else {
        return await eval_ast(fb, env);
      }
    }
    if (ast.operator == WHILE) {
      let value = null;
      while (bool(await eval_ast(ast.left, env))) {
        value = await eval_ast(ast.right, env);
      }
      if (value == null)
        return new Complex(0, 0);
      return value;
    }
    if (ast.operator == FOR) {
      let value = null;
      const initializer = ast.left;
      const body = ast.right;
      assert(initializer instanceof NodeList, `Initializer must be a list`);
      assert(initializer.subasts.length == 3, `Initializer must contain three statements`);
      const [init, cond2, update] = initializer.subasts;
      value = await eval_ast(init, env);
      while (bool(await eval_ast(cond2, env))) {
        value = await eval_ast(body, env);
        await eval_ast(update, env);
      }
      if (value == null)
        return new Complex(0, 0);
      return value;
    }
    if (ast.operator == PARTIAL) {
      const f2 = await eval_ast(ast.left, env);
      assert_func(f2, `left argument to ${PARTIAL} must be a function`);
      const vals = ast.right instanceof NodeList ? ast.right : new NodeList([ast.right]);
      const closure = { ...env, ENV: {} };
      for (const [name, binding] of Object.entries(env.ENV)) {
        closure.ENV[name] = [...binding];
      }
      const transform = async (params) => {
        const out = [];
        let idx = 0;
        for (const s of vals.subasts) {
          if (s instanceof NodeIdentifier && s.name == SLOT) {
            const v = params.get(idx++);
            assert_value(v, `Invalid argument: ${v}`);
            out.push(v);
          } else
            out.push(await eval_ast(s, {
              ENV: { ...env.ENV, ...closure.ENV },
              USER_DEFINED_OP: { ...env.USER_DEFINED_OP },
              UPPER: env
            }));
        }
        return new List(out).concat(params.slice(idx));
      };
      const b = new BuiltinFunction(async (params, env2) => await eval_application(f2, await transform(params, env2), {
        ENV: {
          ...env2.ENV,
          ...closure.ENV
        },
        USER_DEFINED_OP: {
          ...env2.USER_DEFINED_OP
        },
        UPPER: env2
      }));
      b.name = `${f2}'${vals}`;
      return b;
    }
    const f = {
      [EXPONENTIATION]: pow,
      [MULTIPLICATION]: mul,
      [DIVISION]: div,
      [ADDITION]: add,
      [SUBTRACTION]: sub,
      [EQUAL]: eq,
      [NOT_EQUAL]: neq,
      [LESS_THAN]: lt,
      [LESS_THAN_EQ]: lte,
      [GREATER_THAN]: gt,
      [GREATER_THAN_EQ]: gte,
      [MODULUS]: mod
    }[ast.operator];
    if (f)
      return f(await eval_ast(ast.left, env), await eval_ast(ast.right, env));
    throw `Unrecognized operator ${ast.operator}`;
  } else {
    return await ast.eval(env);
  }
}
async function eval_expr(expr, env) {
  return await eval_ast(make_ast(expr, env.USER_DEFINED_OP ?? {}), env || { ENV: {} });
}
var init_eval = __esm(() => {
  init_ops();
  init_values();
  init_nodes();
  init_language();
  init_checks();
  init_ast();
});

// stdlib.mjs
var exports_stdlib = {};
__export(exports_stdlib, {
  STDLIB: () => STDLIB
});
function assert_valid_index(l, i) {
  assert_indexable(l, `Can not index non-lists`);
  assert_isreal_strict(i, `Can not index by ${i}`);
  const idx = i.real;
  assert(idx >= 0 && idx < l.length, `Index out of range`);
  assert(idx == Math.floor(idx), `Can only index by integers`);
}
var STDLIB, get_n = (p, n) => Array.from({ length: n }, (_, i) => p.get(i)), define_builtin = (n, f) => {
  const bf = new BuiltinFunction(f);
  if (n !== undefined)
    bf.name = n;
  STDLIB.ENV[n] = [bf];
}, define_expr = async (n, expr) => STDLIB.ENV[n] = [await eval_expr(expr, STDLIB)], define_const = (n, c) => {
  STDLIB.ENV[n] = [fromJS(c)];
}, getter = (n, verifier = (x) => x, transformer = (x) => x) => define_builtin(`get${n}`, (params) => {
  const [c] = get_n(params, 1);
  verifier(c);
  return transformer(c[n]);
}), setter = (n, cverifier = (x) => x, vverifier = (x) => x, transformer = (x) => x) => define_builtin(`set${n}`, (params) => {
  const [c, v] = get_n(params, 2);
  cverifier(c);
  vverifier(v);
  c[n] = transformer(v);
  return c;
}), opverifier = (o, n) => (c) => assert_op(c, `can not ${o} ${n} of non-operator`), opgetter = (n, ...rest) => getter(n, opverifier("get", n), ...rest), opsetter = (n, ...rest) => setter(n, opverifier("set", n), ...rest), identverifier = (o, n) => (c) => assert_ident(c, `can not ${o} ${n} of non-identifier`), funcverifier = (o, n) => (c) => (assert_func(c, `can not ${o} ${n} of non-function`), assert_vfunc(c, `can not ${o} ${n} of builtins`)), funcgetter = (n, ...rest) => getter(n, funcverifier("get", n), ...rest), funcsetter = (n, ...rest) => setter(n, funcverifier("set", n), ...rest), nstringverifier = (o, n) => (c) => assert_nstring(c, `can not ${o} ${n} of non-nodestring`), nstringgetter = (n, ...rest) => getter(n, nstringverifier("get", n), ...rest), nstringsetter = (n, ...rest) => setter(n, nstringverifier("set", n), ...rest), ncompverifier = (o, n) => (c) => assert_ncomp(c, `can not ${o} ${n} of non-complex-node`), ncompgetter = (n) => getter(n, ncompverifier("get", n), (v) => new Complex(v, 0)), ncompsetter = (n) => setter(n, ncompverifier("set", n), (v) => (assert(icomp(v) || incomp(v), `can not set ${n} to non-complex number`), assert(v.im === 0, `can not set ${n} to complex number`)), (v) => v.re), predfun = (n, f) => define_builtin(n, (params) => {
  const [c] = get_n(params, 1);
  return fbool(f(c));
}), mathfun = (f, n) => define_builtin(n ?? f.name, (params) => {
  const [c] = get_n(params, 1);
  assert_isreal_strict(c, `Can only take the ${n ?? f.name} of real numbers`);
  return new Complex(f(c.real), 0);
}), strfun = (f, n, ...asserts) => define_builtin(n ?? f.name, (params) => {
  const [s, ...r] = params.values;
  assert_vstring(s, `can not take ${n ?? f.name} of non-string`);
  asserts.forEach(([a, m], i) => a(r[i], m));
  return fromJS(f.bind(toJS(s))(...r.map(toJS)));
}), assert_string, assert_num, strfunp = (n, fn, ...rest) => strfun(String.prototype[fn ?? n], n, ...rest);
var init_stdlib = __esm(async () => {
  init_values();
  init_checks();
  init_ops();
  init_errors();
  init_language();
  init_nodes();
  init_ast();
  init_eval();
  STDLIB = { ENV: {} };
  define_builtin("get", (params) => {
    const [l, i] = get_n(params, 2);
    if (is_indexable(l)) {
      assert_valid_index(l, i);
      return l.get(i.real);
    } else if (ivobj(l)) {
      const key = inident(i) ? i.name : ivstr(i) ? i.value : i.toString();
      const r = l.get(key);
      if (r === undefined || r === null)
        throw `could not find key "${key}" in object`;
      return r;
    }
    throw `can not get on non list or object`;
  });
  define_builtin("set", (params) => {
    const [l, i, v] = get_n(params, 3);
    assert_value(v, `Invalid value`);
    if (is_indexable(l)) {
      assert_valid_index(l, i);
      l.set(i.real, v);
      return v;
    } else if (ivobj(l)) {
      const key = inident(i) ? i.name : ivstr(i) ? i.value : i.toString();
      return l.set(key, v);
    }
    throw `can not set on non list or object`;
  });
  define_builtin("push", (params) => {
    const [l, v] = get_n(params, 2);
    assert_indexable(l, `Can not push on non lists`);
    assert_value(v, `Invalid value`);
    l.push(v);
    return v;
  });
  define_builtin("len", (params) => {
    const [l] = get_n(params, 1);
    assert_indexable(l, `Can not get length of non list`);
    return new Complex(l.length, 0);
  });
  define_builtin("pop", (params) => {
    const [l] = get_n(params, 1);
    assert_indexable(l, `Can not pop non lists`);
    assert(l.length > 0, `Can not pop empty list`);
    return l.pop();
  });
  define_builtin("map", async (params, env) => {
    const [f, l] = get_n(params, 2);
    assert_func(f, FIRST_ARG_FUNC);
    assert_indexable(l, SEC_ARG_LIST);
    return await l.async_map((e) => eval_application(f, new List([e]), env));
  });
  define_builtin("filter", async (params, env) => {
    const [f, l] = get_n(params, 2);
    assert_func(f, FIRST_ARG_FUNC);
    assert_indexable(l, SEC_ARG_LIST);
    return await l.async_filter(async (e) => bool(await eval_application(f, new List([e]), env)));
  });
  define_builtin("reduce", async (params, env) => {
    const [f, l, i] = get_n(params, 3);
    assert_func(f, FIRST_ARG_FUNC);
    assert_indexable(l, SEC_ARG_LIST);
    if (i != null)
      assert_value(i, "initial argument must be a value");
    return await l.async_reduce((a, b) => eval_application(f, new List([a, b]), env), i);
  });
  define_builtin("accumulate", async (params, env) => {
    const [f, l, i] = get_n(params, 3);
    assert_func(f, FIRST_ARG_FUNC);
    assert_indexable(l, SEC_ARG_LIST);
    if (i != null)
      assert_value(i, "initial argument must be a value");
    return await l.async_accum((a, b) => eval_application(f, new List([a, b]), env), i);
  });
  define_builtin("split", (params) => {
    const [s, d] = get_n(params, 2);
    assert_vstring(s, `Can only split strings`);
    assert_vstring(d, `Can only split on string delimiter`);
    return s.split(d);
  });
  define_builtin("join", (params) => {
    const [l, s] = get_n(params, 2);
    assert_list(l, `Can only join a list`);
    assert_vstring(s, `Can only join with a string`);
    return l.join(s);
  });
  define_builtin("slice", (params) => {
    const [l, s, e] = get_n(params, 3);
    assert_indexable(l, `Can only slice a list or a string`);
    assert_isreal_strict(s, `Start index must be a real number`);
    e && assert_isreal_strict(e, `End index must be a real number`);
    return l.slice(s.real, e?.real);
  });
  define_builtin("splice", (params) => {
    const [l, s, e] = get_n(params, 3);
    assert_indexable(l, `Can only splice lists`);
    assert_isreal_strict(s, `Start index must be a real number`);
    assert_isreal_strict(e, `Amount to splice must be a real number`);
    return l.splice(s.real, e.real);
  });
  define_builtin("dup", (params) => {
    const [v] = get_n(params, 1);
    assert_value(v, `Can not duplicate non-value`);
    return duplicate(v);
  });
  define_builtin("concat", (params) => {
    const [l1, l2] = get_n(params, 2);
    assert_indexable(l1, `can only concat lists`);
    assert_indexable(l2, `can only concat lists`);
    return l1.concat(l2);
  });
  define_builtin("range", (params) => {
    const [start, stop] = get_n(params, 2);
    const step = params.get(2) ?? new Complex(1, 0);
    assert(start instanceof Complex && start.imag == 0, `complex ranges are not yet supported..`);
    assert(stop instanceof Complex && stop.imag == 0, `complex ranges are not yet supported..`);
    assert(step instanceof Complex && step.imag == 0, `invalid step parameter`);
    const st = start.real;
    const sp = stop.real;
    const se = step.real;
    const values = Array.from({ length: (sp - st) / se + 1 }, (_, i) => st + i * se);
    return new List(values.map((n) => new Complex(n, 0)));
  });
  define_builtin("im", (params) => {
    const [c] = get_n(params, 1);
    assert_complex(c, `Can not get imaginary component of non complex value`);
    return new Complex(c.imag, 0);
  });
  define_builtin("re", (params) => {
    const [c] = get_n(params, 1);
    assert_complex(c, `Can not get real component of non complex value`);
    return new Complex(c.real, 0);
  });
  define_builtin("gensym", (_, env) => {
    let n;
    do {
      n = Array.from({ length: 15 }, () => IDENTIFIER_START[Math.floor(Math.random() * IDENTIFIER_START.length)]).join("");
    } while (n in env.ENV);
    return new NodeIdentifier(n);
  });
  define_builtin("del", (params, env) => {
    for (let i = 0;i < params.length; i++) {
      const n = params.get(i);
      assert_ident(n, "can only delete identifiers");
      delete env.ENV[n.name];
    }
    return new Complex(1, 0);
  });
  define_builtin("sleep", async (params) => {
    const [t] = get_n(params, 1);
    assert_isreal_strict(t, `can only sleep for a real number of milliseconds`);
    const n = t.real;
    await new Promise((r) => setTimeout(r, n));
  });
  define_builtin("trycatch", async (params, env) => {
    const [t, e] = get_n(params.get(0), 2);
    assert_node(t, `first clause to trycatch needs to be passed as an AST, try calling this function as a macro`);
    assert_node(e, `second clause to trycatch needs to be passed as an AST, try calling this function as a macro`);
    try {
      return await eval_ast(t, env);
    } catch {
      return await eval_ast(e, env);
    }
  });
  define_builtin("throw", async (params) => {
    const [m] = get_n(params, 1);
    throw m.toString();
  });
  define_builtin("object", () => new VObject({}));
  define_builtin("keys", (params) => {
    const [o] = get_n(params, 1);
    assert_vobject(o, `can not get keys of non object`);
    return o.keys();
  });
  define_builtin("values", (params) => {
    const [o] = get_n(params, 1);
    assert_vobject(o, `can not get values of non object`);
    return o.values();
  });
  define_builtin("items", (params) => {
    const [o] = get_n(params, 1);
    assert_vobject(o, `can not get entries of non object`);
    return o.items();
  });
  define_builtin("haskey", (params) => {
    const [o, k] = get_n(params, 2);
    assert_vobject(o, `can not check for key in non object`);
    const key = inident(k) ? k.name : ivstr(k) ? k.value : k.toString();
    return o.has(key);
  });
  define_builtin("delkey", (params) => {
    const [o, k] = get_n(params, 2);
    assert_vobject(o, `can not delete key in non object`);
    const key = inident(k) ? k.name : ivstr(k) ? k.value : k.toString();
    return o.del(key);
  });
  opgetter("left");
  opgetter("right");
  opgetter("op", (v) => new VString(v));
  opsetter("left", (x) => assert_node(x, `can not set left of operator to non-node`));
  opsetter("right", (x) => assert_node(x, `can not set right of operator to non-node`));
  opsetter("op", (x) => assert_vstring(x, `new op must be a string`), (x) => x.value);
  getter("name", (x) => identverifier("get", "name"), (v) => new VString(v));
  setter("name", identverifier("set", "name"), (x) => assert_vstring(x, `new name must be a string`), (v) => v.value);
  funcgetter("body");
  funcgetter("params", (v) => new List(v.map((e) => new VString(e))));
  funcsetter("body", (x) => assert_node(x, `can not set body of function to non node`));
  nstringgetter("text", (v) => new VString(v));
  nstringsetter("text", (v) => assert_vstring(v, `can not set text to nonstring`), (v) => v.value);
  getter("subasts", (x) => assert(inlist(x) || inexpr(x), `can not get subasts of non-list or non-expression body`), (l) => new List(l));
  getter("ast", (x) => assert(inast(x), `can not get ast of non-ast`));
  ncompgetter("re");
  ncompgetter("im");
  ncompsetter("re");
  ncompsetter("im");
  define_builtin("eval", async (params, env) => {
    const [c] = get_n(params, 1);
    assert_value(c, "can not evaluate non value");
    if (ivstr(c))
      return await eval_expr(c.toString(), env);
    else
      return c;
  });
  define_builtin("eval_ast", async (params, env) => {
    const [c] = get_n(params, 1);
    assert_node(c, `argument not an ast`);
    return await eval_ast(c, env);
  });
  define_builtin("parse_to_ast", (params, env) => {
    const [c] = get_n(params, 1);
    assert_vstring(c, `argument to parse_to_ast must be a string`);
    return make_ast(c.value, env.USER_DEFINED_OP);
  });
  predfun("islist", ilist);
  predfun("isnum", icomp);
  predfun("isfun", ifunc);
  predfun("isstr", ivstr);
  predfun("isobj", ivobj);
  predfun("isnodeast", inast);
  predfun("isnodestr", instring);
  predfun("isnodelist", inlist);
  predfun("isnodenum", incomp);
  predfun("isnodeexpr", inexpr);
  predfun("isnodeident", inident);
  predfun("isnodeop", inop);
  mathfun(Math.floor);
  mathfun(Math.ceil);
  mathfun(Math.sin);
  mathfun(Math.cos);
  mathfun(Math.tan);
  mathfun(Math.asin);
  mathfun(Math.acos);
  mathfun(Math.atan);
  mathfun(Math.sinh);
  mathfun(Math.cosh);
  mathfun(Math.tanh);
  mathfun(Math.asinh);
  mathfun(Math.acosh);
  mathfun(Math.atanh);
  mathfun(Math.log);
  mathfun(Math.log, "ln");
  mathfun(Math.log10);
  mathfun(Math.log2);
  assert_string = [assert_vstring, `argument must be a string`];
  assert_num = [assert_isreal_strict, `argument must be a real number`];
  strfunp("lower", "toLowerCase");
  strfunp("upper", "toUpperCase");
  strfunp("strincludes", "includes", assert_string);
  strfunp("replace", null, assert_string, assert_string);
  strfunp("replaceAll", null, assert_string, assert_string);
  strfunp("substr", null, assert_num, assert_num);
  strfunp("trimEnd");
  strfunp("trimStart");
  strfunp("trim");
  strfunp("padEnd", null, assert_num, assert_string);
  strfunp("padStart", null, assert_num, assert_string);
  strfunp("startsWith", null, assert_string);
  strfunp("endsWith", null, assert_string);
  define_builtin("random", () => new Complex(Math.random(), 0));
  define_builtin("abs", (params) => abs(...get_n(params, 1)));
  define_builtin("ptable", (params, env) => {
    const pt = PRECEDENCE(env.USER_DEFINED_OP);
    return new List(pt.map(([op, a]) => new List([
      new List(op.map((e) => new VString(e))),
      new VString(a)
    ])));
  });
  define_builtin("defined", (_, env) => new List(Object.keys(env.ENV).map((n) => new VString(n))));
  define_builtin("nodeast", (params) => {
    const ast = params.get(0);
    assert_node(ast, `value must be an ast`);
    return new NodeAst(ast);
  });
  await define_expr("assert", `[c, m] -> c ? [1, throw @ m]`);
  await define_expr("env", `[] -> [defined @ [], ptable @ []]`);
  await define_expr("find", `[l, f] -> (
    i: ~1;
    [j: 0, j < len @ [l], j: j + 1] # (
        i = ~1 ? [
            f @ [get @ [l, j]] ? [
                i: j,
            ],
        ]
    );
    i;
)`);
  await define_expr("includes", `
[l, e] -> (
    flag: 0;
    [j: 0, j < len @ [l], j: j + 1] # (
        flag = 0 ? [
            r: e = get @ [l, j];
            (islist @ [r] ? [0, r]) ? [
                flag: 1,
            ],
        ]
    );
    flag;
)`);
  await define_expr("get", `{::} << [0.5, get]`);
  await define_expr("op_priority", `o -> find @ [ptable @ [], i -> includes @ [i::0, o]]`);
  await define_expr("ast_apply", `{@:} <<< [op_priority @ {@}, [f, g] -> (eval_ast @ [f]) @ [g]]`);
  await define_expr("macro_apply", `{@-} <<< [op_priority @ {@}, [f, g] -> eval_ast @!! [(eval_ast @ [f]) @ [g]]]`);
  await define_expr("compose", "{.} << [op_priority @ {@} + 0.5, [f, g] -> (i => f @ [g @ i])]");
  await define_expr("ucompose", "{..} << [op_priority @ {.}, [f, g] -> (i => f @ (g @ i))]");
  await define_expr("over", `{.|} << [op_priority @ {.}, [f, g] -> (i => f .. map @ [f -> f @ i, g])]`);
  await define_expr("max", `[a, b] -> (a > b) ? [a, b]`);
  await define_expr("maxl", `reduce'max`);
  await define_expr("min", "[a, b] -> (a < b) ? [a, b]");
  await define_expr("minl", `reduce'min`);
  await define_expr("repeat", `
[v, n] -> (
    map @ [
        x -> v,
        range @ [1, n]
    ]
)
`);
  await define_expr("and_shortcircuit", `{&&} <<< [op_priority @ {=} + 1.5, [a, b] -> eval_ast @!! a ? [eval_ast @!! b ? [1, 0], 0]]`);
  await define_expr("and", `[a, b] -> a && b`);
  await define_expr("or_shortcircuit", `{||} <<< [op_priority @ {&&}, [a, b] -> eval_ast @!! a ? [1, eval_ast @!! b ? [1, 0]]]`);
  await define_expr("or", `[a, b] -> a || b`);
  await define_expr("xor", `{<>} << [op_priority @ {&&}, [a, b] -> (a && not @ [b]) || (b && not @ [a])]`);
  await define_expr("all", `reduce'[and, _, 1]`);
  await define_expr("any", `reduce'[or, _, 0]`);
  await define_expr("bool", `a -> a ? [1, 0]`);
  await define_expr("not", `a -> a ? [0, 1]`);
  await define_expr("apply", `[a, b] -> a @ [b]`);
  await define_expr("pow", `[a, b] -> a ^ b`);
  await define_expr("mul", `[a, b] -> a * b`);
  await define_expr("div", `[a, b] -> a / b`);
  await define_expr("add", `[a, b] -> a + b`);
  await define_expr("sub", `[a, b] -> a - b`);
  await define_expr("mod", `[a, b] -> a % b`);
  await define_expr("eq", `[a, b] -> a = b`);
  await define_expr("neq", `[a, b] -> a != b`);
  await define_expr("lt", `[a, b] -> a < b`);
  await define_expr("gt", `[a, b] -> a > b`);
  await define_expr("lte", `[a, b] -> a <= b`);
  await define_expr("gte", `[a, b] -> a >= b`);
  await define_expr("sum", `reduce'[add, _, 0]`);
  await define_expr("prod", `reduce'[mul, _, 1]`);
  await define_expr("fact", `n -> n > 1 ? [prod @ [range @ [2, n]], 1]`);
  await define_expr("nwise", `
[l, n] ->
    map @ [
        i -> map @ [
            j -> get @ [l, i + j],
            range @ [0, n-1]
        ],
        range @ [0, len @ [l] - n]
    ]
`);
  await define_expr("encode", `
[n, b] ->
    n = 0 ? [
        [],
        concat @ [$ @ [floor @ (n/b), b], [n % b]]
    ]
;
`);
  await define_expr("decode", `
[v, b] ->
    0 = len @ [v] ? [
        0,
        pop @ [v] + b * $ @ [v, b]
    ]
;
`);
  await define_expr("bin", `encode'[_, 2]`);
  await define_expr("fbin", `decode'[_, 2]`);
  await define_expr("hex", `encode'[_, 16]`);
  await define_expr("fhex", `decode'[_, 16]`);
  await define_expr("polar", `[r, t] -> r * (cos @ t + 1i * sin @ t)`);
  await define_expr("arg", `z -> atan @ [im @ z / re @ z]`);
  await define_expr("rad", `mul'(PI/180)`);
  await define_expr("deg", `mul'(180/PI)`);
  await define_expr("reverse", `l -> map @ [get'[l], range @ [len @ [l] - 1, 0, ~1]]`);
  await define_expr("every", `[l, f] -> (
    r: 1;
    forin @- [v, l, r: r && f @ v];
    r
)`);
  await define_expr("some", `[l, f] -> (
    r: 0;
    forin @- [v, l, r: r || f @ v];
    r
)`);
  await define_expr("neg", `mul'~1`);
  await define_expr("id", "x -> x");
  await define_expr("uid", "x => x");
  await define_expr("unwrap", `f -> f .. id`);
  await define_expr("commute", `f -> f .. reverse . uid`);
  await define_expr("fpower", `{**} << [op_priority @ {.} + 0.5, [f, n] -> reduce'[commute @ apply, repeat @ [f, n]]]`);
  await define_expr("afpower", `{*|} << [op_priority @ {**}, [f, n] -> accumulate'[commute @ apply, repeat @ [f, n]]]`);
  await define_expr("wrapped_apply", `{@.} << [op_priority @ {@}, [f, g] -> f @ [g]]`);
  await define_expr("map", `{@@} << [op_priority @ {@}, map]`);
  await define_expr("filter", `{@|} << [op_priority @ {@}, filter]`);
  await define_expr("reduce", `{@>} << [op_priority @ {@}, reduce]`);
  await define_expr("concat", `{++} << [op_priority @ {+}, concat]`);
  await define_expr("floordiv", `{//} << [op_priority @ {/}, floor . div]`);
  await define_expr("zip", `{<:>} << [op_priority @ {+}, args => map @ [i -> get'[_, i] @@ args, range @ [0, minl @ [len @@ args] - 1]]]`);
  await define_expr("zipover", `{:|} << [op_priority @ {.}, [f, fs] -> args => f .. map'(apply .. id) . zip @ [fs, args]]`);
  await define_expr("encode", `{<%>} << [op_priority @ {+}, encode]`);
  await define_expr("encode", `{<*>} << [op_priority @ {+}, decode]`);
  await define_expr("uniq", `l -> (
    r: [];
    map @ [
        e -> not . includes @ [r, e] ? [push @ [r, e],],
        l
    ];
    r
)`);
  await define_expr("indexOf", `[l, e] -> find @ [l, eq'e]`);
  await define_expr("nodeop", `[l, o, r] -> (
    a: \`{x ? y};

    setleft @ [a, l];
    setright @ [a, r];
    setop @ [a, o];
    a;
)`);
  await define_expr("nodelist", `l => (
    o: \`{[]};
    map @ [push'o, l];
    o;
)`);
  await define_expr("nodeexpr", `l => (
    o: \`{0;0};
    pop @ o; pop @ o;
    map @ [push'o, l];
    o
)`);
  await define_expr("nodenum", `n => (
    o: \`{0};
    setre @ [o, re @ n];
    setim @ [o, im @ n];
)`);
  await define_expr("nodeident", `n -> (
    o: \`{x};
    setname @ [o, n];
)`);
  await define_expr("nodestring", `n -> (
    o: \`{{}};
    settext @ [o, n];
)`);
  await define_expr("cond", `
l -> (
    len @ l = 0 ? [
      \`{0},
      nodeop @ [
        l::0::0,
        {?},
        nodelist @ [
          l::0::1,
          cond @ [slice @ [l, 1]]
        ]
      ]
    ]
  );
`);
  await define_expr("switch", `
l -> (
    cond . map @ [
      i -> [nodeop @ [l::0, {=}, i::0], i::1],
      slice @ [l, 1]
    ]
  );  
`);
  await define_expr("ifelse", `ast -> nodeop @ [ast::0, {?}, slice @ [ast, 1]];`);
  await define_expr("if", `ast -> ifelse @ [nodelist @ [ast::0, ast::1, \`{0}]];`);
  await define_expr("for", `ast -> nodeop @ [slice @ [ast, 0, 3], {#}, ast::3]`);
  await define_expr("forin", `
ast -> (
    i: gensym @ [];
    c: gensym @ [];
    v: ast::0;
    
    nodeexpr @ [
      nodeop @ [c, {:}, ast::1],
      for . nodelist @ [
          nodeop @ [i, {:}, \`{0}],
          nodeop @ [i, {<}, nodeop @ [\`{len}, {@}, nodelist @ c]],
          nodeop @ [i, {:}, nodeop @ [i, {+}, \`{1}]],
          nodeexpr @ [
            nodeop @ [v, {:}, nodeop @ [c, {::}, i]],
            ast::2
          ]
        ],
    
      nodeop @ [\`{del}, {@}, nodeast @ i],
      nodeop @ [\`{del}, {@}, nodeast @ c],
      nodeop @ [\`{del}, {@}, nodeast @ v]
    ]
  );
`);
  await define_expr("while", `ast -> nodeop @ [ast::0, {!}, ast::1]`);
  await define_expr("dowhile", `
ast -> nodeexpr @ [
    ast::0,
    while . nodelist @ [ast::1, ast::0]
  ]
`);
  await define_expr("ast_to_tbl", `
AST ->
    cond @- [
      [isnodeident @ AST, getname @ AST],
      [isnodeop @ AST, (
        l: ast_to_tbl . getleft @ AST;
        r: ast_to_tbl . getright @ AST;
        
        sl: isnodeop . getleft @ AST ? [{({l})}, l];
        sr: isnodeop . getright @ AST ? [{({r})}, r];
        
        {{sl} {getop @ AST} {sr}}
      )],
      [isnodelist @ AST, {[{join'[_, {, }] . map'ast_to_tbl . getsubasts @ AST}]}],
      [isnodeexpr @ AST, {({join'[_, {; }] . map'ast_to_tbl . getsubasts @ AST})}],
        [isnodeast @ AST, {\`\\{{ast_to_tbl . getast @ AST}\\}}],
        [isnodenum @ AST, (
        n: eval_ast @ AST;
        cond @- [
          [eq'0 . im @ n, {{re @ n}}],
          [eq'0 . re @ n, {{im @ n}i}],
          [1, {{re @ n}+{im @ n}i}]
        ]
      )],
      [isnodestr @ AST, {\\{{gettext @ AST}\\}}]
    ]
`);
  await define_expr("qsort", `
a -> (
    _qsort: [a, l, h] -> (
      l < h ? [
        (
            pi: part @ [a, l, h];
            $ @ [a, l, pi - 1];
            $ @ [a, pi + 1, h];  
        ),
      ];
  
    );
  
    part: [a, l, h] -> (
      swap: [a, i, j] -> (
        t: get @ [a, i];
        set @ [a, i, get @ [a, j]];
        set @ [a, j, t];
      );
      pivot: get @ [a, h];
      i: l - 1;
      [j: l, j < h, j: j + 1] # (
        get @ [a, j] < pivot ? [
          (
            i: i + 1;
            swap @ [a, i, j];
          ),
        ]
      );
      swap @ [a, i + 1, h];
      i + 1;
    );
    
    _qsort @ [a, 0, len @ [a] - 1];
    a;
  );  
`);
  await define_expr("binary_search_f", `
[A, T, C] -> (
    ([L, H] -> (
        m: ceil @ ((L + H) / 2);
        cond @- [
            [L = H, C @ [A::L, T] = 0 ? [L, ~1]],
            [C @ [A::m, T] > 0, $ @ [L, m - 1]],
            [1, $ @ [m, H]]
        ]
    )) @ [0, len @. A - 1]
);
`);
  await define_expr("binary_search", `binary_search_f'[_, _, [a, b] -> cond @- [[a = b, 0], [a < b, ~1], [a > b, 1]]]`);
  await define_expr("randint", `[a, b] -> add'a . floor . mul'(b - a) . random @ []`);
  await define_expr("choose_random", `c -> get'c . floor . mul'(len @. c) . random @ []`);
  await define_expr("at", `[l,i] -> i < 0 ? [l::(len @. l + i), l::i]`);
  await define_expr("_object_set", `{:>} <<< [op_priority @ {:} + 1.5, [f, g] -> (
    o: object @ [];
    k: cond @- [
        [isnodeident @. f, getname @ f],
        [isnodelist @. f && 1 = len @. f, eval_ast @!! f::0],
        [1, {{eval_ast @!! f}}]
    ];

    set @ [o, k, eval_ast @!! g];
    o;
)]`);
  await define_expr("merge_objects", `{|} << [op_priority @ {:>} + 1.5, [f, g] -> (
    set'f .. id @@ (items @ [g]);
    f;
)]`);
  await define_expr("extended_get", `{.::} << [op_priority @ {::}, [o, l] -> (
    not . or .| [islist, isnodelist] @. l ? [
        o::l,

        forin @- [k, l, (
            o: o::k
        )];

        o
    ]
)]`);
  await define_expr("ast_get", `{!} <<< [op_priority @ {::}, [o, k] -> (
    m: eval_ast @!! o;
    isnodeident @ k ? [
        key: getname @ k,
        key: eval_ast @!! k
    ];
    m::key
)]`);
  await define_expr("isop", `[op, ast] -> isnodeop @. ast && getop @. ast = op`);
  await define_expr("destructure_object", `{:<} <<< [op_priority @ {:}, [left, right] -> (
    object: gensym @ [];

    helper: [left, right, assign_to_obj] -> (
        out: nodeexpr @ [];

        cond @- [
            [isnodelist @. left, (
                out: out ++ $'[_, right, 0] @@ left;
            )],

            [isnodeident @. left, (
                push @ [
                    out,
                    nodeop @ [
                        left,
                        {:},
                        assign_to_obj ? [
                            right,
                            nodeop @ [
                                \`{get},
                                {@},
                                nodelist @ [
                                    right,
                                    nodestring . getname @. left
                                ]
                            ]
                        ]
                    ]
                ]
            )],

            [isop'{:>} @. left, (
                ato: not . isop'{:>} . getright @. left;

                out: out ++ $ @ [
                    getright @. left,
                    nodeop @ [
                        \`{get},
                        {@},
                        nodelist @ [
                            right,

                            k: getleft @. left;
                            isnodeident @. k ? [
                                nodestring . getname @. k,
                                k
                            ]
                        ]
                    ],
                    ato
                ]
            )]
        ];

        out

    );  
    
    ast: nodeexpr @ [
        nodeop @ [object, {:}, right],
        helper @ [left, object, 0],
        nodeop @ [
            \`{del},
            {@},
            nodeast @ object
        ]
    ];

    eval_ast @!! ast;

)]`);
  define_const("PI", Math.PI);
  define_const("π", Math.PI);
  define_const("E", Math.E);
  define_const("ASCII_LOWER", "abcdefghijklmnopqrstuvwxyz");
  define_const("ASCII_UPPER", "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  define_const("ASCII_DIGITS", "0123456789");
  define_const("ponky", "bear");
});

// calc.mjs
init_eval();
init_values();

class Calculator {
  constructor(env = { ENV: {}, USER_DEFINED_OP: {} }) {
    this.env = env;
  }
  async eval(expr) {
    return await eval_expr(expr, this.env);
  }
  static async with_stdlib() {
    const { STDLIB: STDLIB2 } = await init_stdlib().then(() => exports_stdlib);
    const env = {
      ENV: { ...STDLIB2.ENV },
      USER_DEFINED_OP: { ...STDLIB2.USER_DEFINED_OP }
    };
    return new Calculator(env);
  }
  merge(calc) {
    this.env = {
      ENV: {
        ...this.env.ENV,
        ...calc.env.ENV
      },
      USER_DEFINED_OP: {
        ...this.env.USER_DEFINED_OP,
        ...calc.env.USER_DEFINED_OP
      }
    };
  }
  define(name, value) {
    this.env.ENV[name] = [value];
  }
  defineFromJS(name, value) {
    this.define(name, fromJS(value));
  }
  defineBuiltin(name, func) {
    const b = new BuiltinFunction(func);
    b.name = name;
    this.env.ENV[name] = [b];
  }
}
// examples-manifest.mjs
var EXAMPLES = [
  "000_basics.tbl",
  "001_complex.tbl",
  "002_comparisons.tbl",
  "003_lists.tbl",
  "004_listops.tbl",
  "005_assignment.tbl",
  "006_conditions.tbl",
  "007_functions.tbl",
  "008_while.tbl",
  "009_funcops.tbl",
  "010_for.tbl",
  "011_expressions.tbl",
  "012_strings.tbl",
  "013_stdlib.tbl",
  "014_listmanip_basic.tbl",
  "015_listmanip_adv.tbl",
  "016_stringmanip.tbl",
  "017_duplicate.tbl",
  "018_opfun.tbl",
  "019_mathfun.tbl",
  "020_boolean_arith.tbl",
  "021_baseconvert.tbl",
  "022_util.tbl",
  "base.tbl",
  "binary_search.tbl",
  "collatz.tbl",
  "derivative.tbl",
  "factorize.tbl",
  "fib.tbl",
  "nwise.tbl",
  "pascal.tbl",
  "primes.tbl",
  "projeuler/p1.tbl",
  "projeuler/p2.tbl",
  "projeuler/p3.tbl",
  "qsort.tbl",
  "trig.tbl",
  "wordle.tbl",
  "wordle_solver.tbl"
];
export {
  EXAMPLES,
  Calculator
};
