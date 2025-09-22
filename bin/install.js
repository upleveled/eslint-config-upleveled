#!/usr/bin/env node

import { execSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import isPlainObject from 'is-plain-obj';
import sortPackageJson from 'sort-package-json';

const projectPackageJsonPath = join(process.cwd(), 'package.json');
const projectPackageJson = JSON.parse(
  readFileSync(projectPackageJsonPath, 'utf-8'),
);

if (!isPlainObject(projectPackageJson)) {
  throw new Error('package.json contains non-object');
}

/** @type {Record<string, string>} */
const projectDependencies = projectPackageJson.dependencies || {};
/** @type {Record<string, string>} */
const projectDevDependencies = projectPackageJson.devDependencies || {};

const [projectType, projectTypeTitle] =
  'postgres' in projectDependencies && 'next' in projectDependencies
    ? ['next-js-postgresql', 'Next.js with PostgreSQL']
    : 'postgres' in projectDependencies && 'expo' in projectDependencies
      ? ['expo-postgresql', 'Expo with PostgreSQL']
      : 'next' in projectDependencies
        ? ['next-js', 'Next.js']
        : 'expo' in projectDependencies
          ? ['expo', 'Expo (React Native)']
          : '@upleveled/react-scripts' in projectDependencies
            ? ['create-react-app', 'Create React App']
            : ['node-js', 'Node.js'];

console.log(`Detected project type: ${projectTypeTitle}`);

// Commented out in case we need to patch Next.js again in the
// future
// ```
// if ('next' in projectDependencies) {
//   // Remove previous patches in package.json
//   if (projectPackageJson?.pnpm?.patchedDependencies) {
//     projectPackageJson.pnpm.patchedDependencies = Object.fromEntries(
//       Object.entries(projectPackageJson.pnpm.patchedDependencies).filter(
//         ([packageName]) => !packageName.startsWith('next@'),
//       ),
//     );
//   }
// }
// ```

// Set "type": "module" in package.json for support of ESM syntax
// in eslint.config.js
//
// ESLint does not support other ways of specifying that the
// config file is ESM such as an .mjs extension:
// https://github.com/eslint/eslint/issues/13440
// https://github.com/eslint/eslint/issues/16580
if (projectPackageJson.type !== 'module') {
  console.log('Setting "type": "module" in package.json...');
  projectPackageJson.type = 'module';

  writeFileSync(
    projectPackageJsonPath,
    JSON.stringify(sortPackageJson(projectPackageJson), null, 2) + '\n',
  );
}

const newDevDependenciesToInstall = [
  // Add types for any usage of Node.js built-in modules
  //
  // To avoid confusing problems like eg.
  // `@typescript-eslint/restrict-template-expressions` errors in
  // Node.js projects with `any` type of `argv` imported from
  // `node:process`
  // https://typescript-eslint.io/rules/restrict-template-expressions/
  '@types/node',

  // Install `eslint` at top level to avoid pnpm "Conflicting
  // peer dependencies" error with mismatching transitive
  // dependencies on `eslint`, eg:
  //
  // ```
  // mkdir abc
  // cd abc
  // pnpm init
  // ...
  // pnpm add --save-dev @ts-safeql/eslint-plugin eslint-config-upleveled
  // ...
  // devDependencies:
  // + @ts-safeql/eslint-plugin 3.4.1
  // + eslint-config-upleveled 8.6.16
  //
  //  WARN  Issues with peer dependencies found
  // .
  // ├─┬ eslint-plugin-import-x 4.1.1
  // │ ├── ✕ missing peer eslint@"^8.57.0 || ^9.0.0"
  // │ └─┬ @typescript-eslint/utils 8.4.0
  // │   ├── ✕ missing peer eslint@"^8.57.0 || ^9.0.0"
  // │   └─┬ @eslint-community/eslint-utils 4.4.0
  // │     └── ✕ missing peer eslint@"^6.0.0 || ^7.0.0 || >=8.0.0"
  // ├─┬ @typescript-eslint/parser 8.3.0
  // │ └── ✕ missing peer eslint@"^8.57.0 || ^9.0.0"
  // ├─┬ @ts-safeql/eslint-plugin 3.4.1
  // │ └─┬ @typescript-eslint/utils 7.18.0
  // │   └── ✕ missing peer eslint@^8.56.0
  // └─┬ eslint-config-upleveled 8.6.16
  //   ├── ✕ missing peer eslint@^9.9.1
  //   ├─┬ eslint-import-resolver-typescript 3.6.3
  //   │ ├── ✕ missing peer eslint@"*"
  //   │ └─┬ eslint-module-utils 2.11.0
  //   │   └── ✕ missing peer eslint@"*"
  //   ├─┬ @babel/eslint-parser 7.25.1
  //   │ └── ✕ missing peer eslint@"^7.5.0 || ^8.0.0 || ^9.0.0"
  //   ├─┬ eslint-config-flat-gitignore 0.3.0
  //   │ └── ✕ missing peer eslint@^9.5.0
  //   ├─┬ eslint-plugin-react 7.35.0
  //   │ └── ✕ missing peer eslint@"^3 || ^4 || ^5 || ^6 || ^7 || ^8 || ^9.7"
  //   ├─┬ eslint-plugin-jsx-a11y 6.9.0
  //   │ └── ✕ missing peer eslint@"^3 || ^4 || ^5 || ^6 || ^7 || ^8"
  //   ├─┬ eslint-plugin-sonarjs 1.0.4
  //   │ └── ✕ missing peer eslint@"^8.0.0 || ^9.0.0"
  //   ├─┬ eslint-plugin-testing-library 6.3.0
  //   │ ├── ✕ missing peer eslint@"^7.5.0 || ^8.0.0"
  //   │ └─┬ @typescript-eslint/utils 5.62.0
  //   │   └── ✕ missing peer eslint@"^6.0.0 || ^7.0.0 || ^8.0.0"
  //   ├─┬ eslint-plugin-unicorn 55.0.0
  //   │ └── ✕ missing peer eslint@>=8.56.0
  //   ├─┬ eslint-plugin-upleveled 2.1.12
  //   │ └── ✕ missing peer eslint@^9.3.0
  //   ├─┬ eslint-plugin-react-hooks 4.6.2
  //   │ └── ✕ missing peer eslint@"^3.0.0 || ^4.0.0 || ^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0-0"
  //   └─┬ @typescript-eslint/eslint-plugin 8.3.0
  //     ├── ✕ missing peer eslint@"^8.57.0 || ^9.0.0"
  //     └─┬ @typescript-eslint/utils 8.3.0
  //       └── ✕ missing peer eslint@"^8.57.0 || ^9.0.0"
  // ✕ Conflicting peer dependencies:
  //   eslint
  //
  // Done in 26.4s
  // ```
  //
  // - https://github.com/upleveled/eslint-config-upleveled/pull/421
  // - https://github.com/ts-safeql/safeql/issues/258
  'eslint',

  // The VS Code Prettier extension uses Prettier v2 internally,
  // but Preflight uses the latest Prettier version, which causes
  // crashes and formatting conflicts:
  // https://github.com/prettier/prettier-vscode/pull/3069#issuecomment-1817589047
  // https://github.com/prettier/prettier-vscode/issues/3298
  // https://github.com/upleveled/preflight/issues/429
  'prettier',

  // pnpm v8+ automatically installs peer dependencies
  // (auto-install-peers=true is default) and `typescript` is a
  // peer dependency of eslint-config-upleveled, but the
  // dependencies and their bins are not hoisted, which makes
  // ESLint (and potentially other tooling) fail to resolve
  // TypeScript
  //
  // Similar issue with `stylelint` here:
  // https://github.com/stylelint/stylelint/issues/6781#issuecomment-1506751686
  // https://github.com/pnpm/pnpm/issues/6392
  'typescript',
];

// Install Prettier and SafeQL dependencies in Postgres.js
// projects
if (projectType === 'next-js-postgresql' || projectType === 'expo-postgresql') {
  newDevDependenciesToInstall.push(
    '@ts-safeql/eslint-plugin',
    'libpg-query',
    'prettier-plugin-embed',
    'prettier-plugin-sql',
  );
}

if (
  projectType === 'create-react-app' ||
  projectType === 'next-js' ||
  projectType === 'next-js-postgresql'
) {
  newDevDependenciesToInstall.push(
    '@types/react',
    '@types/react-dom',
    'stylelint',
    'stylelint-config-upleveled',
  );
}

for (const projectDevDependency of Object.keys(projectDevDependencies)) {
  if (newDevDependenciesToInstall.includes(projectDevDependency)) {
    newDevDependenciesToInstall.splice(
      newDevDependenciesToInstall.indexOf(projectDevDependency),
      1,
    );
  }
}

if (newDevDependenciesToInstall.length > 0) {
  console.log(
    `Installing ${newDevDependenciesToInstall.length} ESLint config ${
      newDevDependenciesToInstall.length === 1 ? 'dependency' : 'dependencies'
    }: ${newDevDependenciesToInstall.join(', ')}`,
  );
}

execSync(
  newDevDependenciesToInstall.length > 0
    ? `pnpm add --save-dev ${newDevDependenciesToInstall.join(' ')}`
    : 'pnpm install',
  { stdio: 'inherit' },
);

console.log('✅ Done installing dependencies');

console.log('Copying config files...');

const templatePath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'templates',
  projectType,
);

