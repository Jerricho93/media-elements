#!/usr/bin/env node
import { parseArgs } from 'node:util';
import process from 'node:process';
import { join, dirname } from 'node:path';
import { realpath, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const header = `// This file is generated by media-elements/scripts/build-react!\n`;

const nodePath = await realpath(process.argv[1]);
const modulePath = await realpath(fileURLToPath(import.meta.url));
const isCLI = nodePath === modulePath;

if (isCLI) cliBuild();

export async function cliBuild() {
  const { values: args, positionals } = parseArgs({
    options: {},
    strict: false,
    allowPositionals: true,
  });

  await build(positionals, args);
}

export async function build() {
  // read name from package.json
  const { name } = JSON.parse(await readFile('./package.json', 'utf8'));

  if (name.endsWith('video-element') || name.endsWith('audio-element')) {

    // copy declaration file templates/react.d.ts to root folder
    const declaration = await readFile(join(dirname(modulePath), '/templates/react.d.ts'), 'utf8');
    await writeFile(`./react.d.ts`, header + declaration);

    // copy wrapper file templates/react.js to root folder and replace {{{name}}}, {{{filename}}}
    const wrapper = await readFile(join(dirname(modulePath), '/templates/react.js'), 'utf8');

    const wrapperContent = wrapper
      .replace(/{{{element_name}}}/g, name.replace(/-element$/, ''))
      .replace(/{{{file_name}}}/g, name);

    await writeFile(`./react.js`, header + wrapperContent);
  }
}
