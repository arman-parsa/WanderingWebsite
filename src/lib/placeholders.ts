/**
 * Placeholder content shown when Sanity returns no data.
 * Automatically replaced once real content is published in Sanity.
 */

export type PlaceholderItem = {
  _type: 'writing' | 'mixedMedia' | 'photography' | 'videography';
  title: string;
  slug: string;
  publishedAt: string;
  location: string;
  description?: string;
  coverImage?: undefined;
};

export const PLACEHOLDER_ITEMS: PlaceholderItem[] = [
  {
    _type: 'writing',
    title: 'Light and Distance in the Atlas Mountains',
    slug: '_placeholder-atlas',
    publishedAt: '2025-09-12',
    location: 'Marrakech, Morocco',
    description:
      'Three weeks on foot through the High Atlas, where the light arrives sideways and the villages have no names on any map.',
  },
  {
    _type: 'photography',
    title: 'Harbour Town at the End of Season',
    slug: '_placeholder-harbour',
    publishedAt: '2025-08-04',
    location: 'Essaouira, Morocco',
    description:
      'A series of portraits and street photographs taken in the final weeks of summer.',
  },
  {
    _type: 'mixedMedia',
    title: 'On Travelling Without a Camera',
    slug: '_placeholder-nocamera',
    publishedAt: '2025-07-18',
    location: 'Lisbon, Portugal',
    description:
      'What you gain and what you lose when you leave the lens behind.',
  },
  {
    _type: 'writing',
    title: 'The Slow Train from Tangier',
    slug: '_placeholder-train',
    publishedAt: '2025-06-01',
    location: 'Fès, Morocco',
    description:
      'Eight hours of coast and desert, a broken dining car, and the man reading Borges in seat 14.',
  },
  {
    _type: 'photography',
    title: 'Interiors: Riad Architecture',
    slug: '_placeholder-riads',
    publishedAt: '2025-04-22',
    location: 'Fès el-Bali, Morocco',
    description:
      'Geometric tilework, courtyard light, and the geometry of enclosed spaces.',
  },
  {
    _type: 'mixedMedia',
    title: 'Field Notes on the Medina',
    slug: '_placeholder-medina',
    publishedAt: '2025-03-10',
    location: 'Meknès, Morocco',
    description:
      'A week of notes made in the souks — on commerce, language, and the pace of a city that ignores the clock.',
  },
];

export const PLACEHOLDER_WRITING = {
  title: 'Light and Distance in the Atlas Mountains',
  slug: '_placeholder-atlas',
  publishedAt: '2025-09-12',
  location: 'Marrakech, Morocco',
  tags: ['travel', 'writing', 'north africa'],
  description:
    'Three weeks on foot through the High Atlas, where the light arrives sideways and the villages have no names on any map.',
  body: null,
  coverImage: undefined,
  seo: null,
};

import type { GlobeItem } from '@/components/map/GlobeView';

export const PLACEHOLDER_GLOBE_ITEMS: GlobeItem[] = [
  {
    _type: 'writing',
    title: 'Light and Distance in the Atlas Mountains',
    slug: '_placeholder-atlas',
    publishedAt: '2025-09-12',
    location: 'Marrakech, Morocco',
    description:
      'Three weeks on foot through the High Atlas, where the light arrives sideways and the villages have no names on any map.',
    coordinates: { lat: 31.63, lng: -8.01 },
  },
  {
    _type: 'photography',
    title: 'Harbour Town at the End of Season',
    slug: '_placeholder-harbour',
    publishedAt: '2025-08-04',
    location: 'Essaouira, Morocco',
    description:
      'A series of portraits and street photographs taken in the final weeks of summer.',
    coordinates: { lat: 31.51, lng: -9.76 },
  },
  {
    _type: 'mixedMedia',
    title: 'On Travelling Without a Camera',
    slug: '_placeholder-nocamera',
    publishedAt: '2025-07-18',
    location: 'Lisbon, Portugal',
    description: 'What you gain and what you lose when you leave the lens behind.',
    coordinates: { lat: 38.72, lng: -9.14 },
  },
  {
    _type: 'writing',
    title: 'The Slow Train from Tangier',
    slug: '_placeholder-train',
    publishedAt: '2025-06-01',
    location: 'Fès, Morocco',
    description:
      'Eight hours of coast and desert, a broken dining car, and the man reading Borges in seat 14.',
    coordinates: { lat: 34.02, lng: -5.01 },
  },
  {
    _type: 'photography',
    title: 'Interiors: Riad Architecture',
    slug: '_placeholder-riads',
    publishedAt: '2025-04-22',
    location: 'Fès el-Bali, Morocco',
    description: 'Geometric tilework, courtyard light, and the geometry of enclosed spaces.',
    coordinates: { lat: 34.06, lng: -4.98 },
  },
  {
    _type: 'mixedMedia',
    title: 'Field Notes on the Medina',
    slug: '_placeholder-medina',
    publishedAt: '2025-03-10',
    location: 'Meknès, Morocco',
    description:
      'A week of notes made in the souks — on commerce, language, and the pace of a city that ignores the clock.',
    coordinates: { lat: 33.89, lng: -5.55 },
  },
];

export const PLACEHOLDER_PHOTO_SERIES = {
  title: 'Harbour Town at the End of Season',
  slug: '_placeholder-harbour',
  publishedAt: '2025-08-04',
  location: 'Essaouira, Morocco',
  description:
    'A series of portraits and street photographs taken in the final weeks of summer, when the tourists have left and the town returns to itself.',
  images: [],
  coverImage: undefined,
  seo: null,
};
