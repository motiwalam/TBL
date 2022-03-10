import { readFileSync } from 'fs';
import repl from 'repl';
import { Calculator } from './calc.mjs';
import { assert_vstring } from './checks.mjs';
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

	return new Complex(1, 0);
})

const shell = repl.start({
	prompt: 'tbl> ',
	ignoreUndefined: true,
	eval: (cmd, ctx, fn, callback) => callback(null, c.eval(cmd).toString())
});


