import Project from '../Project';
import getProject from './getDependencyGraph';
import getDependencyGraph from './getDependencyGraph';

type Options = {
  cwd?: string
};

export default async function validateVersions(opts: Options = {}) {
  let cwd = opts.cwd || process.cwd();
  let project = await Project.init(cwd);
  let invalidDeps = new Map();
  let rootDependencies = project.pkg.getAllDependencies();
  // console.log(rootDependencies);

  // console.log("\nROOT DEPS:");
  // rootDependencies.forEach((version, name) => {
  // console.log(pName, p);
  // });

  const internalPackages = await project.getPackages();
  const internalPackageVersions = {};
  internalPackages.forEach(
    pkg => (internalPackageVersions[pkg.getName()] = pkg.getVersion())
  );
  internalPackages.forEach(_checkPackageDeps);

  _printInvalids(invalidDeps);
  return invalidDeps.size === 0;

  function _checkPackageDeps(pkg) {
    // console.log(`\n\n>>> PACKAGE ${pkg.getName()} <<<`);
    const pkgName = pkg.getName();

    pkg.getAllDependencies().forEach((pkgDepVersion, pkgDepName) => {
      // console.log("  ", depName, depVersion);
      const rootVersion = rootDependencies.get(pkgDepName);
      const internalVersion = internalPackageVersions[pkgDepName];

      if (rootVersion && pkgDepVersion !== rootVersion)
        _addInvalidDep(
          'rootVersion',
          rootVersion,
          pkgName,
          pkgDepName,
          pkgDepVersion
        );
      else if (
        internalVersion &&
        _removeSemverRangeSpecifier(pkgDepVersion) !== internalVersion
      )
        _addInvalidDep(
          'internalVersion',
          internalVersion,
          pkgName,
          pkgDepName,
          pkgDepVersion
        );
    });
  }

  function _removeSemverRangeSpecifier(semver) {
    return semver[0] == '^' || semver[0] == '~' ? semver.substr(1) : semver;
  }

  function _addInvalidDep(
    mismatchType,
    mismatchVersion,
    pkgName,
    pkgDepName,
    pkgDepVersion
  ) {
    // console.log(mismatchType, mismatchVersion, pkgName, pkgDepName, pkgDepVersion);
    const mismatchInfo = { mismatchType, mismatchVersion, pkgDepVersion };

    if (!invalidDeps.has(pkgName)) {
      const pkgInvalidDeps = new Map([[pkgDepName, mismatchInfo]]);
      invalidDeps.set(pkgName, pkgInvalidDeps);
    } else {
      invalidDeps.get(pkgName).set(pkgDepName, mismatchInfo);
    }
  }

  function _printInvalids(invalidDeps) {
    console.log('\nINVALIDS');
    console.log('-----------------------------');

    invalidDeps.forEach((pkgInvalidDeps, pkgName) => {
      console.log('PACKAGE', pkgName);

      pkgInvalidDeps.forEach((mismatchInfo, depName) => {
        const { mismatchType, mismatchVersion, pkgDepVersion } = mismatchInfo;

        console.log(
          `  ${depName}: ${pkgDepVersion} (${mismatchType} ${mismatchVersion})`
        );
      });
    });

    console.log('\n');
  }
}
