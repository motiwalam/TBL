import { readFileSync } from 'fs';
import repl from 'repl';
import { Calculator } from './calc.mjs';
import { assert_vstring } from './checks.mjs';
import { LANG } from './language.mjs';
import { Complex, VString } from './values.mjs';

const c = new Calculator();

c.defineBuiltin('load', params => {
	const s = params.get(0);
	assert_vstring(s, `path needs to be a string`);

	try {
		c.eval(readFileSync(s.value).toString());
		return new VString('success');
	} catch (err) {
		return new VString(`Could not read ${s.value}. Error: ${err}`);
	}
});

c.defineBuiltin('log', params => {
	console.log(...params.values.map(e => e.toString()));
})

const shell = repl.start({
	prompt: 'tbl> ',
	ignoreUndefined: true,
	eval: (cmd, ctx, fn, callback) => {
		const e = cmd !== '\n' && c.eval(cmd);
		
		callback(null, e ? console.log(e.toString()) : undefined);
	},
	completer: s => {
		const opc = LANG.OPCHARS(c.env.USER_DEFINED_OP);
		const ri = Array.from(s).reverse().findIndex(e => opc.includes(e));
		const i = s.length - (ri > 0 ? ri : s.length);
		const q = s.slice(i);
		const hits = Object.keys(c.env.ENV).filter(e => e.startsWith(q));
		return [hits, q]
	}
});


