const fs = require('node:fs');
const path = require('node:path');

const packageName = 'junk_drawer';
const versionPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][\dA-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][\dA-Za-z-]*))*))?(?:\+[\dA-Za-z-]+(?:\.[\dA-Za-z-]+)*)?$/;

function updateTomlVersion(content, pattern, filePath) {
  const matches = [...content.matchAll(pattern)];
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one app version entry in ${filePath}.`);
  }

  return content.replace(pattern, `$1${version}$2`);
}

function updateJsonVersion(filePath, update) {
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);
  update(data);
  const newline = content.includes('\r\n') ? '\r\n' : '\n';
  const trailingNewline = /(?:\r\n|\n)$/.test(content);
  const json = JSON.stringify(data, null, 2).replace(/\n/g, newline);
  return trailingNewline ? `${json}${newline}` : json;
}

const version = process.argv[2];
if (!version || process.argv.length !== 3 || !versionPattern.test(version)) {
  console.error('Usage: npm run version:set -- <semver-version>');
  process.exit(1);
}

const root = path.resolve(__dirname, '..');
const packageJsonPath = path.join(root, 'package.json');
const packageLockPath = path.join(root, 'package-lock.json');
const cargoTomlPath = path.join(root, 'src-tauri', 'Cargo.toml');
const cargoLockPath = path.join(root, 'src-tauri', 'Cargo.lock');
const tauriConfigPath = path.join(root, 'src-tauri', 'tauri.conf.json');

try {
  const packageJson = updateJsonVersion(packageJsonPath, (data) => {
    if (data.name !== packageName) {
      throw new Error(`Unexpected package name in ${packageJsonPath}.`);
    }
    data.version = version;
  });
  const packageLock = updateJsonVersion(packageLockPath, (data) => {
    if (
      data.name !== packageName ||
      data.packages?.['']?.name !== packageName
    ) {
      throw new Error(`Unexpected app package entry in ${packageLockPath}.`);
    }
    data.version = version;
    data.packages[''].version = version;
  });
  const cargoToml = updateTomlVersion(
    fs.readFileSync(cargoTomlPath, 'utf8'),
    /(^\[package\]\r?\n(?:(?!^\[)[^\r\n]*(?:\r?\n|$))*?version = ")[^"]+(")/gm,
    cargoTomlPath,
  );
  const cargoLock = updateTomlVersion(
    fs.readFileSync(cargoLockPath, 'utf8'),
    /(^\[\[package\]\]\r?\nname = "junk_drawer"\r?\nversion = ")[^"]+(")/gm,
    cargoLockPath,
  );
  const tauriConfig = updateJsonVersion(tauriConfigPath, (data) => {
    data.version = version;
  });

  fs.writeFileSync(packageJsonPath, packageJson);
  fs.writeFileSync(packageLockPath, packageLock);
  fs.writeFileSync(cargoTomlPath, cargoToml);
  fs.writeFileSync(cargoLockPath, cargoLock);
  fs.writeFileSync(tauriConfigPath, tauriConfig);

  console.log(`Updated ${packageName} version to ${version}.`);
} catch (error) {
  console.error(`Could not update version: ${error.message}`);
  process.exitCode = 1;
}
