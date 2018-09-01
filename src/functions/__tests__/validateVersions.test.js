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
      expect((await validateVersions({ cwd })).size).toBe(0);
    });

    it('invalidates a project where a package dep does not match the root dep version', async () => {
      cwd = f.copy('invalid-versions');
      expect((await validateVersions({ cwd })).size).toBe(1);
    });

    it('invalidates a project where a package internal dep does not match', async () => {
      cwd = f.copy('invalid-internal-versions');
      expect((await validateVersions({ cwd })).size).toBe(1);
    });
  });

  describe('A project with pinned versions', () => {
    it('validates a project where a package pins a dep version', async () => {
      cwd = f.copy('valid-pinned-versions');
      expect((await validateVersions({ cwd })).size).toBe(0);
    });

    it('invalidates a project where a package pinned dep has expired', async () => {
      cwd = f.copy('expired-pinned-versions');
      expect((await validateVersions({ cwd })).size).toBe(1);
    });

    // ARE INTERNAL DEPS ALLOWED TO BE PINNED?
    // xit(
    //   'validates a project where a package specifies an internal dep version exception',
    //   async () => {
    //     expect(await validateVersions({ cwd })).toBeTruthy();
    //   }
    // );

    // xit(
    //   'invalidates a project where a package internal dep version exception has expired',
    //   async () => {
    //     expect(await validateVersions({ cwd })).toBeTruthy();
    //   }
    // );
  });
});
