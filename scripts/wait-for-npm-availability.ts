#!/usr/bin/env node

// Wait for npm publish-time malware scanning to publish the new version
// - https://github.blog/changelog/2026-07-28-npm-publish-time-malware-scanning-and-dual-use-metadata/

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { setTimeout } from 'node:timers/promises';

const packageJson = JSON.parse(
  readFileSync(join(import.meta.dirname, '..', 'package.json'), 'utf-8'),
) as { name: string; version: string };

const url = `https://registry.npmjs.org/${packageJson.name}`;

async function fetchLatest() {
  const response = await fetch(url, {
    headers: {
      // Abbreviated packument, which pnpm resolves installs from
      accept: 'application/vnd.npm.install-v1+json',
      'cache-control': 'no-cache',
    },
  });

  if (!response.ok) {
    throw new Error(`npm registry returned ${response.status} for ${url}`);
  }

  return ((await response.json()) as { 'dist-tags': { latest: string } })[
    'dist-tags'
  ].latest;
}

while ((await fetchLatest()) !== packageJson.version) {
  console.log(`Waiting for ${packageJson.name}@${packageJson.version}`);
  await setTimeout(15000);
}
