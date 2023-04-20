#!/usr/bin/env node

import { execSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectPackageJsonPath = join(process.cwd(), 'package.json');
const projectPackageJson = JSON.parse(
  readFileSync(projectPackageJsonPath, 'utf-8'),
);

const projectDependencies = projectPackageJson.dependencies || {};
const projectDevDependencies = projectPackageJson.devDependencies || {};

if ('next' in projectDependencies) {
  // Remove previous patches in package.json
  if (projectPackageJson?.pnpm?.patchedDependencies) {
    projectPackageJson.pnpm.patchedDependencies = Object.fromEntries(
      Object.entries(projectPackageJson.pnpm.patchedDependencies).filter(
        ([packageName]) => !packageName.startsWith('next@'),
      ),
    );
  }
}

writeFileSync(
  projectPackageJsonPath,
  JSON.stringify(projectPackageJson, null, 2) + '\n',
);

const newDevDependenciesToInstall = [
  // pnpm v8+ automatically installs peer dependencies (auto-install-peers=true
  // is default) and `typescript` is a peer dependency of eslint-config-upleveled,
  // but the dependencies and their bins are not hoisted, which makes ESLint (and
  // potentially other tooling) fail to resolve TypeScript
  //
  // Similar issue with `stylelint` here:
  // https://github.com/stylelint/stylelint/issues/6781#issuecomment-1506751686
  // https://github.com/pnpm/pnpm/issues/6392
  'typescript',
];

if (
  // Install SafeQL dependencies in Next.js and Postgres.js projects
  ('next' in projectDependencies || 'postgres' in projectDependencies) &&
  // SafeQL currently not supported on Windows
  // https://github.com/ts-safeql/safeql/issues/80
  process.platform !== 'win32'
) {
  newDevDependenciesToInstall.push('@ts-safeql/eslint-plugin', 'libpg-query');
}

if (
  '@upleveled/react-scripts' in projectDependencies ||
  'next' in projectDependencies
) {
  newDevDependenciesToInstall.push('stylelint', 'stylelint-config-upleveled');
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
  `Installing ${newDevDependenciesToInstall.length} ESLint config dependencies...`,
);

execSync(
  newDevDependenciesToInstall.length > 0
    ? `pnpm add --save-dev ${newDevDependenciesToInstall.join(' ')}`
    : 'pnpm install',
  { stdio: 'inherit' },
);

console.log('✅ Done installing dependencies');

console.log('Writing config files...');

const templatePath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'templates',
);

const templateFileNamesAndPaths =
  /** @type {{name: string, path: string}[]} */ (
    readdirSync(templatePath, { withFileTypes: true }).flatMap(
      (templateFileOrDirectory) => {
        // TODO: Add support for multiple level of nesting in directories
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
  // Don't copy Stylelint config for non-React / non-Next.js projects
  if (
    templateFileName === 'stylelint.config.cjs' &&
    !(
      '@upleveled/react-scripts' in projectDependencies ||
      'next' in projectDependencies
    )
  ) {
    continue;
  }

  const filePathInProject = join(process.cwd(), templateFileName);

  if (existsSync(filePathInProject)) {
    let skip = true;

    if (templateFileName === 'tsconfig.json') {
      const projectTsconfigJson = JSON.parse(
        readFileSync(join(process.cwd(), 'tsconfig.json'), 'utf-8'),
      );

      if ('plugins' in (projectTsconfigJson.compilerOptions || {})) {
        skip = false;
      }
    }

    if (skip) {
      console.log(`Skipping update to ${templateFileName} (already exists)`);
      continue;
    }
  }

  try {
    writeFileSync(filePathInProject, readFileSync(templateFilePath, 'utf-8'));
    console.log(`Wrote ${templateFileName}`);
  } catch (err) {
    console.error('err', err);
  }
}

console.log('✅ Done updating config files');

try {
  if (
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

// if ('next' in projectDependencies) {
//   const patchesPath = join(process.cwd(), 'patches');

//   // Remove previous patch files
//   if (existsSync(patchesPath)) {
//     const patchFiles = readdirSync(patchesPath);

//     for (const patchFile of patchFiles) {
//       if (patchFile.startsWith('next@')) {
//         rmSync(join(patchesPath, patchFile));
//       }
//     }
//   }

//   const nextVersion = JSON.parse(
//     execSync('pnpm list next --json', { encoding: 'utf-8' }),
//   )[0].dependencies.next.version;

//   const pnpmPatchNextEditDir = join(
//     process.cwd(),
//     'node_modules',
//     '.upleveled-next-patch',
//   );

//   if (existsSync(pnpmPatchNextEditDir)) {
//     rmSync(pnpmPatchNextEditDir, { recursive: true });
//   }

//   execSync(
//     `pnpm patch next@${nextVersion} --edit-dir ${pnpmPatchNextEditDir}`,
//     {
//       // Discard stdout, show stderr
//       stdio: ['ignore', 'ignore', 'inherit'],
//     },
//   );

//   /**
//    * @typedef {{
//    *   lineNumber: number;
//    *   patternName: string;
//    *   pattern: RegExp;
//    *   replacement: string;
//    * }} Replacement
//    */

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

// Regex: /${pattern.source}/m
// Source link: https://www.runpkg.com/?next@${nextVersion}/${filePath}#${lineNumber}`);
//       }
//       content = content.replace(pattern, replacement);
//     }
//     return content;
//   }

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

//         return replaceAll(filePath, content, replacements);
//       },
//     },

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

//         return replaceAll(filePath, content, replacements);
//       },
//     },
//   ];

//   for (const { filePath: relativeFilePath, transform } of transforms) {
//     const filePath = join(pnpmPatchNextEditDir, relativeFilePath);
//     console.log(`Patching node_modules/next/${relativeFilePath}...`);
//     writeFileSync(
//       filePath,
//       transform(relativeFilePath, readFileSync(filePath, 'utf8')),
//     );
//   }

//   console.log('Generating patch...');

//   execSync(`pnpm patch-commit ${pnpmPatchNextEditDir}`, {
//     // Show stdout stderr
//     stdio: ['ignore', 'inherit', 'inherit'],
//   });

//   rmSync(pnpmPatchNextEditDir, { recursive: true });
//   console.log('✅ Done patching Next.js');
// }
