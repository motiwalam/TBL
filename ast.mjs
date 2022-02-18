import { splitOnMultipleUncontainedDelims, splitOnUncontainedDelim } from "./parse.mjs";
import { NodeExprBody, NodeComplex, NodeIdentifier, NodeList, NodeOperation } from "./nodes.mjs";

import { LANG } from "./language.mjs";
import assert from "assert"


function make_ast(input) {
    input = input.replace(LANG.IGNORE, '');

    const body = splitOnUncontainedDelim(input, LANG.EXPR_OPEN, LANG.EXPR_CLOSE, LANG.SEPARATOR)
                 .filter(e => e && !e.startsWith(LANG.COMMENT));

    const asts = [];

    for (const se of body) {
        const exprs = splitOnMultipleUncontainedDelims(se, LANG.OPEN_GROUPS, LANG.CLOSE_GROUPS, LANG.OPERATORS, true);
    
        let values = [];
        for (const e of exprs) {
    
            let li;
            if (e.startsWith(LANG.EXPR_OPEN)) {
                li = e.lastIndexOf(LANG.EXPR_CLOSE);
    
                if (li < 0) throw `Unmatched ${LANG.EXPR_OPEN}`;
    
                values.push(make_ast(e.slice(1, li)));
            }
    
            else if (e.startsWith(LANG.LIST_OPEN)) {
                li = e.lastIndexOf(LANG.LIST_CLOSE);
    
                if (li < 0) throw `Unmatched ${LANG.LIST_OPEN}`;
    
                if (e.slice(1, li).length == 0) {
                    values.push(new NodeList([]))
                } else {
                    const subexprs = splitOnMultipleUncontainedDelims(e.slice(1, li), LANG.OPEN_GROUPS, LANG.CLOSE_GROUPS, [',']);
    
                    values.push(new NodeList(subexprs.map(t => make_ast(t).subasts[0])))
    
                }
            }
    
            else if (LANG.NUMBER_START.test(e[0])) {
                const n = parseFloat(e);
    
                let v;
                if (e.endsWith('i'))
                    v = new NodeComplex(0, n);
                else
                    v = new NodeComplex(n, 0);
    
                values.push(v);
            }
    
            else if (!LANG.OPERATORS.includes(e[0])) {
                values.push(new NodeIdentifier(e));
            }
    
            else {
                values.push(e)
            }
    
        }
    
        for (const opgroup of LANG.PRECEDENCE) {
            while (opgroup.some(o => values.includes(o))) {
                const idx = values.findIndex(e => opgroup.includes(e));
                const [l, o, r] = values.splice(idx - 1, 3);
                const opr = new NodeOperation(o, l, r);
                values = values.slice(0, idx - 1).concat(opr).concat(values.slice(idx - 1))
            }
        }
    
        assert(values.length == 1, 'AST is malformed');
        asts.push(values[0]);
    }

    return new NodeExprBody(asts);

}

export {
    make_ast
}