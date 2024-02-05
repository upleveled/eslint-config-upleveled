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
import sortPackageJson from 'sort-package-json';

const projectPackageJsonPath = join(process.cwd(), 'package.json');
const projectPackageJson = JSON.parse(
  readFileSync(projectPackageJsonPath, 'utf-8'),
);

const projectDependencies = projectPackageJson.dependencies || {};
const projectDevDependencies = projectPackageJson.devDependencies || {};

const [projectType, projectTypeTitle] =
  'postgres' in projectDependencies
    ? ['next-js-postgresql', 'Next.js with PostgreSQL']
    : 'next' in projectDependencies
    ? ['next-js', 'Next.js']
    : '@upleveled/react-scripts' in projectDependencies
    ? ['create-react-app', 'Create React App']
    : 'expo' in projectDependencies
    ? ['expo', 'Expo (React Native)']
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
if (projectType === 'next-js-postgresql') {
  newDevDependenciesToInstall.push(
    'prettier-plugin-embed',
    'prettier-plugin-sql',
  );

  if (
    // SafeQL currently not supported on Windows
    // https://github.com/ts-safeql/safeql/issues/80
    process.platform !== 'win32'
  ) {
    newDevDependenciesToInstall.push('@ts-safeql/eslint-plugin', 'libpg-query');
  }
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

console.log(
  `Installing ${newDevDependenciesToInstall.length} ESLint config ${
    newDevDependenciesToInstall.length === 1 ? 'dependency' : 'dependencies'
  }...`,
);

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
      projectType === 'next-js-postgresql'
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
} catch (err) {
  // Swallow error if jsconfig.json file does not exist
}

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
