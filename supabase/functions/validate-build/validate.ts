// Edge adapter re-export of the canonical Build validation rules.
// The rules live in ../_shared/buildRules.ts so the client and this edge
// function validate against the same source. See that file for the rules.
export { validateBuild, VALID_ROLES } from "../_shared/buildRules.ts";
export type { ValidateResult, Role } from "../_shared/buildRules.ts";
