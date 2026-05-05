export const failureTypes = new Set(["FACT_ERROR", "MISSING_EVIDENCE", "WRONG_CITATION", "RISK_MISS", "FORMAT_ERROR", "OTHER"]);
export const severityLevels = new Set(["P0", "P1", "P2", "P3"]);
export const failureStatuses = new Set(["OPEN", "FIXED", "WONT_FIX"]);

export function requiredText(value: unknown, label: string) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(`${label} is required.`);
  return text;
}

export function allowedValue(value: unknown, allowed: Set<string>, label: string) {
  const text = String(value || "").trim().toUpperCase();
  if (!allowed.has(text)) throw new Error(`Unsupported ${label}.`);
  return text;
}
