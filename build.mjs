import { build } from "bun";

await build({
  entrypoints: ["./calc.mjs"],
  outdir: ".",
  naming: "calc.bundle.js",
  target: "browser",
  plugins: [
    {
      name: "node-assert-polyfill",
      setup(build) {
        // Redirect every import of "assert" to a browser-compatible shim,
        // regardless of import style (default, namespace, named).
        build.onResolve({ filter: /^assert$/ }, () => ({
          path: "assert",
          namespace: "assert-polyfill",
        }));
        build.onLoad({ filter: /.*/, namespace: "assert-polyfill" }, () => ({
          contents: `
            export default function assert(cond, msg) {
              if (!cond) throw new Error(msg ?? "Assertion failed");
            }
          `,
          loader: "js",
        }));
      },
    },
  ],
});

console.log("✓ calc.bundle.js written");
