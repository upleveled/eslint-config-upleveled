// Enable Expo non-default options for performance and consistency:
//
// 1. Convert app.json to app.config.ts for consistent TS language and dynamic config
//    - https://docs.expo.dev/workflow/configuration/#dynamic-configuration
//
//    TODO: Remove this if `create-expo-app` generates `app.config.ts` in future
//    - https://github.com/expo/expo/issues/34357
// 2. .env.development, .env.production, eas.json - Enable the new Metro resolver available starting in Expo SDK 51
//    - https://github.com/EvanBacon/pillar-valley/commit/ede321ef7addc67e4047624aedb3e92af3cb5060
//    - https://archive.ph/MG03E
//
// TODO: Remove when Expo enables New Architecture and new Metro resolver by default
import { exec } from 'node:child_process';
import { readFile, unlink, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import isPlainObject from 'is-plain-obj';

const appFilePath = 'app.json';
const appJson = JSON.parse(await readFile(appFilePath, 'utf8'));

if (!isPlainObject(appJson) || !isPlainObject(appJson.expo)) {
  throw new Error(
    'app.json either contains non-object or contains object without .expo property',
  );
}

const expoConfig = `import { ExpoConfig } from "expo/config";

const config: ExpoConfig = ${JSON.stringify(appJson.expo, null, 2)};

export default config;`.trim();

await writeFile('app.config.ts', expoConfig, 'utf8');
console.log('✅ Converted app.json to app.config.ts');

await promisify(exec)('npx prettier --write app.config.ts');
console.log('✅ Formatted app.config.ts with Prettier');

await unlink(appFilePath);
console.log('✅ Deleted app.json');

await writeFile('.env.development', 'EXPO_USE_FAST_RESOLVER=1', 'utf8');
console.log('✅ Enabled new Metro resolver in .env.development');
await writeFile('.env.production', 'EXPO_USE_FAST_RESOLVER=1', 'utf8');
console.log('✅ Enabled new Metro resolver in .env.production');

const easFilePath = 'eas.json';
const easJson = JSON.parse(await readFile(easFilePath, 'utf8'));

if (
  !isPlainObject(easJson) ||
  !isPlainObject(easJson.build) ||
  !isPlainObject(easJson.build.development) ||
  !isPlainObject(easJson.build.preview) ||
  !isPlainObject(easJson.build.production)
) {
  throw new Error(
    'eas.json either contains non-object or contains object without .build property',
  );
}

easJson.build.base = {
  env: {
    NODE_ENV: 'production',
    EXPO_USE_FAST_RESOLVER: '1',
  },
};

easJson.build.development.extends = 'base';
easJson.build.development.env = {
  NODE_ENV: 'development',
};

easJson.build.preview.extends = 'base';
easJson.build.production.extends = 'base';

await writeFile(easFilePath, JSON.stringify(easJson, null, 2), 'utf8');
console.log('✅ Enabled new Metro resolver in eas.json');

const imagesDts = `// Image types inspired by Next.js \`global.d.ts\`
declare module '*.png' {
  const path: string;
  export default path;
}

declare module '*.jpg' {
  const path: string;
  export default path;
}

declare module '*.jpeg' {
  const path: string;
  export default path;
}

declare module '*.webp' {
  const path: string;
  export default path;
}

declare module '*.avif' {
  const path: string;
  export default path;
}

declare module '*.gif' {
  const path: string;
  export default path;
}

declare module '*.ico' {
  const path: string;
  export default path;
}

declare module '*.bmp' {
  const path: string;
  export default path;
}

declare module '*.svg' {
  const path: string;
  export default path;
}
`;

await writeFile('images.d.ts', imagesDts, 'utf8');

console.log('✅ Created images.d.ts');
