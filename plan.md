# qbflood — Resolution Plan: Open Issues from jesec/flood

## Reorganised **Easy → Hard** (2026-07-01, rev 3)

**Tracking repo:** `medelallami/qbflood` (branch `beta`)
**Source repo:** `jesec/flood`
**Source data:** `issues.md` (58 upstream issues)

### GitHub mirror note

Issue numbers in this doc are the **upstream jesec/flood** numbers (e.g. #922).
The GitHub mirror uses its own numbering (e.g. upstream #922 = mirror #19).
`Closes #<N>` in commit messages refers to the **mirror** number.

### Bands

| Band | Tag             | What it covers                                                    | Typical ETA |
| ---- | --------------- | ----------------------------------------------------------------- | ----------- |
| 1    | **DONE**        | docs / README / deprecation note / column header / toast text     | ≤ 2 h       |
| 2    | **DONE**        | single-file UI tweak, env flag, minor i18n                        | 0.5 – 1 d   |
| 3    | **DONE / open** | small adapter patch, error message rewording, single new endpoint | 1 – 2 d     |
| 4    | **open**        | GUI state bugs, filter logic, deduplication races                 | 2 – 3 d     |
| 5    | **open**        | multi-component crashes, memory leaks, async lifecycle            | 3 – 5 d     |
| 6    | **open**        | new feature surface, multi-client contracts                       | >5 d        |

---

## Band 1 — DONE

All issues resolved and manually closed on GitHub (no `Closes #` in commits needed).

| Upstream # | Issue                                       | Status   | Commit    | Notes                                                                                   |
| ---------- | ------------------------------------------- | -------- | --------- | --------------------------------------------------------------------------------------- |
| 1006       | Missing # column                            | **DONE** | `df16059` | passed `index` through `TorrentListRow`; new `.torrent__list__index` cell               |
| 867        | /api/torrents/add-files 403 message unclear | **DONE** | `fc59e67` | `accessDeniedError` accepts custom message; add-files/add-urls point at `--allowedpath` |
| 663        | French translation issue                    | **DONE** | `b044455` | `docs/I18N.md` explains Crowdin flow; plural ICU refactor deferred                      |
| 1119       | Flor Mediainfo Integration Documentation    | **DONE** | `d42f6ae` | `docs/MEDIAINFO.md` + README link                                                       |
| 1139       | Deprecation: rtorrent-flood image           | **DONE** | `5f46fae` | `docs/RTORRENT-FLOOD-DEPRECATION.md` + README banner                                    |

---

## Band 2 — DONE

All issues resolved and manually closed on GitHub.

| Upstream # | Issue                                         | Status   | Commit    | Notes                                                                                   |
| ---------- | --------------------------------------------- | -------- | --------- | --------------------------------------------------------------------------------------- |
| 911        | Health-check endpoint                         | **DONE** | `5b96756` | `GET /api/health` returning `{status,uptime,timestamp}` (unauthenticated)               |
| 712        | watchMountPoints not configurable             | **DONE** | `ccddc58` | New CLI flag `--watchmountpoints` + parsing; env `FLOOD_OPTION_watchmountpoints=a,b`    |
| 672        | Flood doesn't create ~/.local                 | **DONE** | `e9b854a` | `ensureRuntimeDirectory` walks `rundir/db/temp`, perms 0o700, surfaces errno on failure |
| 840        | Android A2HS not working                      | **DONE** | `4f9cb5e` | Manifest gains `id`, `scope`, `display_override`, `orientation`                         |
| 1123       | Auto-start torrents on drag-and-drop          | **DONE** | `328d39d` | Dropzone honours `startTorrentsOnLoad`; direct `addTorrentsByFiles` instead of modal    |
| 685        | Expose qB complete/incomplete paths           | **DONE** | `a18f3bd` | `ClientSettings.incompleteDirectory?`; qB reads `temp_path{,_enabled}`                  |
| 654        | rTorrent SCGI socket connection error unclear | **DONE** | `4767a9a` | `scgiUtil.formatConnectionError` adds volume/perms hint when socket ENOENT or refused   |

---

## Band 3 — Two-days each

Single concern, may touch one client adapter.

| Upstream # | Mirror # | Issue                                         | Status   | Notes                                                                                                        |
| ---------- | -------- | --------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| 866        | —        | Filter by location wrong                      | **DONE** | `ecfa6d0` + `f36a8de`: `isWithinDirectory()` enforces separator boundary                                     |
| 844        | —        | Filter by Location Problem                    | **DONE** | Taxonomy build splits on `/` and `\\`; empties collapse to root placeholder                                  |
| 922        | **#19**  | add-torrent 500 with rtorrent 0.9.8           | **DONE** | `Closes #19` — feature-detect `load.raw*`; fall back to temp-file + `load.{normal,start}` for older rTorrent |
| 796        | **#25**  | transmission-daemon wrong path encoded        | **OPEN** | Uri-encode path segments; reject `\` on Windows                                                              |
| 799        | **#24**  | Priority slider & sequential not working      | **OPEN** | Re-bind `change` handler; ensure GQL `setPriority` mutation's payload                                        |
| 371        | **#56**  | 2 Minor bugs with transmission                | **OPEN** | Investigate; likely two separate fixes                                                                       |
| 351        | **#57**  | Deluge 2.0.4 "Unhandled rejection: undefined" | **DONE** | `Closes #57` — `Promise.reject(e)` + close-listener guard prevents undefined rejection                       |

---

## Band 4 — Hard-fix

Multi-file but bounded; needs careful test coverage.

| Upstream # | Mirror # | Issue                                 | Status   | Notes                                                                                    |
| ---------- | -------- | ------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| 1122       | —        | Wrong ETA while seeding               | **DONE** | ETACell renders `—` when ETA is -1/0; Duration guards non-finite input                   |
| 944        | —        | Feed not working with qBittorrent     | **DONE** | Server returns `[]` for placeholder/missing feed; client skips fetchItems on placeholder |
| 342        | **#58**  | Long mount path omitted by disk usage | **OPEN** | Investigate path truncation in disk usage function                                       |
| 790        | **#26**  | Additional Settings UI                | **OPEN** | Add a settings category; mostly UI but interacts with persisted prefs                    |
| 686        | —        | Expose qBittorrent category filter    | **OPEN** | Add category list+select component, link to existing GQL                                 |
| 710        | —        | "Failed to add 1 torrent" every time  | **OPEN** | Could be SHA1 dedupe race, multipart glue or session token                               |

---

## Band 5 — Root-cause

These demand repro first, then minimal-change fix. Do not refactor here; refactor later.

| Upstream # | Mirror # | Issue                               | Status   | Minimal-change approach                                                  |
| ---------- | -------- | ----------------------------------- | -------- | ------------------------------------------------------------------------ |
| 872        | **#20**  | TypeError `containedCount`          | **OPEN** | Guard optional chain before read; add a unit test for missing `files[]`  |
| 939        | **#18**  | TypeError reading ' '               | **OPEN** | Same family as 872 — identify the common optional-chain util, apply once |
| 1047       | **#17**  | Settings not propagated to rtorrent | **OPEN** | After `settings.save`, force SCGI sync; add log line on success/fail     |

---

## Band 6 — Refactor

Surgery on the codebase; high payoff, high risk.

| Upstream #     | Mirror # | Issue                                 | Status   | Strategy                                                                   |
| -------------- | -------- | ------------------------------------- | -------- | -------------------------------------------------------------------------- |
| 814            | **#23**  | 10 GB memory leak                     | **OPEN** | Identify streaming consumer, cap buffer, ensure unsubscribe on unmount     |
| 838            | **#22**  | Support trackers edition in rtorrent  | **OPEN** | Extend rtorrent adapter with `tracker.insert/delete`; map to GQL mutations |
| 843            | **#21**  | Status of this project                | **SKIP** | Meta — informational only                                                  |
| 790 (refactor) | —        | (re-classify if implementation > 2 d) | **OPEN** | Pull prefs into their own reducer; expose hook                             |

---

## Per-issue playbook (apply in execution)

For every issue, in the order above, fill the block below before starting code:

```md
### <#N> — <title>

- Band: 1/2/3/4/5/6
- Confidence: H/M/L ← from comment clues
- Files (preview): <list>
- Repro plan:
  1. <step>
- Fix surface estimate: <LOC>
- Acceptance test: <test name>
- Rollback: tag revertable as <branch>
```

---

## Risk register

- **Anonymous rate limits** — fix by attaching a PAT to re-pull comments.
- **Squashing client adapters** — band 6 work could re-open band 3 fixes; integrate band 3 first, then validate after every band-6 commit.
- **i18n regressions** — regenerate `.po` files rather than hand-patching.

---

## Definition of done (per issue)

1. Repro script committed.
2. Fix merged on `beta` via PR linked to upstream issue.
3. `plan.md` updated: status `DONE`.
4. Commit message includes `Closes #<mirror-number>` so GitHub auto-closes the mirror issue.

(End file — plan sync'd 2026-07-01)
