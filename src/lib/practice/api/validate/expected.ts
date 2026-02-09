// src/lib/practice/validate/expected.ts
import type { LoadedInstance } from "./load";

export function getExpectedCanon(instance: LoadedInstance) {
  const secret = instance?.secretPayload as any;
  const exp = secret?.expected;
  if (!exp || typeof exp !== "object") return null;
  return exp;
}
