import { writing } from './documents/essay';
import { mixedMedia } from './documents/editorial';
import { photography } from './documents/photoSeries';
import { videography } from './documents/videography';
import { author } from './documents/author';
import { portableText } from './objects/portableText';
import { imageBlock } from './objects/imageBlock';
import { videoBlock } from './objects/videoBlock';
import { pullQuote } from './objects/pullQuote';
import { seoFields } from './objects/seoFields';
import { siteSettings } from './singletons/siteSettings';

export const schemaTypes = [
  // Documents
  writing,
  mixedMedia,
  photography,
  videography,
  author,
  siteSettings,
  // Objects
  portableText,
  imageBlock,
  videoBlock,
  pullQuote,
  seoFields,
];
