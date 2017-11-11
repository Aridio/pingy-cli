'use strict';

const expect = require('unexpected').clone();
const spawn = require('child-process-promise').spawn;
const path = require('path');
const rimraf = require('rimraf');
const unexpectedWebdriver = require('unexpected-webdriver');
const mkdirp = require('mkdirp');
require('./assertions')(expect);

expect.use(unexpectedWebdriver());

const projectPath = path.join(__dirname, 'scaffolded-project');

after(function (done) {
  this.timeout(20000);
  rimraf(projectPath, () => done());
});
before(function (done) {
  this.timeout(10000);
  rimraf(projectPath, () => mkdirp(projectPath, done));
});

describe('cli scaffold', function cli() {
  const pingyJsonPath = path.join(projectPath, 'pingy.json');
  const pingyScaffoldJsonPath = path.join(projectPath, 'pingy-scaffold.json');
  const pkgJsonPath = path.join(projectPath, 'package.json');
  const indexHtml = path.join(projectPath, 'index.html');
  const scripts = path.join(projectPath, 'scripts', 'main.js');
  const styles = path.join(projectPath, 'styles', 'main.scss');
  const modules = path.join(projectPath, 'node_modules');

  this.timeout(1000000);

  describe('shorthand github scaffold', function() {
    let spawnedInit;
    let stdin;
    let stdout;
    const nextStep = (matchString, write = '\n') =>
      new Promise((resolve) => {
        const onData = (data) => {
          if (data.toString().includes(matchString)) {
            stdout.removeAllListeners('data');
            resolve();
            stdin.write(write);
          }
        };
        stdout.on('data', onData);
      });

    before(function() {
      spawnedInit = spawn(
        'node',
        ['../../cli.js', 'scaffold', 'pingyhq/bootstrap-jumbotron', '--global-pingy'],
        {
          cwd: projectPath,
        }
      );
      stdout = spawnedInit.childProcess.stdout;
      stdin = spawnedInit.childProcess.stdin;
    });
    after(function (done) {
      this.timeout(10000);
      rimraf(projectPath, () => mkdirp(projectPath, done));
    });

    it('should choose to scaffold files', function() {
      return nextStep('? Do you want Pingy to scaffold', 'y\n');
    });

    it('with 2 spaces', function() {
      return nextStep('? The most important question');
    });

    it('and install modules', function() {
      return nextStep('Run npm install ', '\n');
    });

    it('and wait for install to finish', function() {
      return spawnedInit;
    });

    it('should have pingy.json', function() {
      expect(pingyJsonPath, 'to exist');
      expect(
        pingyJsonPath,
        'to have file content',
        '"path": "!node_modules/{bootstrap,bootstrap/dist,bootstrap/dist/**}"'
      );
    });

    it('should not have pingy-scaffold.json', function() {
      expect(pingyScaffoldJsonPath, 'not to exist');
    });

    it('should have package.json', function() {
      expect(pkgJsonPath, 'to exist');
    });

    it('should have website docs', function() {
      expect(indexHtml, 'to exist');
      expect(scripts, 'to exist');
      expect(styles, 'to exist');
    });

    it('should have node_modules', function() {
      expect(modules, 'to exist');
    });
  });

  describe('longhand github scaffold without scaffolding files or npm install', function() {
    let spawnedInit;
    let stdin;
    let stdout;
    const nextStep = (matchString, write = '\n') =>
      new Promise((resolve) => {
        const onData = (data) => {
          if (data.toString().includes(matchString)) {
            stdout.removeAllListeners('data');
            resolve();
            stdin.write(write);
          }
        };
        stdout.on('data', onData);
      });
    before(function() {
      spawnedInit = spawn(
        'node',
        [
          '../../cli.js',
          'scaffold',
          'https://github.com/pingyhq/pingy-scaffold-bootstrap-jumbotron.git',
          '--global-pingy'
        ],
        {
          cwd: projectPath,
        }
      );
      stdout = spawnedInit.childProcess.stdout;
      stdin = spawnedInit.childProcess.stdin;
    });

    it('should choose not to scaffold files', function() {
      return nextStep('? Do you want Pingy to scaffold', 'n\n');
    });

    it('and not install modules', function() {
      return nextStep('Run npm install ', 'n\n');
    });

    it('and wait for finish', function() {
      return spawnedInit;
    });

    it('should have pingy.json', function() {
      expect(pingyJsonPath, 'to exist');
      expect(
        pingyJsonPath,
        'to have file content',
        '"path": "!node_modules/{bootstrap,bootstrap/dist,bootstrap/dist/**}"'
      );
    });

    it('should not have pingy-scaffold.json', function() {
      expect(pingyScaffoldJsonPath, 'not to exist');
    });

    it('should have package.json', function() {
      expect(pkgJsonPath, 'to exist');
    });

    it('should not have website docs', function() {
      expect(indexHtml, 'not to exist');
      expect(scripts, 'not to exist');
      expect(styles, 'not to exist');
    });

    it('should have node_modules', function() {
      expect(modules, 'not to exist');
    });
  });
});