const templateFileNamesAndPaths =
  /** @type {{name: string, path: string}[]} */ (
    readdirSync(templatePath, { withFileTypes: true }).flatMap(
      (templateFileOrDirectory) => {
        // TODO: Add support for multiple level of nesting in
        // directories
        if (templateFileOrDirectory.isDirectory()) {
          const directoryPathInProject = join(
            process.cwd(),
            templateFileOrDirectory.name,
          );

          if (!existsSync(directoryPathInProject)) {
            mkdirSync(directoryPathInProject);
          }

          const directoryPath = join(
            templatePath,
            templateFileOrDirectory.name,
          );
          return readdirSync(directoryPath).map((nameInDirectory) => ({
            name: join(templateFileOrDirectory.name, nameInDirectory),
            path: join(directoryPath, nameInDirectory),
          }));
        }

        return {
          name: templateFileOrDirectory.name,
          path: join(templatePath, templateFileOrDirectory.name),
        };
      },
    )
  );

for (const {
  name: templateFileName,
  path: templateFilePath,
} of templateFileNamesAndPaths) {
  const filePathInProject = join(process.cwd(), templateFileName);

  let overwriteExistingFile = false;

  if (existsSync(filePathInProject)) {
    // Always overwrite prettier.config.js in Postgres.js
    // projects
    if (
      templateFileName === 'prettier.config.js' &&
      (projectType === 'next-js-postgresql' ||
        projectType === 'expo-postgresql')
    ) {
      overwriteExistingFile = true;
    }

    // Always overwrite tsconfig.json
    if (templateFileName === 'tsconfig.json') {
      overwriteExistingFile = true;
    }

    if (!overwriteExistingFile) {
      console.log(`Skipping copy of ${templateFileName} (file already exists)`);
      continue;
    }
  }

  try {
    cpSync(templateFilePath, filePathInProject);
    console.log(
      `Copied ${templateFileName}${
        overwriteExistingFile ? ' (existing file overwritten)' : ''
      }`,
    );
  } catch (err) {
    console.error('err', err);
  }
}

