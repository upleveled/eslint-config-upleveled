// Enable Expo non-default options for performance:
//
// 1. app.json - Enable API Routes
//    - https://docs.expo.dev/router/reference/api-routes/
// 2. .env.development, .env.production, eas.json - Enable the new Metro resolver available starting in Expo SDK 51
//    - https://github.com/EvanBacon/pillar-valley/commit/ede321ef7addc67e4047624aedb3e92af3cb5060
//    - https://archive.ph/MG03E
//
// TODO: Remove when Expo enables New Architecture and new Metro resolver by default
import { readFile, writeFile } from 'node:fs/promises';
import isPlainObject from 'is-plain-obj';

const appFilePath = 'app.json';
const appJson = JSON.parse(await readFile(appFilePath, 'utf8'));

if (!isPlainObject(appJson) || !isPlainObject(appJson.expo)) {
  throw new Error(
    'app.json either contains non-object or contains object without .expo property',
  );
}

appJson.expo.plugins = [
  [
    'expo-router',
    {
      origin: 'https://evanbacon.dev/',
    },
  ],
];

appJson.expo.web.output = 'server';

await writeFile(appFilePath, JSON.stringify(appJson, null, 2), 'utf8');
console.log('✅ Enabled Expo Router API Routes in app.json');

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
