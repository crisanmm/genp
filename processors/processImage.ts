import sharp from 'sharp';
import path from 'path';

type ProcessImageOptions = {
  imagePath: string;
  outputDirectoryPath: string;
  sizes: string[];
  formats: (keyof sharp.FormatEnum)[];
  generateHTML: boolean;
};

function processSizes(sizes: string[], sharpMetadata: sharp.Metadata) {
  const processedSizes = [];

  for (let size of sizes) {
    if (size === 'original') {
      // special keyword to keep original image size, useful for format conversion
      size = `${sharpMetadata.width}x${sharpMetadata.height}`;
    }

    // size should be in format 'width' or 'widthxheight'
    const [width, height] = size.split('x').map(Number);
    if (isNaN(width) || (size.indexOf('x') !== -1 && isNaN(height))) throw new Error(`Invalid size: ${size}`);

    processedSizes.push({ width, height });
  }

  return processedSizes;
}

function generateHTMLPictureElement(imagesData: (sharp.OutputInfo & { imagePath: string; alt: string })[]) {
  function groupBy(imagesData: (sharp.OutputInfo & { imagePath: string; alt: string })[], key: string) {
    return imagesData.reduce((acc: { [key: string]: unknown }, imageData) => {
      // @ts-ignore
      acc[imageData[key]] = acc[imageData[key]] || [];
      // @ts-ignore
      acc[imageData[key]].push(imageData);
      return acc;
    }, {});
  }
  const imagesDataGroupedByFormat = groupBy(imagesData, 'format');

  let sources = [];
  for (const [format, imagesDataFormat] of Object.entries(imagesDataGroupedByFormat)) {
    sources.push(
      `<source
        type="image/${format}"
        srcset="${(imagesDataFormat as any)
          .map((imageData: any) => `${imageData.imagePath} ${imageData.width}w`)
          .join(', ')}"
        sizes="100vw"
      >`
    );
  }

  const img = `<img src=${imagesData[0].imagePath} alt="${imagesData[0].alt}" loading="lazy" decoding="async">`;

  return `<picture>${sources.join('\n')}${img}</picture>`;
}

async function processImage({
  imagePath: inputImagePath,
  outputDirectoryPath,
  sizes,
  formats,
  generateHTML,
}: ProcessImageOptions) {
  console.log('🚀  -> file: processImage.ts  -> line 22  -> formats', formats);
  console.log('🚀  -> file: processImage.ts  -> line 22  -> sizes', sizes);
  console.log('🚀  -> file: processImage.ts  -> line 22  -> outputDirectoryPath', outputDirectoryPath);
  console.log('🚀  -> file: processImage.ts  -> line 22  -> inputImagePath', inputImagePath);
  const promises = [];
  const processedSizes = processSizes(sizes, await sharp(inputImagePath).metadata());

  for (const format of formats)
    for (const { width, height } of processedSizes) {
      const imageBasename = path.basename(inputImagePath, path.extname(inputImagePath));
      const outputImagePath = path.join(
        outputDirectoryPath,
        `${imageBasename}-${width}${height ? `x${height}` : ''}.${format}`
      );
      console.log('🚀  -> file: processImage.ts  -> line 80  -> outputImagePath', outputImagePath);

      promises.push(
        new Promise<sharp.OutputInfo & { imagePath: string; alt: string }>(async (resolve, reject) => {
          try {
            const outputInfo = await sharp(inputImagePath)
              .toFormat(format)
              .resize(width, height, { fit: 'cover' })
              .toFile(outputImagePath);

            resolve({
              ...outputInfo,
              format,
              imagePath: outputImagePath,
              alt: '',
            });
          } catch (error) {
            reject(error);
          }
        })
      );
    }

  const imagesData = await Promise.all(promises);
  // console.log('🚀  -> file: processImage.ts  -> line 82  -> imagesData', imagesData);

  if (generateHTML) {
    // return generateHTMLPictureElement(imagesData);
    console.log(
      '🚀  -> file: processImage.ts  -> line 107  -> generateHTMLPictureElement(imagesData)',
      generateHTMLPictureElement(imagesData)
    );
  }
}

export { processImage };
