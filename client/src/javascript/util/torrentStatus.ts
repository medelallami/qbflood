import classnames from 'classnames';

import type {TorrentProperties} from '@shared/types/Torrent';

export const torrentStatusClasses = (
  {status, downRate, upRate}: Pick<TorrentProperties, 'status' | 'downRate' | 'upRate'>,
  ...classes: Array<string>
): string =>
  classnames(classes, {
    'torrent--has-error': status.includes('error'),
    'torrent--has-warning': status.includes('warning'),
    'torrent--is-stopped': status.includes('stopped'),
    'torrent--is-downloading': status.includes('downloading'),
    'torrent--is-downloading--actively': downRate > 0,
    'torrent--is-uploading--actively': upRate > 0,
    'torrent--is-seeding': status.includes('seeding'),
    'torrent--is-completed': status.includes('complete'),
    'torrent--is-checking': status.includes('checking'),
    'torrent--is-moving': status.includes('moving'),
    'torrent--is-inactive': status.includes('inactive'),
  });

export const torrentStatusEffective = (status: TorrentProperties['status']): TorrentProperties['status'][number] => {
  // Terminal states dominate. Order goes: error -> warning ->
  // moving -> checking -> seeding -> downloading -> stopped ->
  // (everything else). We pick the first matching state in this
  // order so that a torrent reported both 'seeding' and
  // 'downloading' (which can happen when the client briefly flips
  // between the two during a transition or when partial -- and
  // the user is reporting the wrong effective state in #559) is
  // displayed as 'seeding'.
  const priority: Array<TorrentProperties['status'][number]> = [
    'error',
    'warning',
    'moving',
    'checking',
    'seeding',
    'downloading',
    'stopped',
  ];

  for (const candidate of priority) {
    if (status.includes(candidate)) {
      return candidate;
    }
  }

  return 'stopped';
};
