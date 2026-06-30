import {describe, expect, it} from 'vitest';

import type {TorrentProperties} from '@shared/types/Torrent';

import filterTorrents from './filterTorrents';

const makeTorrent = (directory: string): TorrentProperties =>
  ({
    hash: `h-${directory}`,
    directory,
    downRate: 0,
    upRate: 0,
    sizeBytes: 0,
    status: [],
    tags: [],
    trackerURIs: [],
  } as unknown as TorrentProperties);

describe('filterTorrents.location', () => {
  const torrents: TorrentProperties[] = [
    makeTorrent('/DATA/FOLDER'),
    makeTorrent('/DATA/FOLDER2'),
    makeTorrent('/DATA/FOLDER3'),
    makeTorrent('/DATA/FOLDER2/video'),
    makeTorrent('/DATA/OTHER'),
  ];

  it('does not match sibling folders that share a name prefix', () => {
    const filtered = filterTorrents(torrents, {type: 'location', filter: ['/DATA/FOLDER']});
    expect(filtered.map((t) => t.directory)).toEqual(['/DATA/FOLDER']);
  });

  it('includes subdirectories of the selected folder', () => {
    const filtered = filterTorrents(torrents, {type: 'location', filter: ['/DATA/FOLDER2']});
    expect(filtered.map((t) => t.directory).sort()).toEqual(['/DATA/FOLDER2', '/DATA/FOLDER2/video']);
  });

  it('treats a trailing slash as equivalent to no trailing slash', () => {
    const a = filterTorrents(torrents, {type: 'location', filter: ['/DATA/FOLDER/']});
    const b = filterTorrents(torrents, {type: 'location', filter: ['/DATA/FOLDER']});
    expect(a).toEqual(b);
  });

  it('returns no rows when no filter is set', () => {
    const filtered = filterTorrents(torrents, {type: 'location', filter: []});
    expect(filtered).toEqual(torrents);
  });
});
