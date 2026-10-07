import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import globals from "globals";
export default defineConfig([
	...nextVitals,
	...nextTypescript,
	{
		files: ["components/wasl/portal.jsx"],
		languageOptions: { globals: globals.browser },
		rules: {
			// The recovered legacy portal will be converted incrementally; keep undefined-reference checks active.
			"no-undef": "error",
			"@typescript-eslint/no-unused-expressions": "off",
			"@typescript-eslint/no-unused-vars": "off",
			"react-hooks/exhaustive-deps": "off",
			"react-hooks/rules-of-hooks": "off",
			"react-hooks/set-state-in-effect": "off",
			"react-hooks/immutability": "off",
			"react-hooks/purity": "off",
			"react-hooks/refs": "off",
			"react-hooks/preserve-manual-memoization": "off",
			"react-hooks/static-components": "off",
			"react-hooks/error-boundaries": "off",
			"react-hooks/component-hook-factories": "off",
		},
	},
	globalIgnores([
		".next/**",
		"playwright-report/**",
		"test-results/**",
		"next-env.d.ts",
	]),
]);
