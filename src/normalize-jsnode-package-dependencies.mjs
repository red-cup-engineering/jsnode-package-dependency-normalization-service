import { dirname, resolve } from "node:path";

const FIELDS = Object.freeze(["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"]);
const EXACT_VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u;
// A manifest states which releases it is compatible with. The exact release and its integrity
// belong to the lockfile of whatever is deployed, so one copy of a provider can serve every consumer.
const compatibleRange = (version) => `^${version}`;

export function normalizeJsnodePackageDependencies({ manifest, manifestPath, root, providersByName = new Map(), providersByDirectory = new Map(), registryReleases = new Map() } = {}) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) throw new TypeError("manifest is required");
  if (typeof manifestPath !== "string" || typeof root !== "string") throw new TypeError("manifestPath and root are required");
  const result = { ...manifest };
  for (const field of FIELDS) {
    if (!manifest[field]) continue;
    result[field] = Object.fromEntries(Object.entries(manifest[field]).map(([name, value]) => {
      const local = typeof value === "string" ? value.match(/^(?:file:|link:)(.+)$/u) : null;
      const localDirectory = local ? resolve(dirname(resolve(root, manifestPath)), local[1]) : null;
      const provider = (localDirectory && providersByDirectory.get(localDirectory)) || providersByName.get(name);
      const targetName = provider?.name ?? name;
      if (typeof value === "string" && /^(?:workspace:|file:|link:)/u.test(value)) {
        const release = registryReleases.get(targetName);
        if (release?.name !== targetName || !EXACT_VERSION.test(release?.version ?? "") || !release.dist?.integrity || !release.dist?.tarball) throw new Error(`dependency ${targetName} requires a published registry release`);
        return [targetName, compatibleRange(release.version)];
      }
      return [targetName, typeof value === "string" && EXACT_VERSION.test(value) ? compatibleRange(value) : value];
    }));
  }
  return result;
}
