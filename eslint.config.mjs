import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Node CommonJS utilities intentionally use require().
  { files: ["**/*.cjs"], rules: { "@typescript-eslint/no-require-imports": "off" } },
  // These are independent curriculum/runtime modules, not Next application code.
  // In this domain `module` names a course module, not the CommonJS global.
  { files: ["config/**/*.mjs", "scripts/**/*.mjs", "tests/**/*.mjs", "netlify/**/*.mjs", "public/**/*.{js,mjs}", "lib/nmls-*.mjs"],
    rules: { "@next/next/no-assign-module-variable": "off" } },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Byte-preserved upstream runtime has its own checks under integrations/core-v2/.
    "integrations/core-v2/upstream/**",
    "work/**", "outputs/**", ".sites-runtime/**", ".wrangler/**", "dist/**",
  ]),
]);

export default eslintConfig;
