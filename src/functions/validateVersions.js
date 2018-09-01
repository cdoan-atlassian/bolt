import Project from '../Project';
import getProject from './getDependencyGraph';
import getDependencyGraph from './getDependencyGraph';

type Options = {
  cwd?: string
};

export default async function validateVersions(opts: Options = {}) {
  let cwd = opts.cwd || process.cwd();
  let project = await Project.init(cwd);
  const invalidDeps = new Map();
  const rootDependencies = project.pkg.getAllDependencies();
  const packages = await project.getPackages();
  const internalPackageVersions = {};

  // For convenience: Save (object) map of internal packages and versions
  packages.forEach(
    pkg => (internalPackageVersions[pkg.getName()] = pkg.getVersion())
  );

  packages.forEach(_checkPackageDeps);
  _printInvalids(invalidDeps);

  return invalidDeps;

  function _checkPackageDeps(pkg) {
    const pkgName = pkg.getName();
    const pinnedVersions = pkg.getPinnedVersions();

    pkg.getAllDependencies().forEach((pkgDepVersion, pkgDepName) => {
      let message;
      const rootVersion = rootDependencies.get(pkgDepName);
      const internalVersion = internalPackageVersions[pkgDepName];

      const { version: pinnedVersion, until: pinnedUntil } =
        pinnedVersions[pkgDepName] || {};

      const trimmedSemver = /^(\^|~)?(.+)$/.exec(pkgDepVersion)[2];

      if (pinnedVersion && pkgDepVersion !== pinnedVersion)
        message = `${pkgDepName}: ${pkgDepVersion} (Does not match pinned version ${pinnedVersion})`;
      else if (pinnedVersion && Date.now() > Date.parse(pinnedUntil))
        message = `${pkgDepName}: ${pkgDepVersion} (Pinned version expired on ${pinnedUntil})`;
      else if (rootVersion && pkgDepVersion !== rootVersion && !pinnedVersion)
        message = `${pkgDepName}: ${pkgDepVersion} (Version at project root is ${rootVersion})`;
      else if (internalVersion && trimmedSemver !== internalVersion)
        message = `${pkgDepName}: ${pkgDepVersion} (Current package version is ${internalVersion})`;

      if (message) {
        _addInvalidDep({
          pkgName,
          pkgDepName,
          pkgDepVersion,
          pinnedVersion,
          pinnedUntil,
          message
        });
      }
    });
  }

  function _addInvalidDep(invalidDepInfo) {
    const { pkgName, pkgDepName, message } = invalidDepInfo;

    if (!invalidDeps.has(pkgName)) {
      const pkgInvalidDeps = new Map([[pkgDepName, invalidDepInfo]]);
      invalidDeps.set(pkgName, pkgInvalidDeps);
    } else {
      invalidDeps.get(pkgName).set(pkgDepName, invalidDepInfo);
    }
  }

  // For debugging: not formatted for consumers
  function _printInvalids(invalidDeps) {
    console.log('\nINVALIDS');
    console.log('-----------------------------');

    invalidDeps.forEach((pkgInvalidDeps, pkgName) => {
      console.log('PACKAGE', pkgName);

      pkgInvalidDeps.forEach(mismatchInfo => {
        console.log('  ', mismatchInfo.message);
      });
    });

    console.log('\n');
  }
}
