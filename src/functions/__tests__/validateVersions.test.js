import fixtures from 'fixturez';
import validateVersions from '../validateVersions';

const f = fixtures(__dirname);

describe('functions/validateVersions', () => {
  let cwd;

  afterEach(() => {
    f.cleanup();
  });

  describe('A simple project', () => {
    it('validates a project where all package dep versions match', async () => {
      cwd = f.copy('valid-versions');
      expect(await validateVersions({ cwd })).toBeTruthy();
    });

    it('invalidates a project where a package dep does not match the root dep version', async () => {
      cwd = f.copy('invalid-version');
      expect(await validateVersions({ cwd })).toBeFalsy();
    });

    it('invalidates a project where a package internal dep does not match', async () => {
      cwd = f.copy('invalid-internal-version');
      expect(await validateVersions({ cwd })).toBeFalsy();
    });
  });

  describe('A project with version exceptions', () => {
    xit(
      'validates a project where a package specifies a dep version exception',
      async () => {
        expect(await validateVersions({ cwd })).toBeTruthy();
      }
    );

    xit(
      'invalidates a project where a package dep version exception has expired',
      async () => {
        expect(await validateVersions({ cwd })).toBeTruthy();
      }
    );

    xit(
      'validates a project where a package specifies an internal dep version exception',
      async () => {
        expect(await validateVersions({ cwd })).toBeTruthy();
      }
    );

    xit(
      'invalidates a project where a package internal dep version exception has expired',
      async () => {
        expect(await validateVersions({ cwd })).toBeTruthy();
      }
    );
  });
});
