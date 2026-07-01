import {createRef, FC, MutableRefObject} from 'react';
import {observer} from 'mobx-react-lite';

import {Checkmark} from '@client/ui/icons';
import ConfigStore from '@client/stores/ConfigStore';
import TorrentActions from '@client/actions/TorrentActions';
import TorrentContextMenuActions from '@client/constants/TorrentContextMenuActions';
import TorrentStore from '@client/stores/TorrentStore';
import UIStore from '@client/stores/UIStore';

import type {ContextMenuItem} from '@client/stores/UIStore';

import type {TorrentProperties} from '@shared/types/Torrent';

import PriorityMeter from '../general/PriorityMeter';

const getLastSelectedTorrent = (): string => TorrentStore.selectedTorrents[TorrentStore.selectedTorrents.length - 1];

const InlineTorrentPropertyCheckbox: FC<{property: keyof TorrentProperties}> = observer(
  ({property}: {property: keyof TorrentProperties}) => (
    <span className="toggle-input checkbox" style={{display: 'inline'}}>
      <div className="toggle-input__indicator">
        <div
          className="toggle-input__indicator__icon"
          style={{
            opacity: TorrentStore.torrents[getLastSelectedTorrent()][property] ? '1' : undefined,
          }}
        >
          <Checkmark />
        </div>
      </div>
    </span>
  ),
);

export const getContextMenuItems = (torrent: TorrentProperties): Array<ContextMenuItem> => {
  const changePriorityFuncRef = createRef<() => number>();

  return [
    {
      type: 'action',
      action: 'start',
      label: TorrentContextMenuActions.start,
      clickHandler: () => {
        TorrentActions.startTorrents({
          hashes: TorrentStore.selectedTorrents,
        });
      },
    },
    {
      type: 'action',
      action: 'stop',
      label: TorrentContextMenuActions.stop,
      clickHandler: () => {
        TorrentActions.stopTorrents({
          hashes: TorrentStore.selectedTorrents,
        });
      },
    },
    {
      type: 'action',
      action: 'remove',
      label: TorrentContextMenuActions.remove,
      clickHandler: () => {
        UIStore.setActiveModal({id: 'remove-torrents'});
      },
    },
    {
      type: 'action',
      action: 'checkHash',
      label: TorrentContextMenuActions.checkHash,
      clickHandler: () => {
        TorrentActions.checkHash({
          hashes: TorrentStore.selectedTorrents,
        });
      },
    },
    {
      type: 'action',
      action: 'reannounce',
      label: TorrentContextMenuActions.reannounce,
      clickHandler: () => {
        TorrentActions.reannounce({
          hashes: TorrentStore.selectedTorrents as [string, ...string[]],
        });
      },
    },
    {
      type: 'separator',
    },
    {
      type: 'action',
      action: 'setTaxonomy',
      label: TorrentContextMenuActions.setTaxonomy,
      clickHandler: () => {
        UIStore.setActiveModal({id: 'set-taxonomy'});
      },
    },
    {
      type: 'action',
      action: 'move',
      label: TorrentContextMenuActions.move,
      clickHandler: () => {
        UIStore.setActiveModal({id: 'move-torrents'});
      },
    },
    {
      type: 'action',
      action: 'setTrackers',
      label: TorrentContextMenuActions.setTrackers,
      clickHandler: () => {
        UIStore.setActiveModal({id: 'set-trackers'});
      },
    },
    {
      type: 'separator',
    },
    {
      type: 'action',
      action: 'torrentDetails',
      label: TorrentContextMenuActions.torrentDetails,
      clickHandler: () => {
        UIStore.setActiveModal({
          id: 'torrent-details',
          hash: getLastSelectedTorrent(),
        });
      },
    },
    {
      type: 'action',
      action: 'downloadContents',
      label: TorrentContextMenuActions.downloadContents,
      clickHandler: (e) => {
        e.preventDefault();

        // WebKit-based browsers (Safari, mobile Safari) drop
        // additional <a>.click() calls when they happen in the
        // same microtask as a click, so calling link.click()
        // synchronously per-torrent only triggers the last
        // download ('#405). Space the calls out by a frame so the
        // browser treats each one as a separate user-initiated
        // download.
        const hashes = [...TorrentStore.selectedTorrents];
        if (hashes.length === 0) {
          return;
        }

        hashes.forEach((hash, index) => {
          window.setTimeout(() => {
            const link = document.createElement('a');

            link.download = '';
            link.href = `${ConfigStore.baseURI}api/torrents/${hash}/contents/all/data`;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();

            // Remove immediately if it's the last item, otherwise
            // schedule the removal so we don't yank it out from
            // under the user-agent as the download starts.
            if (index === hashes.length - 1) {
              document.body.removeChild(link);
            } else {
              window.setTimeout(() => document.body.removeChild(link), 60_000);
            }
          }, index * 100);
        });
      },
    },
    {
      type: 'action',
      action: 'downloadMetainfo',
      label: TorrentContextMenuActions.downloadMetainfo,
      clickHandler: (e) => {
        e.preventDefault();

        const link = document.createElement('a');

        link.download = '';
        link.href = `${ConfigStore.baseURI}api/torrents/${TorrentStore.selectedTorrents.join(',')}/metainfo`;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    },
    {
      type: 'action',
      action: 'generateMagnet',
      label: TorrentContextMenuActions.generateMagnet,
      clickHandler: () => {
        UIStore.setActiveModal({id: 'generate-magnet'});
      },
    },
    {
      type: 'action',
      action: 'setInitialSeeding',
      label: TorrentContextMenuActions.setInitialSeeding,
      clickHandler: () => {
        const {selectedTorrents} = TorrentStore;
        TorrentActions.setInitialSeeding({
          hashes: selectedTorrents,
          isInitialSeeding: !TorrentStore.torrents[getLastSelectedTorrent()].isInitialSeeding,
        });
      },
      dismissMenu: false,
      labelAction: () => <InlineTorrentPropertyCheckbox property="isInitialSeeding" />,
    },
    {
      type: 'action',
      action: 'setSequential',
      label: TorrentContextMenuActions.setSequential,
      clickHandler: () => {
        const {selectedTorrents} = TorrentStore;
        TorrentActions.setSequential({
          hashes: selectedTorrents,
          isSequential: !TorrentStore.torrents[getLastSelectedTorrent()].isSequential,
        });
      },
      dismissMenu: false,
      labelAction: () => <InlineTorrentPropertyCheckbox property="isSequential" />,
    },
    {
      type: 'action',
      action: 'setPriority',
      label: TorrentContextMenuActions.setPriority,
      clickHandler: () => {
        if (changePriorityFuncRef.current != null) {
          TorrentActions.setPriority({
            hashes: TorrentStore.selectedTorrents,
            priority: changePriorityFuncRef.current(),
          });
        }
      },
      dismissMenu: false,
      labelAction: () => (
        <PriorityMeter
          id={torrent.hash}
          key={torrent.hash}
          level={torrent.priority}
          maxLevel={3}
          onChange={() => undefined}
          priorityType="torrent"
          showLabel={false}
          changePriorityFuncRef={changePriorityFuncRef as MutableRefObject<() => number>}
          clickHandled
        />
      ),
    },
  ];
};
