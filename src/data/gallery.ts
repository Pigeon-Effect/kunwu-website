/**
 * Gallery on the Daily life page – photo ids from src/data/photos.ts, in display order.
 * To add a photo: put it in src/assets/photos/gallery/, register it (with both alt texts) in
 * photos.ts, then list its id here.
 */
import type { PhotoId } from './photos';

// Order chosen so rows come out even at desktop width (two narrow portraits fill the gaps).
export const gallery: PhotoId[] = [
  'schoolForecourt',
  'yansongSwordBamboo',
  'schoolLake',
  'yantaoGuandaoTemple',
  'yansongBlueRobe',
  'lounge',
  'schoolFlowerBeds',
  'diningHall',
  'yansongGuandaoHall',
  'guestRoom',
  'banquetRoom',
];
