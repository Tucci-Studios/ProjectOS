import schema from "../../docs/manifest/project.schema.json";

export const CATEGORIES = schema.properties.category.enum as readonly string[];

export type Manifest = {
  name: string;
  variant?: string;
  category: string;
  description: string;
  license: string;
  howToRun?: string;
  screenshots?: string[];
  tags?: string[];
  lineage?: { parentRepo: string; changeSummary?: string };
};

const NAME_RE = /^.{2,40}$/;
const TAG_RE = /^[a-z0-9][a-z0-9-]{1,29}$/;
const REPO_RE = /^[\w.-]+\/[\w.-]+$/;

/** Validate a parsed project.json. Returns human-readable errors; empty array = valid. */
export function validateManifest(data: unknown): string[] {
  const errors: string[] = [];
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return ["project.json must be a JSON object."];
  }
  const m = data as Record<string, unknown>;

  const str = (key: string, required: boolean, min: number, max: number) => {
    const v = m[key] === "" ? undefined : m[key];
    if (v === undefined) {
      if (required) errors.push(`"${key}" is required.`);
      return;
    }
    if (typeof v !== "string") errors.push(`"${key}" must be a string.`);
    else if (v.length < min || v.length > max)
      errors.push(`"${key}" must be ${min}-${max} characters (got ${v.length}).`);
  };

  str("name", true, 2, 40);
  if (typeof m.name === "string" && !NAME_RE.test(m.name)) errors.push(`"name" is invalid.`);
  str("variant", false, 2, 40);
  str("description", true, 20, 500);
  str("license", true, 1, 60);
  // Optional: the readme covers this for most projects and every page links
  // to the repo. Requiring it meant a project with a perfectly good README
  // still couldn't be listed without writing the instructions out twice.
  str("howToRun", false, 10, 2000);

  if (m.category === undefined) errors.push(`"category" is required.`);
  else if (typeof m.category !== "string" || !CATEGORIES.includes(m.category))
    errors.push(`"category" must be one of: ${CATEGORIES.join(", ")}.`);

  if (m.screenshots !== undefined) {
    if (!Array.isArray(m.screenshots) || m.screenshots.length > 6 || m.screenshots.some((s) => typeof s !== "string"))
      errors.push(`"screenshots" must be an array of up to 6 strings.`);
  }
  if (m.tags !== undefined) {
    if (!Array.isArray(m.tags) || m.tags.length > 10 || m.tags.some((t) => typeof t !== "string" || !TAG_RE.test(t)))
      errors.push(`"tags" must be up to 10 lowercase slugs (letters, numbers, dashes).`);
  }
  if (m.lineage !== undefined) {
    const l = m.lineage as Record<string, unknown>;
    if (typeof l !== "object" || l === null || typeof l.parentRepo !== "string" || !REPO_RE.test(l.parentRepo))
      errors.push(`"lineage.parentRepo" must be a GitHub "owner/repo".`);
    if (l?.changeSummary !== undefined && (typeof l.changeSummary !== "string" || l.changeSummary.length > 280))
      errors.push(`"lineage.changeSummary" must be a string of at most 280 characters.`);
  }

  const known = new Set(Object.keys(schema.properties));
  for (const key of Object.keys(m)) {
    if (!known.has(key)) errors.push(`Unknown field "${key}".`);
  }
  return errors;
}
