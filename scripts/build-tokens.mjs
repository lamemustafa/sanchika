import { fileURLToPath } from "node:url";
import {
  authoredTokenGroups,
  authoredTokens,
  compatibilityCollections,
} from "../packages/tokens/src/tokens.ts";
import { validateTokenSource, writeTokenArtifacts } from "./token-generation.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const failures = validateTokenSource({
  tokens: authoredTokens,
  groups: authoredTokenGroups,
  collections: compatibilityCollections,
});

if (failures.length > 0) {
  console.error("Sanchika token generation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

const artifacts = writeTokenArtifacts({
  outputRoot: root,
  tokens: authoredTokens,
  groups: authoredTokenGroups,
  collections: compatibilityCollections,
});

console.log(
  `Sanchika token outputs generated (${authoredTokens.length} tokens; ${Buffer.byteLength(artifacts.css)} CSS bytes; ${Buffer.byteLength(artifacts.typescript)} TypeScript bytes).`,
);
