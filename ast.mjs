import { NodeExprBody, NodeComplex, NodeIdentifier, NodeList, NodeOperation, NodeString } from "./nodes.mjs";

import { LANG } from "./language.mjs";
import assert from "assert"

function splitIndices(text, indices, includeidx = false) {
    let pairs = [[0, indices[0]], ...indices.map((v, i) => [v + 1, indices[i+1]])];
    if (includeidx) pairs = pairs.concat(indices.map(i => [i, i + 1])).sort(([a], [b]) => a - b)
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

function splitOnUncontainedDelim(text, og, cg, delim, includedelim = false) {
    return splitOnMultipleUncontainedDelims(text, [og], [cg], [delim], includedelim)
}

function parseNumber(t) {
    let n;
    if (t.startsWith(LANG.NEGATIVE)) {
        n = -parseFloat(t.slice(1));
    } else {
        n = parseFloat(t);
    }
    
    if (t.endsWith(LANG.COMPLEX)) {
        return new NodeComplex(0, n);
    } else {
        return new NodeComplex(n, 0);
    }

}

function make_ast(input) {
    // remove comments
    input = input.split(LANG.COMMENT_SEPARATOR)
                 .filter(e => e && !e.startsWith(LANG.COMMENT))
                 .join(LANG.COMMENT_SEPARATOR);

    // input = input.replace(LANG.IGNORE, '');

    const body = splitOnUncontainedDelim(input, LANG.EXPR_OPEN, LANG.EXPR_CLOSE, LANG.STATEMENT_SEPARATOR)
                 .filter(e => e);

    const asts = [];

    for (const se of body) {
        const exprs = splitOnMultipleUncontainedDelims(se, LANG.OPEN_GROUPS, LANG.CLOSE_GROUPS, LANG.OPERATORS, true);
    
        let values = [];
        for (const ex of exprs) {
            let e = ex.replace(LANG.IGNORE, '');
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
                    const subexprs = splitOnMultipleUncontainedDelims(e.slice(1, li), LANG.OPEN_GROUPS, LANG.CLOSE_GROUPS, [LANG.LIST_SEPARATOR]);
    
                    values.push(new NodeList(subexprs.map(t => make_ast(t))))
    
                }
            }
            
            else if (ex.trim().startsWith(LANG.STRING_OPEN)) {
                e = ex.trim();
                if (e[e.length - 1] != LANG.STRING_CLOSE) throw `Unmatched ${LANG.STRING_OPEN}`;

                values.push(new NodeString(e.slice(1, -1)));
            }
            else if (LANG.NUMBER_START.test(e)) {
                values.push(parseNumber(e));
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