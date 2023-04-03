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

const newDevDependenciesToInstall = {};

const projectPackageJsonPath = join(process.cwd(), 'package.json');
const projectPackageJson = JSON.parse(
  readFileSync(projectPackageJsonPath, 'utf-8'),
);

const projectDependencies = projectPackageJson.dependencies || {};

if (
  // Install SafeQL dependencies in Next.js and Postgres.js projects
  ('next' in projectDependencies || 'postgres' in projectDependencies) &&
  // SafeQL currently not supported on Windows
  // https://github.com/ts-safeql/safeql/issues/80
  process.platform !== 'win32'
) {
  newDevDependenciesToInstall['@ts-safeql/eslint-plugin'] = 'latest';
  newDevDependenciesToInstall['libpg-query'] = 'latest';
}

if ('react-scripts' in projectDependencies || 'next' in projectDependencies) {
  newDevDependenciesToInstall['postcss-styled-syntax'] = 'latest';
  newDevDependenciesToInstall['stylelint'] = 'latest';
  newDevDependenciesToInstall['stylelint-config-css-modules'] = 'latest';
  newDevDependenciesToInstall['stylelint-config-recommended'] = 'latest';
  newDevDependenciesToInstall['stylelint-config-recommended-scss'] = 'latest';
}

// Add all config peerDependencies to devDependencies of
// project, upgrading existing package versions and
// sorting alphabetically
if (Object.keys(newDevDependenciesToInstall).length > 0) {
  projectPackageJson.devDependencies = Object.fromEntries(
    Object.entries({
      ...projectPackageJson.devDependencies,
      ...newDevDependenciesToInstall,
    }).sort(),
  );
}

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

console.log('Installing ESLint config dependencies...');

