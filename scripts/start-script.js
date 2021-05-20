import fs from 'node:fs';

const content = fs.readFileSync(`${process.cwd()}/package.json`);

const object = JSON.parse(content);

object.resolutions = { ...object.resolutions, 'eslint-plugin-react': '7.23.2' };

fs.writeFileSync(
  `${process.cwd()}/package.json`,
  JSON.stringify(object, null, 2) + '\n',
);

console.log('resolutions added to package.json');
