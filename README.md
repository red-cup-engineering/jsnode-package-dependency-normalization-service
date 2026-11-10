# jsnode-package-dependency-normalization-service

<!-- 561-group-standards:badges:start -->
[![Red Cup Engineering](https://img.shields.io/badge/561%20Group-Red%20Cup%20Engineering-c0392b)](https://github.com/red-cup-engineering)
[![License: MIT](https://img.shields.io/badge/license-MIT-c0392b)](LICENSE)
[![Indigenous data: CARE](https://img.shields.io/badge/Indigenous%20data-CARE-4b6f44)](https://github.com/red-cup-engineering/.github/blob/main/GOVERNANCE.md)
[![Tips welcome](https://img.shields.io/badge/tips-welcome-d4a017)](https://github.com/561-group/.github/blob/main/TIPS.md)
<!-- 561-group-standards:badges:end -->

Pure normalization of dependency edges in one npm package manifest.

`normalizeJsnodePackageDependencies` returns the manifest with each dependency named by its provider's package name and stated as a compatible range:

- A `workspace:`, `file:` or `link:` dependency becomes `^VERSION` of its provider's published registry release. A provider with no published release, integrity and tarball is refused.
- An exact version (`1.2.3`, `0.2.12-dev.140`) becomes `^1.2.3`, `^0.2.12-dev.140`.
- A specification that already states a range, a dist-tag, an alias or another source is left as written.

A manifest states which releases a package is compatible with. The exact release and its integrity are recorded once, in the lockfile of whatever is deployed. Exact versions in manifests make every consumer install its own copy of a shared provider.