execSync('pnpm install', { stdio: 'inherit' });

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
    !('react-scripts' in projectDependencies || 'next' in projectDependencies)
  ) {
    continue;
  }

  const filePathInProject = join(process.cwd(), templateFileName);

  if (existsSync(filePathInProject)) {
    console.log(`Skipping update to ${templateFileName} (already exists)`);
    continue;
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

if ('next' in projectDependencies) {
  const patchesPath = join(process.cwd(), 'patches');

  // Remove previous patch files
  if (existsSync(patchesPath)) {
    const patchFiles = readdirSync(patchesPath);

    for (const patchFile of patchFiles) {
      if (patchFile.startsWith('next@')) {
        rmSync(join(patchesPath, patchFile));
      }
    }
  }

  const nextVersion = JSON.parse(
    execSync('pnpm list next --json', { encoding: 'utf-8' }),
  )[0].dependencies.next.version;

  const pnpmPatchNextEditDir = join(
    process.cwd(),
    'node_modules',
    '.upleveled-next-patch',
  );

  if (existsSync(pnpmPatchNextEditDir)) {
    rmSync(pnpmPatchNextEditDir, { recursive: true });
  }

  execSync(
    `pnpm patch next@${nextVersion} --edit-dir ${pnpmPatchNextEditDir}`,
    {
      // Discard stdout, show stderr
      stdio: ['ignore', 'ignore', 'inherit'],
    },
  );

  /**
   * @typedef {{
   *   lineNumber: number;
   *   patternName: string;
   *   pattern: RegExp;
   *   replacement: string;
   * }} Replacement
   */

  function replaceAll(
    /** @type {string} */
    filePath,
    /** @type {string} */
    content,
    /** @type {Replacement[]} */
    replacements,
  ) {
    for (const {
      lineNumber,
      patternName,
      pattern,
      replacement,
    } of replacements) {
      const match = content.match(pattern);
      if (!match) {
        throw new Error(`Pattern "${patternName}" not matched

Regex: /${pattern.source}/m
Source link: https://www.runpkg.com/?next@${nextVersion}/${filePath}#${lineNumber}`);
      }
      content = content.replace(pattern, replacement);
    }
    return content;
  }

  /**
   * @type {{
   *   filePath: string;
   *   transform: (filePath: string, content: string) => string;
   * }[]}
   */
  const transforms = [
    // Apply diff:
    // diff --git a/node_modules/next/dist/build/webpack/plugins/next-types-plugin.js b/node_modules/next/dist/build/webpack/plugins/next-types-plugin.js
    // index 9b161b5..f4914f4 100644
    // --- a/node_modules/next/dist/build/webpack/plugins/next-types-plugin.js
    // +++ b/node_modules/next/dist/build/webpack/plugins/next-types-plugin.js
    // @@ -293,7 +293,7 @@ class NextTypesPlugin {
    //          if (!this.typedRoutes) return;
    //          const isApp = filePath.startsWith(this.appDir + _path.default.sep);
    //          // Filter out non-page files in app dir
    // -        if (isApp && !/[/\\]page\.[^.]+$/.test(filePath)) {
    // +        if (isApp && !/[/\\](?:page|route)\.[^.]+$/.test(filePath)) {
    //              return;
    //          }
    //          // Filter out non-page files in pages dir
    // @@ -326,7 +326,7 @@ class NextTypesPlugin {
    //              const relativePathToApp = _path.default.relative(this.appDir, mod.resource);
    //              const relativePathToRoot = _path.default.relative(this.dir, mod.resource);
    //              if (!this.dev) {
    // -                if (IS_PAGE) {
    // +                if (IS_PAGE || /[/\\]route\.[^.]+$/.test(mod.resource)) {
    //                      this.collectPage(mod.resource);
    //                  }
    //              }
    // @@ -363,7 +363,7 @@ class NextTypesPlugin {
    //                      chunkGroup.chunks.forEach((chunk)=>{
    //                          if (!chunk.name) return;
    //                          // Here we only track page chunks.
    // -                        if (!chunk.name.startsWith("pages/") && !(chunk.name.startsWith("app/") && chunk.name.endsWith("/page"))) {
    // +                        if (!chunk.name.startsWith("pages/") && !(chunk.name.startsWith("app/") && (chunk.name.endsWith("/page") || chunk.name.endsWith("/route")))) {
    //                              return;
    //                          }
    //                          const chunkModules = compilation.chunkGraph.getChunkModulesIterable(chunk);
    {
      filePath: join(
        'dist',
        'build',
        'webpack',
        'plugins',
        'next-types-plugin.js',
      ),
      transform: (filePath, content) => {
        /** @type {Replacement[]} */
        const replacements = [
          {
            lineNumber: 295,
            patternName: 'Filter out non-page files in app dir',
            pattern:
              /^( +\/\/ Filter out non-page files in app dir\n +if \(isApp && !\/\[\/\\\\\])page(\\\.\[\^\.\]\+\$\/\.test\(filePath\)\) \{)/m,
            replacement: '$1(?:page|route)$2',
          },
          {
            lineNumber: 328,
            patternName: 'if (!this.dev), if (IS_PAGE)',
            pattern: /^( +if \(!this\.dev\) \{\n +if \(IS_PAGE)(\) \{)/m,
            replacement: '$1 || /[/\\\\]route\\.[^.]+$/.test(mod.resource)$2',
          },
          {
            lineNumber: 365,
            patternName: 'Here we only track page chunks',
            pattern:
              /^( +\/\/ Here we only track page chunks\.\n +if \(!chunk\.name\.startsWith\("pages\/"\) && !\(chunk\.name\.startsWith\("app\/"\) && )(chunk\.name\.endsWith\("\/page"\))(\)\) \{)/m,
            replacement: '$1($2 || chunk.name.endsWith("/route"))$3',
          },
        ];

        return replaceAll(filePath, content, replacements);
      },
    },

    // Apply diff:
    // diff --git a/node_modules/next/dist/client/components/layout-router.js b/node_modules/next/dist/client/components/layout-router.js
    // index 9b60a45..dd0639d 100644
    // --- a/node_modules/next/dist/client/components/layout-router.js
    // +++ b/node_modules/next/dist/client/components/layout-router.js
    // @@ -317,6 +317,7 @@ function HandleRedirect({ redirect  }) {
    //      const router = (0, _navigation).useRouter();
    //      (0, _react).useEffect(()=>{
    //          router.replace(redirect, {});
    // +        router.refresh()
    //      }, [
    //          redirect,
    //          router
    {
      filePath: join('dist', 'client', 'components', 'layout-router.js'),
      transform: (filePath, content) => {
        /** @type {Replacement[]} */
        const replacements = [
          {
            lineNumber: 318,
            patternName: 'useEffect, router.replace()',
            pattern:
              /^( +\(0, _react\)\.useEffect\(\(\)=>\{\n)( +)(router\.replace\(redirect, \{\}\);\n)( +\}, \[)/m,
            replacement: '$1$2$3$2router.refresh();\n$4',
          },
        ];

        return replaceAll(filePath, content, replacements);
      },
    },

    // Apply diff:
    // diff --git a/node_modules/next/dist/client/link.js b/node_modules/next/dist/client/link.js
    // index d15ce7f..369e036 100644
    // --- a/node_modules/next/dist/client/link.js
    // +++ b/node_modules/next/dist/client/link.js
    // @@ -83,6 +83,7 @@ function linkClicked(e, router, href, as, replace, shallow, scroll, locale, isAp
    //      if (isAppRouter) {
    //          // @ts-expect-error startTransition exists.
    //          _react.default.startTransition(navigate);
    // +        router.refresh()
    //      } else {
    //          navigate();
    //      }
    {
      filePath: join('dist', 'client', 'link.js'),
      transform: (filePath, content) => {
        /** @type {Replacement[]} */
        const replacements = [
          {
            lineNumber: 85,
            patternName: 'isAppRouter, _react.default.startTransition()',
            pattern:
              /^( +)(_react\.default\.startTransition\(navigate\);\n)( +\} else \{)/m,
            replacement: `$1$2$1router.refresh();\n$3`,
          },
        ];

        return replaceAll(filePath, content, replacements);
      },
    },

    // Apply diff:
    // diff --git a/node_modules/next/dist/server/web/spec-extension/response.d.ts b/node_modules/next/dist/server/web/spec-extension/response.d.ts
    // index 268f52b..6ef065b 100644
    // --- a/node_modules/next/dist/server/web/spec-extension/response.d.ts
    // +++ b/node_modules/next/dist/server/web/spec-extension/response.d.ts
    // @@ -2,14 +2,15 @@ import type { I18NConfig } from '../../config-shared';
    //  import { NextURL } from '../next-url';
    //  import { ResponseCookies } from './cookies';
    //  declare const INTERNALS: unique symbol;
    // -export declare class NextResponse extends Response {
    // +export declare class NextResponse<B = void> extends Response {
    //      [INTERNALS]: {
    //          cookies: ResponseCookies;
    //          url?: NextURL;
    // +        B: B
    //      };
    //      constructor(body?: BodyInit | null, init?: ResponseInit);
    //      get cookies(): ResponseCookies;
    // -    static json(body: any, init?: ResponseInit): NextResponse;
    // +    static json<T>(body: T, init?: ResponseInit): NextResponse<T>;
    //      static redirect(url: string | NextURL | URL, init?: number | ResponseInit): NextResponse;
    //      static rewrite(destination: string | NextURL | URL, init?: MiddlewareResponseInit): NextResponse;
    //      static next(init?: MiddlewareResponseInit): NextResponse;
    {
      filePath: join(
        'dist',
        'server',
        'web',
        'spec-extension',
        'response.d.ts',
      ),
      transform: (filePath, content) => {
        /** @type {Replacement[]} */
        const replacements = [
          {
            lineNumber: 5,
            patternName: 'export declare class NextResponse',
            pattern:
              /^(export declare class NextResponse)( extends Response \{\n)/m,
            replacement: `$1<B = void>$2`,
          },
          {
            lineNumber: 6,
            patternName: 'NextResponse[INTERNALS]',
            pattern:
              /^( +\[INTERNALS\]: \{\n)( +)(cookies: ResponseCookies;\n)( +url\?: NextURL;\n)( +\};\n)/m,
            replacement: `$1$2$3$4$2B: B;\n$5`,
          },
          {
            lineNumber: 12,
            patternName: 'NextResponse.json()',
            pattern:
              /^( +static json)(\(body: )any(, init\?: ResponseInit\): NextResponse)(;)/m,
            replacement: `$1<T>$2T$3<T>$4`,
          },
        ];

        return replaceAll(filePath, content, replacements);
      },
    },
  ];

  for (const { filePath: relativeFilePath, transform } of transforms) {
    const filePath = join(pnpmPatchNextEditDir, relativeFilePath);
    console.log(`Patching node_modules/next/${relativeFilePath}...`);
    writeFileSync(
      filePath,
      transform(relativeFilePath, readFileSync(filePath, 'utf8')),
    );
  }

  execSync(`pnpm patch-commit ${pnpmPatchNextEditDir}`, {
    // Discard stdout, show stderr
    stdio: ['ignore', 'ignore', 'inherit'],
  });

  rmSync(pnpmPatchNextEditDir, { recursive: true });
  console.log('✅ Done patching Next.js');
}