console.log('✅ Done copying config files');

try {
  if (
    (projectType === 'next-js' || projectType === 'next-js-postgresql') &&
    readFileSync(join(process.cwd(), 'jsconfig.json'), 'utf-8').trim() ===
      `{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}`
  ) {
    rmSync(join(process.cwd(), 'jsconfig.json'));
    console.log('✅ Done removing default Next.js jsconfig.json config');
  }
} catch {
  // Swallow error if jsconfig.json file does not exist
}

const gitignorePath = join(process.cwd(), '.gitignore');

/** @type {string[]} */
let gitignoreContentLines = [];

try {
  gitignoreContentLines = readFileSync(gitignorePath, 'utf-8').split('\n');
} catch {
  // Swallow error in case .gitignore doesn't exist yet
}

let gitignoreChanged = false;

for (const ignorePath of ['.eslintcache', '*.tsbuildinfo']) {
  if (gitignoreContentLines.includes(ignorePath)) {
    continue;
  }

  gitignoreContentLines.push(ignorePath);
  gitignoreChanged = true;
}

if (gitignoreChanged) {
  console.log('Updating .gitignore...');
  writeFileSync(
    gitignorePath,
    gitignoreContentLines.join('\n') +
      // Add trailing newline if last line is not empty
      (gitignoreContentLines.at(-1) === '' ? '' : '\n'),
  );
  console.log('✅ Done updating .gitignore');
}

