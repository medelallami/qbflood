import type {TorrentProperties} from '@shared/types/Torrent';
import type {TorrentStatus} from '@shared/constants/torrentStatusMap';

interface LocationFilter {
  type: 'location';
  filter: string[];
}

interface StatusFilter {
  type: 'status';
  filter: TorrentStatus[];
}

interface TrackerFilter {
  type: 'tracker';
  filter: string[];
}

interface TagFilter {
  type: 'tag';
  filter: string[];
}

interface CategoryFilter {
  type: 'category';
  filter: string[];
}

function filterTorrents(
  torrentList: TorrentProperties[],
  opts: LocationFilter | StatusFilter | TrackerFilter | TagFilter | CategoryFilter,
): TorrentProperties[] {
  if (opts.filter.length) {
    if (opts.type === 'location') {
      return torrentList.filter((torrent) =>
        opts.filter.some((directory) => isWithinDirectory(torrent.directory, directory)),
      );
    }

    if (opts.type === 'status') {
      return torrentList.filter((torrent) => torrent.status.some((status) => opts.filter.includes(status)));
    }

    if (opts.type === 'tracker') {
      return torrentList.filter((torrent) =>
        torrent.trackerURIs.some((uri) => {
          // Extract domain from tracker URI to match taxonomy computation
          let domain = uri;
          try {
            if (uri.includes('://')) {
              const url = new URL(uri);
              domain = url.hostname;
            } else {
              domain = uri.split('/')[0].split(':')[0];
            }
          } catch {
            // Use as-is if parsing fails
          }
          return opts.filter.includes(domain);
        }),
      );
    }

    if (opts.type === 'tag') {
      const includeUntagged = opts.filter.includes('untagged');
      return torrentList.filter(
        (torrent) =>
          (includeUntagged && torrent.tags.length === 0) || torrent.tags.some((tag) => opts.filter.includes(tag)),
      );
    }

    if (opts.type === 'category') {
      return torrentList.filter((torrent) => {
        const category =
          typeof torrent.category === 'string' && torrent.category.length > 0
            ? torrent.category
            : 'uncategorized';
        return opts.filter.includes(category);
      });
    }
  }

  return torrentList;
}

function isWithinDirectory(filePath: string, directoryRoot: string): boolean {
  const root = stripTrailingSeparators(directoryRoot);
  const target = stripTrailingSeparators(filePath);

  if (target === root) {
    return true;
  }

  return target.startsWith(`${root}/`);
}

function stripTrailingSeparators(input: string): string {
  // Normalise both Windows ('\\') and POSIX ('/') separators so the
  // comparison stays consistent across platforms the torrent client
  // happens to run on.
  return input.replace(/[\\/]+$/u, '');
}

export default filterTorrents;
