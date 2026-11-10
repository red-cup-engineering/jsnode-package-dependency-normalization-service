import assert from "node:assert/strict";
import test from "node:test";
import { normalizeJsnodePackageDependencies } from "../src/normalize-jsnode-package-dependencies.mjs";

const provider = { name: "@red-cup-engineering/provider", version: "3.0.0" };
const release = { ...provider, dist: { integrity: "sha512-provider", tarball: "https://registry.example/provider-3.0.0.tgz" } };
const normalize = (manifest, registryReleases = new Map([[provider.name, release]])) => normalizeJsnodePackageDependencies({
  manifest,
  manifestPath: "packages/consumer/package.json",
  root: "/repo",
  providersByName: new Map([["@emsenn/provider", provider]]),
  registryReleases,
});

test("a local dependency becomes a compatible range on its provider's published release", () => {
  const output = normalize({ dependencies: { "@emsenn/provider": "workspace:*", external: "^1" } });
  assert.deepEqual(output.dependencies, { "@red-cup-engineering/provider": "^3.0.0", external: "^1" });
});

test("an exact version becomes a compatible range in every dependency field", () => {
  const output = normalize({
    dependencies: { "@red-cup-engineering/provider": "3.0.0", "development-release": "0.2.12-dev.140" },
    devDependencies: { tool: "1.2.3" },
    optionalDependencies: { extra: "0.0.4" },
    peerDependencies: { host: "2.0.0" },
  });
  assert.deepEqual(output.dependencies, { "@red-cup-engineering/provider": "^3.0.0", "development-release": "^0.2.12-dev.140" });
  assert.deepEqual(output.devDependencies, { tool: "^1.2.3" });
  assert.deepEqual(output.optionalDependencies, { extra: "^0.0.4" });
  assert.deepEqual(output.peerDependencies, { host: "^2.0.0" });
});

test("a specification that already states a range or names another source is left as written", () => {
  const dependencies = { caret: "^1.2.3", tilde: "~1.2.3", bounded: ">=1 <3", tagged: "latest", alias: "npm:other@1.0.0", forge: "github:owner/name#v1" };
  assert.deepEqual(normalize({ dependencies }).dependencies, dependencies);
});

test("a local dependency whose provider has no published release is refused", () => {
  assert.throws(() => normalize({ dependencies: { "@emsenn/provider": "workspace:*" } }, new Map()), /requires a published registry release/u);
  assert.throws(() => normalize({ dependencies: { "@emsenn/provider": "workspace:*" } }, new Map([[provider.name, { ...provider }]])), /requires a published registry release/u);
});
