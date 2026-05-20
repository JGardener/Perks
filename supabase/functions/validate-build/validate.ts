export interface ValidateResult {
  valid: boolean;
  errors: string[];
}

const VALID_ROLES = ["survivor", "killer"] as const;
type Role = (typeof VALID_ROLES)[number];

export function validateBuild(body: unknown): ValidateResult {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { valid: false, errors: ["body must be an object"] };
  }

  const errors: string[] = [];
  const { role, perks } = body as Record<string, unknown>;

  if (!VALID_ROLES.includes(role as Role)) {
    errors.push(`role must be one of: ${VALID_ROLES.join(", ")}`);
  }

  if (!Array.isArray(perks)) {
    errors.push("perks must be an array");
  } else {
    if (perks.length > 4) {
      errors.push("perks must have at most 4 items");
    }
    for (let i = 0; i < perks.length; i++) {
      const p = perks[i];
      if (p !== null && (typeof p !== "string" || p.trim() === "")) {
        errors.push(`perks[${i}] must be a non-empty string or null`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
