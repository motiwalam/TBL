#!/usr/bin/env node

import { readFileSync } from 'fs';
import repl from 'repl';
import { Calculator } from './calc.mjs';
import { assert_vstring } from './checks.mjs';
import { LANG } from './language.mjs';
import { Complex, VString } from './values.mjs';
import process from 'process';

const JS_PREFIX = '!js ';

const c = new Calculator(false);

c.defineBuiltin('load', async params => {
	const s = params.get(0);
	assert_vstring(s, `path needs to be a string`);

	try {
		await c.eval(readFileSync(s.value).toString());
		return new VString('success');
	} catch (err) {
		return new VString(`Could not read ${s.value}. Error: ${err}`);
	}
});

c.defineBuiltin('clog', params => {
	console.log(...params.values.map(e => e.toString()));
	return new Complex(0, 0);
});

function start_repl() {
	const shell = repl.start({
		prompt: 'tbl> ',
		ignoreUndefined: true,
		eval: async (cmd, ctx, fn, callback) => {
			if (cmd.startsWith(JS_PREFIX)) {
				callback(null, eval(cmd.slice(JS_PREFIX.length)))
			} else {
				const e = cmd !== '\n' && await c.eval(cmd);
				callback(null, e ? console.log(e.toString()) : undefined);
			}
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
	
	
	shell.setupHistory(process.env.TBL_REPL_HISTORY ?? `${process.env.HOME}/.tbl_repl_history`, (err, repl) => {})
}

function parse_args(argv) {
	argv = argv.slice(argv.findIndex(e => e.endsWith('tbl.mjs')) + 1);
	const opts = {
		cmd: undefined,
		loadStdlib: true,
		pos: [],
	};
	
	let cur;
	while (argv.length > 0) {
		switch (cur = argv.shift()) {
			case '-e':
			case '--execute':
				opts.cmd = argv.shift();
				break;
			
			case '-ns':
			case '--no-stdlib':
				opts.loadStdlib = false;
				break;

			default:
				opts.pos.push(cur);
		}
	}

	return opts;
}

async function main() {
	const opts = parse_args(process.argv);

	// console.log(opts);

	if (opts.loadStdlib) {
		c.reset_stdlib();
	}

	if (opts.cmd !== undefined) {
		console.log((await c.eval(opts.cmd)).toString());
	} else {
		start_repl();
	}
}

main();