const pnpmWorkspaceYamlPath = join(process.cwd(), 'pnpm-workspace.yaml');

/** @type {string[]} */
let pnpmWorkspaceYamlContentLines = [];

try {
  pnpmWorkspaceYamlContentLines = readFileSync(
    pnpmWorkspaceYamlPath,
    'utf-8',
  ).split('\n');
} catch {
  // Swallow error in case pnpm-workspace.yaml doesn't exist yet
}

if (!pnpmWorkspaceYamlContentLines.includes('strict-dep-builds=true')) {
  console.log('Updating pnpm-workspace.yaml...');
  pnpmWorkspaceYamlContentLines.push(`# Prevents installation of packages newer than 7 days
# to mitigate supply chain security risks
# - https://pnpm.io/settings#minimumreleaseage
minimumReleaseAge: 10080
minimumReleaseAgeExclude:
  - '@upleveled/*'
  - eslint-config-upleveled
  - stylelint-config-upleveled

# Fail on pnpm ignored build scripts
# - https://pnpm.io/settings#strictdepbuilds
strictDepBuilds: true`);
  writeFileSync(
    pnpmWorkspaceYamlPath,
    pnpmWorkspaceYamlContentLines.join('\n') +
      // Add trailing newline if last line is not empty
      (pnpmWorkspaceYamlContentLines.at(-1) === '' ? '' : '\n'),
  );
  console.log('✅ Done updating pnpm-workspace.yaml');
}

