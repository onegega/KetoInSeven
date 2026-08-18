/**
 * Guards against the most confusing failure in this project's setup.
 *
 * Expo resolves the SDK version from `node_modules/expo`, never from
 * `package.json`. Pulling a commit that changes the pinned SDK therefore does
 * nothing until the tree is reinstalled — and Expo Go, handed the stale SDK,
 * refuses the project with an error that names neither the expected version nor
 * the installed one. This runs before `expo start` and says both out loud.
 */

const path = require('node:path');

const ROOT = path.join(__dirname, '..');

function majorOf(version) {
  const match = /(\d+)/.exec(String(version));
  return match ? Number(match[1]) : null;
}

const pinned = majorOf(require(path.join(ROOT, 'package.json')).dependencies.expo);

let installed = null;
try {
  installed = majorOf(require(path.join(ROOT, 'node_modules/expo/package.json')).version);
} catch {
  // No install yet; `npm install` is about to happen anyway.
  process.exit(0);
}

if (pinned === installed) process.exit(0);

console.error(`
┌─────────────────────────────────────────────────────────────────┐
│  Your installed Expo SDK does not match this project.           │
└─────────────────────────────────────────────────────────────────┘

  package.json pins   SDK ${pinned}
  node_modules has    SDK ${installed}   <- this is the one Expo will use

Expo reads the SDK from node_modules, not package.json, so Expo Go will be
told SDK ${installed} and will refuse the project. Reinstall to fix it:

  rm -rf node_modules package-lock.json .expo
  npm install
  npx expo start -c

Then confirm with:  npx expo config --type public | grep sdkVersion
`);

process.exit(1);
