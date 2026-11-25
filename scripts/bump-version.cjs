const fs = require('fs');
const path = require('path');
const type = process.argv[2] || 'patch';

const versionFile = path.join(__dirname, '..', 'VERSION');
let current = fs.readFileSync(versionFile, 'utf-8').trim();
const match = current.match(/^v?(\d+)\.(\d+)\.(\d+)(?:\.(\d+))?$/);

if (!match) {
  console.error('Invalid version format:', current);
  process.exit(1);
}

let major = Number(match[1]);
let minor = Number(match[2]);
let patch = Number(match[3]);
let build = Number(match[4] || 0);

if (type === 'major') { major++; minor = 0; patch = 0; build = 0; }
else if (type === 'minor') { minor++; patch = 0; build = 0; }
else { build++; }

const next = `v${major}.${minor}.${patch}.${build}`;
fs.writeFileSync(versionFile, `${next}\n`, 'utf-8');

// package.json drifted to its own number (7.1.13) because nothing kept it
// pinned to VERSION; sync the semver part so tooling reads one truth.
const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
const semver = `${major}.${minor}.${patch}`;
if (pkg.version !== semver) {
  pkg.version = semver;
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf-8');
}

console.log(`Bumped: ${current} → ${next} (package.json → ${semver})`);