// Commented out in case we need to patch Next.js again in the
// future
// ```
// if (projectType === 'next-js' || projectType === 'next-js-postgresql') {
//   const patchesPath = join(process.cwd(), 'patches');
//
//   // Remove previous patch files
//   if (existsSync(patchesPath)) {
//     const patchFiles = readdirSync(patchesPath);
//
//     for (const patchFile of patchFiles) {
//       if (patchFile.startsWith('next@')) {
//         rmSync(join(patchesPath, patchFile));
//       }
//     }
//   }
//
//   const nextVersion = JSON.parse(
//     execSync('pnpm list next --json', { encoding: 'utf-8' }),
//   )[0].dependencies.next.version;
//
//   const pnpmPatchNextEditDir = join(
//     process.cwd(),
//     'node_modules',
//     '.upleveled-next-patch',
//   );
//
//   if (existsSync(pnpmPatchNextEditDir)) {
//     rmSync(pnpmPatchNextEditDir, { recursive: true });
//   }
//
//   execSync(
//     `pnpm patch next@${nextVersion} --edit-dir ${pnpmPatchNextEditDir}`,
//     {
//       // Discard stdout, show stderr
//       stdio: ['ignore', 'ignore', 'inherit'],
//     },
//   );
//
//   /**
//    * @typedef {{
//    *   lineNumber: number;
//    *   patternName: string;
//    *   pattern: RegExp;
//    *   replacement: string;
//    * }} Replacement
//    */
//
//   function replaceAll(
//     /** @type {string} */
//     filePath,
//     /** @type {string} */
//     content,
//     /** @type {Replacement[]} */
//     replacements,
//   ) {
//     for (const {
//       lineNumber,
//       patternName,
//       pattern,
//       replacement,
//     } of replacements) {
//       const match = content.match(pattern);
//       if (!match) {
//         throw new Error(`Pattern "${patternName}" not matched
//
// Regex: /${pattern.source}/m
// Source link: https://www.runpkg.com/?next@${nextVersion}/${filePath}#${lineNumber}`);
//       }
//       content = content.replace(pattern, replacement);
//     }
//     return content;
//   }
//
//   /**
//    * @type {{
//    *   filePath: string;
//    *   transform: (filePath: string, content: string) => string;
//    * }[]}
//    */
//   const transforms = [
//     // Apply diff:
//     // diff --git a/node_modules/next/dist/client/components/layout-router.js b/node_modules/next/dist/client/components/layout-router.js
//     // index 9b60a45..dd0639d 100644
//     // --- a/node_modules/next/dist/client/components/layout-router.js
//     // +++ b/node_modules/next/dist/client/components/layout-router.js
//     // @@ -317,6 +317,7 @@ function HandleRedirect({ redirect  }) {
//     //      const router = (0, _navigation).useRouter();
//     //      (0, _react).useEffect(()=>{
//     //          router.replace(redirect, {});
//     // +        router.refresh()
//     //      }, [
//     //          redirect,
//     //          router
//     {
//       filePath: join('dist', 'client', 'components', 'layout-router.js'),
//       transform: (filePath, content) => {
//         /** @type {Replacement[]} */
//         const replacements = [
//           {
//             lineNumber: 318,
//             patternName: 'useEffect, router.replace()',
//             pattern:
//               /^( +\(0, _react\)\.useEffect\(\(\)=>\{\n)( +)(router\.replace\(redirect, \{\}\);\n)( +\}, \[)/m,
//             replacement: '$1$2$3$2router.refresh();\n$4',
//           },
//         ];
//
//         return replaceAll(filePath, content, replacements);
//       },
//     },
//
//     // Apply diff:
//     // diff --git a/node_modules/next/dist/client/link.js b/node_modules/next/dist/client/link.js
//     // index d15ce7f..369e036 100644
//     // --- a/node_modules/next/dist/client/link.js
//     // +++ b/node_modules/next/dist/client/link.js
//     // @@ -83,6 +83,7 @@ function linkClicked(e, router, href, as, replace, shallow, scroll, locale, isAp
//     //      if (isAppRouter) {
//     //          // @ts-expect-error startTransition exists.
//     //          _react.default.startTransition(navigate);
//     // +        router.refresh()
//     //      } else {
//     //          navigate();
//     //      }
//     {
//       filePath: join('dist', 'client', 'link.js'),
//       transform: (filePath, content) => {
//         /** @type {Replacement[]} */
//         const replacements = [
//           {
//             lineNumber: 85,
//             patternName: 'isAppRouter, _react.default.startTransition()',
//             pattern:
//               /^( +)(_react\.default\.startTransition\(navigate\);\n)( +\} else \{)/m,
//             replacement: `$1$2$1router.refresh();\n$3`,
//           },
//         ];
//
//         return replaceAll(filePath, content, replacements);
//       },
//     },
//   ];
//
//   for (const { filePath: relativeFilePath, transform } of transforms) {
//     const filePath = join(pnpmPatchNextEditDir, relativeFilePath);
//     console.log(`Patching node_modules/next/${relativeFilePath}...`);
//     writeFileSync(
//       filePath,
//       transform(relativeFilePath, readFileSync(filePath, 'utf8')),
//     );
//   }
//
//   console.log('Generating patch...');
//
//   execSync(`pnpm patch-commit ${pnpmPatchNextEditDir}`, {
//     // Show stdout stderr
//     stdio: ['ignore', 'inherit', 'inherit'],
//   });
//
//   rmSync(pnpmPatchNextEditDir, { recursive: true });
//   console.log('✅ Done patching Next.js');
// }
// ```
