import type {zodInfer} from 'zod';
import {array, number, strictObject, string} from 'zod';

export const searchTorrentResultSchema = strictObject({
  filename: string(),
  size: number().int().nonnegative(),
  seeds: number().int().nonnegative(),
  leechs: number().int().nonnegative(),
  source: string(),
});

export type SearchTorrentResult = zodInfer<typeof searchTorrentResultSchema>;

export const searchTorrentResultArraySchema = array(searchTorrentResultSchema);
export type SearchTorrentResultArray = zodInfer<typeof searchTorrentResultArraySchema>;
