import { exec } from 'node:child_process';
import { readFile, unlink, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import isPlainObject from 'is-plain-obj';

const appJsonFilePath = 'app.json';
const appJson = JSON.parse(await readFile(appJsonFilePath, 'utf8'));

if (!isPlainObject(appJson) || !isPlainObject(appJson.expo)) {
  throw new Error(
    'app.json either contains non-object or contains object without .expo property',
  );
}

// Install Prettier to format `app.config.ts`, colocated in this script for
// easier removal
//
// TODO: Remove this if `create-expo-app` generates `app.config.ts` in future
// - https://github.com/expo/expo/issues/34357
await promisify(exec)('pnpm add --save-dev prettier');
const { format } = await import('prettier');

await writeFile(
  'app.config.ts',
  await format(
    `import { type ExpoConfig } from 'expo/config';

const config: ExpoConfig = ${JSON.stringify(appJson.expo, null, 2)};

export default config;`,
    {
      parser: 'typescript',
      singleQuote: true,
    },
  ),
  'utf8',
);
console.log('✅ Created app.config.ts');

await unlink(appJsonFilePath);
console.log('✅ Deleted app.json');

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
