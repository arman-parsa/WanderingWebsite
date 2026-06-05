import { essay } from './documents/essay';
import { editorial } from './documents/editorial';
import { photoSeries } from './documents/photoSeries';
import { author } from './documents/author';
import { portableText } from './objects/portableText';
import { imageBlock } from './objects/imageBlock';
import { videoBlock } from './objects/videoBlock';
import { pullQuote } from './objects/pullQuote';
import { seoFields } from './objects/seoFields';
import { siteSettings } from './singletons/siteSettings';

export const schemaTypes = [
  // Documents
  essay,
  editorial,
  photoSeries,
  author,
  siteSettings,
  // Objects
  portableText,
  imageBlock,
  videoBlock,
  pullQuote,
  seoFields,
];
