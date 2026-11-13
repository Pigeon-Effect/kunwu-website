/**
 * Short video clips for the Daily life page.
 *
 * Rules (CLAUDE.md): H.264 MP4, < 5 MB each, self-hosted in public/videos/,
 * always with a poster image (put it in src/assets/photos/posters/).
 * Suggested encode:
 *   ffmpeg -i in.mov -vf "scale=-2:720" -c:v libx264 -crf 28 -preset slow -an -movflags +faststart out.mp4
 *
 * Example:
 *   import morningPoster from '../assets/photos/posters/morning.jpg';
 *   { file: 'videos/morning.mp4', poster: morningPoster, width: 720, height: 1280,
 *     title: { en: 'Morning stance training', zh: '清晨马步训练' } },
 */
import type { ImageMetadata } from 'astro';

export interface VideoClip {
  /** path inside public/, e.g. "videos/morning.mp4" */
  file: string;
  poster: ImageMetadata;
  width: number;
  height: number;
  title: { en: string; zh: string };
}

export const videos: VideoClip[] = [];

/** External channels – plain links only, never embeds. */
export const channels: { label: string; url: string }[] = [];
