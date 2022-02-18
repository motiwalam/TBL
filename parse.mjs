function splitIndices(text, indices, includeidx = false) {
    let pairs = [[0, indices[0]], ...indices.map((v, i) => [v + 1, indices[i+1]])];
    if (includeidx) pairs = pairs.concat(indices.map(i => [i, i + 1])).sort(([a], [b]) => a - b)
    const out = pairs.map(([i1, i2]) => text.slice(i1, i2));

    return out;
}


function splitOnUncontainedDelim(text, og, cg, delim, includedelim = false) {
    return splitOnMultipleUncontainedDelims(text, [og], [cg], [delim], includedelim)
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

const splitFirst = (t, d = ' ', n = 1) => {
    const s = t.split(d);
    const f = s.slice(0, n);
    const r = s.slice(n).join(d);

    return [...f, r]
}


const indicesOf = (arr, c) => arr.map((v, i) => [v, i]).filter(([v]) => c == v).map(([_, i]) => i)

export {
    splitIndices,
    splitOnUncontainedDelim,
    splitOnMultipleUncontainedDelims,
    splitFirst,
    indicesOf
}