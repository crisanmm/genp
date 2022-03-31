#!/usr/bin/env ts-node
/// <reference path="genp.d.ts" />
// TODO: add alt attribute support
// TODO: when generateHTMLPictureElement(), add lowest quality src to <img>
// TODO: when generateHTMLPictureElement(), add MIME type support using external lib
// TODO: when generateHTMLPictureElement(), group <source> by format
// TODO: when generateHTMLPictureElement(), minify output
// TODO: when generateHTMLPictureElement(), order sources by image type, (e.g. avif before webp before jpg)
// TODO: handle case when `size` option has no comma
// TODO: calculate saved size
// TODO: handle whitespace in `size` and `format` option
// TODO: create directory when `output` option used
import sharp from 'sharp';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { processImage } from './processors/processImage';

const sizesDefault = '720,1024,1080x1920,original';

const args = yargs(hideBin(globalThis.process.argv))
  .usage('Usage: $0 <image> [sizes]')
  .example(` $0 foo.jpg --formats=avif,webp,png --sizes=${sizesDefault}`, 'Generate images, each format with all sizes')
  .command('$0 <image>', 'aidsaoidsa', (yargs) => {
    yargs
      .positional('image', {
        describe: 'Please provide path to an image',
      })
      .option('sizes', {
        alias: 's',
        default: sizesDefault,
        defaultDescription: sizesDefault,
        description: 'Comma separated list of sizes',
      })
      .option('formats', {
        alias: 'f',
        requiresArg: true,
        description: 'Formats to convert to',
        demandOption: 'Please provide at least one format',
      })
      .option('html', {
        boolean: true,
        default: false,
        description: 'Write sample HTML picture element using generated images on standard output',
      })
      .option('output', {
        alias: 'o',
        description: 'Output directory',
        default: '.',
        defaultDescription: 'Current directory',
      });
  })
  .alias('h', 'help')
  .parse();
console.log('🚀  -> file: genp.ts  -> line 17  -> args', args);

async function run() {
  const imagePath = (args as any).image as string;
  const sizes = ((args as any).sizes as string).split(',');
  const formats = ((args as any).formats as string).split(',') as (keyof sharp.FormatEnum)[];
  const outputDirectoryPath = (args as any).output as string;
  const generateHTML = (args as any).html as boolean;

  try {
    await processImage({ imagePath, outputDirectoryPath, sizes, formats, generateHTML });
  } catch (e) {
    console.log('🚀  -> file: index.ts  -> line 11  -> e', e);
  }
}

run();
