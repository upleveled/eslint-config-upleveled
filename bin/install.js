#!/usr/bin/env node

import { execSync } from 'node:child_process';
import {
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import eslintConfigPackageJson from '../package.json' assert { type: 'json' };

const eslintConfigDirectory = dirname(fileURLToPath(import.meta.url));

const eslintConfigPeerDependencies =
  /** @type {Partial<typeof packageJson.peerDependencies>} */ (
    eslintConfigPackageJson.peerDependencies
  );

const packageJsonPath = join(process.cwd(), 'package.json');
const packageJson = {
  ...(
    await import(
      relative(eslintConfigDirectory, packageJsonPath).replaceAll('\\', '/'),
      { assert: { type: 'json' } }
    )
  ).default,
};

// SafeQL currently not supported on Windows
// https://github.com/ts-safeql/safeql/issues/80
if (process.platform === 'win32') {
  delete eslintConfigPeerDependencies['@ts-safeql/eslint-plugin'];
  delete eslintConfigPeerDependencies['libpg-query'];
}

// Add all config peerDependencies to devDependencies of
// project, upgrading existing package versions and
// sorting alphabetically
packageJson.devDependencies = Object.fromEntries(
  Object.entries({
    ...packageJson.devDependencies,
    ...eslintConfigPeerDependencies,
  }).sort(),
);

packageJson.resolutions = {
  ...packageJson.resolutions,
  // Force installation of the "dependencies" version of these
  // ESLint dependencies to avoid conflicting version numbers
  // between `eslint-config-react-app` and
  // `@upleveled/eslint-config-upleveled` (they use the same
  // ESLint dependencies, but may have slightly different
  // versions).
  //
  // These conflicts can result in ESLint errors like:
  //
  // ESLint couldn't determine the plugin "import" uniquely.
  //
  // - /home/runner/work/preflight/preflight/node_modules/eslint-plugin-import/lib/index.js (loaded in ".eslintrc.cjs » @upleveled/eslint-config-upleveled")
  // - /home/runner/work/preflight/preflight/node_modules/eslint-config-react-app/node_modules/eslint-plugin-import/lib/index.js (loaded in ".eslintrc.cjs » @upleveled/eslint-config-upleveled » eslint-config-react-app")
  ...[
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser',
    'eslint-plugin-import',
    'eslint-plugin-jest',
    'eslint-plugin-jsx-a11y',
    'eslint-plugin-react',
    'eslint-plugin-react-hooks',
  ].reduce(
    (resolutions, packageName) => ({
      ...resolutions,
      [packageName]: packageJson.devDependencies[packageName],
    }),
    {},
  ),
  '@typescript-eslint/utils':
    packageJson.devDependencies['@typescript-eslint/parser'],
};

writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log('Installing ESLint config dependencies...');

execSync('yarn install', { stdio: 'inherit' });

console.log('✅ Done installing dependencies');

console.log('Writing config files...');

const templatePath = resolve(eslintConfigDirectory, '..', 'templates');

const templateFileNamesAndPaths = /** @type {[string, string][]} */ (
  readdirSync(templatePath).map((name) => [name, join(templatePath, name)])
);

for (const [templateFileName, templateFilePath] of templateFileNamesAndPaths) {
  const destinationFilePath = join(process.cwd(), templateFileName);

  if (existsSync(destinationFilePath)) {
    console.log(`Skipping update to ${templateFileName} (already exists)`);
    continue;
  }

  try {
    writeFileSync(destinationFilePath, readFileSync(templateFilePath, 'utf-8'));
    console.log(`Wrote ${templateFileName}`);
  } catch (err) {
    console.error('err', err);
  }
}

console.log('✅ Done updating config files');

console.log('Updating .gitignore...');

const gitignorePath = join(process.cwd(), '.gitignore');

/** @type {string[]} */
let gitignoreContentLines = [];

try {
  gitignoreContentLines = readFileSync(gitignorePath, 'utf-8').split('\n');
} catch (err) {
  // Swallow error in case .gitignore doesn't exist yet
}

for (const ignorePath of ['.eslintcache', '*.tsbuildinfo']) {
  if (gitignoreContentLines.includes(ignorePath)) {
    continue;
  }

  gitignoreContentLines.push(ignorePath);
}

writeFileSync(
  gitignorePath,
  gitignoreContentLines.join('\n') +
    // Add trailing newline if last line is not empty
    (gitignoreContentLines.at(-1) === '' ? '' : '\n'),
);

console.log('✅ Done updating .gitignore');

try {
  if (
    readFileSync(join(process.cwd(), '.eslintrc.json'), 'utf-8').trim() ===
    `{
  "extends": "next/core-web-vitals"
}`
  ) {
    rmSync(join(process.cwd(), '.eslintrc.json'));
    console.log('Removed default Next.js ESLint config');
  }
} catch (err) {
  // Swallow error if .eslintrc.json file does not exist
}
