// Enable Expo non-default options for performance:
//
// 1. app.json - Add plugins section to enable New Architecture for iOS and Android
// https://docs.expo.dev/guides/new-architecture/
// 2. eas.json - Enable the new Metro resolver available starting in Expo SDK 51
//    https://archive.ph/MG03E
//
// "TODO: Remove when Expo enables New Architecture and new Metro resolver by default"
import { readFile, writeFile } from 'node:fs/promises';

const appFilePath = 'app.json';
const appJson = JSON.parse(await readFile(appFilePath, 'utf8'));

appJson.expo.plugins = [
  [
    'expo-build-properties',
    {
      ios: {
        newArchEnabled: true,
      },
      android: {
        newArchEnabled: true,
      },
    },
  ],
];

await writeFile(appFilePath, JSON.stringify(appJson, null, 2), 'utf8');
console.log('✅ Enabled New Architecture in app.json');

const easFilePath = 'eas.json';
const easJson = JSON.parse(await readFile(easFilePath, 'utf8'));

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
console.log('✅ Extended build configuration for production environments');
